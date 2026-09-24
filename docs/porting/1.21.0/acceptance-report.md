# 验收报告：React Native 1.21.0（native 4.24.1 → 4.25.0 平版）

- 目标仓库：`react-native-chat-sdk`，worktree `.worktree/1.21.0`，分支 `1.21.0`（基于 `dev` @ 3d8f454）
- 目标平台版本号：1.21.0（用户指定）；改动已提交至分支 `1.21.0`
- 全量变更清单见 [01-api-diff.md](01-api-diff.md)；契约见 [02-contract.md](02-contract.md)；实现明细见 [03-implementation.md](03-implementation.md)；验证证据见 [04-verification.md](04-verification.md)
- 先例：Flutter 4.25.0 平版已评审闭环，本次沿用其全部结论（`useAgoraChatDomain` 不移植、`autoLoadConversations` 衍生新增）

## 二维对照表

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
|---|---|---|---|---|---|---|
| `fetchConversationsFromDB`（本地会话分页加载） | `getConversationsFromDBWithCursor:pageSize:completion:` | `asyncGetConversationsFromDB(cursor, pageSize, callback)` | 已实现（`ChatManager.fetchConversationsFromDB`） | 已实现 | 已实现 | ✅ |
| `enableChatroomConversation`（聊天室消息建会话） | `EMOptions.enableChatroomConversation` | `set/isEnableChatroomConversation` | 已实现（默认 false） | 已实现 | 已实现 | ✅ |
| `autoLoadConversations`（衍生新增，UM-2） | `EMOptions.autoLoadConversations`（4.24.1 已有） | `set/isAutoLoadAllConversations`（4.24.1 已有） | 已实现（默认 true，文档强调分页前须关闭及原因） | 已实现 | 已实现 | ✅（沿用 Flutter 评审结论） |
| ~~`useAgoraChatDomain`~~ | 裸 `BOOL` 无文档 | `Boolean` 三态 + `@hide` | **不移植**（KI-107 对内品牌开关） | 不移植 | 不移植 | ✅ 已闭环，grep 零残留 |
| `syncDataWSHost/Port`、`SyncDataWebSocketServer/Port` 移除 | 已删 | 已删 | 从未暴露，无操作 | - | - | ✅ skip（全仓 grep 实证无引用） |
| 搜索关键词上限注释（512→120） | - | 仅注释 | RN 注释未写上限，无操作 | - | - | ✅ skip |
| `fetchSubscribedUsers` gender bugfix | 实现层修复 | - | RN `ChatUserInfo.gender` 已有，反序列化不受影响 | - | - | ✅ 无操作 |
| token NTP 校正时间、cloud 超时单位 | 内部实现 | 内部实现 | N/A | - | - | ✅ 不平版 |

## 验证摘要

- `yarn typecheck` / `lint` / `check:circular:dpdm` / `test --no-watchman`（19 suites、121 tests，含契约测试）全过；`yarn prepare`（bob build）通过。
- example 双端构建通过（本地依赖覆盖模式）：Android bundle 含本地 so；iOS `.app/Frameworks/` 为本地 `HyphenateChat.framework 4.25.0` + `aosl.framework`，Podfile.lock 无 HyphenateChat。
- 实机回归双端通过（2026-09-10，真实账号，各 5 步）：init 注入 `autoLoadConversations:false` + login + 分页/翻页 + 无效 cursor（110）全部符合预期，证据见 04-verification.md。
- 契约要素 grep 逐字抽查通过；本地依赖已还原零残留，远程依赖声明保持 4.25.0。

## 未匹配清单

| id | 疑点 | 状态 |
|---|---|---|
| UM-1 | `useAgoraChatDomain` 双端形态差异 | ✅ 已闭环（KI-107，不移植） |
| UM-2 | 新 API 前置条件 `autoLoadConversations=false` 在 RN 基线无入口 | ✅ 已闭环（衍生新增，沿用 Flutter 评审结论） |
| UM-3 | Android `asyncGetConversationsFromDB` 过滤 chatThread 会话，iOS 公开头文件未见对应说明 | ✅ 已闭环（2026-09-10 用户确认：保持现状，与 Flutter 一致，不抹平） |

