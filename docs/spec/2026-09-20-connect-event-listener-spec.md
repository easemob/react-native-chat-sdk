# 连接事件监听器收敛设计说明(ChatConnectEventListener)

- 日期：2026-09-20
- 分支/版本：5.0.0(worktree `.worktree/5.0.0`，依赖原生 SDK iOS/Android 5.0.0)
- 状态：已实现(随 5.0.0 发布,属 breaking change)；2026-09-21 有语义修订,见 §7
- 关联:`docs/porting/5.0.0/02-contract.md` §4.1 末尾"连接事件收敛"裁决记录

## 1. 背景与问题

4.x 时代的 `ChatConnectEventListener` 中,除 `onConnected` 外,服务器强制下线被拆成 8 个独立回调:

`onAppActiveNumberReachLimit`、`onUserDidLoginFromOtherDeviceWithInfo`、`onUserDidRemoveFromServer`、`onUserDidForbidByServer`、`onUserDidChangePassword`、`onUserDidLoginTooManyDevice`、`onUserKickedByOtherDevice`、`onUserAuthenticationFailed`,外加一个无参数的 `onDisconnected`。

问题:

1. **与底层模型不同构**:Android 原生 `EMConnectionListener` 只有一个 `onDisconnected(int errorCode)`(外加 `onLogout(int, EMLoginExtensionInfo)`),8 个回调是 wrapper 层手工拆码人造的;iOS 5.0.0 也已把多数原因收敛进 `userAccountDidForcedToLogout:(EMError *)`。
2. **维护成本高**:每增删一个断开原因要动 6 处(Consts.ts、ChatClient 订阅、ChatClient handler、ChatEvents 接口、Java wrapper、ObjC wrapper),加契约测试豁免名单。
3. **跨端行为不一致**:iOS 强制下线时会同时发 `onDisconnected` + 具体事件,Android 只发具体事件。
4. 仓库内已有相反哲学的成功先例:`ChatMultiDeviceEventListener` 用"一个回调 + 事件枚举参数"承载几十种多设备事件。

## 2. 原生侧事实核查(源码/头文件级)

Android 依据 `hyphenate-chat-5.0.0-sources.jar` 中 `EMClient.MyConnectionListener.onDisconnected(int, EMALogoutInfo)` 的真实分发逻辑;iOS 依据 vendored 5.0.0 头文件(`example/ios/Pods/.../Headers/`)。

| 码 | 含义 | Android 5.0.0 通道 | iOS 5.0.0 通道 |
| --- | --- | --- | --- |
| 2 `NETWORK_ERROR` | 网络错误 | `onDisconnected(2)`(注册监听时若未连接会补发一次) | 无码,仅 `connectionStateDidChange(NO)` |
| 8 `APP_ACTIVE_NUMBER_REACH_LIMITATION` | DAU/MAU 达上限 | `onDisconnected` + `onLogout` 双发 | **无通道**(delegate 已删) |
| 108/109 | token 已/将过期 | 仅 `onTokenExpired/onTokenWillExpire`,**不伴随断开事件**,但会本地登出 | 同左 |
| 202 `USER_AUTHENTICATION_FAILED` | 认证失败 | **无生产者**(token-only 登录后只走 login 回调) | `ForcedToLogout` 文档未列出,存疑 |
| 206 `USER_LOGIN_ANOTHER_DEVICE` | 他端登录 | `onDisconnected` + `onLogout` **双发**(info 仅此码有值) | 独立 delegate,info 为 `_Nullable` |
| 207 `USER_REMOVED` | 账号被删除 | 双发 | 独立 delegate |
| 213 `USER_BIND_ANOTHER_DEVICE` | 已绑定其他设备 | 双发(4.x wrapper 漏映射) | 无通道 |
| 214 `USER_LOGIN_TOO_MANY_DEVICES` | 登录设备过多 | 双发 | `ForcedToLogout` |
| 216 `USER_KICKED_BY_CHANGE_PASSWORD` | 密码已修改 | 双发 | `ForcedToLogout` |
| 217 `USER_KICKED_BY_OTHER_DEVICE` | 被他端踢下线 | 双发 | `ForcedToLogout` |
| 220 `USER_DEVICE_CHANGED` | 登录设备变更需重新登录 | 双发(4.x wrapper 漏映射) | 无通道 |
| 305 `SERVER_SERVICE_RESTRICTED` | app 被服务器禁用(双端官网口径一致) | 双发 | `userDidForbidByServer`(无码,需合成) |

关键结论:

