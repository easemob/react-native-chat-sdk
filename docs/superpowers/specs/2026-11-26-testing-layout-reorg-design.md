# 测试资产按四大分类重组 —— 设计

日期：2026-11-26
分支：`5.2.0`（只在本分支落地，暂不合入 `5.x`，稳定后再定）
状态：已实现

## 1. 背景

本仓的测试分四类：① 单元测试、② 设备回归、③ 单设备、④ 多设备。工具、脚本和用例本身都可用，问题在文件组织：

- `scripts/ci/` 下 25 个文件实际分属 ②③④、②③ 共用、质量门禁、deprecated 扫描六种用途，却统一叫 "ci"；`scripts/` 原本只放项目全局脚本。
- `testing/` 只有 ③④ 的用例和说明，执行这些用例的工具却在 `scripts/ci/`，同一类测试要到两处找。
- ② 的用例登记表 `docs/ci/native-case-mapping.json` 是门禁读取的数据，不是文档，却放在 `docs/`。
- "CI" 同时被用作 ② 的类别名和"持续集成调用方"。CI 实际是所有分类之上的编排层：它现在调用 ① 与 ②，后续还可能调用 ④。类别名与调用方同名，会在 CI 接入多设备后造成层次混乱。

Flutter 仓 5.2.0 正在做同类重组（产品面 / 设备侧 workbench / 测试面 `testing/{single,multi,share}` / 编排面 `ci/` / 产物命名对齐分类）。RN 的 example 不随 npm 发布，不需要改名迁移；RN 也没有 Flutter 那种集成测试目录约定，因此借鉴"按分类聚合 + 显式共享层 + 独立编排面"的思路，不照搬目录。

## 2. 目标与非目标

目标：

1. 分层清晰：CI 编排层只负责调用；四类测试各自拥有执行入口，本地与 CI 调用同一个入口。
2. host 侧测试资产按分类各有唯一落点，同一类测试的 host 侧目录与产物目录同名。
3. `scripts/` 恢复为项目全局脚本，不再含测试工具或 CI 入口。
4. 改造以 `git mv` + 路径引用更新为主，工具行为不变。

非目标（本次不做）：

- 不移动单元测试（`src/__tests__/`、`example/src/**/__tests__/`）。
- 不改设备侧目录与代码标识符：`example/src/{ci,auto,agent}`、`CI_RUN`、`ci_mode.ts`、`ci_run.json`、设备路径 `rn_ci_run.json`、`[APITEST]` 记录格式、用例 ID。这些名字表达的是 app 的运行模式，改动会牵连 TS 代码、babel 内联变量、workflow 环境变量与设备路径。host 侧文件名中沿用该模式名的（`ci_test_local.sh`、`run_ci_*.sh`、`assert_ci_run.js`、`render_ci_log.js`）同样保持不变。
- 不改任何工具逻辑、用例内容、断言、报告格式。
- 现行操作说明跟目录走：`docs/testing/README.md`、`docs/testing/2026-11-19-{ci,single-device,multi-device}.md`、`docs/ci/README.md` 的内容合并进 `testing/README.md` 与 `testing/{regression,single,multi}/README.md` 后删除原文。日期记录（`docs/testing/2026-11-20-*`、`2026-11-21-*`）和 `docs/superpowers/` 留在 `docs/`。
- 不修历史文档（`docs/porting/`、`docs/superpowers/` 中本 spec 之外的文件、`docs/testing/2026-11-20-*`、`docs/testing/2026-11-21-*`、`docs/deprecated-api-leftover-audit.md`）和 `dailylog/`。
- 不为 CI 新增任何调用（多设备进 CI 是后续需求）；不补门禁缺口（见 §9.3）。

## 3. 分层与四大分类

