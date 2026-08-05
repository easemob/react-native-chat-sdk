import type { ApiEntry } from './api_entry';
import { chatApis } from './apis/chat';
import { groupApis } from './apis/group';
import { contactApis } from './apis/contact';

/**
 * 进入搜索/调用页的 API 全量清单。
 * 注意：ChatClient.init / login / logout 为页面专用，不在此注册。
 */
export const ALL_APIS: ApiEntry[] = [...chatApis, ...groupApis, ...contactApis];

export function findApi(name: string): ApiEntry | undefined {
  return ALL_APIS.find((e) => e.name === name);
}
