import type { EvidenceStore } from './evidence_store';
import {
  DEFAULT_TIMEOUT_MS,
  PROTOCOL_VERSION,
  TIMEOUT_ERROR_CODE,
  TOOL_ERROR_CODE,
  type AgentErrorJson,
  type AgentServiceState,
  type CommandStatus,
  type FailureKind,
  type ResultEnvelope,
} from './types';

/**
 * Command execution core (contract §2/§3): submission validation, dedup,
 * single in-flight command, timeout guard, three-state lifecycle
 * (accepting → uncertain → closed). SDK-free on purpose: the API executor and
 * the ChatClient.init special case are injected so unit tests can drive fakes.
 */

/** Rejection carrying the inbound-equivalent HTTP status (contract §2.2). On
 * the reverse channel it is reported as a result envelope instead. */
export class AgentCommandError extends Error {
  readonly statusCode: number;
  readonly code: string;
  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AgentCommandError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/** Executor result for one business api call. */
export type ExecResult =
  | { success: true; data?: unknown }
  | { success: false; failureKind: FailureKind; error: AgentErrorJson };

export type AgentExecutor = (
  api: string,
  params: Record<string, unknown>
) => Promise<ExecResult>;

/** ChatClient.init is the single agent-side special case (contract §10):
 * config/overrides merge and listener registration live behind this hook. */
export type AgentInitHandler = (
  params: Record<string, unknown>
) => Promise<ExecResult>;

export interface CommandRecord {
  readonly commandId: string;
  readonly api: string;
  /** canonical JSON of {api, params, timeoutMs} — the dedup key content */
  readonly canonical: string;
  status: CommandStatus;
  result?: ResultEnvelope;
  /** reverse channel: set once the terminal envelope was posted */
  posted: boolean;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

/**
 * Compat expect evaluation (contract §2.1/§3): only `success` and `errorCode`
 * are evaluated; unknown expect fields are tolerated and never crash the
 * agent. The host's judgment stays authoritative.
 */
export function evaluateExpect(result: ExecResult, expect: unknown): boolean {
  if (typeof expect !== 'object' || expect === null) {
    return true;
  }
  const e = expect as Record<string, unknown>;
  if ('success' in e && e.success !== result.success) {
    return false;
  }
  if ('errorCode' in e) {
    if (result.success) {
      return false;
    }
    if (result.error.code !== e.errorCode) {
      return false;
    }
  }
  return true;
}

export class CommandService {
  private readonly executeApi: AgentExecutor;
  private readonly initHandler: AgentInitHandler;
  private readonly isRegistered: (api: string) => boolean;
  private readonly evidence: EvidenceStore;
  private readonly instanceId: string;
  private readonly defaultTimeoutMs: number;

  private _state: AgentServiceState = 'accepting';
  private readonly records = new Map<string, CommandRecord>();
  private inFlight: CommandRecord | undefined;
  private readonly waiters = new Map<string, (r: CommandRecord) => void>();

