# im-test-orchestrator 独立仓设计与 RN 接入规格

日期：2026-11-18
状态：待评审
关联任务：抽离 Flutter 多设备测试编排系统为独立通用工具仓，先验证 Flutter，再开发 React Native 侧

## 1. 背景与目标

Flutter 仓（`im_flutter_sdk`）内经过多轮迭代验证的多设备测试系统由三层组成：

| 层 | 位置 | 语言 | 职责 |
|---|---|---|---|
| flow_runner | `tool/flow_runner/` | Dart (~2800 行) | 通用 YAML 流程语言解释器（与 IM 业务无关） |
| testing/multi | `testing/multi/` | Dart (~6600 行) | 编排宿主：账号/设备/构建/启动/执行/报告/清理 + CLI |
| App 内 agent | `im_flutter_sdk/example/lib/agent/` | Dart (~650 行) | example app 内嵌的 HTTP 控制服务（phase-control 协议 v2） |

目标：将前两层的 Dart 代码**原样抽离**为独立 git 仓库 `im-test-orchestrator`，成为跨平台（Flutter / React Native / 未来第三平台）共享的单一实现工具仓，消灭"两端各维护一份编排语义"的双实现漂移问题。

核心原则：**该仓是通用设计，与具体 app、具体 IM SDK 解耦；别人拿到协议文档和 target 模板即可接入自己的 app。**

## 2. 范围

### 2.1 本次任务内（P0–P2）

- **P0 抽仓**：建立 `/Users/asterisk/Codes/zuoyu/im-test-orchestrator` 本地 git 仓，自包含、`dart test` 全绿；
- **P1 验证 Flutter**：新仓编排 Flutter example（agent 零改动）跑通用例，通过后 Flutter 仓删除旧代码、改用例归属；
- **P2 开发 RN**：编写 agent 契约表、RN example 新增 TS agent、target 适配、RN 用例目录建立并端到端跑绿。

### 2.2 非目标（本次不做）

- CI 化（reusable workflow、nightly、runner 选型）——设计预留，后续独立任务；
- pub.dev 发布与开源文档打磨（LICENSE、双语 README、社区化）；
- 单设备/单账号用例迁移（orchestrator 语法上天然支持单 agent 用例，具备该能力即可，不展开）；
- Flutter 仓 CI workflow 改造（P1 删除旧代码前需确认无 CI 引用，见 8.3）。

## 3. 已确认的设计决策

| # | 决策 | 依据 |
|---|---|---|
| D1 | **不移植 TypeScript，Dart 代码原样抽离单仓维护** | 双实现漂移是最大长期风险；Dart 运行时对 TS 项目是普通外部工具依赖 |
| D2 | **用例 yaml/json 分别放在各 app 仓**，orchestrator 仓不放 Easemob 业务用例 | orchestrator 保持通用最小集；用例与被测 app 同仓演进 |
| D3 | **target/adapter 配置放各 app 仓**（构建/启动/安装命令、appId、进程名、日志谓词） | app 自己最懂自己的工具链；orchestrator 保持业务无关 |
| D4 | **先用 Flutter 验证，后做 RN** | Flutter agent 已成熟且零改动，隔离抽仓风险 |
| D5 | **RN agent 用 TypeScript 新写**，不复用 RN 现有单设备脚本模式 | 控制面协议（逐命令 HTTP + 事件游标）与"整包脚本推设备"模式本质不同 |
| D6 | **跨端共享场景（Flutter 存量 13 个）的 yaml/json 在两端保持逐字节一致** | 通用性的实证标准；两端差异只出现在 SDK API 确实不同的场景 |
| D7 | **现有 RN 单设备 CI 架构（`example/src/ci/`、`ci_test_local.sh`）完全不动** | 两种模式并存，与 Flutter 侧"CI tests / AI tests 独立"规则一致 |
| D8 | **新仓保留 git 历史**（filter-repo 抽取两个路径并重排；失败则干净拷贝并在 README 注明出处） | 提交历史是设计决策的考古记录，成本主要在重排后修测试路径 |
| D9 | **RN agent 传输层采用 reverse 通道**（宿主开端点、app 经 `adb reverse` 主动轮询），协议语义不变 | RN JS 侧无 HTTP server 能力；零原生代码、零新依赖 |
| D10 | **P2 验收收敛**：3 个代表场景端到端绿（message-delivery 消息因果 / presence 订阅发布 / group-member-join 群事件，分别覆盖跨设备断言、双向事件、REST 前置）+ 13 场景用例文件全部就位；其余 10 场景端到端验证列为后续任务 | 全量端到端是体力活不是设计风险，先打穿架构与契约 |
| D11 | **Flutter 旧代码删除纳入本次任务**，P1 验证全绿后执行，执行前再向用户确认一次 | 缩短新旧并存窗口，降低漂移风险 |
| D12 | **orchestrator 提供 `cases diff` 对账命令**（输入两个 app 仓用例目录，输出同名文件 sha256 差异清单），本地手动跑，不挂 CI | 够用的精度 + 零流程负担 |
| D13 | **引入方式为薄封装脚本**，不用 git submodule、不用提交符号链接 | 工具目录不进 git；各 app 仓只受版本管理"封装脚本 + pin 文件"两个小文件；升级 = 改 pin 的 ref + PR 评审，可回滚可二分 |

