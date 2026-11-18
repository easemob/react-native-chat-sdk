# RN CI 设备回归测试架构实现计划

- 日期：2026-11-18
- Spec：[2026-11-18-ci-device-test-architecture-design.md](../specs/2026-11-18-ci-device-test-architecture-design.md)
- 状态：已实现，待最终提交审阅
- 提交策略：所有任务完成、检查全过后统一单次提交（commit message 英文），提交前把本文件任务复选框更新为完成态

## 任务列表

### Task 1：harness 运行器 + Jest 单测

- [x] 新建 `example/src/ci/harness.ts`：`suite` / `ciTest`（默认 2 分钟超时）/ `beforeAll` / `afterAll` / `addTearDown` / 串行执行器；tearDown fail-safe 全执行；区分 body / prepare / cleanup 失败相位
- [x] 新建 `example/src/ci/config.ts`：`CiRun`/`CiConfig` 类型、RNFS 读取 `CI_RUN` 指向的 `ci_run.json`（`entry` + `testNameRegex` + `config` 凭据），logged_out 入口允许省略账号字段
- [x] harness 注册/调度/teardown 语义的 Jest 单元测试：`example/src/ci/__tests__/harness.test.ts`，随根 `yarn test` 执行（根 jest 配置默认拾取 example 下测试文件，见 spec §5.2）
- [x] 验证：`yarn test --no-watchman` 通过

### Task 2：support 四件套

- [x] `example/src/ci/support/expect.ts`：最小断言集 + `expectCiError(op, code)`（reject 且 `ChatError.code` 精确相等才通过）
- [x] `example/src/ci/support/wait_for.ts`：`waitForCi`（200ms 轮询，默认 30s，超时报错含最后观测值）
- [x] `example/src/ci/support/unique.ts`：`ci_<模块>_<ts>_<seq>_<label>` 唯一命名
- [x] `example/src/ci/support/login.ts`：`loginForCi`（显式 dataSyncType 掩码校验、`onDataSyncFinish` 按掩码收齐、`errorCode === 0` 判成功、`isConnected` 轮询、45s 总预算、finally 移除监听）
- [x] `example/src/ci/support/rest_fixture.ts`：`CiRestFixture`（基于内置 fetch；联系人快照/设置/恢复、黑名单、建/删群与聊天室、verifyAbsent 404 语义、离线 peer 发文本）
- [x] 验证：`yarn typecheck`、`yarn lint` 通过

### Task 3：打包内联与应用挂载

- [x] `example/babel-plugin-inline-api-env.js`：`ENV_NAMES` 只增加 `CI_RUN`（值为设备上 `ci_run.json` 路径）
- [x] `example/src/ci/ci_mode.ts`：`isCiMode()` / `runCiMode()`；按 `ci_run.json` 的 `entry` 装载入口模块；`CI_RUN` 与 `API_SCRIPT` 同时内联时启动即报错并发 `script.done`（failed=1），fail-fast
- [x] `example/src/App.tsx`：增加 `isCiMode()` 分支（不动现有 `isAutoMode()` 行为）
- [x] 验证：无 `CI_RUN` 时人工模式与 auto 模式行为不变（`yarn example start` 冒烟）

### Task 4：五个入口骨架 + modules 骨架

- [x] `example/src/ci/entries/` 五个入口文件：显式 init 配置表（见 spec §5.5）、`beforeAll` 初始化、登录入口的 `afterAll` 登出清理
- [x] `example/src/ci/modules/` 各模块空注册函数（`register*Cases(ctx)` 签名统一），入口完成 import/注册接线
- [x] 验证：`yarn typecheck`、`yarn lint` 通过

### Task 5：种子用例（每入口至少一个真实用例）

- [x] `logged_out`：`RN-APP-001` init；未登录负向集（对齐 `no_login_smoke.json` 语义，每 manager 一例，精确错误码）
- [x] `logged_in_base`：`RN-AUTH-001` 登录就绪；每 manager 一个只读 fetch（对齐 `single_account.json` 语义）
- [x] `logged_in_group`：`RN-GROUP-001`（REST 建群 → SDK 拉取 → REST 删除验证 404）
- [x] `logged_in_contact`：`RN-CONTACT-001`（REST 建好友 → SDK 拉取 → 快照恢复）
- [x] `logged_in_user_info`：`RN-USERINFO-001`（拉取本人资料结构完整）
- [x] 验证：Android + iOS 本地全入口跑通（`ci_test_local.sh`，见 Task 7）

### Task 6：结果断言与 mapping 静态检查

