#!/usr/bin/env node
/**
 * Assert a CI harness device run (example/src/ci/) against the structured
 * `[APITEST]` log and reconcile it with docs/ci/native-case-mapping.json.
 * The log parsing is shared with assert_script.js / auto_report.js.
 *
 * Usage:
 *   CI_PLATFORM=<android|ios> node scripts/ci/assert_ci_run.js <ci_run.json> <api_test.log>
 *
 * Environment:
 *   CI_PLATFORM     (required) device platform that produced the log;
 *                   drives the mapping reconciliation via the per-case
 *                   `platforms` array.
 *   CI_REPORT_DIR   (optional) exact output directory for summary.md; takes
 *                   precedence over CI_REPORT_ROOT. ci_test_local.sh sets it
 *                   so all artifacts stay in one timestamped run directory.
 *   CI_REPORT_ROOT  (optional) report output root; defaults to
 *                   <repo>/artifacts/ci. Tests point it at a temp dir.
 *
 * Exit code 0 when the run is green, 1 on any assertion failure, 2 on
 * usage/IO errors. A run fails when any of the following holds:
 *   - a case result has status `fail`;
 *   - a case result has status `blocked` (counts as failure, reported in
 *     its own category);
 *   - `script.done` is missing (driver-level failure / app crash);
 *   - `script.done` reports `total === 0` (empty run must never go green);
 *   - any `ci.run.error` record is present (fail-fast startup errors);
 *   - a case registered in the mapping for this platform and entry is
 *     absent from the run output (`missing`);
 *   - a `RN-*` case id appears in the log but is unknown to the mapping
 *     (`unregistered`; synthetic harness records such as
 *     `<suite>.afterAll` are not `RN-*` ids and are judged by their own
 *     status instead).
 *
 * A human-readable report is always written to
 * <CI_REPORT_DIR>/summary.md when set, else
 * <CI_REPORT_ROOT>/<run-id>/summary.md (run-id is timestamp-based);
 * credential-shaped values are redacted before anything is written.
 */

const fs = require('node:fs');
const path = require('node:path');
const { parseLogText } = require('./script_results');
const { sanitize } = require('./auto_report');

const REPO_ROOT = path.resolve(__dirname, '../..');
const MAPPING_PATH = path.join(REPO_ROOT, 'docs/ci/native-case-mapping.json');
const DEFAULT_REPORT_ROOT = path.join(REPO_ROOT, 'artifacts/ci');
const PLATFORMS = ['android', 'ios'];
const ENTRIES = [
  'logged_out',
  'logged_in_base',
  'logged_in_group',
  'logged_in_contact',
  'logged_in_user_info',
];
const CASE_ID_PATTERN = /^RN-[A-Z]+-[0-9]+$/;

function fail2(message) {
  console.error(`assert_ci_run: error: ${message}`);
  process.exit(2);
}

function laterEntry(first, second) {
  if (first == null) return second;
  if (second == null) return first;
  const firstSeq = Number(first.seq ?? 0);
  const secondSeq = Number(second.seq ?? 0);
  return secondSeq >= firstSeq ? second : first;
}

function loadMapping(mappingPath = MAPPING_PATH) {
  if (!fs.existsSync(mappingPath)) {
    fail2(`mapping not found: ${mappingPath}`);
  }
  let mapping;
  try {
    mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  } catch (error) {
    fail2(`unable to parse mapping: ${error.message}`);
  }
  if (!Array.isArray(mapping.cases)) {
    fail2('mapping has no cases array');
  }
  return mapping;
}

/**
 * Classifies one run. `entries` are the parsed `[APITEST]` records,
 * `mapping` the parsed native-case-mapping.json, `platform` the CI_PLATFORM
 * value and `entry` the entry selected by ci_run.json.
 */
