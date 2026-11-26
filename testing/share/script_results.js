#!/usr/bin/env node

const APITEST_PREFIX = '[APITEST] ';

function parseLogText(text) {
  const entries = [];
  for (const rawLine of text.split('\n')) {
    let line = rawLine.trim();
    if (line.length === 0) {
      continue;
    }
    const marker = line.indexOf(APITEST_PREFIX);
    if (marker >= 0) {
      line = line.slice(marker + APITEST_PREFIX.length).trim();
    }
    if (!line.startsWith('{')) {
      continue;
    }
    try {
      const entry = JSON.parse(line);
      if (entry != null && typeof entry.source === 'string') {
        entries.push(entry);
      }
    } catch {
      // Ignore non-JSON or truncated device-output lines.
    }
  }
  return entries;
}

function indexLastEntries(entries) {
  const bySource = new Map();
  for (const entry of entries) {
    bySource.set(entry.source, entry);
  }
  return bySource;
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function valueAt(value, pathText) {
  let current = value;
  for (const part of pathText.split('.')) {
    if (Array.isArray(current) && /^\d+$/.test(part)) {
      if (Number(part) >= current.length) return { found: false };
      current = current[Number(part)];
    } else if (
      current != null &&
      typeof current === 'object' &&
      hasOwn(current, part)
    ) {
      current = current[part];
    } else {
      return { found: false };
    }
  }
  return { found: true, value: current };
}

// `checks` run against result.data: [{path, equals}] or [{path, length}].
// Array indexes are numeric path parts, so `bodies.0.content` pins order.
function matchChecks(result, checks) {
  if (!Array.isArray(checks) || checks.length === 0) {
    return { valid: false, reason: 'checks must be a nonempty list' };
  }
  for (const check of checks) {
    const operators = ['equals', 'length'].filter((key) =>
      hasOwn(check ?? {}, key)
    );
    if (typeof check?.path !== 'string' || operators.length !== 1) {
      return {
        valid: false,
        reason: 'each check needs path and one of equals or length',
      };
    }
    const actual = valueAt(result?.data, check.path);
    const expected = check[operators[0]];
    const passed =
      actual.found &&
      (operators[0] === 'equals'
        ? JSON.stringify(actual.value) === JSON.stringify(expected)
        : Array.isArray(actual.value) && actual.value.length === expected);
    if (!passed) {
      return {
        valid: true,
        reason: `check ${check.path} ${operators[0]} ${JSON.stringify(expected)} failed, actual ${
          actual.found ? JSON.stringify(actual.value) : '<missing>'
        }`,
      };
    }
  }
  return { valid: true, reason: null };
}

function matchExpectation(result, expectation) {
  if (expectation == null || typeof expectation !== 'object') {
    return { valid: false, matched: false, reason: 'missing expect object' };
  }
  if (hasOwn(expectation, 'errorCode')) {
    const matched =
      result?.success === false &&
      result?.error?.code === expectation.errorCode;
    return {
      valid: true,
      matched,
      reason: matched
        ? null
        : `expected error code ${JSON.stringify(expectation.errorCode)}`,
    };
  }
  if (typeof expectation.success === 'boolean') {
    const matched = result?.success === expectation.success;
    if (!matched || !hasOwn(expectation, 'checks')) {
      return {
        valid: true,
        matched,
        reason: matched ? null : `expected success=${expectation.success}`,
      };
    }
    const checked = matchChecks(result, expectation.checks);
    return {
      valid: checked.valid,
      matched: checked.valid && checked.reason == null,
      reason: checked.reason,
    };
  }
  return {
    valid: false,
    matched: false,
    reason: 'expect must contain success or errorCode',
  };
}

function collectStepReferences(value, references = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStepReferences(item, references);
    }
    return references;
  }
  if (value != null && typeof value === 'object') {
    for (const item of Object.values(value)) {
      collectStepReferences(item, references);
    }
    return references;
  }
  if (typeof value === 'string') {
    const match = /^\$step\.([^.]+)(?:\.|$)/.exec(value);
    if (match != null) {
      references.add(match[1]);
    }
  }
  return references;
}

