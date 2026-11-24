import {
  EVENT_BATCH_LIMIT,
  EVENT_BATCH_MAX_BYTES,
  MAX_EVENT_BYTES,
  MAX_EVENTS,
  type EvidenceEventJson,
} from './types';

/** UTF-8 byte length without TextEncoder (not guaranteed in Hermes). */
export function utf8ByteLength(s: string): number {
  let bytes = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code < 0x80) {
      bytes += 1;
    } else if (code < 0x800) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // high surrogate: the pair encodes one code point as 4 bytes
      bytes += 4;
      i++;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

interface StoredEvent extends EvidenceEventJson {
  bytes: number;
}

/**
 * Evidence ring buffer (contract §4/§5). Listener callbacks call [append]
 * synchronously so a callback that fires before an assertion is already
 * visible in the stream with its original seq. `seq` is a process-global
 * monotonically increasing integer starting at 1.
 *
 * Bounded by entry count and UTF-8 bytes, whichever is hit first; overflow
 * drops the oldest events, advances firstAvailableSeq and marks the store
 * degraded (irreversible). The store is independent of the UI log.
 */
export class EvidenceStore {
  private readonly maxEntries: number;
  private readonly maxBytes: number;
  private events: StoredEvent[] = [];
  private totalBytes = 0;
  private _lastSeq = 0;
  private _degraded = false;

  constructor(opts: { maxEntries?: number; maxBytes?: number } = {}) {
    this.maxEntries = opts.maxEntries ?? MAX_EVENTS;
    this.maxBytes = opts.maxBytes ?? MAX_EVENT_BYTES;
  }

  /** seq of the oldest retained event (lastSeq + 1 when empty) */
  get firstAvailableSeq(): number {
    const first = this.events[0];
    return first === undefined ? this._lastSeq + 1 : first.seq;
  }

  /** seq of the newest event (0 when nothing was appended yet) */
  get lastSeq(): number {
    return this._lastSeq;
  }

  get degraded(): boolean {
    return this._degraded;
  }

  get count(): number {
    return this.events.length;
  }

  /** Synchronously enqueue one event; returns it with the assigned seq. */
  append(source: string, payload: unknown): EvidenceEventJson {
    const event: StoredEvent = {
      seq: this._lastSeq + 1,
      source,
      payload,
      bytes: 0,
    };
    event.bytes = utf8ByteLength(
      JSON.stringify({ seq: event.seq, source, payload })
    );
    this._lastSeq = event.seq;
    this.events.push(event);
    this.totalBytes += event.bytes;
    while (
      this.events.length > this.maxEntries ||
      this.totalBytes > this.maxBytes
    ) {
      const dropped = this.events.shift();
      if (dropped === undefined) {
        break;
      }
      this.totalBytes -= dropped.bytes;
      this._degraded = true;
    }
    return event;
  }

  /** Events with seq strictly after `afterSeq`, at most `limit`. */
  query(afterSeq: number, limit: number = EVENT_BATCH_LIMIT): StoredEvent[] {
    const out: StoredEvent[] = [];
    for (const e of this.events) {
      if (e.seq > afterSeq) {
        out.push(e);
        if (out.length >= limit) {
          break;
        }
      }
    }
    return out;
  }

  /**
   * Events with seq strictly after `afterSeq`, capped by count and by an
   * approximate serialized-byte budget so one /v1/events POST stays well
   * below the 1 MiB body cap (contract §8).
   */
  queryBatch(
    afterSeq: number,
    limit: number = EVENT_BATCH_LIMIT,
    maxBytes: number = EVENT_BATCH_MAX_BYTES
  ): StoredEvent[] {
    const out: StoredEvent[] = [];
    let bytes = 0;
    for (const e of this.query(afterSeq)) {
      if (out.length >= limit || bytes + e.bytes > maxBytes) {
        break;
      }
      out.push(e);
      bytes += e.bytes;
    }
    return out;
  }
}