## 问题清单

1. iOS 首次构建失败：bundler 找不到 Gemfile.lock 钉住的 gems（本机 ruby 3.4.4 环境缺 gem），`bundle install` 后通过。环境性问题，已解决。
2. ~~gate 脚本对 6 个存量 deprecated key 报 block~~ → 已修复（2026-09-10）：`porting_guard.sh` 的 RN 分支三处 key 提取（TS/Java/ObjC）前加 `grep -v '// deprecated'`，与契约测试 `stripDeprecated` 口径对齐；修复后 gate 通过。
3. `rn-local-deps.sh restore` 用 `git checkout` 还原，会连带抹掉这两个依赖文件与 `example/ios/` 中**有意的未提交改动**（本次 4.25.0 bump 与 pbxproj 版本号被回退，已手工重新施加并复核确认）。建议 `LOCAL_DEPS_ALLOW_DIRTY=1` 场景改锚点反向替换。
4. 实机回归首跑 login 报 200 "The user is already logged in"（模拟器残留登录态；auto 模式 login 重试不覆盖 200 码），卸载应用清数据后通过。

## 待用户决策项

1. ~~UM-3~~ → 已闭环：保持现状（2026-09-10 用户确认，与 Flutter 一致）。
2. ~~实机回归~~ → 已闭环：双端各 5 步全过（init 注入 `autoLoadConversations:false` + login + sendMessage×2 + 分页/翻页 + 无效 cursor 110），证据见 04-verification.md。
3. **远程依赖未发布**：podspec/gradle 已声明 4.25.0（交付形态），但在 native 正式发布前 `pod install`/gradle 拉取会失败；发布前如需再次编译/实机验证，重走本地依赖流程（Android 实机需额外替换 symbolLibs 真 so）。
4. 本地依赖改动不提交的约束已满足（restore 零残留，git status 中无 LOCAL-DEP-TEST 痕迹）；提交范围与时间由用户决定。

---

# 补充验收报告：iOS PushKit 回移（2026-09-24）

- 范围：在 1.21.0（长期分支）上兼容性回移 iOS PushKit 能力，**只加不删**。
- 全量变更清单见 [06-pushkit-backport.md](06-pushkit-backport.md)；契约见 [02-contract.md](02-contract.md) 补录节；实现明细见 [03-implementation.md](03-implementation.md) 补录节；验证证据见 [04-verification.md](04-verification.md) 补录节。
- 参考实现：RN 5.0.0 commit `bc9915e`、Flutter 5.0.0 commit `41d2cf17`（取值与命名逐字对齐，便于跨版本迁移）。
- 代码状态：**未提交**（工作区改动，等待用户确认提交范围）。

## 二维对照表

| 变更项 | iOS 源（HyphenateChat 4.25.0 发布头文件） | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
|---|---|---|---|---|---|---|
| `ChatOptions.apnsCertName` | `EMOptions.h:290` `@property(nonatomic, copy) NSString *apnsCertName;` | 无（iOS 专有） | 已实现（5 处同步，可选，仅初始化） | 有意不映射（native 无该能力） | 已实现（`ExtSdkToJson.m` fromJson + toJson） | ✅ |
| `ChatOptions.pushKitCertName` | `EMOptions.h:305` `@property(nonatomic, copy) NSString *pushKitCertName;` | 无（iOS 专有） | 已实现（5 处同步，可选，仅初始化） | 有意不映射 | 已实现（同上） | ✅ |
| `ChatClient.bindPushKitToken({ deviceToken })` | `EMClient.h:776` `- (void)registerPushKitToken:(NSData *)aPushToken completion:...` | 无（iOS 专有） | 已实现（`Platform.OS` 守卫 no-op） | 路由已注册，返回 `OPERATION_UNSUPPORTED`(111) | 已实现 | ✅ |
| `ChatClient.unbindPushKitToken()` | `EMClient.h:825` `- (void)unRegisterPushKitTokenWithCompletion:...` | 无（iOS 专有） | 已实现（同上） | 同上 | 已实现 | ✅ |
| `bindPushKitToken:`（同步变体） | `EMClient.h:753` | 无 | **skip**（语义重复且阻塞线程，沿用 5.0.0 结论） | - | - | ✅ skip |
| `unBindPushKitToken`（同步变体） | `EMClient.h:802` | 无 | **skip**（同上） | - | - | ✅ skip |
| `ChatOptions.pushConfig` / `ChatPushConfig` / `ChatClient.updatePushConfig` | - | - | **保留不动**（兼容性硬要求，5.0.0 的删除动作不回移） | 保留 | 保留 | ✅ 保持不变 |
| `ChatClient.bindDeviceToken` | - | - | **不引入**（属 5.0.0 的 break 动作） | - | - | ✅ skip |

