# 测试资产按四大分类重组 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

- 日期：2026-11-26
- Spec：[2026-11-26-testing-layout-reorg-design.md](../specs/2026-11-26-testing-layout-reorg-design.md)
- 状态：已实现，已提交
- 提交策略：所有任务完成、检查全过后统一单次提交（commit message 英文，只提交本地不推送）；提交前把本文件复选框更新为完成态并填写末尾"执行记录"，提交需用户确认

**Goal:** 把 `scripts/ci/` 等处的测试资产按 ① 单元 / ② 设备回归 / ③ 单设备 / ④ 多设备 归位到 `testing/{regression,single,multi,share}/`，CI 编排层落到根目录 `ci/`，工具行为不变。

**Architecture:** 以 `git mv` 一次性完成 27 个文件的移动，再按 share+single → regression → multi → 编排层 → 文档的顺序修路径引用，每步用工具自测或静态检查确认，最后在设备上各跑一条 ②③ 链路。唯一的代码移动是 `sanitize` 从 `auto_report.js` 搬到 `share/script_results.js`。

**Tech Stack:** Node 24（`node --test`）、Bash、Yarn 4、Jest、ESLint、GitHub Actions、im-test-orchestrator（Dart）。

## Global Constraints

- 工作目录：`/Users/asterisk/Codes/zuoyu_rn/react-native-chat-sdk/.worktree/5.2.0`（下文命令均在此目录执行，除非另行 `cd`）。
- 分支：`5.2.0`，不合入 `5.x`，不推送。
- 只改位置与路径引用；除 §6 的 `sanitize` 外不改任何函数体、用例、断言、报告格式。
- 设备侧标识符不改：`example/src/{ci,auto,agent}`、`CI_RUN`、`ci_mode.ts`、`ci_run.json`、`rn_ci_run.json`、`[APITEST]`、用例 ID；host 侧沿用模式名的文件名（`ci_test_local.sh`、`run_ci_*.sh`、`assert_ci_run.js`、`render_ci_log.js`）不改。
- 历史文档不改：`docs/porting/`、`docs/superpowers/`（本 spec 与本计划除外）、`docs/testing/2026-11-20-*`、`docs/testing/2026-11-21-*`、`docs/deprecated-api-leftover-audit.md`、`dailylog/` 旧条目。
- 编辑文件用编辑工具逐处修改，不用 `sed`/`perl` 批量替换。
- 运行 Jest 时加 `--no-watchman`。
- 编排工具路径：`IMTO=/Users/asterisk/Codes/zuoyu/im-test-orchestrator`。

---

### Task 1：迁移前基线

**Files:** 无改动。

- [x] **Step 1：工作区干净**

Run: `git status --short`
Expected: 只有本 spec、本计划和 `dailylog/2026-11-26.md`（若有其他未提交改动，停下告知用户）。

- [x] **Step 2：工具自测基线**

Run: `yarn test:ci-scripts`
Expected: 全部 pass，记录 tests/pass 数到"执行记录"。

- [x] **Step 3：门禁基线**

Run: `bash scripts/ci/run_quality.sh`
Expected: 末行 `==> All quality gates passed`。

- [x] **Step 4：多设备 generate 基线（先备份用户现有 cases.json）**

```bash
IMTO=/Users/asterisk/Codes/zuoyu/im-test-orchestrator
cp "$IMTO/multi/config/cases.json" /tmp/imto-cases.user-backup.json
scripts/ci/multi.sh generate --platform android --target testing/target-rn.yaml
cp "$IMTO/multi/config/cases.json" /tmp/imto-cases.before.json
```

Expected: generate 成功退出 0；`/tmp/imto-cases.before.json` 存在。

---

### Task 2：一次性移动文件

**Files:** 27 个移动（见 spec §5），新建目录 `ci/`、`testing/regression/`、`testing/share/`。

- [x] **Step 1：执行移动**

```bash
mkdir -p ci testing/regression testing/share
git mv scripts/ci/run_quality.sh ci/run_quality.sh
for f in ci_test_local.sh run_ci_android.sh run_ci_ios.sh assert_ci_run.js render_ci_log.js \
         check_case_mapping.js fetch_e2e_user_token.js test_assert_ci_run.js \
         test_check_case_mapping.js test_render_ci_log.js test_e2e_accounts.js; do
  git mv "scripts/ci/$f" "testing/regression/$f"
done
git mv docs/ci/native-case-mapping.json testing/regression/native-case-mapping.json
for f in auto_report.js auto_script_local.sh assert_script.js; do
  git mv "scripts/ci/$f" "testing/single/$f"
done
git mv scripts/ci/multi.sh testing/multi/multi.sh
git mv testing/target-rn.yaml testing/multi/target-rn.yaml
git mv testing/multi-tool.json testing/multi/multi-tool.json
for f in script_results.js run_device_android.sh run_device_ios.sh select_android_device.sh \
         select_ios_simulator.sh boot_ios_simulator.sh test_script_results.js; do
  git mv "scripts/ci/$f" "testing/share/$f"
done
git mv scripts/ci/enable-deprecation-lint.gradle scripts/enable-deprecation-lint.gradle
```

