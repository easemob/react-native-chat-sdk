# 5.0.0 平版 · 阶段四验证记录

验证日期：2026-09-16。所有命令在 worktree `.worktree/5.0.0` 内执行。结果四档：✅ 通过 / ❌ 不通过（实现缺陷）/ ⚠️ 不通过（环境限制）/ ⏭️ 未执行。

## 1. 静态检查（仓库根）

| 验证项 | 结果 | 失败原因/备注 |
|---|---|---|
| `yarn typecheck` | ✅ | exit 0，无输出 |
| `yarn lint` | ✅ | 初跑 1 个 prettier 格式错误（`example/src/registry/apis/contact.ts` 新增 addContact 条目的 `JSON.stringify` 换行），修复后复跑 exit 0 |
| `yarn check:circular:dpdm` | ✅ | no circular dependency；仅既有 warning（skip react-native/index.js） |
| `yarn test --no-watchman`（unit + contract） | ✅ | 19 suites / 110 tests 全过，含 TS↔Java↔ObjC 三层契约对齐测试 |

## 2. example 真实应用构建（双端 wrapper 完整编译）

| 验证项 | 结果 | 失败原因/备注 |
|---|---|---|
| example Android 构建（`yarn example build:android`） | ✅ | BUILD SUCCESSFUL；拉取真实 Maven 产物 `io.hyphenate:hyphenate-chat:5.0.0` AAR 编译通过 |
| example iOS 构建（`yarn example build:ios`） | ✅（走 SPM 路径） | 验证当时 CocoaPods trunk 上 HyphenateChat 最新仅 4.24.1（5.0.0 未发布），改用 SPM 集成路径（`USE_FRAMEWORKS=dynamic bundle exec pod install`，SPM 仓库 HyphenateChat_iOS 有 tag 5.0.0）后 pod install + xcodebuild 均成功。**更新（2026-09-16）：用户确认 CocoaPods trunk 与 SPM 远端均已发布 HyphenateChat 5.0.0**，podspec 的 `~> 5.0.0` 声明可直接走默认 CocoaPods 路径 |

## 3. 无登录冒烟（example 自动化模式，CI 同款驱动）

脚本：`example/ci/no_login_smoke.json`（init + 7 步，每 manager 一步，断言错误码）。

| 验证项 | 结果 | 失败原因/备注 |
|---|---|---|
| Android 冒烟（`bash scripts/ci/smoke_local.sh android`，Pixel_9 模拟器） | ✅ | assert_script: OK（init + 7 steps, all as expected）；日志 `build/reports/smoke-android-api_test.log` |
| iOS 冒烟（`bash scripts/ci/smoke_local.sh ios`，模拟器） | ✅ | assert_script: OK（init + 7 steps, all as expected）；日志 `build/reports/smoke-ios-api_test.log` |
| contact 步跨端一致性 | ✅ | 初跑发现跨端分歧：`contact.getAllContacts` Android 返回 error 3 / iOS 返回空成功。校准：example registry 新增 `ChatContactManager.addContact` 条目（`example/src/registry/apis/contact.ts`），冒烟脚本 contact 步改为 `addContact`（`{userId:"rn-ci-nonexistent-user",reason:"rn-ci"}`，expect errorCode 201）。复测双端均返回 201（"User is not logged in"），其余 6 步双端一致（searchMessagesFromServer/fetchPublicChatRoomsFromServer/publishPresence/fetchSilentModeForAll/fetchSubscribedUsers 均 201，getJoinedGroups 空成功） |

## 4. 契约要素 grep 抽查（自检清单）

| 验证项 | 结果 | 失败原因/备注 |
|---|---|---|
| 10 个新 MT 常量四层同步（TS Consts.ts / Java ExtSdkMethodType.java / ObjC .h+.m / cpp ExtSdkMethodType） | ✅ | 逐一 grep 核对，四层齐全 |
| 事件符号名与 iOS `supportedEvents` 注册 | ✅ | 事件符号为 `ExtSdkMethodKeyOn*`（大写 O）形式，均在 `ExtSdkApiObjcRN.mm` supportedEvents 中 |
| 消息四 key（`isPeerRead`/`isRead`/`isNeedReadReceipt`/`groupReadReceiptCount`）、configs 六 key、`msg_ids`/`convId`/`receipt_id`、设备管理 `token` key | ✅ | 三层逐字一致 |
| Android `isUnread()`→`isRead()` 取值取反 | ✅ | wrapper 无遗漏取反逻辑（native 语义从"未读"翻转为"已读"，最易错点，已专项核对） |
| `updateGroupConfigs` 逐位掩码映射 | ✅ | Java/ObjC 与契约 §4 一致 |
| 版本号对齐（package.json 5.0.0 / src/version.ts / example 三处 / podspec 两处 / gradle 一处） | ✅ | `yarn gen:version_file` 已跑，version.ts = '5.0.0'；example versionCode/CURRENT_PROJECT_VERSION 递增至 3 |
| 双语 CHANGELOG 5.0.0 条目 | ✅ | CHANGELOG.md / CHANGELOG.zh.md 同步，含 native 依赖升级行 |
| 新类型 `src/index.ts` 导出 | ✅ | 由 contract 测试与 typecheck 覆盖 |

## 5. 登录态功能验证（2026-09-18 更新）

