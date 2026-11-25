# 多设备协同（testing/multi/cases）

## 定位

多设备层验证**需要至少两个同时运行的客户端**才能确认的行为：

- 消息送达/已读回执、跨端消息同步、消息编辑；
- 好友申请与接受、群成员加入/退出通知、群邀请确认；
- presence 发布与订阅、用户资料订阅；
- 同一账号在两台设备上的会话/群/资料同步。

用例是 YAML 流程加同名 JSON（命令、数据与断言），由独立仓 **im-test-orchestrator** 构建应用、启动设备、执行流程并出报告。RN 仓保存用例、目标配置和 app 侧 agent，不保存编排器代码。

当前 RN 状态（以报告为准，不要引用 Flutter 的结论）：

- 13 个 canonical 用例已就位，除下方 message-delivery 例外外与 Flutter 仓逐字节一致；第 14 个 `5.2.0-multi-message-multibody-positive` 采用 Flutter 仓的文件，同样逐字节一致，RN 侧尚未在设备上运行；
- Android 双模拟器已端到端验收 3 个场景：`message-delivery`、`presence`、`group-member-join`，run `20261119-073454-batch-99b01f8b`，3/3 通过；
- 其余场景 RN 侧尚未逐场景验收；
- iOS 多设备挂起：orchestrator 的 reverse 宿主链路目前硬绑 `adb`，需要单独开发；
- `message-recall` 暂停执行；`group-namecard` 为已知问题。

## 跨端共享与唯一例外

`testing/multi/cases/` 与 `im_flutter_sdk/testing/multi/cases/` 的同名 YAML/JSON **除唯一已声明的例外外逐字节一致**，这是跨端 canonical 用例约定（D6）。修改任何用例都必须同时改两端，并在 orchestrator 的 `multi/` 目录执行对账：

```bash
dart run bin/cli.dart cases diff <Flutter仓>/testing/multi/cases <RN仓>/testing/multi/cases
# 当前预期：identical 26，message-delivery 的 yaml/json content differs，退出码 1
# 例外修复后应变为 0 = 全部一致；2 = 用法错误
```

唯一已声明的例外是 `5.0.0-multi-message-delivery-positive.yaml/.json`：RN native 5.1.0（Android hyphenate-chat 5.1.0 / iOS HyphenateChat 5.1.0）没有 delivered 回执，RN 副本做了两处最小差异——YAML 的 delivery 分支用 `delivery_ack_supported: false` 关闭，JSON 的 `requiredBindings` 去掉 `global.biz.event.delivered`。等 native 升到含修复的 5.2.x 后，把这两处恢复并重跑，即完成该场景验证。例外必须写进 `testing/multi/README.md`；不要私自增加其他 RN 单侧差异。

`5.2.0-multi-message-multibody-positive.yaml/.json`（多体消息收发）取自 Flutter 仓，两端一致，不是例外。它依赖的 `sendMessage.bodies` 入参与消息 JSON 的 `bodies` 字段，还需要补进 orchestrator 的 `docs/agent-contract.md`。

## 工具与输入

`scripts/ci/multi.sh` 是 orchestrator 的薄封装，按以下顺序解析工具仓：

1. 环境变量 `IMTO_PATH`；
2. 本机默认路径 `/Users/asterisk/Codes/zuoyu/im-test-orchestrator`；
3. 按 `testing/multi-tool.json` 的 pin 克隆到 `example/.im-test-orchestrator`（当前 pin 为空，不会生效）。

不要把 orchestrator vendor 进本仓，也不要加 submodule。下文的 `<IMTO>` 指实际解析到的工具仓根目录。

输入分三类：

| 输入                  | 位置                        | 产生方式                                                           |
| --------------------- | --------------------------- | ------------------------------------------------------------------ |
| 用例 YAML/JSON        | 本仓 `testing/multi/cases/` | 手工维护，跨端同步                                                 |
| `accounts-input.json` | `<IMTO>/multi/config/`      | `generate_accounts_input.dart` 从 `example/config.local.json` 生成 |
| `accounts.g.dart`     | `<IMTO>/multi/lib/`         | `generate_accounts.dart` 经 REST 取 token 生成                     |
| `cases.json`          | `<IMTO>/multi/config/`      | `generate_cases.dart` 按平台/设备/账号生成                         |

