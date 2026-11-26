/**
 * Minimal on-device CI test harness for the example app.
 *
 * The IM SDK holds a single connection, so cases always run strictly
 * serially. Registration (`suite` / `ciTest` / hooks) is synchronous and
 * happens while an entry module loads; `runCiSuites` then executes the
 * collected cases once per cold start and emits structured results on the
 * `[APITEST]` log channel through the injected `log` function (the app
 * passes `addLog` from `../log/log_store`):
 *
 * - `ci.case.result` per executed case, with the failure phase (`prepare`
 *   for beforeAll, `body` for the case body, `cleanup` for
 *   tearDown/afterAll) attached to failures so body / prepare / cleanup
 *   failures stay distinguishable;
 * - `ci.run.summary` with pass/fail/blocked counts (blocked counts as
 *   failure for CI assertions);
 * - `script.done` as the final record, keeping the shape
 *   (`{ total, failed }`) that the existing device drivers and
 *   `testing/share/script_results.js` `parseLogText` already understand.
 *
 * The harness itself is pure TypeScript: the SDK client, the CI config and
 * the REST fixture reach cases through `CiCaseContext`, and the logger is
 * injected, so the registration / scheduling / teardown semantics are
 * covered by Jest unit tests (`__tests__/harness.test.ts`).
 */

import type { ChatClient } from 'react-native-chat-sdk';
import type { CiConfig } from './config';
import type { CiRestFixture } from './support/rest_fixture';

/** Dependencies handed to every case body and suite hook. */
export interface CiCaseContext {
  client: ChatClient;
  config: CiConfig;
  rest: CiRestFixture;
}

/** Which stage of a case produced the failure. */
export type CiFailurePhase = 'prepare' | 'body' | 'cleanup';

export type CiCaseStatus = 'pass' | 'fail' | 'blocked';

export interface CiCaseError {
  phase: CiFailurePhase;
  message: string;
  /**
   * Secondary cleanup failure, recorded when the body already failed. The
   * body failure stays the primary conclusion; the cleanup failure is kept
   * visible instead of being dropped.
   */
  cleanupMessage?: string;
}

export interface CiCaseResult {
  suite: string;
  caseId: string;
  description: string;
  status: CiCaseStatus;
  durationMs: number;
  error?: CiCaseError;
}

export interface CiRunSummary {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  /** caseIds of every non-pass result, in execution order. */
  failures: string[];
}

export type CiCaseBody = (ctx: CiCaseContext) => Promise<void>;
export type CiHook = (ctx: CiCaseContext) => Promise<void>;
export type CiTearDown = () => Promise<void>;
export type CiLog = (source: string, payload: unknown) => void;

/** Default per-case timeout: 2 minutes (mirrors the Flutter ciTestWidgets). */
export const CI_CASE_TIMEOUT_MS = 2 * 60 * 1000;

interface CiCase {
  suite: string;
  caseId: string;
  description: string;
  body: CiCaseBody;
  timeoutMs: number;
  tearDowns: CiTearDown[];
}

interface CiSuite {
  name: string;
  beforeAllHooks: CiHook[];
  afterAllHooks: CiHook[];
  cases: CiCase[];
}

export interface CiRunOptions {
  ctx: CiCaseContext;
  /** Entry name, echoed into every emitted record (e.g. `logged_in_base`). */
  entry: string;
  /** Optional runtime filter, matched against caseId and description. */
  testNameRegex?: string;
  /** Log sink; the app passes `addLog` so records land on `[APITEST]`. */
  log: CiLog;
}

let registry: CiSuite[] = [];
let currentSuite: CiSuite | null = null;
let currentCase: CiCase | null = null;
let running = false;

/**
 * Registers a suite. `body` runs synchronously and only collects
 * `ciTest` / `beforeAll` / `afterAll` registrations; nothing executes yet.
 */
