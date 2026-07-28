# Skill 2: Core Upgrade

根据 Change Manifest 自动更新 RN SDK 的 Native 依赖版本号、Java/ObjC Wrapper 层和 TypeScript 公开 API 层，使 RN SDK 与新版 HyphenateChat Native SDK 保持同步。

---

## Trigger Conditions

当满足以下任一条件时触发本 Skill：

- 用户明确要求"执行核心升级"或"更新 Wrapper 和 TypeScript 层"
- Skill 1（Get Native Change Manifest）已完成，用户确认 Change Manifest 后要求继续
- 用户提供了 Change Manifest JSON 和新版本号，要求同步更新代码

---

## Input Parameters

| 参数名 | 格式 | 示例 | 说明 |
|--------|------|------|------|
| Change Manifest | JSON | 见 Skill 1 输出 | 结构化的 Native SDK 公开 API 变更清单 |
| `ios_sdk_version` | `x.y.z` | `4.19.1` | 新的 iOS HyphenateChat SDK 版本号 |
| `android_sdk_version` | `x.y.z` | `4.19.2` | 新的 Android HyphenateChat SDK 版本号 |

---

## Execution Steps

### Step 1: Update Podspec Dependency

修改 `react-native-chat-sdk.podspec` 中的 iOS SDK 版本依赖：

**文件路径：** `react-native-chat-sdk.podspec`（项目根目录）

**修改内容：**
```ruby
# 找到这一行：
s.dependency 'HyphenateChat','~> <old_version>'

# 替换为：
s.dependency 'HyphenateChat','~> <ios_sdk_version>'
```

**示例：**
```ruby
# Before:
s.dependency 'HyphenateChat','~> 4.18.1'

# After:
s.dependency 'HyphenateChat','~> 4.19.1'
```

---

### Step 2: Update build.gradle Dependency

修改 `android/build.gradle` 中的 Android SDK 版本依赖：

**文件路径：** `android/build.gradle`

**修改内容：**
```gradle
// 找到这一行：
implementation 'io.hyphenate:hyphenate-chat:<old_version>'

// 替换为：
implementation 'io.hyphenate:hyphenate-chat:<android_sdk_version>'
```

**示例：**
```gradle
// Before:
implementation 'io.hyphenate:hyphenate-chat:4.18.1'

// After:
implementation 'io.hyphenate:hyphenate-chat:4.19.2'
```

---

### Step 3: Iterate Change Manifest

遍历 `manifest.changes` 数组中的每个 `ChangeItem`，根据 `type` 字段分派到对应的处理流程：

```
FOR EACH change IN manifest.changes:
  SWITCH change.type:
    CASE "new_api"       → Step 4 (Java) + Step 5 (ObjC) + Step 6 (TypeScript)
    CASE "deprecated_api" → Step 7
    CASE "renamed_api"   → Step 7 (deprecated old) + Step 4/5/6 (new)
    CASE "param_change"  → Step 8
    CASE "new_listener"  → Step 4 (Java) + Step 5 (ObjC, 含事件注册) + Step 6 (TypeScript, 含 Events)
```

---

### Step 4: Update Java Wrappers (new_api / new_listener)

对每个 `new_api` 或 `new_listener` 类型的变更，按以下顺序修改 Java 文件：

#### 4a. 添加方法名常量

**文件：** `modules/java/com/chatsdk/common/ExtSdkMethodType.java`

在对应 Manager 区域添加常量声明：

```java
public static final String <methodName> = "<methodName>";
```

**命名规则：** Java 常量名 = camelCase 方法名（与字符串值相同）

**示例：**
```java
/// EMChatManager methods
public static final String fetchHistoryMessagesBy = "fetchHistoryMessagesBy";
```

#### 4b. 添加 Wrapper 方法实现

**文件：** `modules/java/com/chatsdk/dispatch/ExtSdk<Domain>Wrapper.java`

其中 `<Domain>` 根据 `change.domain` 确定：

