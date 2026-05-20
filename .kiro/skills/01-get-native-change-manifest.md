# Skill 1: Get Native Change Manifest

获取 HyphenateChat Native SDK（iOS + Android）在两个 Git Tag 之间的公开 API 变更，生成结构化的 Change Manifest JSON，供后续 Skill 使用。

---

## Trigger Conditions

当满足以下任一条件时触发本 Skill：

- 用户明确要求"获取 Native 变更清单"或"生成 Change Manifest"
- 用户提供了 iOS 和 Android 的新旧 Tag 对，并要求分析 Native SDK 变更
- 作为 SDK 升级流水线的第一步被调用

---

## Input Parameters

| 参数名 | 格式 | 示例 | 说明 |
|--------|------|------|------|
| `ios_old_tag` | `x.y.z` | `4.16.0` | iOS Native SDK 旧版本 Tag |
| `ios_new_tag` | `x.y.z` | `4.17.0` | iOS Native SDK 新版本 Tag |
| `android_old_tag` | `SDK_x.y.z[.w]` | `SDK_4.16.2` | Android Native SDK 旧版本 Tag |
| `android_new_tag` | `SDK_x.y.z[.w]` | `SDK_4.17.0` | Android Native SDK 新版本 Tag |

---

## Execution Steps

### Step 1: Validate Tag Formats

使用 `__utils__/tag-validator.ts` 中的验证逻辑：

- **iOS Tag 验证**：必须匹配正则 `/^\d+\.\d+\.\d+$/`
  - 调用 `validateIosTag(ios_old_tag)` 和 `validateIosTag(ios_new_tag)`
- **Android Tag 验证**：必须匹配正则 `/^SDK_\d+\.\d+\.\d+(\.\d+)*$/`
  - 调用 `validateAndroidTag(android_old_tag)` 和 `validateAndroidTag(android_new_tag)`

**失败处理：**
- 如果任一 Tag 格式不合法，报告错误并显示期望格式和实际输入值
- 终止执行，不继续后续步骤

### Step 2: Git Diff iOS Repo

在 iOS Native SDK 仓库中执行 diff：

```bash
cd /Users/asterisk/Codes/easemob/emclient-ios
git diff <ios_old_tag>..<ios_new_tag> --name-only
```

**错误处理：**
- 如果仓库路径不存在，报告路径错误并终止
- 如果 Tag 在仓库中不存在，执行 `git tag -l '*<version>*'` 列出可用 Tag 供用户选择
- 如果工作区有未提交变更，警告用户建议先 stash 或 commit

### Step 3: Filter iOS Files

使用 `__utils__/filter.ts` 中的 `filterIosPath()` 函数逻辑过滤文件列表：

**包含规则：**
- 路径以 `newSDK/HyphenateSDK/` 开头
- 文件扩展名为 `.h`

**排除规则：**
- 文件名以 `+Private.h` 结尾
- 文件名以 `+Category.h` 结尾

**过滤逻辑（等价代码）：**
```typescript
path.startsWith("newSDK/HyphenateSDK/")
  && path.endsWith(".h")
  && !path.endsWith("+Private.h")
  && !path.endsWith("+Category.h")
```

### Step 4: Parse iOS Diffs

对每个通过过滤的 iOS 文件，获取详细 diff：

```bash
git diff <ios_old_tag>..<ios_new_tag> -- <file_path>
```

从 diff 内容中提取：
- **新增方法声明**：`+` 开头的行，匹配 Objective-C 方法签名（`-` 或 `+` 前缀 + 返回类型 + 方法名 + 参数）
- **删除方法声明**：`-` 开头的行，匹配方法签名
- **修改的方法签名**：参数类型或数量变化
- **@deprecated 标记**：新增的 deprecated 注释或属性
- **新增 delegate/protocol 方法**：在 `@protocol` 块中新增的方法

### Step 5: Git Diff Android Repo

在 Android Native SDK 仓库中执行 diff：

```bash
cd /Users/asterisk/Codes/easemob/emclient-android
git diff <android_old_tag>..<android_new_tag> --name-only
```

**错误处理**：同 Step 2。

### Step 6: Filter Android Files

使用 `__utils__/filter.ts` 中的 `filterAndroidPath()` 函数逻辑过滤文件列表：

**包含规则：**
- 路径以 `hyphenatechatsdk/src/com/hyphenate/chat/` 开头
- 文件名匹配 `EM[^A]*.java`（以 `EM` 开头，第三个字符不是 `A`，以 `.java` 结尾）

**排除规则：**
- 路径包含 `/adapter/` 子目录
- 路径包含 `/core/` 子目录
- 文件名在内部类排除列表中：
  - `EMSmartHeartBeat.java`
  - `EMHeartBeatReceiver.java`
  - `EMMonitorReceiver.java`
  - `EMJobService.java`
  - `EMChatService.java`
  - `EMEncryptProvider.java`
  - `EMEncryptUtils.java`
  - `EMCollector.java`
  - `EMBase.java`

**过滤逻辑（等价代码）：**
```typescript
path.startsWith("hyphenatechatsdk/src/com/hyphenate/chat/")
  && /^EM[^A].*\.java$/.test(basename(path))
  && !path.includes("/adapter/")
  && !path.includes("/core/")
  && !INTERNAL_CLASSES.includes(basename(path))
```

### Step 7: Parse Android Diffs

对每个通过过滤的 Android 文件，获取详细 diff：

```bash
git diff <android_old_tag>..<android_new_tag> -- <file_path>
```

