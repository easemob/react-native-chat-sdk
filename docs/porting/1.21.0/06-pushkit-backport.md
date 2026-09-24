# 06 - 补充回移：iOS PushKit 与推送证书名（React Native 1.21.0）

范围：`01-api-diff.md` ~ `04-verification.md` 与 `acceptance-report.md` 之外的**计划外补充项**。

PushKit 不在 4.24.1 → 4.25.0 的版本 diff 区间内（双端头文件 4.24.2 即已具备，见下节证据），历次平版均未覆盖。5.0.0 分支已补齐该能力并整体收敛了推送配置；1.21.0 是**长期分支**，必须保持向后兼容，因此本次只做**加法**：新增两个 iOS 证书初始化选项与 PushKit 绑定/解绑方法，不删除任何既有 API。

## 1. 结论

- 1.21.0 分支此前**没有** PushKit 能力：TS、iOS wrapper、Android wrapper 全链路无 `PushKit` 命中。
- native 侧能力完整且**早于 4.25.0 即已存在**：`emclient-ios` tag `4.24.2` 的 `EMClient.h` 与 `EMOptions.h` 已有全部四个 PushKit 方法与 `pushKitCertName` 属性，与 `5.0.0` 逐字一致（`git diff 4.24.2 5.0.0 -- newSDK/HyphenateSDK/EMOptions.h` 对两个证书名属性无差异）。因此这不是平版新版本 API，而是**漏移植的历史能力补齐**。
- 本次只在 **1.21.0 分支**新增 iOS 专用公开 API，**不删除** `ChatOptions.pushConfig` / `ChatPushConfig` / `ChatClient.updatePushConfig`，`bindDeviceToken` 也不新增（1.21.0 无此方法，绑定入口仍是 `updatePushConfig`）。「只加不删」由用户明确指定。
- 旧路径 `updatePushConfig` 的 iOS 实现（`registerForRemoteNotificationsWithCertName:` 在运行时写 `apnsCertName`）**原样保留、不加优先级判断**：老用户行为零变化；两处同时配置时以运行时写入为准，该冲突写进公开注释与 CHANGELOG 说明，由用户决策（见待决策项 D-1）。
- iOS 原生侧能力完整，本次不改 native。
- 参考实现：5.0.0 分支 commit `bc9915e`（RN）与 Flutter `im_flutter_sdk` 5.0.0 分支 commit `41d2cf17`。

## 2. 变更清单（native → React Native）

| id | 类型 | 领域 | iOS native 签名（HyphenateChat 4.24.2/4.25.0，两者一致） | Android native | RN 决策 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `pushkit_cert_name` | existing_option | push | `EMOptions.h:293`：`@property(nonatomic, copy) NSString *pushKitCertName;` | 无（iOS 专有） | include → `ChatOptions.pushKitCertName`（初始化下发，运行时不修改） | pending |
| `apns_cert_name` | existing_option | push | `EMOptions.h:278`：`@property(nonatomic, copy) NSString *apnsCertName;` | 无（iOS 专有） | include → `ChatOptions.apnsCertName`（初始化下发）；**保留**旧 `pushConfig.deviceId` 路径不动 | pending |
| `pushkit_register` | existing_api | push | `EMClient.h:776`：`- (void)registerPushKitToken:(NSData *_Nullable)aPushToken completion:(void (^_Nullable)(EMError * _Nullable aError))aCompletionBlock;` | 无（iOS 专有） | include → `ChatClient.bindPushKitToken({ deviceToken })`；Android 注册同名路由返回 `EMError.OPERATION_UNSUPPORTED`(111) | pending |
| `pushkit_unregister` | existing_api | push | `EMClient.h:825`：`- (void)unRegisterPushKitTokenWithCompletion:(void (^_Nullable)(EMError * _Nullable aError))aCompletionBlock;` | 无（iOS 专有） | include → `ChatClient.unbindPushKitToken()`；Android 同上 | pending |
| `pushkit_bind_sync` | existing_api | push | `EMClient.h:753`：`- (EMError *_Nullable)bindPushKitToken:(NSData *_Nullable)aPushToken;` | 无（iOS 专有） | skip（同步变体不单独暴露：TS 层本身即 Promise，暴露会产生两个语义完全相同的 API；与 5.0.0 结论一致） | pending |
| `pushkit_unbind_sync` | existing_api | push | `EMClient.h:802`：`- (EMError *_Nullable)unBindPushKitToken;` | 无（iOS 专有） | skip（同上） | pending |
| `push_config_kept` | kept_api | push | — | — | 1.21.0 **保留** `ChatOptions.pushConfig` / `ChatPushConfig` / `ChatClient.updatePushConfig`（兼容性要求；5.0.0 的删除动作不回移） | pending |
| `ios_renew_token_dispatch` | bug_fix | client | `EMClient.h`：`- (void)renewToken:completion:` | `EMClient.renewToken(token, EMCallBack)` | **发现但不在本次范围**：1.21.0 的 iOS `ExtSdkMethodKeyRenewTokenValue` 有 key、有 methodMap 条目、wrapper 有实现，但 `ExtSdkDispatch.m` 缺 switch 分支 → 落到 default 返回 `not implement: renewToken`。5.0.0 已修（`bc9915e`）。本次按用户范围不修，记入待决策项 D-2 | pending（待用户裁决） |