- Android 的 `onDisconnected(int)` 对**所有码无条件触发**;`onLogout` 仅对 8/206/207/213/214/216/217/220/305 九个码额外触发。206 两个回调都发,跳过 `onDisconnected(206)` 是必需的。
- `onUserAuthenticationFailed`(202)在 5.0.0 双端都接近死代码。
- 旧实现 bug:Android `onLogout` 不过滤 206,导致每次强制下线都多发一个空参数的 `onUserDidLoginFromOtherDeviceWithInfo`;iOS `LoginFromOtherDeviceWithInfo` 的 `_Nullable` info 直接塞字典字面量,有 `NSInvalidArgumentException` 崩溃隐患。

## 3. 设计决策

统一为带错误码的单回调(用户裁决,2026-09-20):

```ts
export enum ChatDisconnectErrorCode {
  NETWORK_ERROR = 2,                    // 仅 Android;iOS 网络断开无码
  APP_ACTIVE_NUMBER_REACH_LIMIT = 8,    // 仅 Android
  USER_AUTHENTICATION_FAILED = 202,     // 保留码位;5.0.0 双端基本无触发源
  USER_LOGIN_FROM_OTHER_DEVICE = 206,   // 唯一带 info 的码
  USER_REMOVED_FROM_SERVER = 207,
  USER_BIND_ANOTHER_DEVICE = 213,       // 仅 Android
  USER_LOGIN_TOO_MANY_DEVICES = 214,
  USER_KICKED_BY_CHANGE_PASSWORD = 216,
  USER_KICKED_BY_OTHER_DEVICE = 217,
  USER_DEVICE_CHANGED = 220,            // 仅 Android
  SERVER_SERVICE_RESTRICTED = 305,      // app 被服务器禁用
}

export interface ChatConnectEventListener {
  onConnected?(): void;
  onDisconnected?(errorCode?: number, info?: { deviceName?: string; ext?: string }): void;
  // onTokenWillExpire / onTokenDidExpire / onOfflineMessageSync* / onDataSync* / onDatabaseOpened 保持不变
}
```

语义约定(写入 JSDoc):

- 无 `errorCode` 或为 `NETWORK_ERROR`:网络波动断开,SDK 自动重连,用户保持登录态。
- 其余 `errorCode`:被服务器强制下线,需重新登录。
- token 过期导致的登出**不**触发 `onDisconnected`,仅触发 `onTokenDidExpire`——只监听断开回调会漏掉该场景,文档已点明。
- 枚举值与原生 `EMError` 数值一致,未来新增断开原因只需加枚举成员 + 注释,无需动接线。

## 4. 实现规格

### 4.1 事件契约

- 唯一 MT key:`onDisconnected`;负载 `{errorCode?: number, deviceName?: string, ext?: string}`,`deviceName`/`ext` 仅 206 携带。
- 被删的 8 个 MT 常量在 TS(`Consts.ts`)/ Java(`ExtSdkMethodType.java`)/ ObjC(`ExtSdkMethodTypeObjc.h/.m` 含 Value 映射)三层同步删除,含双端 dispatch 的 "no implement" stub 与 `ExtSdkApiObjcRN.mm` 的 `supportedEvents`。
- C++ 层(`modules/cpp`)本就不含这些事件常量,无需变更。

### 4.2 TS 层(`src/`)

- `ChatEvents.ts`:新增 `ChatDisconnectErrorCode` 枚举;接口删除 8 个回调,`onDisconnected` 改为 `(errorCode?, info?)`。
- `ChatClient.ts`:删除 8 段订阅与 8 个转发 handler;`onDisconnected` 解析负载,仅当 `deviceName`/`ext` 存在时组装 `info`。

### 4.3 Android(`modules/java/`)

- `onDisconnected(int)`:206 跳过(由 `onLogout` 合并设备信息后发同一事件),其余码直接透传 `{errorCode}`。
- `onLogout(int, EMLoginExtensionInfo)`:仅处理 206,发 `{errorCode, deviceName, ext}`;其余码忽略(已由 `onDisconnected(int)` 送达)。修复旧版双发 bug。
- 魔法数字改为 `EMError.USER_LOGIN_ANOTHER_DEVICE` 常量引用。

### 4.4 iOS(`modules/objc/`)

- 新增内部方法 `emitDisconnectedWithCode:params:`:组装 `{errorCode[, deviceName, ext]}` 发 `onDisconnected`,并置 `forcedLogoutPending = YES`。
- `userAccountDidForcedToLogout:` 透传 `aError.code`(含 nil 保护);`userAccountDidRemoveFromServer` → 207;`userDidForbidByServer` → 305(`EMErrorServerServingForbidden`);`userAccountDidLoginFromOtherDeviceWithInfo:` → 206 + info(逐字段 nil 保护,修崩溃隐患)。
- `connectionStateDidChange:`:连接成功复位 `forcedLogoutPending` 并发 `onConnected`;断开时若 `forcedLogoutPending` 置位则吞掉一次(强制下线后 SDK 拆除连接会重复触发),否则发无码 `onDisconnected`。

## 5. 测试与验证