| domain | Java Wrapper 文件 |
|--------|------------------|
| client | ExtSdkClientWrapper.java |
| chat | ExtSdkChatManagerWrapper.java |
| group | ExtSdkGroupManagerWrapper.java |
| contact | ExtSdkContactManagerWrapper.java |
| room | ExtSdkChatRoomManagerWrapper.java |
| push | ExtSdkPushManagerWrapper.java |
| presence | ExtSdkPresenceManagerWrapper.java |
| thread | ExtSdkChatThreadManagerWrapper.java |
| userinfo | ExtSdkUserInfoManagerWrapper.java |
| conversation | ExtSdkConversationWrapper.java |

在 Wrapper 文件中添加方法实现，参考已有方法的模式：
- 从 `params` 中提取参数
- 调用 Native SDK 对应方法
- 通过 callback 返回结果

#### 4c. 添加 JSON 转换（如有新类型）

**文件：** `modules/java/com/chatsdk/dispatch/ExtSdkHelper.java`

如果变更引入了新的数据类型，在 Helper 中添加对应的 `toJson()` 和 `fromJson()` 转换方法。

---

### Step 5: Update ObjC Wrappers (new_api / new_listener)

对每个 `new_api` 或 `new_listener` 类型的变更，按以下顺序修改 ObjC 文件：

#### 5a. 添加方法名常量声明

**文件：** `modules/objc/common/ExtSdkMethodTypeObjc.h`

```objc
static NSString *_Nonnull const ExtSdkMethodKey<PascalCaseName> = @"<methodName>";
```

**命名规则：** ObjC 常量名 = `ExtSdkMethodKey` + PascalCase 方法名

**示例：**
```objc
static NSString *_Nonnull const ExtSdkMethodKeyFetchHistoryMessagesBy = @"fetchHistoryMessagesBy";
```

#### 5b. 添加枚举映射

**文件：** `modules/objc/common/ExtSdkMethodTypeObjc.m`

在对应的枚举映射区域注册新常量。

#### 5c. 添加 Wrapper 方法实现

**文件：** `modules/objc/dispatch/ExtSdk<Domain>Wrapper.m`

其中 `<Domain>` 根据 `change.domain` 确定（映射同 Step 4b）。

在 Wrapper 文件中添加方法实现，参考已有方法的模式：
- 从 `param` 字典中提取参数
- 调用 Native SDK 对应方法
- 通过 callback block 返回结果

#### 5d. 添加 JSON 转换（如有新类型）

**文件：** `modules/objc/dispatch/ExtSdkToJson.h` 和 `modules/objc/dispatch/ExtSdkToJson.m`

如果变更引入了新的数据类型，添加对应的 `toJson` category 方法。

#### 5e. 注册事件名（仅 new_listener）

**文件：** `modules/objc/rn/ExtSdkApiObjcRN.mm`

如果变更类型为 `new_listener`，在 `supportedEvents` 方法中注册新事件名：

```objc
// 在 supportedEvents 数组中添加：
ExtSdkMethodKey<PascalCaseName>,
```

---

### Step 6: Update TypeScript Layer (new_api / new_listener)

对每个 `new_api` 或 `new_listener` 类型的变更，按以下顺序修改 TypeScript 文件：

#### 6a. 添加方法名常量

**文件：** `src/__internal__/Consts.ts`

```typescript
export const MT<methodName> = '<methodName>';
```

**命名规则：** TypeScript 常量名 = `MT` + 方法名（首字母保持原样，即 `MT` + camelCase 方法名）

**示例：**
```typescript
export const MTfetchHistoryMessagesBy = 'fetchHistoryMessagesBy';
```

> **注意：** 观察现有代码，TypeScript 常量名实际为 `MT` + 原始方法名（camelCase），而非 PascalCase。例如 `MTlogin`、`MTcreateAccount`。保持与现有风格一致。

#### 6b. 添加 Manager 公开方法

**文件：** `src/Chat<Domain>Manager.ts`（或 `src/ChatClient.ts`）

