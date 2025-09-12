import type { ChatExceptionEventListener } from '../ChatEvents';
import { chatlog } from '../common/ChatConst';
import type { ChatException } from '../common/ChatError';

/**
 * Handle internal errors. The upper layer gets errors by adding a listener. The except event will be called back when an except occurs.
 */
export class ExceptionHandler {
  private static TAG = 'ErrorRegister';
  private static _instance: ExceptionHandler;
  private _exceptListeners: Set<ChatExceptionEventListener>;
  private constructor() {
    this._exceptListeners = new Set();
  }
  public static getInstance(): ExceptionHandler {
    if (!ExceptionHandler._instance) {
      ExceptionHandler._instance = new ExceptionHandler();
    }
    return ExceptionHandler._instance;
  }
  public get listeners(): Set<ChatExceptionEventListener> {
    return this._exceptListeners;
  }
  /**
   * SDK internal call.
   */
  public sendExcept(params: {
    except: ChatException;
    from?: string;
    extra?: Record<string, string>;
  }): void {
    chatlog.log(`${ExceptionHandler.TAG}: sendError: `, params);
    this._exceptListeners.forEach((listener) => {
      listener.onExcept(params);
    });
  }
}