function evaluateCiRun(entries, mapping, platform, entry) {
  const caseResults = new Map();
  const runErrors = [];
  let summary = null;
  let done = null;
  for (const record of entries) {
    if (record.source === 'ci.case.result') {
      const caseId = record.payload?.caseId;
      if (typeof caseId === 'string') {
        caseResults.set(caseId, laterEntry(caseResults.get(caseId), record));
      }
    } else if (record.source === 'ci.run.error') {
      runErrors.push(record);
    } else if (record.source === 'ci.run.summary') {
      summary = laterEntry(summary, record);
    } else if (record.source === 'script.done') {
      done = laterEntry(done, record);
    }
  }

  const passed = [];
  const failed = [];
  const blocked = [];
  const unregistered = [];
  const mappingIds = new Set(mapping.cases.map((item) => item.caseId));
  for (const [caseId, record] of caseResults) {
    const status = record.payload?.status;
    const detail = { caseId, status, error: record.payload?.error ?? null };
    if (status === 'fail') {
      failed.push(detail);
    } else if (status === 'blocked') {
      blocked.push(detail);
    } else if (status === 'pass') {
      passed.push(detail);
    }
    if (CASE_ID_PATTERN.test(caseId) && !mappingIds.has(caseId)) {
      unregistered.push(detail);
    }
  }

  const expected = mapping.cases.filter(
    (item) => item.entry === entry && item.platforms.includes(platform)
  );
  const missing = expected.filter((item) => !caseResults.has(item.caseId));

  const failures = [];
  for (const item of failed) {
    failures.push(
      `case ${item.caseId} failed (${item.error?.phase ?? 'unknown'}): ${
        item.error?.message ?? '<no message>'
      }`
    );
  }
  for (const item of blocked) {
    failures.push(
      `case ${item.caseId} blocked (${item.error?.phase ?? 'unknown'}): ${
        item.error?.message ?? '<no message>'
      }`
    );
  }
  for (const item of missing) {
    failures.push(`case ${item.caseId} registered for ${entry}/${platform} but missing from the run`);
  }
  for (const item of unregistered) {
    failures.push(`case ${item.caseId} is not registered in the mapping`);
  }
  for (const record of runErrors) {
    failures.push(
      `ci.run.error: ${record.payload?.message ?? JSON.stringify(record.payload)}`
    );
  }
  if (done == null) {
    failures.push('missing log entry: script.done (run did not finish?)');
  } else if (done.payload?.total === 0) {
    failures.push('empty run: script.done reports total=0');
  }

  return {
    platform,
    entry,
    caseResults,
    runErrors,
    summary,
    done,
    passed,
    failed,
    blocked,
    missing,
    unregistered,
    expectedCount: expected.length,
    failures,
  };
}

function timestamp(date) {
  return date
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);
}

function resultLine(item) {
  if (item.error == null) {
    return `- \`${item.caseId}\``;
  }
  return `- \`${item.caseId}\` (${item.error.phase}): ${item.error.message}`;
}

function buildReport(evaluation, meta) {
  const counts = {
    pass: evaluation.passed.length,
    fail: evaluation.failed.length,
    blocked: evaluation.blocked.length,
    missing: evaluation.missing.length,
    unregistered: evaluation.unregistered.length,
  };
  const green = evaluation.failures.length === 0;
  const lines = [
    `# CI device run ${meta.runId}`,
    '',
    `- Result: **${green ? 'PASS' : 'FAIL'}**`,
    `- Entry: \`${evaluation.entry}\``,
    `- Platform: \`${evaluation.platform}\``,
    `- Counts: pass=${counts.pass} fail=${counts.fail} blocked=${counts.blocked} missing=${counts.missing} unregistered=${counts.unregistered} (expected ${evaluation.expectedCount} for this entry/platform)`,
    `- ci_run.json: \`${meta.ciRunPath}\``,
    `- Device log: \`${meta.logPath}\``,
    '',
  ];
  if (evaluation.summary != null) {
    lines.push(
      `On-device summary: ${JSON.stringify(
        sanitize(evaluation.summary.payload)
      )}`,
      ''
    );
  }
  if (evaluation.done != null) {
    lines.push(
      `script.done: ${JSON.stringify(sanitize(evaluation.done.payload))}`,
      ''
    );
  }

  const section = (title, items) => {
    lines.push(`## ${title} (${items.length})`, '');
    if (items.length === 0) {
      lines.push('- none', '');
    } else {
      for (const item of items) {
        lines.push(resultLine(sanitize(item)));
      }
      lines.push('');
    }
  };
  section('Passed', evaluation.passed);
  section('Failed', evaluation.failed);
  section('Blocked', evaluation.blocked);
  section('Missing (registered but not executed)', evaluation.missing);
  section('Unregistered (in log but not in mapping)', evaluation.unregistered);

  lines.push(`## Run errors (${evaluation.runErrors.length})`, '');
  if (evaluation.runErrors.length === 0) {
    lines.push('- none', '');
  } else {
    for (const record of evaluation.runErrors) {
      lines.push(`- ${JSON.stringify(sanitize(record.payload))}`);
    }
    lines.push('');
  }
  if (evaluation.done == null) {
    lines.push(
      '## Driver',
      '',
      '- `script.done` missing: the run did not finish (driver-level failure or app crash)',
      ''
    );
  }

  return { counts, green, markdown: lines.join('\n') };
}

