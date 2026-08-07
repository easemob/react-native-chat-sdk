import { addLog } from '../log/log_store';
import { recordToJson, type AttachmentRecord } from './attachment_picker';

/**
 * 附件记录的全局单例存储（与 log_store 同构的模块级 store + 订阅）。
 * 面板开关不丢记录；与测试项零耦合——测试项从 JSON 参数拿 filePath，
 * 记录通过"复制-粘贴"流转（剪贴板契约）。
 */
const records: AttachmentRecord[] = [];
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => l());
}

/** 新记录插头部（最新在上）；同时写入主日志，AI 模式可经日志检索附件路径。 */
export function addRecord(record: AttachmentRecord): void {
  records.unshift(record);
  addLog('attachment.picked', record);
  notify();
}

export function getRecords(): AttachmentRecord[] {
  return records.slice();
}

export function clearRecords(): void {
  records.length = 0;
  notify();
}

export function subscribeRecords(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 整个记录的 JSON 数组，供"复制全部"。 */
export function getFullJson(): string {
  return `[${records.map((r) => recordToJson(r)).join(',\n')}]`;
}
