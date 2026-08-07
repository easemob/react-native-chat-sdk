/**
 * API 注册表条目：API 名称 → 调用的映射必须人工注册（RN 无运行时反射）。
 */
export interface ApiEntry {
  /** 全限定名，如 'ChatManager.sendMessage' */
  name: string;
  /** 分组名（manager 类名），如 'ChatManager' */
  group: string;
  description: string;
  /** 必填字段 JSON 模板（不含可选参数） */
  paramsTemplate: string;
  /** JSON → TS 对象 → 调真实 API → 结果序列化（返回值会进入 result.data） */
  invoke: (params: Record<string, any>) => Promise<any>;
}