## 4. 总体架构

### 4.1 仓库布局

```text
/Users/asterisk/Codes/zuoyu/
└── im-test-orchestrator/          # 新仓（P0 创建，后同步 GitHub）
    ├── flow_runner/               # 通用 YAML 流程解释器（Dart 包，自包含）
    │   ├── lib/  test/  docs/
    ├── multi/                     # 编排宿主（Dart 包，path 依赖 ../flow_runner）
    │   ├── bin/cli.dart
    │   ├── lib/src/               # cli/core/state/data/devices/build/launch/
    │   │                          # execution/reporting/cleanup/contracts
    │   ├── test/                  # 7100 行测试随迁
    │   └── pubspec.yaml           # path 依赖由 ../../tool/flow_runner 改为 ../flow_runner
    ├── docs/
    │   ├── architecture.md        # 总体架构与执行模型
    │   ├── protocol-v2.md         # phase-control 控制面协议规范（从 flow_runner docs 提炼）
    │   ├── agent-contract.md      # agent 实现契约（语义 + 传输 + api 命名规范）
    │   └── case-authoring.md      # 用例编写指南（从其 test-case-authoring 文档泛化）
    ├── templates/
    │   └── target.example.yaml    # target 配置模板
    └── README.md

zuoyu_flutter/im_flutter_sdk/      # Flutter 仓（P1）
├── example/lib/agent/             # Dart agent ✅ 保留不动
├── testing/multi-cases/           # 新增：13 个存量场景 yaml+json 迁此（原 testing/multi/data/）
├── testing/target-flutter.yaml    # 新增：Flutter example 的 target 配置
├── testing/multi-tool.json        # 新增：pin 文件 {repo, ref}（GitHub 同步后启用克隆回退）
├── scripts/multi.sh               # 新增：薄封装（解析顺序见 D13）
└── testing/multi/  tool/flow_runner/   # ⛔ P1 验证通过后删除

zuoyu_rn/react-native-chat-sdk/    # RN 仓（P2）
├── example/src/agent/             # 新增：TS agent（控制面客户端 + SDK 命令注册表）
├── example/multi_cases/           # 新增：RN 用例目录（共享场景从 Flutter 侧逐字节拷贝播种）
├── example/target-rn.yaml         # 新增：RN example 的 target 配置
├── example/multi-tool.json        # 新增：pin 文件
├── scripts/ci/multi.sh            # 新增：薄封装
└── example/src/ci/  scripts/ci/   # ✅ 现有单设备 CI 完全不动
```

**D13 薄封装解析顺序**（两侧 `multi.sh` / Makefile target 同一逻辑）：

```text
1. 环境变量 IMTO_PATH 显式指定 → 直接使用
2. 同级目录存在 im-test-orchestrator checkout → 直接使用（本地开发快路径，改工具即时生效）
3. 以上都没有 → 按 pin 文件 {repo, ref} 克隆到 gitignored 目录
```

