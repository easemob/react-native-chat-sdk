# RN CI 设备回归测试架构设计

- 日期：2026-11-18
- 分支/版本：5.1.0（worktree `.worktree/5.1.0`，依赖原生 SDK HyphenateChat 5.1.0）
- 状态：待评审（未实现）
- 参考：Flutter 侧同构架构 `im_flutter_sdk/example/integration_test/`（worktree `/Users/asterisk/Codes/zuoyu_flutter/im_flutter_sdk/.worktree/5.1.0`）及其治理文档 `docs/testing/README.md`、`docs/testing/2026-11-09-ci.md`、`im_flutter_sdk/docs/ci/flutter-only-ci.md`

## 1. 背景与问题

RN SDK 现有两层自动化验证：

1. **Jest 单元/契约测试**（`src/__tests__/`）：Node 环境执行，native 层是 mock。覆盖事件分发、模型编解码、TS↔native 方法名契约，看不到真实 native 行为。
2. **JSON 脚本自动模式**（`example/ci/*.json` + `example/src/auto/auto_mode.ts`）：真机执行，面向 AI 平版验证（porting positive/negative）和 smoke/nightly 冒烟。

缺失第三层：**代码级、真机执行、CI 长期回归**的测试。Flutter 侧这层由 `example/integration_test/` 承担，本设计将其同构移植到 RN。

JSON 脚本无法承担这层职责，缺四类关键能力：

- **每例独立的准备/断言/收尾**：Flutter 用 `addTearDown` + 唯一资源命名 + REST 快照恢复（如 `ContactRelationSnapshot` 恢复原好友列表）；JSON steps 只有串行调用和固定 `delayAfterMs`。
- **事件关联等待**：Flutter `loginForCi` 等 `onDataSyncStart/Finish` 按位掩码收齐才算登录就绪，`sendAndAwait` 按 localId 关联最终发送回调；JSON 只有固定 sleep，违反"不靠固定 sleep 证明成功"原则。
- **REST fixture 作为独立观察面**：`CiRestFixture` 用 REST 准备对端资源（建群、建房、离线 peer 发消息）、验证清理结果，与被测 SDK 相互独立。
- **确定的负向契约**：`expectCiError(op, code)` 断言精确错误码，不把任意异常当负向通过。

客观约束：RN 没有 flutter_test/integration_test 这样的官方 on-device 测试运行器，Jest 无法在设备上跑真 native。因此需要自建一个极简 TS 测试运行器（harness），跑在 example 应用内。

## 2. 目标与非目标

### 目标

- 在 example 应用内建立 CI 设备回归测试架构：harness + support fixtures + 五个稳定入口 + 模块用例层。
- **新架构取代既有 JSON smoke / 单账号 nightly 设计**：`logged_out` 入口即"未登录 smoke"，四个 `logged_in_*` 入口即登录态回归；`no_login_smoke.json`、`single_account.json`、`device-smoke.yml`、`single-account-nightly.yml` 及其专属辅助脚本随之移除。AI 平版脚本（`port_*_*.json` + auto mode）保留不动。
- 复用现有打包内联机制（babel 插件）、`[APITEST]` 日志通道、设备 drivers；driver 仅新增一个向后兼容的可选 tunable。
- 建立用例编号体系（`RN-` 前缀）与 `native-case-mapping.json` 静态映射。
- 提供统一执行入口 `ci_test_local.sh`，**本地执行与云端 CI 共用同一脚本**，行为一致。
- 提供每入口至少一个真实种子用例，证明架构端到端可用；**不批量补充用例**（架构确认后另行补）。

### 非目标

- 不改动 JSON 平版脚本能力（`auto_mode.ts` 与 `port_*_*.json`、`yarn report:api`），那是 AI 平版测试层。
- 不改动 Jest 单元/契约测试。
- 不做多设备协作测试（接收方通知、回执、多端同步等留给未来的多设备层，不在本期）。
- 不做 UI 层 e2e（不引入 Detox/Maestro）。
- 不追求 API 覆盖率数字；用例选择遵循"基础行为、关键边界、已修复缺陷的长期回归价值"。