从 diff 内容中提取：
- **新增 public 方法**：`+` 开头的行，匹配 `public` 方法声明
- **删除 public 方法**：`-` 开头的行，匹配 `public` 方法声明
- **修改的方法签名**：参数类型或数量变化
- **@Deprecated 注解**：新增的 `@Deprecated` 注解
- **新增 listener/callback 接口方法**：在 listener 接口中新增的方法

### Step 8: Align Changes

将 iOS 和 Android 的变更按 API 语义名称进行匹配对齐：

1. 为每个变更生成语义 ID（格式：`{domain}_{methodName}`，如 `chatmanager_sendMessage`）
2. 将 iOS 变更和 Android 变更按 ID 进行匹配
3. 对齐的变更（两端都有对应）→ 合并为一个 `ChangeItem`，填充 `ios` 和 `android` 两个 `PlatformChange` 字段
4. 不对齐的变更（仅一端有）→ 标记为 misalignment

### Step 9: Detect Misalignments

使用 `__utils__/manifest.ts` 中的 `detectMisalignments()` 函数逻辑：

- 找出仅存在于 iOS 的变更（`ios_only`）
- 找出仅存在于 Android 的变更（`android_only`）
- 如果存在不对齐项，触发 **人工介入点**（见下方）

### Step 10: Generate Change Manifest JSON

将所有解析和对齐结果组装为 Change Manifest JSON，结构如下方 Output 节所述。

---

## Output

### Change Manifest JSON Schema

```typescript
interface ChangeManifest {
  metadata: {
    generated_at: string;          // ISO 8601 timestamp
    ios_old_tag: string;           // e.g. "4.16.0"
    ios_new_tag: string;           // e.g. "4.17.0"
    android_old_tag: string;       // e.g. "SDK_4.16.2"
    android_new_tag: string;       // e.g. "SDK_4.17.0"
  };
  changes: ChangeItem[];
  misalignments: MisalignmentItem[];
}

type ChangeType =
  | "new_api"
  | "deprecated_api"
  | "renamed_api"
  | "param_change"
  | "new_listener";

type ManagerDomain =
  | "client"
  | "chat"
  | "group"
  | "contact"
  | "room"
  | "push"
  | "presence"
  | "thread"
  | "userinfo"
  | "conversation";

interface ChangeItem {
  id: string;                      // unique identifier, e.g. "chatmanager_sendMessage"
  type: ChangeType;
  domain: ManagerDomain;           // which manager this belongs to
  method_name: string;             // RN method name (camelCase)
  ios: PlatformChange | null;      // null if iOS doesn't have this change
  android: PlatformChange | null;  // null if Android doesn't have this change
  description: string;             // human-readable description
  is_listener: boolean;            // true if this is a listener/event callback
}

interface PlatformChange {
  file_path: string;               // relative path in native repo
  method_signature: string;        // original method signature
  params: ParamInfo[];
  return_type: string;
  doc_comment: string;             // extracted documentation
}

interface ParamInfo {
  name: string;
  type: string;
  is_optional: boolean;
  default_value?: string;
}

interface MisalignmentItem {
  description: string;
  ios_only: ChangeItem[];          // changes only in iOS
  android_only: ChangeItem[];      // changes only in Android
  resolution?: "skip" | "include" | "defer";  // user decision after intervention
}
```

### Output Location

Change Manifest JSON 直接在对话中输出，供用户确认后传递给 Skill 2（Core Upgrade）。

### Execution Summary

执行完成后，输出摘要包含：
- 分析的 iOS 文件数量和 Android 文件数量
- 检测到的变更总数（按类型分类）
- 不对齐项数量
- 已修改/生成的文件列表

---

## Human Intervention Points

### 1. iOS/Android 变更不对齐

**触发条件：** `misalignments` 数组非空（存在仅一端有的变更）

**展示格式：** 以表格形式展示不对齐项：

| # | 方向 | Domain | 方法名 | 类型 | 描述 |
|---|------|--------|--------|------|------|
| 1 | iOS only | chat | newMethodA | new_api | 新增消息发送方法 |
| 2 | Android only | group | newMethodB | new_api | 新增群组管理方法 |

**用户决策选项：**

对每个不对齐项，用户需要选择：
- **skip**（跳过）：该变更仅在单端实现，RN 层不需要支持
- **include**（包含）：RN 层仍需支持该变更（即使只有一端有 native 实现）
- **defer**（延后）：留到下个版本处理

**等待用户逐项或批量决策后，将 `resolution` 字段填入对应的 `MisalignmentItem`，然后继续生成最终 Manifest。**

### 2. Tag 在仓库中不存在

**触发条件：** `git diff` 执行失败，Tag 不存在

**处理：** 执行 `git tag -l` 列出可用 Tag，展示给用户选择正确的 Tag。

### 3. 仓库工作区有未提交变更

**触发条件：** `git status --porcelain` 输出非空

**处理：** 警告用户当前工作区有未提交变更，建议先 `git stash` 或 `git commit`，确认后继续。

---

## Reference

- 过滤逻辑实现：`.kiro/skills/__utils__/filter.ts`
- Tag 验证逻辑实现：`.kiro/skills/__utils__/tag-validator.ts`
- Manifest 类型定义和验证：`.kiro/skills/__utils__/manifest.ts`
- iOS 仓库路径：`/Users/asterisk/Codes/easemob/emclient-ios`
- Android 仓库路径：`/Users/asterisk/Codes/easemob/emclient-android`
