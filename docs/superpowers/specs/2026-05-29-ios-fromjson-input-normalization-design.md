# iOS `fromJsonObject` 输入归一化执行规范

- 日期：2026-05-29
- 范围文件：`modules/objc/dispatch/ExtSdkToJson.m`
- 范围方法：本文件中所有 `+ (XXX *)fromJsonObject:(NSDictionary *)aJson` 形态的方法
- 规则来源：`docs/three-platform-compatible-input-normalization-rules.md`
- 审计依据：`docs/three-platform-compatible-input-normalization-audit.md`

## 1. 任务目标

本次执行只做一件事：

> 让 `ExtSdkToJson.m` 中 `fromJsonObject` 方法在把 TypeScript 传来的 JSON 还原成 native SDK object 时，对齐 native 输入语义。

核心规则只有一条：

```text
TypeScript 用户输入语义 == native SDK object 输入语义
```

不动 `toJsonObject`，不动 TypeScript 侧，不动 Java 侧，不做无关重排。

## 1.5 执行总则：健壮性优先 / 统一可选性判断

本次改造的根因是真实用户故障：

> 用户在 RN 侧未传图片缩略图本地路径；TypeScript 为维护历史公开 API 的"必填"语义，把缺失合并为 `""`；转换层无条件把 `""` 塞给 native；Android native SDK 把"设置为空字符串"与"未设置"视作不同语义，走错分支，故障产生。

由此得出本次的取向：

- 转换层是**唯一**既能识别"用户真实意图"、又不破坏 TS 公开 API 兼容的关卡。
- 不能改 TS public 属性可选性（会破坏用户代码的 API 兼容）。
- 不能改 native SDK 行为（不归本仓库管，也不该改）。
- 因此转换层必须**严格**按规则把 TS 的兼容默认值还原为 native 的"未设置"。

执行总则：

1. **健壮性优先，不允许"务实地跳过 has-check"**：即便 TS 那边对某字段有默认值、缺失概率为 0，转换层也必须做可选性判断。把 TS 的兼容默认值伪装成用户输入正是问题的本质，转换层不能再放过一次。
2. **所有属性赋值统一做"key 存在 + 非兼容默认值"判断**：含 bool / number / string / list 各类型。这样做最多冗余一行无害代码，不会产生错误结果。
   - 唯一例外一：**构造器入参**——构造器签名固定、必须传一个值，按原样传入；若 native 构造器允许 nil 且字段在 native 端可选，则做"空串 → nil"归一化再传。
   - 唯一例外二：**native 必填且 init 默认值不是 `""` / `0` / `NO`** 的极少数字段（例如默认 `YES` 的 bool）——遇到时**记录、单独豁免**，不要统一应用规则。
3. **JSON key 沿用 TS 侧**：只允许改赋值左侧（native 属性名），不允许改 JSON key 名。跨端 key 名不一致的情况不在本次范围，记录在案。

## 2. 修改模式

### 2.1 构造器入参（`init...:` / `initWith...:`）

构造器形参对应 TypeScript 侧的必填属性，按原样直接传入。

- 即便 TypeScript 那边会把缺失值合并为 `''`，构造器入参也保持原样传入。
- 唯一例外：当 native 构造器允许 `nil`，且字段在 native 端是可选的（例如 `displayName`），可以在入参前做一次"空字符串 → nil"的归一化，再传入构造器：

```objc
NSString *displayName = aJson[@"displayName"];
displayName = (displayName && displayName.length > 0) ? displayName : nil;
EMFileMessageBody *ret = [[EMFileMessageBody alloc] initWithLocalPath:[LocalFileHandler reset:path]
                                                          displayName:displayName];
```

### 2.2 native 属性的赋值

历史上 TypeScript 必填、但 native 实际可选的字段，赋值时必须做双重判断：

1. key 在 JSON 中存在
2. value 不是 TypeScript 兼容默认值（按字段语义判断）

满足两者才赋值；否则跳过，使 native 保持"未设置"语义。

