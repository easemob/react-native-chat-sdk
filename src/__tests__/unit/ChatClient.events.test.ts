/**
 * Tests for `ChatClient` event dispatch: native connection / multi-device
 * events are subscribed in `setNativeListener` and fanned out to the
 * listener sets registered by app code. Complements `ChatClient.test.ts`,
 * which intentionally covers only the call-method contracts.
 */

import { ChatClient } from '../../ChatClient';
import {
  ChatMultiDeviceEvent,
  type ChatConnectEventListener,
  type ChatMultiDeviceEventListener,
} from '../../ChatEvents';
import {
  MTonConnected,
  MTonDisconnected,
  MTonMultiDeviceEvent,
  MTonMultiDeviceEventContact,
  MTonMultiDeviceEventConversation,
  MTonMultiDeviceEventGroup,
  MTonTokenDidExpire,
  MTonTokenWillExpire,
} from '../../__internal__/Consts';
import { emitNativeEvent, getAddListenerMock } from '../helpers/emitter';

describe('ChatClient event dispatch', () => {
  // ChatClient is a singleton per jest module registry; the constructor
  // wires all managers once. Each test re-registers the client-level
  // subscriptions so the mocked emitter history reflects fresh wiring.
  const client = ChatClient.getInstance();

  beforeEach(() => {
    client.setNativeListener(client.getEventEmitter());
  });

  afterEach(() => {
    client.removeAllConnectionListener();
    client.removeAllMultiDeviceListener();
  });

  test('setNativeListener subscribes to the connection events', () => {
    const mock = getAddListenerMock();
    for (const eventName of [
      MTonConnected,
      MTonDisconnected,
      MTonTokenWillExpire,
      MTonTokenDidExpire,
      MTonMultiDeviceEvent,
    ]) {
      expect(mock).toHaveBeenCalledWith(eventName, expect.any(Function));
    }
  });

  test('onConnected fans out to every registered connection listener', () => {
    const l1: ChatConnectEventListener = { onConnected: jest.fn() };
    const l2: ChatConnectEventListener = { onConnected: jest.fn() };
    client.addConnectionListener(l1);
    client.addConnectionListener(l2);

    emitNativeEvent(MTonConnected);

    expect(l1.onConnected).toHaveBeenCalledTimes(1);
    expect(l2.onConnected).toHaveBeenCalledTimes(1);
  });

  test('a removed connection listener is no longer notified', () => {
    const listener: ChatConnectEventListener = { onDisconnected: jest.fn() };
    client.addConnectionListener(listener);
    client.removeConnectionListener(listener);

    emitNativeEvent(MTonDisconnected, { errorCode: 206 });

    expect(listener.onDisconnected).not.toHaveBeenCalled();
  });

  test('removeAllConnectionListener clears every connection listener', () => {
    const l1: ChatConnectEventListener = { onTokenWillExpire: jest.fn() };
    const l2: ChatConnectEventListener = { onTokenWillExpire: jest.fn() };
    client.addConnectionListener(l1);
    client.addConnectionListener(l2);
    client.removeAllConnectionListener();

    emitNativeEvent(MTonTokenWillExpire);

    expect(l1.onTokenWillExpire).not.toHaveBeenCalled();
    expect(l2.onTokenWillExpire).not.toHaveBeenCalled();
  });

  test('token expiry events reach the connection listeners', () => {
    const listener: ChatConnectEventListener = {
      onTokenWillExpire: jest.fn(),
      onTokenDidExpire: jest.fn(),
    };
    client.addConnectionListener(listener);

    emitNativeEvent(MTonTokenWillExpire);
    emitNativeEvent(MTonTokenDidExpire);

    expect(listener.onTokenWillExpire).toHaveBeenCalledTimes(1);
    expect(listener.onTokenDidExpire).toHaveBeenCalledTimes(1);
  });

  test('multi-device contact event routes to onContactEvent with the converted enum', () => {
    const listener: ChatMultiDeviceEventListener = {
      onContactEvent: jest.fn(),
    };
    client.addMultiDeviceListener(listener);

    emitNativeEvent(MTonMultiDeviceEvent, {
      type: MTonMultiDeviceEventContact,
      event: 2,
      target: 'bob',
      ext: '{"reason":"bye"}',
    });

    expect(listener.onContactEvent).toHaveBeenCalledWith(
      ChatMultiDeviceEvent.CONTACT_REMOVE,
      'bob',
      '{"reason":"bye"}'
    );
  });

  test('multi-device group event routes to onGroupEvent', () => {
    const listener: ChatMultiDeviceEventListener = {
      onGroupEvent: jest.fn(),
    };
    client.addMultiDeviceListener(listener);

    emitNativeEvent(MTonMultiDeviceEvent, {
      type: MTonMultiDeviceEventGroup,
      event: 10,
      target: 'g1',
      ext: '',
    });

    expect(listener.onGroupEvent).toHaveBeenCalledWith(
      ChatMultiDeviceEvent.GROUP_CREATE,
      'g1',
      ''
    );
  });

  test('multi-device conversation event routes to onConversationEvent', () => {
    const listener: ChatMultiDeviceEventListener = {
      onConversationEvent: jest.fn(),
    };
    client.addMultiDeviceListener(listener);

    emitNativeEvent(MTonMultiDeviceEvent, {
      type: MTonMultiDeviceEventConversation,
      event: 62,
      convId: 'peer1',
      convType: 0,
    });

    expect(listener.onConversationEvent).toHaveBeenCalledWith(
      ChatMultiDeviceEvent.CONVERSATION_DELETED,
      'peer1',
      0
    );
  });

  test('an unknown multi-device type does not reach any listener callback', () => {
    const listener: ChatMultiDeviceEventListener = {
      onContactEvent: jest.fn(),
      onGroupEvent: jest.fn(),
      onThreadEvent: jest.fn(),
      onConversationEvent: jest.fn(),
      onMessageRemoved: jest.fn(),
    };
    client.addMultiDeviceListener(listener);

    emitNativeEvent(MTonMultiDeviceEvent, { type: 'onSomethingUnknown' });

    expect(listener.onContactEvent).not.toHaveBeenCalled();
    expect(listener.onGroupEvent).not.toHaveBeenCalled();
    expect(listener.onThreadEvent).not.toHaveBeenCalled();
    expect(listener.onConversationEvent).not.toHaveBeenCalled();
    expect(listener.onMessageRemoved).not.toHaveBeenCalled();
  });
});
