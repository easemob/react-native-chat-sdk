# 5.0.0 补充：iOS PushKit（VoIP 推送）与推送配置收敛

范围：`01-api-diff.md` ~ `04-verification.md` 与 `acceptance-report.md` 之外的**遗漏项补齐**。

PushKit 是 iOS 原生 SDK 长期存在的公开能力，不在 4.24.1 → 5.0.0 的版本 diff 区间内，历次平版均未覆盖；此外本次一并把 iOS 推送证书名收敛为**初始化配置**，并用 `bindDeviceToken` 取代 `updatePushConfig`。因此单列本文档。

## 1. 结论

- 5.0.0 分支此前**没有** PushKit 能力：TypeScript、iOS wrapper、Android wrapper 全链路无 `PushKit` / `pushKitCertName`（`git grep -i pushkit` 命中 0）。
- 本次只在 **5.0.0 分支**补齐 iOS 专用公开 API，并把两个 iOS 证书名改为初始化配置、移除 `pushConfig` / `ChatPushConfig` / `updatePushConfig`。
- iOS 原生侧能力完整（HyphenateChat 5.0.0 头文件与实现均有），本次不改 native。
- 参考实现：Flutter 仓库 `im_flutter_sdk` 5.0.0 分支 commit `41d2cf17`（同一批改动）。

## 2. 变更清单（native → React Native）

| id | 类型 | 领域 | iOS native 签名（HyphenateChat 5.0.0） | Android native | RN 决策 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `pushkit_cert_name` | existing_option | push | `@property(nonatomic, copy) NSString *pushKitCertName`（`EMOptions.h`） | 无（iOS 专有） | include → `ChatOptions.pushKitCertName`（初始化时下发，运行时不修改） | implemented |
| `apns_cert_name` | existing_option | push | `@property(nonatomic, copy) NSString *apnsCertName`（`EMOptions.h`） | 无（iOS 专有） | include → `ChatOptions.apnsCertName`（初始化时下发）；同时移除 iOS wrapper 在绑定时写 `options.apnsCertName` 的旧路径 | implemented |
| `pushkit_register` | existing_api | push | `- (void)registerPushKitToken:(NSData *)aPushToken completion:(void (^)(EMError *))aCompletionBlock` | 无（iOS 专有） | include → `ChatClient.bindPushKitToken({ deviceToken })`；Android 注册同名路由并返回 `EMError.OPERATION_UNSUPPORTED`（TS 非 iOS 不下发） | implemented |
| `pushkit_unregister` | existing_api | push | `- (void)unRegisterPushKitTokenWithCompletion:(void (^)(EMError *))aCompletionBlock` | 无（iOS 专有） | include → `ChatClient.unbindPushKitToken()`；Android 同上 | implemented |
| `pushkit_bind_sync` | existing_api | push | `- (EMError *)bindPushKitToken:(NSData *)aPushToken` | 无（iOS 专有） | skip（同步变体不单独暴露：TS 层本身即 Promise，暴露会产生两个语义完全相同的 API） | skip |
| `pushkit_unbind_sync` | existing_api | push | `- (EMError *)unBindPushKitToken` | 无（iOS 专有） | skip（同上） | skip |
| `device_token_notifier_name` | signature_change | push | `EMPushManager`：绑定 token 只读 `options.apnsCertName` | `EMPushManager.bindDeviceToken(String notifierName, String deviceToken, EMCallBack)`（`notifierName` 非空校验，空则参数非法） | `ChatClient.bindDeviceToken({ deviceToken, notifierName? })`：参数改为可选，iOS 忽略，Android 必填 | implemented |
| `push_config_removed` | removed_option | push | — | — | 移除 `ChatOptions.pushConfig` 与 `ChatPushConfig` 类；iOS `ExtSdkToJson` 的 `EMOptions` 映射、Android `ExtSdkOptionsHelper` 的 `EMPushConfig` 构建分支一并删除 | implemented |
| `update_push_config_removed` | removed_api | push | `registerForRemoteNotificationsWithCertName:deviceToken:completion:`（旧路径） | `EMPushManager.bindDeviceToken` | 移除 `ChatClient.updatePushConfig`，改用 `ChatClient.bindDeviceToken` | implemented |
| `android_vendor_push_init` | behavior_change | push | — | — | 移除 `ChatOptions.pushConfig` 后，Android 厂商推送依赖、manifest 与 `EMPushConfig` 初始化责任转移到原生工程侧 | implemented |
| `ios_renew_token_dispatch` | bug_fix | client | `- (void)renewToken:completion:` | `EMClient.renewToken(token, EMCallBack)` | 补上 iOS `ExtSdkMethodKeyRenewTokenValue` 的 dispatch 分支（此前落到 default，返回 `not implement: renewToken`） | implemented |