- [x] `scripts/ci/assert_ci_run.js`：用法 `node assert_ci_run.js <ci_run.json> <api_test.log>`（平台经环境变量传入）；解析 `[APITEST]` 日志（复用 `script_results.js` 的 `parseLogText`），fail/**blocked（同等计失败）**/`total` 为 0 均退出非零；按 mapping `platforms` 字段与当前平台对账（登记未执行记 missing）；产出 `build/reports/ci/<run-id>/summary.md`（pass/fail/blocked 分类）
- [x] `docs/ci/native-case-mapping.json`：schemaVersion + nativeBaseline + 种子用例登记
- [x] `scripts/ci/check_case_mapping.js`：mapping↔注册代码静态校验；挂入 `scripts/ci/run_quality.sh`
- [x] 两个新脚本配 node 测试（`test_assert_ci_run.js` / `test_check_case_mapping.js`，沿用 `test_script_results.js` 模式），纳入 `yarn test:ci-scripts`
- [x] 验证：`bash scripts/ci/run_quality.sh` 通过；构造 fail 用例验证断言脚本退出码与报告正确

### Task 7：统一执行入口与凭据脚本（本地/云端共用）

- [x] `scripts/ci/ci_test_local.sh <android|ios> [entry]`：**一次打包构建**（`CI_RUN=<设备路径>` 内联，复用 smoke 的 bundle 内联参数）→ 循环入口：生成临时 `ci_run.json`（含凭据，0600、trap 删除）→ 调既有 `run_ci_android.sh`/`run_ci_ios.sh` 推送冷启动 → 断言；单入口失败不中断后续，汇总退出码。本地与云端 CI 都调此脚本
- [x] driver 唯一改动：`run_device_android.sh`/`run_device_ios.sh` 断言步骤改为可选 `ASSERT_SCRIPT` 环境变量（默认 `assert_script.js`，向后兼容）；wrapper 传 `ASSERT_SCRIPT=scripts/ci/assert_ci_run.js`
- [x] 扩展 `scripts/ci/fetch_e2e_user_token.js`：增加 app token 获取（secret 只在 host 侧）
- [x] 验证：Android emulator + iOS simulator 全入口本地跑通（一次构建）；`testNameRegex` 单例筛选生效

### Task 8：GitHub Actions workflow 更替

- [x] 新增 `.github/workflows/ci-device.yml`：logged-out lane（无 secret，跑 `logged_out`，即原 smoke 职责）+ logged-in lanes（`rn-single-account` 环境，四个入口，即原 nightly 职责）；test job 调 `ci_test_local.sh`；每日定时 + manual
- [x] 移除 `.github/workflows/device-smoke.yml` 与 `.github/workflows/single-account-nightly.yml`
- [x] KVM udev 步骤、iOS `ditto` 打包等既有陷阱按 `AGENTS.md` CI 节照搬
- [x] 验证：manual dispatch 双平台全绿

### Task 9：移除旧 smoke/nightly 资产

- [x] 删除 `example/ci/no_login_smoke.json`、`example/ci/single_account.json`、`scripts/ci/nightly_local.sh`、`scripts/ci/write_single_account_config.sh`
- [x] grep 全部引用点并处理：driver 中指向 `no_login_smoke.json` 的默认值（改必填或指向平版脚本）、`yarn report:api` 路径（`smoke_local.sh` 保留给平版 runner）、文档描述
- [x] 验证：`yarn report:api --platform android`（或平版 runner 路径）不受影响；`bash scripts/ci/run_quality.sh` 通过

### Task 10：文档收口

- [x] `AGENTS.md` 的 CI 节重写：CI 设备回归层入口/命令、与 AI 平版脚本层的边界、旧 workflow 描述移除
- [x] `docs/ci/README.md`（或并入现有文档）：用例编写规范（入口不可改、编号规则、清理规则、禁止项——继承 spec §5.5 治理规则）
- [x] dailylog 记录
- [x] 更新本计划复选框，准备单次提交（等用户确认后执行）

## 任务依赖关系

- Task 1 → Task 2（support 被 modules/entries 使用，harness 是执行底座）
- Task 1、2 → Task 3（挂载依赖 harness/config）
- Task 3 → Task 4（入口骨架依赖挂载机制）
- Task 4 → Task 5（种子用例依赖入口/模块骨架）
- Task 5 → Task 6（断言脚本需要真实输出对账；mapping 依赖用例编号确定）
- Task 3 → Task 7（统一入口依赖打包内联机制）；Task 6 → Task 7（统一入口调断言脚本）
- Task 7 → Task 8（workflow 复用统一入口脚本）
- Task 8 → Task 9（新 workflow 全绿后再删旧资产，避免验证空窗）
- Task 9 → Task 10（文档最后收口，AGENTS.md 反映最终状态）

可并行：Task 1 与 Task 2 的 expect/wait_for/unique 三个无依赖文件；Task 6 的 mapping 文件编写可与 Task 5 并行起步。
