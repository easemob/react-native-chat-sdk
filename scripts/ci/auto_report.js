#!/usr/bin/env node
/**
 * Run an example auto-mode script and archive traceable, local-only evidence.
 * It reuses smoke_local.sh and the platform drivers instead of duplicating
 * React Native build/install logic.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { evaluateScript, parseLogText } = require('./script_results');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_SCRIPT = path.join(
  REPO_ROOT,
  'example/ci/port_5_0_0_positive.json'
);
const CRASH_PATTERN =
  /FATAL EXCEPTION|SIG(?:SEGV|ABRT)|NullPointerException|uncaught exception|Terminating app|fatal error|REPORT_TIMEOUT|Lost connection to device/i;

function usage() {
  return `Usage:
  yarn report:api --platform <android|ios> [--device <id>] [--script <json>]
  yarn report:api --platform <android|ios> --from-log <api_test.log> [--crash-log <log>]
  yarn report:api --android-report <run-dir> --ios-report <run-dir>

The default script is example/ci/port_5_0_0_positive.json. Run the negative
path with --script example/ci/port_5_0_0_negative.json. Per-run evidence is
written under build/reports/<version>/<run-id>/ and remains Git-ignored.
`;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    if (!arg.startsWith('--')) {
      throw new Error(`unknown argument: ${arg}`);
    }
    const value = argv[++index];
    if (value == null || value.startsWith('--')) {
      throw new Error(`missing value for ${arg}`);
    }
    options[arg.slice(2)] = value;
  }
  return options;
}

function safeName(value) {
  return String(value).replace(/[^A-Za-z0-9_-]/g, '_');
}

function timestamp(date) {
  return date
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);
}

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function runText(executable, args, options = {}) {
  try {
    return execFileSync(executable, args, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: options.env ?? process.env,
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

function readPackageVersion() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8')
  );
  return String(packageJson.version);
}

function readNativeVersions() {
  const podspec = fs.readFileSync(
    path.join(REPO_ROOT, 'ChatSdk.podspec'),
    'utf8'
  );
  const gradle = fs.readFileSync(
    path.join(REPO_ROOT, 'android/build.gradle'),
    'utf8'
  );
  return {
    ios:
      /minimumVersion:\s*'([^']+)'/.exec(podspec)?.[1] ??
      /HyphenateChat',\s*'~>\s*([^']+)'/.exec(podspec)?.[1] ??
      null,
    android: /io\.hyphenate:hyphenate-chat:([^'\s]+)/.exec(gradle)?.[1] ?? null,
  };
}

function relativeToRepo(filePath) {
  const relative = path.relative(REPO_ROOT, filePath);
  return relative.startsWith('..') ? filePath : relative;
}

function resolveAndroidDevice(requested) {
  if (requested != null) return requested;
  const output = runText('adb', ['devices']);
  const devices = output
    .split('\n')
    .map((line) => /^(\S+)\s+device$/.exec(line)?.[1])
    .filter(Boolean);
  if (devices.length > 1) {
    throw new Error('multiple Android devices are online; pass --device');
  }
  return devices[0] ?? 'auto';
}

function resolveIosDevice(requested) {
  if (requested != null) return requested;
  const output = runText('xcrun', [
    'simctl',
    'list',
    'devices',
    'booted',
    '-j',
  ]);
  if (output.length === 0) return 'auto';
  try {
    const decoded = JSON.parse(output);
    for (const values of Object.values(decoded.devices ?? {})) {
      for (const item of values) {
        if (item.state === 'Booted') return item.udid;
      }
    }
  } catch {
    // Let smoke_local.sh report simulator discovery failures.
  }
  return 'auto';
}

function resolveDevice(platform, requested) {
  return platform === 'android'
    ? resolveAndroidDevice(requested)
    : resolveIosDevice(requested);
}

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

function extractCrashEvidence(text) {
  const lines = String(text).split('\n');
  const selected = new Set();
  for (let index = 0; index < lines.length; index++) {
    if (!CRASH_PATTERN.test(lines[index])) continue;
    const start = Math.max(0, index - 2);
    const end = Math.min(lines.length, index + 25);
    for (let cursor = start; cursor < end; cursor++) selected.add(cursor);
  }
  return Array.from(selected)
    .sort((a, b) => a - b)
    .map((index) => sanitize(lines[index]))
    .join('\n')
    .trim();
}

function captureCrashEvidence(platform, device, env) {
  if (platform === 'android') {
    const output = runText('adb', ['logcat', '-d', '-v', 'threadtime'], {
      env,
    });
    return extractCrashEvidence(output);
  }
  if (device === 'auto') return '';
  const output = runText('xcrun', [
    'simctl',
    'spawn',
    device,
    'log',
    'show',
    '--style',
    'compact',
    '--last',
    '15m',
    '--predicate',
    'process == "ChatSdkExample"',
  ]);
  return extractCrashEvidence(output);
}

function clearAndroidLogcat(platform, env) {
  if (platform !== 'android') return;
  spawnSync('adb', ['logcat', '-c'], {
    cwd: REPO_ROOT,
    env,
    stdio: 'ignore',
  });
}

function markdownCell(value, maxLength = 360) {
  let text = typeof value === 'string' ? value : JSON.stringify(value);
  if (text == null) text = 'null';
  text = text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function collectIssues(scriptPath, platform, script, evaluation, crashText) {
  const issues = [];
  let crashSeen = false;
  for (const outcome of evaluation.outcomes) {
    if (outcome.status === 'passed') continue;
    if (crashSeen && outcome.status === 'not-run') continue;
    const crashKey =
      outcome.id === 'fetch_group_receipt_missing' &&
      outcome.status === 'crashed'
        ? 'android-missing-message-crash'
        : null;
    const iosEmptySuccessKey =
      platform === 'ios' &&
      outcome.id === 'fetch_group_receipt_missing' &&
      outcome.actual?.success === true
        ? 'ios-unknown-message-pagination-empty-success'
        : null;
    issues.push({
      key: crashKey ?? iosEmptySuccessKey ?? `${outcome.id}-unexpected-result`,
      status: outcome.status === 'blocked' ? 'blocked' : 'needs-review',
      summary: `${outcome.api} was ${outcome.status}`,
      evidence: outcome.reason,
    });
    if (outcome.status === 'crashed') crashSeen = true;
  }
  if (crashSeen) {
    const skipped = evaluation.outcomes.filter(
      (item) => item.status === 'not-run'
    );
    if (skipped.length > 0) {
      issues.push({
        key: 'steps-not-run-after-crash',
        status: 'blocked',
        summary: `${skipped.length} later step(s) could not run after the crash`,
        evidence: skipped.map((item) => item.id).join(', '),
      });
    }
  }

  if (
    crashText.length > 0 &&
    !issues.some((item) => item.key.includes('crash'))
  ) {
    issues.push({
      key: 'native-crash-evidence',
      status: 'needs-review',
      summary: 'Native crash evidence was captured',
      evidence: 'See crash.log',
    });
  }

  const scriptName = path.basename(scriptPath);
  if (!scriptName.includes('port_5_0_0')) return issues;
  const isPositivePath = scriptName === 'port_5_0_0_positive.json';
  const isNegativePath = scriptName === 'port_5_0_0_negative.json';

  const requiredEvents = [
    'ChatConnectEventListener.onDatabaseOpened',
    'ChatConnectEventListener.onDataSyncStart',
    'ChatConnectEventListener.onDataSyncFinish',
  ];
  for (const source of requiredEvents) {
    if (!evaluation.bySource.has(source)) {
      issues.push({
        key: `${source.split('.').at(-1)}-unobserved`,
        status: 'needs-review',
        summary: `Required 5.0.0 event ${source} was not observed`,
        evidence: 'events.jsonl',
      });
    }
  }

  if (
    isPositivePath &&
    script.steps.some(
      (step) => step.api === 'ChatManager.sendMessageReadReceipts'
    ) &&
    !evaluation.bySource.has('ChatMessageEventListener.onMessageReadReceipts')
  ) {
    issues.push({
      key: 'message-receipt-event-unverified',
      status: 'needs-second-account',
      summary:
        'onMessageReadReceipts was not observed in the single-account run',
      evidence: 'Run a coordinated second-account read scenario',
    });
  }

  const conversations = evaluation.outcomes.find((item) =>
    ['convs', 'conversations'].includes(item.id)
  );
  if (conversations?.status === 'passed') {
    const data = conversations.actual?.data;
    const inspectable =
      Array.isArray(data) &&
      data.every(
        (item) =>
          item != null &&
          typeof item === 'object' &&
          Object.hasOwn(item, 'displayName') &&
          Object.hasOwn(item, 'displayAvatar')
      );
    if (!inspectable) {
      issues.push({
        key: 'conversation-output-not-inspectable',
        status: 'confirmed',
        summary:
          'Conversation output does not expose displayName/displayAvatar',
        evidence: 'See the conversation step in steps.json',
      });
    }
  }

  const serverReceipts = evaluation.outcomes.find(
    (item) => item.id === 'grp_receipts_server'
  );
  if (
    platform === 'ios' &&
    serverReceipts?.status === 'passed' &&
    typeof serverReceipts.actual?.data?.totalCount !== 'number'
  ) {
    issues.push({
      key: 'ios-total-count-missing',
      status: 'confirmed',
      summary: 'iOS group-receipt pagination did not return numeric totalCount',
      evidence: 'See grp_receipts_server in steps.json',
    });
  }
  if (
    serverReceipts?.status === 'passed' &&
    Array.isArray(serverReceipts.actual?.data?.list) &&
    serverReceipts.actual.data.list.length === 0
  ) {
    issues.push({
      key: 'group-member-info-unverified',
      status: 'needs-second-account',
      summary:
        'The receipt list was empty, so ChatGroupMemberInfo was not decoded',
      evidence: 'Use a second account to read the group message',
    });
  }

  if (isNegativePath) {
    for (const id of ['receipt_missing', 'group_receipt_missing']) {
      if (!script.steps.some((step) => step.id === id)) {
        issues.push({
          key: `${id}-coverage-gap`,
          status: 'blocked',
          summary: `Missing-message error path ${id} is absent from the script`,
          evidence: relativeToRepo(scriptPath),
        });
      }
    }
    issues.push({
      key: 'fetch-group-receipt-missing-disabled',
      status: 'known-crash',
      summary:
        'The missing-message fetchGroupMessageReadReceipts case is intentionally disabled',
      evidence:
        'Android native crashes before returning; see docs/porting/5.0.0/04-verification.md',
    });
  }
  return issues;
}

function writeSummary(reportDir, metadata, evaluation, issues) {
  const listenerSources = Array.from(evaluation.bySource.keys())
    .filter((source) => source.includes('EventListener.'))
    .sort();
  const lines = [
    `# Auto-mode run ${metadata.runId}`,
    '',
    `- Platform: \`${metadata.platform}\``,
    `- Device: \`${metadata.device}\``,
    `- Commit: \`${metadata.commit}\`${metadata.worktreeDirty ? ' (dirty)' : ''}`,
    `- Started: \`${metadata.startedAt}\``,
    `- Finished: \`${metadata.finishedAt}\``,
    `- Structured events: \`${evaluation.entries.length}\``,
    `- script.done: \`${markdownCell(evaluation.doneEntry?.payload ?? 'missing')}\``,
    `- Expected outcomes: \`${markdownCell(evaluation.counts)}\``,
    `- Crash evidence: \`${metadata.crashEvidence ? 'see crash.log' : 'none'}\``,
    `- Overall: \`${evaluation.failures.length === 0 ? 'passed' : 'failed'}\``,
    '',
    '> `script.done.failed` counts raw API failures, including expected error-path results. The expected-outcome classification above is authoritative.',
    '',
    '## Step outcomes',
    '',
    '| # | id | API | status | expected | actual |',
    '| ---: | --- | --- | --- | --- | --- |',
  ];
  for (const outcome of evaluation.outcomes) {
    lines.push(
      `| ${outcome.index} | \`${markdownCell(outcome.id)}\` | \`${markdownCell(
        outcome.api
      )}\` | ${outcome.status} | \`${markdownCell(
        outcome.expected
      )}\` | \`${markdownCell(outcome.actual)}\` |`
    );
  }
  lines.push('', '## Observed listener events', '');
  if (listenerSources.length === 0) {
    lines.push('- None');
  } else {
    for (const source of listenerSources) lines.push(`- \`${source}\``);
  }
  lines.push('', '## Issue candidates', '');
  if (issues.length === 0) {
    lines.push('- None');
  } else {
    for (const issue of issues) {
      lines.push(`- \`${issue.key}\` — ${issue.status}: ${issue.summary}`);
    }
  }
  fs.writeFileSync(path.join(reportDir, 'summary.md'), `${lines.join('\n')}\n`);
}

function writeIssues(reportDir, metadata, issues) {
  const lines = [
    '# Issue candidates',
    '',
    `Run: \`${metadata.runId}\``,
    '',
    'Candidate keys are local review labels, not external issue IDs. Confirm and sanitize findings before copying them into docs/porting/.',
    '',
  ];
  if (issues.length === 0) {
    lines.push('No issue candidates.');
  }
  for (const issue of issues) {
    lines.push(
      `## \`${issue.key}\``,
      '',
      `- Status: \`${issue.status}\``,
      `- Summary: ${issue.summary}`,
      `- Evidence: ${issue.evidence}`,
      ''
    );
  }
  fs.writeFileSync(path.join(reportDir, 'issues.md'), `${lines.join('\n')}\n`);
}

function rewriteSanitizedEvents(eventsFile, entries) {
  const text = entries
    .map((entry) => JSON.stringify(sanitize(entry)))
    .join('\n');
  fs.writeFileSync(eventsFile, text.length === 0 ? '' : `${text}\n`);
}

function writeReport({
  reportDir,
  metadata,
  scriptPath,
  script,
  eventsFile,
  crashText,
}) {
  const rawEvents = fs.existsSync(eventsFile)
    ? fs.readFileSync(eventsFile, 'utf8')
    : '';
  const entries = parseLogText(rawEvents);
  rewriteSanitizedEvents(eventsFile, entries);
  const evaluation = evaluateScript(script, entries, {
    crashEvidence: crashText.length > 0,
  });
  const issues = collectIssues(
    scriptPath,
    metadata.platform,
    script,
    evaluation,
    crashText
  );
  const steps = evaluation.outcomes.map((outcome) => sanitize(outcome));
  fs.writeFileSync(
    path.join(reportDir, 'steps.json'),
    `${JSON.stringify(steps, null, 2)}\n`
  );
  fs.writeFileSync(path.join(reportDir, 'crash.log'), crashText);
  fs.writeFileSync(
    path.join(reportDir, 'run.json'),
    `${JSON.stringify(metadata, null, 2)}\n`
  );
  writeSummary(reportDir, metadata, evaluation, issues);
  writeIssues(reportDir, metadata, issues);
  return { evaluation, issues };
}

function shapeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return value.length === 0 ? [] : [shapeOf(value[0])];
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shapeOf(value[key])])
    );
  }
  return typeof value;
}

function differentShapePaths(first, second, prefix = '') {
  if (JSON.stringify(first) === JSON.stringify(second)) return [];
  if (
    first == null ||
    second == null ||
    Array.isArray(first) !== Array.isArray(second) ||
    typeof first !== 'object' ||
    typeof second !== 'object'
  ) {
    return [prefix || '$'];
  }
  if (Array.isArray(first)) {
    if (first.length === 0 || second.length === 0) return [prefix || '$'];
    return differentShapePaths(first[0], second[0], `${prefix}[]`);
  }
  const keys = Array.from(
    new Set([...Object.keys(first), ...Object.keys(second)])
  ).sort();
  return keys.flatMap((key) =>
    differentShapePaths(
      first[key],
      second[key],
      prefix.length === 0 ? key : `${prefix}.${key}`
    )
  );
}

function resultSemantics(outcome) {
  return {
    success: outcome.actual?.success ?? null,
    errorCode: outcome.actual?.error?.code ?? null,
  };
}

function loadRun(runPath) {
  const directory = fs.statSync(runPath).isDirectory()
    ? runPath
    : path.dirname(runPath);
  return {
    directory,
    metadata: JSON.parse(
      fs.readFileSync(path.join(directory, 'run.json'), 'utf8')
    ),
    steps: JSON.parse(
      fs.readFileSync(path.join(directory, 'steps.json'), 'utf8')
    ),
  };
}

function compareReports(androidPath, iosPath, outputRoot) {
  const android = loadRun(path.resolve(androidPath));
  const ios = loadRun(path.resolve(iosPath));
  const androidById = new Map(android.steps.map((item) => [item.id, item]));
  const iosById = new Map(ios.steps.map((item) => [item.id, item]));
  const ids = Array.from(new Set([...androidById.keys(), ...iosById.keys()]));
  let mismatches = 0;
  const lines = [
    '# Android / iOS auto-mode comparison',
    '',
    `- Android: \`${android.metadata.runId}\``,
    `- iOS: \`${ios.metadata.runId}\``,
    '',
    '| step | Android | iOS | result semantics | response shape | status |',
    '| --- | --- | --- | --- | --- | --- |',
  ];
  for (const id of ids) {
    const a = androidById.get(id);
    const i = iosById.get(id);
    let status = '✅';
    if (
      a == null ||
      i == null ||
      a.status !== i.status ||
      a.status !== 'passed'
    ) {
      status = '❌';
      mismatches++;
    }
    const aSemantics = a == null ? null : resultSemantics(a);
    const iSemantics = i == null ? null : resultSemantics(i);
    const semanticsEqual =
      JSON.stringify(aSemantics) === JSON.stringify(iSemantics);
    const aShape = a == null ? null : shapeOf(a.actual);
    const iShape = i == null ? null : shapeOf(i.actual);
    const shapeEqual = JSON.stringify(aShape) === JSON.stringify(iShape);
    const shapeDifferences = differentShapePaths(aShape, iShape);
    if (status === '✅' && (!semanticsEqual || !shapeEqual)) status = '⚠️';
    lines.push(
      `| \`${markdownCell(id)}\` | ${markdownCell(a?.status ?? 'missing')} | ${markdownCell(
        i?.status ?? 'missing'
      )} | ${semanticsEqual ? 'same' : `A=${markdownCell(aSemantics)}; I=${markdownCell(iSemantics)}`} | ${
        shapeEqual ? 'same' : markdownCell(shapeDifferences)
      } | ${status} |`
    );
  }
  const output = path.join(
    outputRoot,
    `comparison-${timestamp(new Date())}.md`
  );
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(output, `${lines.join('\n')}\n`);
  return { output, mismatches };
}

function runMain(options) {
  const platform = options.platform;
  if (platform !== 'android' && platform !== 'ios') {
    throw new Error('--platform must be android or ios');
  }
  const scriptPath = path.resolve(options.script ?? DEFAULT_SCRIPT);
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`script not found: ${scriptPath}`);
  }
  const script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  if (!Array.isArray(script.steps) || script.steps.length === 0) {
    throw new Error('script has no steps');
  }

  const version = options.version ?? readPackageVersion();
  const startedAt = new Date();
  let device = resolveDevice(platform, options.device);
  const runId = `${timestamp(startedAt)}-${platform}-${safeName(device)}`;
  const outputRoot = path.resolve(
    options['output-root'] ?? path.join(REPO_ROOT, 'build/reports', version)
  );
  const reportDir = path.join(outputRoot, runId);
  fs.mkdirSync(reportDir, { recursive: true });
  const eventsFile = path.join(reportDir, 'events.jsonl');
  const env = {
    ...process.env,
    SCRIPT_JSON: scriptPath,
    OUT_LOG: eventsFile,
  };
  if (options.device != null && platform === 'android') {
    env.ANDROID_SERIAL = options.device;
  }
  if (options.device != null && platform === 'ios') {
    env.DEVICE_UDID = options.device;
  }

  const commit = runText('git', ['rev-parse', 'HEAD']);
  const dirty = runText('git', ['status', '--porcelain']).length > 0;
  let runnerExitCode = null;
  let crashText = '';

  if (options['from-log'] != null) {
    fs.copyFileSync(path.resolve(options['from-log']), eventsFile);
    if (options['crash-log'] != null) {
      crashText = extractCrashEvidence(
        fs.readFileSync(path.resolve(options['crash-log']), 'utf8')
      );
    }
  } else {
    clearAndroidLogcat(platform, env);
    const result = spawnSync('bash', ['scripts/ci/smoke_local.sh', platform], {
      cwd: REPO_ROOT,
      env,
      stdio: 'inherit',
    });
    runnerExitCode = result.status ?? 1;
    if (device === 'auto') device = resolveDevice(platform, null);
    crashText = captureCrashEvidence(platform, device, env);
  }

  const finishedAt = new Date();
  const metadata = {
    schemaVersion: 1,
    runId,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    platform,
    device,
    script: relativeToRepo(scriptPath),
    sdkVersion: version,
    nativeVersions: readNativeVersions(),
    commit,
    worktreeDirty: dirty,
    scriptSha256: sha256(scriptPath),
    runnerSha256: sha256(__filename),
    evaluatorSha256: sha256(path.join(__dirname, 'script_results.js')),
    runnerExitCode,
    crashEvidence: crashText.length > 0,
    sensitiveValues: 'redacted or not included',
  };
  const report = writeReport({
    reportDir,
    metadata,
    scriptPath,
    script,
    eventsFile,
    crashText,
  });
  console.log(`Auto report: ${reportDir}`);
  if (report.evaluation.failures.length > 0 || crashText.length > 0) {
    process.exitCode = 1;
  }
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(usage());
      return;
    }
    if (options['android-report'] != null || options['ios-report'] != null) {
      if (options['android-report'] == null || options['ios-report'] == null) {
        throw new Error(
          'comparison requires --android-report and --ios-report'
        );
      }
      const version = options.version ?? readPackageVersion();
      const outputRoot = path.resolve(
        options['output-root'] ?? path.join(REPO_ROOT, 'build/reports', version)
      );
      const comparison = compareReports(
        options['android-report'],
        options['ios-report'],
        outputRoot
      );
      console.log(`Comparison report: ${comparison.output}`);
      if (comparison.mismatches > 0) process.exitCode = 1;
      return;
    }
    runMain(options);
  } catch (error) {
    console.error(`auto_report: ${error.message}`);
    process.exitCode = 2;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  collectIssues,
  compareReports,
  differentShapePaths,
  extractCrashEvidence,
  parseArgs,
  sanitize,
  shapeOf,
  writeReport,
};