未匹配清单：

- UM-1：Android 端无 PushKit 能力。用户已确认「仅 iOS 支持，非 iOS 调用静默 no-op」。
- UM-2：native 4 个 PushKit 方法为语义相同的同步/异步两对。用户已确认「只暴露异步一对」。
- UM-3：`EMOptions.h` 注释称 `pushKitCertName` / `apnsCertName`「只能在 `initializeSDKWithOptions` 时设置」，而 `registerForRemoteNotificationsWithCertName:`（`EMClient.mm:1780`）会在运行时写入 `apnsCertName`。本次按注释语义实施（仅初始化设置、运行时不修改），并弃用该旧路径，注释修订属 native 侧事项。
- UM-4：`notifierName` 在两端同名不同义（iOS 曾是证书名、Android 是厂商凭据）。通过「改为可选 + 平台语义注释」收敛，不引入双路径。
- UM-5：普通推送 token 只有绑定、没有解绑（`bindDeviceToken`），PushKit 绑定/解绑成对。两者是独立能力，不合并入口。

## 3. 跨端契约

| 契约要素 | 取值 | 落点 |
| --- | --- | --- |
| 初始化选项 key | `apnsCertName`、`pushKitCertName`（顶层，可选） | TS `ChatOptions` / iOS `ExtSdkToJson` 的 `EMOptions (Json)` |
| 方法名 key | `bindDeviceToken` / `bindPushKitToken` / `unbindPushKitToken` | `Consts.ts` / `ExtSdkMethodTypeObjc.h` / `ExtSdkMethodType.java` / `ExtSdkMethodType.h` |
| 路由注册 | iOS wrapper 实现；Android wrapper 注册 PushKit 同名路由并返回 `EMError.OPERATION_UNSUPPORTED`(111) | `ExtSdkDispatch.m` / `ExtSdkDispatch.java` |
| 请求参数 key | `bindDeviceToken`：`deviceToken` + `notifierName`（可选，iOS 忽略，空串照传）；`bindPushKitToken`：`deviceToken`（十六进制字符串） | TS 组装 / iOS、Android 读取 |
| 返回结构 | `onResult` 包装为 `{<方法名>: nil}`，TS 只取错误 | 与 `updatePushConfig` 等 object 为 nil 的路由一致 |
| 非 iOS 行为 | TS 侧 `Platform.OS !== 'ios'` 守卫，静默 no-op | `src/ChatClient.ts` |

## 4. 原生行为依据（决定 API 形态的关键证据）

证据取自本地 `emclient-ios` 仓库 tag `5.0.0`（`git archive 5.0.0` 解出，与 `HyphenateChat` 5.0.0 发布头文件同源）：

- 绑定时读取证书名：`EMClient.mm:1503`（`pushKitCertName` 为空 → `EMErrorUserIllegalArgument`）、`1515`（绑定）；`1560`（`apnsCertName` 为空 → 同样报错）、`1575`（绑定）。
- 解绑时同样读取该属性：`EMClient.mm:1689`。
- 登录后自动重绑：`EMClient.mm:1096-1097` 登录成功后自动 `_bindDeviceToken:NO` + `_bindPushKitToken`，失败按退避重试（`1413`/`1435`）。
- 登出自动解绑：`EMClient.mm:1331` —— `logout(YES)` 已同时调用 `unBindPushKitToken`。
- token 先入 keychain 再绑定：`EMClient.mm:1649`（写入 `kBindPushKitToken`）、`1508`（绑定时读取）。
- 旧 APNs 路径会在运行时改写证书名：`EMClient.mm:1780`（`registerForRemoteNotificationsWithCertName:` 内 `self.options.apnsCertName = aCertName`），与 `EMOptions.h:276` 的「仅初始化可设置」注释冲突；`bindFCMToken:`（`1787`）只读取 `options.apnsCertName`，因此证书名必须在初始化时下发。
- 结论：证书名只要在绑定之前存在于 `options` 上即可生效。原实现的运行期赋值虽然可用，但与 `EMOptions.h` 契约冲突，且留下「证书名可能被后续 bind 调用覆盖」的隐患；本次统一改为初始化下发，绑定链路只读不写。

## 5. 实现落点

