import { Factory } from '../../__internal__/Factory';
import {
  installFakeChatClient,
  resetChatClient,
} from '../helpers/mockChatClient';

describe('Factory', () => {
  beforeEach(resetChatClient);
  afterEach(resetChatClient);

  describe('create', () => {
    test('forwards constructor arguments to the class', () => {
      class Greeter {
        constructor(
          public readonly greeting: string,
          public readonly times: number
        ) {}
      }

      const instance = Factory.create(Greeter, 'hello', 3);

      expect(instance).toBeInstanceOf(Greeter);
      expect(instance.greeting).toBe('hello');
      expect(instance.times).toBe(3);
    });
  });

  describe('getChatClient / setChatClient', () => {
    test('throws when no client has been initialized', () => {
      expect(() => Factory.getChatClient()).toThrow(
        'ChatClient has not been initialized.'
      );
    });

    test('returns the same instance previously installed via setChatClient', () => {
      const fake = installFakeChatClient({ currentUserName: 'tester' });

      expect(Factory.getChatClient()).toBe(fake);
    });
  });

  describe('set / get by name', () => {
    test('get returns null for an unknown name (once t has been initialized)', () => {
      // Initialize the internal Set via a set() call first, then ask for a
      // name that was never set.
      Factory.set('seed', { id: 1 });

      expect(Factory.get('does-not-exist')).toBeNull();
    });

    /**
     * Documents current broken behavior: `Factory.set` stores the value as a
     * property on the underlying `Set` instance, but `Factory.get` guards with
     * `Factory.t.has(name)` (Set membership), which never sees ad-hoc
     * properties. As a result, a plain `set` followed by `get` for the same
     * name returns `null`.
     *
     * If `set`/`get` is fixed to actually round-trip the value, update this
     * test to assert that `get` returns the stored instance.
     */
    test('documents broken Factory.set: get returns null even after set', () => {
      const obj = { token: 'abc' };
      Factory.set('greeting', obj);

      expect(Factory.get<typeof obj>('greeting')).toBeNull();
    });
  });
});