## 验证摘要

- 静态检查：`yarn test --no-watchman`（19 suites / 121 tests，含契约测试）、`yarn typecheck`、`yarn lint`、`yarn check:circular:dpdm` 全过；worktree 首次执行 `yarn prepare`（bob build）通过。
- 契约要素 grep 逐字抽查：方法名 key 九处（TS / Java 常量 / Java dispatch / Java wrapper / ObjC key / ObjC methodMap / ObjC dispatch / ObjC wrapper / cpp 透传）取值一致；选项 key 在 TS 5 处同步 + iOS fromJson/toJson 齐备；新增 ObjC Value 1027/1028 无撞号。
- 依赖与发布产物核实：CocoaPods trunk 可解析 `HyphenateChat 4.25.0`；下载后的发布头文件确认含全部四个 PushKit 方法与两个证书名属性（即回移不是「对未发布 API 的猜测」）。
- 双端构建：example Android `BUILD SUCCESSFUL`（245 tasks，并用 `javap` 反编译证实新路由进了产物 `.class`）；example iOS `Successfully built the app`（四个改动文件全部参与编译链接，无 `undeclared selector` / `property not found`）。
- 真机 PushKit 回归：⏭️ 未执行 —— 需要真实 APNs + PushKit 证书、iOS 真机（模拟器不支持 VoIP push）与 `PKPushRegistry` 直连凭据，本环境不具备；由发布头文件 + 双端编译 + 契约 grep 构成静态证据链，交用户补验。

## 未匹配清单

| id | 疑点 | 状态 |
|---|---|---|
| UM-1 | Android 无 PushKit 能力 | ✅ 沿用 5.0.0 裁决：仅 iOS 支持，非 iOS 静默 no-op；Android 侧注册同名路由返回 111 以保持 key 契约 |
| UM-2 | native 同步/异步两对方法语义重复 | ✅ 沿用 5.0.0 裁决：只暴露异步一对 |
| UM-3 | `EMOptions.h` 声明两个证书名「仅初始化可设置」，而 1.21.0 现存 `updatePushConfig` 的 iOS 路径会在运行时写 `apnsCertName` | ✅ 用户已裁决：不改旧路径、不引入优先级逻辑；冲突以 `updatePushConfig` 的 TypeDoc Note 告知使用者（两处只配一处） |
| UM-4 | `ChatPushConfig.deviceId` 在 iOS 上承担 APNs 证书名语义，与新增 `ChatOptions.apnsCertName` 语义重叠 | ✅ 不合并、不改名（兼容性要求），两个入口并存并各自注释说明 |
| UM-5 | PushKit 绑定/解绑成对，普通推送 token 在 1.21.0 只有绑定（经 `updatePushConfig`）没有解绑 | ✅ 沿用 5.0.0 结论：独立能力，不合并入口 |

## 问题清单

