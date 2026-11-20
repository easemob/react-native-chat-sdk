# 5.1.0 测试与 Demo 整体回迁到 1.21.0：实施计划

- 状态：代码迁移、目标 API 适配和主机验证已完成；P6 设备/远程验证因环境与授权未运行，当前交付为“代码已迁移、设备验证未完成”的阶段结果。
- 日期：2026-11-20。
- [规格](../../spec/test-demo-backport/2026-11-20-test-demo-backport-spec.md)
- [进度与恢复入口](2026-11-20-test-demo-backport-progress.md)

## 执行约定

- 工作目录固定为 `react-native-chat-sdk/.worktree/1.21.0`，使用已有目标 worktree。
- 源固定为 `2fa8397f4fb8880e677f78ab16d45ba81aec0b15`，目标起点为 `0219a9ad07d91341baca3c4d388f224f7b14a052`。
- 按「整体复制现有资产 → 原位适配 → 验证」推进，不逐例重写，不另建框架。
- 源文件集合中的删除也要同步处理；采用受控路径列表搬迁，不能对整个仓库执行覆盖或 reset。
- 每完成一个任务、发生阻塞或准备交接时，更新进度文档；检查通过后再勾任务。只在用户授权提交时统一提交，不为检查点制造中间提交。
- 多步骤工作采用主/子代理协作；整体复制和共享入口由主代理负责，适配可按互不重叠的文件分工。所有依赖、命令和测试都在具体子项目执行。
- 验证失败先区分目标能力缺失、接口差异、SDK 缺陷和环境阻塞；缺失能力才移除测试，接口差异原位适配。确认属于 TypeScript、iOS wrapper 或 Android wrapper 的 SDK 缺陷时，保留测试意图并记录证据，不修改测试来掩盖 SDK 错误。

## P0：用户审阅与指定 skill 审查

- [x] 编写规格、计划和恢复记录初稿。
- [x] 用户审阅本轮文档。
- [x] 用户看完后，查找并安装指定 `grill-me`，确认来源和实际指令，再用于审查方案。
- [x] 将审查结论写入现有规格/计划及进度记录；定时 CI 采用分支工作流迁移和手动运行范围，不新增默认分支 schedule。

完成判据：已确认执行版本及审查结论有记录。P0 已完成，进入 P1 基线复核。

## P1：复核基线与建立搬迁检查点

- [x] 读取当前 AGENTS 和本组文档，检查 `git status --short`、分支和 HEAD，识别用户新增修改。
- [x] 确认固定源提交可读；如果源或目标分支移动，记录差异并决定继续固定快照还是更新基线。
- [x] 用 `git ls-tree` / `git diff --name-status` 得到规格范围的受跟踪文件集合，复核 96 个 CI case 和 13 个多设备场景。
- [x] 将最终搬迁路径、目标独有保留项、预期删除项写入进度记录。私有配置只记存在性，不读取或登记其值。
- [x] 检查本地依赖与工具可用性，保存目标已有质量检查结果；依赖或设备不可用时记录阻塞范围，不伪造基线通过。

完成判据：来源、起点、工作区改动归属和输入规模清楚；能够区分旧问题与本次引入问题。

## P2：一次性搬入源资产

- [x] 从固定源提交整体复制 `example/src/`、`example/ci/`、`example/multi_cases/`、`src/__tests__/`、`scripts/ci/`、`.github/workflows/`。
- [x] 复制 `example/target-rn.yaml`、`example/multi-tool.json`、Babel 内联插件、`scripts/env-gettoken.js` 和必要测试说明文档。
- [x] 同步源已删除的旧工作流、专属脚本和旧 smoke/nightly JSON，限定在批准的搬迁范围。
- [x] 在目标 package scripts、忽略规则中合入源配套内容；核对 setup action，保留目标版本、依赖声明及原生集成基线。
- [x] 在进度记录中记录搬迁完成的路径及 `git diff --stat` 摘要，明确此时尚未完成兼容适配。

完成判据：源测试体系和 Demo 资产已整体进入目标，相关入口齐全；此检查点允许出现待适配的类型错误。后续恢复不得重新全量覆盖已经适配的文件。

## P3：在现有文件内完成版本适配

### P3a：Demo、公共入口与主机脚本

- [x] 调整 App/Babel 的三种自动化启动模式，保留源互斥机制。
- [x] 适配 Init/Login、API registry、auto 和事件监听；恢复目标适用的密码登录/推送入口。
- [x] 检查 token 查询设备时的 `isPassword:false`、会话分页参数、旧群选项和旧事件形状。
- [x] 适配报告基线、默认脚本和路径；脚本被移除时同步修改所有默认引用。
- [x] 原位修正 `auto_report.js` 按源脚本名强制要求 5.x 事件、输出源已知缺陷的规则，避免目标正常执行仍被报告为失败/缺口。

### P3b：CI 回归与 Jest

- [x] 保留 harness、5 entries、模块结构、准备和清理流程；原位适配初始化与 `loginForCi` 就绪等待。
- [x] 检查 RN-GROUP-001、RN-CONTACT-001 及联系人恢复的本地数据前置；使用旧公开 API 和现有等待工具完成必要加载，覆盖分页，不以连接成功代替数据就绪，不以手动刷新伪证自动同步契约。
- [x] 逐个模块处理 API 差异，维护现有 mapping；为移除项保留原 case ID、理由，不重用编号。
- [x] 按目标接口修正 SDK Jest、ci harness 和 agent 测试；从目标基线恢复仍适用的旧 API 覆盖。
- [x] 核实错误码/行为差异的契约依据，真实缺陷单列；不修改 SDK 实现来迁就测试。

### P3c：单设备脚本与多设备场景