按 §1.5 执行总则，**所有属性赋值统一应用上述判断**（含 number/bool/string/list），不再按"看似不会缺失"放过。例外见 §1.5。

兼容默认值的判定按字段语义：

| native 字段类型 | TypeScript 兼容默认值 | 判定写法（示意） |
| --- | --- | --- |
| 可选 string | `""` | `aJson[@"key"] && [aJson[@"key"] length] > 0` |
| 可选 number | `0` / `-1` 等 | 只判 key 存在：`if (aJson[@"key"])` |
| 可选 boolean | `false` | 只判 key 存在：`if (aJson[@"key"])`，不能因 falsy 过滤 |
| 可选 list | `[]` | `aJson[@"key"] && [aJson[@"key"] count] > 0` |

### 2.3 代码形态

尽量保持"原本占一行的赋值，改完仍占一行"，便于 diff 审阅。三元表达式的判断条件**统一加外层括号**，避免视觉歧义：

- 可选 string，三元一行（无 else）：

  ```objc
  (aJson[@"remotePath"] && [aJson[@"remotePath"] length] > 0) ? (ret.remotePath = aJson[@"remotePath"]) : nil;
  ```

- 可选 string，需要显式回退到 `@""` 时（三元一行带 else）：

  ```objc
  (aJson[@"secret"] && [aJson[@"secret"] length] > 0) ? (ret.secretKey = aJson[@"secret"]) : (ret.secretKey = @"");
  ```

- 可选 number / boolean / 枚举（一行 `if`）：

  ```objc
  if (aJson[@"fileSize"]) { ret.fileLength = [aJson[@"fileSize"] longLongValue]; }
  if (aJson[@"fileStatus"]) { ret.downloadStatus = [ExtSdkConvertHelper downloadStatusFromInt:[aJson[@"fileStatus"] intValue]]; }
  ```

### 2.4 JSON key 必须以 TypeScript 侧为准

native 属性名与 TypeScript JSON key 不一致时，**只允许改赋值左侧，不允许改 JSON key**。

示例：TS 用 `fileSize`，native 属性是 `fileLength`：

```objc
// 正确：JSON key 沿用 TS 的 fileSize
if (aJson[@"fileSize"]) { ret.fileLength = [aJson[@"fileSize"] longLongValue]; }
```

不允许把 `aJson[@"fileSize"]` 改成 `aJson[@"fileLength"]`。

## 3. 标准范本

### 3.1 消息体 string / number 字段范本

以 `EMFileMessageBody (Json) fromJsonObject:` 为消息体字段的标准范本：

```objc
+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    NSString *path = aJson[@"localPath"];
    NSString *displayName = aJson[@"displayName"];
    displayName = (displayName && displayName.length > 0) ? displayName : nil;
    EMFileMessageBody *ret = [[EMFileMessageBody alloc] initWithLocalPath:[LocalFileHandler reset:path]
                                                              displayName:displayName];
    (aJson[@"secret"] && [aJson[@"secret"] length] > 0) ? (ret.secretKey = aJson[@"secret"]) : (ret.secretKey = @"");
    (aJson[@"remotePath"] && [aJson[@"remotePath"] length] > 0) ? (ret.remotePath = aJson[@"remotePath"]) : nil;
    if (aJson[@"fileSize"]) { ret.fileLength = [aJson[@"fileSize"] longLongValue]; }
    if (aJson[@"fileStatus"]) { ret.downloadStatus = [ExtSdkConvertHelper downloadStatusFromInt:[aJson[@"fileStatus"] intValue]]; }
    return ret;
}
```

### 3.2 普通 options 对象范本

以 `EMGroupOptions (Json) fromJsonObject:` 为普通 options 对象的标准范本。

TypeScript 侧 `ChatGroupOptions` 的 public 属性虽然多为必填，但 constructor 输入是可选的，并会落兼容默认值：

- `style?: number` → 默认 `PublicJoinNeedApproval`
- `maxCount?: number` → 默认 `200`
- `inviteNeedConfirm?: boolean` → 默认 `false`
- `ext?: string` → 没有默认值，未传时为 `undefined`
- `isDisabled?: boolean` → 默认 `false`，但当前 iOS `fromJsonObject` 未消费该字段

