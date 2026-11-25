# 测试入口

设计与分类见[测试指南](../docs/testing/README.md)。目录布局与 Flutter 仓 `im_flutter_sdk/testing/` 对齐。

| 目录 / 文件 | 内容 | 入口 |
|---|---|---|
| `single/cases/` | 单设备平版 JSON 脚本 | [单设备说明](../docs/testing/2026-11-19-single-device.md)；`yarn report:api --platform <android\|ios> [--script <json>]` |
| `multi/cases/` | 多设备平版 YAML/JSON 场景（与 Flutter 仓同名文件逐字节一致，例外见多设备说明） | [多设备说明](multi/README.md)；`scripts/ci/multi.sh`（编排工具为独立仓 im-test-orchestrator） |
| `target-rn.yaml`、`multi-tool.json` | 多设备编排的 RN 目标配置、编排工具 pin | 经 `scripts/ci/multi.sh --target testing/target-rn.yaml` 使用 |
| `../example/src/ci/` | CI 回归用例（设备上运行） | [测试指南](../docs/testing/README.md) |

`example/src/` 是共用的执行端（auto 模式、多设备 agent）和人工界面。本地配置、账号、日志与报告均保持 Git 忽略。
