# 测试

本仓测试分四类。CI 编排层（`.github/workflows/` + [`ci/`](../ci/README.md)）按需调用其中的入口；本地与 CI 调用同一个入口。一次构建只能进入一种设备自动化模式（`CI_RUN` / `API_SCRIPT` / `EASEMOB_AGENT` 互斥，同时内联会在启动时报错）。先按验证目标选层，再写用例。

## 按目标选择

| 类别                               | 回答什么问题                                                                                | 怎么跑                                                                 | 用例                                                                              | 产物                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| ① 单元与契约                       | TypeScript 逻辑、TS 与 native 方法名是否一致？                                              | `yarn test:unit`、`yarn test:contract`、`yarn test:tools`              | `src/__tests__/`、`example/src/{agent,ci}/__tests__/`、`testing/**/test_*.js`     | —                                              |
| ② [设备回归](regression/README.md) | 公开契约在真实设备上是否长期不漂移？用例可在干净账号上重复，且能自建自清                    | `bash testing/regression/ci_test_local.sh <android\|ios> [entries]`    | `example/src/ci/modules/*_cases.ts`，登记于 `regression/native-case-mapping.json` | `artifacts/regression/<timestamp>/<platform>/` |
| ③ [单设备](single/README.md)       | 某版本平版后的 API 参数、返回字段和错误码是否符合预期？逐步骤留下调用证据                   | `yarn report:api --platform <android\|ios> [--script <json>]`          | `single/cases/*.json`                                                             | `artifacts/single/<timestamp>/<platform>/`     |
| ④ [多设备](multi/README.md)        | 需要第二个运行中客户端才能验证的行为：送达/回执、好友申请、群通知、presence、同账号双端同步 | `testing/multi/multi.sh all --target testing/multi/target-rn.yaml ...` | `multi/cases/*.{yaml,json}`                                                       | `artifacts/multi/<timestamp>/<platform>/`      |

选择时的几个判断点：

- **账号数量不等于客户端数量。** 同一个账号登在两台设备上验证同步，属于多设备；一个账号一台设备即可完成的是单设备。
- **设备回归用例要能长期重复**：任意干净账号可跑、前置自建、退出前清理、断言只依赖公开契约。它不追求覆盖每个 API，只覆盖值得长期盯住的契约与本地状态行为。
- **单设备脚本用于版本平版验收和工单复现**，可以只跑一次；但每次运行都要在报告里留下实际 SDK 版本、脚本和结果，不能只凭“调用成功”算通过。
- **多设备用例是跨端共享资产**，修改前先确认不是 RN 单侧行为；只允许 [multi/README.md](multi/README.md) 中明确声明的例外。

## 目录

- `regression/`：② 的执行入口、驱动封装、结果断言、日志渲染、用例登记表及其静态检查、token 获取。用法见 [regression/README.md](regression/README.md)。
- `single/`：③ 的报告 runner、本地构建运行脚本、断言、用例。用法见 [single/README.md](single/README.md)。
- `multi/`：④ 的 orchestrator 薄封装、RN target 配置、工具 pin、用例。用法见 [multi/README.md](multi/README.md)。
- `share/`：②③ 共用的设备驱动、设备选择、`[APITEST]` 日志解析与脱敏。没有单独的操作入口。
- `test_<x>.js` 与 `<x>.js` 同目录，由 `yarn test:tools` 执行。

## 设备侧模式名

| 类别       | 打包期内联开关  | 设备侧目录           |
| ---------- | --------------- | -------------------- |
| ② 设备回归 | `CI_RUN`        | `example/src/ci/`    |
| ③ 单设备   | `API_SCRIPT`    | `example/src/auto/`  |
| ④ 多设备   | `EASEMOB_AGENT` | `example/src/agent/` |

`ci_test_local.sh`、`run_ci_*.sh`、`assert_ci_run.js`、`render_ci_log.js` 文件名中的 `ci` 指 `CI_RUN` 模式，不是 CI 编排层。本地配置、账号、日志与报告均保持 Git 忽略。

## 环境

三层设备测试共用同一套工具链。第一次在新机器上运行时先完成本节；设备、账号和构建细节在对应目录的 README 里。

| 依赖         | 要求                                                                                                         | 检查                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Node.js      | 24.x（见 `.nvmrc`）                                                                                          | `node -v`                                           |
| Yarn         | 4.14.1（仓库内 `.yarn/releases`，见 `packageManager`）                                                       | `yarn -v`                                           |
| JDK          | 17                                                                                                           | `java -version`                                     |
| Android SDK  | compileSdk 36；platform-tools、emulator；Apple Silicon 用 arm64-v8a 镜像                                     | `adb version`、`emulator -list-avds`                |
| Xcode / Pods | 能构建 RN 0.83 的 Xcode（CI 使用 26.3）；Ruby >= 2.6.10、Bundler、CocoaPods（版本由 `example/Gemfile` 固定） | `xcodebuild -version`、`bundle -v`、`pod --version` |
| Dart         | 只在多设备层需要（Flutter SDK 自带，或单独安装 Dart SDK）                                                    | `dart --version`                                    |

macOS 上如果 `java` 不是 17，或 `adb` / `emulator` 找不到，先设环境再构建：

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
```

在仓库根目录初始化（不要用 `npm`）：

```bash
nvm use
corepack enable          # 如果本机还没有可用的 Yarn
yarn                     # 安装 workspace 依赖
yarn prepare             # 生成 version/CMake/env，并构建 lib/
```

设备与账号不会在 `yarn prepare` 阶段准备。Android 需要一台已启动的模拟器或真机，多台时必须显式指定 `ANDROID_SERIAL`；iOS 按 `DEVICE_UDID` 或已启动的模拟器选择，多台已启动时必须显式指定。登录态运行还需要 `example/config.local.json` 或五个 `E2E_*` 变量。设备回归的完整顺序见 [regression/README.md](regression/README.md)；单设备和多设备只写各自多出来的步骤。

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

| 层       | 先看                                                       |
| -------- | ---------------------------------------------------------- |
| 设备回归 | `artifacts/regression/<timestamp>/<platform>/summary.md`   |
| 单设备   | `artifacts/single/<timestamp>/<platform>/report.md`        |
| 多设备   | `artifacts/multi/<timestamp>/<platform>/upgrade-report.md` |

目录名是运行机器的本地时间 `YYYYMMDDHHMMSS`，报告里的 ISO 时间字段仍是 UTC。`artifacts/` 默认不进 Git。各层文件清单见对应 README。分享前确认日志已脱敏，且不含 appKey、token、真实账号或设备 ID。

## 与 Flutter 仓的关系

- **设备回归和单设备脚本是各仓独立实现**，不共享用例，也不能把 Flutter 的报告结论直接当 RN 结论。
- **多设备用例是跨端 canonical 资产**。对账规则和唯一例外见 [multi/README.md](multi/README.md)。
- Flutter 仓的对应文档在其 `docs/testing/`，结构可参考，但命令和路径以本仓为准。
- 与 Flutter 用例的对齐记录（历史）：[2026-11-20-ci-case-port.md](../docs/testing/2026-11-20-ci-case-port.md)。
