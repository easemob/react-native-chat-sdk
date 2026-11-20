/**
 * phase-control v2 protocol types shared by the RN agent modules.
 * Semantics: im-test-orchestrator `docs/agent-contract.md` (generic layer);
 * this directory implements the reverse transport variant (§8).
 */

export type AgentServiceState = 'accepting' | 'uncertain' | 'closed';

export type CommandStatus = 'running' | 'done' | 'timeout';

export type FailureKind = 'sdk' | 'timeout' | 'tool';

/** canonical error shape (contract §12.8) */
export interface AgentErrorJson {
  code: number;
  message: string;
}

/** Command object as delivered by the host (contract §2.1). Unknown fields
 * are tolerated (forward compatibility) and never used. */
export interface AgentCommand {
  commandId: string;
  api: string;
  params?: Record<string, unknown>;
  timeoutMs?: number;
  expect?: unknown;
  [key: string]: unknown;
}

/** Terminal result envelope (contract §3). `rejectCode` is the reverse-channel
 * addition for submission rejections (contract §8: rejected commands are
 * reported as result envelopes with tool error -1). */
export interface ResultEnvelope {
  commandId: string;
  status: CommandStatus;
  success: boolean;
  data?: unknown;
  error?: AgentErrorJson;
  failureKind?: FailureKind;
  expectMatched?: boolean;
  evidence?: { fromSeq: number; toSeq: number };
  rejectCode?: string;
}

/** One evidence-stream entry (contract §4). */
export interface EvidenceEventJson {
  seq: number;
  source: string;
  payload: unknown;
}

export const PROTOCOL_VERSION = 2;

/** agent-side execution timeout guard default (contract §2.1) */
export const DEFAULT_TIMEOUT_MS = 30000;

/** evidence buffer bounds (contract §5): whichever is hit first */
export const MAX_EVENTS = 10000;
export const MAX_EVENT_BYTES = 32 * 1024 * 1024;

/** per-page / per-batch event cap (contract §4) */
export const EVENT_BATCH_LIMIT = 200;

/** request body cap both directions (contract §8); event batches stay below */
export const MAX_BODY_BYTES = 1024 * 1024;
export const EVENT_BATCH_MAX_BYTES = 768 * 1024;

/** tool-layer error code (contract §12.8) */
export const TOOL_ERROR_CODE = -1;
/** agent timeout error code (contract §12.8) */
export const TIMEOUT_ERROR_CODE = -2;