native `EMGroupOptions` 是 `init` 后逐个属性赋值，所有属性都应按"key 存在 + 非兼容默认值"判断后再设置。`ext` 使用方案 A：`""` 视为未设置。

```objc
+ (EMGroupOptions *)fromJsonObject:(NSDictionary *)dict {
    EMGroupOptions *options = [[EMGroupOptions alloc] init];
    if (dict[@"maxCount"]) { options.maxUsers = [dict[@"maxCount"] intValue]; }
    (dict[@"ext"] && [dict[@"ext"] length] > 0) ? (options.ext = dict[@"ext"]) : nil;
    if (dict[@"inviteNeedConfirm"]) { options.IsInviteNeedConfirm = [dict[@"inviteNeedConfirm"] boolValue]; }
    if (dict[@"style"]) { options.style = [ExtSdkConvertHelper groupStyleFromInt:[dict[@"style"] intValue]]; }
    return options;
}
```

说明：

- bool 字段也必须 `if (dict[@"..."])`，不能因为 `false` 是默认值就无条件 `[... boolValue]`。
- number / enum 字段也必须 `if (dict[@"..."])`，不能让缺失值变成 `0`。
- string 字段统一过滤空字符串；除非字段明确支持"设置为空字符串"作为业务语义，否则 `""` 表示 TS 兼容默认值，应还原为 native 未设置。
- 当前 iOS 未消费 `isDisabled`，本次不新增字段消费；如需处理，单独记录并确认 native 是否支持。

所有其它 `fromJsonObject` 方法按上述两个范本改造。

## 4. 适用方法范围

本次需对 `ExtSdkToJson.m` 中所有 `+ (...) fromJsonObject:` 方法进行统一改造，已知至少包括（实际以文件为准）：

- `EMGroupOptions`
- `EMChatMessage`
- `EMMessageBody`（分发器，本身不赋值）
- `EMTextMessageBody`
- `EMLocationMessageBody`
- `EMCmdMessageBody`
- `EMCustomMessageBody`
- `EMCombineMessageBody`
- `EMFileMessageBody`（已作为范本）
- `EMImageMessageBody`
- `EMVideoMessageBody`
- `EMVoiceMessageBody`
- `EMOptions`
- `EMUserInfo`
- `EMSilentModeParam`
- `EMSilentModeTime`
- `EMFetchServerMessagesOption`
- `EMContact`
- `EMConversationFilter`
- `EMMessagePinInfo`

**执行方式：直接按 §1.5 总则与 §3 范本统一套用，不逐字段核实 native 是否可选。**

理由：

- 不论 native 字段是必填还是可选，统一加 has-check 都不会产生错误结果（见 §1.5 第 2 条的推导）。
- 逐字段核实会消耗大量时间，且依赖 HyphenateChat 头文件 / 字段文档查找。
- 真正不能套用的极少数情况（构造器入参、native 必填且默认值非 `""` / `0` / `NO`），按 §1.5 例外处理；遇到时直接记录、单独豁免，不展开核实。

## 5. 不在规则之内的情况——只记录、不修改

执行过程中遇到不符合上述模式的情况，**不修改、不展开核实**，只记录待后续单独决策。

需要记录的典型类别：

1. **TS 侧与 native 侧 JSON key 名不一致**（例如审计 6.1 的 `dnsUrl` vs `dnsURL`、6.2 的 `debugModel`、6.3 的 `uikitVersion`、6.4 的 `dohVendor` 等）—— 本次不改 key 名。
2. **方法整体行为存疑**（例如某 `fromJsonObject` 返回 `nil`，或带有特殊兼容逻辑、特殊解码分支）—— 不改。
3. **不在 `fromJsonObject` 系列内的方法**（例如 `+ getCursor:` / `+ pageSize:` 等辅助静态方法）—— 不属于本次范围。
4. **§1.5 的两类例外字段**（构造器入参、native 必填且 init 默认值非 `""` / `0` / `NO`）—— 遇到时记录、单独豁免。

