import { ChatMessageChatType, ChatMessageType } from 'react-native-chat-sdk';

export function test3() {
  console.log('test3: ', ChatMessageChatType.PeerChat);
  console.log('test3: ', typeof ChatMessageChatType.PeerChat);
  //   console.log('test3: ', typeof ChatMessageType.TXT);
  console.log('test3: ', typeof ChatMessageType);
  console.log('test3: ', typeof ChatMessageChatType);
  //   const s: ChatMessageChatType = ChatMessageChatType.ChatRoom;
}