- [x] **Step 2：确认移动结果**

Run: `git status --short | rg -c '^R'; ls scripts/ci 2>&1; ls docs/ci`
Expected: `27`；`ls: scripts/ci: No such file or directory`；`docs/ci` 只剩 `README.md`。

---

### Task 3：share/ 与 single/ 引用 + `sanitize` 移动

**Files:**
- Modify: `testing/share/script_results.js`、`testing/share/test_script_results.js`、`testing/share/run_device_android.sh`、`testing/share/run_device_ios.sh`
- Modify: `testing/single/auto_report.js`、`testing/single/assert_script.js`、`testing/single/auto_script_local.sh`

**Interfaces:**
- Produces: `testing/share/script_results.js` 导出 `sanitize(value)`（签名与函数体同原 `auto_report.js`），Task 4 的 `assert_ci_run.js` 依赖它。
- Produces: `auto_report.js` 不再导出 `sanitize`。

- [x] **Step 1：`script_results.js` 增加 `sanitize`**

在 `module.exports = {` 之前插入（原样取自 `auto_report.js`）：

```js
function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value != null && typeof value === 'object') {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      if (/token|password|client.?secret|authorization/i.test(key)) {
        result[key] = '<redacted>';
      } else {
        result[key] = sanitize(item);
      }
    }
    return result;
  }
  if (typeof value === 'string') {
    return value
      .replace(
        /(token|password|client[_-]?secret|authorization)\s*[:=]\s*[^,}\s]+/gi,
        '$1=<redacted>'
      )
      .replace(/(appkey|app_key)\s*[:=]\s*[^,}\s]+/gi, '$1=<redacted>');
  }
  return value;
}

```

导出改为：

```js
module.exports = {
  APITEST_PREFIX,
  collectStepReferences,
  evaluateScript,
  indexLastEntries,
  matchExpectation,
  parseLogText,
  sanitize,
};
```

- [x] **Step 2：`auto_report.js` 改为引用 share**

- 删除整个 `function sanitize(value) { ... }`（上面那段）。
- `const { evaluateScript, parseLogText } = require('./script_results');` → `const { evaluateScript, parseLogText, sanitize } = require('../share/script_results');`
- `module.exports` 中删除 `sanitize,` 一行。
- `spawnSync('bash', ['scripts/ci/auto_script_local.sh', platform], {` → `spawnSync('bash', ['testing/single/auto_script_local.sh', platform], {`

- [x] **Step 3：`assert_script.js`**

- `require('./script_results')` → `require('../share/script_results')`
- `'usage: node scripts/ci/assert_script.js <script.json> <api_test.log>'` → `'usage: node testing/single/assert_script.js <script.json> <api_test.log>'`
- 头部注释 `node scripts/ci/assert_script.js` → `node testing/single/assert_script.js`

- [x] **Step 4：`auto_script_local.sh`**

- `usage: bash scripts/ci/auto_script_local.sh <android|ios>` → `usage: bash testing/single/auto_script_local.sh <android|ios>`
- `bash scripts/ci/select_android_device.sh` → `bash testing/share/select_android_device.sh`
- `exec bash scripts/ci/run_device_android.sh` → `exec bash testing/share/run_device_android.sh`
- `bash scripts/ci/select_ios_simulator.sh` → `bash testing/share/select_ios_simulator.sh`
- `exec bash scripts/ci/run_device_ios.sh` → `exec bash testing/share/run_device_ios.sh`
- 头部注释中的 `scripts/ci/auto_report.js`、`scripts/ci/auto_script_local.sh` 等自引用同步改为新路径。

- [x] **Step 5：`run_device_{android,ios}.sh` 断言默认值**

两个文件：`${ASSERT_SCRIPT:-$REPO_ROOT/scripts/ci/assert_script.js}` → `${ASSERT_SCRIPT:-$REPO_ROOT/testing/single/assert_script.js}`；头部注释里的 `scripts/ci/...` 自引用同步改。`SCRIPT_JSON` 默认值不变。

- [x] **Step 6：`test_script_results.js`**