注意 `generate_accounts_input.dart` 的默认源是 **Flutter 仓**的 `example/config.local.json`，RN 必须显式传 `--source`。

### 环境前置

多设备层除了测试指南里的 Node/Yarn/JDK/Android SDK 初始化，还需要：

| 依赖        | 要求                                                               | 检查                                               |
| ----------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| Dart SDK    | 由 Flutter SDK 提供；orchestrator 用 `dart run` 执行               | `dart --version`                                   |
| Android SDK | platform-tools、emulator；至少两台可同时运行的实例                 | `adb devices`、`emulator -list-avds`               |
| 设备 ABI    | `testing/target-rn.yaml` 固定构建 `arm64-v8a`，设备必须是 arm64    | `adb -s <serial> shell getprop ro.product.cpu.abi` |
| RN 构建前置 | `example` 能正常构建：已执行 `yarn`、生成了 version/CMake/env 文件 | 按需执行 `yarn prepare`                            |
| 账号        | `config.local.json` 中的账号必须已在服务端存在，至少两条可登录账号 | 见 orchestrator 的账号准备说明                     |

至少两台 arm64 Android 设备/模拟器要同时在线：

```bash
emulator -list-avds          # 没有 arm64 AVD 时先用 Android Studio 创建
emulator -avd <AVD-1> &
emulator -avd <AVD-2> &
adb devices                  # 两台都应为 device
```

`testing/target-rn.yaml` 的构建命令固定 `-PreactNativeArchitectures=arm64-v8a`；x86_64 模拟器会装不上或启动失败，不能直接复用。iOS 多设备暂不支持：orchestrator 的 reverse 宿主链路目前硬绑 `adb`，不能把 Android 换成 iOS 模拟器。`testing/target-rn.yaml` 的 `platform` 也只声明了 `android`。

### 首次准备