| domain | TypeScript Manager 文件 |
|--------|------------------------|
| client | ChatClient.ts |
| chat | ChatManager.ts |
| group | ChatGroupManager.ts |
| contact | ChatContactManager.ts |
| room | ChatRoomManager.ts |
| push | ChatPushManager.ts |
| presence | ChatPresenceManager.ts |
| thread | ChatThreadManager.ts |
| userinfo | ChatUserInfoManager.ts |
| conversation | ChatManager.ts (conversation methods) |

添加公开方法，参考已有方法的模式：
- 添加 JSDoc 注释（从 native 源码获取）
- 调用 `this._callMethod(MT<methodName>, params)` 
- 返回 Promise

#### 6c. 添加监听器接口方法（仅 new_listener）

**文件：** `src/ChatEvents.ts`

在对应的 listener 接口中添加新的回调方法声明：

```typescript
/**
 * 方法描述（从 native 源码获取）
 */
<listenerMethodName>?(params: <ParamType>): void;
```

#### 6d. 添加类型定义（如有新类型）

**文件：** `src/common/Chat<Type>.ts`

如果变更引入了新的数据类型，创建对应的 TypeScript 类型/类定义。

#### 6e. 添加导出（如有新公开类型）

**文件：** `src/index.ts`

如果新增了公开类型或类，在 `index.ts` 中添加对应的 export。

---

### Step 7: Handle Deprecated API

对每个 `deprecated_api` 类型的变更：

#### Java

**文件：** 对应的 `ExtSdk<Domain>Wrapper.java`

在方法上添加 `@Deprecated` 注解，保留原有实现不变：

```java
@Deprecated
public void someOldMethod(...) {
    // 保留原有实现
}
```

#### ObjC

**文件：** 对应的 `ExtSdk<Domain>Wrapper.m`

在方法上方添加 deprecated 注释：

```objc
// deprecated: use newMethodName instead
- (void)someOldMethod:(NSDictionary *)param result:(nonnull id<ExtSdkCallbackObjc>)result {
    // 保留原有实现
}
```

#### TypeScript

**文件：** 对应的 `src/Chat<Domain>Manager.ts`

在方法上添加 `@deprecated` JSDoc 标记，保留原有实现：

```typescript
/**
 * @deprecated Use {@link newMethodName} instead.
 */
public async someOldMethod(...): Promise<...> {
    // 保留原有实现
}
```

---

### Step 8: Handle Parameter Change

对每个 `param_change` 类型的变更：

1. **Java Wrapper**：修改对应方法的参数提取逻辑
2. **ObjC Wrapper**：修改对应方法的参数提取逻辑
3. **TypeScript Manager**：修改方法签名和参数传递

确保三端的参数名称和类型保持语义一致。

---

### Step 9: Verification — yarn typecheck

执行 TypeScript 类型检查：

```bash
cd /Users/asterisk/Codes/rn/react-native-chat-sdk-rn72
yarn typecheck
```

**如果通过：** 继续 Step 10。

**如果失败：** 触发 **人工介入点 3**（见下方）。

---

### Step 10: Verification — yarn lint:sdk

执行 ESLint 代码规范检查：

```bash
cd /Users/asterisk/Codes/rn/react-native-chat-sdk-rn72
yarn lint:sdk
```

**如果通过：** 核心升级完成。

**如果失败：** 先尝试自动修复：

```bash
yarn lint:sdk --fix
```

如果 `--fix` 后仍有错误，触发 **人工介入点 4**（见下方）。

---

## File Modification Mapping

### 按变更类型的文件修改对照表

| Change Manifest `type` | Java 文件 | ObjC 文件 | TypeScript 文件 |
|---|---|---|---|
| `new_api` (method) | `ExtSdkMethodType.java` + `ExtSdk*Wrapper.java` | `ExtSdkMethodTypeObjc.h/.m` + `ExtSdk*Wrapper.m` | `Consts.ts` + `Chat*Manager.ts` |
| `new_api` (type) | `ExtSdkHelper.java` | `ExtSdkToJson.h/.m` | `src/common/Chat*.ts` + `src/index.ts` |
| `new_listener` | `ExtSdkMethodType.java` + `ExtSdk*Wrapper.java` | `ExtSdkMethodTypeObjc.h/.m` + `ExtSdk*Wrapper.m` + `ExtSdkApiObjcRN.mm` | `Consts.ts` + `ChatEvents.ts` + `Chat*Manager.ts` |
| `deprecated_api` | `@Deprecated` on method | deprecated comment | `@deprecated` JSDoc |
| `renamed_api` | deprecated old + new constant + new method | deprecated old + new constant + new method | deprecated old + new constant + new method |
| `param_change` | Wrapper method params | Wrapper method params | Manager method signature |

