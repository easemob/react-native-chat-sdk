import {
  parseJavaConsts,
  parseObjcHeaderKeys,
  parseObjcHeaderValues,
  parseObjcMethodMap,
  parseTsConsts,
  resolveRnSupportedEventValues,
} from './parsers';

describe('contract: method-name parity (TS ↔ Java ↔ ObjC)', () => {
  const tsConsts = parseTsConsts();
  const javaConsts = parseJavaConsts();
  const objcKeys = parseObjcHeaderKeys();
  const objcValues = parseObjcHeaderValues();
  const objcMap = parseObjcMethodMap();
  const rnEventValues = resolveRnSupportedEventValues();

  test('sanity floor — each parser returns > 100 entries', () => {
    expect(tsConsts.length).toBeGreaterThan(100);
    expect(javaConsts.length).toBeGreaterThan(100);
    expect(objcKeys.length).toBeGreaterThan(100);
    expect(objcValues.length).toBeGreaterThan(100);
    expect(objcMap.length).toBeGreaterThan(100);
    expect(rnEventValues.length).toBeGreaterThan(100);
  });

  test('every TS MT* value is present in Java constant values', () => {
    const javaValueSet = new Set(javaConsts.map((c) => c.value));
    const missing: { symbol: string; value: string }[] = [];
    for (const c of tsConsts) {
      if (!javaValueSet.has(c.value)) {
        missing.push({ symbol: c.symbol, value: c.value });
      }
    }
    if (missing.length > 0) {
      const lines = missing
        .map((m) => `  MT${m.symbol} = '${m.value}'`)
        .join('\n');
      throw new Error(
        `Missing in Java (${missing.length} of ${tsConsts.length}):\n${lines}`
      );
    }
  });

  test('every TS MT* value is present in ObjC header key values', () => {
    const objcValueSet = new Set(objcKeys.map((c) => c.value));
    const missing: { symbol: string; value: string }[] = [];
    for (const c of tsConsts) {
      if (!objcValueSet.has(c.value)) {
        missing.push({ symbol: c.symbol, value: c.value });
      }
    }
    if (missing.length > 0) {
      const lines = missing
        .map((m) => `  MT${m.symbol} = '${m.value}'`)
        .join('\n');
      throw new Error(
        `Missing in ObjC header (${missing.length} of ${tsConsts.length}):\n${lines}`
      );
    }
  });

  test('every ObjC header key has a corresponding entry in .m methodMap', () => {
    const mappedKeys = new Set(objcMap.map((e) => e.key));
    const missing: string[] = [];
    for (const k of objcKeys) {
      if (!mappedKeys.has(k.symbol)) {
        missing.push(k.symbol);
      }
    }
    if (missing.length > 0) {
      throw new Error(
        `ObjC header keys missing from .m methodMap (${missing.length} of ${
          objcKeys.length
        }):\n${missing.map((s) => `  ${s}`).join('\n')}`
      );
    }
  });

  test('every *Value symbol in .m methodMap is defined in header (static const int)', () => {
    const definedValueSymbols = new Set(objcValues.map((v) => v.symbol));
    const missing: { key: string; valueSymbol: string }[] = [];
    for (const e of objcMap) {
      if (!definedValueSymbols.has(e.valueSymbol)) {
        missing.push({ key: e.key, valueSymbol: e.valueSymbol });
      }
    }
    if (missing.length > 0) {
      const lines = missing
        .map((m) => `  ${m.key} -> ${m.valueSymbol}`)
        .join('\n');
      throw new Error(
        `methodMap value-symbols missing from header static const int (${missing.length} of ${objcMap.length}):\n${lines}`
      );
    }
  });

  test('every TS MTon* event value appears in RN supportedEvents resolved list', () => {
    const eventSet = new Set(rnEventValues);
    const tsEvents = tsConsts.filter((c) => c.symbol.startsWith('on'));
    const missing: { symbol: string; value: string }[] = [];
    for (const c of tsEvents) {
      if (!eventSet.has(c.value)) {
        missing.push({ symbol: c.symbol, value: c.value });
      }
    }
    if (missing.length > 0) {
      const lines = missing
        .map((m) => `  MT${m.symbol} = '${m.value}'`)
        .join('\n');
      throw new Error(
        `TS MTon* events missing from RN supportedEvents (${missing.length} of ${tsEvents.length}):\n${lines}`
      );
    }
  });
});
