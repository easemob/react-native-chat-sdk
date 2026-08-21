/**
 * Tests for `BaseManager` send-callback routing: send-style APIs report
 * progress / success / error through a per-call callback object, which the
 * base class wires to native events keyed by local message id (or by group
 * id + file path for group shared files). Success and error are terminal and
 * remove the subscription; progress keeps it alive.
 */

import { eventEmitter } from '../../__specs__';
import { BaseManager } from '../../__internal__/Base';
import {
  MTdownloadGroupSharedFile,
  MTonMessageError,
  MTonMessageProgressUpdate,
  MTonMessageSuccess,
  MTsendMessage,
} from '../../__internal__/Consts';
import { ChatError } from '../../common/ChatError';
import type { ChatGroupFileStatusCallback } from '../../common/ChatGroup';
import {
  ChatMessage,
  type ChatMessageStatusCallback,
} from '../../common/ChatMessage';
import {
  emitNativeEvent,
  getAddListenerMock,
  getEmitterSubscription,
} from '../helpers/emitter';
import {
  installFakeChatClient,
  resetChatClient,
} from '../helpers/mockChatClient';

/**
 * Minimal subclass that exposes the protected static routing helpers and
 * lets tests attach the mocked emitter.
 */
class TestManager extends BaseManager {
  public attachEmitter(): void {
    this._eventEmitter = eventEmitter as any;
  }
  public registerMessageCallback(
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): void {
    BaseManager.handleMessageCallback(MTsendMessage, this, message, callback);
  }
  public registerGroupFileCallback(
    groupId: string,
    filePath: string,
    callback?: ChatGroupFileStatusCallback
  ): void {
    BaseManager.handleGroupFileCallback(
      MTdownloadGroupSharedFile,
      this,
      groupId,
      filePath,
      callback
    );
  }
}

function makeMessage(): ChatMessage {
  return ChatMessage.createTextMessage('peer1', 'hello');
}

function makeMessageCallback(): jest.Mocked<ChatMessageStatusCallback> {
  return {
    onProgress: jest.fn(),
    onError: jest.fn(),
    onSuccess: jest.fn(),
  };
}

describe('BaseManager.handleMessageCallback', () => {
  let manager: TestManager;

  beforeEach(() => {
    installFakeChatClient({ currentUserName: 'me' });
    manager = new TestManager();
    manager.attachEmitter();
  });

  afterEach(() => {
    resetChatClient();
  });

  test('success event invokes onSuccess with a decoded ChatMessage and removes the subscription', () => {
    const msg = makeMessage();
    const callback = makeMessageCallback();
    manager.registerMessageCallback(msg, callback);

    emitNativeEvent(MTsendMessage, {
      localTime: msg.localTime,
      callbackType: MTonMessageSuccess,
      message: {
        msgId: 'server-m1',
        body: { type: 'txt', content: 'hello' },
      },
    });

    expect(callback.onSuccess).toHaveBeenCalledTimes(1);
    const delivered = callback.onSuccess.mock.calls[0]![0];
    expect(delivered).toBeInstanceOf(ChatMessage);
    expect(getEmitterSubscription(MTsendMessage)?.remove).toHaveBeenCalledTimes(
      1
    );
    expect(callback.onError).not.toHaveBeenCalled();
  });

  test('error event invokes onError with localMsgId and ChatError, then removes the subscription', () => {
    const msg = makeMessage();
    const callback = makeMessageCallback();
    manager.registerMessageCallback(msg, callback);

    emitNativeEvent(MTsendMessage, {
      localTime: msg.localTime,
      callbackType: MTonMessageError,
      error: { code: 500, description: 'send failed' },
    });

    expect(callback.onError).toHaveBeenCalledTimes(1);
    const [localMsgId, err] = callback.onError.mock.calls[0]!;
    expect(localMsgId).toBe(msg.localMsgId);
    expect(err).toBeInstanceOf(ChatError);
    expect((err as ChatError).code).toBe(500);
    expect(getEmitterSubscription(MTsendMessage)?.remove).toHaveBeenCalledTimes(
      1
    );
    expect(callback.onSuccess).not.toHaveBeenCalled();
  });

  test('progress event invokes onProgress and keeps the subscription alive', () => {
    const msg = makeMessage();
    const callback = makeMessageCallback();
    manager.registerMessageCallback(msg, callback);

    emitNativeEvent(MTsendMessage, {
      localTime: msg.localTime,
      callbackType: MTonMessageProgressUpdate,
      progress: 42,
    });

    expect(callback.onProgress).toHaveBeenCalledWith(msg.localMsgId, 42);
    expect(
      getEmitterSubscription(MTsendMessage)?.remove
    ).not.toHaveBeenCalled();
    expect(callback.onSuccess).not.toHaveBeenCalled();
    expect(callback.onError).not.toHaveBeenCalled();
  });

  test('events for a different localMsgId do not trigger the callback', () => {
    const msg = makeMessage();
    const callback = makeMessageCallback();
    manager.registerMessageCallback(msg, callback);

    emitNativeEvent(MTsendMessage, {
      localTime: msg.localTime + 1,
      callbackType: MTonMessageSuccess,
      message: { msgId: 'server-other' },
    });

    expect(callback.onSuccess).not.toHaveBeenCalled();
    expect(callback.onError).not.toHaveBeenCalled();
    expect(callback.onProgress).not.toHaveBeenCalled();
    expect(
      getEmitterSubscription(MTsendMessage)?.remove
    ).not.toHaveBeenCalled();
  });

  test('no subscription is created when the callback is omitted', () => {
    const msg = makeMessage();
    manager.registerMessageCallback(msg, undefined);

    const registeredForSend = getAddListenerMock().mock.calls.some(
      (c) => c[0] === MTsendMessage
    );
    expect(registeredForSend).toBe(false);
  });

  test('no subscription is created when the emitter was never attached', () => {
    const detached = new TestManager();
    const msg = makeMessage();
    detached.registerMessageCallback(msg, makeMessageCallback());

    const registeredForSend = getAddListenerMock().mock.calls.some(
      (c) => c[0] === MTsendMessage
    );
    expect(registeredForSend).toBe(false);
  });
});

