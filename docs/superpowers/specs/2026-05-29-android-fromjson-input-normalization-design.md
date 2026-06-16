# Android `fromJson` 输入归一化执行规范

- 日期：2026-05-29
- 范围文件：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java`
- 范围方法：本文件中所有 `static ... fromJson(JSONObject ...)` 形态的方法
- 规则来源：`docs/three-platform-compatible-input-normalization-rules.md`
- 关联规范：`docs/superpowers/specs/2026-05-29-ios-fromjson-input-normalization-design.md`（iOS 同源任务）

## 1. 任务目标

让 `ExtSdkHelper.java` 中所有 `fromJson` 方法在把 TypeScript 传来的 JSON 还原成 native SDK object 时，对齐 native 输入语义：

```text
TypeScript 用户输入语义 == native SDK object 输入语义
```

不动 `toJson`，不动 TypeScript 侧，不动 iOS 侧，不做无关重排。

## 1.5 执行总则：健壮性优先 / 统一可选性判断

根因与 iOS 同源任务一致：用户在 RN 侧未传图片缩略图等可选字段，TypeScript 把缺失合并为 `""`，转换层无条件把 `""` 塞给 native，Android native SDK 把"设置为空字符串"与"未设置"视作不同语义，走错分支，故障产生。

由此得出本次的取向：

- 转换层是**唯一**既能识别"用户真实意图"、又不破坏 TS 公开 API 兼容的关卡。
- 不能改 TS public 属性可选性，不能改 native SDK 行为。
- 因此转换层必须**严格**按规则把 TS 的兼容默认值还原为 native 的"未设置"。

执行总则：

1. **健壮性优先，不允许"务实地跳过 has-check"**：即便 TS 那边对某字段有默认值、缺失概率为 0，转换层也必须做可选性判断。
2. **所有属性赋值统一做"key 存在 + 非兼容默认值"判断**：含 bool / number / string / list 各类型。这样做最多冗余一行无害代码，不会产生错误结果。
   - 唯一例外一：**构造器入参**——构造器签名固定、必须传一个值，按原样传入；若 native 构造器允许 `null` 且字段在 native 端可选，则做"空串 → null"归一化再传。
   - 唯一例外二：**native 必填且必须由用户提供**的字段——允许"裸读"`json.getString("...")`，缺失时抛 JSONException 是预期行为，提示上游漏传必填。
   - 例外二补充——**类型错误（type mismatch）**：当用户在 TS 端硬塞与字段类型不符的值（如 `"abc"` 当 number、`null` / `JSONObject.NULL` 当任意类型），`json.getInt(k)` / `getBoolean(k)` 等底层会抛 `JSONException`。本次方案**不在转换层用 `instanceof` 静默忽略**，直接让异常沿调用栈抛出，由上游 wrapper 捕获并通过 `ExtSdkCallback.onError(code, desc)` 把错误结构化回传 TypeScript（由 JS 端 reject）。
     - 理由 1：转换层静默忽略反而埋掉用户的真实 bug；抛错让 RN 用户立刻定位"参数类型不对"。
     - 理由 2：`fromJson` 方法签名本就 `throws JSONException`，上游 wrapper 也 `throws JSONException`，RN bridge 有标准 try/catch 路径。
     - 理由 3：与"必填字段缺失抛异常是预期"属同类约定——转换层不接管语义错误，由上游层级化处理。
     - 调用者契约：上游 wrapper 必须 catch `JSONException` 并把错误结构化回传 TS。本次任务不验证每个 wrapper 是否都做了 catch；如发现 wrapper 漏 catch，属单独议题，记入"未改动清单"。
     - iOS 同源任务对类型错误的处理路径不同，本次**不动 iOS**：`[NSString intValue]` 在非数字字符串场景天然返回 `0` 不抛、不崩；`[NSNull intValue]` / 容器类型当数字读会崩但 RN-iOS 链路上罕见。如未来需补强 `isKindOfClass:` 判断，作为独立议题处理。
3. **JSON key 沿用 TS 侧**：只允许改赋值左侧（native setter 名），不允许改 JSON key 名。
4. **禁用 `opt*(key, default)` 给 setter 喂默认值的写法**：

   要消除的反模式是——`opt*(k, default)` 在 key 缺失时悄悄返回一个默认值，然后这个默认值被**直接传给 native setter**。这等价于把"用户没传"伪装成"用户传了 TS 兼容默认值"，正是本次故障的根因。

   **具体规则**：

   - **禁止**：把 `opt*` 的返回值直接作为 setter 实参或赋值给 native 字段。
     ```java
     // 反例：opt* 返回的默认值被直接喂给 setter，违反健壮性原则
     options.setEnableTLSConnection(json.optBoolean("enableTLS", false));
     options.setCustomDeviceName(json.optString("customDeviceName"));
     options.setAreaCode(json.optInt("areaCode"));
     ```
     全部改为 `if (json.has(k)) { setter(json.get*(k)); }`，或字符串场景下用下文允许的 `optString + isEmpty` 守卫写法。

   - **允许**：把 `optString` 仅作为**判断条件**使用，**不**作为 setter 实参。这种用法不存在"伪装默认值"问题：if 条件外不可见、赋值仍走 `json.getString(k)`。
     ```java
     // 允许：optString 仅出现在 if 条件里，赋值走 getString
     if (!json.optString("remotePath").isEmpty()) { body.setRemoteUrl(json.getString("remotePath")); }

     // 允许：构造器入参做"空串 → null"归一化，optString 仅参与归一化中间步骤
     String displayName = json.optString("displayName").isEmpty() ? null : json.getString("displayName");
     ```

   - **数组 / 字典不简化为 `opt*` 形态**：保持 `json.has(k) && json.getJSONArray(k).length() > 0` 与 `json.has(k) && json.get(k) != JSONObject.NULL` 写法，便于一眼识别 key 存在性判断。

   - **`optBoolean` / `optInt` / `optLong` / `optDouble` 一律禁用**（不论是否传 default、不论是否出现在 if 条件里）。这些类型用 `if (json.has(k))` 守卫即可表达"未设置"语义；引入 `opt*` 只会模糊"未设置 vs 默认值"边界。

## 2. 修改模式

### 2.1 构造器入参（`new XXX(...)`）

构造器形参对应 TypeScript 侧的必填属性，按原样直接传入。

- TS 必填 → Java 必填读取：直接 `json.getString("k")`、`json.getInt("k")` 等，缺失抛 JSONException 是预期。
- 当 native 构造器允许 `null` 且字段在 native 端是可选的（例如 `EMLocationMessageBody` 的 `address` / `buildingName`），用以下推荐范式做"空串 → null"归一化：

```java
String displayName = json.optString("displayName").isEmpty() ? null : json.getString("displayName");
if (!json.optString("remotePath").isEmpty()) { body.setRemoteUrl(json.getString("remotePath")); }
```

> 注：`optString` 仅在 if 条件或构造器入参归一化场景允许；`optBoolean` / `optInt` / `optLong` / `optDouble` 一律禁用。详见 §1.5 第 4 条。

### 2.2 native 属性的赋值（setter）

按 §1.5 执行总则，**所有 setter 赋值统一做"key 存在 + 非兼容默认值"判断**。

兼容默认值的判定按字段语义：

| native 字段类型 | TypeScript 兼容默认值 | 判定写法 |
| --- | --- | --- |
| 可选 string | `""` | `!json.optString(k).isEmpty()`（optString 仅作判断条件，赋值走 `json.getString(k)`） |
| 可选 number | `0` / `-1` 等 | 只判 key 存在：`json.has(k)` |
| 可选 boolean | `false` | 只判 key 存在：`json.has(k)`，不能因 falsy 过滤 |
| 可选 list | `[]` | `json.has(k) && json.getJSONArray(k).length() > 0` |
| 可选 dict | `null` / `JSONObject.NULL` | `json.has(k) && json.get(k) != JSONObject.NULL` |

### 2.3 代码形态

尽量保持"原本占一行的赋值，改完仍占一行"，便于 diff 审阅。Java 行可能比 iOS 长，但形态与 iOS 严格对仗：

- 可选 string，一行 `if`：

  ```java
  if (!json.optString("remotePath").isEmpty()) { body.setRemoteUrl(json.getString("remotePath")); }
  ```

- 可选 number / boolean / 枚举，一行 `if`：

  ```java
  if (json.has("fileSize")) { body.setFileLength(json.getLong("fileSize")); }
  if (json.has("autoLogin")) { options.setAutoLogin(json.getBoolean("autoLogin")); }
  ```

- 可选 list，一行 `if`：

  ```java
  if (json.has("targetLanguageCodes") && json.getJSONArray("targetLanguageCodes").length() > 0) { ... }
  ```

- 嵌套 dict（如 `pushConfig`），分块解析时外层 + 内层各自 has-check：

  ```java
  if (json.has("pushConfig")) {
      JSONObject pushConfig = json.getJSONObject("pushConfig");
      if (pushConfig.has("...") && ...) { ... }
  }
  ```

### 2.4 JSON key 必须以 TypeScript 侧为准

native setter 名与 TypeScript JSON key 不一致时，**只允许改 setter 名（赋值左侧），不允许改 JSON key**。

示例：TS 用 `fileSize`，native setter 是 `setFileLength`：

```java
// 正确：JSON key 沿用 TS 的 fileSize
if (json.has("fileSize")) { body.setFileLength(json.getLong("fileSize")); }
```

不允许把 `json.has("fileSize")` 改成 `json.has("fileLength")`。

## 3. 标准范本

### 3.1 消息体范本（与 iOS `EMFileMessageBody` 对仗）

以 `ExtSdkMessageBodyHelper.fileBodyFromJson` 为范本：

```java
static EMFileMessageBody fileBodyFromJson(JSONObject json) throws JSONException {
    String localPath = json.getString("localPath");
    EMNormalFileMessageBody body = new EMNormalFileMessageBody(Uri.parse(localPath));
    if (!json.optString("displayName").isEmpty()) { body.setFileName(json.getString("displayName")); }
    if (!json.optString("remotePath").isEmpty()) { body.setRemoteUrl(json.getString("remotePath")); }
    if (!json.optString("secret").isEmpty()) { body.setSecret(json.getString("secret")); }
    if (json.has("fileStatus")) { body.setDownloadStatus(InternalConvertHelper.downloadStatusFromInt(json.getInt("fileStatus"))); }
    if (json.has("fileSize")) { body.setFileLength(json.getInt("fileSize")); }
    return body;
}
```

说明：

- `localPath` 是 TS 必填、Java 构造器入参 → 裸读 `json.getString`，缺失抛异常符合预期。
- 其它 string 字段统一 `!json.optString(k).isEmpty()` 守卫，赋值仍走 `json.getString(k)`（见 §1.5 第 4 条）。
- number / enum 字段统一 `if (json.has(k))` 守卫。
- `fileStatus` 字段原代码裸读，本次按规则补 has-check（属"原有 bug 与本次改动直接冲突"，§6.3 例外修复）。

### 3.2 普通 options 对象范本（与 iOS `EMGroupOptions` 对仗）

以 `ExtSdkGroupOptionsHelper.fromJson` 为范本：

```java
static EMGroupOptions fromJson(JSONObject json) throws JSONException {
    // 注：实际 setter 名需以 EMGroupOptions API 为准，此处展示规则形态
    EMGroupOptions options = new EMGroupOptions();
    if (json.has("maxCount")) { options.setMaxUsers(json.getInt("maxCount")); }
    if (!json.optString("ext").isEmpty()) { options.setExt(json.getString("ext")); }
    if (json.has("inviteNeedConfirm")) { options.setInviteNeedConfirm(json.getBoolean("inviteNeedConfirm")); }
    if (json.has("style")) { options.setStyle(InternalConvertHelper.groupStyleFromInt(json.getInt("style"))); }
    return options;
}
```

说明：

- bool 字段也必须 `if (json.has("..."))`，不能因为 `false` 是默认值就无条件 `getBoolean`。
- number / enum 字段也必须 `if (json.has("..."))`，不能让缺失值变成 `0`。
- string 字段统一 `!json.optString(k).isEmpty()` 守卫，赋值仍走 `json.getString(k)`；除非字段明确支持"设置为空字符串"作为业务语义。
- 当前实现使用的 setter 名（如 `setMaxUsers` / `setExt` / `setStyle`）以 HyphenateChat Android SDK 实际 API 为准。

### 3.3 嵌套 dict 范本：`EMOptions.pushConfig`

`pushConfig` 是嵌套 JSONObject，含 `manufacturer` / `deviceId` 两个关键子字段。

TS 侧约定（见 `src/common/ChatPushConfig.ts`）：

- `manufacturer` 由 TS 在 Android 平台自动注入 `Platform.constants.Manufacturer.toLowerCase()`，iOS 不注入。
- `deviceId` / `deviceToken` 由用户构造时传入，均为可选。

Java 侧处理：

```java
if (json.has("pushConfig")) {
    JSONObject pushConfig = json.getJSONObject("pushConfig");
    if (!pushConfig.optString("manufacturer").isEmpty()
        && !pushConfig.optString("deviceId").isEmpty()) {
        EMPushConfig.Builder builder = new EMPushConfig.Builder(context);
        String manufacturer = pushConfig.getString("manufacturer");
        String deviceId = pushConfig.getString("deviceId");
        if (manufacturer.equalsIgnoreCase("google")) { builder.enableFCM(deviceId); }
        else if (manufacturer.equalsIgnoreCase("huawei")) { builder.enableHWPush(); }
        else if (manufacturer.equalsIgnoreCase("meizu")) { builder.enableFCM(deviceId); }
        else if (manufacturer.equalsIgnoreCase("xiaomi")) { builder.enableFCM(deviceId); }
        else if (manufacturer.equalsIgnoreCase("oppo")) { builder.enableOppoPush(deviceId, ""); }
        else if (manufacturer.equalsIgnoreCase("vivo")) { builder.enableFCM(deviceId); }
        else { builder.enableFCM(deviceId); }
        options.setPushConfig(builder.build());
    }
}
```

说明：

- **manufacturer 缺失或为空 → 整段跳过**，不构造 PushConfig。与 iOS 不消费 manufacturer 的行为对齐。
- **deviceId 缺失或为空 → 整段跳过**，不构造 PushConfig。即便 manufacturer 是 `huawei`（实际上不需要 deviceId）也跟着跳过——规则统一优先于个别 native 分支差异；huawei-only 场景如有需要，记入"未改动清单"待后续单独处理。

## 4. 适用方法范围

本次对 `ExtSdkHelper.java` 中所有 `fromJson` 方法统一改造，已知至少包括（实际以文件为准）：

- `ExtSdkOptionsHelper.fromJson` (EMOptions)
- `ExtSdkGroupOptionsHelper.fromJson` (EMGroupOptions)
- `ExtSdkMessageHelper.fromJson` (EMMessage)
- `ExtSdkMessageBodyHelper.textBodyFromJson` (EMTextMessageBody)
- `ExtSdkMessageBodyHelper.fileBodyFromJson` / `imageBodyFromJson` / `videoBodyFromJson` / `voiceBodyFromJson` / `localBodyFromJson` / `cmdBodyFromJson` / `customBodyFromJson` / `combineBodyFromJson`
- `ExtSdkUserInfoHelper.fromJson` (EMUserInfo)
- `ExtSdkSilentModeParamHelper.fromJson` (EMSilentModeParam)
- `ExtSdkSilentModeTimeHelper.fromJson` (EMSilentModeTime)
- `ExtSdkFetchMessageOptionHelper.fromJson` (EMFetchMessageOption)
- `ExtSdkConversationFilterHelper.fromJson` (EMConversationFilter)

**执行方式：直接按 §1.5 总则与 §3 范本统一套用，不逐字段核实 native 是否可选。**

理由：

- 不论 native 字段是必填还是可选，统一加 has-check 都不会产生错误结果。
- 逐字段核实会消耗大量时间，且依赖 HyphenateChat Android SDK 头文件查找。
- 真正不能套用的极少数情况（构造器入参、必须由用户提供的必填字段），按 §1.5 例外处理。

## 5. 不在规则之内的情况——只记录、不修改

执行过程中遇到不符合上述模式的情况，**不修改、不展开核实**，只记录待后续单独决策：

1. **跨端 JSON key 不一致**：本次不改 key 名，记录。
2. **方法整体行为存疑**（例如 `return null`、未实现、特殊兼容逻辑）—— 不改，记录。
3. **不在 `fromJson` 系列内的方法**——不属于本次范围。
4. **§1.5 的两类例外字段**（构造器入参 / native 必填且必须由用户提供）—— 记录、单独豁免。
5. **个别 native 分支与规则统一冲突**（例如 huawei 推送不需要 deviceId 但本次按统一规则跳过）—— 记录待后续单独处理。

记录格式（示例）：

```text
- 方法：ExtSdkOptionsHelper.fromJson
  字段：pushConfig.manufacturer=huawei 且 deviceId 缺失
  原因：huawei 推送 native 端不需要 deviceId，但本次按统一规则跳过整段
  处理：保留不动；如需 huawei-only 场景，单独审查