```text
CI 编排层      .github/workflows/  +  ci/          只负责调用，不承载任何一类测试的逻辑
     │ 调用
     ▼
测试面（host） testing/{regression,single,multi}/  各类的执行入口、工具、用例
               testing/share/                      ②③ 共用的驱动与解析
     │ 构建/驱动
     ▼
设备侧         example/src/{ci,auto,agent}/        打进 app 的执行端
     │ 输出
     ▼
产物           artifacts/{regression,single,multi}/
```

| 类别 | 设备侧（打进 app） | host 侧执行入口 | host 侧其余资产 | 产物 | 当前 CI 是否调用 |
|---|---|---|---|---|---|
| ① 单元测试 | — | `yarn test:unit` / `test:contract` / `test:tools` | `src/__tests__/`、`example/src/{agent,ci}/__tests__/`、`testing/**/test_*.js` | 无 | 是（经 `ci/run_quality.sh`） |
| ② 设备回归 | `example/src/ci/`（回归模式，`CI_RUN`） | `testing/regression/ci_test_local.sh` | `testing/regression/` | `artifacts/regression/` | 是（`ci-device.yml` 每日） |
| ③ 单设备 | `example/src/auto/`（auto 模式，`API_SCRIPT`） | `yarn report:api` → `testing/single/auto_report.js` | `testing/single/` | `artifacts/single/` | 否 |
| ④ 多设备 | `example/src/agent/`（agent 模式，`EASEMOB_AGENT`） | `testing/multi/multi.sh` | `testing/multi/` | `artifacts/multi/` | 否（后续可能） |

规则：

- **CI 编排层**（`.github/workflows/` + `ci/`）直接调用各类的执行入口，不为每一类再包一层脚本。`ci/` 只放跨类或 CI 专属的内容：目前是门禁 `run_quality.sh` 与调用矩阵说明 `ci/README.md`。后续多设备进 CI 时，只需新增 workflow job 调 `testing/multi/multi.sh` 并在调用矩阵补一行；只有出现 CI 专属的准备逻辑（如 runner 上起双模拟器、准备账号）时才在 `ci/` 下新增文件。
- **① 不设独立目录**：Jest 约定与 `package.json` 的 `files`（`!**/__tests__`）决定了 SDK 单元测试随源码放置；测试工具自测与被测工具同目录。
- **② 改名为 `regression`**：它的本质是可在干净账号上长期重复、自建自清的契约回归；"每日由 CI 调用"只是当前的调用方式。设备侧仍沿用 `CI_RUN` 这套模式名，对应关系写入 `testing/README.md`。

## 4. 目标布局

```text
<repo>/
├── .github/workflows/                 # CI 编排：ci.yml → ci/run_quality.sh；ci-device.yml → testing/regression/ci_test_local.sh
├── ci/                                # CI 编排层（新建）
│   ├── README.md                      #   调用矩阵：触发 → job → 调用的入口 → 所属分类
│   └── run_quality.sh                 #   门禁：lint、typecheck、①、② 登记表静态检查
├── src/__tests__/                     # ① 不动
├── example/src/{ci,auto,agent}/       # ②③④ 设备侧，不动
├── testing/
│   ├── README.md                      # 四类总索引（重写）
│   ├── regression/                    # ② host 侧
│   │   ├── README.md                  #   怎么跑、怎么加用例
│   │   ├── ci_test_local.sh  run_ci_android.sh  run_ci_ios.sh
│   │   ├── assert_ci_run.js  render_ci_log.js  check_case_mapping.js  fetch_e2e_user_token.js
│   │   ├── native-case-mapping.json
│   │   └── test_assert_ci_run.js  test_check_case_mapping.js  test_render_ci_log.js  test_e2e_accounts.js
│   ├── single/                        # ③
│   │   ├── README.md
│   │   ├── auto_report.js  auto_script_local.sh  assert_script.js
│   │   └── cases/
│   ├── multi/                         # ④
│   │   ├── README.md  multi.sh  target-rn.yaml  multi-tool.json
│   │   └── cases/
│   └── share/                         # ②③ 共用
│       ├── script_results.js  run_device_android.sh  run_device_ios.sh
│       ├── select_android_device.sh  select_ios_simulator.sh  boot_ios_simulator.sh
│       └── test_script_results.js
├── scripts/                           # 项目全局脚本
│   ├── enable-deprecation-lint.gradle # deprecated 扫描（本地 build:android 与扫描脚本都用）
│   └── ...（原有全局脚本不变）
└── artifacts/{regression,single,multi}/
```

