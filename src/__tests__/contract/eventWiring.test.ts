/**
 * Contract tests for TS-side event wiring: a native event constant is only
 * useful if the TS layer actually subscribes to it (or otherwise references
 * it). An orphaned `MTon*` const means native emits an event that never
 * reaches app code.
 *
 * Also guards against value collisions: two symbols mapping to the same
 * string value would silently merge two distinct native events/methods.
 */

import {
  findTsConstReferences,
  parseJavaConsts,
  parseObjcHeaderKeys,
  parseTsConsts,
  type SymbolValue,
} from './parsers';

/**
 * Events that are intentionally defined as consts but not wired in TS.
 * Currently empty: the legacy ack events `MTonMessageReadAck` /
 * `MTonMessageDeliveryAck` used to live here and were marked deprecated on
 * 2026-08-20 in all three languages (TS / Java / ObjC), which excludes them
 * from this check. Prefer deprecating an event over allowlisting it; extend
 * this list only with a documented reason.
 */
const UNWIRED_EVENT_ALLOWLIST = new Set<string>([]);

function findDuplicateValues(entries: SymbolValue[]): Map<string, string[]> {
  const byValue = new Map<string, string[]>();
  for (const e of entries) {
    const list = byValue.get(e.value) ?? [];
    list.push(e.symbol);
    byValue.set(e.value, list);
  }
  const dups = new Map<string, string[]>();
  for (const [value, symbols] of byValue) {
    if (symbols.length > 1) {
      dups.set(value, symbols);
    }
  }
  return dups;
}

describe('contract: TS-side event wiring and const integrity', () => {
  test('every non-deprecated MTon* event const is referenced in src', () => {
    const tsEvents = parseTsConsts().filter((c) => c.symbol.startsWith('on'));
    const orphaned: { symbol: string; value: string }[] = [];
    for (const c of tsEvents) {
      const fullName = `MT${c.symbol}`;
      if (UNWIRED_EVENT_ALLOWLIST.has(fullName)) continue;
      if (findTsConstReferences(fullName).length === 0) {
        orphaned.push(c);
      }
    }
    if (orphaned.length > 0) {
      const lines = orphaned
        .map((m) => `  MT${m.symbol} = '${m.value}'`)
        .join('\n');
      throw new Error(
        `MTon* event consts not referenced anywhere in src (${orphaned.length} of ${tsEvents.length}):\n${lines}\n` +
          'Either wire the event (addListener / dispatch) or add it to UNWIRED_EVENT_ALLOWLIST with a reason.'
      );
    }
  });

  test('no duplicate values among TS consts, Java consts and ObjC keys', () => {
    const sources: { name: string; entries: SymbolValue[] }[] = [
      { name: 'TS Consts.ts', entries: parseTsConsts() },
      { name: 'Java ExtSdkMethodType.java', entries: parseJavaConsts() },
      {
        name: 'ObjC ExtSdkMethodTypeObjc.h',
        entries: parseObjcHeaderKeys(),
      },
    ];
    const problems: string[] = [];
    for (const s of sources) {
      for (const [value, symbols] of findDuplicateValues(s.entries)) {
        problems.push(`  [${s.name}] '${value}' <- ${symbols.join(', ')}`);
      }
    }
    if (problems.length > 0) {
      throw new Error(
        `Duplicate const values detected:\n${problems.join('\n')}`
      );
    }
  });
});
