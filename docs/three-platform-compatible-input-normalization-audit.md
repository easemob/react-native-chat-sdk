# 三端兼容优先输入归一化审计

- 日期：2026-05-29
- 规则来源：`docs/three-platform-compatible-input-normalization-rules.md`
- 字段范围：`docs/three-platform-data-object-fields.md`
- 审计范围：TypeScript 用户输入、TypeScript constructor/factory、Android `fromJson`、iOS `fromJsonObject`

## 1. 判定口径

本审计只列出输入路径中仍不符合兼容优先归一化规则的位置：

```text
TypeScript 用户输入
-> constructor / factory
-> TypeScript class object
-> native wrapper from-json
-> native SDK object
```

判定重点：

- native 可选字段：TypeScript constructor/factory 输入应允许不传。
- TypeScript class 属性可以继续保持旧默认值，例如 `''`、`0`、`false`、`[]`。
- native `from-json` 需要把 TypeScript 兼容默认值还原为 native 未设置语义。
- 禁止用通用 falsy 判断，因为 `0` 和 `false` 可能是合法输入。

本文不把已确认的类型差异、to-json 输出方向差异、enum 值域差异作为本轮问题，除非它们直接影响输入语义。

## 2. TS 输入参数比 native 更窄

### 2.1 `ChatOptions.appKey` / `appId`

- TypeScript：`src/common/ChatOptions.ts:267`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:288`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:291`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1248`、`modules/objc/dispatch/ExtSdkToJson.m:1251`

问题：native 初始化语义是 `appKey` / `appId` 二选一，Android 和 iOS 都按 key 存在判断；TypeScript deprecated constructor 的参数类型仍要求二者都必填。`withAppId` / `withAppKey` 通过 `undefined as any` 绕过类型，说明 constructor 输入类型还未和 native 输入语义对齐。

### 2.2 `ChatMessage.createFileMessage.opt.displayName`

- TypeScript：`src/common/ChatMessage.ts:726`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:937`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1055`

问题：`displayName` 在 native 文件消息体中可为空；TypeScript factory 的 `opt` 本身可选，但一旦传入 `opt`，`displayName` 仍是必填。

### 2.3 `ChatImageMessageBody.displayName`

- TypeScript factory：`src/common/ChatMessage.ts:781`
- TypeScript constructor：`src/common/ChatMessage.ts:1395`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1024`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1089`

问题：图片消息 `displayName` native 可选；TypeScript factory 的 `opt.displayName` 和 `ChatImageMessageBody` constructor 的 `displayName` 仍是必填。

### 2.4 `ChatVideoMessageBody.displayName`

- TypeScript factory：`src/common/ChatMessage.ts:843`
- TypeScript constructor：`src/common/ChatMessage.ts:1471`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1105`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1139`

问题：视频消息 `displayName` native 可选；TypeScript factory 的 `opt.displayName` 和 `ChatVideoMessageBody` constructor 的 `displayName` 仍是必填。

### 2.5 `ChatVideoMessageBody.thumbnailLocalPath`

- TypeScript factory：`src/common/ChatMessage.ts:843`
- TypeScript constructor：`src/common/ChatMessage.ts:1471`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1092`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1146`

问题：视频缩略图本地路径 native 可选；TypeScript constructor 已允许 `thumbnailLocalPath?`，但 factory 的 `opt.thumbnailLocalPath` 仍是必填。

### 2.6 `ChatVoiceMessageBody.displayName`

- TypeScript factory：`src/common/ChatMessage.ts:900`
- TypeScript constructor：`src/common/ChatMessage.ts:1521`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1156`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1182`

问题：语音消息 `displayName` native 可选；factory 已允许 `displayName?`，但 `ChatVoiceMessageBody` constructor 仍要求必填。

### 2.7 `ChatLocationMessageBody.address`

- TypeScript factory：`src/common/ChatMessage.ts:1005`
- TypeScript constructor：`src/common/ChatMessage.ts:1258`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:866`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:917`

问题：位置消息 `address` native 可选；TypeScript factory 的 `opt.address` 和 `ChatLocationMessageBody` constructor 的 `address` 仍是必填。factory 当前还会把缺失值默认成 `''`。

### 2.8 `ChatCustomMessageBody.params`

- TypeScript factory：`src/common/ChatMessage.ts:1092`
- TypeScript constructor：`src/common/ChatMessage.ts:1584`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:910`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:972`

问题：custom params native 可选，constructor 已允许 `params?`；factory 的 `opt` 本身可选，但一旦传入 `opt`，`params` 仍是必填。

### 2.9 `ChatFetchMessageOptions.startTs` / `endTs` / `direction` / `needSave`

- TypeScript：`src/common/ChatMessage.ts:1712`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1684`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1687`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1688`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1689`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1541`、`modules/objc/dispatch/ExtSdkToJson.m:1542`、`modules/objc/dispatch/ExtSdkToJson.m:1543`、`modules/objc/dispatch/ExtSdkToJson.m:1547`

