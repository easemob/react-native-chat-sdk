/**
 * Reverse-channel transport client (contract §8): the host opens the HTTP
 * endpoints on the host machine; the app reaches them through `adb reverse`
 * (Android) or the simulator loopback (iOS) using the RN built-in fetch —
 * zero new dependencies.
 *
 * Endpoints (host side, all requiring `Authorization: Bearer <token>`):
 *
 * - `GET  /v1/queue?instanceId=&version=&platform=&state=&waitMs=` —
 *   long-poll one command; 200 `{"command": {...}}` / `{"command": null}` /
 *   `{"finish": true}`; 410 when the host no longer knows the instanceId
 *   (run over / host restarted) -> the agent stops polling and closes.
 * - `POST /v1/results` — `{instanceId, ...terminal envelope}`; network
 *   failures are retried with backoff, the host dedups by commandId.
 * - `POST /v1/events` — `{instanceId, firstAvailableSeq, lastSeq, degraded,
 *   events: [{seq, source, payload}]}`; same retry discipline, the host
 *   dedups by (instanceId, seq).
 */

import {
  PROTOCOL_VERSION,
  type AgentServiceState,
  type EvidenceEventJson,
  type ResultEnvelope,
} from './types';

export interface FetchResponseLike {
  status: number;
  json(): Promise<unknown>;
}

export type FetchLike = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  }
) => Promise<FetchResponseLike>;

export type QueuePoll =
  | { kind: 'command'; command: Record<string, unknown> }
  | { kind: 'empty' }
  | { kind: 'finish' }
  /** host closed the run for this instanceId (410) or rejected the token (401) */
  | { kind: 'closed' }
  /** transient network/5xx failure — caller should back off and retry */
  | { kind: 'retry' };

export type PostOutcome = 'ok' | 'closed' | 'retry';

export interface ReverseTransportOptions {
  /** e.g. http://127.0.0.1:51337 — host endpoint reached via adb reverse */
  baseUrl: string;
  token: string;
  instanceId: string;
  platform: string;
  /** long-poll hold time requested from the host; default 1000ms */
  queueWaitMs?: number;
  fetchImpl?: FetchLike;
}

export class ReverseTransport {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly instanceId: string;
  private readonly platform: string;
  private readonly queueWaitMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(opts: ReverseTransportOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.token = opts.token;
    this.instanceId = opts.instanceId;
    this.platform = opts.platform;
    this.queueWaitMs = opts.queueWaitMs ?? 1000;
    this.fetchImpl =
      opts.fetchImpl ??
      ((url, init) =>
        fetch(url, init) as unknown as Promise<FetchResponseLike>);
  }

  private headers(withBody: boolean): Record<string, string> {
    const h: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
    };
    if (withBody) {
      h['Content-Type'] = 'application/json';
    }
    return h;
  }

  /**
   * Long-poll the command queue. The first request of a process doubles as
   * the handshake: version/platform/instanceId/state ride on every queue
   * request so the host detects app restarts by instanceId change (§8).
   */
  async pollQueue(state: AgentServiceState): Promise<QueuePoll> {
    const query =
      `instanceId=${encodeURIComponent(this.instanceId)}` +
      `&version=${PROTOCOL_VERSION}` +
      `&platform=${encodeURIComponent(this.platform)}` +
      `&state=${state}` +
      `&waitMs=${this.queueWaitMs}`;
    let res: FetchResponseLike;
    try {
      res = await this.fetchImpl(`${this.baseUrl}/v1/queue?${query}`, {
        method: 'GET',
        headers: this.headers(false),
      });
    } catch {
      return { kind: 'retry' };
    }
    if (res.status === 410 || res.status === 401) {
      return { kind: 'closed' };
    }
    if (res.status !== 200) {
      return { kind: 'retry' };
    }
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      return { kind: 'retry' };
    }
    if (typeof body !== 'object' || body === null) {
      return { kind: 'retry' };
    }
    const b = body as Record<string, unknown>;
    if (b.finish === true) {
      return { kind: 'finish' };
    }
    const command = b.command;
    if (command === null || command === undefined) {
      return { kind: 'empty' };
    }
    if (typeof command === 'object') {
      return { kind: 'command', command: command as Record<string, unknown> };
    }
    return { kind: 'retry' };
  }

  /** POST the terminal envelope (contract §3). */
  async postResult(envelope: ResultEnvelope): Promise<PostOutcome> {
    return this.post('/v1/results', {
      instanceId: this.instanceId,
      ...envelope,
    });
  }

  /** POST one batch of evidence events (contract §4/§8). */
  async postEvents(batch: {
    firstAvailableSeq: number;
    lastSeq: number;
    degraded: boolean;
    events: EvidenceEventJson[];
  }): Promise<PostOutcome> {
    return this.post('/v1/events', {
      instanceId: this.instanceId,
      ...batch,
    });
  }

  private async post(
    path: string,
    body: Record<string, unknown>
  ): Promise<PostOutcome> {
    let res: FetchResponseLike;
    try {
      res = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.headers(true),
        body: JSON.stringify(body),
      });
    } catch {
      return 'retry';
    }
    if (res.status === 410 || res.status === 401) {
      return 'closed';
    }
    return res.status >= 200 && res.status < 300 ? 'ok' : 'retry';
  }
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
