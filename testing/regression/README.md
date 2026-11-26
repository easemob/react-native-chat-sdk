# 设备回归（example/src/ci）

## 定位

设备回归在真机/模拟器上启动 `example` 应用，用真实 native SDK 跑一组**长期可重复**的契约用例：单账号、固定前置、用例自建自清、结果可静态对账。它补的是 Jest 与 contract test 看不到的部分——TS 调用经过 native 后的真实行为、事件解码、本地 DB 读取，以及服务端可见的读写路径。

它不负责：

- 纯 TypeScript 逻辑（用 Jest）；
- 某版本的逐 API 平版验收与工单复现（用[单设备脚本](../single/README.md)）；
- 需要第二个运行中客户端的行为（用[多设备协同](../multi/README.md)）。

当前基线：native iOS `HyphenateChat 5.2.0` / Android `5.2.1`，5 个固定入口、98 条用例（以 `testing/regression/native-case-mapping.json` 为准，`check_case_mapping.js` 校验）。

## 从零开始：初始化、设备与数据

这一节按“新机器第一次跑”的顺序写。已有工作区可以跳过初始化，但仍要确认设备选择与凭据。

### 1. 工具链与仓库

Node、Yarn、JDK 17、Android SDK、Xcode / CocoaPods 的要求和 `yarn prepare` 见 [测试入口的环境一节](../README.md#环境)。`java -version` 必须是 17。

`ci_test_local.sh` 在真正构建前也会执行 `gen:version_file`、`gen:cmake_file`、`gen:env_file`，所以只跑设备回归时这三步不是手工前置；首次检出仍应先 `yarn prepare`，避免 `lib/` 或生成文件缺失影响其他任务。

### 2. 准备账号与凭据

只跑 `logged_out` 时不需要账号和 token，只需要一个可初始化的 appKey。CI 的 `logged-out lane` 使用公开 demo key `easemob-demo#zuoyu`；本地等价命令：

```bash
E2E_APP_KEY='easemob-demo#zuoyu' \
  bash testing/regression/ci_test_local.sh android logged_out
```

跑任意 `logged_in_*` entry 时，从以下两种来源中选一种：

1. 五个 `E2E_*` 环境变量（与 GitHub environment `rn-single-account` 同名）：`E2E_APP_KEY`、`E2E_USER_ID`、`E2E_REST_API`、`E2E_CLIENT_ID`、`E2E_CLIENT_SECRET`。五个必须同时设置；缺一个时脚本会整体回退到 `config.local.json`。
2. 本机 gitignored 的 `example/config.local.json`。CI 只读以下字段，`chatOptions`、`groups` 不参与 CI 初始化：

```json
{
  "_comment": "local only; git-ignored",
  "restApi": "https://a1.easemob.com",
  "appKey": "<org>#<app>",
  "clientId": "<client id>",
  "clientSecret": "<client secret>",
  "accounts": [{ "id": "<test user id>" }]
}
```

`appKey`、`clientId`、`clientSecret` 从环信控制台的应用详情获取；`restApi` 用该应用所在环境的基础地址。字段说明：

- `restApi` 是环境基础地址，脚本会拼成 `<restApi>/<org>/<app>/token`；
- `accounts[0].id`（或 `E2E_USER_ID`）是基础账号；设置可选 `E2E_USER_SUFFIX` 后，有效登录账号为 `<基础账号><后缀>`。脚本取 token 时带 `autoCreateUser=true`，首次使用会自动创建；如果集群关闭了该能力，需要先在控制台创建账号；
- 联系人用例的 peer 默认是 `<有效登录账号>_ci_peer`，也通过同一 token 接口自动创建；可用 `E2E_PEER_ID` 指定完整 peer ID，显式值不会再追加后缀，并行时需自行保证 peer 隔离；
- token 由 `testing/regression/fetch_e2e_user_token.js` 在每次运行时现取，只存在宿主临时文件和 `ci_run.json`（0600），不会写进仓库；
- **CI 不需要**先跑 `yarn env:gettoken`，也不读 `example/src/env.ts`；那是单设备脚本的初始化路径（见[单设备文档](../single/README.md#前置与凭据)）。

配置完可以先用一次 `logged_in_contact` 单例验证凭据；不要提交 `config.local.json`。

CI 两个登录态 lane 分别设置固定后缀 `_rn_android_5x` / `_rn_ios_5x`（平台加 `5x` 线路标记，避免与 1.x 等其他分支共用 app key 时账号状态冲突）。基础账号若为 `ci_user`，最终账号分别是 `ci_user_rn_android_5x` / `ci_user_rn_ios_5x`，默认 peer 分别为 `ci_user_rn_android_5x_ci_peer` / `ci_user_rn_ios_5x_ci_peer`。后缀不含 run id，多次运行复用同一批账号，继续使用现有五个 secrets 和 `rn-single-account` environment。

本地默认不追加后缀，保持现有账号行为；需要双平台并行时显式设置（两种凭据来源均支持）：

```bash
E2E_USER_SUFFIX=_rn_android_5x bash testing/regression/ci_test_local.sh android
E2E_USER_SUFFIX=_rn_ios_5x bash testing/regression/ci_test_local.sh ios
```

固定后缀只隔离 SDK/平台，不隔离同平台的不同分支或本地与 CI 并行。同分支 CI run 沿用 workflow 的 concurrency 约束。直接调用 `fetch_e2e_user_token.js` 时默认使用基础账号加后缀；`--user-id` 则表示完整 ID，原样使用。

### 3. 准备设备

#### Android

```bash
# 1. 看有哪些 AVD；没有就先用 Android Studio 的 Device Manager 创建
emulator -list-avds

# 2. 启动一台（AVD 名按实际替换）
emulator -avd Pixel_9 &

# 3. 等系统启动完成
adb wait-for-device
adb shell getprop sys.boot_completed   # 输出 1

# 4. 确认设备在线
adb devices
```

同时有多台设备/模拟器在线时，必须显式选择，否则脚本会报 `multiple online Android devices`：

```bash
export ANDROID_SERIAL=emulator-5554
```

`ci_test_local.sh` 先解析出唯一目标设备，再按该设备的 ABI 生成 APK：Apple Silicon 上的 arm64 模拟器会构建 arm64-v8a，CI 的 x86_64 模拟器会构建 x86_64。不要在 arm64 模拟器上复用 x86_64 的 CI APK。

#### iOS

```bash
# 1. 查看可用模拟器（只列 available）
xcrun simctl list devices available

# 2. 可选：先启动目标模拟器（未启动时脚本也会按 DEVICE_UDID 启动）
xcrun simctl boot <UDID>
open -a Simulator

# 3. 让脚本明确使用这台模拟器
export DEVICE_UDID=<UDID>

# 4. 仅在需要手动修复 Pods 时执行；正常构建前脚本会自动刷新
cd example
bundle config set --local path vendor/bundle
bundle install
bundle exec pod install --project-directory=ios
cd ..
```

注意：

- 设备选择规则：设置了 `DEVICE_UDID` 时，脚本会校验该模拟器存在，未启动就先 `simctl boot` 并等待启动完成；未设置时，0 台 booted 会自动启动一台，恰好 1 台直接使用，多个 booted 会报错并列出名称/UDID，要求设置 `DEVICE_UDID`。仍建议每次都显式指定，避免误装到别的模拟器。
- 脚本每次 iOS 构建前都会刷新 Pods（`bundle check`/必要时 `bundle install`，再 `bundle exec pod install`）；设置 `SKIP_POD_INSTALL=1` 可跳过。已有 Pods 不会被当成“已是最新”。
- `pod install` 可能更新 `example/ios/Podfile.lock` 和 `example/ios/ChatSdkExample.xcodeproj/project.pbxproj`。这些是已跟踪文件，测试后先看 `git diff`，不要无意中把依赖升级一起提交。

### 4. 第一次运行

先跑 `logged_out`，确认构建、安装、启动、日志拉取和断言链路都通：

```bash
# Android；已有 config.local.json 时可省略 E2E_APP_KEY
E2E_APP_KEY='easemob-demo#zuoyu' \
  bash testing/regression/ci_test_local.sh android logged_out

# iOS；没有 config.local.json 时同样需要 E2E_APP_KEY
E2E_APP_KEY='easemob-demo#zuoyu' DEVICE_UDID=<UDID> \
  bash testing/regression/ci_test_local.sh ios logged_out
```

再跑一条登录态用例（`logged_in_contact` 只有一条，适合做单例验证）：

```bash
ANDROID_SERIAL=emulator-5554 \
  bash testing/regression/ci_test_local.sh android logged_in_contact '^RN-CONTACT-001$'

DEVICE_UDID=<UDID> \
  bash testing/regression/ci_test_local.sh ios logged_in_contact '^RN-CONTACT-001$'
```

最后跑全量：

```bash
ANDROID_SERIAL=emulator-5554 bash testing/regression/ci_test_local.sh android
DEVICE_UDID=<UDID> bash testing/regression/ci_test_local.sh ios
```

构建耗时参考：Android 增量构建约 35 秒，首次构建更久；iOS 完整构建约 8–10 分钟。`logged_out` 只初始化 SDK、不登录，通常是定位环境问题最快的一层。

复用已有构建产物：

```bash
# 默认会使用 example/android/app/build/outputs/apk/debug/app-debug.apk
CI_SKIP_BUILD=1 ANDROID_SERIAL=emulator-5554 \
  bash testing/regression/ci_test_local.sh android

# 包在别处时再提供 APK_PATH / APP_PATH
CI_SKIP_BUILD=1 APK_PATH=/path/to/app-debug.apk \
  ANDROID_SERIAL=emulator-5554 bash testing/regression/ci_test_local.sh android
```

`CI_SKIP_BUILD=1` 只跳过依赖/生成/构建阶段，不会检查默认包是否存在；路径不对时会在安装阶段报错。

### 5. 常见问题

| 现象                                                            | 原因                                                           | 处理                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `error: no online Android device/emulator`                      | `adb devices` 没有 `device` 状态的设备                         | 启动模拟器/连接真机，确认 `adb devices` 后重跑                           |
| `error: multiple online Android devices; set ANDROID_SERIAL...` | 有多台在线设备，脚本不替你猜目标                               | 按列出的 serial `export ANDROID_SERIAL=<id>` 后重跑                      |
| `error: ANDROID_SERIAL=... is not an online device`             | 指定的设备已离线/被关闭，或 serial 写错                        | `adb devices` 确认在线设备，修正或取消 `ANDROID_SERIAL`                  |
| `error: multiple booted iOS simulators; set DEVICE_UDID...`     | 多台模拟器同时启动，`booted` 目标不确定                        | 按列出的名称/UDID `export DEVICE_UDID=<UDID>` 后重跑                     |
| `error: DEVICE_UDID=... is not an available simulator`          | UDID 写错，或该运行时已不可用                                  | `xcrun simctl list devices available` 重新确认 UDID                      |
| iOS 编译报 `'ExtSdkOSLogForwarder.h' file not found`            | `SKIP_POD_INSTALL=1` 跳过了刷新，或 Pods 已损坏                | 去掉 `SKIP_POD_INSTALL` 重跑；或手动 `pod install`                       |
| iOS 报 `[CP] Check Pods Manifest.lock` 失败                     | `Podfile.lock` 与 `Pods/Manifest.lock` 不一致                  | 重新 `pod install`；不要在构建前单独还原 `Podfile.lock`                  |
| `error: no credentials: set the five E2E_* variables...`        | 登录态 entry 既没有完整 `E2E_*`，也没有 `config.local.json`    | 补五个变量或创建 `example/config.local.json`                             |
| 单例运行后 `missing=4` 等                                       | `testNameRegex` 过滤了用例，但断言仍按 entry 全量 mapping 校验 | 该 entry 全量跑；只有 `logged_in_contact` 这类单例 entry 适合过滤        |
| 一直等不到 `script.done`                                        | 应用崩溃、entry 初始化失败或设备卡住                           | 看 `summary.md` 的错误 phase 和原始日志；必要时调大 `CI_ENTRY_TIMEOUT_S` |
| `total=0` / `script.done` 缺失                                  | 用例没有注册到该 entry，或启动时没进入 CI 模式                 | 检查 registrar 与 entry 的对应关系、mapping 和 CI_RUN 内联路径           |
| `CI_SKIP_BUILD=1` 后全部用例 `missing`                          | 复用了最近一次构建包；若上次是 auto-mode，包内没有 CI_RUN      | 重新构建 CI APK，或把 `APK_PATH`/`APP_PATH` 指到 CI 版构建产物           |
| 找不到报告目录                                                  | 默认 run-id 使用运行机器本地时间；历史目录可能使用 UTC         | 用 `date +%Y%m%d%H%M%S` 对照，或直接看终端输出的 run-id                  |
| `adb: command not found` / `emulator: command not found`        | Android SDK 的 `platform-tools`、`emulator` 不在 `PATH`        | 按[环境一节](../README.md#环境)设置 `ANDROID_HOME` 和 `PATH`             |
| `java` 版本不是 17                                              | `JAVA_HOME` 指向了别的 JDK                                     | 按[环境一节](../README.md#环境)设置 `JAVA_HOME` 后重新构建               |

## 运行机制

1. 构建时把 `CI_RUN`（设备上的路径）和 JS bundle 内联进包。Android 为 `/data/local/tmp/rn_ci_run.json`，iOS 为 `/tmp/rn_ci_run.json`。
2. 应用启动后 `ci_mode.ts` 进入 CI 模式，读取该 JSON（`entry`、可选 `testNameRegex`、账号/token 配置），选择对应 entry 的 registrar，串行执行用例。
3. 应用通过 CI 日志行上报运行状态，`source` 依次为 `ci.run.start`、`script.start`、每条 case 的 `ci.case.result`，最后是 `script.done`。这些日志被写入设备上的 `api_test.log`，由宿主拉回判定；CI 模式不使用 auto mode 的 `[APITEST]` 前缀。
4. `testing/regression/ci_test_local.sh` 只构建一次，然后按 entry 逐个冷启动（`logged_out` 前还会清理应用数据），每个 entry 生成一份 0600 配置并拉取自己的日志。
5. `testing/regression/assert_ci_run.js` 按 `testing/regression/native-case-mapping.json` 判定：失败、阻塞、缺失、未登记、运行错误、缺 `script.done`、空跑都算失败。
6. `testing/regression/check_case_mapping.js` 在 `ci/run_quality.sh` 里做代码与 mapping 的双向静态校验，本地和 CI 的 `quality` job 用同一道门。

## 五个固定入口

entry 是固定前置，不是可自由组合的标签；每个 entry 独立冷启动，不共享状态。所有 entry 都显式设置 `autoLoadConversations: true`、`enableChatroomConversation: false`，差异只在 `dataSyncType` 与 `enableUserInfo`：

| entry                 | dataSyncType                  | enableUserInfo | 覆盖范围                                                      |
| --------------------- | ----------------------------- | -------------- | ------------------------------------------------------------- |
| `logged_out`          | Conversations                 | false          | 未登录/仅初始化：不依赖登录态的本地读取，以及要求未登录的负例 |
| `logged_in_base`      | Conversations                 | false          | 登录/登出、消息、会话、聊天室、presence、本地 DB              |
| `logged_in_group`     | Conversations \| JoinedGroups | false          | 群资料、JoinedGroups 同步                                     |
| `logged_in_contact`   | Conversations \| Contacts     | false          | 联系人列表与好友变更同步                                      |
| `logged_in_user_info` | Conversations                 | true           | 用户资料、订阅用户                                            |

登录只是前置条件，不是限制：例如 `RN-CONTACT-001` 会在用例内重新登录以刷新联系人。entry 文件不可为了单条用例修改；确实需要新的 init 组合时，先记录冲突并确认，而不是把用例塞进不匹配的 entry。

## 首批 17 条基线用例

下表只列最初建立 harness 时的 17 条。其后按 [Flutter 对齐记录](2026-11-20-ci-case-port.md) 陆续补到现在的数量，全量清单以 mapping 文件为准；5.2.0 又新增了 `RN-MSG-017`（本地多体消息导入、读回、更新）和 `RN-MSG-018`（向 peer 真实发送双文本体消息并核对 `bodies` 顺序）。

| caseId          | entry               | module       | 验证点                                                                       |
| --------------- | ------------------- | ------------ | ---------------------------------------------------------------------------- |
| RN-APP-001      | logged_out          | app          | `init` 参数回显；无持久化登录态                                              |
| RN-AUTH-001     | logged_in_base      | auth         | `loginWithToken` 后会话就绪                                                  |
| RN-CONV-001     | logged_in_base      | conversation | `getAllConversations` 本地 DB 读取                                           |
| RN-CONV-002     | logged_in_base      | conversation | `fetchSilentModeForAll` 只读拉取                                             |
| RN-CONV-003     | logged_out          | conversation | 未登录调用 `fetchSilentModeForAll` 返回 201                                  |
| RN-MSG-001      | logged_out          | message      | 未登录调用 `searchMessagesFromServer` 返回 201                               |
| RN-GROUP-001    | logged_in_group     | group        | REST 建/删群后 `fetchGroupInfoWithoutMembersFromServer` 与 JoinedGroups 同步 |
| RN-GROUP-002    | logged_out          | group        | 未登录读取本地 JoinedGroups                                                  |
| RN-CONTACT-001  | logged_in_contact   | contact      | REST 改好友关系后联系人同步，结束后 snapshot restore                         |
| RN-CONTACT-002  | logged_out          | contact      | 未登录 `addContact` 返回 201                                                 |
| RN-PRESENCE-001 | logged_in_base      | presence     | `fetchPresenceStatus` 只读                                                   |
| RN-PRESENCE-002 | logged_out          | presence     | 未登录 `publishPresence` 返回 201                                            |
| RN-ROOM-001     | logged_in_base      | room         | `fetchPublicChatRoomsFromServer` 分页拉取                                    |
| RN-ROOM-002     | logged_out          | room         | 未登录拉取聊天室返回 201                                                     |
| RN-USERINFO-001 | logged_in_user_info | user_info    | `enableUserInfo` 下 `fetchOwnInfo`                                           |
| RN-USERINFO-002 | logged_in_user_info | user_info    | `fetchSubscribedUsers` 只读                                                  |
| RN-USERINFO-003 | logged_out          | user_info    | 未登录 `fetchSubscribedUsers` 返回 201                                       |

编号规则见下一节。

## 编写用例

用例写在 `example/src/ci/modules/<module>_cases.ts`。登录态放进 `register*Cases(ctx)`，未登录负例放进 `register*LoggedOutCases(ctx)`。registrar 只在 entry 模块加载时收集注册，注册当下不执行；每个 registrar 必须且只能被一个 entry 引用，`check_case_mapping.js` 会把零引用和多引用都判为违规。模块内部多个用例共用的 helper 留在该模块文件里，跨模块 helper 才提升到 `support/`。

entry 文件不可为了加用例而修改：不要增删改 entry、不要改共享 init、不要为了让一条用例塞进去而去改 workflow 或 runner。确实没有任何 entry 能提供所需 init（例如 `autoLoadConversations: false`）时，先记录冲突并确认，再单独设计。

最小用例：

```ts
ciTest(
  'RN-PRESENCE-002',
  'publishPresence while logged out throws 201',
  async () => {
    await expectCiError(
      () => ctx.client.presenceManager.publishPresence('away'),
      201
    );
  }
);
```

`ctx` 上可用：`ctx.client`（`ChatClient` 单例）、`ctx.config`（本次 `ci_run.json`：`appKey`、`accounts`、`loginToken`、`peerId`、`restApi`、`appToken`）、`ctx.rest`（`CiRestFixture`，只做准备、核对和恢复）。常用 helper：

- `ciTest(caseId, description, body)`：单例默认超时 2 分钟，超时即失败；用例严格串行。
- `addTearDown(fn)`：用例级清理，body 成功或失败后都执行，其中一个失败也不拦住其余 tearDown；tearDown 失败记为 cleanup failure 并使该用例失败。创建或修改资源时就在创建点登记。
- `expectCiError(op, code)`：负例的唯一断言方式，`ChatError.code` 必须精确等于 `code`。
- `waitForCi(description, read, matches, timeout?)`：200ms 轮询，默认 30 秒；超时错误带上最后一次观察到的值。
- `loginForCi(client, userId, token)`：登录并等到该 entry 的 `dataSyncType` 同步位和 `isConnected`（预算 45 秒）。
- `uniqueCiName(module, label)`：资源名 `ci_<module>_<ts>_<seq>_<label>`，重复运行不会撞名。
- `CiRestFixture`：联系人 snapshot/set/verify/restore、黑名单、建删群和聊天室、`verifyGroupAbsent` / `verifyChatRoomAbsent`（只有 404 算清理完成）、给离线 peer 发文本。

编号与登记：

- caseId 形如 `RN-<PREFIX>-<seq>`。前缀固定：`app→APP`、`auth→AUTH`、`conversation→CONV`、`message→MSG`、`group→GROUP`、`contact→CONTACT`、`presence→PRESENCE`、`room→ROOM`、`user_info→USERINFO`。每个模块从 `001` 起，登录与未登录共用序号，删除后的编号不复用。
- 每条用例必须同时登记 `testing/regression/native-case-mapping.json` 的 `caseId`、`entry`、`module`、`platforms`（`android` / `ios` 的子集）、`nativeRef`。
- `node testing/regression/check_case_mapping.js` 做代码与 mapping 的双向校验，并包含在 `bash ci/run_quality.sh` 里。运行时 `assert_ci_run.js` 还会把当前平台 mapping 中缺失的用例，以及日志里出现的未登记 `RN-*`，判为失败。

清理与禁止项：

- 每例独立准备、执行、断言、清理；结束后的服务端状态必须回到开始前。
- 改自己没创建的状态（联系人、黑名单）先 snapshot 再 restore。自建群和聊天室在 tearDown 里删除，并用 404 证明已不存在。不要删除或覆盖本次运行之前就存在的账号历史数据。
- REST 只安排前置和证明清理，不代替 SDK 断言。
- 不使用固定 sleep。监听必须在触发动作之前注册；用 `waitForCi` 等结果，不要用 `setTimeout`，也不要依赖可能已经发出的事件。
- 用例之间不能有顺序依赖。串行只是执行方式，每例必须单独能过，也不能留下下一条会碰巧依赖的状态。
- 凭据只从 `ci_run.json` 来。不要在代码或日志里写死 appKey、token、用户 ID（未登录 lane 使用的公开 demo key 除外），也不要打印它们。报告写入前会脱敏，但不能依赖这一点。
- 不放宽正确断言来绕过 SDK 缺陷；保留失败和证据。

本地验证新用例：

```bash
bash testing/regression/ci_test_local.sh android logged_in_contact '^RN-CONTACT-001$'
```

`testNameRegex` 只是运行时过滤。`assert_ci_run.js` 仍按 mapping 校验该 entry 的全部用例，没跑到的记为 `missing` 并失败。因此过滤只适合能覆盖该 entry 全部用例的情况；`logged_in_contact` 只有一条，所以上面的命令是安全的。一次运行 `total: 0` 判为失败，不是跳过。

运行过程中 `testing/regression/render_ci_log.js` 会尾随 `logcat.log` / `simulator.log`，把用例结果打到终端：compact 下每例一行 `✅` / `❌` / `🚫`（blocked），结束时有计数。它只是视图，判定仍只由 `assert_ci_run.js` 负责。reporter 由 `CI_LOG_REPORTER` 决定，默认 GitHub Actions 用 compact、本地用 expanded。事后重渲染：

```bash
node testing/regression/render_ci_log.js --reporter compact <logcat.log|simulator.log>
```

## 执行参数与 CI 工作流

| 变量                 | 作用                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `ANDROID_SERIAL`     | 多台 Android 设备/模拟器时指定目标；不设置时 adb 必须能唯一选中                                                 |
| `DEVICE_UDID`        | iOS 模拟器目标；脚本会校验并在需要时启动，建议显式设置                                                          |
| `E2E_*`              | 五个登录态凭据；全部设置才生效，否则回退 `config.local.json`                                                    |
| `E2E_USER_SUFFIX`    | 可选账号后缀，默认空；CI 分别为 `_rn_android_5x` / `_rn_ios_5x`（平台+线路后缀，与 1.x 线共用 app key，需隔离） |
| `E2E_PEER_ID`        | 完整 peer ID，原样使用；默认 `<有效登录账号>_ci_peer`                                                           |
| `CI_ENTRY_TIMEOUT_S` | 单个 entry 等待 `script.done` 的看门狗，默认 600 秒                                                             |
| `CI_SKIP_BUILD`      | `1` 时跳过构建；可配 `APK_PATH` / `APP_PATH` 指向别处的包                                                       |
| `SKIP_POD_INSTALL`   | iOS 设为 `1` 时跳过构建前的 Pods 刷新（默认每次刷新）                                                           |
| `CI_RUN_ID`          | 固定本次运行目录名；默认取启动时的本地时间戳                                                                    |

CI 中由 `.github/workflows/ci-device.yml` 执行：每天 UTC 19:37 定时和手动触发，Android/iOS 各有 `logged-out lane` 与 `logged-in lane`，构建 job 上传 APK/.app，测试 job 用 `CI_SKIP_BUILD=1` 运行 `ci_test_local.sh`。构建 job 和本地脚本现在都会在 iOS 构建前刷新 Pods；测试 job 不构建，因此不会重复安装。

## 结果

每次 `ci_test_local.sh` 执行只创建一个以本地时间戳命名的目录，格式为 `YYYYMMDDHHMMSS`，使用运行机器的时区，与 Flutter 保持一致。报告中的 ISO 时间字段仍保留 UTC。目录名只有时间戳、不带平台或 entry 后缀，所有产物都在其中：

```text
artifacts/regression/20261119105125/
└── android/
    ├── summary.md                # 本次执行总览：命令、设备、entry 结果
    ├── report.json               # 机器可读的平台级结果
    ├── run.json                  # 批次调度记录：命令、设备、entry 状态
    ├── runner.log                # 终端输出（含构建日志）
    ├── logged_out/
    │   ├── api_test.log          # 应用内结构化日志
    │   ├── logcat.log            # Android 原始 logcat
    │   └── summary.md            # 该 entry 的断言报告
    ├── base/                     # logged_in_base 的短名
    ├── group/                    # logged_in_group
    ├── contact/                  # logged_in_contact
    └── user_info/                # logged_in_user_info
```

iOS 执行把 `android/` 换成 `ios/`，原生日志名为 `simulator.log`。`summary.md`、`report.json`、`run.json` 和 `runner.log` 都放在平台目录里而不是时间戳目录根下；如果 Android 和 iOS 用同一个 `CI_RUN_ID` 跑，两者会并列在 `android/`、`ios/` 下，互不覆盖。

- 多 entry 时是多个 `android/<suite>/`、`ios/<suite>/` 子目录（suite 为 entry 短名），仍然全在同一个时间戳目录内。目录名是运行机器的本地时间，用 `date +%Y%m%d%H%M%S` 对照，或直接看终端打印的 run-id。
- `summary.md`（entry 级）含每条用例状态、失败 phase 与错误信息；平台级 `summary.md` 汇总该平台各 entry 的 PASS/FAIL 和产物位置。
- 状态语义：`pass` 通过；`fail` 断言失败；`blocked` 前置/基础设施失败导致没跑（算失败）；`missing` mapping 中有但日志没有；`unregistered` 日志中有但 mapping 没有。
- 报告与日志在 `artifacts/` 下，默认不进 Git；断言脚本只对报告做脱敏，`api_test.log`、`logcat.log`、`simulator.log` 是原始日志，分享前必须自行检查账号、appKey、token、设备 ID 和测试消息内容。

## 维护

- 新增/调整用例：按上面的编写规则更新代码和 mapping，跑 `bash ci/run_quality.sh` 和对应 entry 的本地回归。
- 修改 entry 的 init 组合或入口分类：先走设计确认，不能作为普通用例改动合并。
- 升级 native 基线时同步更新 mapping 的 `nativeBaseline`，并在报告中记录实际版本。
- 工具链或脚本行为变化时同步更新本文；如果文档与脚本不一致，以脚本为准并记录待修正点。