1. `example/ios/Podfile.lock` 与 `ChatSdk.podspec` 不一致（**存量问题**，本次一并修正）：lock 停留在 `ChatSdk (1.20.0)` + `HyphenateChat (~> 4.24.1)`，而 podspec 已是 1.21.0 且要求 `~> 4.25.0`，直接导致 `pod install` 报 "could not find compatible versions"。已更新为 `ChatSdk (1.21.0)` + `HyphenateChat (4.25.0)` + `ShengwangInfra_iOS (1.3.16)`。
2. CocoaPods CDN 故障（**环境问题**，已绕过）：`cdn.cocoapods.org` 对 spec 请求返回 301 跳 `cdn.jsdelivr.net`，CocoaPods 1.15.2 的 HTTP/2 客户端跟随重定向时报 `Error in the HTTP2 framing layer`，三次重试均失败；临时把 `~/.cocoapods/repos/trunk/.url` 指向 `https://cdn.jsdelivr.net/cocoa/` 后成功，**验证完成后已还原为官方默认值**（`https://cdn.cocoapods.org/`）。
3. ObjC `Value` 编号存量重复：`OnMessagesRecalledInfoValue` 与 `OnStreamMessagesReceivedValue` 同为 `611`（`ExtSdkMethodTypeObjc.h:535,807`）。两个都是事件 key，不参与 dispatch switch，无实际影响；本次不修，仅登记。

## 待用户决策项

1. **D-1（已按裁决落地，待确认表述）**：证书名两处入口的冲突处理 = 不改旧路径 + 在 `updatePushConfig` 注释里告知「两处只配一处」。这是本次唯一的语义相关文档改动，若希望 1.21.0 的注释也完全零改动，可回退该 Note。
2. **D-2**：iOS `renewToken` dispatch 缺失（key/Value/methodMap/wrapper 齐备，缺 `ExtSdkDispatch.m` 的 case → `not implement: renewToken`）。5.0.0 已修并补了「methodMap 条目必须有 dispatch case」的契约测试。**本次按你指定的范围未修**，是否在 1.21.0 一并修复（并移植该契约测试）请裁决。
3. **D-3**：是否在 `example/ci/no_login_smoke.json` 增加一条绕过 TS `Platform.OS` 守卫的 Android 非法调用用例，把「Android 路由返回 111」固化成可回归的断言。属额外范围，默认不做。
4. **D-6（提交范围）**：本次代码未提交。注意其中 `example/ios/Podfile.lock` 属于**修复既有不一致**而非本次功能改动，请确认是否一并纳入提交。

---

# D-2 落实补充（2026-09-24 用户裁决：修）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
|---|---|---|---|---|---|---|
| `ChatClient.renewToken` 的 iOS 接通缺口（**两层**：wrapper `.h` 缺方法声明 + dispatch 缺 case） | `EMClient.h` `- (void)renewToken:completion:` | `EMClient.renewToken(token, EMCallBack)` | 已有（`ChatClient.renewToken`，无改动） | 已有（无改动） | **本次补齐** `ExtSdkClientWrapper.h` 的 `renewToken:` 声明 + `ExtSdkDispatch.m` 的 `ExtSdkMethodKeyRenewTokenValue` case | ✅ 已修复 |
| 新增契约用例「methodMap 条目必须有 dispatch case」 | - | - | `src/__tests__/contract/parsers.ts` + `methodNames.test.ts`（从 5.0.0 移植） | - | - | ✅ 已实现 |

- 影响面：此前 1.21.0 上调用 `ChatClient.renewToken` 必返回 `not implement: renewToken`（历史核查证明该缺口自引入以来一直存在：`git log -S` 显示 dispatch 与头文件声明**从未**有过，`dev` 分支现状同样为 0）；同时 `ChatSdk.podspec`/`build.gradle` 的 4.25.0 对本改动无影响（纯 dispatch 路由补全）。
- 验证：反向验证证明新用例对本分支真实缺口会红（临时撤 case → `1 failed`，错误信息逐字指名 `ExtSdkMethodKeyRenewToken`）；恢复后 `yarn test --no-watchman` 19 suites / **122 tests** 全过；typecheck / lint 通过；iOS 重编译通过（见 04-verification.md §7）。
- 待决策项 D-2 至此**闭环**；D-1 按裁决保留 Note；D-3 按默认「不加」处理；D-6 按裁决**暂不提交**，工作区改动待你审阅。