分阶段落地：GitHub 同步之前仅第 1、2 条可用（文档写明）；同步后第 3 条自动解锁，未来 CI 复用同一路径。工具目录永不进 git。

### 4.2 运行时架构

```text
宿主（macOS，dart run multi/bin/cli.dart all --cases <清单>）
  ├─ flow_runner 解释器
  │    ├─ parallel / if / for / set / delay / barrier   ← YAML 控制流
  │    ├─ cmd        → POST /v1/commands（api 字符串 + 已解析参数）
  │    ├─ wait_event → GET  /v1/events（seq 游标长轮询 + lazy match/checks）
  │    └─ $global 绑定（declare→claim→complete，跨分支唯一数据通道）
  ├─ devices（adb/simctl）→ build（target 配置的构建命令）→ launch（装/杀/启/刮凭据/握手）
  └─ reporting → verdict 四档（是/否/未执行/未完成）+ 证据落盘

设备 N：example app + agent
  └─ phase-control v2 语义：命令执行（success/data/error/failureKind）、
     事件流（seq、SDK 回调名、payload、有界缓冲）、finish
```

传输层按平台分两种实现（语义完全一致，见 6.3）：

- **inbound（Flutter agent，已有）**：app 内嵌 HTTP server，宿主直连（adb forward / sim loopback）；
- **reverse（RN agent，P2 新建）**：宿主侧由编排进程开 HTTP 端点，app 经 `adb reverse`（Android）或 sim loopback（iOS）主动长轮询/拉取。

## 5. 从原系统复刻保留的机制（不改设计）

以下机制经多轮迭代验证，抽离过程**逐字随迁、不做重新设计**：

1. **交付-验收模型**：`OperationResult` 信封（runId/operationId/status/data/errors/evidence），下游使用前重新验收（归属、哈希、外部状态复查），不合格即阻断；
2. **权威状态**：`tmp/<runId>/run.json` 单点快照，原子落盘（temp+rename+chmod 600），跨进程文件锁；
3. **verdict 四档判定** + `requiredBindings` 防静默绿（每条必要绑定恰好一条 passed 记录）；
4. **超时三层**：step（默认 30s）→ flow（yaml 强制 flowTimeoutMs）→ 收尾（stop 3s / finish 5s / evidence 10s）；宿主命令层 deadline；
5. **wait_event 游标语义**：游标快照起点、命中后共享游标前进、顺序 wait 不重复匹配、lazy match（引用未产出 → null → 继续等）；
6. **账号/设备分离**：设备角色（YAML agents）与账号槽位（account1..N）两个命名空间，登录哪个账号由命令参数 `$global.account.accountN.*` 决定；
7. **无自动重试**：复验 = 显式新一轮 attempt，保留历史；
8. **解释器步骤九原语**：cmd / wait_event / parallel（不可嵌套）/ barrier / if / for / while / set / delay；
9. **expect 判定**：`{success?, errorCode?, checks?}`，checks 六操作符（equals/gte/notEmpty/containsItem/contains/length）；`delayAfterMs` 被拒绝（延时属于 YAML）；
10. **runner 自身测试体系**（7100 行）：契约单测 / FakeHost 宿主命令假身 / FakeAgent + 真实 loopback HTTP 集成测试，随迁即验收清单。

## 6. 新增设计（抽离时必须引入）

### 6.1 仓自包含化（P0）

抽离后切断对 Flutter 仓的一切路径引用。以下清单已经过事实核查（2026-11-18，对 Flutter 仓 5.1.0 worktree 逐项验证）：