问题：字段文档确认 native 有默认值语义，例如 `startTs` / `endTs` 为 `-1`、`direction` 默认 `UP`、`needSave` 默认 `false`；TypeScript constructor 参数仍全部必填，输入语义比 native 更窄。

### 2.10 `ChatUserInfo.userId`

- TypeScript：`src/common/ChatUserInfo.ts:47`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1407`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1370`

问题：字段文档确认 native userId 可为空；TypeScript constructor 仍要求必填，Android 也使用 `getString("userId")` 强制存在。

## 3. TS 使用 falsy 判断导致合法值被覆盖

### 3.1 `ChatGroupOptions.style`

- TypeScript：`src/common/ChatGroup.ts:317`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:491`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:688`

问题：TypeScript constructor 使用 `params.style ? ... : default`，合法值 `0` 会被当成未设置并覆盖成默认 `PublicJoinNeedApproval`。Android 和 iOS from-json 都直接读取 `style` 数值，可以表达 `0`。

## 4. native from-json 未过滤 TypeScript 兼容默认值

### 4.1 `ChatMessage.to` / `from` / `conversationId`

- TypeScript：`src/common/ChatMessage.ts:511`、`src/common/ChatMessage.ts:537`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:679`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:683`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:753`、`modules/objc/dispatch/ExtSdkToJson.m:758`、`modules/objc/dispatch/ExtSdkToJson.m:759`

问题：TypeScript 会把 `conversationId`、`from`、`to` 缺失合并为 `''`。Android 只判断 key 存在就设置 `to/from`；iOS 直接读取并传入 `to/conversationId`。这些 native 字段可为空时，空字符串应按字段语义视为未设置。iOS 的 `from` 已对空字符串特殊回退为当前用户。

### 4.2 文件消息体公共字段 `displayName` / `remotePath` / `secret`

- TypeScript 基类：`src/common/ChatMessage.ts:1312`、`src/common/ChatMessage.ts:1329`
- Android file：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:937`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:940`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:943`
- Android image：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1024`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1027`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1030`
- Android video：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1105`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1108`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1111`
- Android voice：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1156`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1159`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1162`
- iOS file：`modules/objc/dispatch/ExtSdkToJson.m:1055`、`modules/objc/dispatch/ExtSdkToJson.m:1058`、`modules/objc/dispatch/ExtSdkToJson.m:1059`
- iOS image：`modules/objc/dispatch/ExtSdkToJson.m:1089`、`modules/objc/dispatch/ExtSdkToJson.m:1097`、`modules/objc/dispatch/ExtSdkToJson.m:1098`
- iOS video：`modules/objc/dispatch/ExtSdkToJson.m:1139`、`modules/objc/dispatch/ExtSdkToJson.m:1143`、`modules/objc/dispatch/ExtSdkToJson.m:1144`
- iOS voice：`modules/objc/dispatch/ExtSdkToJson.m:1182`、`modules/objc/dispatch/ExtSdkToJson.m:1185`、`modules/objc/dispatch/ExtSdkToJson.m:1186`

问题：这些字段 native 可选，TypeScript class 会把缺失合并为 `''`。Android 多数只判断 key 存在就设置；iOS 多数直接赋值。from-json 应按字段语义过滤 `''`，避免把未设置变成设置为空字符串。

### 4.3 图片缩略图字段 `thumbnailLocalPath` / `thumbnailRemotePath` / `thumbnailSecret`

- TypeScript：`src/common/ChatMessage.ts:1395`、`src/common/ChatMessage.ts:1427`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1033`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1036`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1039`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1101`、`modules/objc/dispatch/ExtSdkToJson.m:1102`、`modules/objc/dispatch/ExtSdkToJson.m:1103`

问题：图片缩略图字段 native 可选，TypeScript 默认 `''`；native from-json 当前未过滤 `''`。

### 4.4 视频缩略图字段 `thumbnailLocalPath` / `thumbnailRemotePath` / `thumbnailSecret`

- TypeScript：`src/common/ChatMessage.ts:1471`、`src/common/ChatMessage.ts:1502`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1092`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1099`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1102`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1146`、`modules/objc/dispatch/ExtSdkToJson.m:1147`、`modules/objc/dispatch/ExtSdkToJson.m:1148`

问题：视频缩略图字段 native 可选，TypeScript 默认 `''`；native from-json 当前未过滤 `''`。Android 在缺失时还会构造 `Uri.parse("")`，把未设置变成空 URI。

### 4.5 `ChatLocationMessageBody.address`

- TypeScript：`src/common/ChatMessage.ts:1005`、`src/common/ChatMessage.ts:1017`、`src/common/ChatMessage.ts:1258`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:866`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:868`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:917`