- [x] 原位调整全部迁入 JSON 脚本的 API、参数、断言；保留、适配、移除结果可追溯。
- [x] 在现有 agent registry/listeners/canonical 中适配旧群配置、回执和连接事件。
- [x] 对账 13 个多设备场景的目标能力；保持测试意图，记录分支差异、源限制及待验证项。
- [x] 沿用外部编排器与 target 配置，记录工具定位/pin 状态，不引入编排器副本或开发 iOS reverse。

完成判据：每个源用例/场景均有处理结论；保留部分可注册、可编译，没有为凑数而保留空用例或伪成功。

## P4：工作流、原生工程与文档闭环

- [x] 确认工作流文件集合为 `ci.yml`、`ci-device.yml`，两套旧 workflow 已移除。
- [x] 核对 6 个设备 job 的构建、产物、entry 选择、凭据注入、启动与断言路径；保留源触发方式，不固定 checkout 到源分支。
- [x] 保留目标 `pod install --repo-update`；按需迁入测试构建所需原生设置，避免带入源 native 5.1.0、锁文件和签名配置。
- [x] 在现有 `run_quality.sh` 补入已有测试命令 `yarn test example/src --no-watchman --runInBand` 与 `yarn test:ci-scripts`；确认根 Jest 配置实际发现所有 example ci/agent 测试，保留 SDK unit/contract 与 mapping 检查。
- [x] 更新 `docs/ci/`、`docs/testing/` 和 AGENTS 的版本、用例数量、命令、分支差异及已知限制；不把源验收报告改头换面作为目标证据。
- [x] 全文检查旧入口、已删除文件和不适用 API 的悬空引用。

完成判据：工作流到代码、脚本、mapping、说明文档相互一致。

## P5：本地静态与主机验证

在目标 worktree 执行，记录退出码和证据位置：

| 检查 | 命令或方式 |
| --- | --- |
| 补丁与范围 | `git diff --check`，核对生产 SDK/native 及依赖声明未被迁入覆盖 |
| 类型与规范 | `yarn typecheck`、`yarn lint` |
| 全部 Jest | `yarn test --no-watchman --runInBand`；确认发现并执行 example 的 ci/agent 测试 |
| 主机脚本 | `yarn test:ci-scripts` |
| 用例映射 | `node scripts/ci/check_case_mapping.js` |
| 循环依赖 | `yarn check:circular:dpdm` |
| 库构建 | `yarn prepare`，检查生成内容未意外进入提交范围 |
| shell / workflow | 对改动 shell 使用 `bash -n`；检查 YAML 语法和本地 action/脚本引用，可用时使用现有 actionlint |
| CI 同口径 | `bash scripts/ci/run_quality.sh`；先检查该入口已包含哪些检查，避免无理由重复执行整套测试 |

- [x] 上述检查完成，无未解释失败。
- [x] 核对迁移清单：源总量 = 直接复用 + 适配 + 有理由移除；设备验证状态另计，不混入处理数量。

完成判据：静态、Jest、脚本、mapping 与构建检查通过。检查失败时修复后只重跑受影响项，再做必要集成核对。

## P6：设备与 GitHub 验证

- [ ] 构建 Android/iOS Demo，记录实际 native 解析版本和构建结果。
- [ ] 手工检查普通 Demo 的初始化、登录、API 搜索/调用、事件与日志。
- [ ] 双端执行 `bash scripts/ci/ci_test_local.sh <android|ios>`，记录 5 entries 的适配后数量和 pass/fail/blocked/not-run。
- [ ] 双端执行保留的单设备脚本：`yarn report:api --platform <android|ios> --script <适配后脚本>`，正反向结果分别记录。
- [ ] 具备外部编排器、账号和两台 Android 设备后，使用现有 `scripts/ci/multi.sh` 验证适用多设备场景；源限制或缺环境逐项记录。
- [ ] 记录测试数据清理结果，避免遗留创建的群、聊天室或联系人变更。
- [ ] 在用户授权发布分支/运行远程验证后，核对 GitHub 环境准入、五个凭据的配置状态和工作流分支行为，运行并记录 job URL/结果；未执行时明确标记。

完成判据：所有适用场景有结果和证据；阻塞项不得标记通过。iOS 多设备因源能力缺失属于范围外限制，其他未验证项继续保持待完成。设备条件不足或远程运行尚未获授权时，可以先交付「代码已迁移、验证未完成」的阶段结果；P6 和整项验收仍保持未完成。

## P7：交付与状态收口

- [x] 汇总适配/移除清单、缺陷候选、测试结果和限制，修正说明文档。
- [x] 将计划复选框与进度文档同步到实际状态，保证恢复入口准确。
- [x] 核对最终差异只包含搬迁、必要适配、文档及当前任务工作日志；不包含凭据和构建产物。
- [x] 向用户交付阶段结果；仅在用户授权时统一提交，英文 commit message；本计划不自动授权 push 或 GitHub 设置修改。

## 任务依赖与协作

```text
P0 用户审阅与 skill 审查
 └─ P1 基线与检查点
     └─ P2 整体搬迁
         └─ P3a 公共入口适配
             ├─ P3b CI/Jest
             └─ P3c 脚本/多设备
                 └─ P4 工作流/工程/文档闭环（依赖 P3a/P3b/P3c）
                     └─ P5 主机验证
                         └─ P6 设备/远程验证
                             └─ P7 交付
```

上图表示完整验收顺序；阶段性交付可以在 P6 尚有未验收项时报告当前结果，但不能据此勾选 P6/P7 完成。

P3b/P3c 可以分工，但共享 `App.tsx`、package、registry、工作流和进度记录由主代理统一维护；不得多个代理同时编辑同一文件。进度记录贯穿所有阶段，不等任务全部结束才补写。