- `multi/pubspec.yaml` 的 path 依赖改为仓内 `../flow_runner`（`flow_runner` 本身零跨目录引用，可独立成仓）；
- **`report_upgrade.py` 随仓携带**：`bin/cli.dart:11` 以 `${root.parent.path}/report_upgrade.py` 硬编码定位（目标缺失时非零退出、CLI 失败），`upgradeReporter` 本就是可注入可选回调。处理方式：把 `testing/report_upgrade.py` 拷入新仓，`bin/cli.dart` 改为仓内定位，注入机制不动；
- **`BuildService` 结构性假设**（`lib/src/cli.dart:32` 要求 multi 位于 `<仓根>/testing/multi`；`build.dart:28` 从"仓根"硬编码拼 `im_flutter_sdk/example`）：P0 登记，**P1 随最小参数化解决**（见 6.2）；
- 其余耦合点全部属于 target 泛化面，见附录 A 硬编码清单；
- `accounts.g.dart` 的 dart 子进程加载机制自包含、无外部引用，保留。

### 6.2 target/adapter 机制（P1 最小参数化 → P2 完整 target yaml）

事实核查确认：build/launch/devices 硬编码 Flutter 工具链（完整清单见附录 A），且 `BuildService` 的"仓根"结构性假设使**不参数化则 P1 无法构建**。因此分两阶段：

**P1 最小参数化**（能跑通 Flutter 验证即可，不追求配置格式）：

- `repository` / `im_flutter_sdk/example` 概念改为显式传入的 **app 目录**（BuildService 接收 appDir，CLI 增加对应参数）；
- iOS 进程名 `Runner`（launch.dart 3 处）、Android logcat tag 过滤（launch.dart 2 处）提为构造参数/配置项，默认值保持现有行为；
- flutter 版本 3.47.0 钉死校验（build.dart:40-46）提为可配置约束，默认保持；
- `devices` 就绪判据中的 `flutter devices --machine`（devices.dart:255）保持不变（Flutter 验证期间需要）。

**P2 完整 target yaml**（在最小参数化基础上收敛为配置格式）：

```yaml
# 各 app 仓持有，orchestrator 通过 --target 传入
name: rn-android
platform: android
build:
  command: ["yarn", "example", "android:ci-apk"]   # 构建命令原样执行
  artifacts:
    - path: example/android/app/build/outputs/apk/debug/app-debug.apk
app:
  applicationId: com.chatsdkexample
  controlFlag: EASEMOB_AGENT=1                    # 启用 agent 的构建开关
launch:
  start: ["adb", "shell", "am", "start", "-n", "<pkg>/.MainActivity"]
  stop:  ["adb", "shell", "am", "force-stop", "<pkg>"]
  logStream: ["adb", "logcat", "-v", "epoch"]     # 刮 [AGENT_CONTROL] 凭据
```

规则：

- target 由 app 仓持有（D3），orchestrator 只消费；`templates/target.example.yaml` 提供模板；
- **P2 改造必须以 Flutter target 配置回放出现有行为为回归标准**（P1 的结果即基线），flow_runner 与判定逻辑零改动；
- `devices` 就绪判据中的 `flutter devices --machine` 检查移入 flutter target 的可选钩子，RN target 不含；
- Easemob REST 账号 provider（`data.dart`）本次保留为唯一实现，在 `agent-contract.md` 中声明 provider 接口为扩展点，不为假想需求实现第二 provider。

### 6.3 RN agent 传输层：reverse 通道（P2）

Flutter agent 是 app 内嵌 HTTP server（Dart `dart:io` 直接可用）。RN 的 JS 侧没有等价物，引入原生 HTTP server 依赖会显著放大 agent 体积和维护面。方案：**保持协议语义不变，反转传输方向**。

| | Flutter agent（inbound） | RN agent（reverse） |
|---|---|---|
| 命令下发 | 宿主 POST /v1/commands | app 长轮询 GET /v1/queue?waitMs（经 adb reverse / sim loopback 连宿主） |
| 命令结果 | 宿主 GET /v1/commands/&lt;id&gt; | app POST /v1/results |
| 事件上报 | 宿主 GET /v1/events?afterSeq | app POST /v1/events（批量，带 seq） |
| 凭据配对 | 日志刮 `[AGENT_CONTROL] {port, token}` | 同（console.log 进 logcat/os_log），token 换取宿主端点 |
| finish | 宿主 POST /v1/finish | app 收到收尾命令自行关闭上报 |