  constructor(deps: {
    executeApi: AgentExecutor;
    initHandler: AgentInitHandler;
    isRegistered: (api: string) => boolean;
    evidence: EvidenceStore;
    instanceId: string;
    defaultTimeoutMs?: number;
  }) {
    this.executeApi = deps.executeApi;
    this.initHandler = deps.initHandler;
    this.isRegistered = deps.isRegistered;
    this.evidence = deps.evidence;
    this.instanceId = deps.instanceId;
    this.defaultTimeoutMs = deps.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  get state(): AgentServiceState {
    return this._state;
  }

  get busy(): boolean {
    return this.inFlight !== undefined;
  }

  /**
   * Submit one command (contract §2.2 validation order). On acceptance the
   * record is registered and execution starts detached; throws
   * [AgentCommandError] on rejection. Submitting a duplicate commandId with
   * identical resolved content returns the existing record (response-loss
   * replay dedup).
   */
  submit(raw: Record<string, unknown>): CommandRecord {
    if (this._state === 'closed') {
      throw new AgentCommandError(410, 'closed', 'service is closed (finish)');
    }
    if (this._state === 'uncertain') {
      throw new AgentCommandError(
        503,
        'uncertain',
        'previous command timed out; finish explicitly or restart the app'
      );
    }
    // Protocol v2 §5: a degraded evidence buffer rejects further business
    // commands so a run never passes on incomplete evidence.
    if (this.evidence.degraded) {
      throw new AgentCommandError(
        503,
        'evidence_gap',
        `evidence buffer overflowed: firstAvailableSeq=${this.evidence.firstAvailableSeq}`
      );
    }

    const commandId = raw.commandId;
    if (!isNonEmptyString(commandId)) {
      throw new AgentCommandError(
        400,
        'bad_command',
        'commandId must be a non-empty string'
      );
    }
    const api = raw.api;
    if (!isNonEmptyString(api)) {
      throw new AgentCommandError(
        400,
        'bad_command',
        'api must be a non-empty string'
      );
    }
    const rawParams = raw.params;
    const params: Record<string, unknown> =
      typeof rawParams === 'object' && rawParams !== null
        ? { ...(rawParams as Record<string, unknown>) }
        : {};
    const rawTimeout = raw.timeoutMs;
    const timeoutMs =
      typeof rawTimeout === 'number' ? rawTimeout : this.defaultTimeoutMs;

    const canonical = JSON.stringify({ api, params, timeoutMs });
    const existing = this.records.get(commandId);
    if (existing !== undefined) {
      if (existing.canonical !== canonical) {
        throw new AgentCommandError(
          409,
          'command_conflict',
          'same commandId used with different content'
        );
      }
      return existing;
    }
    if (this.inFlight !== undefined) {
      throw new AgentCommandError(
        409,
        'busy',
        'only one in-flight command is allowed'
      );
    }

    const isInit = api === 'ChatClient.init';
    if (!isInit && !this.isRegistered(api)) {
      throw new AgentCommandError(
        422,
        'unknown_api',
        `unregistered api: ${api}`
      );
    }

    const record: CommandRecord = {
      commandId,
      api,
      canonical,
      status: 'running',
      posted: false,
    };
    this.records.set(commandId, record);
    this.inFlight = record;
    this.evidence.append('agent.command', {
      event: 'accepted',
      commandId,
      api,
    });
    this.execute(record, params, timeoutMs, isInit, raw.expect).catch(() => {});
    return record;
  }

  private async execute(
    record: CommandRecord,
    params: Record<string, unknown>,
    timeoutMs: number,
    isInit: boolean,
    expect: unknown
  ): Promise<void> {
    const fromSeq = this.evidence.lastSeq;
    let timedOut = false;
    const future = isInit
      ? this.initHandler(params)
      : this.executeApi(record.api, params);

    // Late completion after a timeout stays visible in the evidence stream as
    // an ordinary event; it never overwrites the recorded terminal state.
    future
      .then(
        (late) => {
          if (timedOut) {
            this.evidence.append(`api.${record.api}`, { ...late, late: true });
          }
        },
        (e: unknown) => {
          if (timedOut) {
            this.evidence.append(`api.${record.api}`, {
              success: false,
              failureKind: 'tool',
              error: {
                code: TOOL_ERROR_CODE,
                message: e instanceof Error ? e.message : String(e),
              },
              late: true,
            });
          }
        }
      )
      .catch(() => {});

    let result: ExecResult;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      result = await Promise.race([
        future,
        new Promise<ExecResult>((resolve) => {
          timeout = setTimeout(() => {
            timedOut = true;
            resolve({
              success: false,
              failureKind: 'timeout',
              error: {
                code: TIMEOUT_ERROR_CODE,
                message: `timeout after ${timeoutMs}ms`,
              },
            });
          }, timeoutMs);
        }),
      ]);
    } catch (e) {
      result = {
        success: false,
        failureKind: 'tool',
        error: {
          code: TOOL_ERROR_CODE,
          message: e instanceof Error ? e.message : String(e),
        },
      };
    } finally {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    }

    // The api.* event mirrors the execution envelope into the evidence stream.
    this.evidence.append(`api.${record.api}`, result);

    const terminal: ResultEnvelope = {
      commandId: record.commandId,
      status: timedOut ? 'timeout' : 'done',
      ...result,
      evidence: { fromSeq, toSeq: this.evidence.lastSeq },
    };
    if (expect !== undefined) {
      try {
        terminal.expectMatched = evaluateExpect(result, expect);
      } catch {
        terminal.expectMatched = false;
      }
    }

    record.status = terminal.status;
    record.result = terminal;
    this.inFlight = undefined;
    if (timedOut) {
      this._state = 'uncertain';
    }
    this.evidence.append('agent.command', {
      event: 'finished',
      commandId: record.commandId,
      status: record.status,
    });
    const waiter = this.waiters.get(record.commandId);
    if (waiter !== undefined) {
      this.waiters.delete(record.commandId);
      waiter(record);
    }
  }

  /** Resolves when the record reaches a terminal state. */
  awaitTerminal(record: CommandRecord): Promise<CommandRecord> {
    if (record.result !== undefined) {
      return Promise.resolve(record);
    }
    return new Promise((resolve) => {
      this.waiters.set(record.commandId, resolve);
    });
  }

  lookup(commandId: string): CommandRecord | undefined {
    return this.records.get(commandId);
  }

  /** Handshake info carried on the first reverse request (contract §8). */
  info(): Record<string, unknown> {
    return {
      version: PROTOCOL_VERSION,
      instanceId: this.instanceId,
      state: this._state,
    };
  }

  /**
   * finish (contract §7): rejects while a command is in flight; afterwards
   * the service is closed and business commands are rejected with 410.
   */
  finish(): void {
    if (this.inFlight !== undefined) {
      throw new AgentCommandError(
        409,
        'busy',
        'cannot finish with an in-flight command'
      );
    }
    this._state = 'closed';
  }

  /** Terminal envelope for a rejected submission (reverse channel, §8). */
  static rejectionEnvelope(
    command: Record<string, unknown>,
    e: AgentCommandError
  ): ResultEnvelope {
    const commandId = isNonEmptyString(command.commandId)
      ? command.commandId
      : '';
    return {
      commandId,
      status: 'done',
      success: false,
      failureKind: 'tool',
      error: {
        code: TOOL_ERROR_CODE,
        message: `rejected: ${e.code} (${e.statusCode}): ${e.message}`,
      },
      rejectCode: e.code,
    };
  }
}