原 2026-09-16 记录为“缺真实账号、未执行”。2026-09-18 已使用本地 token 环境和 `example/ci/port_5_0_0.json` 完成 Android/iOS 单账号 21 步真实模拟器复验；双账号事件仍未执行。

| 验证项 | 结果 | 失败原因/备注 |
|---|---|---|
| Android 登录态 21 步（Android 15，`emulator-5554`） | ❌ 19 步符合预期 / 1 步崩溃 / 1 步未执行 | 正向 17 步及前两个不存在消息错误路径均符合预期；`fetch_group_receipt_missing` 调 native 后 `EMMessage.getChatType()` 空指针崩溃，`kick_all` 未执行。证据：`build/reports/5.0.0/20260918070127-android-emulator-5554/` |
| iOS 登录态 21 步（iOS 18.2，iPhone 16 Pro simulator） | ❌ 20 步符合预期 / 1 步不符合 | 同一 `fetch_group_receipt_missing` 未报错，返回空成功 `{cursor:"", totalCount:0, list:[]}`；无崩溃，其余步骤通过。证据：`build/reports/5.0.0/20260918070518-ios-4BEA133B-4B24-430F-96FC-924632C2CF53/` |
| Android / iOS 结构化对比 | ❌ 1 个行为差异 + 2 个后续状态差异 | 权威对比：`build/reports/5.0.0/comparison-20260918071059.md`；另观察到消息 JSON 的 `body.targetLanguageCodes`、`receiverList` 仅 Android 返回，分页 `totalCount` 仅 iOS 返回（后者为已接受契约） |
| `onDatabaseOpened` / `onDataSyncStart` / `onDataSyncFinish` | ✅ | 两端结构化日志均观察到 |
| `onMessageReadReceipts` / `ChatGroupMemberInfo` | ⏭️ 未执行 | 单账号无法产生另一成员已读回执；需双账号协同场景 |

## 6. 阶段门禁

```text
$ echo '{}' | bash .agents/skills/platform-sdk-porting-v2/hooks/porting_guard.sh gate react-native <worktree>
gate exit=0（无输出，通过）
```

## 7. 结论

2026-09-16 阶段四门禁当时通过：静态检查、双端构建、双端冒烟、契约抽查全绿；登录态功能验证当时因缺真实账号标 ⏭️。验证时的唯一环境限制（CocoaPods trunk 未发布 HyphenateChat 5.0.0，iOS 走 SPM 路径完成验证）已于 2026-09-16 解除——用户确认 CocoaPods trunk 与 SPM 远端均已发布 5.0.0，默认 CocoaPods 路径可用。

**2026-09-18 更新：阶段四运行时门禁重新打开。** 21 步错误路径复验确认 Android native 崩溃及 iOS 空成功语义差异；在 wrapper 防护与跨端预期完成裁决、修复、双端重验之前，不应把登录态 API 验证标为完成。静态门禁结果不受影响。

## 8. 第二轮验证（审查决策落实后，2026-09-16）

第二轮改动范围：TS 层（renewToken 改名、17 处 deprecated 删除、枚举归位、注释）、Android+cpp（getAllChatRooms 删净）、iOS（getAllChatRooms/EMConversationFilter/autoLoginDidCompleteWithError 删除、会话 name/avatar nil 防护）。

| 验证项 | 结果 | 失败原因/备注 |
|---|---|---|
| `yarn typecheck` / `yarn lint` / `check:circular:dpdm` / `yarn test --no-watchman` | ✅ | 全部复跑通过（19 suites / 110 tests，契约测试覆盖删除后三层一致性） |
| example 构建（Android） | ✅ | 改动后 BUILD SUCCESSFUL（子代理留痕） |
| example 构建（iOS） | ✅ | 改动后 BUILD SUCCEEDED（SPM 路径，子代理留痕） |
| 无登录冒烟 Android | ✅ | init + 7 步全过（19 条结构化日志） |
| 无登录冒烟 iOS | ✅ | init + 7 步全过 |
| 门禁复跑 | ✅ | exit=0 无输出 |

## 9. 第三轮：可追溯自动报告与错误路径复验（2026-09-18）

- 新增 `yarn report:api --platform <android|ios> [--device <id>]`，复用 `smoke_local.sh` 与现有设备驱动，不另建构建链路。
- 每次运行在 Git 忽略的 `build/reports/5.0.0/<run-id>/` 生成 `run.json`、`events.jsonl`、`steps.json`、`summary.md`、`issues.md`、`crash.log`；记录 commit、dirty 状态、脚本/报告器 SHA-256、双端 native 版本、设备与时间，不保存 token/clientSecret。
- `assert_script.js` 与报告器共用同一结果分类器；`expect.success=false` 和固定 `errorCode` 均可作为通过条件，不再把 `script.done.failed` 的原始失败数误当最终结论。
- 5.0.0 脚本从 18 步扩为 21 步，增加 `sendMessageReadReceipts`、`getGroupMessageReadReceipts`、`fetchGroupMessageReadReceipts` 三个不存在消息错误路径。
- example 的 `ChatManager.sendMessage` 注册项改为等待 `onSuccess` 并返回服务端回写后的消息；否则步骤拿到临时 msgId，正向本地查询会误报 `messages is empty`，并可能提前触发 native 崩溃。
- 报告器单测：`yarn test:ci-scripts`，10/10 通过；`yarn typecheck`、`yarn lint`、`yarn check:circular:dpdm`、全量 Jest 19 suites / 110 tests 通过；porting gate exit 0。