- 语义（命令幂等、failureKind、事件游标、有界缓冲、超时降级）与协议 v2 完全一致，`agent-contract.md` 以语义为准、传输为例外显式文档化；
- iOS 模拟器上 app 的 localhost 即宿主 localhost，无需额外配置；Android 由 launch 阶段 `adb reverse tcp:<port> tcp:<port>`；
- 备选方案（RN 原生层写 HTTP server）成本明显更高，仅当 reverse 通道被证伪时回退。

### 6.4 用例目录参数化（P1）

- orchestrator 的 case 扫描/冻结（CaseLoader）增加 `--cases-dir` 参数，指向 app 仓用例目录；存量行为（扫描包内 data/）移除，P1 起用例只在 app 仓；
- `generate_cases.dart` 同步接受 `--cases-dir`；
- 建轮冻结副本 + SHA-256 机制不变。

### 6.5 Agent 契约表（P2 核心交付物）

`agent-contract.md` 分为两层：

1. **通用层（orchestrator 仓）**：agent 必须实现的语义契约——命令生命周期、结果信封 `{success, data, error{code,message}, failureKind}`、事件 `{seq, source, payload}`、缓冲上限与降级行为、凭据配对、finish；
2. **Easemob 参考实现层（RN 仓 docs 持有，Flutter 侧已隐含实现）**：api 字符串 ↔ 两端 SDK 调用的映射表，如 `ChatClient.init` / `ChatClient.loginWithToken` / `ChatManager.sendMessage` / `ChatClient.isConnected` / `ChatClient.logout`；**canonical JSON 形状表**（message/error/conversation 等跨端序列化字段归一，两端 agent 在边界处完成转换）；事件名映射（`onMessagesReceived` ↔ 两端各自的 listener）。

通用性原则：第三方接入时只需定义自己的 api 词汇表并实现自己的 agent，yaml/json 用例格式零变化。

## 7. 分阶段实施

### P0 抽仓（验收：`dart analyze` + `dart test` 全绿，仓内无 Flutter 仓路径引用）

1. 用 `git filter-repo`（保留历史）从 Flutter 仓抽取 `testing/multi` + `tool/flow_runner` 两个路径，目录重排为 `multi/` + `flow_runner/` 置于仓根；若 filter-repo 成本超预期，降级为干净拷贝并在 README 注明出处；
2. 修正 path 依赖，仓库独立 `dart pub get`；
3. 6.1 自包含化清单逐项处理；
4. 补 `README.md` + `docs/architecture.md`（简版，详细文档随 P1/P2 渐进补全）。

### P1 验证 Flutter（验收：13 个场景在新仓编排下全绿 = P1 前基线结果一致）

1. 13 个场景 yaml+json 迁至 Flutter 仓 `testing/multi-cases/`；
2. orchestrator 实现 6.4 用例目录参数化；
3. **实现 6.2 P1 最小参数化**（app 目录参数 + 进程名/log tag 可配置），使新仓能从独立位置构建 Flutter example；
4. Flutter 仓新增 `testing/target-flutter.yaml` 雏形、`testing/multi-tool.json` pin 文件与 `scripts/multi.sh` 薄封装；
5. 本地双模拟器逐场景跑绿，与抽离前基线对比；
6. Flutter 仓删除 `testing/multi`、`tool/flow_runner`，`AGENTS.md:38,44`、`CONTRIBUTING.md:55` 引用改指新仓（**已核实 CI 零引用**，执行删除前再向用户确认，D11）。

### P2 开发 RN（验收（D10）：message-delivery / presence / group-member-join 三场景双 Android 模拟器端到端绿 → iOS 双模拟器回归；13 场景用例文件全部就位）

1. 6.2 P2 完整 target yaml 改造，flutter target 回放 P1 基线回归；
2. 编写 RN target 配置 + `agent-contract.md` 两层内容；
3. 实现 `cases diff` 对账命令（D12）；
4. RN example 新增 `example/src/agent/`：reverse 通道客户端 + 命令注册表（按契约表实现 api 子集，覆盖 13 个场景所需）+ SDK 事件缓冲（seq 编号，复用现有 `ChatEvents` listener 机制）+ debug 构建开关 + `[AGENT_CONTROL]` 配对日志；
5. RN 用例目录 `example/multi_cases/` 建立：共享场景从 Flutter 侧逐字节拷贝（D6，用 `cases diff` 验证一致），Flutter 专有场景标注跳过；
6. 端到端：三代表场景 android 双模拟器 → iOS 双模拟器回归；其余 10 场景端到端验证列后续任务；
7. agent 单测（jest：命令注册表、事件缓冲、信封构造）。