```js
const {
  collectStepReferences,
  evaluateScript,
  matchExpectation,
  parseLogText,
  sanitize,
} = require('./script_results');
const {
  collectIssues,
  differentShapePaths,
  extractCrashEvidence,
  shapeOf,
} = require('../single/auto_report');
```

（即把 `sanitize` 从 `auto_report` 的解构移到 `script_results` 的解构，其余名字不变。）

- [x] **Step 7：验证**

```bash
node --test testing/share/test_script_results.js
node testing/single/assert_script.js; echo "exit=$?"
for f in testing/share/*.sh testing/single/*.sh; do bash -n "$f" || echo "SYNTAX $f"; done
rg -n "scripts/ci" testing/share testing/single
```

Expected: 测试全 pass（数量与基线中该文件一致）；第二条打印 `usage: node testing/single/assert_script.js ...` 且 `exit` 非 0；无 `SYNTAX` 行；`rg` 无输出。

---

### Task 4：regression/ 引用 + 产物改名

**Files:**
- Modify: `testing/regression/{assert_ci_run.js,check_case_mapping.js,render_ci_log.js,ci_test_local.sh,run_ci_android.sh,run_ci_ios.sh,fetch_e2e_user_token.js,test_e2e_accounts.js}`

**Interfaces:**
- Consumes: Task 3 的 `sanitize` 导出（`../share/script_results`）。

- [x] **Step 1：`assert_ci_run.js`**

- 原两行
  ```js
  const { parseLogText } = require('./script_results');
  const { sanitize } = require('./auto_report');
  ```
  改为
  ```js
  const { parseLogText, sanitize } = require('../share/script_results');
  ```
- `path.join(REPO_ROOT, 'docs/ci/native-case-mapping.json')` → `path.join(REPO_ROOT, 'testing/regression/native-case-mapping.json')`
- `path.join(REPO_ROOT, 'artifacts/ci')` → `path.join(REPO_ROOT, 'artifacts/regression')`
- usage 字符串 `node scripts/ci/assert_ci_run.js` → `node testing/regression/assert_ci_run.js`
- 头部注释：`docs/ci/native-case-mapping.json` → `testing/regression/native-case-mapping.json`；`<repo>/artifacts/ci` → `<repo>/artifacts/regression`；`scripts/ci/...` 自引用改新路径。

- [x] **Step 2：`check_case_mapping.js`**

- `path.join(REPO_ROOT, 'docs/ci/native-case-mapping.json')` → `path.join(REPO_ROOT, 'testing/regression/native-case-mapping.json')`
- 头部注释中的 `docs/ci/native-case-mapping.json`、`node scripts/ci/check_case_mapping.js`、`scripts/ci/run_quality.sh` → 新路径（`ci/run_quality.sh`）。

- [x] **Step 3：`render_ci_log.js`**

`require('./script_results')` → `require('../share/script_results')`；注释中的 `scripts/ci/...` 改新路径。

- [x] **Step 4：`ci_test_local.sh`**

- `REPORT_DIR="$REPO_ROOT/artifacts/ci"` → `REPORT_DIR="$REPO_ROOT/artifacts/regression"`
- 三处 `node scripts/ci/fetch_e2e_user_token.js` → `node testing/regression/fetch_e2e_user_token.js`
- `bash scripts/ci/select_android_device.sh` → `bash testing/share/select_android_device.sh`
- `bash scripts/ci/select_ios_simulator.sh` → `bash testing/share/select_ios_simulator.sh`
- 两处 `ASSERT_SCRIPT="$REPO_ROOT/scripts/ci/assert_ci_run.js"` → `ASSERT_SCRIPT="$REPO_ROOT/testing/regression/assert_ci_run.js"`
- `bash scripts/ci/run_ci_android.sh` → `bash testing/regression/run_ci_android.sh`；`bash scripts/ci/run_ci_ios.sh` → `bash testing/regression/run_ci_ios.sh`
- usage、`local command="bash scripts/ci/ci_test_local.sh $PLATFORM"`、`CI_COMMAND="bash scripts/ci/ci_test_local.sh $PLATFORM"` → `testing/regression/ci_test_local.sh`
- 头部注释：`artifacts/ci/` → `artifacts/regression/`，`scripts/ci/...` → 新路径。

- [x] **Step 5：`run_ci_android.sh`、`run_ci_ios.sh`**

