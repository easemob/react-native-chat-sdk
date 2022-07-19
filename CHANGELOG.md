# Update Log

---

## 1.0.6

- Add field {@link ChatMessage#isOnline} in chat message.
- Add api {@link ChatClient#updatePushConfig} for push config.
- Update api reference example.
- The dependent native SDK (ios and android) was upgraded to version 3.9.4.
- React-Native upgrade to 0.66.4 LTS version.
- Update firebase_push_demo project with 1.0.6 version sdk.
- Fix bug: Type declaration entry point is incorrect
- Optimize: The android platform no longer needs to perform additional operations.
- Rename: agora-react-native-chat was changed to react-native-agora-chat.
- Add functions: message push silent mode set.
- Api rename
  - deleteRemoteConversation -> removeConversationFromServer
  - loadAllConversations -> getAllConversations
  - getConversationsFromServer -> fetchAllConversations
  - getUnreadMessageCount -> getUnreadCount
  - fetchLatestMessage -> getLatestMessage
  - fetchLastReceivedMessage -> getLatestReceivedMessage
  - unreadCount -> getConversationUnreadCount
  - getMessagesFromTime -> getMessageWithTimestamp
  - WhiteList -> AllowList
  - BlackList -> BlockList
- Api removed
  - getMessageById

---

## 1.0.5

- Implement IM foundation functions.
- Implement base message send and receive functions.
- Implement group functions.
- Implement chat room functions.
- Implement contact functions.
- Implement user functions.
- Implement user presence functions.
- Implement message moderation functions.
- Implement message translation functions.
- Implement message reaction functions.
- Implement message thread functions.
- The dependent native SDK (ios and android) was upgraded to version 3.9.3.