## 3. 参考：Flutter CI 测试架构要点

| 要素 | Flutter 实现 | 文件 |
|---|---|---|
| 五个稳定入口 | 按登录前置 + 同步开关分类，改 init 配置必须冷启动，入口不允许因补用例而修改 | `integration_test/logged_out_test.dart` 等 |
| 模块用例层 | 每业务模块一个 `register*Cases()` 注册函数，正/逆向拆分为 `*_cases.dart` / `*_cases.negative.dart` | `integration_test/modules/` |
| 共享 fixtures | 超时包装、精确错误码断言、登录就绪等待、REST 准备/验证/恢复、轮询等待 | `integration_test/support/` |
| 用例治理 | `FL-` 编号 + `native-case-mapping.json`（ID、优先级、覆盖 API、断言、文件、来源 native 用例），纳入 CI 静态检查 | `im_flutter_sdk/docs/ci/native-case-mapping.json` |
| 执行 | `tool/ci/nightly_local.sh` 循环调既有 device runner，逐入口冷启动；支持 `CI_TEST_NAME` 单例筛选；报告入 `artifacts/ci/<run-id>/` | `tool/ci/` |

分类规则（原样继承）：分类首先看登录前置，再看会话/群组/联系人三个同步开关；用户资料单列（`enableUserInfo`）。登录分类表示前置状态，不限制用例内登出或重登。基础入口承载认证、消息、会话和本地数据库；群消息收发不要求群组列表同步；消息用例准备好友关系不改变其基础类归属。

## 4. 总体架构

三层测试体系各自独立，互不替代：

```text
┌─────────────────────────────────────────────────────────────┐
│ Jest unit/contract（Node，native mock）                      │
│   src/__tests__/ — 已有，不动                                │
├─────────────────────────────────────────────────────────────┤
│ CI 设备回归（本设计新增，真机，代码级）                        │
│   example/src/ci/ + scripts/ci/ + .github/workflows/         │
│   吸收原 JSON smoke（= logged_out 入口）与单账号 nightly       │
│   （= logged_in_* 入口）职责，原设计与资产移除                │
├─────────────────────────────────────────────────────────────┤
│ AI 平版脚本测试（真机，JSON 数据驱动）                        │
│   example/ci/port_*_*.json + auto_mode.ts — 保留不动         │
└─────────────────────────────────────────────────────────────┘
```

新增层在 example 应用内的挂载方式与 auto mode 完全平行：打包期内联环境变量选择运行模式，三者互斥——`CI_RUN` 已内联 → CI 测试模式；`API_SCRIPT` 已内联 → JSON 自动模式；都没有 → 人工模式。**`CI_RUN` 与 `API_SCRIPT` 同时内联属于构建配置错误，app 启动即报错并发 `script.done`（failed=1）让 driver 立即失败，不做静默优先级。**

## 5. 详细设计

### 5.1 目录结构