`scripts/ci/`、`docs/ci/`、`docs/ci/native-case-mapping.json`、`testing/target-rn.yaml`、`testing/multi-tool.json` 迁移后不再存在。

放置规则：

- `test_<x>.js` 与 `<x>.js` 同目录（`test_e2e_accounts.js` 测的是 `ci_test_local.sh` + `fetch_e2e_user_token.js`，放 `regression/`）。
- 只被一类使用的文件进该类目录；被多类同时使用的进 `share/`。`share/` 的代码不引入任何分类目录的模块；唯一例外是 `run_device_*.sh` 的环境变量默认值（`SCRIPT_JSON`、`ASSERT_SCRIPT`）沿用 ③ 的路径，调用方未传值时行为与现在一致。
- `fetch_e2e_user_token.js` 目前只有 ② 使用，放 `regression/`；出现第二个使用方时再移入 `share/`。

## 5. 迁移清单

| 原路径 | 新路径 |
|---|---|
| `scripts/ci/run_quality.sh` | `ci/run_quality.sh` |
| （新建） | `ci/README.md` |
| `scripts/ci/ci_test_local.sh` | `testing/regression/ci_test_local.sh` |
| `scripts/ci/run_ci_android.sh` | `testing/regression/run_ci_android.sh` |
| `scripts/ci/run_ci_ios.sh` | `testing/regression/run_ci_ios.sh` |
| `scripts/ci/assert_ci_run.js` | `testing/regression/assert_ci_run.js` |
| `scripts/ci/render_ci_log.js` | `testing/regression/render_ci_log.js` |
| `scripts/ci/check_case_mapping.js` | `testing/regression/check_case_mapping.js` |
| `scripts/ci/fetch_e2e_user_token.js` | `testing/regression/fetch_e2e_user_token.js` |
| `scripts/ci/test_assert_ci_run.js` | `testing/regression/test_assert_ci_run.js` |
| `scripts/ci/test_check_case_mapping.js` | `testing/regression/test_check_case_mapping.js` |
| `scripts/ci/test_render_ci_log.js` | `testing/regression/test_render_ci_log.js` |
| `scripts/ci/test_e2e_accounts.js` | `testing/regression/test_e2e_accounts.js` |
| `docs/ci/native-case-mapping.json` | `testing/regression/native-case-mapping.json` |
| `scripts/ci/auto_report.js` | `testing/single/auto_report.js` |
| `scripts/ci/auto_script_local.sh` | `testing/single/auto_script_local.sh` |
| `scripts/ci/assert_script.js` | `testing/single/assert_script.js` |
| `scripts/ci/multi.sh` | `testing/multi/multi.sh` |
| `testing/target-rn.yaml` | `testing/multi/target-rn.yaml` |
| `testing/multi-tool.json` | `testing/multi/multi-tool.json` |
| `scripts/ci/script_results.js` | `testing/share/script_results.js` |
| `scripts/ci/run_device_android.sh` | `testing/share/run_device_android.sh` |
| `scripts/ci/run_device_ios.sh` | `testing/share/run_device_ios.sh` |
| `scripts/ci/select_android_device.sh` | `testing/share/select_android_device.sh` |
| `scripts/ci/select_ios_simulator.sh` | `testing/share/select_ios_simulator.sh` |
| `scripts/ci/boot_ios_simulator.sh` | `testing/share/boot_ios_simulator.sh` |
| `scripts/ci/test_script_results.js` | `testing/share/test_script_results.js` |
| `scripts/ci/enable-deprecation-lint.gradle` | `scripts/enable-deprecation-lint.gradle` |