- 单元测试(`src/__tests__/unit/ChatClient.events.test.ts`)新增 3 条:错误码透传、206 携带设备信息、网络断开无码;契约测试(三层方法名/事件名一致性、事件接线完整性)随常量同步删除自动通过。
- 本地已验证:`yarn typecheck`、`yarn lint`、`yarn test`(19 套件 115 用例)全绿。
- example(`example/src/listeners.ts` 的 `CONNECT_METHODS`)已同步删减。
- **遗留运行时验证项**(native wrapper 无自动化覆盖,按仓库规则需真机实测后推送):
  1. iOS 强制下线时 `connectionStateDidChange(NO)` 是否真的伴随触发(决定 `forcedLogoutPending` 防御是否必需/充分);
  2. iOS `userAccountDidForcedToLogout:` 实际下发的码集合(头文件文档不完整)。

## 6. 迁移说明(breaking)

使用方删除 8 个回调的实现,改为在 `onDisconnected` 中按 `errorCode` 分支处理;需要"他端登录"设备信息时判断 `errorCode === ChatDisconnectErrorCode.USER_LOGIN_FROM_OTHER_DEVICE` 并读取 `info`。详见 `CHANGELOG.md` / `CHANGELOG.zh.md` 5.0.0 节。

## 7. 修订(2026-09-21):补全断开码、修正语义规则

依据 native 5.0.0 源码复查(emclient-linux `src/emsessionmanager.cpp:755-933`、emclient-ios `newSDK/HyphenateSDK/EMConnectionListener.mm:31-58`、emclient-android `hyphenatechatsdk/src/com/hyphenate/chat/EMClient.java:1661-1773`),并对齐 Flutter 侧同主题规格(`im_flutter_sdk` `docs/spec/2026-09-21-connection-event-normalization-spec.md`),对 §2/§3 做如下修正:

### 7.1 断开码补全

`ChatDisconnectErrorCode` 由 11 个码扩充为断开路径全量 19 个码(值与 native `EMError` 一致):

- 退出原因(本地登录态失效,需重新登录):8、104、110、202、204、206、207、213、214、216、217、220、304、305。其中 **104/110/204 为本次新增**——core 已对这几个码执行登出,Android 以 `onDisconnected(code)` 送达(无 `onLogout`),iOS 折算为无码断开。
- 连接原因(保持登录态,SDK 自动重连):2、4、300、303、306。其中 **4/300/303/306 为本次新增**——Android 弱网下的常见断开码是 300/303 而非 2。
- 108(token 过期)仍只走 `onTokenDidExpire`,不属于断开事件,不收录。

§2 表格的错误更正:

- 8 在 iOS **有通道**:`userAccountDidForcedToLogout:` 的 `aError.code` 可为 8(原表"无通道"依据的是 delegate 删除,但 forcedToLogout 的透传码覆盖了它)。
- 202 双端**均有真实触发源**:iOS `forcedToLogout(202)`;Android `doReconnect()` 刷新 token 失败时以 202 断开并登出(原表"无生产者"不成立)。
- 213 在 iOS 已登出但只表现为无码断开;220 在 iOS 与 206 共用 `userAccountDidLoginFromOtherDeviceWithInfo:`,无法区分。
- iOS `connectionStateDidChange:` 断开不携带任何原因码,因此 iOS 上 104/110/204/213 这类"静默登出"与普通网络断开无法从事件区分——这是平台限制,接入侧如需确认登录态,以后续 API 的未登录错误兜底。

### 7.2 语义规则修正

§3 的"其余 `errorCode` 均为强制下线"规则**作废**,替换为:

- `errorCode` 原样透传,SDK 不过滤;枚举仅供阅读与比较,**未列出的码(含 native 未来新增)也会原样送达**。
- 按 §7.1 的两组划分处理:退出原因回登录页;连接原因等自动重连。
- 未列出的码默认按连接原因处理,除非 native SDK 另有说明。
- 无 `errorCode` 表示平台未提供原因(如 iOS 网络断开、App 切后台),按连接事件处理,不得据此判定退出。
- 退出共有两个事件通道:`onDisconnected`(退出原因码)与 `onTokenDidExpire`(token 过期),接入方必须两个都处理。

### 7.3 平台可达性注释的取舍

原枚举注释中"8/213/220 仅 Android 可达"的标注删除(8 在 iOS 可达,见 §7.1;跨端可达性会随平台版本漂移,以实际收到的码为准)。仅保留 2 的平台差异说明(iOS 网络断开无码),它影响"无码即网络断开"的解读。

### 7.4 接线不变

本次修订只改 TS 枚举、文档与单测;Android wrapper(`onDisconnected(int)` 透传 + `onLogout` 合并 206)与 iOS wrapper(`forcedToLogout` 透传 `aError.code`、固定折算 206/207/305、无码断开)原本就是透传/折算设计,新增码自动生效,无需改动。