function laterEntry(first, second) {
  if (first == null) return second;
  if (second == null) return first;
  const firstSeq = Number(first.seq ?? 0);
  const secondSeq = Number(second.seq ?? 0);
  return secondSeq >= firstSeq ? second : first;
}

function evaluateScript(script, entries, options = {}) {
  const bySource = indexLastEntries(entries);
  const steps = Array.isArray(script.steps) ? script.steps : [];
  const outcomes = [];
  const outcomesById = new Map();

  for (let index = 0; index < steps.length; index++) {
    const step = steps[index];
    const source = `script.step[${index}]`;
    const entry = bySource.get(source);
    const dependencies = Array.from(collectStepReferences(step.params)).sort();
    let status = 'not-run';
    let reason = 'missing structured step result';
    let actual = null;

    if (entry != null) {
      actual = entry.payload?.result ?? null;
      if (entry.payload?.api !== step.api) {
        status = 'failed';
        reason = `log API mismatch: ${JSON.stringify(entry.payload?.api)}`;
      } else {
        const match = matchExpectation(actual, step.expect);
        if (match.matched) {
          status = 'passed';
          reason = null;
        } else {
          const failedDependency = dependencies.find(
            (id) => outcomesById.get(id)?.status !== 'passed'
          );
          if (failedDependency != null) {
            status = 'blocked';
            reason = `dependency ${failedDependency} did not pass`;
          } else {
            status = 'failed';
            reason = match.reason;
          }
        }
      }
    }

    const outcome = {
      index,
      source,
      id: step.id ?? `step-${index}`,
      api: step.api,
      status,
      reason,
      dependencies,
      expected: step.expect ?? null,
      actual,
    };
    outcomes.push(outcome);
    if (typeof step.id === 'string' && step.id.length > 0) {
      outcomesById.set(step.id, outcome);
    }
  }

  if (options.crashEvidence === true) {
    const firstMissing = outcomes.find((item) => item.status === 'not-run');
    if (firstMissing != null) {
      firstMissing.status = 'crashed';
      firstMissing.reason = 'process terminated before this step returned';
    }
  }

  const initEntry = bySource.get('api.ChatClient.init');
  const loginEntry = laterEntry(
    bySource.get('api.ChatClient.login'),
    bySource.get('api.ChatClient.loginWithToken')
  );
  const doneEntry = bySource.get('script.done');
  const failures = [];

  if (initEntry == null) {
    failures.push('missing log entry: api.ChatClient.init');
  } else if (initEntry.payload?.success !== true) {
    failures.push(
      `api.ChatClient.init did not succeed: ${JSON.stringify(initEntry.payload)}`
    );
  }
  if (loginEntry != null && loginEntry.payload?.success !== true) {
    failures.push(
      `api.ChatClient.login did not succeed: ${JSON.stringify(
        loginEntry.payload
      )}`
    );
  }
  for (const outcome of outcomes) {
    if (outcome.status !== 'passed') {
      failures.push(
        `step[${outcome.index}] ${outcome.api}: ${outcome.status} (${outcome.reason})`
      );
    }
  }
  if (doneEntry == null) {
    failures.push('missing log entry: script.done (script did not finish?)');
  } else if (doneEntry.payload?.total !== steps.length) {
    failures.push(
      `script.done total mismatch: expected ${steps.length}, got ${JSON.stringify(
        doneEntry.payload?.total
      )}`
    );
  }

  const counts = {};
  for (const outcome of outcomes) {
    counts[outcome.status] = (counts[outcome.status] ?? 0) + 1;
  }

  return {
    entries,
    bySource,
    initEntry,
    loginEntry,
    doneEntry,
    outcomes,
    counts,
    failures,
  };
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

module.exports = {
  APITEST_PREFIX,
  collectStepReferences,
  evaluateScript,
  indexLastEntries,
  matchExpectation,
  parseLogText,
  sanitize,
};
