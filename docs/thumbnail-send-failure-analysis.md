# 图片/视频消息缩略图发送失败问题分析与修复方案

## 一、问题现象

- React Native (Android) 用户发送图片消息失败。
- iOS 端不复现。
- native Android 日志关键字：`[EMChatManager] attachment thumbnail local uri is null`。
- 复现条件：调用 `ChatMessage.createImageMessage()` 时未传 `thumbnailLocalPath`。

## 二、根因分析

涉及 4 层代码，问题是多层兜底缺失叠加。

### 第 1 层：RN SDK 把"未传"实化成空串

`src/common/ChatMessage.ts:1421`

```ts
this.thumbnailLocalPath = params.thumbnailLocalPath ?? '';
```

业务没传时，body 上 `thumbnailLocalPath` 是 `""`，并随 `JSON.stringify` 透传到 native。

### 第 2 层：Android bridge 用空串覆盖 native 兜底

`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1033`

```java
if (json.has("thumbnailLocalPath")) {
    body.setThumbnailLocalPath(json.getString("thumbnailLocalPath"));   // 写入 ""
}
```

C++ 构造函数本来有兜底（空时把 `mThumbnailLocalPath = localPath`），但被这一步显式覆盖回空串。

### 第 3 层：Android native SDK 发送前未补 thumbnail

`hyphenatechatsdk/src/com/hyphenate/chat/EMChatManager.java:639-642`

```java
Uri thumbLocalUri = imageBody.thumbnailLocalUri();
if (thumbLocalUri == null) {
    EMLog.e(TAG, "attachment thumbnail local uri is null");
    ret = false;            // 直接失败
}
```

新版 EMChatManager 在压缩分支有补丁（line 937-942），但被嵌在 `!isOriginalImage && fileExist(localUri)` 内，且用户日志对应的旧版本根本没有这段。

### 第 4 层：iOS 行为相反（另一个 bug）

`emclient-ios/newSDK/HyphenateSDK/ChatManager/EMChatManager.mm:837-849`

```objc
imageBody.thumbnailLocalPath = toPath;   // 无条件覆盖业务自定义值
imageBody.bigImageLocalPath  = toPath;
imageBody.localPath          = toPath;
```

iOS 在发送前用压缩大图无条件覆盖 thumbnail，**等同于不支持自定义缩略图**——这本身也是 bug，只是它把"无 thumbnail"这种情况意外覆盖成功了。

### 跨端语义对比

| 场景 | iOS 当前 | Android 当前 |
|---|---|---|
| 业务未传 thumbnail | ✅ 自动用大图兜底 | ❌ 报错 `thumbnail local uri is null` |
| 业务传了自定义 thumbnail | ❌ 被静默覆盖 | ✅ 使用业务值 |

两端语义完全相反，谁都不对。

## 三、建议方案（最终目标语义）

**统一规则：业务传了就用业务的，没传/无效就 native 自动兜底，永不因 thumbnail 缺失而发送失败。**

### 图片

| 业务输入 | 处理 |
|---|---|
| 未传 / 空串 / 路径无效 / 文件不存在 | native 用压缩大图兜底，发送成功 |
| 有效路径 | 使用业务值；统一复制到会话目录（不区分是否临时目录） |

### 视频

| 业务输入 | 处理 |
|---|---|
| 未传 / 空串 / 路径无效 / 文件不存在 | native 跳过缩略图上传，消息正常发送，接收端 thumbnail 为空 |
| 有效路径 | 使用业务值；统一复制到会话目录 |

### 通用

- iOS 不再无条件用大图覆盖业务自定义缩略图。
- Android 在 thumbnail 字段无效时不阻塞发送。

### RN 透传原则（重要）

**RN 层只做透传，不做语义改写。** 业务调用方传什么字段，最终到达 iOS/Android native 的就是什么字段；业务没传的字段，整条链路上都不应被实化成默认值（如 `""`、`0`、`false`）后再透传给 native。

这条原则适用于**所有可选字段**，不限于 `thumbnailLocalPath`。直接收益：

