# im-test-orchestrator 实施计划

日期：2026-11-18
状态：已实现待提交审阅
关联规格：[2026-11-18-im-test-orchestrator-design.md](../specs/2026-11-18-im-test-orchestrator-design.md)
执行模式：主/子代理（本任务为跨三仓的中型以上任务，子代理逐 Task 执行，主代理验收与协调）
提交策略：全部任务完成、验收通过后统一提交——orchestrator 仓在过滤历史上追加提交；Flutter 仓一个提交；RN 仓一个提交（含 dailylog）。任何提交前须经用户确认。

## 工作边界（每个子代理 prompt 必须重申）

- Flutter 仓改动仅限 `/Users/asterisk/Codes/zuoyu_flutter/im_flutter_sdk/.worktree/5.1.0`；
- RN 仓改动仅限 `/Users/asterisk/Codes/zuoyu_rn/react-native-chat-sdk/.worktree/5.1.0`；
- 新仓位于 `/Users/asterisk/Codes/zuoyu/im-test-orchestrator`；
- RN 侧禁止改动 `example/src/ci/`、`scripts/ci/` 现有单设备 CI 资产（D7）；SDK 源码 `src/`、`modules/` 零改动；
- Task 6（Flutter 仓删除旧代码）执行前必须取得用户确认（D11）。

## P0 抽仓（orchestrator 仓）

- [x] **Task 1：filter-repo 抽取与自包含化**
  位置：`/Users/asterisk/Codes/zuoyu/im-test-orchestrator`（新建）
  内容：从 Flutter 仓 5.1.0 worktree 用 `git filter-repo --path testing/multi --path tool/flow_runner` 抽取（保留历史），`--path-rename` 重排为仓根 `multi/` + `flow_runner/`；修正 `multi/pubspec.yaml` path 依赖为 `../flow_runner`；`testing/report_upgrade.py` 拷入仓根并从 `bin/cli.dart:11` 改为仓内定位；跑 `dart pub get` + `dart analyze` + `dart test`，修复重排暴露的全部路径假设（已知：`test/integration_test.dart:118`、`test/build_test.dart:18,187`，以实际暴露为准）。filter-repo 不可用时降级为干净拷贝（D8）。
  验收：`dart analyze` 无告警、`dart test` 全绿（7100 行随迁测试）。

- [x] **Task 2：P0 最小文档**
  位置：orchestrator 仓
  内容：`README.md`（是什么、与 Flutter 仓的出处关系、quickstart 指到 multi/README.md）；`docs/architecture.md` 简版（三层结构图 + 执行模型一节）；`multi/spec.md` 协作规则随迁确认（交付契约第 8 条等原文保留）。
  验收：文档与实际目录结构一致，无跨仓路径引用。

## P1 验证 Flutter（Flutter 仓 5.1.0 worktree + orchestrator 仓）

- [x] **Task 3：用例目录参数化**
  位置：orchestrator 仓 `multi/`
  内容：`CaseLoader` 与 `scripts/generate_cases.dart` 增加 `--cases-dir` 参数指向外部用例目录；移除包内 `data/` 扫描行为；冻结副本 + SHA-256 机制不变；补 dart 测试。
  验收：`dart test` 绿；用 `--cases-dir` 指向 Flutter 仓 `testing/multi-cases/` 能完成 prepare。

- [x] **Task 4：最小参数化（app 目录 + 进程名/log tag）**
  位置：orchestrator 仓 `multi/`
  内容：按 spec 附录 A 清单执行——`BuildService` 接收显式 appDir（替代 `repository` + 硬编码 `im_flutter_sdk/example`，`cli.dart:32`/`build.dart:28-29`）；iOS 进程名 `Runner`（launch.dart:534/616/697-698）与 logcat tag 过滤（launch.dart:510-521）提为配置项，默认值保持现有行为；flutter 版本钉死校验（build.dart:40-46）提为可配置约束；CLI 增加对应参数。全部默认值保持现状，`dart test` 不红。
  验收：`dart test` 绿；不传新参数时行为与现状完全一致。

- [x] **Task 5：场景迁移 + Flutter 侧封装 + 全量设备验证**
  位置：Flutter 仓 5.1.0 worktree + orchestrator 仓
  内容：13 个场景 yaml+json `git mv` 至 Flutter 仓 `testing/multi-cases/`（内容零改动）；新增 `testing/target-flutter.yaml`（登记现有 example 信息）、`testing/multi-tool.json` pin 文件（repo 留占位、ref 留空，注明 GitHub 同步后回填）、`scripts/multi.sh` 薄封装（D13 解析顺序，当前阶段支持 IMTO_PATH 与同级 checkout 两条路径）；经封装从 orchestrator 仓对 Flutter example 跑全部 13 场景（双模拟器），结果与抽离前基线一致。
  验收：13 场景 verdict 与基线一致（基线 = Flutter 仓历史验证记录 `docs/porting/5.1.0/2026-11-09-test-verification.md` 中各场景结论）；`scripts/multi.sh` 两条解析路径均可用。

- [x] **Task 6：Flutter 仓删除旧代码与引用更新**（⛔ 执行前取得用户确认，D11）
  位置：Flutter 仓 5.1.0 worktree
  内容：删除 `testing/multi/`、`tool/flow_runner/`；更新 `AGENTS.md:38,44` 验证架构表与 `CONTRIBUTING.md:55` 链接指向新仓；历史文档（docs/spec、docs/plan 等）按 append-only 保留不动。
  验收：`git status` 仅含预期变更；grep 无残留活跃引用。

## P2 开发 RN（RN 仓 5.1.0 worktree + orchestrator 仓）