| 层 | 文件 | 改动 |
| --- | --- | --- |
| TS 选项 | `src/common/ChatOptions.ts` | 新增 `apnsCertName` / `pushKitCertName`（iOS 专用注释 + 可选字段）：类字段、私有构造函数参数、赋值与两个静态工厂全部打通；删除 `pushConfig` 字段与其类型引用 |
| TS 类型 | `src/common/ChatPushConfig.ts` | 删除 `ChatPushConfig` 类（保留 `ChatPushDisplayStyle`、`ChatPushOption`）及其 `Platform` 依赖 |
| TS API | `src/ChatClient.ts` | 新增 `bindDeviceToken({ deviceToken, notifierName? })`；`bindPushKitToken` 去掉 `notifierName` 参数；删除 `updatePushConfig` |
| TS 常量 | `src/__internal__/Consts.ts` | 新增 `MTbindDeviceToken`；删除 `MTupdatePushConfig`；PushKit 两个常量保留 |
| iOS 选项 | `modules/objc/dispatch/ExtSdkToJson.m` | `EMOptions` 的 `fromJsonObject` 读取 `apnsCertName` / `pushKitCertName` 写入 `EMOptions`，`toJsonObject` 回读补上这两个 key；删除 `pushConfig.deviceId` → `apnsCertName` 的旧映射 |
| iOS 常量 | `modules/objc/common/ExtSdkMethodTypeObjc.h/.m` | 客户端段新增 `bindDeviceToken`（value 118）与 PushKit（value 119/120），删除 `updatePushConfig`（key + value + methodMap 条目） |
| iOS 路由 | `modules/objc/dispatch/ExtSdkDispatch.m` | `updatePushConfig` 分支替换为 `bindDeviceToken`；补上此前缺失的 `renewToken` 分支 |
| iOS 实现 | `modules/objc/dispatch/ExtSdkClientWrapper.h/.m`、`modules/objc/rn/ExtSdkApiObjcRN.mm` | `bindDeviceToken` 改为调用 `bindFCMToken:completion:` 且不再写 `options.apnsCertName`；`bindPushKitToken` 不再写 `options.pushKitCertName`；新增两个 PushKit 路由；`supportedEvents` 列表同步增删 |
| Android | `modules/java/.../ExtSdkMethodType.java`、`ExtSdkDispatch.java`、`ExtSdkClientWrapper.java`、`ExtSdkHelper.java` | 常量与路由由 `updatePushConfig` 换为 `bindDeviceToken`；新增两条 PushKit 路由返回 `EMError.OPERATION_UNSUPPORTED`；删除 `ExtSdkOptionsHelper.fromJson` 中读取 `pushConfig` 构建 `EMPushConfig` 的分支与不再使用的 import |
| C++ | `modules/cpp/common/ExtSdkMethodType.h/.cpp` | 新增 `bindDeviceToken`、PushKit 两个常量（与 TS/Java/ObjC 同步） |
| 契约测试 | `src/__tests__/contract/{parsers.ts,methodNames.test.ts}` | 新增「methodMap 中每个非事件 key 必须有 dispatch 分支」检查，防止 `renewToken` 同类漏接回归 |
| example | `example/src/registry/apis/client.ts`、`example/src/auto/auto_mode.ts` | API 测试页新增 `ChatClient.bindDeviceToken`、修正 PushKit 条目参数；`CHAT_OPTIONS_KEYS` 用 `apnsCertName`/`pushKitCertName` 替换 `pushConfig` |

实现说明：

- **token 传参**：TS 传十六进制字符串，iOS 侧沿用既有 APNs 路径（`bindFCMToken:`）的方式把字符串交给原生 `_extractTokenFromRawData:`（`EMClient.mm:1360`，同时兼容 `NSData` 与 `NSString`，后者会去掉 `<>` 与空格）。未在 wrapper 内做 hex → `NSData` 转换，以避免走 `NSData` 分支的固定 8×4 字节读取。
- **未添加上层判空**：证书名为空由原生返回 `EMErrorUserIllegalArgument`，与既有 `bindDeviceToken` 行为一致，不擅自在上层加过滤。`notifierName` 省略时按空串下发，由原生报参数非法错误。
- **行为变更**：iOS 上 `bindDeviceToken` 不再影响 `options.apnsCertName`；Android 上厂商推送不再由 SDK 初始化。仅依赖旧写法的应用升级后必须改用 `ChatOptions` 与原生工程配置，否则推送不可用。该变更已写入 CHANGELOG 的 Breaking Changes 与迁移指南。
- **renewToken 修复**：`ExtSdkDispatch.m` 此前没有 `ExtSdkMethodKeyRenewTokenValue` 分支，iOS 调用 `ChatClient.renewToken` 会返回 `not implement: renewToken`（Android 正常）；本次补齐并加入契约测试防护。

## 6. 文档更新

