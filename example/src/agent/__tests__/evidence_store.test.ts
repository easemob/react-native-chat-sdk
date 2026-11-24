import { EvidenceStore, utf8ByteLength } from '../evidence_store';

describe('utf8ByteLength', () => {
  it('counts ASCII as 1 byte per char', () => {
    expect(utf8ByteLength('abc')).toBe(3);
  });

  it('counts multi-byte characters (BMP and surrogate pairs)', () => {
    expect(utf8ByteLength('中')).toBe(3);
    expect(utf8ByteLength('🙂')).toBe(4);
    expect(utf8ByteLength('a中🙂')).toBe(1 + 3 + 4);
  });
});

describe('EvidenceStore', () => {
  it('assigns seq monotonically from 1', () => {
    const store = new EvidenceStore();
    expect(store.append('a', {}).seq).toBe(1);
    expect(store.append('b', {}).seq).toBe(2);
    expect(store.lastSeq).toBe(2);
    expect(store.firstAvailableSeq).toBe(1);
    expect(store.degraded).toBe(false);
  });

  it('empty store reports firstAvailableSeq = lastSeq + 1', () => {
    const store = new EvidenceStore();
    expect(store.lastSeq).toBe(0);
    expect(store.firstAvailableSeq).toBe(1);
  });

  it('query uses an exclusive cursor and honors the limit', () => {
    const store = new EvidenceStore();
    for (let i = 0; i < 5; i++) {
      store.append('s', { i });
    }
    expect(store.query(0).map((e) => e.seq)).toEqual([1, 2, 3, 4, 5]);
    expect(store.query(2).map((e) => e.seq)).toEqual([3, 4, 5]);
    expect(store.query(0, 2).map((e) => e.seq)).toEqual([1, 2]);
    expect(store.query(5)).toEqual([]);
  });

  it('entry-count overflow drops the oldest, advances firstAvailableSeq, degrades', () => {
    const store = new EvidenceStore({ maxEntries: 3 });
    for (let i = 0; i < 5; i++) {
      store.append('s', { i });
    }
    expect(store.count).toBe(3);
    expect(store.degraded).toBe(true);
    expect(store.firstAvailableSeq).toBe(3);
    expect(store.query(0).map((e) => e.seq)).toEqual([3, 4, 5]);
  });

  it('byte-budget overflow degrades as well', () => {
    const store = new EvidenceStore({ maxBytes: 200 });
    // Each event serializes to ~50 bytes; a few pushes exceed 200.
    for (let i = 0; i < 10; i++) {
      store.append('source', { padding: 'xxxxxxxxxxxxxxxxxxxx' });
    }
    expect(store.degraded).toBe(true);
    expect(store.count).toBeLessThan(10);
    expect(store.firstAvailableSeq).toBeGreaterThan(1);
  });

  it('degradation is irreversible', () => {
    const store = new EvidenceStore({ maxEntries: 1 });
    store.append('a', {});
    store.append('b', {});
    expect(store.degraded).toBe(true);
    expect(store.query(0).map((e) => e.seq)).toEqual([2]);
    store.append('c', {});
    expect(store.degraded).toBe(true);
  });

  it('queryBatch caps by count and by byte budget', () => {
    const store = new EvidenceStore();
    for (let i = 0; i < 10; i++) {
      store.append('s', { padding: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' });
    }
    expect(store.queryBatch(0, 3).length).toBe(3);
    const byteCapped = store.queryBatch(0, 10, 150);
    expect(byteCapped.length).toBeGreaterThan(0);
    expect(byteCapped.length).toBeLessThan(10);
    // A batch never starts empty when events are pending, unless a single
    // event alone exceeds the budget.
    const tiny = store.queryBatch(0, 10, 1);
    expect(tiny.length).toBe(0);
  });
});
