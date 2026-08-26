#!/usr/bin/env node
/**
 * Auto-mode script assertion script (no third-party dependencies). Shared by
 * the no-login smoke test and the single-account nightly test.
 *
 * Usage:
 *   node scripts/ci/assert_script.js <script.json> <api_test.log>
 *
 * Reads the auto-mode script JSON and the device log file produced by the
 * example app (one JSON entry per line, optionally prefixed with
 * "[APITEST] " when captured from logcat), then verifies:
 *   1. `api.ChatClient.init` exists and succeeded;
 *   2. when the log contains `api.ChatClient.login` entries (the script has a
 *      login section, or login params are derived from API_CONFIG), the last
 *      one must have succeeded;
 *   3. every step has a `script.step[i]` entry whose api matches the script
 *      and whose result matches the expectation:
 *      - `expect.errorCode`: `result.success === false` and
 *        `result.error.code === expect.errorCode` (no-login smoke);
 *      - `expect.success === true`: `result.success === true`
 *        (logged-in nightly);
 *   4. `script.done` exists with `total === steps.length`.
 *
 * When several entries share a source (stale entries from an earlier run in
 * the same log file), the last one wins.
 *
 * Exit code 0 on success, 1 on any assertion failure, 2 on usage/IO errors.
 */

const fs = require('fs');

const APITEST_PREFIX = '[APITEST] ';

function fail2(message) {
  console.error(`assert_script: error: ${message}`);
  process.exit(2);
}

function parseLogEntries(logPath) {
  const text = fs.readFileSync(logPath, 'utf8');
  /** @type {Map<string, any>} source -> last entry with that source */
  const bySource = new Map();
  let parsed = 0;
  for (const rawLine of text.split('\n')) {
    let line = rawLine.trim();
    if (line.length === 0) {
      continue;
    }
    const idx = line.indexOf(APITEST_PREFIX);
    if (idx >= 0) {
      line = line.slice(idx + APITEST_PREFIX.length).trim();
    }
    if (!line.startsWith('{')) {
      continue;
    }
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue; // not a structured log line (e.g. truncated logcat output)
    }
    if (entry == null || typeof entry.source !== 'string') {
      continue;
    }
    bySource.set(entry.source, entry);
    parsed++;
  }
  return { bySource, parsed };
}

function main() {
  const [, , scriptPath, logPath] = process.argv;
  if (scriptPath == null || logPath == null) {
    fail2('usage: node assert_script.js <script.json> <api_test.log>');
  }
  if (!fs.existsSync(scriptPath)) {
    fail2(`script not found: ${scriptPath}`);
  }
  if (!fs.existsSync(logPath)) {
    fail2(`log file not found: ${logPath}`);
  }

  const script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  const steps = Array.isArray(script.steps) ? script.steps : [];
  if (steps.length === 0) {
    fail2('script has no steps');
  }

  const { bySource, parsed } = parseLogEntries(logPath);
  console.log(
    `assert_script: ${parsed} structured entries parsed from ${logPath}`
  );

  const failures = [];

  // 1. init must have succeeded.
  const initEntry = bySource.get('api.ChatClient.init');
  if (initEntry == null) {
    failures.push('missing log entry: api.ChatClient.init');
  } else if (initEntry.payload?.success !== true) {
    failures.push(
      `api.ChatClient.init did not succeed: ${JSON.stringify(
        initEntry.payload
      )}`
    );
  }

  // 2. when login was attempted (script login section or API_CONFIG-derived
  // credentials), the last login entry must have succeeded.
  const loginEntry = bySource.get('api.ChatClient.login');
  if (loginEntry != null && loginEntry.payload?.success !== true) {
    failures.push(
      `api.ChatClient.login did not succeed: ${JSON.stringify(
        loginEntry.payload
      )}`
    );
  }

  // 3. every step must match its expectation.
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const tag = `step[${i}] ${step.api}`;
    const expectCode = step.expect?.errorCode;
    const expectSuccess = step.expect?.success === true;
    if (expectCode == null && !expectSuccess) {
      failures.push(`${tag}: script step has neither expect.errorCode nor expect.success`);
      continue;
    }
    const entry = bySource.get(`script.step[${i}]`);
    if (entry == null) {
      failures.push(`${tag}: missing log entry script.step[${i}]`);
      continue;
    }
    const payload = entry.payload ?? {};
    if (payload.api !== step.api) {
      failures.push(
        `${tag}: log api mismatch, got ${JSON.stringify(payload.api)}`
      );
      continue;
    }
    const result = payload.result ?? {};
    if (expectSuccess) {
      if (result.success !== true) {
        failures.push(
          `${tag}: expected success but got: ${JSON.stringify(result)}`
        );
      }
      continue;
    }
    if (result.success !== false) {
      failures.push(
        `${tag}: expected failure but got success: ${JSON.stringify(result)}`
      );
      continue;
    }
    const actualCode = result.error?.code;
    if (actualCode !== expectCode) {
      failures.push(
        `${tag}: expected error code ${expectCode}, got ${JSON.stringify(
          actualCode
        )} (${JSON.stringify(result.error?.message)})`
      );
    }
  }

  // 4. script.done must cover all steps.
  const doneEntry = bySource.get('script.done');
  if (doneEntry == null) {
    failures.push('missing log entry: script.done (script did not finish?)');
  } else if (doneEntry.payload?.total !== steps.length) {
    failures.push(
      `script.done total mismatch: expected ${steps.length}, got ${JSON.stringify(
        doneEntry.payload?.total
      )}`
    );
  }

  if (failures.length > 0) {
    console.error(`assert_script: FAILED (${failures.length} problem(s)):`);
    for (const f of failures) {
      console.error(`  - ${f}`);
    }
    process.exit(1);
  }
  const scope = loginEntry != null ? 'init + login' : 'init';
  console.log(
    `assert_script: OK (${scope} + ${steps.length} step(s), all as expected)`
  );
}

main();
