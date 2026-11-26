#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const test = require('node:test');
const {
  formatCaseResult,
  formatDuration,
  formatRunError,
  formatRunSummary,
  renderCompact,
  resolveReporter,
} = require('./render_ci_log');

const SCRIPT = path.join(__dirname, 'render_ci_log.js');

function apitestLine(source, payload, seq = 1) {
  return `[APITEST] ${JSON.stringify({ ts: 1, seq, source, payload })}`;
}

test('resolveReporter: flag wins over env', () => {
  assert.equal(
    resolveReporter('expanded', { CI_LOG_REPORTER: 'compact' }),
    'expanded'
  );
});

test('resolveReporter: CI_LOG_REPORTER beats the GITHUB_ACTIONS default', () => {
  assert.equal(
    resolveReporter(null, { CI_LOG_REPORTER: 'expanded', GITHUB_ACTIONS: 'true' }),
    'expanded'
  );
});

test('resolveReporter: defaults to compact on GitHub Actions, expanded locally', () => {
  assert.equal(resolveReporter(null, { GITHUB_ACTIONS: 'true' }), 'compact');
  assert.equal(resolveReporter(null, {}), 'expanded');
});

test('formatDuration: one decimal place, absent for non-numbers', () => {
  assert.equal(formatDuration(2345), ' (2.3s)');
  assert.equal(formatDuration(0), ' (0.0s)');
  assert.equal(formatDuration(undefined), '');
  assert.equal(formatDuration(-5), '');
});

test('formatCaseResult: pass renders ✅ with description and duration', () => {
  assert.equal(
    formatCaseResult({
      caseId: 'RN-MSG-010',
      description: 'saved server history replaces a stale latest message',
      status: 'pass',
      durationMs: 2300,
    }),
    '✅ RN-MSG-010 saved server history replaces a stale latest message (2.3s)'
  );
});

test('formatCaseResult: pass without description still renders', () => {
  assert.equal(
    formatCaseResult({ caseId: 'RN-APP-001', status: 'pass', durationMs: 10 }),
    '✅ RN-APP-001 (0.0s)'
  );
});

test('formatCaseResult: fail renders ❌ with phase and message', () => {
  assert.equal(
    formatCaseResult({
      caseId: 'RN-MSG-007',
      description: 'negative send rejects an empty recipient',
      status: 'fail',
      durationMs: 100,
      error: { phase: 'body', message: '[500] empty recipient' },
    }),
    '❌ RN-MSG-007 negative send rejects an empty recipient (body): [500] empty recipient'
  );
});

test('formatCaseResult: blocked renders 🚫 and keeps the cleanup detail', () => {
  assert.equal(
    formatCaseResult({
      caseId: 'RN-GROUP-001',
      status: 'blocked',
      durationMs: 0,
      error: {
        phase: 'prepare',
        message: 'login failed',
        cleanupMessage: 'teardown failed too',
      },
    }),
    '🚫 RN-GROUP-001 (prepare): login failed [cleanup: teardown failed too]'
  );
});

test('formatCaseResult: missing error fields degrade gracefully', () => {
  assert.equal(
    formatCaseResult({ caseId: 'RN-X-1', status: 'fail' }),
    '❌ RN-X-1 (unknown): <no message>'
  );
});

test('formatRunSummary and formatRunError', () => {
  assert.equal(
    formatRunSummary({ total: 9, passed: 7, failed: 1, blocked: 1 }),
    '── run summary: total=9 pass=7 fail=1 blocked=1'
  );
  assert.equal(formatRunError({ message: 'boom' }), '❌ ci.run.error: boom');
});

test('renderCompact: only case/summary/error records render', () => {
  assert.equal(
    renderCompact({
      source: 'ci.case.result',
      payload: { caseId: 'RN-A-1', status: 'pass', durationMs: 5 },
    }),
    '✅ RN-A-1 (0.0s)'
  );
  assert.equal(renderCompact({ source: 'script.done', payload: {} }), null);
  assert.equal(renderCompact({ source: 'ci.run.start', payload: {} }), null);
});

/**
 * Spawns the renderer against a temp log file, feeds it `lines` followed by
 * `script.done`, and returns { code, stdout }. The script.done record makes
 * the renderer exit by itself, so no timeout kill is needed.
 */
function runRenderer(reporterArgs, lines) {
  return new Promise((resolvePromise, reject) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'render-ci-log-'));
    const logPath = path.join(dir, 'device.log');
    fs.writeFileSync(logPath, '');
    const child = spawn(process.execPath, [SCRIPT, ...reporterArgs, logPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', reject);
    child.on('close', (code) => resolvePromise({ code, stdout, stderr }));
    const writer = setInterval(() => {
      const next = lines.shift();
      if (next == null) {
        clearInterval(writer);
        return;
      }
      fs.appendFileSync(logPath, `${next}\n`);
    }, 50);
    setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`renderer did not exit in time; stdout=${stdout} stderr=${stderr}`));
    }, 10000).unref();
  });
}

test('compact: tails a growing logcat-style file and exits on script.done', async () => {
  const caseLine = apitestLine('ci.case.result', {
    entry: 'logged_in_base',
    suite: 'logged_in_base',
    caseId: 'RN-MSG-010',
    description: 'saved server history',
    status: 'pass',
    durationMs: 1200,
  });
  const failLine = apitestLine(
    'ci.case.result',
    {
      entry: 'logged_in_base',
      caseId: 'RN-MSG-007',
      status: 'fail',
      durationMs: 50,
      error: { phase: 'body', message: '[500] empty recipient' },
    },
    2
  );
  const doneLine = apitestLine('script.done', { total: 2, failed: 1 }, 3);
  const { code, stdout } = await runRenderer(
    ['--reporter', 'compact'],
    // Simulate a logcat prefix in front of the marker.
    [`11-20 19:03:20.626 23560 23622 I ReactNativeJS: ${caseLine}`, failLine, doneLine]
  );
  assert.equal(code, 0);
  assert.match(stdout, /✅ RN-MSG-010 saved server history \(1\.2s\)/);
  assert.match(stdout, /❌ RN-MSG-007 \(body\): \[500\] empty recipient/);
  assert.doesNotMatch(stdout, /script\.done/);
});

test('expanded: passes [APITEST] lines through unchanged', async () => {
  const caseLine = apitestLine('ci.case.result', {
    caseId: 'RN-APP-001',
    status: 'pass',
    durationMs: 10,
  });
  const doneLine = apitestLine('script.done', { total: 1, failed: 0 }, 2);
  const { code, stdout } = await runRenderer(
    ['--reporter', 'expanded'],
    [`11-20 19:03:20.626 23560 23622 I ReactNativeJS: ${caseLine}`, doneLine]
  );
  assert.equal(code, 0);
  assert.ok(stdout.includes(caseLine), `expected pass-through of ${caseLine}`);
  assert.ok(stdout.includes(doneLine), 'script.done is passed through too');
});