`testing/single/cases/`、`testing/multi/cases/`、`testing/multi/README.md` 位置不变。

产物目录：② 的输出根从 `artifacts/ci/` 改为 `artifacts/regression/`（§7.1）。`artifacts/` 不进 Git，已有的本地 `artifacts/ci/` 不迁移，可手动删除。

## 6. 唯一的代码移动：`sanitize`

现状：② 的 `assert_ci_run.js` 从 ③ 的 `auto_report.js` 引用 `sanitize`，迁移后会变成 `regression/` → `single/` 的跨类依赖。

处理：把 `sanitize`（`auto_report.js` 中自包含的脱敏函数，无外部依赖）原样移到 `testing/share/script_results.js` 并导出；`auto_report.js` 与 `assert_ci_run.js` 改从 `../share/script_results` 引入；`test_script_results.js` 的 `sanitize` 改从 `./script_results` 引入。`auto_report.js` 不再导出 `sanitize`。函数体不改。

迁移后的运行时依赖方向：`regression/` → `share/`，`single/` → `share/`，`share/` 不引入分类目录的模块（环境变量默认值例外见 §4）；`ci/` 只调用各类入口与 yarn script。`test_script_results.js` 仍需引用 `../single/auto_report`（测 `collectIssues` 等 ③ 函数），这是测试文件，不影响运行时依赖方向。

## 7. 引用更新清单

### 7.1 功能性引用（影响运行，必须改）

仓库根计算：迁入 `testing/<类别>/` 的脚本深度与 `scripts/ci/` 相同（两级），现有的 `REPO_ROOT=../..` / `path.resolve(__dirname, '../..')` 保持不变；只有迁到 `ci/` 的 `run_quality.sh` 改为一级（`/..`）。

| 位置 | 改动 |
|---|---|
| `package.json` | `report:api` → `node testing/single/auto_report.js`；`test:ci-scripts` 改名 `test:tools`，文件列表改为新路径（仍是原 5 个文件，显式列出） |
| `ci/run_quality.sh` | `repo_root` 改一级；`node testing/regression/check_case_mapping.js`；`yarn test:tools`；对应 echo 文案 |
| `.github/workflows/ci.yml` | `bash ci/run_quality.sh` |
| `.github/workflows/ci-device.yml` | 4 处 `bash testing/regression/ci_test_local.sh ...`、2 处注释；4 处 upload-artifact 的 `artifacts/ci/` → `artifacts/regression/` |
| `example/package.json` | `build:android` 的 `-I ../../scripts/enable-deprecation-lint.gradle` |
| `scripts/scan-deprecated-android.sh` | `-I "$PROJECT_ROOT/scripts/enable-deprecation-lint.gradle"` 及注释 |
| `testing/regression/ci_test_local.sh` | `REPORT_DIR` → `artifacts/regression`；`fetch_e2e_user_token.js`、`run_ci_*.sh`、`assert_ci_run.js` → `testing/regression/`；`select_*.sh` → `testing/share/`；usage、`CI_COMMAND` 与头部注释 |
| `testing/regression/run_ci_{android,ios}.sh` | `ENTRY_DIR` 默认值 → `artifacts/regression`；`select_*.sh`、`run_device_*.sh` → `testing/share/`；`render_ci_log.js` → `testing/regression/` |
| `testing/regression/assert_ci_run.js` | `DEFAULT_REPORT_ROOT` → `artifacts/regression`；`MAPPING_PATH` → `testing/regression/native-case-mapping.json`；`sanitize` 来源（§6）；`script_results` → `../share/script_results` |
| `testing/regression/check_case_mapping.js` | `MAPPING_PATH` → `testing/regression/native-case-mapping.json` |
| `testing/regression/render_ci_log.js` | `script_results` → `../share/script_results` |
| `testing/regression/test_e2e_accounts.js` | 临时 fixture 仓库按新布局建目录：`ci_test_local.sh`、`fetch_e2e_user_token.js`、`run_ci_*.sh` 放 `testing/regression/`，`select_*.sh` 放 `testing/share/` |
| `testing/single/auto_report.js` | `script_results` → `../share/script_results`；`sanitize` 来源（§6）；spawn 的 `testing/single/auto_script_local.sh` |
| `testing/single/auto_script_local.sh` | `select_*.sh`、`run_device_*.sh` → `testing/share/`；usage 文案 |
| `testing/single/assert_script.js` | `script_results` → `../share/script_results`；usage 文案 |
| `testing/share/run_device_{android,ios}.sh` | `ASSERT_SCRIPT` 默认值 → `$REPO_ROOT/testing/single/assert_script.js` |
| `testing/share/test_script_results.js` | `auto_report` → `../single/auto_report`；`sanitize` 来源（§6） |
| `testing/multi/multi.sh` | `PIN_FILE` → `testing/multi/multi-tool.json`；用法注释中的路径 |
| `testing/multi/target-rn.yaml` | orchestrator 按 target 文件所在目录解析相对路径：`appDir: ../../example`，`casesDir: cases`；注释里的 `--target` 路径 |
| `eslint.config.mjs` | `ignores` 增加 `'testing/'`，保持这些 Node 脚本迁移前后都不被 lint（见 §8；`ci/` 目前没有 JS 文件，不需要加） |