describe('BaseManager.handleGroupFileCallback', () => {
  let manager: TestManager;

  beforeEach(() => {
    manager = new TestManager();
    manager.attachEmitter();
  });

  function makeFileCallback(): jest.Mocked<ChatGroupFileStatusCallback> {
    return {
      onProgress: jest.fn(),
      onError: jest.fn(),
      onSuccess: jest.fn(),
    };
  }

  test('success event invokes onSuccess with group id and file path, then removes the subscription', () => {
    const callback = makeFileCallback();
    manager.registerGroupFileCallback('g1', '/tmp/a.zip', callback);

    emitNativeEvent(MTdownloadGroupSharedFile, {
      groupId: 'g1',
      filePath: '/tmp/a.zip',
      callbackType: MTonMessageSuccess,
    });

    expect(callback.onSuccess).toHaveBeenCalledWith('g1', '/tmp/a.zip');
    expect(
      getEmitterSubscription(MTdownloadGroupSharedFile)?.remove
    ).toHaveBeenCalledTimes(1);
  });

  test('error event invokes onError with a ChatError, then removes the subscription', () => {
    const callback = makeFileCallback();
    manager.registerGroupFileCallback('g1', '/tmp/a.zip', callback);

    emitNativeEvent(MTdownloadGroupSharedFile, {
      groupId: 'g1',
      filePath: '/tmp/a.zip',
      callbackType: MTonMessageError,
      error: { code: 604, description: 'file not found' },
    });

    expect(callback.onError).toHaveBeenCalledTimes(1);
    const [gid, fp, err] = callback.onError.mock.calls[0]!;
    expect(gid).toBe('g1');
    expect(fp).toBe('/tmp/a.zip');
    expect(err).toBeInstanceOf(ChatError);
    expect(
      getEmitterSubscription(MTdownloadGroupSharedFile)?.remove
    ).toHaveBeenCalledTimes(1);
  });

  test('progress event invokes onProgress and keeps the subscription alive', () => {
    const callback = makeFileCallback();
    manager.registerGroupFileCallback('g1', '/tmp/a.zip', callback);

    emitNativeEvent(MTdownloadGroupSharedFile, {
      groupId: 'g1',
      filePath: '/tmp/a.zip',
      callbackType: MTonMessageProgressUpdate,
      progress: 77,
    });

    expect(callback.onProgress).toHaveBeenCalledWith('g1', '/tmp/a.zip', 77);
    expect(
      getEmitterSubscription(MTdownloadGroupSharedFile)?.remove
    ).not.toHaveBeenCalled();
  });

  test('events for another file of the same group do not trigger the callback', () => {
    const callback = makeFileCallback();
    manager.registerGroupFileCallback('g1', '/tmp/a.zip', callback);

    emitNativeEvent(MTdownloadGroupSharedFile, {
      groupId: 'g1',
      filePath: '/tmp/b.zip',
      callbackType: MTonMessageSuccess,
    });

    expect(callback.onSuccess).not.toHaveBeenCalled();
    expect(
      getEmitterSubscription(MTdownloadGroupSharedFile)?.remove
    ).not.toHaveBeenCalled();
  });
});
