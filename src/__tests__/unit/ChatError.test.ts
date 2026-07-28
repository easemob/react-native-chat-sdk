import { ChatError, ChatException } from '../../common/ChatError';

describe('ChatError', () => {
  test('is a subclass of Error with correct code and description fields', () => {
    const err = new ChatError({
      code: 101,
      description: 'something went wrong',
    });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ChatError);
    expect(err.code).toBe(101);
    expect(err.description).toBe('something went wrong');
  });

  test('message equals description', () => {
    const description = 'network unavailable';
    const err = new ChatError({ code: 7, description });

    expect(err.message).toBe(description);
  });

  test('name is "ChatError" and instanceof ChatError holds via prototype chain', () => {
    const err = new ChatError({ code: 1, description: 'oops' });

    expect(err.name).toBe('ChatError');
    expect(err instanceof ChatError).toBe(true);
    expect(err instanceof Error).toBe(true);
    expect(Object.getPrototypeOf(err)).toBe(ChatError.prototype);
  });

  test('ChatException is a subclass of ChatError and name is "ChatException"', () => {
    const ex = new ChatException({ code: 500, description: 'fatal' });

    expect(ex).toBeInstanceOf(ChatException);
    expect(ex).toBeInstanceOf(ChatError);
    expect(ex).toBeInstanceOf(Error);
    expect(ex.name).toBe('ChatException');
    expect(ex.code).toBe(500);
    expect(ex.description).toBe('fatal');
    expect(ex.message).toBe('fatal');
  });
});
