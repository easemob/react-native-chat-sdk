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

**2026-09-18 更新：阶段四运行时门禁重新打开。** 21 步错误路径复验确认 Android native 崩溃及 iOS 空成功语义差异；在 wrapper 防护与跨端预期落实、双端重验之前，不应把登录态 API 验证标为完成。用户已裁决消息不存在的错误码最终双端统一为 `500 MESSAGE_INVALID`，但实现与崩溃修复本轮暂缓。静态门禁结果不受影响。

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

## 10. 第四轮：正向/反向用例拆分（2026-09-18）

- 原 `example/ci/port_5_0_0.json` 拆为 `port_5_0_0_positive.json` 与 `port_5_0_0_negative.json`；`yarn report:api` 默认执行正向脚本，反向脚本通过 `--script example/ci/port_5_0_0_negative.json` 指定。
- 正向脚本只断言成功返回；反向脚本覆盖不存在资源、非法参数及无效 token。无参数本地查询没有稳定可控的错误输入，不为满足数量机械构造无意义反例。
- `fetchGroupMessageReadReceipts` 的缺失消息反例已确认会导致 Android native 崩溃，按用户决策在反向脚本中暂时屏蔽；报告器固定生成 `fetch-group-receipt-missing-disabled` 候选项，继续追踪而不阻断其他用例。
- 双账号场景暂不实施；`onMessageReadReceipts` 和非空 `ChatGroupMemberInfo` 继续保留为后续验证项。
- 报告目录及文件结构、Android/iOS 对比逻辑保持不变。
- 脚本与报告器验证：`yarn test:ci-scripts` 12/12、`yarn lint`、`yarn typecheck`、porting gate 均通过。

| 验证项 | Android | iOS | 结论 |
| --- | --- | --- | --- |
| 正向 18 步 | 17 passed / 1 failed | 17 passed / 1 failed | 唯一失败均为 `modifyMsgBody` 返回 305（当前集群未开通消息编辑服务）；其余正常路径完成，真实 resource 的 `kickDevice` 与后续 `kickAllDevices` 均成功 |
| 反向 10 步 | 8 passed / 2 failed | 7 passed / 3 failed | 无崩溃、全部步骤执行完成；两个批量回执 API 当前均返回 110，与目标 500 不符；iOS 另有 `renewToken("")` 空成功差异 |
| 反向一致项 | 600 / 600 / 500 / 110 / 303 / 303 / 303 | 同 Android | 非法群成员、不存在群、缺失修改消息、空会话 ID、设备管理三方法无效 token 的结果与错误码双端一致 |
| `renewToken("")` | 104 `INVALID_TOKEN` | success | ❌ iOS native 5.0.0 的空 token 分支构造 `EMErrorInvalidToken` 后未立即返回，随后结果被 core 调用覆盖；本轮只记录、不修改 RN wrapper/native 行为 |

权威本地证据：

- 正向 Android：`build/reports/5.0.0/20260918085559-android-emulator-5554/`
- 正向 iOS：`build/reports/5.0.0/20260918085608-ios-4BEA133B-4B24-430F-96FC-924632C2CF53/`
- 正向双端对比：`build/reports/5.0.0/comparison-20260918085631.md`
- 反向 Android：`build/reports/5.0.0/20260918085616-android-emulator-5554/`
- 反向 iOS：`build/reports/5.0.0/20260918085623-ios-4BEA133B-4B24-430F-96FC-924632C2CF53/`
- 反向双端对比：`build/reports/5.0.0/comparison-20260918085641.md`

## 11. 第五轮：项目侧移除多集群支持（2026-09-21）

### 11.1 用户裁决

example 的 `config.local.json` 一度支持多集群（`clusters` / `defaultCluster` / 每条资源的 `cluster` 字段，`env.ts.<cluster>` 缓存 + `yarn env:use` 激活）。用户裁决：**产品支持多种集群，但项目实现侧不做「多选」**——要换环境就把对应值直接填进 `config.local.json`；便利性由使用者在 Git 外自行维护（推荐自备 `config.ngi.json` / `config.ebs.json` 这类副本，不入库、敏感信息人工管理，用哪套就复制为 `config.local.json`）；不为多环境增加项目复杂度。Flutter 侧已先行实施同一裁决（im_flutter_sdk `ece93914`），本轮 RN 对齐。

### 11.2 移除清单

| 位置 | 移除内容 |
| --- | --- |
| `scripts/env-gettoken.js`（242 → 198 行） | `clusters` 遍历、`defaultCluster` 解析、accounts/groups 按集群过滤、集群级 chatOptions 合并、「跳过并累计失败」逻辑；改为直接写 `example/src/env.ts`，必填字段缺失/占位即 fail fast（退出码 1） |
| `scripts/env-use.js` | 整个删除（激活集群 = 复制 env.ts.<cluster>，已无存在意义） |
| `package.json` | `env:use` 命令 |
| `.gitignore` | `example/src/env.ts.*`；新增 `example/config.*.json`（用户自管的多环境副本同样不入库） |
| `eslint.config.mjs` | `example/src/env.ts.*` 忽略项 |
| `example/src/auto/auto_mode.ts`、`scripts/ci/fetch_e2e_user_token.js` | 注释中的集群措辞 |

### 11.3 保留与迁移

- **保留私有化部署**：`enablePrivateConfig` + `webSocketServer` / `restServer` / `msyncServer`——它描述「这一个环境是不是私有化」，与选集群无关。
- **旧格式有一句明确报错**：`config.local.json` 仍带 `clusters` 或 `defaultCluster` 时直接报错退出（退出码 1）；`accounts`/`groups` 条目里遗留的 `cluster` 键静默丢弃，避免从旧文件粘贴时被卡住。
- 本地 `example/config.local.json` 已拍平（ngi 的值提到顶层，原文件备份在仓库外 `/tmp/config.local.json.pre-single-env`），旧的 `example/src/env.ts.ngi` 已删除。
- CI 无改动：`.github/workflows/` 本就只走 `E2E_*` secrets，与集群机制无关。

### 11.4 复验

- `node --check scripts/env-gettoken.js` 语法通过；旧格式配置报错路径、缺字段 fail-fast 路径、模板生成路径均已本地实测。
- 真实链路：`yarn env:gettoken`（ngi 凭据）exit 0，`zuoyu01` / `zuoyu02` 各取到 user token，`example/src/env.ts` 直接生成（无 `env.ts.<cluster>` 中间文件）。
- `yarn typecheck` / `yarn lint` / `yarn test --no-watchman` / `yarn test:ci-scripts` 全绿。
