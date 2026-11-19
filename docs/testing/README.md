# 设备测试指南

本仓的设备测试分三层：**CI 设备回归**、**单设备 API 脚本**、**多设备协同**。三层都在 `example/` 应用里跑真实 native SDK，但目标、用例资产、构建开关和执行入口不同。一次构建只能进入一种自动化模式（`CI_RUN` / `API_SCRIPT` / `EASEMOB_AGENT` 互斥，同时内联会在启动时报错），所以先按验证目标选层，再写用例。

纯 TypeScript 逻辑用 Jest（`yarn test:unit`），TS 与 native 方法名契约用 `yarn test:contract`；本目录不重复这两类测试。

## 开始之前：环境与项目初始化

三层共用同一套工具链和仓库初始化。第一次在新机器上运行时，先完成本节；设备、账号和构建细节分别在对应文档展开。

| 依赖         | 要求                                                                        | 检查                                 |
| ------------ | --------------------------------------------------------------------------- | ------------------------------------ |
| Node.js      | 24.x（见 `.nvmrc`）                                                         | `node -v`                            |
| Yarn         | 4.14.1（仓库内 `.yarn/releases`，见 `packageManager`）                      | `yarn -v`                            |
| JDK          | 17                                                                          | `java -version`                      |
| Android SDK  | compileSdk 36；platform-tools、emulator；Apple Silicon 用 arm64-v8a 镜像    | `adb version`、`emulator -list-avds` |
| Xcode / Pods | 能构建 RN 0.83 的 Xcode（CI 使用 26.3）；Ruby >= 2.6.10、Bundler、CocoaPods | `xcodebuild -version`、`bundle -v`   |
| Dart         | 只在多设备层需要（Flutter SDK 自带，或单独安装 Dart SDK）                   | `dart --version`                     |

```bash
nvm use
corepack enable          # 如果本机还没有可用的 Yarn
yarn                     # 安装 workspace 依赖，不要用 npm
yarn prepare             # 生成 version/CMake/env，并构建 lib/
```

