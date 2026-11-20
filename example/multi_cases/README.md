# 多设备协同测试用例（RN）

本目录保存多设备多账号测试用例：每个场景一个 YAML（流程与角色定义）配一个同名 JSON（命令、数据与断言），文件名格式 `<引入版本>-multi-<场景>-positive`。用例由独立仓 **im-test-orchestrator** 编排执行，本仓保存 canonical 用例、RN 目标配置、app 侧 agent 和薄封装入口。

设计与执行说明见 [`docs/testing/2026-11-19-multi-device.md`](../../docs/testing/2026-11-19-multi-device.md)；账号准备、场景语法和报告格式见 orchestrator 仓的 `multi/README.md` 与 `docs/case-authoring.md`。

## 与 Flutter 仓的同步

本目录与 Flutter 仓 `im_flutter_sdk/testing/multi-cases/` 的同名 yaml/json 文件**除下列唯一例外外逐字节一致**（D6：跨端共享 canonical 用例集）。例外是 message-delivery 场景（`5.0.0-multi-message-delivery-positive.yaml/.json`）：目标 native 基线（Android hyphenate-chat 4.25.1 / iOS HyphenateChat 4.25.0）存在 delivered 回执已知问题（RN wrapper 层两端链路完整，非 RN 代码缺陷），RN 副本做了两处最小差异——yaml 中 delivery 分支由 `delivery_ack_supported: false` 显式关闭，json 的 `requiredBindings` 移除 `global.biz.event.delivered`（该断言在当前 native 版本下物理上无法满足，保留会使判否恒成立）；其余内容与 Flutter 副本一致。**验证时机**：待 RN 分支升级 native 至含修复的版本后，将 `delivery_ack_supported` 翻回 `true` 并恢复 requiredBindings，重跑本场景即完成验证。

对账命令（在 im-test-orchestrator 仓 `multi/` 目录下执行）：

```bash
dart run bin/cli.dart cases diff <Flutter仓>/testing/multi-cases <RN仓>/example/multi_cases
# 只比较 .yaml/.json，README 不参与对账
# 当前预期：identical 24 个，content differs 仅 message-delivery 的 yaml/json，退出码 1
```

修改任何用例都要同时更新两端；除已声明的 message-delivery 例外外，对账不应出现新的 `content differs`，也不要私自增加 RN 单侧差异。例外修复后（native 5.2.x）两端应恢复为 `identical` 且退出码 0。

## 执行

首次执行前先完成[测试指南的环境初始化](../../docs/testing/README.md#开始之前环境与项目初始化)，并确认至少两台 arm64 Android 设备/模拟器在线、RN 的 `example` 能正常构建（`yarn`、`yarn prepare`）。`target-rn.yaml` 固定构建 `arm64-v8a`，x86_64 模拟器不能直接复用。

```bash
# 生成场景选择配置（默认扫描本目录，写入 <IMTO>/multi/config/cases.json）
scripts/ci/multi.sh generate --platform android --target example/target-rn.yaml

# 全流程执行；contact-add 还需 --data-input <IMTO>/multi/config/accounts-input.json
scripts/ci/multi.sh all \
  --cases <IMTO>/multi/config/cases.json \
  --target example/target-rn.yaml
```

首次使用需在 orchestrator 的 `multi/` 下生成账号输入（必须用 `--source` 指向 RN 的 `example/config.local.json`，因为工具默认读 Flutter 路径），再生成 `accounts.g.dart`，详见上述设计文档。`scripts/ci/multi.sh all/run/report` 会把报告和原始日志收集到 `artifacts/multi/<timestamp>/<platform>/`，先看其中的 `upgrade-report.md`；源目录仍是 `<IMTO>/multi/reports/<runId>/`。

## 当前状态

- 13 个场景用例已就位，与 Flutter 逐字节一致（message-delivery 除外）。
- 本轮目标 worktree 未运行多设备设备验证；源分支历史 run 不能视作目标 1.21.0 证据，保持 `not-run`。
- iOS 多设备挂起：orchestrator 的 reverse 宿主链路目前只支持 Android。
- `message-recall` 暂停执行（生成场景时自动跳过）；`group-namecard` 为已知问题；`contact-add` 需要 `--data-input`。

## Agent

app 侧 agent 已落在 `example/src/agent/`（reverse 通道，Debug 构建启用），协议与 api/事件 canonical 约定见 orchestrator 仓的 `docs/agent-contract.md`。RN 的 applicationId、logcat tag、构建/启动命令和 `EASEMOB_AGENT` 控制文件路径见 `example/target-rn.yaml`。