`multi.sh` 的 `--cases-dir "$REPO_ROOT/testing/multi/cases"` 与 `example/.im-test-orchestrator` 克隆目录不变。

### 7.2 现行文档与注释（只改路径与类别名，不改内容）

- `ci/README.md`（新建）：调用矩阵，一行一个调用关系——触发条件（PR / push 长期线 / 每日 / 手动）、workflow 与 job、调用的入口、所属分类；外加"新增 CI 调用时的规则"（直接调各类入口；只有 CI 专属准备逻辑才进 `ci/`）。内容来自 `AGENTS.md` 的 CI 一节，`AGENTS.md` 保留要点并链接到它。
- `testing/README.md`：四类总索引、环境、共同原则。`testing/regression/README.md`、`testing/single/README.md`、`testing/multi/README.md` 是各类的用法；重复的工具链和环境只留在 `testing/README.md`。
- `AGENTS.md`：Commands、CI 两节中的全部 `scripts/ci/*`、`testing/target-rn.yaml`、`docs/ci/native-case-mapping.json`、`test:ci-scripts`、`artifacts/ci`；"CI device regression layer" 的表述改为"device regression（由 CI 调用）"。用例编写规则指向 `testing/regression/README.md`。
- 代码注释：`example/src/ci/harness.ts`、`example/src/agent/CONTRACT.md`、`example/android/app/build.gradle`、各迁移脚本头部注释里的自引用路径。

`CONTRIBUTING.md` 指向 `testing/README.md`。

## 8. 已决定的取舍

| 事项 | 决定 | 理由 |
|---|---|---|
| 测试面布局 | host 侧统一进 `testing/<类别>/` | 一处可找；目录深度不变，`REPO_ROOT` 计算零改动 |
| 编排层 | 新建根目录 `ci/`，只放跨类/CI 专属内容（`run_quality.sh` + 调用矩阵） | CI 在所有分类之上、只负责调用；独立目录让"调用方 / 被调用方"边界可见，多设备进 CI 时有明确落点 |
| 不加每类包装 | workflow 直接调各类执行入口 | 本地与 CI 同入口；包装脚本只是转发，无当前用途 |
| ② 类别名 | host 侧与产物改为 `regression`；设备侧标识符不改 | 消除类别名与编排层同名；设备侧改名牵连代码与运行环境，超出"只搬位置"范围 |
| 用例登记表 | 移入 `testing/regression/` | 它是门禁读取的数据，与读取它的工具同处 |
| `sanitize` | 移入 `share/script_results.js` | 消除 ② → ③ 的跨类运行时依赖 |
| yarn script 名 | `test:ci-scripts` → `test:tools` | 原名在迁移后不再准确 |
| ESLint 范围 | `testing/` 加入 ignores | 迁移前这些脚本在 `scripts/` 下不被 lint；本次只改位置，不顺带引入 lint 修复 |
| 分支 | 只在 `5.2.0` 落地，暂不合入 `5.x` | 用户决定；与 Flutter 5.2.0 同步推进，稳定后再定 |

