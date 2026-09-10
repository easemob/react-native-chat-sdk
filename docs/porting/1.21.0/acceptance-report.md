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
