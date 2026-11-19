# 多设备协同测试用例（RN）

本目录保存多设备多账号测试用例：每个场景一个 YAML（流程与角色定义）配一个同名 JSON（命令、数据与断言），文件名格式 `<引入版本>-multi-<场景>-positive`。

本目录与 Flutter 仓 `im_flutter_sdk/testing/multi-cases/` 的同名 yaml/json 文件**逐字节一致**（D6：跨端共享 canonical 用例集），唯一已声明的例外是 message-delivery 场景（`5.0.0-multi-message-delivery-positive.yaml/.json`）：RN SDK 5.1.0 钉定的 native 版本（Android hyphenate-chat 5.1.0 / iOS HyphenateChat 5.1.0）存在 delivered 回执已知问题（RN wrapper 层两端链路完整，非 RN 代码缺陷），RN 副本做了两处最小差异——yaml 中 delivery 分支由 `delivery_ack_supported: false` 显式关闭，json 的 `requiredBindings` 移除 `global.biz.event.delivered`（该断言在当前 native 版本下物理上无法满足，保留会使判否恒成立）；其余内容与 Flutter 副本一致。**验证时机**：待 RN 分支升级 native 至含修复的版本（5.2.x）后，将 `delivery_ack_supported` 翻回 `true` 并恢复 requiredBindings，重跑本场景即完成验证。对账命令（在 im-test-orchestrator 仓 `multi/` 目录下执行）：

```bash
dart run bin/cli.dart cases diff <Flutter仓>/testing/multi-cases <本目录>
# 退出码 0 = 完全一致；只比较 .yaml/.json，README 不参与对账
```

用例由独立仓 **im-test-orchestrator** 编排执行，本仓库经薄封装入口调用：

```bash
scripts/ci/multi.sh generate --platform android   # 生成场景选择配置（默认扫本目录）
scripts/ci/multi.sh all --cases <选择配置>          # 全流程执行
```

app 侧 agent 的协议与 api/事件 canonical 约定见 im-test-orchestrator 仓的 `docs/agent-contract.md`；RN 侧实现落在 `example/src/agent/`（待建设）。本仓库目标配置（applicationId、logcat tag、构建/启动命令等）见 `example/target-rn.yaml`。

账号准备、设备要求、场景清单与排查记录见 im-test-orchestrator 仓的 `multi/README.md`；用例编写语法见其 `docs/case-authoring.md`。执行报告默认生成在 orchestrator 仓的 `multi/reports/<runId>/` 下。