## 8. 现有项目适配清单

### 8.1 Flutter 仓

| 项 | 动作 |
|---|---|
| `example/lib/agent/` | 不动 |
| `testing/multi/data/` | 迁至 `testing/multi-cases/` |
| `testing/target-flutter.yaml`、`testing/multi-tool.json`、`scripts/multi.sh` | 新增（P1） |
| `testing/multi`、`tool/flow_runner` | P1 验证后删除 |
| Makefile / docs / AGENTS.md 中的引用 | 改指新仓 |
| 13 场景 yaml/json 内容 | 不动（迁移即搬运） |

### 8.2 RN 仓（本 worktree）

| 项 | 动作 |
|---|---|
| `example/src/agent/`、`example/multi_cases/`、`example/target-rn.yaml`、`example/multi-tool.json`、`scripts/ci/multi.sh` | 新增（P2） |
| `example/src/ci/`、`scripts/ci/`、`.github/workflows/ci-device.yml` | 不动（D7） |
| SDK 源码（`src/`、`modules/`） | 不动；agent 只使用公开 API |
| `package.json` | 视 agent 实现需要补充 jest 测试入口，不新增运行时依赖（reverse 通道用 RN 内置 fetch） |

### 8.3 跨仓检查项（已事实核查，2026-11-18）

- **Flutter 仓 `.github/workflows/` 零引用**（ci.yml / device-smoke.yml / single-account-nightly.yml 均不触碰 `testing/multi`、`tool/flow_runner`），根 Makefile 无相关 target——P1 删除无 CI 阻断；
- 删除时需同步更新的活跃引用：`AGENTS.md:38,44`（验证架构表）、`CONTRIBUTING.md:55`（multi 入口链接）；历史文档（`docs/spec/2026-11-06-testing-v2-spec.md`、`docs/plan/`、`docs/testing/` 等十余处）按 append-only 文化保留不动，仅活跃入口改指新仓。

## 9. 测试策略

| 层 | 内容 | 位置 |
|---|---|---|
| 编排器回归 | 随迁 7100 行 dart test，P0 验收基线 | orchestrator 仓 |
| Flutter 回归 | P1 13 场景结果与抽离前基线一致 | 设备实测 |
| target 泛化回归 | flutter target 回放 = P1 基线 | orchestrator 仓 dart test + 实测 |
| RN agent 单测 | jest：注册表映射、事件缓冲 seq、信封/失败分类 | RN 仓 `example/src/agent/__tests__/` |
| RN 端到端 | 双模拟器场景全绿 | 设备实测 |

## 10. 风险与开放问题

| 风险/问题 | 影响 | 对策 |
|---|---|---|
| `report_upgrade.py` 被 `bin/cli.dart` 硬编码相对路径引用（已核实：`bin/cli.dart:11`，目标缺失时 CLI 失败） | P0 自包含失败 | 已确定方案：随仓携带 + 仓内定位（6.1），P0 执行 |
| `BuildService` 结构性假设（`cli.dart:32`、`build.dart:28` 拼 `<仓根>/im_flutter_sdk/example`） | 不参数化则 P1 无法构建 | P1 最小参数化（6.2），登记入 P1 任务 |
| reverse 通道时序差异（app 轮询宿主 vs 宿主轮询 app） | wait_event 延迟、flow 超时边界 | 语义不变、长轮询参数沿用协议 v2；P2 先用 message-delivery 验证时序 |
| 两端 SDK 数据形状差异（message/error 序列化） | canonical JSON 不一致导致同一用例一端红 | 契约表逐字段定义，P2 实现时以 Flutter 事件 jsonl 实测样本为基准 |
| `git filter-repo` 重排目录后测试路径引用（已核实命中：`test/integration_test.dart:118`、`test/build_test.dart:18,187` 等） | P0 测试红 | 先跑 dart test 暴露全部路径假设再修 |
| RN 的 JS 单线程长轮询与 SDK 事件并发 | 事件 seq 乱序或丢事件 | 事件缓冲在 listener 回调内同步入队（先进队后异步上报） |