### 关键文件路径速查

| 用途 | 文件路径 |
|------|---------|
| iOS 依赖版本 | `react-native-chat-sdk.podspec` |
| Android 依赖版本 | `android/build.gradle` |
| Java 方法名常量 | `modules/java/com/chatsdk/common/ExtSdkMethodType.java` |
| Java Wrapper 实现 | `modules/java/com/chatsdk/dispatch/ExtSdk*Wrapper.java` |
| Java JSON 转换 | `modules/java/com/chatsdk/dispatch/ExtSdkHelper.java` |
| ObjC 方法名常量 (.h) | `modules/objc/common/ExtSdkMethodTypeObjc.h` |
| ObjC 方法名常量 (.m) | `modules/objc/common/ExtSdkMethodTypeObjc.m` |
| ObjC Wrapper 实现 | `modules/objc/dispatch/ExtSdk*Wrapper.m` |
| ObjC JSON 转换 | `modules/objc/dispatch/ExtSdkToJson.h` / `ExtSdkToJson.m` |
| ObjC RN 事件注册 | `modules/objc/rn/ExtSdkApiObjcRN.mm` |
| TS 方法名常量 | `src/__internal__/Consts.ts` |
| TS Manager 实现 | `src/Chat*.ts` |
| TS 事件接口 | `src/ChatEvents.ts` |
| TS 类型定义 | `src/common/Chat*.ts` |
| TS 导出入口 | `src/index.ts` |

---

## Method Name Constant Sync Rule

**三处常量必须保持同步**——方法名字符串值在三端完全一致：

| 位置 | 文件 | 格式 | 示例 |
|------|------|------|------|
| TypeScript | `src/__internal__/Consts.ts` | `export const MT<name> = '<name>';` | `export const MTfetchHistoryMessagesBy = 'fetchHistoryMessagesBy';` |
| Java | `modules/java/.../ExtSdkMethodType.java` | `public static final String <name> = "<name>";` | `public static final String fetchHistoryMessagesBy = "fetchHistoryMessagesBy";` |
| ObjC | `modules/objc/.../ExtSdkMethodTypeObjc.h` | `static NSString *_Nonnull const ExtSdkMethodKey<PascalName> = @"<name>";` | `static NSString *_Nonnull const ExtSdkMethodKeyFetchHistoryMessagesBy = @"fetchHistoryMessagesBy";` |

### 命名规则详解

给定一个方法名 `someMethodName`：

| 平台 | 常量名 | 字符串值 |
|------|--------|---------|
| TypeScript | `MTsomeMethodName` | `"someMethodName"` |
| Java | `someMethodName` | `"someMethodName"` |
| ObjC | `ExtSdkMethodKeySomeMethodName` | `"someMethodName"` |

**规则：**
- **字符串值**：三端完全一致，使用 camelCase
- **TypeScript 常量名**：`MT` 前缀 + 原始方法名（camelCase，首字母不变）
- **Java 常量名**：直接使用方法名（camelCase）
- **ObjC 常量名**：`ExtSdkMethodKey` 前缀 + PascalCase 方法名（首字母大写）

### 同步检查

每次添加新常量时，必须确认三个文件中都已添加对应条目。遗漏任一处将导致运行时方法调用失败。

---

## Protected Paths (Hard Constraints)

以下路径在本 Skill 执行过程中 **绝对不可修改**：

| 保护路径 | 原因 |
|----------|------|
| `lib/` | 由 `yarn build:exports` 自动生成，不可手动编辑 |
| `src/version.ts` | 由 `scripts/generate-version.js` 自动生成 |
| `modules/cpp/` | C++ 共享层，不在本 Skill 修改范围内 |
| `modules/*/flutter/` | Flutter SDK 变体专用，与 React Native 无关 |