function main() {
  const [, , ciRunPath, logPath] = process.argv;
  const platform = process.env.CI_PLATFORM;
  if (ciRunPath == null || logPath == null) {
    fail2(
      'usage: CI_PLATFORM=<android|ios> node scripts/ci/assert_ci_run.js <ci_run.json> <api_test.log>'
    );
  }
  if (!PLATFORMS.includes(platform)) {
    fail2(
      `CI_PLATFORM must be one of ${PLATFORMS.join(', ')} (got ${JSON.stringify(
        platform
      )})`
    );
  }
  if (!fs.existsSync(ciRunPath)) {
    fail2(`ci_run.json not found: ${ciRunPath}`);
  }
  if (!fs.existsSync(logPath)) {
    fail2(`log file not found: ${logPath}`);
  }

  let ciRun;
  try {
    ciRun = JSON.parse(fs.readFileSync(ciRunPath, 'utf8'));
  } catch (error) {
    fail2(`unable to parse ci_run.json: ${error.message}`);
  }
  const entry = ciRun?.entry;
  if (!ENTRIES.includes(entry)) {
    fail2(
      `ci_run.json entry must be one of ${ENTRIES.join(', ')} (got ${JSON.stringify(
        entry
      )})`
    );
  }

  const mapping = loadMapping();
  const entries = parseLogText(fs.readFileSync(logPath, 'utf8'));
  console.log(
    `assert_ci_run: ${entries.length} structured entries parsed from ${logPath}`
  );

  const evaluation = evaluateCiRun(entries, mapping, platform, entry);
  const reportRoot = process.env.CI_REPORT_ROOT ?? DEFAULT_REPORT_ROOT;
  const runId = `${timestamp(new Date())}-${platform}-${entry}`;
  const reportDir = process.env.CI_REPORT_DIR ?? path.join(reportRoot, runId);
  fs.mkdirSync(reportDir, { recursive: true });
  const report = buildReport(evaluation, { runId, ciRunPath, logPath });
  const reportPath = path.join(reportDir, 'summary.md');
  fs.writeFileSync(reportPath, report.markdown);

  const counts = report.counts;
  console.log(`assert_ci_run: report: ${reportPath}`);
  console.log(
    `assert_ci_run: counts pass=${counts.pass} fail=${counts.fail} blocked=${counts.blocked} missing=${counts.missing} unregistered=${counts.unregistered}`
  );

  if (evaluation.failures.length > 0) {
    console.error(
      `assert_ci_run: FAILED (${evaluation.failures.length} problem(s)):`
    );
    for (const failure of evaluation.failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }
  console.log(
    `assert_ci_run: OK (${entry} on ${platform}, ${counts.pass} case(s) passed)`
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  CASE_ID_PATTERN,
  ENTRIES,
  MAPPING_PATH,
  PLATFORMS,
  buildReport,
  evaluateCiRun,
  loadMapping,
  main,
};