## 11. 假设（未经确认按此执行）

1. 新仓历史保留采用 `git filter-repo`（D8）；失败则干净拷贝；
2. orchestrator 仓内文档用英文（开源导向），本 spec/plan 用中文（仓库约定）；
3. ~~P1 中 Flutter 仓的删除动作在实测全绿后执行，删除前向用户再确认一次~~（已由 D11 确认为正式决策，执行前确认保留）；
4. RN agent 不引入任何新 npm 运行时依赖（D9，reverse 通道用 RN 内置 fetch）；
5. 共享 13 场景在 RN 侧如遇 SDK 确实不支持的 api（极个别），允许该场景 RN 版内容差异，但需在用例文件头注释说明（违背 D6 的显式例外）。

## 12. 工作边界（硬约束）

- **Flutter 仓**：一切改动只发生在 `/Users/asterisk/Codes/zuoyu_flutter/im_flutter_sdk/.worktree/5.1.0`（5.1.0 worktree/分支）。主 checkout 与其他 worktree 不碰；
- **RN 仓**：一切改动只发生在 `/Users/asterisk/Codes/zuoyu_rn/react-native-chat-sdk/.worktree/5.1.0`。主 checkout 不碰；
- 新仓 `im-test-orchestrator` 在 `/Users/asterisk/Codes/zuoyu/` 下新建，git 历史独立；由用户后续同步 GitHub。

## 附录 A：Flutter 工具链硬编码清单（事实核查 2026-11-18，P1/P2 改造面）

| 文件 | 位置 | 内容 |
|---|---|---|
| build.dart | :28-29 | example 路径 `p.join(repository.path, 'im_flutter_sdk', 'example')` |
| build.dart | :40-46 | `flutter --version --machine` + 硬编码校验 frameworkVersion == 3.47.0，不符抛错 |
| build.dart | :47-48 | `flutter build` 执行 |
| build.dart | :51, :55 | 产物路径 `example/build/app/outputs/flutter-apk/app-debug.apk`、`example/build/ios/iphonesimulator` |
| build.dart | :169-178 | `buildArguments()`：Android `['build','apk','--debug','--dart-define=API_CONTROL=true']`；iOS `['build','ios','--simulator','--debug',...]` |
| build.dart | :262-275 | `validateArtifact`：契约校验硬编码 `API_CONTROL=true`、禁 `API_SCRIPT`、iOS 必须 `--simulator` 且禁 `--no-codesign` |
| launch.dart | :510-521 | logcat 过滤器 `'flutter:I'`、`'testing_v2:I'`、`*:S` |
| launch.dart | :507, :567-577 | 就绪探针 tag `testing_v2_<opId>_<ts>`（adb shell log -t） |
| launch.dart | :534 | iOS 日志谓词 `process == "Runner"` |
| launch.dart | :616, :697-698 | 日志行 PID/时间戳解析正则（`Runner\[(\d+):`）3 处 |
| launch.dart | :619, :678 | 配对标记 `[AGENT_CONTROL]`（协议耦合，进 agent-contract.md） |
| devices.dart | :255 | `flutter devices --machine` 就绪判据 |
| bin/cli.dart | :11 | `report_upgrade.py` 上级目录定位（P0 解决） |
| lib/src/cli.dart | :32 | `BuildService(repository: root.parent.parent)` 结构性假设（P1 解决） |
| test/ | integration_test.dart:118、build_test.dart:18,187 | 测试 fixture 拼 `im_flutter_sdk/example/...` 路径（P0 修） |

协议耦合约定（不属于工具链硬编码，归入 agent-contract.md）：`[AGENT_CONTROL]` 配对日志格式、`testing_v2` marker tag、`API_CONTROL` 构建开关。
