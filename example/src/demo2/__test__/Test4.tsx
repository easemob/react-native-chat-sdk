import {
  ChatClient,
  ChatError,
  ChatGroupMessageAck,
  ChatMessage,
  ChatMessageEventListener,
  ChatMessageReactionEvent,
  ChatMessageStatusCallback,
  ChatMessageThreadEvent,
  ChatPresenceEventListener,
  ChatPresence,
  ChatImageMessageBody,
  ChatMessageChatType,
  ChatTextMessageBody,
} from 'react-native-chat-sdk';
import { ChatManagerCache } from '../Test/ChatManagerCache';

function demo(this: any): void {
  const msg = ChatManagerCache.getInstance().createTextMessage();
  const msgCallback = new (class implements ChatMessageStatusCallback {
    that: any;
    constructor(parent: any) {
      this.that = parent;
    }
    onProgress(localMsgId: string, progress: number): void {
      console.log(`onProgress: ${localMsgId}, ${progress}`);
    }
    onError(localMsgId: string, error: ChatError): void {
      console.log(`onError: ${localMsgId}, ${error}`);
    }
    onSuccess(message: ChatMessage): void {
      console.log(`onSuccess: ${message}`);
      ChatManagerCache.getInstance().addSendMessage(message);
    }
  })(this);
  ChatClient.getInstance()
    .chatManager.downloadThumbnail(msg, msgCallback)
    .then((result) => {
      console.log('success: ', result);
      const body = msg.body as ChatImageMessageBody;
      console.log('thumb picture address: ', body.localPath);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });
}

function demo2() {
  const opt = ChatClient.getInstance().options;
  if (opt) {
    opt.isAutoDownload = true;
    ChatClient.getInstance().init(opt);
  }
}

function demo3() {
  const name = 'thread name';
  const msgId = '1234';
  const parentId = 'groupId';
  ChatClient.getInstance()
    .chatManager.createChatThread(name, msgId, parentId)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  const chatThreadID = '123';
  ChatClient.getInstance()
    .chatManager.destroyChatThread(chatThreadID)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance()
    .chatManager.fetchChatThreadFromServer(chatThreadID)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance()
    .chatManager.joinChatThread(chatThreadID)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance()
    .chatManager.leaveChatThread(chatThreadID)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  const memberId = 'foo';
  ChatClient.getInstance()
    .chatManager.removeMemberWithChatThread(chatThreadID, memberId)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  const newName = 'new thread name';
  ChatClient.getInstance()
    .chatManager.updateChatThreadName(chatThreadID, newName)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  const cursor = '';
  const pageSize = 20;
  ChatClient.getInstance()
    .chatManager.fetchMembersWithChatThreadFromServer(
      chatThreadID,
      cursor,
      pageSize
    )
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance()
    .chatManager.fetchJoinedChatThreadFromServer(cursor, pageSize)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance()
    .chatManager.fetchJoinedChatThreadWithParentFromServer(
      parentId,
      cursor,
      pageSize
    )
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance()
    .chatManager.fetchChatThreadWithParentFromServer(parentId, cursor, pageSize)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  const chatThreadIDs: string[] = [];
  ChatClient.getInstance()
    .chatManager.fetchLastMessageWithChatThread(chatThreadIDs)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });
  const listener = new ChatMessageEvent();
  ChatClient.getInstance().chatManager.addMessageListener(listener);
  ChatClient.getInstance().chatManager.removeAllMessageListener();
}

export function test_demo(): void {
  demo();
  demo2();
  demo3();
  demo4();
  demo5();
  demo6();
}

class ChatMessageEvent implements ChatMessageEventListener {
  onMessagesReceived(_messages: ChatMessage[]): void {
    throw new Error('Method not implemented.');
  }
  onCmdMessagesReceived(_messages: ChatMessage[]): void {
    throw new Error('Method not implemented.');
  }
  onMessagesRead(_messages: ChatMessage[]): void {
    throw new Error('Method not implemented.');
  }
  onGroupMessageRead(_groupMessageAcks: ChatGroupMessageAck[]): void {
    throw new Error('Method not implemented.');
  }
  onMessagesDelivered(_messages: ChatMessage[]): void {
    throw new Error('Method not implemented.');
  }
  onMessagesRecalled(_messages: ChatMessage[]): void {
    throw new Error('Method not implemented.');
  }
  onConversationsUpdate(): void {
    throw new Error('Method not implemented.');
  }
  onConversationRead(_from: string, _to?: string | undefined): void {
    throw new Error('Method not implemented.');
  }
  onMessageReactionDidChange(_list: ChatMessageReactionEvent[]): void {
    throw new Error('Method not implemented.');
  }
  onChatMessageThreadCreated(msgThread: ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadCreated: `, msgThread);
  }
  onChatMessageThreadUpdated(msgThread: ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadUpdated: `, msgThread);
  }
  onChatMessageThreadDestroyed(msgThread: ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadDestroyed: `, msgThread);
  }
  onChatMessageThreadUserRemoved(msgThread: ChatMessageThreadEvent): void {
    console.log(`onChatMessageThreadUserRemoved: `, msgThread);
  }
}

function demo4() {
  const reaction = '';
  const msgId = '';
  ChatClient.getInstance()
    .chatManager.addReaction(reaction, msgId)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance()
    .chatManager.removeReaction(reaction, msgId)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance()
    .chatManager.getReactionList(msgId)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  const targetId = '';
  const content = '';
  const msg = ChatMessage.createTextMessage(targetId, content);
  msg.reactionList
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  const cursor = '';
  const pageSize = 20;
  ChatClient.getInstance()
    .chatManager.fetchReactionDetail(msgId, reaction, cursor, pageSize)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });
}

function demo5() {
  ChatClient.getInstance()
    .chatManager.fetchSupportedLanguages()
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  const targetId = '';
  const content = '';
  const languages: string[] = ['en'];
  const msg = ChatMessage.createTextMessage(
    targetId,
    content,
    ChatMessageChatType.PeerChat,
    { targetLanguageCodes: languages }
  );
  ChatClient.getInstance()
    .chatManager.translateMessage(msg, languages)
    .then((result) => {
      console.log('success: ', result);
      const body = result.body as ChatTextMessageBody;
      console.log('translation: ', body.translations);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });
}

function demo6(): void {
  const memberIds: string[] = ['zhangsan'];
  const expiry = 1000;
  ChatClient.getInstance()
    .presenceManager.subscribe(memberIds, expiry)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });
  const description = 'up';
  ChatClient.getInstance()
    .presenceManager.publishPresence(description)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance().presenceManager.removeAllPresenceListener();
  ChatClient.getInstance().presenceManager.addPresenceListener(
    new ChatPresenceEvent()
  );

  ChatClient.getInstance()
    .presenceManager.unSubscribe(memberIds)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  const pageNum = 1;
  const pageSize = 20;
  ChatClient.getInstance()
    .presenceManager.fetchSubscribedMembers(pageNum, pageSize)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });

  ChatClient.getInstance()
    .presenceManager.fetchPresenceStatus(memberIds)
    .then((result) => {
      console.log('success: ', result);
    })
    .catch((error) => {
      console.log('fail: ', error);
    });
}
class ChatPresenceEvent implements ChatPresenceEventListener {
  onPresenceStatusChanged(list: ChatPresence[]): void {
    console.log(`onPresenceStatusChanged:`, list.length, list);
  }
}