未匹配清单：

- UM-1：Android 端无 PushKit 能力（native `EMClient.java` 无对应方法）。用户已确认「仅 iOS 支持，非 iOS 调用静默 no-op」（沿用 5.0.0 裁决）。
- UM-2：native 4 个 PushKit 方法为语义相同的同步/异步两对。仅暴露异步一对（沿用 5.0.0 裁决）。
- UM-3：`EMOptions.h` 注释声明两个证书名「只能在 `initializeSDKWithOptions` 时设置」，而 1.21.0 现存的 `updatePushConfig` iOS 路径（native `EMClient.mm:1885` 的 `registerForRemoteNotificationsWithCertName:`）会在运行时写 `apnsCertName`，与之冲突。用户已裁决：**不改旧路径、不引入优先级逻辑**，冲突写进文档。
- UM-4：1.21.0 的 `ChatPushConfig.deviceId` 在 iOS 上承担 APNs 证书名语义，与新增 `ChatOptions.apnsCertName` 语义重叠。不合并、不改名（兼容性要求），两个入口并存，文档各自说明。
- UM-5：PushKit 普通推送 token 只有绑定没有解绑（1.21.0 由 `updatePushConfig` 承担绑定），PushKit 绑定/解绑成对。两者是独立能力，不合并入口（沿用 5.0.0 结论）。

## 3. 跨端契约

| 契约要素 | 取值 | 落点 |
| --- | --- | --- |
| 初始化选项 key | `apnsCertName`、`pushKitCertName`（顶层，可选） | TS `ChatOptions` → iOS `ExtSdkToJson.m` 的 `EMOptions (Json)` `fromJson`/`toJson`；Android 无对应 native 能力，不做映射 |
| 方法名 key | `bindPushKitToken` / `unbindPushKitToken` | `src/__internal__/Consts.ts`、`modules/java/com/chatsdk/common/ExtSdkMethodType.java`、`modules/objc/common/ExtSdkMethodTypeObjc.h` + `.m`、`modules/cpp/common/ExtSdkMethodType.{h,cpp}`（仓库规范） |
| 路由注册 | iOS wrapper 实现并 dispatch；Android 注册同名路由返回 `EMError.OPERATION_UNSUPPORTED`(111) | `modules/objc/dispatch/ExtSdkDispatch.m`、`modules/java/com/chatsdk/dispatch/ExtSdkDispatch.java` |
| 请求参数 key | `bindPushKitToken`：`deviceToken`（`NSString`，十六进制字符串，native 侧转 `NSData`）；`unbindPushKitToken`：无参数 | TS 组装 / iOS wrapper 读取 |
| 返回结构 | `onResult` 包装为 `{<方法名>: nil}`，TS 只取错误 | 与 `updatePushConfig`（payload 为 nil）一致 |
| 非 iOS 行为 | TS 侧 `Platform.OS !== 'ios'` 守卫，静默 no-op | `src/ChatClient.ts` |
| TS 公开签名 | `ChatClient.bindPushKitToken(params: { deviceToken: string }): Promise<void>`、`ChatClient.unbindPushKitToken(): Promise<void>` | 与 5.0.0 一致（方法名与参数形态逐字对齐，便于跨版本迁移） |

## 4. 原生行为依据（决定 API 形态的关键证据）

证据取自 `/Users/asterisk/Codes/zuoyu_native/emclient-ios` tag `4.24.2`（RN 1.21.0 声明的 iOS 依赖为 `~> 4.25.0`，两版本相关头文件逐字一致）：

- 绑定时读取初始化选项上的证书名：`EMClient.mm:1608`（`pushKitCertName` 为空 → `EMErrorUserIllegalArgument`）、`1620`（以 `options.pushKitCertName` 调 `bindUserDeviceToken`）；`1665`（`apnsCertName` 为空 → 同样报错）、`1680`（绑定）。
- PushKit 解绑同样读取该属性：`EMClient.mm:1794`。
- PushKit token 先入 keychain 再绑定：`EMClient.mm:1611`（读 `kBindPushKitToken`）；未登录时 `1601` 返回 `EMErrorUserNotLogin`，token 留在 keychain，登录成功后自动重绑。
- 旧 APNs 路径会在运行时改写证书名：`EMClient.mm:1885`（`registerForRemoteNotificationsWithCertName:` 内 `self.options.apnsCertName = aCertName`），与 `EMOptions.h:278` 的「仅初始化可设置」注释冲突；1.21.0 的 `updatePushConfig` 正走该路径，本次保留不动（UM-3 / D-1）。
- 结论：PushKit 绑定**必须**在初始化时下发 `pushKitCertName`，否则 native 直接返回参数非法错误 —— 这决定了 `ChatOptions.pushKitCertName` 是 `bindPushKitToken` 可用的前置条件，两者必须同批交付。
