# 多设备协同

多设备层验证**需要至少两个同时运行的客户端**才能确认的行为：

- 消息送达/已读回执、跨端消息同步、消息编辑；
- 好友申请与接受、群成员加入/退出通知、群邀请确认；
- presence 发布与订阅、用户资料订阅；
- 同一账号在两台设备上的会话/群/资料同步。

本目录保存用例：每个场景一个 YAML（流程与角色）配一个同名 JSON（命令、数据与断言），文件名 `<引入版本>-multi-<场景>-positive`。用例由独立仓 **im-test-orchestrator** 编排执行。本仓保存 canonical 用例、RN 目标配置、app 侧 agent 和薄封装 `multi.sh`，不保存编排器代码。账号准备、场景语法和报告字段的完整定义见 orchestrator 仓的 `multi/README.md` 与 `docs/case-authoring.md`。

仓库初始化见 [测试入口的环境一节](../README.md#环境)。下面只写多设备多出来的步骤。

## 与 Flutter 仓的同步

本目录与 Flutter 仓 `im_flutter_sdk/testing/multi/cases/` 的同名 yaml/json **除下列唯一例外外逐字节一致**。修改任何用例都要同时更新两端，并在 im-test-orchestrator 仓的 `multi/` 目录对账：

```bash
dart run bin/cli.dart cases diff <Flutter仓>/testing/multi/cases <RN仓>/testing/multi/cases
# 只比较 .yaml/.json，README 不参与对账
# 当前预期：identical 26 个，content differs 仅 message-delivery 的 yaml/json，退出码 1
# 例外修复后应为全部 identical 且退出码 0；退出码 2 是用法错误
```

唯一已声明的例外是 `5.0.0-multi-message-delivery-positive.yaml/.json`：RN SDK 5.1.0 钉定的 native（Android hyphenate-chat 5.1.0 / iOS HyphenateChat 5.1.0）没有 delivered 回执。RN wrapper 两端链路是完整的，这不是 RN 代码缺陷。RN 副本做了两处最小差异：yaml 里 delivery 分支由 `delivery_ack_supported: false` 显式关闭，json 的 `requiredBindings` 去掉 `global.biz.event.delivered`（该断言在当前 native 上无法满足，留着会使判否恒成立）。其余内容与 Flutter 副本一致。native 升到含修复的 5.2.x 后，把 `delivery_ack_supported` 翻回 `true` 并恢复 requiredBindings，重跑本场景即完成验证。不要私自增加其他 RN 单侧差异；如果确有，必须先在本文件写明原因和恢复条件。

`5.2.0-multi-message-multibody-positive.yaml/.json` 直接采用 Flutter 仓的文件，两端逐字节一致，不是例外。它依赖 `sendMessage` 的 `bodies` 入参和消息 canonical JSON 的 `bodies` 字段（仅多体消息输出，单体消息形状不变）。orchestrator 的 `docs/agent-contract.md`（§10 `sendMessage`、§12.1/§12.2）目前还没有这两处说明，需要补写。

## 工具与输入

`testing/multi/multi.sh` 按以下顺序解析工具仓：

1. 环境变量 `IMTO_PATH`；
2. 本机默认路径 `/Users/asterisk/Codes/zuoyu/im-test-orchestrator`；
3. 按 `testing/multi/multi-tool.json` 的 pin 克隆到 `example/.im-test-orchestrator`（当前 pin 为空，不会生效）。

不要把 orchestrator vendor 进本仓，也不要加 submodule。下文的 `<IMTO>` 指实际解析到的工具仓根目录。

| 输入                  | 位置                        | 产生方式                                                           |
| --------------------- | --------------------------- | ------------------------------------------------------------------ |
| 用例 YAML/JSON        | 本仓 `testing/multi/cases/` | 手工维护，跨端同步                                                 |
| `accounts-input.json` | `<IMTO>/multi/config/`      | `generate_accounts_input.dart` 从 `example/config.local.json` 生成 |
| `accounts.g.dart`     | `<IMTO>/multi/lib/`         | `generate_accounts.dart` 经 REST 取 token 生成                     |
| `cases.json`          | `<IMTO>/multi/config/`      | `generate_cases.dart` 按平台/设备/账号生成                         |

`generate_accounts_input.dart` 的默认源是 Flutter 仓的 `example/config.local.json`。RN 必须显式传 `--source`。

## 环境与首次准备

在[共用环境](../README.md#环境)之外还需要：

| 依赖         | 要求                                                             | 检查                                               |
| ------------ | ---------------------------------------------------------------- | -------------------------------------------------- |
| Dart SDK     | 由 Flutter SDK 提供；orchestrator 用 `dart run` 执行             | `dart --version`                                   |
| Android 设备 | 至少两台可同时运行的 arm64 模拟器或真机                          | `adb devices`                                      |
| 设备 ABI     | `target-rn.yaml` 固定构建 `arm64-v8a`                            | `adb -s <serial> shell getprop ro.product.cpu.abi` |
| 账号         | `example/config.local.json` 里至少两条已在服务端存在的可登录账号 | 见下面的生成步骤                                   |

```bash
emulator -list-avds
emulator -avd <AVD-1> &
emulator -avd <AVD-2> &
adb devices
```

x86_64 模拟器会装不上或启动失败，不能直接复用。iOS 多设备暂不支持：orchestrator 的 reverse 宿主链路目前只走 `adb`，`target-rn.yaml` 的 `platform` 也只声明了 `android`。

RN 仓能构建 `example` 之后（`yarn`、`yarn prepare`），准备 orchestrator：

```bash
cd <IMTO>/multi
dart pub get

# 已有输出默认保留，加 --force 覆盖
dart run scripts/generate_accounts_input.dart \
  --source <RN仓>/example/config.local.json

# token 过期后重新执行
dart run scripts/generate_accounts.dart --input config/accounts-input.json
```

`accounts-input.json` 必填 `appKey`、`restApi`、`clientId`、`clientSecret`、`accounts[].id`。`restApi` 填基础地址，工具会按 appKey 拼组织/应用路径。`chatOptions` 会被展开到与 `appKey` 同层，作为 SDK init 参数。账号必须已在服务端存在。

## 执行

生成场景选择配置。生成失败时旧 `cases.json` 会保留。常见失败原因是账号为空、设备数量不足、账号或设备重复、指定值不存在。`message-recall` 在选择阶段自动跳过。

```bash
# 列出可用设备实例（Android 为 AVD 名）
cd <IMTO>/multi && dart run bin/cli.dart devices list --platform android

# 在 RN 仓根目录：默认扫描 testing/multi/cases，写入 <IMTO>/multi/config/cases.json
testing/multi/multi.sh generate --platform android --target testing/multi/target-rn.yaml
```

可选：`--case <场景主名>` 只生成一个场景；`--account <id>` / `--instance <id>` 指定账号与设备，可重复。

全流程：

```bash
testing/multi/multi.sh all \
  --cases <IMTO>/multi/config/cases.json \
  --target testing/multi/target-rn.yaml

# contact-add 的 prepare 和 run 都必须带账号数据
testing/multi/multi.sh all \
  --cases <IMTO>/multi/config/cases.json \
  --target testing/multi/target-rn.yaml \
  --data-input <IMTO>/multi/config/accounts-input.json
```

`all` / `run` / `report` 会把报告和原始日志收集到 `artifacts/multi/<timestamp>/<platform>/`，先看其中的 `upgrade-report.md`。源目录仍是 `<IMTO>/multi/reports/<runId>/`。

分段复验时在 `<IMTO>/multi/` 依次执行。新建轮次时 `prepare` 只接受 `--cases` / `--data-input`，`--run-id` 用于复用已有轮次。`launch` / `run` 的位置参数是具体 case 的 YAML，不是 target。

```bash
dart run bin/cli.dart prepare <case.yaml> --cases config/cases.json
# → 输出 runId

dart run bin/cli.dart devices start --platform android --instance <AVD> --run-id <runId>
dart run bin/cli.dart build --platform android --target <RN仓>/testing/multi/target-rn.yaml --run-id <runId>
dart run bin/cli.dart launch <case.yaml> --target <RN仓>/testing/multi/target-rn.yaml --run-id <runId>
# → 输出 launchId

dart run bin/cli.dart run <case.yaml> --target <RN仓>/testing/multi/target-rn.yaml \
  --run-id <runId> --launch <launchId>
# contact-add 另加 --data-input config/accounts-input.json

dart run bin/cli.dart report --run-id <runId>
```

每次复验都要重新 `launch`。账号、用例和设备的映射在 `prepare` 时固定，不要中途改。更换场景要重新 `generate` 再建新轮次。

## 目标配置

`testing/multi/target-rn.yaml` 的路径相对该文件所在目录（`testing/multi/`）：

- `appDir: ../../example`，`casesDir: cases`；
- `platform: android`，`transport: reverse`：宿主起 HTTP 端点，应用通过 `adb reverse` 轮询和上报；
- `app.applicationId` 为 `chatsdk.example`；`app.controlFlag` 为 `EASEMOB_AGENT=/data/local/tmp/rn_agent_control.json`（构建期注入，launch 前推送 `{port, token}`）；
- 构建在 `example/` 下逐字执行：`./android/gradlew -p android app:assembleDebug --no-daemon --console=plain -PreactNativeArchitectures=arm64-v8a -PbundleInDebug=true`，产物 `android/app/build/outputs/apk/debug/app-debug.apk`；
- 前置：`yarn install`，以及 `yarn gen:version_file`、`yarn gen:cmake_file`、`yarn gen:env_file`；
- 启动用 `adb shell am start -W -n chatsdk.example/.MainActivity`（`-W` 避免 `pidof` 竞态），停止用 `force-stop`；日志按 `ReactNativeJS:I testing_v2:I *:S` 过滤。

当前 target 固定 `arm64-v8a`。设备若是 x86_64 模拟器，需要改构建架构并重新验证，不能直接复用。

应用侧 agent 在 `example/src/agent/`（reverse 通道，只在 Debug 且内联了控制文件时启用）。协议见 `<IMTO>/docs/agent-contract.md`。`EASEMOB_AGENT` 与 `CI_RUN` / `API_SCRIPT` 互斥，冲突时启动即报错。

## 场景清单

| 场景                                     | 验证内容                 | RN 备注                                      |
| ---------------------------------------- | ------------------------ | -------------------------------------------- |
| `message-delivery`                       | 消息送达确认             | delivered 分支关闭（唯一声明例外）           |
| `message-read-receipt`                   | 已读回执                 |                                              |
| `contact-add`                            | 好友申请与接受           | 需要 `--data-input`                          |
| `group-member-join`                      | 群成员加入通知           |                                              |
| `presence`                               | 在线状态发布/订阅        |                                              |
| `message-device-sync`                    | 同账号双端消息同步       | 两个设备登录同一账号                         |
| `message-edit`                           | 消息编辑跨端同步         |                                              |
| `message-recall`                         | 消息撤回                 | 暂停执行，generate 自动跳过                  |
| `group-member-leave`                     | 退群/移出群通知          |                                              |
| `user-info-subscribe`                    | 用户资料订阅             |                                              |
| `group-namecard`                         | 群名片同步               | 已知问题                                     |
| `group-create-device-sync`               | 同账号双端建群及群名同步 |                                              |
| `group-invite-confirm`                   | 群邀请确认               |                                              |
| `5.2.0-multi-message-multibody-positive` | 多体消息收发             | 与 Flutter 逐字节一致，RN 侧尚未在设备上运行 |

## 报告

```text
artifacts/multi/<local timestamp>/<platform>/
  console.log                 # 本次调用的终端输出
  run-meta.json               # runId、平台、源目录
  upgrade-report.md / .json   # 先看 upgrade-report.md
  summary.md
  statistics.csv
  process.json
  <用例>/<序号>/flow-report.json
  <用例>/<序号>/device-<role>.log
  tmp/                        # run.log、issue-*.md、原始证据
```

目录名是运行机器本地时间 `YYYYMMDDHHMMSS`，报告中的 ISO 时间仍是 UTC。源产物仍在 `<IMTO>/multi/reports/<runId>/`。`build/<runId>/`（APK 和构建缓存，常见上百 MB）不会复制，需要时到 orchestrator checkout 取。`device-<role>.log` 可能是 `.log.gz`。

`dart run bin/cli.dart report --run-id <runId>` 可重建报告。跨轮汇总在 `<IMTO>` 根目录：

```bash
python3 report_upgrade.py \
  --version 5.2.0 \
  --single <RN仓>/artifacts/single/<timestamp>/<platform> \
  --multi <IMTO>/multi/reports/<多设备runId> \
  --output <IMTO>/reports/5.2.0/<汇总目录>
```

清理轮次会删日志和构建产物，部分阶段日志也可能被删，导致 `process.json` 的引用失效。需要完整追溯时不要清理：

```bash
dart run bin/cli.dart clean --run-id <runId> --type logs --type build
```

## 当前状态

以本仓报告为准，不要引用 Flutter 的结论。

- 14 个场景已就位。除 message-delivery 外与 Flutter 逐字节一致；多体场景同样一致，RN 侧尚未在设备上运行。
- Android 双模拟器已端到端验收 `message-delivery`、`presence`、`group-member-join`，run `20261119-073454-batch-99b01f8b`，3/3 通过。其余场景尚未逐场景验收。
- iOS 多设备挂起：reverse 宿主链路目前只支持 Android。
- `message-recall` 暂停执行；`group-namecard` 为已知问题；`contact-add` 需要 `--data-input`。

## 新增与排查

新增场景：

1. 先确认行为确实需要第二个运行中的客户端，并确定角色、账号和事件关联键。
2. 按 `<IMTO>/docs/case-authoring.md` 写 YAML 与同名 JSON。用例要有明确的准备、断言和业务清理，不能依赖固定 sleep 或执行顺序。
3. 同时更新 Flutter 与 RN 两份副本，跑 `cases diff`。除已声明的 message-delivery 外不应出现新的 `content differs`。
4. 在 Android 双设备上跑单场景，检查 `flow-report.json` 与 `device-*.log`，再把场景和验收状态补进本文件。

排查顺序：

1. `devices list` 确认设备在线，ABI 与 target 匹配；
2. 检查 `adb reverse --list` 是否包含 agent 端口，应用是否内联了正确的 `EASEMOB_AGENT` 路径；
3. 看 `<IMTO>/multi/tmp/<runId>/run.log` 和 `device-*.log`，再用 target 的 logcat tag 过滤；
4. 账号问题先重跑 `generate_accounts_input.dart --source ... --force` 和 `generate_accounts.dart`，确认账号存在、token 未过期；
5. iOS 多设备目前没有 reverse 支持，不要按 Android 步骤硬套。