## 9. 风险与已知事项

1. **偏离分支铁律**：仓库 `AGENTS.md` 规则 5 要求测试框架调整落在长期线。按用户决定只在 `5.2.0` 落地；后续合入 `5.x` 时需整体评估（`1.x` / `dev` 保持旧布局，各分支 workflow 引用自身路径，互不影响；`dev` 上的 `ci-dispatch.yml` 只按名字派发 `ci-device.yml`，不含脚本路径）。
2. **外部引用路径变化**：Flutter 仓与 orchestrator 文档里出现的 RN 用例路径（`<RN仓>/testing/multi/cases`）不变；写了 `--target testing/target-rn.yaml` 或 `scripts/ci/multi.sh` 的外部文档/习惯命令需改为 `testing/multi/target-rn.yaml`、`testing/multi/multi.sh`。本次只改本仓。
3. **门禁缺口（不在本次范围）**：`run_quality.sh` 只跑 `test:unit`、`test:contract`，`example/src/{agent,ci}/__tests__/` 的 7 个 Jest 文件只有 `yarn test` 会跑，CI quality job 从未执行它们。另开改动补上。
4. **本地旧命令与旧产物**：迁移后 `scripts/ci/...` 不再存在，旧命令直接报文件不存在，不会静默走错路径；旧的 `artifacts/ci/` 本地目录不再写入。
5. **操作说明的位置**：落地时先把路径改在原文档里。随后按“说明跟目录走”把现行用法并入 `testing/**/README.md` 并删除原文（见 §2）。`docs/ci/` 因此不再存在。日期记录仍留在 `docs/testing/`。

## 10. 验证

迁移完成后依次执行：

1. 引用清零：在 §2 列出的历史文档与 `dailylog/`、`artifacts/` 之外，`rg "scripts/ci|docs/ci/native-case-mapping|testing/target-rn|testing/multi-tool|test:ci-scripts|artifacts/ci"` 无命中。
2. `bash ci/run_quality.sh` 通过（含 `test:tools` 5 个文件、`check_case_mapping.js`）。
3. ② 本地一条链路：`bash testing/regression/ci_test_local.sh android logged_out` 通过，产物落在 `artifacts/regression/<timestamp>/android/`。
4. ③ 本地一条链路：`yarn report:api --platform android --script testing/single/cases/port_5_2_0_positive.json` 跑通，产物落在 `artifacts/single/<timestamp>/android/`。
5. ④ 静态检查：`testing/multi/multi.sh generate --platform android --target testing/multi/target-rn.yaml` 成功生成 cases.json 且场景数与迁移前一致（不要求真机多设备全流程）。
6. `yarn lint`、`yarn typecheck` 通过。

iOS 链路只在 ②③ 的 iOS 驱动路径有改动（`select_ios_simulator.sh`、`run_device_ios.sh`、`run_ci_ios.sh` 引用），条件允许时补跑 `ci_test_local.sh ios logged_out` 一次。workflow 改动无法本地执行，以 YAML 内路径逐一核对为准，首次远端触发时确认。

## 11. 提交

全部迁移与验证完成后在 `5.2.0` 上单次提交（英文 message），连同本 spec、实现计划和当日 dailylog；只提交本地，不推送。
