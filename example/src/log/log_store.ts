import RNFS from 'react-native-fs';

/**
 * 日志条目。`seq` 全局递增，AI 可据此判断顺序与完整性。
 */
export interface LogEntry {
  ts: number;
  seq: number;
  source: string;
  payload: unknown;
}

export const LOG_FILE_NAME = 'api_test.log';
export const LOG_FILE_PATH = `${RNFS.DocumentDirectoryPath}/${LOG_FILE_NAME}`;

let seq = 0;
const entries: LogEntry[] = [];
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => l());
}

/**
 * 追加一条日志：内存（悬浮面板）+ stdout（`[APITEST]` 前缀单行 JSON）+ 落盘文件，三通道同写。
 */
export function addLog(source: string, payload: unknown): LogEntry {
  const entry: LogEntry = { ts: Date.now(), seq: ++seq, source, payload };
  entries.push(entry);

  console.log(`[APITEST] ${JSON.stringify(entry)}`);
  RNFS.appendFile(LOG_FILE_PATH, `${JSON.stringify(entry)}\n`, 'utf8').catch(
    () => {
      // 落盘失败不影响主流程
    }
  );
  notify();
  return entry;
}

export function getEntries(): LogEntry[] {
  return entries.slice();
}

export function clearEntries(): void {
  entries.length = 0;
  notify();
}

export function subscribeLogs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number, w: number = 2) => String(n).padStart(w, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )}.${pad(d.getMilliseconds(), 3)}`;
}

export function formatPayload(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

/**
 * 面板展示格式：`时间戳 | 来源 | 内容`。
 * 监听器来源加方括号（如 `[ChatMessageEventListener.onMessagesReceived]`）。
 */
export function formatEntry(entry: LogEntry): string {
  const source = entry.source.includes('EventListener.')
    ? `[${entry.source}]`
    : entry.source;
  return `${formatTime(entry.ts)} | ${source} | ${formatPayload(
    entry.payload
  )}`;
}

/**
 * 超长内容折叠首尾（仅影响面板展示，复制仍是全文）。
 */
export function foldText(text: string, max: number = 400): string {
  if (text.length <= max) {
    return text;
  }
  const half = Math.floor(max / 2);
  return `${text.slice(0, half)}\n... [folded ${
    text.length - max
  } chars] ...\n${text.slice(-half)}`;
}

export function getFullLogText(): string {
  return entries.map((e) => formatEntry(e)).join('\n');
}
