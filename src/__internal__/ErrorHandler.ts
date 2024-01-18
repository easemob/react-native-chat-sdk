import type { ChatErrorEventListener } from '../ChatEvents';
import { chatlog } from '../common/ChatConst';
import type { ChatError } from '../common/ChatError';

/**
 * Handle internal errors. The upper layer gets errors by adding a listener. The error event will be called back when an error occurs.
 */
export class ErrorHandler {
  private static TAG = 'ErrorRegister';
  private static _instance: ErrorHandler;
  private _errorListeners: Set<ChatErrorEventListener>;
  private constructor() {
    this._errorListeners = new Set();
  }
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler._instance) {
      ErrorHandler._instance = new ErrorHandler();
    }
    return ErrorHandler._instance;
  }
  public get listeners(): Set<ChatErrorEventListener> {
    return this._errorListeners;
  }
  /**
   * SDK internal call.
   */
  public sendError(params: {
    error: ChatError;
    from?: string;
    extra?: Record<string, string>;
  }): void {
    chatlog.log(`${ErrorHandler.TAG}: sendError: `, params);
    this._errorListeners.forEach((listener) => {
      listener.onError(params);
    });
  }
}