设备与账号不会在 `yarn prepare` 阶段准备：Android 需要一台已启动的模拟器/真机（多台时必须显式指定 `ANDROID_SERIAL`）；iOS 需要可用的模拟器，脚本会按 `DEVICE_UDID`/已 booted 规则选择，多台已 booted 时要求显式指定。登录态运行还需要 `example/config.local.json` 或五个 `E2E_*` 变量。完整步骤见 [CI 设备回归的“从零开始”](2026-11-19-ci.md#从零开始初始化设备与数据)；单设备与多设备文档只列各自差异。

## 按目标选择

| 类别            | 回答什么问题                                                                                | 用例位置                                               | 执行入口                                                     | 结果                                                       |
| --------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------- |
| CI 设备回归     | 公开契约在真实设备上是否长期不漂移？用例可在干净账号上重复，且能自建自清                    | `example/src/ci/modules/*_cases.ts`，按固定 entry 注册 | `bash scripts/ci/ci_test_local.sh <platform> [entries]`      | `artifacts/ci/<timestamp>/<platform>/summary.md`           |
| 单设备 API 脚本 | 某版本平版后的 API 参数、返回字段和错误码是否符合预期？逐步骤留下调用证据                   | `example/ci/*.json`                                    | `yarn report:api --platform <platform> [--script <json>]`    | `artifacts/single/<timestamp>/<platform>/report.md`        |
| 多设备协同      | 需要第二个运行中客户端才能验证的行为：送达/回执、好友申请、群通知、presence、同账号双端同步 | `example/multi_cases/*.yaml` + 同名 `.json`            | `scripts/ci/multi.sh all ...`（编排在 im-test-orchestrator） | `artifacts/multi/<timestamp>/<platform>/upgrade-report.md` |

选择时的几个判断点：

- **账号数量不等于客户端数量。** 同一个账号登在两台设备上验证同步，属于多设备层；一个账号一台设备即可完成的是单设备层。
- **CI 回归用例要能长期重复**：任意干净账号可跑、前置自建、退出前清理、断言只依赖公开契约。它不追求覆盖每个 API，只覆盖值得长期盯住的契约与本地状态行为。
- **单设备脚本层用于版本平版验收和工单复现**，可以只跑一次；但每次运行都要在报告里留下实际 SDK 版本、脚本和结果，不能只凭“调用成功”算通过。
- **多设备用例是跨端共享资产**，修改前先确认不是 RN 单侧行为；只允许 README 中明确声明的例外。

## 共同原则

1. 先定义验收目标、前置状态和核心断言，再选层；不要为了“能跑”补用例。
2. 每个变更评估三层适用性，但不要求三层都写；同一行为只在一层做权威验收。
3. 正向与反向分开；错误码按公开契约或 native 文档固定，不根据当前返回反推断言。
4. 监听先于触发；等待必须有超时；不使用固定 sleep。脚本的 `delayAfterMs` 只用于节流，不能代替断言。
5. 每例自建前置、自建清理；改他人状态先 snapshot 再 restore；删除自建群/聊天室并用 404 证明已清。
6. REST 只做准备、恢复和清理证明，不能替代被测 SDK 的断言。
7. 不放宽正确断言。结果区分 `pass` / `fail` / `blocked` / `not-run`；`blocked` 和缺失用例都不是通过。
8. 报告注明实际 SDK/native 版本、平台、设备和命令；日志与报告脱敏后再分享。
9. 共享的多设备用例先对账再改；只允许文档中明确声明的例外。
10. 文档与代码不一致时以代码和规范为准，并同步更新文档。

## 结果位置

| 层     | 目录与文件                                                                                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI     | `artifacts/ci/<timestamp>/<platform>/`：`summary.md`、`report.json`、`run.json`、`runner.log`，以及 `<suite>/` 下的 `api_test.log`、原生日志和 `summary.md`                                                                                         |
| 单设备 | `artifacts/single/<timestamp>/<platform>/`：`report.md`、`report.json`、`run.json`、`steps.json`、`events.sanitized.jsonl`、`issues.md`、`crash.log`                                                                                                |
| 多设备 | `artifacts/multi/<timestamp>/<platform>/`：`upgrade-report.md`、`upgrade-report.json`、`summary.md`、`statistics.csv`、各用例 `flow-report.json`、`device-<role>.log`；`tmp/` 下是 `run.log` 和原始证据。源目录仍在 `<IMTO>/multi/reports/<runId>/` |

`artifacts/` 与 orchestrator 的 `reports/` 都是本地证据，默认不进 Git。分享前确认日志已脱敏，且不含 appKey、token、真实账号或设备 ID。

## 与 Flutter 仓的关系

- **CI 回归和单设备脚本是各仓独立实现**，不共享用例，也不能把 Flutter 的报告结论直接当 RN 结论。
- **多设备用例是跨端 canonical 资产**：`example/multi_cases/` 与 Flutter 仓 `testing/multi-cases/` 同名 YAML/JSON 除唯一已声明的例外 `message-delivery` 外逐字节一致（原因见 [multi_cases README](../../example/multi_cases/README.md)）。改动用 orchestrator 的 `cases diff` 对账：当前预期 24 个 `identical`、仅 message-delivery 两文件 `content differs`（退出码 1）；除该例外外不应出现新的差异，例外修复后应恢复为 0。
- Flutter 仓的对应文档在其 `docs/testing/`，结构可参考，但命令和路径以本仓为准。

## 文档索引

- CI 回归：[CI 设备回归](2026-11-19-ci.md)；规范与新增用例流程见 [`docs/ci/README.md`](../ci/README.md)；设计背景见 [`docs/superpowers/specs/2026-11-18-ci-device-test-architecture-design.md`](../superpowers/specs/2026-11-18-ci-device-test-architecture-design.md)。
- 单设备脚本：[单设备 API 脚本](2026-11-19-single-device.md)。
- 多设备协同：[多设备协同](2026-11-19-multi-device.md)；用例目录说明见 [`example/multi_cases/README.md`](../../example/multi_cases/README.md)；编排、账号和报告格式见 im-test-orchestrator 仓的 `multi/README.md`。
