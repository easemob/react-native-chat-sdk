#!/usr/bin/env node
/**
 * Assert an example auto-mode run against the expectations in its script.
 * The parsing and classification logic is shared with auto_report.js.
 *
 * Usage:
 *   node scripts/ci/assert_script.js <script.json> <api_test.log>
 *
 * Exit code 0 on success, 1 on assertion failure, 2 on usage/IO errors.
 */

const fs = require('node:fs');
const { evaluateScript, parseLogText } = require('./script_results');

function fail2(message) {
  console.error(`assert_script: error: ${message}`);
  process.exit(2);
}

function main() {
  const [, , scriptPath, logPath] = process.argv;
  if (scriptPath == null || logPath == null) {
    fail2(
      'usage: node scripts/ci/assert_script.js <script.json> <api_test.log>'
    );
  }
  if (!fs.existsSync(scriptPath)) {
    fail2(`script not found: ${scriptPath}`);
  }
  if (!fs.existsSync(logPath)) {
    fail2(`log file not found: ${logPath}`);
  }

  let script;
  try {
    script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  } catch (error) {
    fail2(`unable to parse script: ${error.message}`);
  }
  if (!Array.isArray(script.steps) || script.steps.length === 0) {
    fail2('script has no steps');
  }

  const entries = parseLogText(fs.readFileSync(logPath, 'utf8'));
  console.log(
    `assert_script: ${entries.length} structured entries parsed from ${logPath}`
  );
  const evaluation = evaluateScript(script, entries);

  if (evaluation.failures.length > 0) {
    console.error(
      `assert_script: FAILED (${evaluation.failures.length} problem(s)):`
    );
    for (const failure of evaluation.failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  const scope = evaluation.loginEntry != null ? 'init + login' : 'init';
  console.log(
    `assert_script: OK (${scope} + ${script.steps.length} step(s), all as expected)`
  );
}

if (require.main === module) {
  main();
}

module.exports = { main };