- `ENTRY_DIR="${ENTRY_DIR:-$REPO_ROOT/artifacts/ci}"` → `ENTRY_DIR="${ENTRY_DIR:-$REPO_ROOT/artifacts/regression}"`
- `"$REPO_ROOT/scripts/ci/select_android_device.sh"` / `select_ios_simulator.sh` → `"$REPO_ROOT/testing/share/..."`
- `"$REPO_ROOT/scripts/ci/render_ci_log.js"` → `"$REPO_ROOT/testing/regression/render_ci_log.js"`
- `"$REPO_ROOT/scripts/ci/run_device_android.sh"` / `run_device_ios.sh` → `"$REPO_ROOT/testing/share/..."`
- 注释中的 `artifacts/ci`、`scripts/ci/...` 同步。

- [x] **Step 6：`fetch_e2e_user_token.js` 注释**

用法注释中三处 `node scripts/ci/fetch_e2e_user_token.js` → `node testing/regression/fetch_e2e_user_token.js`。

- [x] **Step 7：`test_e2e_accounts.js` fixture 按新布局建目录**

```js
  const scripts = path.join(dir, 'testing/regression');
  const share = path.join(dir, 'testing/share');
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(scripts, { recursive: true });
  fs.mkdirSync(share, { recursive: true });
  fs.mkdirSync(bin);
```

选择器写入位置 `path.join(scripts, selector)` → `path.join(share, selector)`；`ci_test_local.sh`、`fetch_e2e_user_token.js`、`run_ci_${platform}.sh` 仍写入 `scripts`（即 `testing/regression`）。

- [x] **Step 8：验证**

```bash
node --test testing/regression/test_assert_ci_run.js testing/regression/test_check_case_mapping.js \
  testing/regression/test_render_ci_log.js testing/regression/test_e2e_accounts.js
node testing/regression/check_case_mapping.js; echo "exit=$?"
for f in testing/regression/*.sh; do bash -n "$f" || echo "SYNTAX $f"; done
rg -n "scripts/ci|docs/ci/native|artifacts/ci" testing/regression
```

Expected: 测试全 pass（数量与基线一致）；`check_case_mapping` `exit=0`；无 `SYNTAX`；`rg` 无输出。

---

### Task 5：multi/ 引用

**Files:**
- Modify: `testing/multi/multi.sh`、`testing/multi/target-rn.yaml`

- [x] **Step 1：`multi.sh`**

- `PIN_FILE="$REPO_ROOT/testing/multi-tool.json"` → `PIN_FILE="$REPO_ROOT/testing/multi/multi-tool.json"`
- 头部注释：`testing/multi-tool.json` → `testing/multi/multi-tool.json`；`scripts/ci/multi.sh` → `testing/multi/multi.sh`；`testing/target-rn.yaml` → `testing/multi/target-rn.yaml`。

- [x] **Step 2：`target-rn.yaml`（相对路径按 target 文件所在目录解析）**

- `appDir: ../example` → `appDir: ../../example`
- `casesDir: multi/cases` → `casesDir: cases`
- 第 2 行注释 `--target testing/target-rn.yaml` → `--target testing/multi/target-rn.yaml`

- [x] **Step 3：验证（经 multi.sh，与基线比对）**

```bash
IMTO=/Users/asterisk/Codes/zuoyu/im-test-orchestrator
bash -n testing/multi/multi.sh
testing/multi/multi.sh generate --platform android --target testing/multi/target-rn.yaml
diff /tmp/imto-cases.before.json "$IMTO/multi/config/cases.json" && echo SAME
```

Expected: generate 退出 0；`SAME`。

- [x] **Step 4：验证（直接调 orchestrator，覆盖 target 的 `casesDir`）**

```bash
RN="$PWD"
(cd "$IMTO/multi" && dart run scripts/generate_cases.dart --platform android --target "$RN/testing/multi/target-rn.yaml")
diff /tmp/imto-cases.before.json "$IMTO/multi/config/cases.json" && echo SAME
```

Expected: 退出 0；`SAME`（若仅有 cases 目录路径的写法差异而场景集合一致，记录差异并视为通过）。

- [x] **Step 5：恢复用户原有 cases.json**

Run: `cp /tmp/imto-cases.user-backup.json "$IMTO/multi/config/cases.json"`
Expected: 无输出。

---

### Task 6：CI 编排层与入口接线

**Files:**
- Modify: `ci/run_quality.sh`、`package.json`、`eslint.config.mjs`、`.github/workflows/ci.yml`、`.github/workflows/ci-device.yml`、`example/package.json`、`scripts/scan-deprecated-android.sh`
- Create: `ci/README.md`

- [x] **Step 1：`ci/run_quality.sh`**

- `repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"` → `repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"`
- `echo "==> CI case mapping check"` / `node scripts/ci/check_case_mapping.js` → `echo "==> Regression case mapping check"` / `node testing/regression/check_case_mapping.js`
- `echo "==> CI script regression tests"` / `yarn test:ci-scripts` → `echo "==> Testing tool tests"` / `yarn test:tools`