记录格式（示例）：

```text
- 方法：EMOptions fromJsonObject
  字段：dnsURL
  原因：TS 用 dnsUrl，本方法读 dnsURL，跨端 key 不一致，超出本次范围
  处理：保留不动
```

最终在改动提交时一并附上"未改动清单"。

## 6. 验收口径

本次没有自动化测试覆盖 `fromJsonObject`，验收以 **diff review** 为主，编译为辅。每个方法的改动必须逐项核对下列 checklist：

### 6.1 改动方法的 review checklist

对每一个被修改的 `fromJsonObject`，逐字段对照修改前后核对：

1. **JSON key 是否一致**
   - 修改前后 `aJson[@"..."]` 中的 key **必须完全相同**。
   - 不允许把 key 改成别的名字（哪怕"更像 native 属性名"）。
   - 跨端 key 不一致（例如 `dnsUrl` vs `dnsURL`）属 §5 类别，本次不改。

2. **has-check 写法是否正确**
   - string / list 字段：使用 `aJson[@"key"] && [aJson[@"key"] length] > 0`（list 用 `count`）。
   - number / bool / enum 字段：使用 `if (aJson[@"key"]) { ... }`。
   - 不能用通用 falsy（例如对 bool 用 `aJson[@"key"]` 之后又 `if (... boolValue)` 的二重过滤）。
   - 不能漏判断；除 §1.5 例外（构造器入参 / native 必填且 init 默认值非 `""`/`0`/`NO`），所有属性赋值必须做 has-check。

3. **类型转换是否正确**
   - 与修改前一致：`intValue`、`longLongValue`、`boolValue`、`floatValue` 等保持原样。
   - 自定义转换函数（如 `[ExtSdkConvertHelper downloadStatusFromInt:...]`）保持原样。
   - 不允许"顺手"改类型转换，除非属于 §6.3"原有 bug"且与本次改动直接冲突。

4. **左值（native 属性名）是否正确**
   - 修改前后赋值左侧的 native 属性名应一致（例如 `ret.fileLength`、`options.IsInviteNeedConfirm` 等照原样）。
   - 不允许重命名 native 属性。

5. **代码形态是否符合 §2.3**
   - 原本占一行的赋值，改完仍占一行。
   - 选用 §2.3 给的三种形态之一：三元无 else / 三元带 else / 一行 `if`。
   - 不做大段重排、不调整字段顺序。

### 6.2 改动范围

1. `ExtSdkToJson.m` 中所有 `fromJsonObject` 方法已按 §3 范本统一改造，未逐字段核实 native 可选性。
2. 未改动 `toJsonObject`、未改动 TypeScript 与 Java 侧。
3. 构造器参数未被改成可选（除明确允许 nil 的字段做空串 → nil 归一化以外）。

### 6.3 原有 bug 处理原则

review 过程中可能发现原本就存在的 bug（不属于本次"统一加 has-check"目标），例如：

- JSON key 拼写错误或与 TS 侧拼写不一致
- native 属性名拼写错误或赋错了属性
- 类型转换不匹配（例如把字符串当数字读）

处理原则：

- **默认只记录、不修复**：写进"未改动但记录在案"清单（见 §5、§6.4），下一轮单独处理，避免本次 PR 失焦。
- **例外，必须顺手修**：当某 bug 与本次改动**直接冲突**——例如改这一行才发现 key 是错的，若不修，本次新增的 has-check 就建立在错 key 之上、永远命中 nil 分支。此时必须修，并在 commit message / PR 描述里单独说明"附带修复 X，原因是 Y"。

### 6.4 交付物

1. 一份"未改动但记录在案"清单（§5 类别 + §6.3 默认记录的原有 bug），合并提交时一并附上。
2. 一份"顺手修复"清单（§6.3 例外修复），在 commit message / PR 描述中单独说明。
3. iOS 端编译通过（`yarn example ios` 或等价构建命令）。


