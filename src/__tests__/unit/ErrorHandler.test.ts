import type { ChatExceptionEventListener } from '../../ChatEvents';
import { ExceptionHandler } from '../../__internal__/ErrorHandler';
import { ChatException } from '../../common/ChatError';

describe('ExceptionHandler', () => {
  beforeEach(() => {
    ExceptionHandler.getInstance().listeners.clear();
  });

  test('getInstance returns the same singleton instance', () => {
    const a = ExceptionHandler.getInstance();
    const b = ExceptionHandler.getInstance();

    expect(a).toBe(b);
  });

  test('sendExcept notifies all registered listeners and forwards params as-is', () => {
    const handler = ExceptionHandler.getInstance();
    const listener1: ChatExceptionEventListener = { onExcept: jest.fn() };
    const listener2: ChatExceptionEventListener = { onExcept: jest.fn() };
    handler.listeners.add(listener1);
    handler.listeners.add(listener2);

    const params = {
      except: new ChatException({ code: 42, description: 'boom' }),
      from: 'unit-test',
      extra: { key: 'value' },
    };

    handler.sendExcept(params);

    expect(listener1.onExcept).toHaveBeenCalledTimes(1);
    expect(listener1.onExcept).toHaveBeenCalledWith(params);
    expect(listener2.onExcept).toHaveBeenCalledTimes(1);
    expect(listener2.onExcept).toHaveBeenCalledWith(params);
  });

  test('sendExcept does not throw when there are no listeners', () => {
    const handler = ExceptionHandler.getInstance();

    expect(() =>
      handler.sendExcept({
        except: new ChatException({ code: 1, description: 'no listeners' }),
      })
    ).not.toThrow();
  });

  test('a removed listener is not invoked on subsequent sendExcept calls', () => {
    const handler = ExceptionHandler.getInstance();
    const listener: ChatExceptionEventListener = { onExcept: jest.fn() };
    handler.listeners.add(listener);

    handler.listeners.delete(listener);

    handler.sendExcept({
      except: new ChatException({ code: 2, description: 'after delete' }),
    });

    expect(listener.onExcept).not.toHaveBeenCalled();
  });
});
