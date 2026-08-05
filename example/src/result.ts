/**
 * API 调用结果的统一形状：
 * 成功 `{"success": true, "data": ...}`（void 返回无 data），
 * 失败 `{"success": false, "error": {"code": ..., "message": ...}}`。
 */
export interface ApiResult {
  success: boolean;
  data?: unknown;
  error?: { code: number; message: string };
}

export function okResult(data?: unknown): ApiResult {
  return data === undefined ? { success: true } : { success: true, data };
}

export function errResult(e: unknown): ApiResult {
  const anyErr = e as {
    code?: unknown;
    description?: unknown;
    message?: unknown;
  };
  const code = typeof anyErr?.code === 'number' ? anyErr.code : -1;
  const message =
    typeof anyErr?.description === 'string'
      ? anyErr.description
      : typeof anyErr?.message === 'string'
        ? anyErr.message
        : String(e);
  return { success: false, error: { code, message } };
}