```text
example/src/ci/
├── harness.ts                     # 极简测试运行器（suite/ciTest/hooks/addTearDown/串行执行）
├── ci_mode.ts                     # 模式判定 + 入口分发 + 结果输出（[APITEST] 通道）
├── config.ts                      # CiRun/CiConfig 类型与加载（RNFS 读 CI_RUN 指向的 ci_run.json）
├── support/
│   ├── expect.ts                  # 断言：assertEqual 等 + expectCiError(op, code)
│   ├── wait_for.ts                # waitForCi 轮询（200ms 间隔，超时报错含最后观测值）
│   ├── login.ts                   # loginForCi：dataSync 事件按掩码收齐 + isConnected
│   ├── unique.ts                  # 唯一资源命名 ci_<模块>_<ts>_<seq>_<label>
│   └── rest_fixture.ts            # CiRestFixture：REST 准备/验证/恢复
├── modules/
│   ├── client_cases.ts            # 每模块一个 register*Cases(ctx) 导出
│   ├── client_cases.negative.ts
│   ├── conversation_cases.ts / conversation_cases.negative.ts
│   ├── message_cases.ts / message_cases.negative.ts
│   ├── group_cases.ts / group_cases.negative.ts
│   ├── contact_cases.ts / contact_cases.negative.ts
│   ├── presence_cases.ts / presence_cases.negative.ts
│   ├── room_cases.ts
│   └── user_info_cases.ts
└── entries/
    ├── logged_out.ts              # 未登录前置（smoke lane，无需账号）
    ├── logged_in_base.ts          # 认证/消息/会话/本地 DB
    ├── logged_in_group.ts         # 群组同步入口
    ├── logged_in_contact.ts       # 联系人同步入口
    └── logged_in_user_info.ts     # enableUserInfo 入口

docs/ci/
└── native-case-mapping.json       # 用例清单与 native 用例映射（静态检查）

scripts/ci/
├── assert_ci_run.js               # 解析设备日志，断言全部用例通过 + 与 mapping 对账
├── ci_test_local.sh               # 本地一键入口（循环入口调既有 drivers）
└── check_case_mapping.js          # mapping 静态校验（挂入 run_quality.sh）
```

文件命名沿用 example 现有 snake_case 惯例（`auto_mode.ts`、`log_store.ts`）。测试代码与注释用英文（仓库既定规则）。

### 5.2 harness（极简测试运行器）

约 300 行，无第三方依赖。API 草图：

```ts
export interface CiCaseContext {
  client: ChatClient;
  config: CiConfig;
  rest: CiRestFixture;
}

export function suite(name: string, body: () => void): void;
export function ciTest(
  caseId: string,            // 'RN-AUTH-001'
  description: string,
  body: (ctx: CiCaseContext) => Promise<void>,
): void;                       // 默认单例超时 2 分钟，超时即失败
export function beforeAll(fn: (ctx) => Promise<void>): void;
export function afterAll(fn: (ctx) => Promise<void>): void;
export function addTearDown(fn: () => Promise<void>): void;  // 用例级，fail-safe 全执行
```

执行语义：

- 用例严格串行（IM SDK 单连接，无并发意义）。
- 每个用例：执行 body → 无论成败执行本例全部 tearDown → 记录结果。tearDown 失败单独记录为 cleanup 失败，不覆盖 body 的失败结论（业务失败、准备失败、清理失败分别记录）。
- `beforeAll` 失败则该 suite 全部用例记 blocked，继续下一 suite；不中断整个入口的运行。
- 运行结束输出 summary 并发出 `script.done` 日志（见 5.8）。

harness 的注册/调度/teardown 逻辑是纯 TS，**配 Jest 单元测试**，放 `example/src/ci/__tests__/harness.test.ts`：根 jest 配置的 `modulePathIgnorePatterns` 只排除 `example/node_modules`，默认 testMatch 会拾取 example 下的测试文件，随 `yarn test` 一起跑。`example/jest.config.js` 是脚手架遗留（example 无 test script），本期不动它。

### 5.3 运行期入口选择与配置注入

关键事实：既有 driver 流程是"推送文件 → 装包 → 启动 app → 等 `script.done`"，`API_SCRIPT` 打包期内联的只是**设备路径**，脚本内容运行期推送。CI 模式沿用同一模式，**入口选择放在运行期而非打包期**——一次构建即可跑全部入口，避免 5 入口 × 2 平台的重复原生构建。

- **babel 插件**：`example/babel-plugin-inline-api-env.js` 的 `ENV_NAMES` 集合只增加 `CI_RUN` 一个变量（现有 `API_SCRIPT`/`API_CONFIG` 不变）。`CI_RUN` 的值是设备上的运行文件路径（如 `/data/local/tmp/rn_ci_run.json`、iOS 对应 tmp 路径），与 driver 的 `DEVICE_SCRIPT_PATH` 覆盖机制对齐。
- **运行文件**：driver 每入口推送一个 `ci_run.json`，应用内用 RNFS 读取（auto mode 同款方式）。结构：