export function suite(name: string, body: () => void): void {
  if (currentSuite != null) {
    throw new Error(`suite('${name}'): nested suites are not supported`);
  }
  const record: CiSuite = {
    name,
    beforeAllHooks: [],
    afterAllHooks: [],
    cases: [],
  };
  currentSuite = record;
  try {
    body();
  } finally {
    currentSuite = null;
  }
  registry.push(record);
}

/**
 * Registers a case inside the enclosing `suite`. Cases time out after
 * `CI_CASE_TIMEOUT_MS` (2 minutes) unless `options.timeoutMs` overrides it;
 * a timeout is recorded as a body failure.
 */
export function ciTest(
  caseId: string,
  description: string,
  body: CiCaseBody,
  options?: { timeoutMs?: number }
): void {
  if (currentSuite == null) {
    throw new Error(`ciTest('${caseId}'): must be called within suite()`);
  }
  if (
    registry.some((s) => s.cases.some((c) => c.caseId === caseId)) ||
    currentSuite.cases.some((c) => c.caseId === caseId)
  ) {
    throw new Error(`ciTest('${caseId}'): duplicate caseId`);
  }
  currentSuite.cases.push({
    suite: currentSuite.name,
    caseId,
    description,
    body,
    timeoutMs: options?.timeoutMs ?? CI_CASE_TIMEOUT_MS,
    tearDowns: [],
  });
}

/** Registers a suite-level prepare hook, run once before its cases. */
export function beforeAll(fn: CiHook): void {
  if (currentSuite == null) {
    throw new Error('beforeAll: must be called within suite()');
  }
  currentSuite.beforeAllHooks.push(fn);
}

/**
 * Registers a suite-level cleanup hook, run once after its cases. afterAll
 * hooks run even when beforeAll failed, so partial preparations can still
 * be cleaned up; failures are recorded with the `cleanup` phase.
 */
export function afterAll(fn: CiHook): void {
  if (currentSuite == null) {
    throw new Error('afterAll: must be called within suite()');
  }
  currentSuite.afterAllHooks.push(fn);
}

/**
 * Registers a case-level teardown from inside a running case body.
 * TearDowns are fail-safe: every registered teardown runs even when some
 * fail, and they run in reverse registration order (LIFO), mirroring
 * flutter_test's addTearDown.
 */
export function addTearDown(fn: CiTearDown): void {
  if (currentCase == null) {
    throw new Error('addTearDown: must be called within a running case');
  }
  currentCase.tearDowns.push(fn);
}

/** Clears all registrations. Used by unit tests between scenarios. */
export function resetCiRegistry(): void {
  registry = [];
  currentSuite = null;
  currentCase = null;
  running = false;
}

function formatError(e: unknown): string {
  if (e != null && typeof e === 'object') {
    const anyErr = e as { code?: unknown; description?: unknown };
    if (typeof anyErr.code === 'number') {
      const text =
        typeof anyErr.description === 'string'
          ? anyErr.description
          : e instanceof Error
            ? e.message
            : String(e);
      return `[${anyErr.code}] ${text}`;
    }
  }
  return e instanceof Error ? e.message : String(e);
}

