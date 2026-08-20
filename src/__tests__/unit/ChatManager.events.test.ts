/**
 * Tests for `ChatManager` event dispatch: native message events are decoded
 * from plain maps into model objects and fanned out to the registered
 * `ChatMessageEventListener`s. Messages whose body type is not supported are
 * filtered out before reaching app code.
 */

import { eventEmitter } from '../../__specs__';
import { ChatManager } from '../../ChatManager';
import type { ChatMessageEventListener } from '../../ChatEvents';
import { ChatMessage, ChatTextMessageBody } from '../../common/ChatMessage';
import type { NativeEventEmitter } from 'react-native';
import {
  MTonConversationHasRead,
  MTonMessagesRead,
  MTonMessagesReceived,
  MTonMessagesRecalledInfo,
} from '../../__internal__/Consts';
import { emitNativeEvent } from '../helpers/emitter';

const NATIVE_TEXT_MESSAGE = {
  from: 'peer1',
  to: 'me',
  conversationId: 'peer1',
  direction: 'rec',
  chatType: 0,
  msgId: 'm1',
  body: { type: 'txt', content: 'hello' },
};

describe('ChatManager event dispatch', () => {
  let manager: ChatManager;

  beforeEach(() => {
    manager = new ChatManager();
    manager.setNativeListener(eventEmitter as unknown as NativeEventEmitter);
  });

  afterEach(() => {
    manager.removeAllMessageListener();
  });

  test('onMessagesReceived decodes native maps and fans out ChatMessage models', () => {
    const listener: ChatMessageEventListener = {
      onMessagesReceived: jest.fn(),
    };
    manager.addMessageListener(listener);

    emitNativeEvent(MTonMessagesReceived, [NATIVE_TEXT_MESSAGE]);

    expect(listener.onMessagesReceived).toHaveBeenCalledTimes(1);
    const list = (listener.onMessagesReceived as jest.Mock).mock
      .calls[0]![0] as ChatMessage[];
    expect(list).toHaveLength(1);
    expect(list[0]).toBeInstanceOf(ChatMessage);
    expect(list[0]!.from).toBe('peer1');
    expect(list[0]!.body).toBeInstanceOf(ChatTextMessageBody);
    expect((list[0]!.body as ChatTextMessageBody).content).toBe('hello');
  });

  test('messages with an unsupported body type are filtered out', () => {
    const listener: ChatMessageEventListener = {
      onMessagesReceived: jest.fn(),
    };
    manager.addMessageListener(listener);

    emitNativeEvent(MTonMessagesReceived, [
      { ...NATIVE_TEXT_MESSAGE, msgId: 'm2', body: { type: 'voip' } },
      NATIVE_TEXT_MESSAGE,
    ]);

    const list = (listener.onMessagesReceived as jest.Mock).mock
      .calls[0]![0] as ChatMessage[];
    expect(list).toHaveLength(1);
    expect(list[0]!.msgId).toBe('m1');
  });

  test('events are dropped without decoding when no listener is registered', () => {
    expect(() =>
      emitNativeEvent(MTonMessagesReceived, [NATIVE_TEXT_MESSAGE])
    ).not.toThrow();
  });

  test('a removed message listener is no longer notified', () => {
    const listener: ChatMessageEventListener = {
      onMessagesRead: jest.fn(),
    };
    manager.addMessageListener(listener);
    manager.removeMessageListener(listener);

    emitNativeEvent(MTonMessagesRead, [NATIVE_TEXT_MESSAGE]);

    expect(listener.onMessagesRead).not.toHaveBeenCalled();
  });

  test('onConversationHasRead forwards from and to to onConversationRead', () => {
    const listener: ChatMessageEventListener = {
      onConversationRead: jest.fn(),
    };
    manager.addMessageListener(listener);

    emitNativeEvent(MTonConversationHasRead, { from: 'peer1', to: 'me' });

    expect(listener.onConversationRead).toHaveBeenCalledWith('peer1', 'me');
  });

  test('onMessagesRecalledInfo decodes recalled info entries', () => {
    const listener: ChatMessageEventListener = {
      onMessagesRecalledInfo: jest.fn(),
    };
    manager.addMessageListener(listener);

    emitNativeEvent(MTonMessagesRecalledInfo, [
      {
        recalledMessage: NATIVE_TEXT_MESSAGE,
        recalledBy: 'admin',
        recalledExt: 'spam',
        recalledMessageId: 'm1',
      },
    ]);

    expect(listener.onMessagesRecalledInfo).toHaveBeenCalledTimes(1);
    const list = (listener.onMessagesRecalledInfo as jest.Mock).mock
      .calls[0]![0] as any[];
    expect(list).toHaveLength(1);
    expect(list[0].recalledMessageId).toBe('m1');
    expect(list[0].recalledBy).toBe('admin');
    expect(list[0].recalledExt).toBe('spam');
    expect(list[0].recalledMessage).toBeInstanceOf(ChatMessage);
  });
});