- [x] **Task 7：完整 target yaml + cases diff**
  位置：orchestrator 仓 `multi/`
  内容：在 Task 4 参数化基础上收敛为 spec 6.2 的 target yaml 格式（`--target` 传入）；`templates/target.example.yaml` 模板；Flutter target 配置回放 = Task 5 基线（dart 测试固化）；实现 `cases diff` 对账命令（D12：两目录同名 yaml/json 的 sha256 差异清单，退出码语义文档化）；补 dart 测试。
  验收：`dart test` 绿；flutter target 回放回归通过；`cases diff` 自测两目录一致/不一致两种情形。

- [x] **Task 8：agent 契约文档**
  位置：orchestrator 仓 `docs/agent-contract.md` + RN 仓 `example/src/agent/CONTRACT.md` 引用
  内容：两层结构（spec 6.5）——通用层：命令生命周期、结果信封、事件游标、缓冲降级、凭据配对、finish、reverse 传输映射表；Easemob 参考实现层：13 场景所需 api 字符串 ↔ 两端 SDK 调用映射、canonical JSON 形状表（message/error/conversation 等，以 Flutter 实测事件 jsonl 为基准逐字段定义）、事件名映射。
  验收：Flutter 现有 agent 的每个 api/事件都能在表中找到对应行（反向校验）；RN SDK 公开 API 侧每个 api 有明确实现路径。

- [x] **Task 9：RN reverse 通道 agent**
  位置：RN 仓 `example/src/agent/`
  内容：按 spec 6.3 实现——reverse 传输客户端（命令长轮询/结果上报/事件批量上报，RN 内置 fetch，零新依赖）；SDK 命令注册表（按 Task 8 契约实现 api 子集）；事件缓冲（listener 回调内同步入队、seq 编号、有界）；`[AGENT_CONTROL]` 配对日志（格式与协议约定对齐）；debug 构建开关（复用/类比现有 CI_RUN 内联机制，默认关闭）；jest 单测（注册表映射、事件缓冲、信封构造、失败分类）。
  验收：`yarn test --no-watchman` 绿（新增测试入列）；`yarn lint`/`yarn typecheck` 绿。

- [x] **Task 10：RN target 配置 + 用例目录播种**
  位置：RN 仓 + orchestrator 仓
  内容：`example/target-rn.yaml`（gradle 构建命令、applicationId、进程名、logcat 策略、adb reverse 端口）；`example/multi-tool.json` + `scripts/ci/multi.sh`（D13，与 Flutter 侧同逻辑）；`example/multi_cases/` 从 Flutter 仓 `testing/multi-cases/` 逐字节拷贝播种 13 场景；`cases diff` 验证两端一致（D6）；Flutter 专有场景标注跳过。
  验收：`cases diff` 输出零差异（或仅含已声明例外）。

- [x] **Task 11：三代表场景端到端**
  位置：RN 仓 example + orchestrator 仓
  内容：经 `scripts/ci/multi.sh` 用 orchestrator 对 RN example 跑 message-delivery → presence → group-member-join（双 Android 模拟器）；逐个排查 canonical JSON 形状偏差并修契约表或 agent（不得弱化断言）；iOS 双模拟器回归三场景。
  验收：三场景 verdict=是，证据链完整（flow-report.json + events jsonl）；iOS 与 Android 结果一致。
  结果（2026-11-19）：Android 三场景 3/3 verdict=是（run 20261119-073454-batch-99b01f8b）；message-delivery 按用户决策方案 A 做显式差异标注（RN SDK 5.1.0 native 层无 delivered 事件实现，见 multi_cases/README 声明例外）。iOS 双模拟器回归经评估为新增 host 驱动开发（reverse 通道硬绑 adb），用户决策 A 挂起转后续独立任务，orchestrator README 已记为已知限制。

- [x] **Task 12：文档收口**
  位置：orchestrator 仓 + RN 仓
  内容：orchestrator `docs/protocol-v2.md`（从 flow_runner docs 提炼）、`docs/case-authoring.md`（泛化其 test-case-authoring）、README 更新接入方式；RN 仓 `AGENTS.md` 增补 multi-device 模式条目（与现有单设备 CI 条目并列、边界清晰）；两仓 dailylog 追加；本计划复选框全部勾选、状态改为"已实现待提交审阅"。
  验收：文档间无矛盾引用；RN `run_quality.sh` 绿。

## 任务依赖关系

```
Task 1 ──→ Task 2
Task 1 ──→ Task 3 ──┐
Task 1 ──→ Task 4 ──┴──→ Task 5 ──→ Task 6（D11 用户确认门）
                          Task 4 ──→ Task 7 ──┐
Task 5 ──────────────────┬────────────────────┤
Task 8 ──→ Task 9 ───────┴──→ Task 10 ──→ Task 11 ──→ Task 12
```

可并行组：P0 内 Task 1→2 串行；P1 内 Task 3 ∥ Task 4；P2 内 Task 7 ∥ Task 8 ∥ Task 9，三者齐后 Task 10，再 Task 11 → Task 12。

## 验收总清单（提交前）

- [ ] orchestrator 仓：`dart analyze` + `dart test` 全绿；仓内无 Flutter/RN 仓路径引用
- [ ] Flutter 仓：13 场景经新仓编排 verdict 与基线一致；旧代码已删、活跃引用已更新
- [ ] RN 仓：三代表场景 Android + iOS 双模拟器端到端绿；13 用例文件就位且 `cases diff` 零差异；`run_quality.sh` + `yarn test:ci-scripts` 绿
- [ ] 三仓 dailylog 已追加