function withTimeout<T>(
  p: Promise<T>,
  timeoutMs: number,
  what: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${what} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function runCase(
  record: CiCase,
  ctx: CiCaseContext
): Promise<CiCaseResult> {
  const start = Date.now();
  record.tearDowns = [];
  currentCase = record;
  let bodyError: unknown = null;
  try {
    await withTimeout(
      record.body(ctx),
      record.timeoutMs,
      `ciTest '${record.caseId}'`
    );
  } catch (e) {
    bodyError = e;
  } finally {
    currentCase = null;
  }

  // Fail-safe cleanup: every registered teardown runs even when some fail.
  let cleanupError: unknown = null;
  for (const tearDown of [...record.tearDowns].reverse()) {
    try {
      await withTimeout(
        tearDown(),
        record.timeoutMs,
        `tearDown of '${record.caseId}'`
      );
    } catch (e) {
      cleanupError ??= e;
    }
  }

  const durationMs = Date.now() - start;
  if (bodyError != null) {
    return {
      suite: record.suite,
      caseId: record.caseId,
      description: record.description,
      status: 'fail',
      durationMs,
      error: {
        phase: 'body',
        message: formatError(bodyError),
        ...(cleanupError != null
          ? { cleanupMessage: formatError(cleanupError) }
          : {}),
      },
    };
  }
  if (cleanupError != null) {
    return {
      suite: record.suite,
      caseId: record.caseId,
      description: record.description,
      status: 'fail',
      durationMs,
      error: { phase: 'cleanup', message: formatError(cleanupError) },
    };
  }
  return {
    suite: record.suite,
    caseId: record.caseId,
    description: record.description,
    status: 'pass',
    durationMs,
  };
}

/**
 * Executes every registered suite serially and emits the run records.
 *
 * - A failing `beforeAll` marks all (filtered) cases of that suite as
 *   `blocked` with the `prepare` phase and the run continues with the next
 *   suite; the whole entry is never aborted early.
 * - Case bodies run one at a time; each case always runs its teardowns.
 * - `afterAll` hooks run after the suite's cases (also when prepare
 *   failed), fail-safe; failures produce a synthetic cleanup result.
 *
 * Returns the run summary (also emitted as `ci.run.summary`).
 */
export async function runCiSuites(
  options: CiRunOptions
): Promise<CiRunSummary> {
  if (running) {
    throw new Error('runCiSuites: a run is already in progress');
  }
  running = true;
  const { ctx, entry, log } = options;
  const filter =
    typeof options.testNameRegex === 'string' &&
    options.testNameRegex.length > 0
      ? new RegExp(options.testNameRegex)
      : null;
  const matches = (record: CiCase): boolean =>
    filter == null ||
    filter.test(record.caseId) ||
    filter.test(record.description);

  const results: CiCaseResult[] = [];
  const emit = (result: CiCaseResult): void => {
    results.push(result);
    log('ci.case.result', {
      entry,
      suite: result.suite,
      caseId: result.caseId,
      description: result.description,
      status: result.status,
      durationMs: result.durationMs,
      ...(result.error != null ? { error: result.error } : {}),
    });
  };

  try {
    for (const s of registry) {
      const cases = s.cases.filter(matches);

      let prepareError: unknown = null;
      for (const hook of s.beforeAllHooks) {
        try {
          await hook(ctx);
        } catch (e) {
          prepareError = e;
          break;
        }
      }

      if (prepareError != null) {
        for (const record of cases) {
          emit({
            suite: record.suite,
            caseId: record.caseId,
            description: record.description,
            status: 'blocked',
            durationMs: 0,
            error: { phase: 'prepare', message: formatError(prepareError) },
          });
        }
      } else {
        for (const record of cases) {
          emit(await runCase(record, ctx));
        }
      }

      for (const hook of s.afterAllHooks) {
        try {
          await hook(ctx);
        } catch (e) {
          emit({
            suite: s.name,
            caseId: `${s.name}.afterAll`,
            description: `afterAll of suite '${s.name}'`,
            status: 'fail',
            durationMs: 0,
            error: { phase: 'cleanup', message: formatError(e) },
          });
        }
      }
    }

    const summary: CiRunSummary = {
      total: results.length,
      passed: results.filter((r) => r.status === 'pass').length,
      failed: results.filter((r) => r.status === 'fail').length,
      blocked: results.filter((r) => r.status === 'blocked').length,
      failures: results.filter((r) => r.status !== 'pass').map((r) => r.caseId),
    };
    log('ci.run.summary', { entry, ...summary });
    // `script.done` keeps the auto-mode shape so device drivers and
    // `parseLogText` work unchanged; blocked counts as failure here.
    log('script.done', {
      total: summary.total,
      failed: summary.failed + summary.blocked,
    });
    return summary;
  } finally {
    running = false;
  }
}