- [x] **Step 2：`package.json` scripts**

```json
    "test:tools": "node --test testing/share/test_script_results.js testing/regression/test_assert_ci_run.js testing/regression/test_check_case_mapping.js testing/regression/test_e2e_accounts.js testing/regression/test_render_ci_log.js",
    "test:coverage": "jest --coverage",
    "report:api": "node testing/single/auto_report.js",
```

删除原 `test:ci-scripts` 一行（`test:tools` 放在其原位置）。

- [x] **Step 3：`eslint.config.mjs`**

`ignores` 中 `'scripts/',` 之后加一行 `'testing/',`。

- [x] **Step 4：`.github/workflows/ci.yml`**

`run: bash scripts/ci/run_quality.sh` → `run: bash ci/run_quality.sh`

- [x] **Step 5：`.github/workflows/ci-device.yml`**

- 4 处 `bash scripts/ci/ci_test_local.sh` → `bash testing/regression/ci_test_local.sh`（`script:` 两处、`run` 块两处）
- 注释 3 处 `scripts/ci/ci_test_local.sh` → `testing/regression/ci_test_local.sh`
- 4 处 upload-artifact 的 `artifacts/ci/` → `artifacts/regression/`

- [x] **Step 6：deprecated 扫描接线**

- `example/package.json` `build:android`：`-I ../../scripts/ci/enable-deprecation-lint.gradle` → `-I ../../scripts/enable-deprecation-lint.gradle`
- `scripts/scan-deprecated-android.sh`：`-I "$PROJECT_ROOT/scripts/ci/enable-deprecation-lint.gradle"` → `-I "$PROJECT_ROOT/scripts/enable-deprecation-lint.gradle"`；第 31 行注释同步。
- `scripts/enable-deprecation-lint.gradle` 头部 "Referenced from" 注释中的路径同步。

- [x] **Step 7：新建 `ci/README.md`**