问题：`address` native 可选，TypeScript factory 会把缺失合并为 `''`。native from-json 应把 `''` 视为未设置，而不是设置为空地址。

### 4.6 `ChatCombineMessageBody.title` / `summary` / `compatibleText` / `remotePath` / `secret`

- TypeScript：`src/common/ChatMessage.ts:1623`、`src/common/ChatMessage.ts:1650`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:993`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1008`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1012`、`modules/objc/dispatch/ExtSdkToJson.m:1020`

问题：Android 使用 `optString` 后无条件 setter，缺失会变成 `''`；iOS 直接透传字典值，空字符串也未按可选字段过滤。`messageIdList` 是 native 创建合并消息所需列表，不归入本条可选默认值问题。

## 5. native from-json 对可选字段无条件写入默认 `0` / `false`

### 5.1 iOS `ChatSilentModeParam`

- TypeScript：`src/common/ChatSilentMode.ts:95`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1585`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1591`、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1595`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1489`、`modules/objc/dispatch/ExtSdkToJson.m:1492`、`modules/objc/dispatch/ExtSdkToJson.m:1494`、`modules/objc/dispatch/ExtSdkToJson.m:1496`

问题：`remindType`、`startTime`、`endTime`、`duration` 在 TypeScript 输入中可选。Android 已按 `has()` 判断；iOS 无条件读取并设置，缺失时会落成 `0` 或空时间对象，改变未设置语义。

### 5.2 `ChatConversationFetchOptions.pageSize`

- TypeScript：`src/common/ChatConversation.ts:869`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:1741`、`modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java:1053`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1604`、`modules/objc/dispatch/ExtSdkChatManagerWrapper.m:994`

问题：TypeScript constructor 允许不传 `pageSize`。Android helper 直接 `getInt("pageSize")`，可能抛错；iOS 直接 `[dict[@"pageSize"] intValue]`，缺失会变成 `0`。应按字段语义使用默认页大小，或只在有值时设置。

## 6. 三端字段读取不一致

### 6.1 `ChatOptions.dnsUrl`

- TypeScript：`src/common/ChatOptions.ts:290`、`src/common/ChatOptions.ts:332`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:311`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1277`

问题：TypeScript 和 Android 使用 `dnsUrl`，iOS from-json 读取 `dnsURL`。用户传入 `dnsUrl` 时，iOS 侧不会设置到 native `dnsURL`。

### 6.2 `ChatOptions.debugModel`

- TypeScript：`src/common/ChatOptions.ts:270`、`src/common/ChatOptions.ts:315`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:286`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1260`

问题：TypeScript 和 iOS 支持 `debugModel` 输入；Android `EMOptions.fromJson` 没有读取该字段，三端输入语义不一致。

### 6.3 `ChatOptions.uikitVersion`

- TypeScript：`src/common/ChatOptions.ts:301`、`src/common/ChatOptions.ts:351`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:355`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1247`

问题：Android 读取 `uikitVersion`，iOS from-json 未读取该字段，三端输入语义不一致。

### 6.4 `ChatOptions.dohVendor`

- TypeScript：`src/common/ChatOptions.ts:303`、`src/common/ChatOptions.ts:354`
- Android：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:364`
- iOS：`modules/objc/dispatch/ExtSdkToJson.m:1301`

问题：TypeScript 默认 `1`；Android 使用 `optInt("dohVendor")`，缺失时为 `0`；iOS 缺失时 `[nil intValue]` 也是 `0`。字段文档记录 Android native 默认语义是 `-1`，三端默认值语义未对齐。

## 7. 建议修复顺序

1. 先修 TypeScript 输入参数：把 native 可选字段的 constructor/factory 参数改为可选，但保留 public class 属性默认值。
2. 再修 native from-json：对 native 可选 string/list 字段按字段语义过滤 `''` / `[]`，不要使用通用 falsy 判断。
3. 单独修正 `ChatGroupOptions.style` 的 `0` 值判断，使用 `params.style !== undefined`。
4. 最后处理 `ChatOptions` 字段名和默认值不一致，避免初始化阶段三端行为分叉。
