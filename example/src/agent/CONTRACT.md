# RN Agent 契约说明

本目录实现 im-test-orchestrator 的 app 内 agent（React Native / TypeScript 版，reverse 通道），实施计划 Task 9 的交付物。

## 契约来源

实现依据为 orchestrator 仓的契约文档（单一事实来源，本目录不复制其内容）：

- 本地同级 checkout：`/Users/asterisk/Codes/zuoyu/im-test-orchestrator/docs/agent-contract.md`
- 经薄封装解析时（`IMTO_PATH` 或 pin 文件指定的 ref）：`<orchestrator>/docs/agent-contract.md`

契约分两层：

1. **通用层**：命令生命周期、结果信封（`success/data/error/failureKind`）、事件游标与缓冲降级、`[AGENT_CONTROL]` 凭据配对、finish 语义、传输映射。本目录实现 **reverse 通道**变体（宿主开端点，app 经 `adb reverse` / iOS sim loopback 主动轮询与上报；协议语义与 Flutter inbound 实现一致）。
2. **Easemob 参考实现层**：33 个 api 字符串 ↔ `src/` SDK 调用映射、事件回调的 canonical source/payload 映射、canonical JSON 形状表（message/error/group/presence/userInfo/readReceipt/recallInfo 等）。RN 适配点（字段改名、字符串枚举→int、`Map`→object 等）以契约表为准。

## 模块构成

| 文件 | 职责 |
|---|---|
| `types.ts` | 协议类型与常量（信封、事件、状态机、超时/缓冲上限） |
| `evidence_store.ts` | 事件缓冲：同步入队、seq 从 1 单调递增、10,000 条 / 32 MiB 有界降级（§5） |
| `command_service.ts` | 命令生命周期：§2.2 校验顺序、去重、单在途、超时守卫、uncertain/closed、结果信封（§3）、expect 兼容评估（仅 `success`/`errorCode`，未知字段容忍） |
| `registry.ts` | §10 api 注册表（32 个实现 + `ChatClient.getCurrentDeviceId` G1 typed 桩；`ChatClient.init` 走 `createInitHandler` 特例，不在注册表内）；SDK 依赖全部注入，单测用假身 |
| `canonical.ts` | SDK 模型 → canonical JSON（§12）与错误映射（§12.8） |
| `listeners.ts` | §11 监听器全集注册（连接/多设备/消息/群/联系人/聊天室/presence/userInfo），含 example 现有 `../listeners.ts` 缺的 multi-device 与 presence；canonical source 改名集中在此 |
| `transport.ts` | reverse 传输客户端：`GET /v1/queue` 长轮询、`POST /v1/results`、`POST /v1/events` 批量上报；Bearer 鉴权；410/401 视为宿主关闭，网络/5xx 退避重试 |
| `agent_mode.ts` | 入口与主循环：`EASEMOB_AGENT` 构建开关、agent_control.json 读取、`[AGENT_CONTROL]` 配对回显、命令轮询循环 + 事件 flush 循环（100ms 合并窗口）、finish 收尾排空 |

## 启动接入

- `example/src/App.tsx` 挂了 `AgentModeRunner`：`isAgentMode()` 为真时 `runAgentMode()`（与 `CiModeRunner` 并列）。
- 构建开关 `EASEMOB_AGENT=<agent_control.json 设备路径>`，类比 `CI_RUN` 由 babel 插件在打包期内联，非空即开启且仅 Debug 构建（`__DEV__`）生效，默认关闭；与 `CI_RUN` / `API_SCRIPT` 互斥（同时内联时报错拒绝启动）。
- **待办（Task 10/11）**：`example/babel-plugin-inline-api-env.js` 的 `ENV_NAMES` 需加入 `'EASEMOB_AGENT'`（单行改动，本任务边界外，当前未加——在此之前开关在真实包里恒为 undefined，即默认关闭）；宿主端 `adb reverse`、agent_control.json 推送、端点实现属 orchestrator 侧 target 配置。

## 版本对齐约定

- 契约文档与实现一同演进：修改本目录行为时若偏离契约，先改 orchestrator 仓的 `docs/agent-contract.md` 再改实现；两仓提交各自独立，引用以 pin 文件（`testing/multi/multi-tool.json`）的 ref 为准。
- 契约中标注"待 T11 实测校准"的字段，以三代表场景（message-delivery / presence / group-member-join）端到端实测结果为最终基准，校准后回填契约文档并去掉标注。
- 已知缺口：`ChatClient.getCurrentDeviceId` 在 RN SDK 无公开实现（契约 §13 G1），注册表内为 typed 桩（tool error -1），message-device-sync 场景的 RN 版用例允许显式差异。
- RN 侧已实现的协议 v2 强化：证据缓冲降级（degraded）后业务命令在提交路径即拒绝（503 `evidence_gap`），比 Flutter 侧现状多这一道拦截（契约 §5 注记的差异，RN 按协议要求落实）。

## 边界

- 只使用 SDK 公开 API（`src/`，`modules/` 零改动）。
- 不触碰现有设备回归资产（`example/src/ci/`、`testing/regression/`、`testing/share/`）；agent 构建开关与其他自动化入口（`API_SCRIPT` / `CI_RUN`）互斥，默认关闭。
- 零新增 npm 运行时依赖（reverse 通道用 RN 内置 `fetch`；配置文件读取用既有依赖 `react-native-fs`）。
