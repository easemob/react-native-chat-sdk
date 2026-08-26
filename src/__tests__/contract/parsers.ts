import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../../..');

export interface SymbolValue {
  symbol: string;
  value: string;
}

export interface SymbolIntValue {
  symbol: string;
  intValue: number;
}

export interface MethodMapEntry {
  key: string;
  valueSymbol: string;
}

const TS_CONSTS_PATH = path.join(REPO_ROOT, 'src/__internal__/Consts.ts');
const JAVA_CONSTS_PATH = path.join(
  REPO_ROOT,
  'modules/java/com/chatsdk/common/ExtSdkMethodType.java'
);
const OBJC_HEADER_PATH = path.join(
  REPO_ROOT,
  'modules/objc/common/ExtSdkMethodTypeObjc.h'
);
const OBJC_M_PATH = path.join(
  REPO_ROOT,
  'modules/objc/common/ExtSdkMethodTypeObjc.m'
);
const OBJC_RN_MM_PATH = path.join(
  REPO_ROOT,
  'modules/objc/rn/ExtSdkApiObjcRN.mm'
);

function readFile(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

function stripDeprecated(src: string): string {
  return src
    .split('\n')
    .filter((line) => !line.includes('// deprecated'))
    .join('\n');
}

export function parseTsConsts(): SymbolValue[] {
  const src = stripDeprecated(readFile(TS_CONSTS_PATH));
  const re = /^\s*export\s+const\s+MT(\w+)\s*=\s*\n?\s*['"]([^'"]+)['"]/gm;
  const out: SymbolValue[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    out.push({ symbol: m[1]!, value: m[2]! });
  }
  return out;
}

export function parseJavaConsts(): SymbolValue[] {
  const src = stripDeprecated(readFile(JAVA_CONSTS_PATH));
  const re = /public\s+static\s+final\s+String\s+(\w+)\s*=\s*"([^"]+)"/g;
  const out: SymbolValue[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    out.push({ symbol: m[1]!, value: m[2]! });
  }
  return out;
}

export function parseObjcHeaderKeys(): SymbolValue[] {
  const src = stripDeprecated(readFile(OBJC_HEADER_PATH));
  const re =
    /static\s+NSString\s*\*\s*_Nonnull\s+const\s+(ExtSdkMethodKey\w+?)\s*=\s*@"([^"]+)"/g;
  const out: SymbolValue[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    // Exclude *Value matches (shouldn't happen since these are NSString not int,
    // but symbol shouldn't end with Value for keys).
    const symbol = m[1]!;
    if (symbol.endsWith('Value')) continue;
    out.push({ symbol, value: m[2]! });
  }
  return out;
}

export function parseObjcHeaderValues(): SymbolIntValue[] {
  const src = stripDeprecated(readFile(OBJC_HEADER_PATH));
  const re = /static\s+const\s+int\s+(ExtSdkMethodKey\w+Value)\s*=\s*(\d+)/g;
  const out: SymbolIntValue[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    out.push({ symbol: m[1]!, intValue: parseInt(m[2]!, 10) });
  }
  return out;
}

export function parseObjcMethodMap(): MethodMapEntry[] {
  const src = stripDeprecated(readFile(OBJC_M_PATH));
  const re =
    /(ExtSdkMethodKey\w+?)\s*:\s*@\(\s*(ExtSdkMethodKey\w+Value)\s*\)/g;
  const out: MethodMapEntry[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const key = m[1]!;
    if (key.endsWith('Value')) continue;
    out.push({ key, valueSymbol: m[2]! });
  }
  return out;
}

export function resolveRnSupportedEventValues(): string[] {
  const src = readFile(OBJC_RN_MM_PATH);
  const startIdx = src.indexOf('supportedEvents');
  if (startIdx < 0) return [];
  const endIdx = src.indexOf('return ret', startIdx);
  if (endIdx < 0) return [];
  const slice = src.substring(startIdx, endIdx);
  const symbolRe = /ExtSdkMethodKey\w+/g;
  const symbols = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = symbolRe.exec(slice)) !== null) {
    const s = m[0];
    if (s.endsWith('Value')) continue;
    // Skip the literal "supportedEvents" word matches — but only ExtSdkMethodKey* will match.
    symbols.add(s);
  }
  const keys = parseObjcHeaderKeys();
  const symbolToValue = new Map<string, string>();
  for (const k of keys) symbolToValue.set(k.symbol, k.value);
  const result: string[] = [];
  for (const sym of symbols) {
    const v = symbolToValue.get(sym);
    if (v !== undefined) result.push(v);
  }
  return result;
}

/**
 * 收集 `src/` 下的所有 TS 源文件，排除测试目录和常量定义文件本身，
 * 以便事件接线检查只看到真实的使用位置。
 */
function collectTsSourceFiles(): string[] {
  const srcRoot = path.join(REPO_ROOT, 'src');
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '__tests__') continue;
        walk(full);
      } else if (entry.name.endsWith('.ts')) {
        if (full === TS_CONSTS_PATH) continue;
        out.push(full);
      }
    }
  };
  walk(srcRoot);
  return out;
}

/**
 * 返回引用了指定常量符号名（例如 `MTonMessagesReceived`）的 TS 源文件
 * （相对于仓库根目录）。匹配按单词边界进行，因此 `MTonMessageRead`
 * 不会被计入 `MTonMessageReadAck` 的引用。
 */
export function findTsConstReferences(symbol: string): string[] {
  const re = new RegExp(`\\b${symbol}\\b`);
  const hits: string[] = [];
  for (const file of collectTsSourceFiles()) {
    if (re.test(readFile(file))) {
      hits.push(path.relative(REPO_ROOT, file));
    }
  }
  return hits;
}
