/**
 * Contract tests for `ChatClient`: verifies that the public methods route
 * through `Native._callMethod` with the expected method name and args
 * payload shape, and that native errors are surfaced as `ChatError`.
 *
 * These tests do NOT exercise event subscription or callback wiring.
 */

import { ChatClient } from '../../ChatClient';
import { ChatError } from '../../common/ChatError';
import { ChatOptions } from '../../common/ChatOptions';
import { MTinit, MTlogin, MTlogout } from '../../__internal__/Consts';
import {
  getCallMethodMock,
  getLastCall,
  mockCallMethodOnce,
} from '../helpers/nativeMock';

describe('ChatClient call contracts', () => {
  // ChatClient is a singleton; the constructor side-effects (Factory.setChatClient,
  // setNativeListener) are exercised once when getInstance() is first called.
  // We use the same instance for all tests and rely on afterEach in setup.ts
  // (jest.clearAllMocks) to reset call history between tests.
  const client = ChatClient.getInstance();

  describe('init', () => {
    test('calls MTinit with { options } payload built from ChatOptions', async () => {
      mockCallMethodOnce({});

      const options = ChatOptions.withAppKey({
        appKey: 'easemob#demo',
        autoLogin: false,
        debugModel: true,
      });

      await client.init(options);

      const last = getLastCall();
      expect(last?.method).toBe(MTinit);
      const args = last?.args as { options: ChatOptions };
      expect(args).toEqual(
        expect.objectContaining({
          options: expect.objectContaining({
            appKey: 'easemob#demo',
          }),
        })
      );
      // The implementation deep-copies options via ChatOptions.withAppKey, so
      // the value passed to native carries the user-supplied appKey.
      expect(args.options.appKey).toBe('easemob#demo');
    });
  });

  describe('login', () => {
    test('calls MTlogin with { [MTlogin]: { username, pwdOrToken, isPassword } }', async () => {
      mockCallMethodOnce({});

      await client.login('alice', 'secret', true);

      const last = getLastCall();
      expect(last?.method).toBe(MTlogin);
      expect(last?.args).toEqual({
        [MTlogin]: {
          username: 'alice',
          pwdOrToken: 'secret',
          isPassword: true,
        },
      });
    });

    test('defaults isPassword to true when omitted', async () => {
      mockCallMethodOnce({});

      await client.login('bob', 'pw');

      const last = getLastCall();
      const inner = (last?.args as Record<string, any>)[MTlogin];
      expect(inner.isPassword).toBe(true);
      expect(inner.username).toBe('bob');
      expect(inner.pwdOrToken).toBe('pw');
    });
  });

  describe('logout', () => {
    test('calls MTlogout with { [MTlogout]: { unbindToken } }', async () => {
      mockCallMethodOnce({});

      await client.logout(false);

      const last = getLastCall();
      expect(last?.method).toBe(MTlogout);
      expect(last?.args).toEqual({
        [MTlogout]: {
          unbindToken: false,
        },
      });
    });

    test('defaults unbindDeviceToken to true when omitted', async () => {
      mockCallMethodOnce({});

      await client.logout();

      const last = getLastCall();
      const inner = (last?.args as Record<string, any>)[MTlogout];
      expect(inner.unbindToken).toBe(true);
    });
  });

  describe('native error propagation', () => {
    test('logout rejects with ChatError when native returns { error: { code, description } }', async () => {
      mockCallMethodOnce({ error: { code: 999, description: 'boom' } });

      const p = client.logout(true);

      await expect(p).rejects.toBeInstanceOf(ChatError);
      await expect(p).rejects.toMatchObject({
        code: 999,
        description: 'boom',
      });
      // Even on failure, the native bridge was called with the expected shape.
      expect(getCallMethodMock()).toHaveBeenCalledWith(MTlogout, {
        [MTlogout]: { unbindToken: true },
      });
    });
  });
});