- `CHANGELOG.md` / `CHANGELOG.zh.md`：Breaking Changes 新增「推送配置」小节（`pushConfig`/`ChatPushConfig`/`updatePushConfig` 移除、证书名改为初始化配置、Android 厂商初始化转移）；New Features 新增 `apnsCertName`/`pushKitCertName`、`bindDeviceToken`、PushKit 接口条目。
- `docs/5.0.0-migration-guide/2026-09-23-rn-4.x-to-5.0.0-migration-guide.md`：新增「推送与设备 Token」整节（4.x 对照表、两处 warning、示例、PushKit 小节）；「其他删除的 API」「有替代方式的 API」「主要新增 API」三张表补充条目；「行为变化」新增 13~15 条；迁移检查清单新增推送、iOS 证书名、Android 厂商推送与 VoIP 四项。
- `docs/push.md`：重写为「初始化配置证书名 + 运行时绑定 token + VoIP 推送」三段式，并说明 Android 厂商推送的工程侧责任。

## 7. 验证记录

| 验证项 | 命令 | 结果 |
| --- | --- | --- |
| TypeScript 类型检查 | `yarn typecheck` | ✅ 0 错误 |
| example 类型检查 | `npx tsc -p example/tsconfig.json` | ✅ 0 错误 |
| Lint | `yarn lint` | ✅ 通过 |
| 单元 + 契约测试 | `yarn test --no-watchman` | ✅ 19 suites / 117 tests（含新增的 dispatch 分支检查） |
| 循环依赖 | `yarn check:circular:dpdm` | ✅ 无循环依赖 |
| 三端方法名 key 比对 | `grep` TS / ObjC header+methodMap / Java / cpp | ✅ `bindDeviceToken`、`bindPushKitToken`、`unbindPushKitToken` 四处一致；`updatePushConfig` 已无残留 |
| 初始化选项 key 比对 | TS `ChatOptions` ↔ `ExtSdkToJson` | ✅ `apnsCertName` / `pushKitCertName` 两处 key 一致 |
| 运行期赋值残留检查 | `grep -n "options.apnsCertName\s*=\|options.pushKitCertName\s*=" modules/objc` | ✅ 无残留（仅 `ExtSdkToJson` 在初始化时赋值） |
| iOS 语法编译 | `xcrun --sdk iphoneos clang -fsyntax-only`（HyphenateChat 5.0.0 头文件 + RN 头文件 shim） | ✅ `ExtSdkClientWrapper.m`、`ExtSdkDispatch.m`、`ExtSdkMethodTypeObjc.m`、`ExtSdkToJson.m` 0 error / 0 warning；`ExtSdkApiObjcRN.mm` 0 error（1 个既有格式化告警，与本改动无关） |
| Android 编译 | `javac`（`hyphenate-chat-5.0.0.aar` + `android.jar` + androidx annotation）编译 `modules/java/{common,dispatch}` | ✅ 0 error；`javap` 确认 `bindDeviceToken` / `bindPushKitToken` / `unbindPushKitToken` 存在、`updatePushConfig` 已移除 |
| porting gate | `echo '{}' \| bash .agents/skills/platform-sdk-porting-v2/hooks/porting_guard.sh gate react-native <repo>` | ✅ 无输出（无问题） |
| 端到端 VoIP 推送 | 需真机 + PushKit 证书 + 应用侧 `PKPushRegistry` | ⏭️ 当前环境不具备（example 无 `PKPushRegistry`，无法产生真实 PushKit token） |
| 真机推送绑定 | 需真机 + 推送证书 + 厂商推送 token | ⏭️ 未执行（example 无推送 token 来源） |

## 8. 待用户决策

1. **发布版本号**：改动落在 5.0.0 分支，包版本仍为 `5.0.0`。随 5.0.0 发布，还是另开 5.0.1？（影响 CHANGELOG 版本头与代码内 `// 5.0.0` 注释）
2. **`bindPushKitToken` 参数形态**：当前保留对象参数 `{ deviceToken }`（与 Flutter 的具名参数对齐）。若希望改为位置参数 `bindPushKitToken(deviceToken)`，需同步调整 example 与文档。
3. **native 注释**：是否在 emclient-ios 侧修正 `EMOptions.h` 中 `apnsCertName` / `pushKitCertName` 的「仅初始化可设置」注释与 `registerForRemoteNotificationsWithCertName:` 运行期赋值的差异。
4. **Android 厂商推送初始化入口**：本次按 Flutter 5.0.0 的做法完全移除 SDK 侧入口，业务需在原生工程配置。若需要保留 JS 侧初始化能力，需要重新设计 `ChatOptions` 字段。
