/**
 * Unit tests for the CI harness: registration rules, serial scheduling,
 * per-case timeout, fail-safe teardown semantics, failure-phase
 * attribution and the emitted result protocol (`ci.case.result`,
 * `ci.run.summary`, `script.done`). The harness is pure TypeScript; the
 * log sink is injected and captured here instead of touching RNFS.
 */

import {
  addTearDown,
  afterAll,
  beforeAll,
  ciTest,
  resetCiRegistry,
  runCiSuites,
  suite,
  type CiCaseContext,
  type CiRunSummary,
} from '../harness';

const ctx = {} as CiCaseContext;

interface CapturedLog {
  source: string;
  payload: any;
}

function makeLog(): {
  log: (s: string, p: unknown) => void;
  logs: CapturedLog[];
} {
  const logs: CapturedLog[] = [];
  return { log: (source, payload) => logs.push({ source, payload }), logs };
}

function caseResults(logs: CapturedLog[]): CapturedLog[] {
  return logs.filter((l) => l.source === 'ci.case.result');
}

function summaryOf(logs: CapturedLog[]): any {
  const entry = logs.find((l) => l.source === 'ci.run.summary');
  expect(entry).toBeDefined();
  return entry!.payload;
}

function scriptDoneOf(logs: CapturedLog[]): any {
  const entry = logs.find((l) => l.source === 'script.done');
  expect(entry).toBeDefined();
  return entry!.payload;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function run(log: (s: string, p: unknown) => void): Promise<CiRunSummary> {
  return runCiSuites({ ctx, entry: 'logged_out', log });
}

beforeEach(() => {
  resetCiRegistry();
});

describe('registration rules', () => {
  it('rejects ciTest outside suite()', () => {
    expect(() => ciTest('RN-X-001', 'd', async () => {})).toThrow(
      /within suite/
    );
  });

  it('rejects hooks outside suite()', () => {
    expect(() => beforeAll(async () => {})).toThrow(/within suite/);
    expect(() => afterAll(async () => {})).toThrow(/within suite/);
  });

  it('rejects addTearDown outside a running case', () => {
    expect(() => addTearDown(async () => {})).toThrow(/running case/);
  });

  it('rejects nested suites', () => {
    expect(() =>
      suite('outer', () => {
        suite('inner', () => {});
      })
    ).toThrow(/nested/);
  });

  it('rejects duplicate caseIds across suites', () => {
    suite('a', () => {
      ciTest('RN-X-001', 'd', async () => {});
    });
    expect(() =>
      suite('b', () => {
        ciTest('RN-X-001', 'd', async () => {});
      })
    ).toThrow(/duplicate/);
  });
});

describe('serial scheduling', () => {
  it('runs hooks, cases and teardowns strictly in order', async () => {
    const events: string[] = [];
    suite('s', () => {
      beforeAll(async () => {
        events.push('beforeAll');
      });
      ciTest('RN-X-001', 'first', async () => {
        events.push('body1');
        addTearDown(async () => {
          events.push('td1');
        });
      });
      ciTest('RN-X-002', 'second', async () => {
        events.push('body2');
        addTearDown(async () => {
          events.push('td2');
        });
      });
      afterAll(async () => {
        events.push('afterAll');
      });
    });

    const { log } = makeLog();
    await run(log);

    expect(events).toEqual([
      'beforeAll',
      'body1',
      'td1',
      'body2',
      'td2',
      'afterAll',
    ]);
  });

  it('does not overlap a slow case with the next one', async () => {
    const events: string[] = [];
    suite('s', () => {
      ciTest('RN-X-001', 'slow', async () => {
        await sleep(30);
        events.push('slow-done');
      });
      ciTest('RN-X-002', 'next', async () => {
        events.push('next-start');
      });
    });

    const { log } = makeLog();
    await run(log);
    expect(events).toEqual(['slow-done', 'next-start']);
  });

  it('runs teardowns in LIFO order', async () => {
    const events: string[] = [];
    suite('s', () => {
      ciTest('RN-X-001', 'd', async () => {
        addTearDown(async () => {
          events.push('first-registered');
        });
        addTearDown(async () => {
          events.push('second-registered');
        });
      });
    });

    const { log } = makeLog();
    await run(log);
    expect(events).toEqual(['second-registered', 'first-registered']);
  });
});

describe('result protocol', () => {
  it('emits per-case results, a summary and script.done', async () => {
    suite('s', () => {
      ciTest('RN-X-001', 'ok case', async () => {});
      ciTest('RN-X-002', 'bad case', async () => {
        throw new Error('boom');
      });
    });

    const { log, logs } = makeLog();
    const summary = await run(log);

    const results = caseResults(logs);
    expect(results).toHaveLength(2);
    expect(results[0]!.payload).toMatchObject({
      entry: 'logged_out',
      caseId: 'RN-X-001',
      status: 'pass',
    });
    expect(typeof results[0]!.payload.durationMs).toBe('number');
    expect(results[1]!.payload).toMatchObject({
      caseId: 'RN-X-002',
      status: 'fail',
      error: { phase: 'body', message: 'boom' },
    });

    expect(summaryOf(logs)).toEqual({
      entry: 'logged_out',
      total: 2,
      passed: 1,
      failed: 1,
      blocked: 0,
      failures: ['RN-X-002'],
    });
    expect(scriptDoneOf(logs)).toEqual({ total: 2, failed: 1 });
    expect(summary).toMatchObject({ total: 2, failed: 1 });
  });

  it('surfaces ChatError-style codes in failure messages', async () => {
    suite('s', () => {
      ciTest('RN-X-001', 'd', async () => {
        throw Object.assign(new Error('not logged in'), { code: 201 });
      });
    });

    const { log, logs } = makeLog();
    await run(log);
    expect(caseResults(logs)[0]!.payload.error).toMatchObject({
      phase: 'body',
      message: '[201] not logged in',
    });
  });
});

describe('teardown semantics', () => {
  it('runs teardowns even when the body fails, keeping the body phase', async () => {
    let tearDownRan = false;
    suite('s', () => {
      ciTest('RN-X-001', 'd', async () => {
        addTearDown(async () => {
          tearDownRan = true;
        });
        throw new Error('body failed');
      });
    });

    const { log, logs } = makeLog();
    await run(log);
    expect(tearDownRan).toBe(true);
    expect(caseResults(logs)[0]!.payload.error).toMatchObject({
      phase: 'body',
      message: 'body failed',
    });
  });

  it('is fail-safe: every teardown runs even when an earlier one fails', async () => {
    const events: string[] = [];
    suite('s', () => {
      ciTest('RN-X-001', 'd', async () => {
        addTearDown(async () => {
          events.push('td-outer');
        });
        addTearDown(async () => {
          events.push('td-inner');
          throw new Error('inner cleanup failed');
        });
      });
    });

    const { log, logs } = makeLog();
    await run(log);
    expect(events).toEqual(['td-inner', 'td-outer']);
    // Body succeeded, so the cleanup failure is the primary conclusion.
    expect(caseResults(logs)[0]!.payload).toMatchObject({
      status: 'fail',
      error: { phase: 'cleanup', message: 'inner cleanup failed' },
    });
  });

  it('keeps the body failure primary and records cleanup as secondary', async () => {
    suite('s', () => {
      ciTest('RN-X-001', 'd', async () => {
        addTearDown(async () => {
          throw new Error('cleanup also failed');
        });
        throw new Error('body failed');
      });
    });

    const { log, logs } = makeLog();
    await run(log);
    expect(caseResults(logs)[0]!.payload.error).toEqual({
      phase: 'body',
      message: 'body failed',
      cleanupMessage: 'cleanup also failed',
    });
  });
});

describe('timeout', () => {
  it('fails a case that exceeds its timeout and continues with the next', async () => {
    const events: string[] = [];
    suite('s', () => {
      ciTest(
        'RN-X-001',
        'hangs',
        async () => {
          await new Promise(() => {});
        },
        { timeoutMs: 50 }
      );
      ciTest('RN-X-002', 'runs after', async () => {
        events.push('next');
      });
    });

    const { log, logs } = makeLog();
    await run(log);

    expect(events).toEqual(['next']);
    expect(caseResults(logs)[0]!.payload).toMatchObject({
      caseId: 'RN-X-001',
      status: 'fail',
      error: { phase: 'body' },
    });
    expect(caseResults(logs)[0]!.payload.error.message).toMatch(
      /timed out after 50ms/
    );
    expect(summaryOf(logs)).toMatchObject({ total: 2, failed: 1, passed: 1 });
  });
});

describe('suite hook failures', () => {
  it('blocks all cases of a suite whose beforeAll fails, then continues', async () => {
    const events: string[] = [];
    suite('broken', () => {
      beforeAll(async () => {
        throw new Error('init failed');
      });
      ciTest('RN-X-001', 'd1', async () => {
        events.push('body1');
      });
      ciTest('RN-X-002', 'd2', async () => {
        events.push('body2');
      });
      afterAll(async () => {
        events.push('afterAll-broken');
      });
    });
    suite('healthy', () => {
      ciTest('RN-Y-001', 'd3', async () => {
        events.push('body3');
      });
    });

    const { log, logs } = makeLog();
    await run(log);

    // Case bodies of the broken suite never run; afterAll still runs so
    // partial preparations can be cleaned up; the next suite executes.
    expect(events).toEqual(['afterAll-broken', 'body3']);

    const results = caseResults(logs);
    expect(results.map((r) => r.payload.status)).toEqual([
      'blocked',
      'blocked',
      'pass',
    ]);
    expect(results[0]!.payload.error).toEqual({
      phase: 'prepare',
      message: 'init failed',
    });
    // blocked counts as failure in the script.done totals.
    expect(summaryOf(logs)).toMatchObject({
      total: 3,
      passed: 1,
      failed: 0,
      blocked: 2,
      failures: ['RN-X-001', 'RN-X-002'],
    });
    expect(scriptDoneOf(logs)).toEqual({ total: 3, failed: 2 });
  });

  it('records an afterAll failure as a cleanup result', async () => {
    suite('s', () => {
      ciTest('RN-X-001', 'd', async () => {});
      afterAll(async () => {
        throw new Error('logout failed');
      });
    });

    const { log, logs } = makeLog();
    await run(log);

    const results = caseResults(logs);
    expect(results).toHaveLength(2);
    expect(results[1]!.payload).toMatchObject({
      caseId: 's.afterAll',
      status: 'fail',
      error: { phase: 'cleanup', message: 'logout failed' },
    });
    expect(scriptDoneOf(logs)).toEqual({ total: 2, failed: 1 });
  });

  it('runs every afterAll hook even when an earlier one fails', async () => {
    const events: string[] = [];
    suite('s', () => {
      ciTest('RN-X-001', 'd', async () => {});
      afterAll(async () => {
        throw new Error('first afterAll failed');
      });
      afterAll(async () => {
        events.push('second afterAll');
      });
    });

    const { log } = makeLog();
    await run(log);
    expect(events).toEqual(['second afterAll']);
  });
});

describe('testNameRegex filtering', () => {
  it('runs only matching cases and counts them in the totals', async () => {
    const events: string[] = [];
    suite('s', () => {
      ciTest('RN-AUTH-001', 'login readiness', async () => {
        events.push('auth');
      });
      ciTest('RN-MSG-001', 'fetch messages', async () => {
        events.push('msg');
      });
    });

    const { log, logs } = makeLog();
    await runCiSuites({
      ctx,
      entry: 'logged_in_base',
      testNameRegex: 'RN-AUTH-.*',
      log,
    });

    expect(events).toEqual(['auth']);
    expect(summaryOf(logs)).toMatchObject({ total: 1, passed: 1 });
    expect(scriptDoneOf(logs)).toEqual({ total: 1, failed: 0 });
  });

  it('also matches against the case description', async () => {
    const events: string[] = [];
    suite('s', () => {
      ciTest('RN-AUTH-001', 'login readiness', async () => {
        events.push('auth');
      });
      ciTest('RN-MSG-001', 'fetch messages', async () => {
        events.push('msg');
      });
    });

    const { log } = makeLog();
    await runCiSuites({
      ctx,
      entry: 'logged_in_base',
      testNameRegex: 'readiness',
      log,
    });
    expect(events).toEqual(['auth']);
  });
});