**违反保护路径约束的操作必须立即终止并报告错误。**

---

## Output

### Execution Summary

执行完成后，输出摘要包含：

- 更新的 iOS SDK 版本号和 Android SDK 版本号
- 处理的变更项数量（按类型分类统计）
- 已修改的文件列表（按 Java / ObjC / TypeScript 分组）
- `yarn typecheck` 和 `yarn lint:sdk` 的执行结果
- 如有人工介入，记录介入原因和用户决策

### 示例摘要格式

```
=== Core Upgrade Summary ===

版本更新：
  - iOS: HyphenateChat ~> 4.19.1
  - Android: io.hyphenate:hyphenate-chat:4.19.2

变更处理：
  - new_api: 5 项
  - deprecated_api: 2 项
  - param_change: 1 项
  - new_listener: 1 项

修改文件：
  Java (4 files):
    - modules/java/com/chatsdk/common/ExtSdkMethodType.java
    - modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java
    - modules/java/com/chatsdk/dispatch/ExtSdkGroupManagerWrapper.java
    - modules/java/com/chatsdk/dispatch/ExtSdkHelper.java
  ObjC (5 files):
    - modules/objc/common/ExtSdkMethodTypeObjc.h
    - modules/objc/common/ExtSdkMethodTypeObjc.m
    - modules/objc/dispatch/ExtSdkChatManagerWrapper.m
    - modules/objc/dispatch/ExtSdkGroupManagerWrapper.m
    - modules/objc/rn/ExtSdkApiObjcRN.mm
  TypeScript (5 files):
    - src/__internal__/Consts.ts
    - src/ChatManager.ts
    - src/ChatGroupManager.ts
    - src/ChatEvents.ts
    - src/index.ts

验证结果：
  - yarn typecheck: ✅ PASS
  - yarn lint:sdk: ✅ PASS
```

---

## Human Intervention Points

### 1. 需要新增 Wrapper 文件

**触发条件：** Change Manifest 中的变更需要在 `modules/java/com/chatsdk/dispatch/` 或 `modules/objc/dispatch/` 中创建新文件（而非修改已有文件）。

**处理：**
- 暂停执行
- 展示需要新增的文件名和原因
- 等待用户确认：
  - **确认新增**：用户提供文件模板或确认后继续
  - **合并到已有文件**：将方法添加到最相近的已有 Wrapper 文件中
  - **跳过**：暂不处理该变更

### 2. 复杂类型转换无法自动推断

**触发条件：** 新增 API 的参数或返回值涉及复杂类型（嵌套对象、泛型、回调链等），无法从 Change Manifest 中自动推断 JSON 转换逻辑。

**处理：**
- 暂停执行
- 展示 Native 类型定义（从 iOS `.h` 文件或 Android `.java` 文件中提取）
- 展示需要实现的转换方向（toJson / fromJson）
- 等待用户提供转换逻辑指导或示例代码

### 3. yarn typecheck 失败

**触发条件：** Step 9 中 `yarn typecheck` 返回非零退出码。

**处理：**
- 暂停执行
- 展示完整的类型错误信息
- 标记可能的错误原因（缺少类型定义、参数类型不匹配、缺少导出等）
- 等待用户修复或提供修复指导

### 4. yarn lint:sdk 失败

**触发条件：** Step 10 中 `yarn lint:sdk` 失败，且 `--fix` 无法自动修复。

**处理：**
- 先尝试 `yarn lint:sdk --fix` 自动修复
- 如果仍有错误，暂停执行
- 展示剩余的 lint 错误
- 等待用户修复或确认忽略特定规则

---

## Reference

- 项目根目录：`/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72`
- Manifest 类型定义：`.kiro/skills/__utils__/manifest.ts`
- 过滤逻辑：`.kiro/skills/__utils__/filter.ts`
- Skill 1 输出（Change Manifest）：作为本 Skill 的输入
- Skill 3（Update Docs and Version）：本 Skill 完成后的下一步
