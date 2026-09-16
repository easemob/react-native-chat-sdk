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

## 5. 登录态功能验证（双账号已读回执、设备管理 token 鉴权、dataSync 事件等）

| 验证项 | 结果 | 失败原因/备注 |
|---|---|---|
| 登录态新 API 实机回归（群已读回执、设备管理、onDataSyncStart/Finish/onDatabaseOpened 事件等） | ⏭️ 未执行 | 缺真实 appKey 与双测试账号（本机无 `E2E_APP_KEY`/`E2E_USER_ID`/`E2E_USER_PASSWORD`），超出本次可执行范围。建议后续：配置三个 E2E_* 环境变量后跑 `bash scripts/ci/nightly_local.sh <android\|ios>`（single_account.json  nightly 回归），或对验收报告 ⚠️ 项涉及的功能做人工双账号验证 |

## 6. 阶段门禁

```text
$ echo '{}' | bash .agents/skills/platform-sdk-porting-v2/hooks/porting_guard.sh gate react-native <worktree>
gate exit=0（无输出，通过）
```

## 7. 结论

阶段四门禁通过：静态检查、双端构建、双端冒烟、契约抽查全绿；登录态功能验证因缺真实账号标 ⏭️，列入验收报告遗留事项。验证时的唯一环境限制（CocoaPods trunk 未发布 HyphenateChat 5.0.0，iOS 走 SPM 路径完成验证）已于 2026-09-16 解除——用户确认 CocoaPods trunk 与 SPM 远端均已发布 5.0.0，默认 CocoaPods 路径可用。

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
