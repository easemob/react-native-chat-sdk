#!/usr/bin/env node

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  collectStepReferences,
  evaluateScript,
  matchExpectation,
  parseLogText,
} = require('./script_results');
const {
  differentShapePaths,
  extractCrashEvidence,
  sanitize,
  shapeOf,
} = require('./auto_report');

function entry(source, payload, seq = 1) {
  return { ts: 1, seq, source, payload };
}

test('parseLogText accepts plain JSON and APITEST-prefixed lines', () => {
  const entries = parseLogText(
    [
      JSON.stringify(entry('plain', { success: true }, 1)),
      `noise [APITEST] ${JSON.stringify(
        entry('prefixed', { success: true }, 2)
      )}`,
      'truncated {',
    ].join('\n')
  );
  assert.deepEqual(
    entries.map((item) => item.source),
    ['plain', 'prefixed']
  );
});

test('matchExpectation treats expected failures as passed outcomes', () => {
  assert.equal(
    matchExpectation(
      { success: false, error: { code: 305 } },
      { success: false }
    ).matched,
    true
  );
  assert.equal(
    matchExpectation(
      { success: false, error: { code: 305 } },
      { errorCode: 305 }
    ).matched,
    true
  );
});

test('evaluateScript ignores script.done raw failure count when expectations pass', () => {
  const script = {
    steps: [
      {
        id: 'expected_error',
        api: 'ChatManager.modifyMsgBody',
        expect: { errorCode: 305 },
      },
    ],
  };
  const entries = [
    entry('api.ChatClient.init', { success: true }, 1),
    entry(
      'script.step[0]',
      {
        api: 'ChatManager.modifyMsgBody',
        id: 'expected_error',
        result: { success: false, error: { code: 305 } },
      },
      2
    ),
    entry('script.done', { total: 1, failed: 1 }, 3),
  ];
  const evaluation = evaluateScript(script, entries);
  assert.deepEqual(evaluation.counts, { passed: 1 });
  assert.deepEqual(evaluation.failures, []);
});

test('evaluateScript classifies a dependent mismatch as blocked', () => {
  const script = {
    steps: [
      { id: 'producer', api: 'Producer', expect: { success: true } },
      {
        id: 'consumer',
        api: 'Consumer',
        params: { value: '$step.producer.id' },
        expect: { success: true },
      },
    ],
  };
  const entries = [
    entry('api.ChatClient.init', { success: true }, 1),
    entry(
      'script.step[0]',
      { api: 'Producer', result: { success: false, error: { code: 500 } } },
      2
    ),
    entry(
      'script.step[1]',
      { api: 'Consumer', result: { success: false, error: { code: -1 } } },
      3
    ),
    entry('script.done', { total: 2, failed: 2 }, 4),
  ];
  const evaluation = evaluateScript(script, entries);
  assert.equal(evaluation.outcomes[0].status, 'failed');
  assert.equal(evaluation.outcomes[1].status, 'blocked');
});

test('evaluateScript attributes crash evidence to the first missing step', () => {
  const script = {
    steps: [
      { id: 'crash', api: 'Crash', expect: { success: false } },
      { id: 'after', api: 'After', expect: { success: true } },
    ],
  };
  const entries = [entry('api.ChatClient.init', { success: true }, 1)];
  const evaluation = evaluateScript(script, entries, { crashEvidence: true });
  assert.equal(evaluation.outcomes[0].status, 'crashed');
  assert.equal(evaluation.outcomes[1].status, 'not-run');
});

test('collectStepReferences finds nested step dependencies', () => {
  assert.deepEqual(
    Array.from(
      collectStepReferences({ a: ['$step.first.id'], b: '$config.user' })
    ),
    ['first']
  );
});

test('report helpers redact credential-shaped values', () => {
  assert.deepEqual(sanitize({ token: 'secret', nested: { password: 'pw' } }), {
    token: '<redacted>',
    nested: { password: '<redacted>' },
  });
});

test('extractCrashEvidence keeps crash context and drops unrelated lines', () => {
  const crash = extractCrashEvidence(
    ['unrelated', 'before', 'FATAL EXCEPTION: main', 'after'].join('\n')
  );
  assert.match(crash, /FATAL EXCEPTION/);
  assert.match(crash, /after/);
});

test('shapeOf compares response structure without dynamic values', () => {
  assert.deepEqual(shapeOf({ id: 'dynamic', values: [{ count: 1 }] }), {
    id: 'string',
    values: [{ count: 'number' }],
  });
});

test('differentShapePaths reports concise field-level differences', () => {
  assert.deepEqual(
    differentShapePaths(
      { data: { cursor: 'string', list: [] } },
      { data: { cursor: 'string', list: [], totalCount: 'number' } }
    ),
    ['data.totalCount']
  );
});
