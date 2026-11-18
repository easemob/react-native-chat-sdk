#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const { loadMapping } = require('./assert_ci_run');

const SCRIPT = path.join(__dirname, 'assert_ci_run.js');

// The full registered set for logged_out/android, derived from the real
// mapping so the fixtures stay honest when cases are added.
const MAPPING = loadMapping();
const LOGGED_OUT_IDS = MAPPING.cases
  .filter(
    (item) => item.entry === 'logged_out' && item.platforms.includes('android')
  )
  .map((item) => item.caseId)
  .sort();
assert.ok(LOGGED_OUT_IDS.length >= 8, 'expected at least the 8 seed cases');

/**
 * Builds a synthetic device log for the logged_out entry. `overrides` maps
 * caseId -> { status, error }, `drop` removes cases entirely, `extra` adds
 * raw `[APITEST]` lines and `done`/`summary` replace the final records
 * (pass `null` for `done` to omit it).
 */
function buildLog(options = {}) {
  const overrides = options.overrides ?? {};
  const drop = new Set(options.drop ?? []);
  let seq = 0;
  const line = (source, payload) => {
    seq += 1;
    return `[APITEST] ${JSON.stringify({ ts: 1, seq, source, payload })}`;
  };
  const lines = [];
  for (const caseId of LOGGED_OUT_IDS) {
    if (drop.has(caseId)) continue;
    const override = overrides[caseId] ?? {};
    lines.push(
      line('ci.case.result', {
        entry: 'logged_out',
        caseId,
        status: override.status ?? 'pass',
        durationMs: 10,
        ...(override.error != null ? { error: override.error } : {}),
      })
    );
  }
  const executed = LOGGED_OUT_IDS.length - drop.size;
  lines.push(
    ...(options.extra ?? []).map((payload) => line(payload.source, payload.payload))
  );
  if (options.summary !== null) {
    lines.push(
      line(
        'ci.run.summary',
        options.summary ?? {
          entry: 'logged_out',
          total: executed,
          passed: executed,
          failed: 0,
          blocked: 0,
          failures: [],
        }
      )
    );
  }
  if (options.done !== null) {
    lines.push(
      line('script.done', options.done ?? { total: executed, failed: 0 })
    );
  }
  return lines.join('\n');
}

function runAssert(logText, options = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'assert-ci-run-'));
  const ciRunPath = path.join(dir, 'ci_run.json');
  const logPath = path.join(dir, 'api_test.log');
  fs.writeFileSync(
    ciRunPath,
    JSON.stringify({
      entry: 'logged_out',
      config: { appKey: 'org#app', loginToken: 'super-secret-token' },
    })
  );
  fs.writeFileSync(logPath, logText);
  const env = {
    ...process.env,
    CI_PLATFORM: options.platform ?? 'android',
    CI_REPORT_ROOT: path.join(dir, 'reports'),
  };
  if (options.platform === null) {
    delete env.CI_PLATFORM;
  }
  const result = spawnSync(process.execPath, [SCRIPT, ciRunPath, logPath], {
    env,
    encoding: 'utf8',
  });
  let report = null;
  const match = /^assert_ci_run: report: (.+)$/m.exec(result.stdout);
  if (match != null && fs.existsSync(match[1])) {
    report = fs.readFileSync(match[1], 'utf8');
  }
  return { ...result, report };
}

test('a green run exits 0 and writes a PASS report', () => {
  const result = runAssert(buildLog());
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /counts pass=\d+ fail=0 blocked=0 missing=0/);
  assert.ok(result.report != null, 'summary.md must be written');
  assert.match(result.report, /Result: \*\*PASS\*\*/);
  assert.match(result.report, /## Failed \(0\)/);
  assert.match(result.report, /## Missing/);
});

test('a failed case exits 1 and lands in the Failed section', () => {
  const result = runAssert(
    buildLog({
      overrides: {
        [LOGGED_OUT_IDS[0]]: {
          status: 'fail',
          error: { phase: 'body', message: 'expected ChatError 201, got 200' },
        },
      },
    })
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, new RegExp(`case ${LOGGED_OUT_IDS[0]} failed`));
  assert.match(result.report, /## Failed \(1\)/);
  assert.match(result.report, /\(body\): expected ChatError 201, got 200/);
});

test('a blocked case exits 1 and is reported in its own category', () => {
  const result = runAssert(
    buildLog({
      overrides: {
        [LOGGED_OUT_IDS[1]]: {
          status: 'blocked',
          error: { phase: 'prepare', message: 'beforeAll failed' },
        },
      },
    })
  );
  assert.equal(result.status, 1);
  assert.match(result.report, /## Blocked \(1\)/);
  assert.match(result.report, /## Failed \(0\)/);
});

test('an empty run (total=0) exits 1', () => {
  const result = runAssert(
    buildLog({
      drop: LOGGED_OUT_IDS,
      summary: {
        entry: 'logged_out',
        total: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        failures: [],
      },
      done: { total: 0, failed: 0 },
    })
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /empty run/);
});

test('a missing script.done exits 1 (driver-level failure)', () => {
  const result = runAssert(buildLog({ done: null }));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /script\.done/);
  assert.match(result.report, /script\.done.*missing/);
});

test('a registered case absent from the run is reported missing', () => {
  const dropped = LOGGED_OUT_IDS[2];
  const result = runAssert(buildLog({ drop: [dropped] }));
  assert.equal(result.status, 1);
  assert.match(result.stderr, new RegExp(`case ${dropped} registered`));
  assert.match(
    result.report,
    /## Missing \(registered but not executed\) \(1\)/
  );
  assert.match(result.report, new RegExp(dropped));
});

test('an unknown RN-* case id in the log exits 1', () => {
  const result = runAssert(
    buildLog({
      extra: [
        {
          source: 'ci.case.result',
          payload: {
            entry: 'logged_out',
            caseId: 'RN-FOO-999',
            status: 'pass',
            durationMs: 1,
          },
        },
      ],
    })
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /RN-FOO-999 is not registered/);
  assert.match(result.report, /## Unregistered/);
});

test('any ci.run.error record exits 1', () => {
  const result = runAssert(
    buildLog({
      extra: [
        {
          source: 'ci.run.error',
          payload: { message: 'CI_RUN and API_SCRIPT are both inlined' },
        },
      ],
    })
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ci\.run\.error/);
});

test('credential-shaped values are redacted in the report', () => {
  const secret = 'super-secret-token-value';
  const result = runAssert(
    buildLog({
      overrides: {
        [LOGGED_OUT_IDS[0]]: {
          status: 'fail',
          error: { phase: 'body', message: `login failed: token=${secret}` },
        },
      },
    })
  );
  assert.equal(result.status, 1);
  assert.ok(result.report != null);
  assert.ok(!result.report.includes(secret), 'token must not leak');
  assert.match(result.report, /<redacted>/);
});

test('missing or invalid CI_PLATFORM exits 2', () => {
  const result = runAssert(buildLog(), { platform: 'windows' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /CI_PLATFORM/);
});

test('a missing log file exits 2', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'assert-ci-run-'));
  const ciRunPath = path.join(dir, 'ci_run.json');
  fs.writeFileSync(
    ciRunPath,
    JSON.stringify({ entry: 'logged_out', config: { appKey: 'org#app' } })
  );
  const result = spawnSync(
    process.execPath,
    [SCRIPT, ciRunPath, path.join(dir, 'nope.log')],
    { env: { ...process.env, CI_PLATFORM: 'android' }, encoding: 'utf8' }
  );
  assert.equal(result.status, 2);
  assert.match(result.stderr, /log file not found/);
});