- RN 入参与 native 入参严格对齐，跨端行为完全由 native 决定，避免 RN 层"擅自加默认值"导致的跨端歧义；
- native 层的兜底逻辑（如 C++ 构造函数对空 thumbnail 的兜底）不会被 RN 透传出来的"假值"覆盖；
- 未来 native 新增字段或调整默认行为，RN 层无需感知，自然兼容。

具体到 thumbnail：业务未传 `thumbnailLocalPath` 时，从 TS 对象到 native bridge 调用全程**保持该字段不存在**，不写 `""`，不调 `setThumbnailLocalPath("")`。

## 四、各端调整清单

### iOS native SDK（emclient-ios）

文件：`newSDK/HyphenateSDK/ChatManager/EMChatManager.mm:_checkMessageBeforeSend`

调整：

1. 图片分支（line 833-855）：
   - 仅在 `imageBody.thumbnailLocalPath` 为空 / 文件不存在时，才把 thumbnail 设成压缩大图路径；
   - 业务传了有效 thumbnail 时保留，不覆盖；走"复制到会话目录"逻辑（已有 line 863-877 类似搬运，可复用）。
2. 视频分支（line 881-902）：
   - thumbnail 为空 / 无效 → 不上传缩略图，不写回空串到 body；
   - 有效 → 维持现有"复制到会话目录"逻辑。

### Android native SDK（emclient-android）

文件：`hyphenatechatsdk/src/com/hyphenate/chat/EMChatManager.java`

调整：

1. `updateMessageAttachmentThumbnailPath()`（line 634-704）：
   - 图片分支（line 637-666）：thumb URI 为 null 或文件无效时，**不再 `ret = false`**，改为用 localUrl / 压缩大图兜底；
   - 视频分支（line 668-697）：thumb URI 为 null 或文件无效时，跳过上传，`ret = true`，不阻塞发送。
2. `sendMessage()` 图片分支（line 912-942）：
   - 把 line 937-942 的兜底从 `!isOriginalImage` 内层提到外层，确保 GIF / 原图模式也覆盖到。

### RN Android bridge

文件：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1033`

调整：

```java
if (json.has("thumbnailLocalPath")
        && !TextUtils.isEmpty(json.optString("thumbnailLocalPath"))) {
    body.setThumbnailLocalPath(json.getString("thumbnailLocalPath"));
}
```

视频分支同理（line 1093 附近）。

### RN SDK（react-native-chat-sdk）

遵循"RN 入参与 native 入参严格一致"原则，业务未传的字段全链路保持缺省，不在任何中间环节实化为默认值。

文件：`src/common/ChatMessage.ts`

调整：

1. `ChatImageMessageBody` / `ChatVideoMessageBody` 构造函数（line 1421、1496）：
   - 不再 `params.thumbnailLocalPath ?? ''`；当业务未传时，字段保持 `undefined`，不写 `""`。
   - 其他可选字段同步审查（`secret`、`remotePath`、`thumbnailRemotePath`、`thumbnailSecret` 等），遵循同一原则。
2. 跨桥序列化阶段：确保 `JSON.stringify` 不输出 `undefined` 字段，使 native bridge 收到的 JSON 里**根本不包含** `thumbnailLocalPath` key，从而不会触发 `json.has("thumbnailLocalPath")` 为真的分支。
3. `createVideoMessage`（line 839）：`thumbnailLocalPath` 改为可选；不再硬性要求业务传。
4. 文档明确：所有 `localPath` 类可选字段，未传由 native 兜底，RN 不做默认值填充。

## 五、推荐发布顺序

1. **RN SDK + RN Android bridge**：覆盖 RN 用户主流场景，单独发版即可解决当前 issue。
2. **Android native SDK**：从根上对齐语义，所有 Android 用户（含原生）受益。
3. **iOS native SDK**：修复"忽略业务自定义 thumbnail"的反向 bug，跨端语义最终对齐。

第 1 步即可解掉当前线上问题；第 2、3 步随各 native SDK 正常迭代节奏发布。