```json
{
  "entry": "logged_in_base",
  "testNameRegex": "RN-AUTH-.*",
  "config": {
    "appKey": "org#app",
    "accounts": [{ "id": "ci_user", "token": "..." }],
    "loginToken": "...",
    "peerId": "ci_peer",
    "restApi": "https://...",
    "appToken": "..."
  }
}
```

- `entry` 选择五个入口之一；`testNameRegex` 可选，等价 Flutter 的 `CI_TEST_NAME`，运行期过滤；`config` 为凭据（logged_out 入口可省略账号字段）。
- `appToken`/`loginToken` 由 host 侧脚本用 `E2E_CLIENT_ID`/`E2E_CLIENT_SECRET` 现取（扩展 `scripts/ci/fetch_e2e_user_token.js` 增加 app token），secret 不进设备包。
- **App.tsx 挂载**：在现有 `isAutoMode()` 判断旁增加 `isCiMode()` 分支，调用 `runCiMode()`；`CI_RUN` 与 `API_SCRIPT` 同时内联时启动即报错并发 `script.done`（failed=1），fail-fast。

### 5.4 support 四件套

- **expect.ts**：最小断言集（`assertEqual`/`assertDeepEqual`/`assertTrue`/`assertNotNull`/`assertNull`）+ `expectCiError(op, code)`：操作必须 reject 且 `ChatError.code === code`，其他结果一律失败。不引入 matcher 框架。
- **wait_for.ts**：`waitForCi(description, read, matches, timeout=30s)`：200ms 轮询，超时抛错并附最后观测值。
- **login.ts**：`loginForCi(client, userId, token)`：校验 `client.options.dataSyncType` 为显式受支持掩码（拒绝缺省）；先注册 `ChatConnectEventListener`（native 回调可能早于 login 返回），`loginWithToken` 后按掩码收齐 `onDataSyncFinish`（`errorCode !== 0` 即失败），再 `waitForCi(isConnected)`；总预算 45s；finally 移除监听。注意 RN 的 `onDataSyncFinish(type, errorCode)` 给的是错误码数字（Flutter 给的是 error 对象），以 `errorCode === 0` 判成功。
- **rest_fixture.ts**：`CiRestFixture`，基于 RN 内置 `fetch`，无新依赖。能力对齐 Flutter：联系人快照/设置/恢复（`ContactRelationSnapshot`）、黑名单设置、建/删群与聊天室、按 owner 查群、`verifyGroupAbsent`/`verifyChatRoomAbsent`（资源 404 才证明清理成功）、以离线 peer 身份发单聊文本。REST 仅用于准备与恢复，不代替 SDK 断言。

### 5.5 五个稳定入口与初始化配置

RN 5.1.0 `ChatOptions` 与 Flutter 对齐（`ChatDataSyncType` 位掩码：`Conversations=1`、`Contacts=2`、`JoinedGroups=4`；`autoLoadConversations`、`enableChatroomConversation`、`enableUserInfo` 均存在）。入口分类照搬 Flutter：

| 入口 | `dataSyncType` | `enableUserInfo` | 承载范围 |
|---|---|---|---|
| `logged_out` | `Conversations` | `false` | 初始化、未登录负向（无需账号，smoke lane） |
| `logged_in_base` | `Conversations` | `false` | 认证、消息、会话、聊天室、本地 DB、Presence（登录态） |
| `logged_in_group` | `Conversations \| JoinedGroups` | `false` | 群组 API |
| `logged_in_contact` | `Conversations \| Contacts` | `false` | 联系人 API |
| `logged_in_user_info` | `Conversations` | `true` | 用户资料 API |

所有入口显式指定 `autoLoadConversations=true`、`enableChatroomConversation=false`——初始化依赖全部显式，不测试 SDK 默认值。特殊配置（如 `autoLoadConversations=false`、聊天室会话开启）的用例**本期不设入口**，遇到时先记录冲突再确认，不自作主张扩入口。