```

## 6. 验收口径

本次没有自动化测试覆盖 `fromJson`，验收以 **diff review** 为主，编译为辅。每个方法的改动必须逐项核对下列 checklist：

### 6.1 改动方法的 review checklist

对每一个被修改的 `fromJson`，逐字段对照修改前后核对：

1. **JSON key 是否一致**
   - 修改前后 `json.has("...")` / `json.getX("...")` 中的 key **必须完全相同**。
   - 跨端 key 不一致属 §5 类别，本次不改。

2. **has-check 写法是否正确**
   - string 字段：`!json.optString(k).isEmpty()`；赋值仍走 `json.getString(k)`。
   - list 字段：`json.has(k) && json.getJSONArray(k).length() > 0`。
   - dict 字段：`json.has(k) && json.get(k) != JSONObject.NULL`。
   - number / bool / enum 字段：`json.has(k)`。
   - 禁用 `opt*` 给 setter 喂默认值的写法（见 §1.5 第 4 条）；`optString` 仅在 if 条件或构造器入参归一化中使用。
   - 除 §1.5 例外，所有 setter 赋值必须做 has-check。

3. **类型转换是否正确**
   - 与修改前一致：`getString` / `getInt` / `getLong` / `getBoolean` / `getDouble` / `getJSONArray` / `getJSONObject` 等保持原样。
   - 自定义转换函数（如 `InternalConvertHelper.downloadStatusFromInt(...)`）保持原样。

4. **左值（native setter 名）是否正确**
   - 修改前后 setter 名应一致（例如 `body.setFileName(...)` / `options.setMaxUsers(...)`）。
   - 不允许重命名 native setter。

5. **代码形态是否符合 §2.3**
   - 原本占一行的赋值，改完仍占一行（Java 行可能比 iOS 长，可接受）。
   - 单行 `if` 形态：`if (cond) { stmt; }`。
   - 不做大段重排、不调整字段顺序。

### 6.2 改动范围

1. `ExtSdkHelper.java` 中所有 `fromJson` 方法已按 §3 范本统一改造，未逐字段核实 native 可选性。
2. 未改动 `toJson`、未改动 TypeScript 与 iOS 侧。
3. 构造器入参未被改成可选（除明确允许 null 的字段做空串 → null 归一化以外）。
4. `opt*` 使用合规（见 §1.5 第 4 条）：未出现"opt\* 返回值直接喂给 setter"；`optString` 仅在 if 条件或构造器入参归一化里出现；`optBoolean` / `optInt` / `optLong` / `optDouble` 已全部清除。

### 6.3 原有 bug 处理原则

review 过程中可能发现原本就存在的 bug，例如：

- `!= ""` 引用比较（永远为 true）
- `setDownloadStatus(json.getInt(...))` / `getInt("duration")` 等裸读
- `optBoolean(k, false)` 用默认值伪装"未设置"
- `if (has) ... else setX(false)` 显式塞默认值的 else 分支
- 字段被读两次（如 `EMVideoMessageBody` 的 `fileSize` 同时调用 `setFileLength` 和 `setVideoFileLength`）

处理原则：

- **默认只记录、不修复**：写进"未改动但记录在案"清单（见 §6.4），下一轮单独处理，避免本次 PR 失焦。
- **例外，必须顺手修**：当某 bug 与本次改动**直接冲突**——例如改这一行才发现 key 是错的、或本次新增 has-check 无法建立在裸读之上时——必须修，并在 commit message / PR 描述里单独说明"附带修复 X，原因是 Y"。
- 本次明确的顺手修复：
  - `json.get(k) != ""` 引用比较 → 改为 `!json.optString(k).isEmpty()` 守卫形态
  - `setDownloadStatus` 等裸读 `getInt` → 补 has-check
  - `EMImageMessageBody.setGif` 的 else 分支显式塞 `false` → 删除 else
  - 所有"opt\* 返回值直接喂给 setter"的写法清除；`optBoolean` / `optInt` / `optLong` / `optDouble` 改为 `if (has) { get* }` 形态；字符串场景保留 `optString` 在 if 条件或构造器入参归一化中使用

### 6.4 交付物

1. 一份"未改动但记录在案"清单（§5 类别 + §6.3 默认记录的原有 bug），合并提交时一并附上。
2. 一份"顺手修复"清单（§6.3 例外修复），在 commit message / PR 描述中单独说明。
3. Android 端编译通过（`yarn example android` 或等价构建命令）。