先确认 RN 仓能构建 `example`（如果已完成[测试指南的初始化](README.md#开始之前环境与项目初始化)，可跳过）：

```bash
cd <RN仓>
yarn
yarn prepare
```

再准备 orchestrator 的 Dart 依赖、账号和场景：

```bash
cd <IMTO>/multi
dart pub get

# 从 RN 的 config.local.json 生成账号输入；已有输出默认保留，加 --force 覆盖
dart run scripts/generate_accounts_input.dart \
  --source <RN仓>/example/config.local.json

# 取 token 并生成 accounts.g.dart；token 过期后重新执行
dart run scripts/generate_accounts.dart --input config/accounts-input.json
```

`accounts-input.json` 必填 `appKey`、`restApi`、`clientId`、`clientSecret`、`accounts[].id`；账号必须已在服务端存在。`restApi` 填基础地址，工具会按 appKey 拼组织/应用路径。`chatOptions` 会被展开到与 `appKey` 同层，作为 SDK init 参数。

### 生成场景

```bash
# 列出可用设备实例（Android 为 AVD 名，iOS 为 UDID）
dart run bin/cli.dart devices list --platform android

# 在 RN 仓根目录执行：默认扫描 testing/multi/cases，生成 <IMTO>/multi/config/cases.json
scripts/ci/multi.sh generate --platform android --target testing/target-rn.yaml
```

可选参数：`--case <场景主名>` 只生成一个场景；`--account <id>`/`--instance <id>` 指定账号与设备，可重复。生成失败时旧 `cases.json` 会保留；常见失败原因是账号为空、设备数量不足、账号/设备重复或指定值不存在。`message-recall` 会在选择阶段自动跳过。

## 执行

```bash
# 全流程：准备数据/设备 → 构建 → 安装启动 → 执行 → 报告；终端会先输出 runId
scripts/ci/multi.sh all \
  --cases <IMTO>/multi/config/cases.json \
  --target testing/target-rn.yaml

# contact-add 需要账号数据，prepare 与 run 都必须带 --data-input
scripts/ci/multi.sh all \
  --cases <IMTO>/multi/config/cases.json \
  --target testing/target-rn.yaml \
  --data-input <IMTO>/multi/config/accounts-input.json
```

需要分段复验时，在 `<IMTO>/multi/` 依次执行（新建轮次时 `prepare` 只接受 `--cases`/`--data-input`，`--run-id` 用于复用已有轮次；`launch`/`run` 的位置参数是具体 case 的 YAML，不是 target）：

```bash
dart run bin/cli.dart prepare <case.yaml> --cases config/cases.json
# → 输出 runId

dart run bin/cli.dart devices start --platform android --instance <AVD> --run-id <runId>
dart run bin/cli.dart build --platform android --target <RN仓>/testing/target-rn.yaml --run-id <runId>
dart run bin/cli.dart launch <case.yaml> --target <RN仓>/testing/target-rn.yaml --run-id <runId>
# → 输出 launchId

dart run bin/cli.dart run <case.yaml> --target <RN仓>/testing/target-rn.yaml \
  --run-id <runId> --launch <launchId>
# contact-add 另加 --data-input config/accounts-input.json

dart run bin/cli.dart report --run-id <runId>
```

每次复验都要重新 `launch`，历史轮次会保留并递增序号；账号、用例和设备的映射在 `prepare` 时固定，不要中途改。更换场景要重新 `generate` 再建新轮次。

## RN 目标配置

`testing/target-rn.yaml` 是 RN 的执行目标，关键点：

- `platform: android`，`appDir: ../example`、`casesDir: multi/cases`（均相对 target 文件所在目录，即 `testing/`）；
- `transport: reverse`：宿主起 HTTP 端点，应用通过 `adb reverse` 主动轮询/上报；需要 `app.applicationId`、`app.controlFlag`（`EASEMOB_AGENT=/data/local/tmp/rn_agent_control.json`，构建期注入，launch 前推送 `{port, token}`）、`build.command`、`build.artifacts`、`launch.start/stop`；
- 构建命令在 `example/` 下逐字执行：`./android/gradlew -p android app:assembleDebug --no-daemon --console=plain -PreactNativeArchitectures=arm64-v8a -PbundleInDebug=true`，产物为 `android/app/build/outputs/apk/debug/app-debug.apk`；
- 构建前置：`yarn install`，以及 `yarn gen:version_file`、`yarn gen:cmake_file`、`yarn gen:env_file`；
- UI 启动用 `adb shell am start -W -n chatsdk.example/.MainActivity`（`-W` 避免 `pidof` 竞态），停止用 `force-stop`；日志按 `ReactNativeJS:I testing_v2:I *:S` 过滤。

当前 target 固定 `arm64-v8a`，适配 Apple Silicon 上的 arm64 模拟器或真机；如果设备是 x86_64 模拟器，需要调整 target 的构建架构并重新验证，不能直接复用。reverse 传输目前只支持 Android，iOS 多设备要等宿主链路支持。

应用侧 agent 在 `example/src/agent/`，协议与 canonical API/事件约定见 `<IMTO>/docs/agent-contract.md`。`EASEMOB_AGENT` 与 `CI_RUN`/`API_SCRIPT` 互斥，冲突时启动即报错；agent 只在 Debug 构建且内联了控制文件时启用。

## 场景清单

| 场景                       | 验证内容                 | RN 备注                            |
| -------------------------- | ------------------------ | ---------------------------------- |
| `message-delivery`         | 消息送达确认             | delivered 分支关闭（唯一声明例外） |
| `message-read-receipt`     | 已读回执                 |                                    |
| `contact-add`              | 好友申请与接受           | 需要 `--data-input`                |
| `group-member-join`        | 群成员加入通知           |                                    |
| `presence`                 | 在线状态发布/订阅        |                                    |
| `message-device-sync`      | 同账号双端消息同步       | 两个设备登录同一账号               |
| `message-edit`             | 消息编辑跨端同步         |                                    |
| `message-recall`           | 消息撤回                 | 暂停执行，generate 自动跳过        |
| `group-member-leave`       | 退群/移出群通知          |                                    |
| `user-info-subscribe`      | 用户资料订阅             |                                    |
| `group-namecard`           | 群名片同步               | 已知问题                           |
| `group-create-device-sync` | 同账号双端建群及群名同步 |                                    |
| `group-invite-confirm`     | 群邀请确认               |                                    |

## 报告

`scripts/ci/multi.sh` 的 `all`/`run`/`report` 会在命令结束后把本轮产物收集到 RN 仓：

```text
artifacts/multi/<local timestamp>/<platform>/
  console.log                 # 本次调用的终端输出
  run-meta.json               # runId、平台、源目录
  upgrade-report.md / .json
  summary.md
  statistics.csv
  process.json
  <用例>/<序号>/flow-report.json
  <用例>/<序号>/device-<role>.log
  tmp/                        # orchestrator 的 run.log、issue-*.md、原始证据
```

目录名使用运行机器本地时间，格式为 `YYYYMMDDHHMMSS`，报告中的 ISO 时间字段仍保留 UTC。平台是下一级子目录，因此 Android/iOS 不会互相覆盖。源产物仍在 `<IMTO>/multi/reports/<runId>/`；`build/<runId>/`（APK 和构建缓存，常见上百 MB）**不会**复制，需要时到 orchestrator checkout 取。以下文件描述源目录：

- `upgrade-report.md`：先看这份，含跨端结论与不匹配摘要；
- `upgrade-report.json`、`summary.md`、`statistics.csv`、`process.json`；
- `<用例>/<序号>/flow-report.json`：单场景流程结果，`deviceLogs` 登记设备日志名；
- `device-<role>.log`（可能压缩为 `.log.gz`）；
- 收集后的 `tmp/` 内含编排器的 `run.log`、`issue-*.md`、设备原始日志和阶段证据。

`dart run bin/cli.dart report --run-id <runId>` 可重建报告。需要跨轮汇总时，在 `<IMTO>` 根目录执行：

```bash
python3 report_upgrade.py \
  --version 5.1.0 \
  --single <RN仓>/artifacts/single/<timestamp>/<platform> \
  --multi <IMTO>/multi/reports/<多设备runId> \
  --output <IMTO>/reports/5.1.0/<汇总目录>
```

清理轮次：

```bash
dart run bin/cli.dart clean --run-id <runId> --type logs --type build
```

清理会删日志/构建产物，部分准备、设备、构建、启动日志也可能被删，导致 `process.json` 的引用失效；需要完整追溯时不要清理。

## 新增与排查

新增场景：

1. 先确认行为确实需要第二个运行中客户端，并确定角色、账号和事件关联键。
2. 按 `<IMTO>/docs/case-authoring.md` 写 YAML 流程与同名 JSON；用例要有明确的准备、断言和业务清理，不能依赖固定 sleep 或执行顺序。
3. 同时更新 Flutter 与 RN 两份副本，运行 `cases diff` 确认除已声明的 message-delivery 例外外没有新的 `content differs`；若确有其他 RN 单侧差异，必须先在本目录 README 声明原因和恢复条件。
4. 在 Android 双设备上跑单场景，检查 `flow-report.json` 与 `device-*.log`，再把场景和 RN 验收状态补进本文件和 `testing/multi/README.md`。

排查顺序：

1. `devices list` 确认设备在线、ABI 与 target 匹配；
2. 检查 `adb reverse --list` 是否包含 agent 端口，应用是否内联了正确的 `EASEMOB_AGENT` 路径；
3. 看 `<IMTO>/multi/tmp/<runId>/run.log` 和 `device-*.log`，再用 target 的 logcat tag 过滤；
4. 账号问题先重跑 `generate_accounts_input.dart --source ... --force` 和 `generate_accounts.dart`，确认账号存在、token 未过期；
5. iOS 多设备目前没有 reverse 支持，不要按 Android 步骤硬套。