治理规则（继承 Flutter，写入后续用例编写规范）：

- 补用例只改 `modules/` 注册函数与 `support/`；不得修改五个入口、新增/重命名入口、改共享 init 配置、改 workflow/runner。新业务模块确需调整入口 import/注册接线的，先说明并取得确认。
- 每个入口独立冷启动运行（改 init 必须重启应用），入口之间无共享状态。
- 每例独立准备、执行、断言、收尾；清理本例创建的资源或恢复修改值，不删账号历史数据。
- 监听在触发前就绪，等待有超时；不靠固定 sleep 或历史事件证明成功。
- 不为绕过 SDK 缺陷放宽正确断言；失败保留证据。

### 5.6 模块用例文件与注册函数

每个模块导出签名统一的注册函数，入口文件只做组装：

```ts
// modules/presence_cases.negative.ts
export function registerPresenceNegativeCases(ctx: CiCaseContext): void {
  ciTest('RN-PRESENCE-001', 'publishPresence while logged out throws 201', async () => {
    await expectCiError(
      () => ctx.client.presenceManager.publishPresence('away'),
      201,
    );
  });
}
```

注册只在模块装载时收集用例（不执行），由 `ci_mode.ts` 统一驱动。`unique.ts` 提供每模块独立的资源命名序列；模块内需要的跨用例辅助函数（如 message 模块的 `sendAndAwait` 按 localId 关联最终回调）放模块文件内部，跨模块复用的才下沉到 `support/`。

### 5.7 用例编号与 native-case-mapping.json

- 编号：`RN-<模块>-<序号>`，模块域：`APP`、`AUTH`、`CONV`、`MSG`、`GROUP`、`CONTACT`、`PRESENCE`、`ROOM`、`USERINFO`。序号保留不重用。
- `docs/ci/native-case-mapping.json`：`schemaVersion`、`nativeBaseline`（native 用例仓库 commit）、`cases[]`（`id`、`priority`、`origin`、`sourceCases`、`rnApis`、`platforms`、`assertions`、`testFile`），字段对齐 Flutter 版（`flutterApis` → `rnApis`）。
- `scripts/ci/check_case_mapping.js` 静态校验：mapping 中每个 id 在对应 `testFile` 中真实注册、文件存在、编号无重复；挂入 `scripts/ci/run_quality.sh`，与单测同门槛。

### 5.8 结果协议与 CI 断言

复用 `[APITEST]` 结构化日志通道（`script_results.js` 的 `parseLogText` 已能解析）。harness 输出：

```jsonl
[APITEST] {"source":"ci.case.result","entry":"logged_out","caseId":"RN-APP-001","status":"pass","durationMs":812}
[APITEST] {"source":"ci.case.result","entry":"logged_out","caseId":"RN-PRESENCE-001","status":"fail","durationMs":30012,"error":{"phase":"body","message":"expected ChatError 201, got 200"}}
[APITEST] {"source":"ci.run.summary","entry":"logged_out","total":9,"passed":8,"failed":1,"blocked":0,"failures":["RN-PRESENCE-001"]}
[APITEST] {"source":"script.done","total":9,"failed":1}
```

末尾的 `script.done` 是既有 drivers 的完成等待标记（`run_device_android.sh` grep `"source":"script.done"`），因此 driver 的等待/拉日志逻辑原样复用；唯一改动是断言步骤加可选 `ASSERT_SCRIPT`（见 §5.9）。

`scripts/ci/assert_ci_run.js`（用法对齐 `assert_script.js`：`node assert_ci_run.js <ci_run.json> <api_test.log>`，平台经环境变量传入）：解析拉回的日志，以下任一条件即退出非零——

