# Native Deprecated API 扫描脚本设计文档

- **日期**：2026-06-02
- **项目**：react-native-chat-sdk-rn72
- **状态**：设计完成

## 1. 概述

创建三个 shell 脚本用于扫描 native wrapper 代码中调用的 HyphenateChat SDK 已废弃 API：

- `scripts/scan-deprecated-android.sh`：Android 侧扫描
- `scripts/scan-deprecated-ios.sh`：iOS 侧扫描
- `scripts/scan-deprecated.sh`：主脚本，调用两端并汇总 Markdown 报告

输出到 `build/reports/native-deprecated-api.md`，通过 yarn scripts 启动。

## 2. 设计选择

### 2.1 扫描范围

全部 native 源码：`modules/java/`、`modules/objc/`、`android/`、`ios/`。

### 2.2 获取方式

驱动完整 build：
- Android：`./gradlew assemble -Xlint:deprecation`
- iOS：`xcodebuild build -Wdeprecated-declarations`

### 2.3 结果过滤

只保留项目 native 代码路径：
- Android：`modules/java/` 或 `android/`
- iOS：`modules/objc/` 或 `ios/`

### 2.4 输出格式

Markdown 报告，按平台分 section，包含文件、行号、调用 API、warning 信息。

### 2.5 输出位置

`build/reports/native-deprecated-api.md`，加入 `.gitignore`。

### 2.6 脚本结构

三个 shell 脚本：主脚本调用两个子脚本，子脚本可独立运行。

### 2.7 启动方式

Yarn scripts：
- `yarn scan:deprecated`：扫描两端
- `yarn scan:deprecated:android`：仅 Android
- `yarn scan:deprecated:ios`：仅 iOS

### 2.8 缓存策略

无缓存，每次重新 build。

### 2.9 失败处理

Build 失败时脚本以非零退出码退出，不生成报告。

## 3. Android 实现

### 3.1 命令

从 `android/` 目录执行：
```bash
./gradlew assemble -Xlint:deprecation
```

### 3.2 解析

正则匹配 Gradle 输出中的 deprecation warning，格式类似：
```
/path/to/file.java:123: warning: [deprecation] someMethod() in SomeClass has been deprecated
```

正则表达式：
```
^(modules/java/|android/).*\.java:[0-9]+: warning: \[deprecation\] (.+) in (.+) has been deprecated
```

捕获组：1=文件路径（含行号），2=方法名，3=类名

### 3.3 输出

JSON 数组，每项包含 `{file, line, api, message}`。

### 3.4 依赖检查

检查 `android/gradlew` 可执行，检查 `java` 命令可用。

## 4. iOS 实现

### 4.1 命令

从 `example/ios/` 目录执行：
```bash
xcodebuild -workspace ChatSdkExample.xcworkspace -scheme ChatSdkExample -sdk iphonesimulator -configuration Debug build -Wdeprecated-declarations
```

### 4.2 解析

正则匹配 xcodebuild 输出中的 deprecation warning，格式类似：
```
/path/to/file.m:123:45: warning: 'someMethod' is deprecated: reason [-Wdeprecated-declarations]
```

正则表达式：
```
^(modules/objc/|ios/).*\.[mh]:[0-9]+:[0-9]+: warning: '(.+)' is deprecated: (.*) \[-Wdeprecated-declarations\]
```

捕获组：1=文件路径（含行号），2=方法名，3=原因

### 4.3 输出

JSON 数组，每项包含 `{file, line, api, message}`。

### 4.4 依赖检查

检查 `xcodebuild` 命令可用，检查 `example/ios/ChatSdkExample.xcworkspace` 存在。

## 5. 主脚本

### 5.1 流程

1. 创建 `build/reports/` 目录（如不存在）
2. 调用 `scan-deprecated-android.sh`，获取 JSON 结果
3. 调用 `scan-deprecated-ios.sh`，获取 JSON 结果
4. 生成 Markdown 报告，写入 `build/reports/native-deprecated-api.md`

### 5.2 报告结构

