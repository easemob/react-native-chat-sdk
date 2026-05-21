import {
  ChatCmdMessageBody,
  ChatCombineMessageBody,
  ChatCustomMessageBody,
  ChatFileMessageBody,
  ChatImageMessageBody,
  ChatLocationMessageBody,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageDirection,
  ChatMessageType,
  ChatTextMessageBody,
  ChatVideoMessageBody,
  ChatVoiceMessageBody,
} from '../../common/ChatMessage';
import {
  installFakeChatClient,
  resetChatClient,
} from '../helpers/mockChatClient';

describe('ChatMessage static factories', () => {
  beforeEach(() => {
    installFakeChatClient({ currentUserName: 'me' });
  });

  afterEach(() => {
    resetChatClient();
  });

  describe('createSendMessage shared contract', () => {
    test('sets from to Factory.getChatClient().currentUserName', () => {
      const msg = ChatMessage.createTextMessage('peer1', 'hello');

      expect(msg.from).toBe('me');
    });

    test('sets to and conversationId to targetId, with direction send', () => {
      const msg = ChatMessage.createTextMessage('peer1', 'hello');

      expect(msg.to).toBe('peer1');
      expect(msg.conversationId).toBe('peer1');
      expect(msg.direction).toBe(ChatMessageDirection.SEND);
    });

    test('forwards opt.isChatThread / deliverOnlineOnly / receiverList through to the message', () => {
      const msg = ChatMessage.createFileMessage(
        'group1',
        '/tmp/doc.pdf',
        ChatMessageChatType.GroupChat,
        {
          displayName: 'doc.pdf',
          isChatThread: true,
          deliverOnlineOnly: true,
          receiverList: ['a', 'b'],
        }
      );

      expect(msg.isChatThread).toBe(true);
      expect(msg.deliverOnlineOnly).toBe(true);
      expect(msg.receiverList).toEqual(['a', 'b']);
    });
  });

  describe('createTextMessage', () => {
    test('builds a text body carrying the content', () => {
      const msg = ChatMessage.createTextMessage('peer1', 'hi there');

      expect(msg.body).toBeInstanceOf(ChatTextMessageBody);
      expect(msg.body.type).toBe(ChatMessageType.TXT);
      expect((msg.body as ChatTextMessageBody).content).toBe('hi there');
    });

    test('defaults chatType to PeerChat when omitted', () => {
      const msg = ChatMessage.createTextMessage('peer1', 'hi');

      expect(msg.chatType).toBe(ChatMessageChatType.PeerChat);
    });

    test('preserves an empty content string without throwing', () => {
      const msg = ChatMessage.createTextMessage('peer1', '');

      expect((msg.body as ChatTextMessageBody).content).toBe('');
    });

    test('group chat with isChatThread:true keeps both chatType and isChatThread', () => {
      const msg = ChatMessage.createTextMessage(
        'group1',
        'hello group',
        ChatMessageChatType.GroupChat,
        { isChatThread: true }
      );

      expect(msg.chatType).toBe(ChatMessageChatType.GroupChat);
      expect(msg.isChatThread).toBe(true);
    });
  });

  describe('createFileMessage', () => {
    test('builds a file body with localPath set to the given filePath', () => {
      const msg = ChatMessage.createFileMessage(
        'peer1',
        '/tmp/doc.pdf',
        undefined as any,
        {
          displayName: 'doc.pdf',
        }
      );

      expect(msg.body).toBeInstanceOf(ChatFileMessageBody);
      expect((msg.body as ChatFileMessageBody).localPath).toBe('/tmp/doc.pdf');
      expect((msg.body as ChatFileMessageBody).displayName).toBe('doc.pdf');
    });
  });

  describe('createImageMessage', () => {
    test('builds an image body carrying width and height', () => {
      const msg = ChatMessage.createImageMessage(
        'peer1',
        '/tmp/pic.jpg',
        ChatMessageChatType.PeerChat,
        { displayName: 'pic.jpg', width: 640, height: 480 }
      );

      expect(msg.body).toBeInstanceOf(ChatImageMessageBody);
      expect((msg.body as ChatImageMessageBody).localPath).toBe('/tmp/pic.jpg');
      expect((msg.body as ChatImageMessageBody).width).toBe(640);
      expect((msg.body as ChatImageMessageBody).height).toBe(480);
    });
  });

  describe('createVideoMessage', () => {
    test('builds a video body carrying duration and dimensions', () => {
      const msg = ChatMessage.createVideoMessage(
        'peer1',
        '/tmp/clip.mp4',
        ChatMessageChatType.PeerChat,
        {
          displayName: 'clip.mp4',
          thumbnailLocalPath: '/tmp/thumb.jpg',
          duration: 30,
          width: 1280,
          height: 720,
        }
      );

      expect(msg.body).toBeInstanceOf(ChatVideoMessageBody);
      expect((msg.body as ChatVideoMessageBody).localPath).toBe(
        '/tmp/clip.mp4'
      );
      expect((msg.body as ChatVideoMessageBody).duration).toBe(30);
      expect((msg.body as ChatVideoMessageBody).width).toBe(1280);
      expect((msg.body as ChatVideoMessageBody).height).toBe(720);
    });
  });

  describe('createVoiceMessage', () => {
    test('builds a voice body carrying duration', () => {
      const msg = ChatMessage.createVoiceMessage(
        'peer1',
        '/tmp/voice.m4a',
        ChatMessageChatType.PeerChat,
        { duration: 12 }
      );

      expect(msg.body).toBeInstanceOf(ChatVoiceMessageBody);
      expect((msg.body as ChatVoiceMessageBody).localPath).toBe(
        '/tmp/voice.m4a'
      );
      expect((msg.body as ChatVoiceMessageBody).duration).toBe(12);
    });
  });

  describe('createCombineMessage', () => {
    test('builds a combine body carrying messageIdList, title, summary, compatibleText', () => {
      const msg = ChatMessage.createCombineMessage(
        'peer1',
        ['m1', 'm2', 'm3'],
        ChatMessageChatType.PeerChat,
        {
          title: 'Forwarded',
          summary: 'three messages',
          compatibleText: 'fallback text',
        }
      );

      expect(msg.body).toBeInstanceOf(ChatCombineMessageBody);
      const body = msg.body as ChatCombineMessageBody;
      expect(body.messageIdList).toEqual(['m1', 'm2', 'm3']);
      expect(body.title).toBe('Forwarded');
      expect(body.summary).toBe('three messages');
      expect(body.compatibleText).toBe('fallback text');
    });
  });

  describe('createLocationMessage', () => {
    test('builds a location body carrying latitude / longitude / address', () => {
      const msg = ChatMessage.createLocationMessage(
        'peer1',
        '39.9042',
        '116.4074',
        ChatMessageChatType.PeerChat,
        { address: 'Beijing' }
      );

      expect(msg.body).toBeInstanceOf(ChatLocationMessageBody);
      const body = msg.body as ChatLocationMessageBody;
      expect(body.latitude).toBe('39.9042');
      expect(body.longitude).toBe('116.4074');
      expect(body.address).toBe('Beijing');
    });
  });

  describe('createCmdMessage', () => {
    test('builds a cmd body carrying action', () => {
      const msg = ChatMessage.createCmdMessage('peer1', 'typing');

      expect(msg.body).toBeInstanceOf(ChatCmdMessageBody);
      expect((msg.body as ChatCmdMessageBody).action).toBe('typing');
    });
  });

  describe('createCustomMessage', () => {
    test('builds a custom body carrying event and params', () => {
      const msg = ChatMessage.createCustomMessage(
        'peer1',
        'gift_sent',
        ChatMessageChatType.PeerChat,
        { params: { giftId: '42', count: '1' } }
      );

      expect(msg.body).toBeInstanceOf(ChatCustomMessageBody);
      const body = msg.body as ChatCustomMessageBody;
      expect(body.event).toBe('gift_sent');
      expect(body.params).toEqual({ giftId: '42', count: '1' });
    });
  });

  describe('createReceiveMessage', () => {
    test('rebuilds a ChatMessage from a plain object with direction=rec', () => {
      const msg = ChatMessage.createReceiveMessage({
        from: 'peer2',
        to: 'me',
        conversationId: 'peer2',
        direction: 'rec',
        chatType: 0,
        body: { type: 'txt', content: 'hi back' },
      });

      expect(msg).toBeInstanceOf(ChatMessage);
      expect(msg.from).toBe('peer2');
      expect(msg.direction).toBe(ChatMessageDirection.RECEIVE);
      expect(msg.body).toBeInstanceOf(ChatTextMessageBody);
      expect((msg.body as ChatTextMessageBody).content).toBe('hi back');
    });
  });
});