- 存在 `fail` 或 **`blocked`（准备/基础设施失败不允许静默成绿，与 fail 同等计失败，报告中单独归类）**；
- 存在 summary 之外缺失的用例：与 `docs/ci/native-case-mapping.json` 对账，**对账集合 = mapping 中 `platforms` 含当前平台的该入口用例**，登记了但没跑出结果的记 missing；
- summary 的 `total` 为 0（防空跑：入口装载失败或 `testNameRegex` 误过滤全部用例时不得误绿）。

每次运行产出 `build/reports/ci/<run-id>/summary.md`（Git 忽略），含每例结果（pass/fail/blocked 分类）与日志链接。

### 5.9 执行：本地与云端 CI 统一入口

统一脚本 `scripts/ci/ci_test_local.sh <android|ios> [entry]`，**本地执行与云端 CI 都调它**，行为一致：

```sh
bash scripts/ci/ci_test_local.sh android            # 全部入口
bash scripts/ci/ci_test_local.sh ios logged_in_base # 单入口
# 登录入口需要 E2E_APP_KEY / E2E_USER_ID / E2E_REST_API / E2E_CLIENT_ID / E2E_CLIENT_SECRET
```

流程：**一次打包构建**（`CI_RUN=<设备路径>` 内联；复用 smoke 的 bundle 内联参数：Android `-PbundleInDebug=true -PreactNativeArchitectures=x86_64`，iOS `FORCE_BUNDLING=1`）→ 循环选定入口，逐次：生成临时 `ci_run.json`（含凭据，0600，trap 删除）→ 调既有 `run_ci_android.sh` / `run_ci_ios.sh` 推送并冷启动 → driver 末尾断言。单入口失败不阻止后续入口，最终汇总退出码。

**driver 改动（唯一一处，向后兼容）**：`run_device_android.sh` / `run_device_ios.sh` 末尾的断言步骤从硬编码 `assert_script.js` 改为可选环境变量 `ASSERT_SCRIPT`（默认值不变，平版脚本路径零影响）；CI 运行时 wrapper 传 `ASSERT_SCRIPT=scripts/ci/assert_ci_run.js`。

GitHub Actions：新增 `.github/workflows/ci-device.yml`，**取代并移除** `device-smoke.yml` 与 `single-account-nightly.yml`：

- **logged-out lane**（无需账号/secret，即原 smoke 职责）：跑 `logged_out` 入口，Android emulator + iOS simulator。
- **logged-in lanes**（单账号，即原 nightly 职责）：跑四个 logged-in 入口，secret 从受保护环境读取（复用 `rn-single-account` 环境的五个 `E2E_*`）。Android/iOS 并行（账号已开多端登录）。
- 两 lane 的 test job 都调用 `ci_test_local.sh`，与本地一致。触发：每日定时 + manual dispatch；是否升级为 PR 门禁待架构稳定后另行决策。

**移除的旧资产**（随本设计落地一并删除）：`example/ci/no_login_smoke.json`、`example/ci/single_account.json`、`.github/workflows/device-smoke.yml`、`.github/workflows/single-account-nightly.yml`、`scripts/ci/nightly_local.sh`、`scripts/ci/write_single_account_config.sh`。`scripts/ci/smoke_local.sh` 保留——`yarn report:api` 的平版运行复用它（其实际职责已是平版 runner，是否改名后续再说）；driver 中指向 `no_login_smoke.json` 的默认值同步改为必填或指向平版脚本，实现时逐一核对引用点。

## 6. 种子用例范围（验证架构，非补全量）

每入口至少一个真实用例，保证 CI lane 不空跑、四类关键能力各被至少一个用例证明：