```markdown
# CI 编排层

CI 只负责调用：各测试分类的执行入口在 `testing/` 下（见 [testing/README.md](../testing/README.md)），本地与 CI 调用同一个入口。本目录只放跨分类或 CI 专属的内容。

## 调用矩阵

| 触发 | workflow / job | 调用 | 覆盖 |
|---|---|---|---|
| PR（任意 base）；push 到 `dev`/`1.x`/`5.x`（忽略 `dailylog/**`、`docs/**`、`*.md`）；手动 | `ci.yml` / `quality` | `bash ci/run_quality.sh` | typecheck、lint、① 单元与契约测试、① 测试工具自测、② 用例登记表静态检查、循环依赖 |
| 同上 | `ci.yml` / `android-build`、`ios-build` | 构建 + `scripts/scan-deprecated-*.sh` | 构建与 native deprecated API 扫描（不属于测试分类） |
| 每日 19:37 UTC（只在默认分支 `dev` 生效；`5.x` 由 `dev` 上的 `ci-dispatch.yml` 派发）；手动 | `ci-device.yml` / `android-test-logged-out`、`ios-test-logged-out` | `bash testing/regression/ci_test_local.sh <platform> logged_out` | ② 未登录入口 |
| 同上 | `ci-device.yml` / `android-test-logged-in`、`ios-test-logged-in` | `bash testing/regression/ci_test_local.sh <platform> logged_in_base,logged_in_group,logged_in_contact,logged_in_user_info` | ② 四个登录入口 |

③ 单设备、④ 多设备目前不由 CI 调用，只在本地执行。

## 新增 CI 调用的规则

1. workflow 直接调用分类的执行入口，不在本目录为每个分类再包一层转发脚本。
2. 只有跨分类的门禁，或 CI 专属的准备逻辑（如 runner 上启动多台模拟器、准备账号），才在本目录新增文件。
3. 逻辑放在脚本里而不是内联在 YAML 里，保证本地运行与 CI 一致。
4. 新增调用后同步更新上面的调用矩阵。
```

- [x] **Step 8：验证**

```bash
bash ci/run_quality.sh
rg -n "scripts/ci|artifacts/ci" .github package.json example/package.json scripts ci eslint.config.mjs
```

Expected: 末行 `==> All quality gates passed`（其中 `test:tools` 的 tests 数 = 基线 `test:ci-scripts` 的 tests 数）；`rg` 无输出。

---

### Task 7：现行文档与注释

**Files:**
- Modify: `testing/README.md`（重写）、`AGENTS.md`、`testing/multi/README.md`、`docs/testing/README.md`、`docs/testing/2026-11-19-ci.md`、`docs/testing/2026-11-19-single-device.md`、`docs/testing/2026-11-19-multi-device.md`、`docs/ci/README.md`、`example/src/ci/harness.ts`（注释）、`example/src/agent/CONTRACT.md`、`example/android/app/build.gradle`（注释）

改写规则（每个文件逐处应用）：

| 旧 | 新 |
|---|---|
| `scripts/ci/run_quality.sh` | `ci/run_quality.sh` |
| `scripts/ci/<②文件>`（ci_test_local、run_ci_*、assert_ci_run、render_ci_log、check_case_mapping、fetch_e2e_user_token） | `testing/regression/<同名>` |
| `scripts/ci/<③文件>`（auto_report、auto_script_local、assert_script） | `testing/single/<同名>` |
| `scripts/ci/<共用文件>`（script_results、run_device_*、select_*、boot_ios_simulator） | `testing/share/<同名>` |
| `scripts/ci/multi.sh` | `testing/multi/multi.sh` |
| `scripts/ci/enable-deprecation-lint.gradle` | `scripts/enable-deprecation-lint.gradle` |
| `docs/ci/native-case-mapping.json` | `testing/regression/native-case-mapping.json` |
| `testing/target-rn.yaml` / `testing/multi-tool.json` | `testing/multi/target-rn.yaml` / `testing/multi/multi-tool.json` |
| `artifacts/ci/` | `artifacts/regression/` |
| `yarn test:ci-scripts` | `yarn test:tools` |
| 类别名"CI 设备回归" / "CI device regression (layer)" | "设备回归" / "device regression"（指调用方时保留 "CI"，如"由 CI 每日调用"） |
| 相对链接（如 `../../testing/multi/README.md`） | 按文件实际位置重算 |

- [x] **Step 1：重写 `testing/README.md`**

```markdown
# 测试入口

本仓测试分四类，由 CI 编排层（`.github/workflows/` + [`ci/`](../ci/README.md)）按需调用；本地与 CI 调用同一个入口。设计与选层规则见[测试指南](../docs/testing/README.md)。

| 类别 | 设备侧（打进 example） | host 侧入口 | 用例 | 产物 |
|---|---|---|---|---|
| ① 单元测试 | — | `yarn test:unit`、`yarn test:contract`、`yarn test:tools` | `src/__tests__/`、`example/src/{agent,ci}/__tests__/`、`testing/**/test_*.js` | — |
| ② 设备回归 | `example/src/ci/` | `bash testing/regression/ci_test_local.sh <android\|ios> [entries]` | `example/src/ci/modules/*_cases.ts`，登记于 `regression/native-case-mapping.json` | `artifacts/regression/<timestamp>/<platform>/` |
| ③ 单设备 | `example/src/auto/` | `yarn report:api --platform <android\|ios> [--script <json>]` | `single/cases/*.json` | `artifacts/single/<timestamp>/<platform>/` |
| ④ 多设备 | `example/src/agent/` | `testing/multi/multi.sh all --target testing/multi/target-rn.yaml ...` | `multi/cases/*.{yaml,json}` | `artifacts/multi/<timestamp>/<platform>/` |

## 目录

- `regression/`：② 的执行入口、驱动封装、结果断言、日志渲染、用例登记表及其静态检查、token 获取。
- `single/`：③ 的报告 runner、本地构建运行脚本、断言、用例。
- `multi/`：④ 的 orchestrator 薄封装、RN target 配置、工具 pin、用例；说明见 [multi/README.md](multi/README.md)。
- `share/`：②③ 共用的设备驱动、设备选择、`[APITEST]` 日志解析与脱敏。
- `test_<x>.js` 与 `<x>.js` 同目录，由 `yarn test:tools` 执行。

## 设备侧模式名

一次构建只能进入一种模式（同时内联会在启动时报错）。设备侧沿用历史命名：

| 类别 | 打包期内联开关 | 设备侧目录 |
|---|---|---|
| ② 设备回归 | `CI_RUN` | `example/src/ci/` |
| ③ 单设备 | `API_SCRIPT` | `example/src/auto/` |
| ④ 多设备 | `EASEMOB_AGENT` | `example/src/agent/` |

`ci_test_local.sh`、`run_ci_*.sh`、`assert_ci_run.js`、`render_ci_log.js` 文件名中的 `ci` 指 `CI_RUN` 模式，不是 CI 编排层。本地配置、账号、日志与报告均保持 Git 忽略。
```

- [x] **Step 2：`AGENTS.md`**

- Commands 节：`yarn test:ci-scripts` 行改为 `yarn test:tools   # Node tests for the host-side testing tools (testing/**/test_*.js)`；`report:api` 相关行路径不变。
- Commands 节末尾门禁说明：`scripts/ci/run_quality.sh` → `ci/run_quality.sh`。
- CI 节：按改写规则替换全部路径；首段增加一句 "CI is the orchestration layer (`.github/workflows/` + `ci/`, call matrix in `ci/README.md`); it only calls each test category's entry under `testing/` (see `testing/README.md`)."；"CI device regression layer" 改为 "device regression layer (called daily by CI)"。

- [x] **Step 3：其余文档与注释**

按改写规则逐个处理：`testing/multi/README.md`、`docs/testing/README.md`、`docs/testing/2026-11-19-ci.md`（含第 302 行附近的目录示例 `artifacts/ci/...`）、`docs/testing/2026-11-19-single-device.md`、`docs/testing/2026-11-19-multi-device.md`、`docs/ci/README.md`、`example/src/ci/harness.ts`、`example/src/agent/CONTRACT.md`、`example/android/app/build.gradle`。文件名不改。

- [x] **Step 4：引用清零**

```bash
rg -n "scripts/ci|docs/ci/native-case-mapping|testing/target-rn|testing/multi-tool|test:ci-scripts|artifacts/ci" \
  --glob '!dailylog/**' --glob '!artifacts/**' --glob '!node_modules/**' --glob '!lib/**' \
  --glob '!docs/porting/**' --glob '!docs/superpowers/**' \
  --glob '!docs/testing/2026-11-20-*' --glob '!docs/testing/2026-11-21-*' \
  --glob '!docs/deprecated-api-leftover-audit.md' .