```markdown
# Native Deprecated API Scan Report

Generated: 2026-06-02 HH:MM:SS

## Summary
- Android: X warnings
- iOS: Y warnings
- Total: Z warnings

## Android
### modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java:123
- API: `EMChatManager.someMethod()`
- Message: has been deprecated

## iOS
### modules/objc/dispatch/ExtSdkChatManagerWrapper.m:123
- API: `EMChatManager.someMethod`
- Message: is deprecated: reason
```

### 5.3 错误处理

- 如果子脚本失败（非零退出码），主脚本停止执行，不生成报告。
- 如果 JSON 解析失败，子脚本打印错误并退出。

## 6. Yarn Scripts 配置

在 `package.json` 中添加：

```json
{
  "scripts": {
    "scan:deprecated": "bash scripts/scan-deprecated.sh",
    "scan:deprecated:android": "bash scripts/scan-deprecated-android.sh",
    "scan:deprecated:ios": "bash scripts/scan-deprecated-ios.sh"
  }
}
```

## 7. Git 配置

将 `build/reports/native-deprecated-api.md` 加入 `.gitignore`。

## 8. 实施注意事项

- 正则表达式需根据真实 build 输出调整，格式可能略有差异。
- Android build 较慢，iOS build 更慢，适合手动触发或 CI 夜间运行。
- 不进 pre-commit，符合测试策略文档定位。

## 9. 实施后修订（2026-06-02）

实际实施时发现以下需要调整的点：

**编译器标志的正确传递方式**

- `-Xlint:deprecation` 是 javac 标志，不是 gradle CLI 选项。直接传给 `./gradlew` 会导致 `Unknown command-line option`。需要在 build.gradle 的 `compileOptions.compilerArgs` 中配置才能生效。默认情况下，Android Gradle Plugin 不会展开单个 deprecation warning，所以 Android 扫描的输出依赖于 example/android/build.gradle 是否启用 `-Xlint:deprecation`。
- `-Wdeprecated-declarations` 是 clang 标志，不是 xcodebuild 选项。需要通过 `OTHER_CFLAGS='$(inherited) -Wdeprecated-declarations'` 这种 build setting 方式传递。

**编译缓存导致警告丢失**

- 增量 build 会跳过未变更文件的编译，导致 deprecation warning 缺失。脚本默认执行 `clean` 再 build，确保所有源文件都重新编译。

**警告路径是绝对路径**

- 实际 build 输出中文件路径是绝对路径（如 `/Users/.../modules/objc/...`），不是相对路径。正则需要匹配绝对路径模式，并过滤掉 `node_modules/` 和 `Pods/` 下的第三方代码。

**警告去重**

- 同一源文件被多个编译单元包含时，clang 会重复输出相同的 deprecation warning。脚本使用 `jq -s 'unique_by([.file, .line, .api])'` 去重。

**stdout 与 build 日志分离**

- 子脚本需要把 build 日志重定向到 stderr，stdout 只输出最终 JSON，否则主脚本捕获的输出会混入 build 日志导致 jq 解析失败。

**依赖增加**

- 实际实现使用 `jq` 生成 JSON 以处理特殊字符转义。dependency check 中增加 `jq` 检查。

**.gitignore 状态**

- `build/` 已在 .gitignore 中（line 196），所以 `build/reports/native-deprecated-api.md` 自动被忽略。不需要单独添加。

**首次扫描结果**

- iOS 扫描发现 4 个 wrapper 中调用的 HyphenateChat deprecated API：
  - `ExtSdkChatManagerWrapper.m:530` - `asyncFetchHistoryMessagesFromServer:...`
  - `ExtSdkConversationWrapper.m:410` - `loadMessagesWithKeyword:...:fromUser:...`
  - `ExtSdkToJson.m:553` - `muteList`
  - `ExtSdkToJson.m:1535` - `from`
- Android 扫描结果为空，因为 example/android/build.gradle 没有启用 `-Xlint:deprecation`。脚本启动时会提示这一点。
