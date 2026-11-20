#!/usr/bin/env node
/**
 * Live renderer for the CI harness `[APITEST]` stream (example/src/ci/).
 *
 * The device-side harness emits structured records; the wrapper scripts
 * (run_ci_android.sh / run_ci_ios.sh) already capture the carrying log
 * (logcat / simulator log) to a file in real time. This script tails that
 * file and renders the records to stdout as they arrive — it is a pure
 * view layer: pass/fail judgement stays with assert_ci_run.js and the
 * renderer's exit code never affects the run (always 0, except usage
 * errors, which exit 2).
 *
 * Usage:
 *   node scripts/ci/render_ci_log.js [--reporter compact|expanded] <log-file>
 *
 * Reporter resolution (mirrors the Flutter repo's tool/ci/run_*_test.sh):
 *   --reporter flag > CI_LOG_REPORTER env > GITHUB_ACTIONS=true ? compact
 *   : expanded.
 *
 * compact (CI default): one line per finished case
 *   ✅ RN-XXX <description> (2.3s)
 *   ❌ RN-XXX <description> (body): <message>
 *   🚫 RN-XXX <description> (prepare): <message>   — blocked (prepare failed)
 * plus ci.run.error lines and a final ci.run.summary count line.
 *
 * expanded (local default): every `[APITEST]` line passed through
 * unchanged, grep-friendly.
 *
 * The script exits after `script.done`; the wrapper scripts also kill it
 * from their EXIT trap when the driver ends early.
 */

const fs = require('node:fs');
const { parseLogText } = require('./script_results');

const REPORTERS = ['compact', 'expanded'];
const POLL_INTERVAL_MS = 500;

function fail2(message) {
  console.error(`render_ci_log: error: ${message}`);
  process.exit(2);
}

function resolveReporter(flagValue, env = process.env) {
  const candidate = flagValue ?? env.CI_LOG_REPORTER;
  if (candidate != null) {
    if (!REPORTERS.includes(candidate)) {
      fail2(`reporter must be one of ${REPORTERS.join(', ')} (got ${JSON.stringify(candidate)})`);
    }
    return candidate;
  }
  return env.GITHUB_ACTIONS === 'true' ? 'compact' : 'expanded';
}

function formatDuration(durationMs) {
  if (typeof durationMs !== 'number' || durationMs < 0) {
    return '';
  }
  return ` (${(durationMs / 1000).toFixed(1)}s)`;
}

function formatCaseResult(payload) {
  const caseId = payload?.caseId ?? '<unknown>';
  const description =
    typeof payload?.description === 'string' && payload.description.length > 0
      ? ` ${payload.description}`
      : '';
  const status = payload?.status;
  if (status === 'pass') {
    return `✅ ${caseId}${description}${formatDuration(payload?.durationMs)}`;
  }
  const symbol = status === 'blocked' ? '🚫' : '❌';
  const phase = payload?.error?.phase ?? 'unknown';
  const message = payload?.error?.message ?? '<no message>';
  const cleanup =
    typeof payload?.error?.cleanupMessage === 'string'
      ? ` [cleanup: ${payload.error.cleanupMessage}]`
      : '';
  return `${symbol} ${caseId}${description} (${phase}): ${message}${cleanup}`;
}

function formatRunSummary(payload) {
  return (
    `── run summary: total=${payload?.total ?? '?'} ` +
    `pass=${payload?.passed ?? '?'} fail=${payload?.failed ?? '?'} ` +
    `blocked=${payload?.blocked ?? '?'}`
  );
}

function formatRunError(payload) {
  return `❌ ci.run.error: ${payload?.message ?? JSON.stringify(payload)}`;
}

/**
 * Renders one parsed `[APITEST]` entry in compact mode. Returns null for
 * records that produce no output (script.done only terminates the tail).
 */
function renderCompact(entry) {
  if (entry.source === 'ci.case.result') {
    return formatCaseResult(entry.payload);
  }
  if (entry.source === 'ci.run.summary') {
    return formatRunSummary(entry.payload);
  }
  if (entry.source === 'ci.run.error') {
    return formatRunError(entry.payload);
  }
  return null;
}

/**
 * Tails `logPath` from offset 0, rendering parsed records until
 * `script.done` appears. Handles the file not existing yet (the wrapper
 * starts the renderer together with the log capture) and truncation.
 */
function tail(logPath, reporter) {
  let offset = 0;
  let pending = '';
  let fd = null;

  const closeFd = () => {
    if (fd != null) {
      try {
        fs.closeSync(fd);
      } catch {
        // Already closed.
      }
      fd = null;
    }
  };

  const renderLine = (line) => {
    for (const entry of parseLogText(line)) {
      if (reporter === 'expanded') {
        const marker = line.indexOf('[APITEST] ');
        process.stdout.write(`${line.slice(marker)}\n`);
      } else {
        const rendered = renderCompact(entry);
        if (rendered != null) {
          process.stdout.write(`${rendered}\n`);
        }
      }
      if (entry.source === 'script.done') {
        closeFd();
        process.exit(0);
      }
    }
  };

  const poll = () => {
    if (fd == null) {
      try {
        fd = fs.openSync(logPath, 'r');
        offset = 0;
      } catch {
        return; // Log file not created yet; retry on the next tick.
      }
    }
    let size;
    try {
      size = fs.fstatSync(fd).size;
    } catch {
      closeFd();
      return;
    }
    if (size < offset) {
      offset = 0; // Truncated (e.g. logcat restarted); start over.
    }
    if (size === offset) {
      return;
    }
    const length = size - offset;
    const buffer = Buffer.alloc(length);
    let bytesRead;
    try {
      bytesRead = fs.readSync(fd, buffer, 0, length, offset);
    } catch {
      closeFd();
      return;
    }
    offset += bytesRead;
    pending += buffer.toString('utf8', 0, bytesRead);
    const lines = pending.split('\n');
    pending = lines.pop() ?? '';
    for (const line of lines) {
      renderLine(line);
    }
  };

  // The interval is the only ref'd handle: it keeps the process alive until
  // script.done or the wrapper's SIGTERM.
  setInterval(poll, POLL_INTERVAL_MS);
  process.on('SIGTERM', () => {
    closeFd();
    process.exit(0);
  });
  poll();
}

function main() {
  const args = process.argv.slice(2);
  let reporterFlag = null;
  let logPath = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--reporter') {
      reporterFlag = args[i + 1];
      i += 1;
    } else if (logPath == null) {
      logPath = args[i];
    } else {
      fail2(`unexpected argument: ${args[i]}`);
    }
  }
  if (logPath == null) {
    fail2(
      'usage: node render_ci_log.js [--reporter compact|expanded] <log-file>'
    );
  }
  const reporter = resolveReporter(reporterFlag);
  console.log(`render_ci_log: reporter=${reporter}, tailing ${logPath}`);
  tail(logPath, reporter);
}

if (require.main === module) {
  main();
}

module.exports = {
  formatCaseResult,
  formatDuration,
  formatRunError,
  formatRunSummary,
  renderCompact,
  resolveReporter,
};