```

Expected: 无输出。

- [x] **Step 5：格式检查**

Run: `npx prettier --check testing/README.md ci/README.md testing/regression/native-case-mapping.json docs/testing/*.md docs/ci/README.md AGENTS.md`
Expected: 全部通过（若有差异，用 `npx prettier --write` 修正对应文件后重跑）。

---

### Task 8：设备验证

**Files:** 无改动。前置：`adb devices` 只有 `emulator-5554` 在线；`example/config.local.json` 可用。

- [x] **Step 1：② Android 未登录入口**

Run: `bash testing/regression/ci_test_local.sh android logged_out`
Expected: 退出 0；`artifacts/regression/<timestamp>/android/summary.md` 存在且无 fail/blocked；把 timestamp 与通过数记入"执行记录"。

- [x] **Step 2：③ Android 5.2.0 正向脚本**

Run: `yarn report:api --platform android --script testing/single/cases/port_5_2_0_positive.json`
Expected: 跑通；`artifacts/single/<timestamp>/android/report.md` 存在，结果与 5.2.0 已有验证一致（见 `docs/porting/5.2.0/04-verification.md`）；记录 timestamp。

- [x] **Step 3：② iOS 未登录入口（有已启动模拟器时）**

Run: `bash testing/regression/ci_test_local.sh ios logged_out`
Expected: 退出 0；`artifacts/regression/<timestamp>/ios/summary.md` 无 fail/blocked。若环境不可用，在"执行记录"写明原因。

- [x] **Step 4：workflow 路径人工核对**

Run: `rg -n "testing/|ci/run_quality|artifacts/regression" .github/workflows`
Expected: `ci.yml` 1 处 `ci/run_quality.sh`；`ci-device.yml` 4 处 `testing/regression/ci_test_local.sh` 调用、3 处注释、4 处 `artifacts/regression/`。远端首次触发时再确认（本次不推送）。

---

### Task 9：收尾与提交

**Files:**
- Modify: 本计划（复选框、状态、执行记录）、spec（状态改为"已实现"）、`dailylog/2026-11-26.md`

- [x] **Step 1：回填本计划**：全部复选框改 `[x]`，"状态"改为"已实现，待提交"，填写"执行记录"。
- [x] **Step 2：spec 状态**：`状态：待评审` → `状态：已实现`。
- [x] **Step 3：dailylog**：追加一条，写明迁移完成、验证结果（引用执行记录中的 run timestamp）、未做事项（spec §9.3、§9.5）。
- [x] **Step 4：提交前检查**

Run: `git status --short`
Expected: 只包含本计划涉及的文件（移动、修改、新增 `ci/README.md`、spec、plan、dailylog）；无 `artifacts/`、`gitleaks.log` 等无关文件。

- [x] **Step 5：等待用户确认后提交**

```bash
git add -A ci testing scripts docs .github AGENTS.md package.json eslint.config.mjs \
  example/package.json example/src/ci/harness.ts example/src/agent/CONTRACT.md \
  example/android/app/build.gradle dailylog
git commit -m "refactor(test): reorganize test assets by category under testing/ and ci/"
```

Expected: lefthook pre-commit（eslint/tsc/jest related）与 commit-msg 通过；`git log -1 --stat` 显示 27 个 rename。

---

## 任务依赖关系

- Task 1 → Task 2（基线必须在移动前取得）
- Task 2 → Task 3、Task 4、Task 5、Task 6（移动后才能修引用）
- Task 3 → Task 4（`assert_ci_run.js` 依赖 share 导出的 `sanitize`）
- Task 3、Task 4 → Task 6（`run_quality.sh` 跑 `test:tools` 覆盖两者）
- Task 5 与 Task 3、Task 4 互不依赖，Task 2 之后可并行
- Task 3–6 → Task 7（引用清零检查需要代码侧全部改完）
- Task 6、Task 7 → Task 8（在最终目录树上做设备验证）
- Task 8 → Task 9

## 执行记录

执行时逐项填写；提交前不得留空（不适用的写明原因）。

| Task | 结论 | 证据（命令 / 关键输出 / run timestamp） |
|---|---|---|
| 1 基线 | 通过 | `yarn test:ci-scripts` 66/66（script_results 20、assert_ci_run 12、check_case_mapping 12、render_ci_log 13、e2e_accounts 9）；`bash scripts/ci/run_quality.sh` 末行 `All quality gates passed`；`multi.sh generate` 13 cases，快照 `/tmp/imto-cases.before.json` |
| 2 移动 | 通过 | `git status` 中 `R` 27 条；`scripts/ci` 已删除；`docs/ci` 只剩 `README.md` |
| 3 share/single | 通过（计划外一处） | `node --test testing/share/test_script_results.js` 20/20；`assert_script.js` 无参打印新 usage 且非 0；`bash -n` 通过；`rg scripts/ci` 无命中。计划未写到：`test_script_results.js` 原用 `__dirname` 读相邻脚本，搬迁后按仓库根 `SCRIPT_PATHS` 解析 |
| 4 regression | 通过 | 四个 `test_*.js` 12+12+13+9 全过；`check_case_mapping.js` exit 0；`bash -n` 通过；`rg scripts/ci\|docs/ci/native\|artifacts/ci` 无命中 |
| 5 multi | 通过 | `multi.sh generate` 与直接 `dart run scripts/generate_cases.dart` 均 exit 0，且与基线 `diff` 为 SAME（13 cases）；用户原 `cases.json` 已从 `/tmp/imto-cases.user-backup.json` 恢复 |
| 6 编排层 | 通过 | `bash ci/run_quality.sh` 通过，`test:tools` 66/66；`rg scripts/ci\|artifacts/ci` 在 `.github`、`package.json`、`example/package.json`、`scripts`、`ci`、`eslint.config.mjs` 无命中。`ci/README.md` 经 prettier 对齐后通过 |
| 7 文档 | 通过 | 全仓引用清零（排除历史文档、dailylog、artifacts、node_modules、lib）。prettier 通过现行文档；`docs/testing/2026-11-21-*` 是历史文件，原有格式问题按约束不改 |
| 8 设备验证 | 通过 | Android ② `artifacts/regression/20261126170320` logged_out 23/23；iOS ② `artifacts/regression/20261126170940` logged_out 23/23；Android ③ `artifacts/single/20261126170901` init+login+3 steps，`report.md` 已写出。第一次 ③ 因 `auto_report.js` 仍按 `__dirname` 找 `script_results.js` 失败（计划未列），已改为 `../share/script_results.js` 后重跑通过。workflow：`ci.yml` 1 处 `ci/run_quality.sh`；`ci-device.yml` 4 处调用、3 处注释、4 处 `artifacts/regression/`。iOS 构建改写了 `Podfile.lock` 与 `project.pbxproj`，已 `git checkout` 还原，不进本次提交 |
| 9 收尾 | 已提交 | 用户确认后单次提交。复选框、本表、spec、dailylog 含在同一提交里 |

计划执行完之后，按用户要求把现行操作说明挪到目录旁边：`testing/README.md`（选层、环境、共同原则），`testing/regression/README.md`（怎么跑 + 怎么加用例，合并原 `docs/ci/README.md`），`testing/single/README.md`，`testing/multi/README.md`。已删除 `docs/testing/README.md`、`docs/testing/2026-11-19-{ci,single-device,multi-device}.md`、`docs/ci/README.md`。`docs/testing/2026-11-20-*` 与 `2026-11-21-*` 仍留在 `docs/`。重复的工具链只保留在 `testing/README.md`；设备回归文档里与本地时间戳矛盾的 “目录名是 UTC” 已删。多设备 target 的相对路径改为 `appDir: ../../example`、`casesDir: cases`。