| 入口 | 种子用例 | 证明的能力 |
|---|---|---|
| `logged_out` | `RN-APP-001` 初始化成功；`RN-PRESENCE-001~005`、`RN-MSG-006` 等未登录调用抛 201（对齐 `no_login_smoke.json` 语义） | harness、`expectCiError` 精确负向 |
| `logged_in_base` | `RN-AUTH-001` 登录就绪（dataSync 掩码收齐）；每 manager 一个只读 fetch（对齐 `single_account.json` 语义） | `loginForCi` 事件关联等待 |
| `logged_in_group` | `RN-GROUP-001` REST 建群 → SDK 拉取已加入群列表含该群 → REST 删群验证 404 | REST fixture 准备/恢复/独立验证 |
| `logged_in_contact` | `RN-CONTACT-001` REST 建立好友 → SDK 拉取联系人含 peer → 快照恢复原状 | 联系人同步入口 + 快照恢复 |
| `logged_in_user_info` | `RN-USERINFO-001` 拉取本人资料返回结构完整 | `enableUserInfo` 入口配置 |

种子用例同步登记进 `native-case-mapping.json`。种子用例即原 smoke / nightly 职责的继承者：`logged_out` 取代 `no_login_smoke.json`，`logged_in_base` 的只读集取代 `single_account.json`，原 JSON 文件随架构落地移除（见 §5.9）。消息收发（sendAndAwait）、会话持久化等复杂用例属于后续批量补充，不在本期。

## 7. 已确认的决策

1. **harness 位置**：放 `example/src/ci/`，复用打包内联、`[APITEST]` 日志、设备 drivers；不做独立 package。
2. **与 JSON 脚本层关系**：CI harness **取代**原 smoke / 单账号 nightly 设计——"smoke 就是未登录入口，其他都是登录入口"，原 JSON 用例文件、两个 workflow 及专属辅助脚本移除；AI 平版脚本（`port_*_*.json` + auto mode + `yarn report:api`）保留，两者独立。
3. **入口划分**：照搬 Flutter 五入口及分类规则；特殊配置冲突先记录再确认。
4. **编号体系**：`RN-` 前缀 + `docs/ci/native-case-mapping.json` + quality 静态检查。
5. **入口选择运行期下发**（grilling Q1）：只内联 `CI_RUN` 设备路径，driver 逐入口推送 `ci_run.json` 冷启动，一次构建跑全部入口；driver 仅新增向后兼容的 `ASSERT_SCRIPT` tunable。
6. **blocked 计失败**（grilling Q2）：准备/基础设施失败不允许静默成绿，报告中单独归类。
7. **平台对账**（grilling Q3）：mapping 的 `platforms` 字段驱动按平台对账。
8. **触发策略**（grilling Q5）：每日定时 + manual 起步，PR 门禁待架构稳定后另行决策。
9. **模式冲突 fail-fast**（grilling Q6）：`CI_RUN` 与 `API_SCRIPT` 同时内联即启动报错，不做静默优先级。
10. **执行入口统一**（用户要求）：本地与云端 CI 共用 `ci_test_local.sh`，辅助脚本同时兼顾两种执行方式。
11. **文档语言**：spec/plan 用中文；测试代码、注释、commit message 用英文。

## 8. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 自建 harness 行为与成熟框架有差异（钩子语义、超时边界） | harness 纯 TS 配 Jest 单测；语义对齐 Flutter 已验证的 `ciTestWidgets` 模型 |
| 一次构建内联 `CI_RUN` 路径与 driver 推送路径不一致导致 app 读不到运行文件 | 与 `API_SCRIPT` 同款"路径必须匹配"约束；`ci_test_local.sh` 统一生成两处取值，CI 复用同一脚本 |
| `dataSyncType` 事件在个别平台时序差异导致登录等待不稳 | `loginForCi` 45s 总预算 + 详细超时上下文（required/started/completed 掩码入报错） |
| 移除旧 smoke/nightly 资产时遗漏引用点（`report:api` 复用 `smoke_local.sh`、driver 默认值、AGENTS.md/文档描述） | 移除任务单列，逐一 grep 引用点；`smoke_local.sh` 保留给平版 runner；AGENTS.md CI 节同步重写 |
| 断言脚本与 `assert_script.js` 职责混淆 | 新文件 `assert_ci_run.js`，共享 `script_results.js` 的解析函数，不改既有文件行为 |
