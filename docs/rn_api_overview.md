Agora Chat is a highly reliable global communication platform where your users can chat one-to-one, in groups or in chat rooms. Users communicate with text messages, share images, audios, videos, files, emojis, and locations. Agora Chat supplies typing indicators out-of-the-box.

- The ChatClient class is the entry of the chat SDK. It provides methods to allow you to log in to and log out of the chat app and manage the connection between the SDK and the chat server.
- The ChatManager class provides methods to allow you to send and receive messages, manage conversations , and download attachments.
- The ChatMessage class defines message attributes .
- The ChatConversation class provides methods for conversation management.
- The ChatContactManager class provides methods for chat contact management such as adding, retrieving, modifying, and deleting contacts.
- The ChatGroupManager class provides methods for group management, like group creation and destruction and member management.
- The ChatRoomManager class provides methods for chat room management, like joining and leaving the chat room and retrieving the chat room list, and manages member privileges.
- The ChatPresenceManager class provides methods for you to set message push configuration options.
- The ChatPushManager class provides methods to allow you to manage offline push services.
- The ChatUserInfoManager class provides methods for user attribute management, including getting and updating user attributes.

## ChatClient
| Method | Description |
| :----- | :---------- |
| {@link ChatClient.getInstance getInstance} | The chat client class, which is the entry of the chat SDK. It defines how to log in to and log out of the chat app and how to manage the connection between the SDK and the chat server. |
| {@link ChatClient.getEventEmitter getEventEmitter} | The chat client class, which is the entry of the chat SDK. It defines how to log in to and log out of the chat app and how to manage the connection between the SDK and the chat server. |
| {@link ChatClient.setNativeListener setNativeListener} | The chat client class, which is the entry of the chat SDK. It defines how to log in to and log out of the chat app and how to manage the connection between the SDK and the chat server. |
| {@link ChatClient.options options} | Gets the SDK configurations. |
| {@link ChatClient.currentUserName currentUserName} | Gets the current logged-in user ID. |
| {@link ChatClient.init init} | Initializes the SDK. |
| {@link ChatClient.isConnected isConnected} | Checks whether the SDK is connected to the chat server. |
| {@link ChatClient.getCurrentUsername getCurrentUsername} | Gets the current logged-in user ID from the server. |
| {@link ChatClient.isLoginBefore isLoginBefore} | Checks whether the current user is logged in to the app. |
| {@link ChatClient.getAccessToken getAccessToken} | Gets the token for login. |
| {@link ChatClient.createAccount createAccount} | Creates a new user (open registration). |
| {@link ChatClient.login login} | Logs in to the chat server with a password or an Easemob token. |
| {@link ChatClient.loginWithAgoraToken loginWithAgoraToken} | Logs in to the chat server with the user ID and an Agora token. |
| {@link ChatClient.renewAgoraToken renewAgoraToken} | Renews the Agora token. |
| {@link ChatClient.logout logout} | Logs out of the chat app. |
| {@link ChatClient.changeAppKey changeAppKey} | Updates the App Key, which is the unique identifier used to access the chat service. |
| {@link ChatClient.compressLogs compressLogs} | Compresses the debug log file into a gzip archive. |
| {@link ChatClient.getLoggedInDevicesFromServer getLoggedInDevicesFromServer} | Gets the list of online devices to which you have logged in with a specified account. |
| {@link ChatClient.kickDevice kickDevice} | Logs out from a specified account on a device. |
| {@link ChatClient.kickAllDevices kickAllDevices} | Logs out from a specified account on all devices. |
| {@link ChatClient.updatePushConfig updatePushConfig} | Update push configurations. |
| {@link ChatClient.addConnectionListener addConnectionListener} | Adds the connection status listener. |
| {@link ChatClient.removeConnectionListener removeConnectionListener} | Removes the connection status listener. |
| {@link ChatClient.removeAllConnectionListener removeAllConnectionListener} | Removes all the connection status listeners for the chat server. |
| {@link ChatClient.addMultiDeviceListener addMultiDeviceListener} | Adds the multi-device listener. |
| {@link ChatClient.removeMultiDeviceListener removeMultiDeviceListener} | Removes the specified multi-device listener. |
| {@link ChatClient.removeAllMultiDeviceListener removeAllMultiDeviceListener} | Removes all the multi-device listeners. |
| {@link ChatClient.addCustomListener addCustomListener} | Adds a custom listener to receive data that the iOS or Android devices send to the React Native layer. |
| {@link ChatClient.removeCustomListener removeCustomListener} | Removes a custom listener to stop receiving data that the iOS or Android devices send to the React Native layer. |
| {@link ChatClient.removeAllCustomListener removeAllCustomListener} | Removes all the custom listeners. |
| {@link ChatClient.chatManager chatManager} | Gets the chat manager class. |
| {@link ChatClient.groupManager groupManager} | Gets the chat group manager class. |
| {@link ChatClient.contactManager contactManager} | Gets the contact manager class. |
| {@link ChatClient.pushManager pushManager} | Gets the push manager class. |
| {@link ChatClient.userManager userManager} | Gets the user information manager class. |
| {@link ChatClient.roomManager roomManager} | Gets the chat room manager class. |
| {@link ChatClient.presenceManager presenceManager} | Gets the presence manager class. |

| Event | Description |
| :----- | :---------- |
| {@link ChatConnectEventListener.onConnected onConnected} | Occurs when the SDK connects to the chat server successfully. |
| {@link ChatConnectEventListener.onDisconnected onDisconnected} | Occurs when the SDK disconnects from the chat server. |
| {@link ChatConnectEventListener.onTokenWillExpire onTokenWillExpire} | Occurs when the Agora token is about to expire. |
| {@link ChatConnectEventListener.onTokenDidExpire onTokenDidExpire} | Occurs when the Agora token has expired. |

| Event | Description |
| :----- | :---------- |
| {@link ChatMultiDeviceEventListener.onContactEvent onContactEvent} | Occurs when a contact event occurs. |
| {@link ChatMultiDeviceEventListener.onGroupEvent onGroupEvent} | Occurs when a group event occurs. |
| {@link ChatMultiDeviceEventListener.onThreadEvent onThreadEvent} | Occurs when a thread event occurs. |

| Event | Description |
| :----- | :---------- |
| {@link ChatCustomEventListener.onDataReceived onDataReceived} | The custom event listener. |
## ChatManager
| Method | Description |
| :----- | :---------- |
| {@link ChatManager.setNativeListener setNativeListener} | The chat manager class, responsible for sending and receiving messages, managing conversations (including loading and deleting conversations), and downloading attachments. |
| {@link ChatManager.addMessageListener addMessageListener} | Adds a message listener. |
| {@link ChatManager.removeMessageListener removeMessageListener} | Removes the message listener. |
| {@link ChatManager.removeAllMessageListener removeAllMessageListener} | Removes all message listeners. |
| {@link ChatManager.sendMessage sendMessage} | Sends a message. |
| {@link ChatManager.resendMessage resendMessage} | Resends a message. |
| {@link ChatManager.sendMessageReadAck sendMessageReadAck} | Sends the read receipt to the server. |
| {@link ChatManager.sendGroupMessageReadAck sendGroupMessageReadAck} | Sends the group message receipt to the server. |
| {@link ChatManager.sendConversationReadAck sendConversationReadAck} | Sends the conversation read receipt to the server. |
| {@link ChatManager.recallMessage recallMessage} | Recalls the sent message. |
| {@link ChatManager.getMessage getMessage} | Gets a message from the local database by message ID. |
| {@link ChatManager.markAllConversationsAsRead markAllConversationsAsRead} | Marks all conversations as read. |
| {@link ChatManager.getUnreadCount getUnreadCount} | Gets the count of the unread messages. |
| {@link ChatManager.insertMessage insertMessage} | Inserts a message to the conversation in the local database. |
| {@link ChatManager.updateMessage updateMessage} | Updates the local message. |
| {@link ChatManager.importMessages importMessages} | Imports messages to the local database. |
| {@link ChatManager.downloadAttachment downloadAttachment} | Downloads the message attachment. |
| {@link ChatManager.downloadThumbnail downloadThumbnail} | Downloads the message thumbnail. |
| {@link ChatManager.fetchHistoryMessages fetchHistoryMessages} | Uses the pagination to get messages in the specified conversation from the server. |
| {@link ChatManager.searchMsgFromDB searchMsgFromDB} | Retrieves messages with keywords in a conversation from the local database. |
| {@link ChatManager.fetchGroupAcks fetchGroupAcks} | Uses the pagination to get read receipts for group messages from the server. |
| {@link ChatManager.removeConversationFromServer removeConversationFromServer} | Deletes the specified conversation and its historical messages from the server. |
| {@link ChatManager.getConversation getConversation} | Gets the conversation by conversation ID and conversation type. |
| {@link ChatManager.getAllConversations getAllConversations} | Gets all conversations from the local database. |
| {@link ChatManager.fetchAllConversations fetchAllConversations} | Gets the conversation list from the server. |
| {@link ChatManager.deleteConversation deleteConversation} | Deletes a conversation and its local messages from the local database. |
| {@link ChatManager.getLatestMessage getLatestMessage} | Gets the latest message from the conversation. |
| {@link ChatManager.getLatestReceivedMessage getLatestReceivedMessage} | Gets the latest received message from the conversation. |
| {@link ChatManager.getConversationUnreadCount getConversationUnreadCount} | Gets the unread message count of the conversation. |
| {@link ChatManager.markMessageAsRead markMessageAsRead} | Marks a message as read. |
| {@link ChatManager.markAllMessagesAsRead markAllMessagesAsRead} | Marks all messages as read. |
| {@link ChatManager.updateConversationMessage updateConversationMessage} | Updates a message in the local database. |
| {@link ChatManager.deleteMessage deleteMessage} | Deletes a message from the local database. |
| {@link ChatManager.deleteAllMessages deleteAllMessages} | Deletes all messages in the conversation from both the memory and local database. |
| {@link ChatManager.deleteMessagesBeforeTimestamp deleteMessagesBeforeTimestamp} | Deletes local messages with timestamp that is before the specified one. |
| {@link ChatManager.getMessagesWithMsgType getMessagesWithMsgType} | Retrieves messages of a certain type in the conversation from the local database. |
| {@link ChatManager.getMessages getMessages} | Retrieves messages of a specified quantity in a conversation from the local database. |
| {@link ChatManager.getMessagesWithKeyword getMessagesWithKeyword} | Gets messages that the specified user sends in a conversation in a certain period. |
| {@link ChatManager.getMessageWithTimestamp getMessageWithTimestamp} | Retrieves messages that are sent and received in a certain period in a conversation in the local database. |
| {@link ChatManager.translateMessage translateMessage} | Translates a text message. |
| {@link ChatManager.fetchSupportedLanguages fetchSupportedLanguages} | Gets all languages supported by the translation service. |
| {@link ChatManager.setConversationExtension setConversationExtension} | Sets the extension information of the conversation. |
| {@link ChatManager.addReaction addReaction} | Adds a Reaction. |
| {@link ChatManager.removeReaction removeReaction} | Deletes a Reaction. |
| {@link ChatManager.fetchReactionList fetchReactionList} | Gets the list of Reactions. |
| {@link ChatManager.fetchReactionDetail fetchReactionDetail} | Gets the Reaction details. |
| {@link ChatManager.reportMessage reportMessage} | Reports an inappropriate message. |
| {@link ChatManager.getReactionList getReactionList} | Gets the list of Reactions from a message. |
| {@link ChatManager.groupAckCount groupAckCount} | Gets the number of members that have read the group message. |
| {@link ChatManager.createChatThread createChatThread} | Creates a message thread. |
| {@link ChatManager.joinChatThread joinChatThread} | Joins a message thread. |
| {@link ChatManager.leaveChatThread leaveChatThread} | Leaves a message thread. |
| {@link ChatManager.destroyChatThread destroyChatThread} | Destroys the message thread. |
| {@link ChatManager.updateChatThreadName updateChatThreadName} | Changes the name of the message thread. |
| {@link ChatManager.removeMemberWithChatThread removeMemberWithChatThread} | Removes a member from the message thread. |
| {@link ChatManager.fetchMembersWithChatThreadFromServer fetchMembersWithChatThreadFromServer} | Uses the pagination to get a list of members in the message thread. |
| {@link ChatManager.fetchJoinedChatThreadFromServer fetchJoinedChatThreadFromServer} | Uses the pagination to get the list of message threads that the current user has joined. |
| {@link ChatManager.fetchJoinedChatThreadWithParentFromServer fetchJoinedChatThreadWithParentFromServer} | Uses the pagination to get the list of message threads that the current user has joined in the specified group. |
| {@link ChatManager.fetchChatThreadWithParentFromServer fetchChatThreadWithParentFromServer} | Uses the pagination to get the list of message threads in the specified group. |
| {@link ChatManager.fetchLastMessageWithChatThread fetchLastMessageWithChatThread} | Gets the last reply in the specified message threads from the server. |
| {@link ChatManager.fetchChatThreadFromServer fetchChatThreadFromServer} | Gets the details of the message thread from the server. |
| {@link ChatManager.getMessageThread getMessageThread} | Gets the details of the message thread from the memory. |
| {@link ChatManager.getThreadConversation getThreadConversation} | Gets the thread conversation by conversation ID. |

| Event | Description |
| :----- | :---------- |
| {@link ChatMessageEventListener.onMessagesReceived onMessagesReceived} | Occurs when a message is received. |
| {@link ChatMessageEventListener.onCmdMessagesReceived onCmdMessagesReceived} | Occurs when a command message is received. |
| {@link ChatMessageEventListener.onMessagesRead onMessagesRead} | Occurs when a read receipt is received for a message. |
| {@link ChatMessageEventListener.onGroupMessageRead onGroupMessageRead} | Occurs when a read receipt is received for a group message. |
| {@link ChatMessageEventListener.onMessagesDelivered onMessagesDelivered} | Occurs when a delivery receipt is received. |
| {@link ChatMessageEventListener.onMessagesRecalled onMessagesRecalled} | Occurs when a received message is recalled. |
| {@link ChatMessageEventListener.onConversationsUpdate onConversationsUpdate} | Occurs when the conversation is updated. |
| {@link ChatMessageEventListener.onConversationRead onConversationRead} | Occurs when a conversation read receipt is received. |
| {@link ChatMessageEventListener.onMessageReactionDidChange onMessageReactionDidChange} | Occurs when a message reaction changes. |
| {@link ChatMessageEventListener.onChatMessageThreadCreated onChatMessageThreadCreated} | Occurs when a message thread is created. |
| {@link ChatMessageEventListener.onChatMessageThreadUpdated onChatMessageThreadUpdated} | Occurs when a message thread is updated. |
| {@link ChatMessageEventListener.onChatMessageThreadDestroyed onChatMessageThreadDestroyed} | Occurs when a message thread is destroyed. |
| {@link ChatMessageEventListener.onChatMessageThreadUserRemoved onChatMessageThreadUserRemoved} | Occurs when the current user is removed from the message thread by the admin. |
## ChatContactManager
| Method | Description |
| :----- | :---------- |
| {@link ChatContactManager.setNativeListener setNativeListener} | The contact manager class, which manages chat contacts such as adding, retrieving, modifying, and deleting contacts. |
| {@link ChatContactManager.addContactListener addContactListener} | Adds a contact listener. |
| {@link ChatContactManager.removeContactListener removeContactListener} | Removes the contact listener. |
| {@link ChatContactManager.removeAllContactListener removeAllContactListener} | Removes all contact listeners. |
| {@link ChatContactManager.addContact addContact} | Adds a new contact. |
| {@link ChatContactManager.deleteContact deleteContact} | Deletes a contact and all the related conversations. |
| {@link ChatContactManager.getAllContactsFromServer getAllContactsFromServer} | Gets the contact list from the server. |
| {@link ChatContactManager.getAllContactsFromDB getAllContactsFromDB} | Gets the contact list from the local database. |
| {@link ChatContactManager.addUserToBlockList addUserToBlockList} | Adds a contact to the block list. |
| {@link ChatContactManager.removeUserFromBlockList removeUserFromBlockList} | Removes the contact from the block list. |
| {@link ChatContactManager.getBlockListFromServer getBlockListFromServer} | Gets the block list from the server. |
| {@link ChatContactManager.getBlockListFromDB getBlockListFromDB} | Gets the block list from the local database. |
| {@link ChatContactManager.acceptInvitation acceptInvitation} | Accepts a friend invitation。 |
| {@link ChatContactManager.declineInvitation declineInvitation} | Declines a friend invitation. |
| {@link ChatContactManager.getSelfIdsOnOtherPlatform getSelfIdsOnOtherPlatform} | Gets the unique IDs of the current user on the other devices. The ID is in the format of `{user_ID} + "/" + {resource_ID}`. |

| Event | Description |
| :----- | :---------- |
| {@link ChatContactEventListener.onContactAdded onContactAdded} | Occurs when a friend request from the current user is accepted by the peer user. |
| {@link ChatContactEventListener.onContactDeleted onContactDeleted} | Occurs when a friend request from the current user is declined by the peer user. |
| {@link ChatContactEventListener.onContactInvited onContactInvited} | Occurs when a friend request is received by the current user. |
| {@link ChatContactEventListener.onFriendRequestAccepted onFriendRequestAccepted} | Occurs when a friend request is accepted by the current user. |
| {@link ChatContactEventListener.onFriendRequestDeclined onFriendRequestDeclined} | Occurs when a friend request is declined by the current user. |
## ChatGroupManager
| Method | Description |
| :----- | :---------- |
| {@link ChatGroupManager.setNativeListener setNativeListener} | The group manager class, which defines how to manage groups, like group creation and destruction and member management. |
| {@link ChatGroupManager.getGroupWithId getGroupWithId} | Gets the group instance from the memory by group ID. |
| {@link ChatGroupManager.getJoinedGroups getJoinedGroups} | Gets the list of groups that the current user has joined. |
| {@link ChatGroupManager.fetchJoinedGroupsFromServer fetchJoinedGroupsFromServer} | Gets the list of groups that the current user has joined. |
| {@link ChatGroupManager.fetchPublicGroupsFromServer fetchPublicGroupsFromServer} | Gets public groups from the server with pagination. |
| {@link ChatGroupManager.createGroup createGroup} | Creates a group instance. |
| {@link ChatGroupManager.fetchGroupInfoFromServer fetchGroupInfoFromServer} | Gets the group information from the server. |
| {@link ChatGroupManager.fetchMemberListFromServer fetchMemberListFromServer} | Uses the pagination to get the member list of the group from the server. |
| {@link ChatGroupManager.fetchBlockListFromServer fetchBlockListFromServer} | Uses the pagination to get the group block list from the server. |
| {@link ChatGroupManager.fetchMuteListFromServer fetchMuteListFromServer} | Uses the pagination to get the mute list of the group from the server. |
| {@link ChatGroupManager.fetchAllowListFromServer fetchAllowListFromServer} | Uses the pagination to get the allow list of the group from the server. |
| {@link ChatGroupManager.isMemberInAllowListFromServer isMemberInAllowListFromServer} | Gets whether the member is on the allow list of the group. |
| {@link ChatGroupManager.fetchGroupFileListFromServer fetchGroupFileListFromServer} | Uses the pagination to get the shared files of the group from the server. |
| {@link ChatGroupManager.fetchAnnouncementFromServer fetchAnnouncementFromServer} | Gets the group announcement from the server. |
| {@link ChatGroupManager.addMembers addMembers} | Adds users to the group. |
| {@link ChatGroupManager.inviterUser inviterUser} | Invites users to join the group. |
| {@link ChatGroupManager.removeMembers removeMembers} | Removes a member from the group. |
| {@link ChatGroupManager.blockMembers blockMembers} | Adds the user to the block list of the group. |
| {@link ChatGroupManager.unblockMembers unblockMembers} | Removes users from the group block list. |
| {@link ChatGroupManager.changeGroupName changeGroupName} | Changes the group name. |
| {@link ChatGroupManager.changeGroupDescription changeGroupDescription} | Modifies the group description. |
| {@link ChatGroupManager.leaveGroup leaveGroup} | Leaves a group. |
| {@link ChatGroupManager.destroyGroup destroyGroup} | Destroys the group instance. |
| {@link ChatGroupManager.blockGroup blockGroup} | Blocks group messages. |
| {@link ChatGroupManager.unblockGroup unblockGroup} | Unblocks group messages. |
| {@link ChatGroupManager.changeOwner changeOwner} | Transfers the group ownership. |
| {@link ChatGroupManager.addAdmin addAdmin} | Adds a group admin. |
| {@link ChatGroupManager.removeAdmin removeAdmin} | Removes a group admin. |
| {@link ChatGroupManager.muteMembers muteMembers} | Mutes group members. |
| {@link ChatGroupManager.unMuteMembers unMuteMembers} | Unmutes group members. |
| {@link ChatGroupManager.muteAllMembers muteAllMembers} | Mutes all members. |
| {@link ChatGroupManager.unMuteAllMembers unMuteAllMembers} | Unmutes all group members. |
| {@link ChatGroupManager.addAllowList addAllowList} | Adds members to the allow list of the group. |
| {@link ChatGroupManager.removeAllowList removeAllowList} | Removes members from the allow list of the group. |
| {@link ChatGroupManager.uploadGroupSharedFile uploadGroupSharedFile} | Uploads the shared file to the group. |
| {@link ChatGroupManager.downloadGroupSharedFile downloadGroupSharedFile} | Downloads the shared file of the group. |
| {@link ChatGroupManager.removeGroupSharedFile removeGroupSharedFile} | Removes a shared file of the group. |
| {@link ChatGroupManager.updateGroupAnnouncement updateGroupAnnouncement} | Updates the group announcement. |
| {@link ChatGroupManager.updateGroupExtension updateGroupExtension} | Updates the group extension field. |
| {@link ChatGroupManager.joinPublicGroup joinPublicGroup} | Joins a public group. |
| {@link ChatGroupManager.requestToJoinPublicGroup requestToJoinPublicGroup} | Requests to join a group. |
| {@link ChatGroupManager.acceptJoinApplication acceptJoinApplication} | Accepts a join request. |
| {@link ChatGroupManager.declineJoinApplication declineJoinApplication} | Declines a join request. |
| {@link ChatGroupManager.acceptInvitation acceptInvitation} | Accepts a group invitation. |
| {@link ChatGroupManager.declineInvitation declineInvitation} | Declines a group invitation. |
| {@link ChatGroupManager.addGroupListener addGroupListener} | Adds a group listener. |
| {@link ChatGroupManager.removeGroupListener removeGroupListener} | Removes the group listener. |
| {@link ChatGroupManager.removeAllGroupListener removeAllGroupListener} | Clears all group listeners. |

| Event | Description |
| :----- | :---------- |
| {@link ChatGroupEventListener.onInvitationReceived onInvitationReceived} | Occurs when the current user receives a group invitation. |
| {@link ChatGroupEventListener.onRequestToJoinReceived onRequestToJoinReceived} | Occurs when a join request from the current user is received by the peer user. |
| {@link ChatGroupEventListener.onRequestToJoinAccepted onRequestToJoinAccepted} | Occurs when a join request from the current user is accepted by the peer user. |
| {@link ChatGroupEventListener.onRequestToJoinDeclined onRequestToJoinDeclined} | Occurs when a join request from the current user is declined by the peer user. |
| {@link ChatGroupEventListener.onInvitationAccepted onInvitationAccepted} | Occurs when a group invitation from the current user is accepted by the peer user. |
| {@link ChatGroupEventListener.onInvitationDeclined onInvitationDeclined} | Occurs when a group invitation from the current user is declined by the peer user. |
| {@link ChatGroupEventListener.onUserRemoved onUserRemoved} | Occurs when the current user is removed from the group. |
| {@link ChatGroupEventListener.onGroupDestroyed onGroupDestroyed} | Occurs when a group is destroyed. |
| {@link ChatGroupEventListener.onAutoAcceptInvitation onAutoAcceptInvitation} | Occurs when the group invitation is accepted automatically by the current user. |
| {@link ChatGroupEventListener.onMuteListAdded onMuteListAdded} | Occurs when one or more members are added to the mute list of the group. |
| {@link ChatGroupEventListener.onMuteListRemoved onMuteListRemoved} | Occurs when one or more members are removed from the mute list of the group. |
| {@link ChatGroupEventListener.onAdminAdded onAdminAdded} | Occurs when a member is set as an admin. |
| {@link ChatGroupEventListener.onAdminRemoved onAdminRemoved} | Occurs when the administrative privileges of an admin are removed. |
| {@link ChatGroupEventListener.onOwnerChanged onOwnerChanged} | Occurs when the group ownership is transferred. |
| {@link ChatGroupEventListener.onMemberJoined onMemberJoined} | Occurs when a user joins a group. |
| {@link ChatGroupEventListener.onMemberExited onMemberExited} | Occurs when a member voluntarily leaves the group. |
| {@link ChatGroupEventListener.onAnnouncementChanged onAnnouncementChanged} | Occurs when the group announcement is updated. |
| {@link ChatGroupEventListener.onSharedFileAdded onSharedFileAdded} | Occurs when a shared file is added to the group. |
| {@link ChatGroupEventListener.onSharedFileDeleted onSharedFileDeleted} | Occurs when a shared file is removed from a group. |
| {@link ChatGroupEventListener.onAllowListAdded onAllowListAdded} | Occurs when one or more group members are added to the allow list. |
| {@link ChatGroupEventListener.onAllowListRemoved onAllowListRemoved} | Occurs when one or more group members are removed from the allow list. |
| {@link ChatGroupEventListener.onAllGroupMemberMuteStateChanged onAllGroupMemberMuteStateChanged} | Occurs when all group members are muted or unmuted. |
| {@link ChatGroupEventListener.onDetailChanged onDetailChanged} | Occurs when the chat group detail change. All chat group members receive this event. |
| {@link ChatGroupEventListener.onStateChanged onStateChanged} | Occurs when the disabled state of group changes. |
## ChatRoomManager
| Method | Description |
| :----- | :---------- |
| {@link ChatRoomManager.setNativeListener setNativeListener} | The chat room manager class, which manages user operations, like joining and leaving the chat room and retrieving the chat room list, and manages member privileges. |
| {@link ChatRoomManager.addRoomListener addRoomListener} | Adds a chat room listener. |
| {@link ChatRoomManager.removeRoomListener removeRoomListener} | Removes the chat room listener. |
| {@link ChatRoomManager.removeAllRoomListener removeAllRoomListener} | Removes all the chat room listeners. |
| {@link ChatRoomManager.joinChatRoom joinChatRoom} | Joins the chat room. |
| {@link ChatRoomManager.leaveChatRoom leaveChatRoom} | Leaves the chat room. |
| {@link ChatRoomManager.fetchPublicChatRoomsFromServer fetchPublicChatRoomsFromServer} | Gets chat room data from the server with pagination. |
| {@link ChatRoomManager.fetchChatRoomInfoFromServer fetchChatRoomInfoFromServer} | Gets the details of the chat room from the server. |
| {@link ChatRoomManager.getChatRoomWithId getChatRoomWithId} | Gets the chat room by ID from the local database. |
| {@link ChatRoomManager.createChatRoom createChatRoom} | Creates a chat room. |
| {@link ChatRoomManager.destroyChatRoom destroyChatRoom} | Destroys a chat room. |
| {@link ChatRoomManager.changeChatRoomSubject changeChatRoomSubject} | Changes the chat room name. |
| {@link ChatRoomManager.changeChatRoomDescription changeChatRoomDescription} | Modifies the chat room description. |
| {@link ChatRoomManager.fetchChatRoomMembers fetchChatRoomMembers} | Gets the chat room member list. |
| {@link ChatRoomManager.muteChatRoomMembers muteChatRoomMembers} | Mutes the specified members in a chat room. |
| {@link ChatRoomManager.unMuteChatRoomMembers unMuteChatRoomMembers} | Unmutes the specified members in a chat room. |
| {@link ChatRoomManager.changeOwner changeOwner} | Transfers the chat room ownership. |
| {@link ChatRoomManager.addChatRoomAdmin addChatRoomAdmin} | Adds a chat room admin. |
| {@link ChatRoomManager.removeChatRoomAdmin removeChatRoomAdmin} | Removes administrative privileges of a chat room admin. |
| {@link ChatRoomManager.fetchChatRoomMuteList fetchChatRoomMuteList} | Uses the pagination to get the list of members who are muted in the chat room. |
| {@link ChatRoomManager.removeChatRoomMembers removeChatRoomMembers} | Removes the specified members from a chat room. |
| {@link ChatRoomManager.blockChatRoomMembers blockChatRoomMembers} | Adds the specified members to the block list of the chat room. |
| {@link ChatRoomManager.unBlockChatRoomMembers unBlockChatRoomMembers} | Removes the specified members from the block list of the chat room. |
| {@link ChatRoomManager.fetchChatRoomBlockList fetchChatRoomBlockList} | Gets the chat room block list with pagination. |
| {@link ChatRoomManager.updateChatRoomAnnouncement updateChatRoomAnnouncement} | Updates the chat room announcement. |
| {@link ChatRoomManager.fetchChatRoomAnnouncement fetchChatRoomAnnouncement} | Gets the chat room announcement from the server. |
| {@link ChatRoomManager.fetchChatRoomAllowListFromServer fetchChatRoomAllowListFromServer} | Gets the allow list from the server. |
| {@link ChatRoomManager.isMemberInChatRoomAllowList isMemberInChatRoomAllowList} | Checks whether the member is on the allow list of the chat room. |
| {@link ChatRoomManager.addMembersToChatRoomAllowList addMembersToChatRoomAllowList} | Adds members to the allow list of the chat room. |
| {@link ChatRoomManager.removeMembersFromChatRoomAllowList removeMembersFromChatRoomAllowList} | Removes members from the allow list of the chat room. |
| {@link ChatRoomManager.muteAllChatRoomMembers muteAllChatRoomMembers} | Mutes all members. |
| {@link ChatRoomManager.unMuteAllChatRoomMembers unMuteAllChatRoomMembers} | Unmutes all members of the chat room. |
| {@link ChatRoomManager.fetchChatRoomAttributes fetchChatRoomAttributes} | Gets custom chat room attributes from the server. |
| {@link ChatRoomManager.addAttributes addAttributes} | Sets custom chat room attributes. |
| {@link ChatRoomManager.removeAttributes removeAttributes} | Removes custom chat room attributes. |

| Event | Description |
| :----- | :---------- |
| {@link ChatRoomEventListener.onChatRoomDestroyed onChatRoomDestroyed} | Occurs when the chat room is destroyed. |
| {@link ChatRoomEventListener.onMemberJoined onMemberJoined} | Occurs when a user joins the chat room. |
| {@link ChatRoomEventListener.onMemberExited onMemberExited} | Occurs when a member voluntarily leaves the chat room. |
| {@link ChatRoomEventListener.onRemoved onRemoved} | Occurs when a member is removed from a chat room. |
| {@link ChatRoomEventListener.onMuteListAdded onMuteListAdded} | Occurs when a chat room member is added to the mute list. |
| {@link ChatRoomEventListener.onMuteListRemoved onMuteListRemoved} | Occurs when one or more chat room members are removed from the mute list. |
| {@link ChatRoomEventListener.onAdminAdded onAdminAdded} | Occurs when a chat room member is set as an admin. |
| {@link ChatRoomEventListener.onAdminRemoved onAdminRemoved} | Occurs when the administrative privileges of a chat room admin are removed. |
| {@link ChatRoomEventListener.onOwnerChanged onOwnerChanged} | Occurs when the chat room ownership is transferred. |
| {@link ChatRoomEventListener.onAnnouncementChanged onAnnouncementChanged} | Occurs when the chat room announcement changes. |
| {@link ChatRoomEventListener.onAllowListAdded onAllowListAdded} | Occurs when one or more chat room members are added to the allow list. |
| {@link ChatRoomEventListener.onAllowListRemoved onAllowListRemoved} | Occurs when one or more chat room members are removed from the allow list. |
| {@link ChatRoomEventListener.onAllChatRoomMemberMuteStateChanged onAllChatRoomMemberMuteStateChanged} | Occurs when all members in the chat room are muted or unmuted. |
| {@link ChatRoomEventListener.onSpecificationChanged onSpecificationChanged} | Occurs when the chat room specifications change. All chat room members receive this event. |
| {@link ChatRoomEventListener.onAttributesUpdated onAttributesUpdated} | Occurs when the custom chat room attributes (key-value) are updated. |
| {@link ChatRoomEventListener.onAttributesRemoved onAttributesRemoved} | Occurs when the custom chat room attributes (key-value) are removed. |
## ChatPresenceManager
| Method | Description |
| :----- | :---------- |
| {@link ChatPresenceManager.setNativeListener setNativeListener} |  |
| {@link ChatPresenceManager.addPresenceListener addPresenceListener} | Adds a presence listener. |
| {@link ChatPresenceManager.removePresenceListener removePresenceListener} | Removes a presence listener. |
| {@link ChatPresenceManager.removeAllPresenceListener removeAllPresenceListener} | Clears all presence listeners. |
| {@link ChatPresenceManager.publishPresence publishPresence} | Publishes a custom presence state. |
| {@link ChatPresenceManager.subscribe subscribe} | Subscribes to the presence state of a user. |
| {@link ChatPresenceManager.unsubscribe unsubscribe} | Unsubscribes from the presence state of the unspecified users. |
| {@link ChatPresenceManager.fetchSubscribedMembers fetchSubscribedMembers} | Uses the pagination to get a list of users whose presence states you have subscribed to. |
| {@link ChatPresenceManager.fetchPresenceStatus fetchPresenceStatus} | Gets the current presence state of specified users. |

| Event | Description |
| :----- | :---------- |
| {@link ChatPresenceEventListener.onPresenceStatusChanged onPresenceStatusChanged} | Occurs when the presence state of a subscribed user changes. |
## ChatPushManager
| Method | Description |
| :----- | :---------- |
| {@link ChatPushManager.setNativeListener setNativeListener} | The class for message push configuration options. |
| {@link ChatPushManager.setSilentModeForConversation setSilentModeForConversation} | Sets the offline push for the conversation. |
| {@link ChatPushManager.removeSilentModeForConversation removeSilentModeForConversation} | Clears the offline push settings of the conversation. |
| {@link ChatPushManager.fetchSilentModeForConversation fetchSilentModeForConversation} | Gets the offline push settings of the conversation. |
| {@link ChatPushManager.setSilentModeForAll setSilentModeForAll} | Sets the offline push of the app. |
| {@link ChatPushManager.fetchSilentModeForAll fetchSilentModeForAll} | Gets the do-not-disturb settings of the app. |
| {@link ChatPushManager.fetchSilentModeForConversations fetchSilentModeForConversations} | Gets the do-not-disturb settings of the specified conversations. |
| {@link ChatPushManager.setPreferredNotificationLanguage setPreferredNotificationLanguage} | Sets the target translation language of offline push notifications. |
| {@link ChatPushManager.fetchPreferredNotificationLanguage fetchPreferredNotificationLanguage} | Gets the configured push translation language. |
| {@link ChatPushManager.updatePushNickname updatePushNickname} | Updates nickname of the sender displayed in push notifications. |
| {@link ChatPushManager.updatePushDisplayStyle updatePushDisplayStyle} | Updates the display style of push notifications. |
| {@link ChatPushManager.fetchPushOptionFromServer fetchPushOptionFromServer} | Gets the push configurations from the server. |
## ChatUserInfoManager
| Method | Description |
| :----- | :---------- |
| {@link ChatUserInfoManager.updateOwnUserInfo updateOwnUserInfo} | Modifies the user attributes of the current user. |
| {@link ChatUserInfoManager.fetchUserInfoById fetchUserInfoById} | Gets the user attributes of the specified users. |
| {@link ChatUserInfoManager.fetchOwnInfo fetchOwnInfo} | Gets attributes of the current user from the server. |
## ChatMessage
| Method | Description |
| :----- | :---------- |
| {@link ChatMessage.constructor constructor} | Constructs a message. |
| {@link ChatMessage.createTextMessage createTextMessage} | Creates a text message for sending. |
| {@link ChatMessage.createFileMessage createFileMessage} | Creates a message with a file attachment for sending. |
| {@link ChatMessage.createImageMessage createImageMessage} | Creates an image message for sending. |
| {@link ChatMessage.createVideoMessage createVideoMessage} | Creates a video message for sending. |
| {@link ChatMessage.createVoiceMessage createVoiceMessage} | Creates a voice message for sending. |
| {@link ChatMessage.createLocationMessage createLocationMessage} | Creates a location message for sending. |
| {@link ChatMessage.createCmdMessage createCmdMessage} | Creates a command message for sending. |
| {@link ChatMessage.createCustomMessage createCustomMessage} | Creates a custom message for sending. |
| {@link ChatMessage.createReceiveMessage createReceiveMessage} | Creates a received message instance. |
| {@link ChatMessage.reactionList reactionList} | Gets the list of Reactions. |
| {@link ChatMessage.groupReadCount groupReadCount} | Gets the count of read receipts of a group message. |
| {@link ChatMessage.threadInfo threadInfo} | Gets details of a message thread. |
## ChatConversation
| Method | Description |
| :----- | :---------- |
| {@link ChatConversation.name name} | Gets the conversation ID. |
| {@link ChatConversation.getUnreadCount getUnreadCount} | Gets the count of unread messages in the conversation. |
| {@link ChatConversation.getLatestMessage getLatestMessage} | Gets the latest message from the conversation. |
| {@link ChatConversation.getLatestReceivedMessage getLatestReceivedMessage} | Gets the latest message received in the conversation. |
| {@link ChatConversation.setConversationExtension setConversationExtension} | Sets the extension information of the conversation. |
| {@link ChatConversation.markMessageAsRead markMessageAsRead} | Marks a message as read. |
| {@link ChatConversation.markAllMessagesAsRead markAllMessagesAsRead} | Marks all messages as read. |
| {@link ChatConversation.updateMessage updateMessage} | Updates a message in the local database. |
| {@link ChatConversation.deleteMessage deleteMessage} | Deletes a message from the local database. |
| {@link ChatConversation.deleteAllMessages deleteAllMessages} | Deletes all the messages of the conversation. |
| {@link ChatConversation.getMessagesWithMsgType getMessagesWithMsgType} | Retrieves messages of a certain type that a specified user sends in a conversation. |
| {@link ChatConversation.getMessages getMessages} | Retrieves messages of a certain quantity in a conversation from the local database. |
| {@link ChatConversation.getMessagesWithKeyword getMessagesWithKeyword} | Retrieves messages with keywords in a conversation in the local database. |
| {@link ChatConversation.getMessageWithTimestamp getMessageWithTimestamp} | Gets messages that are sent and received in a certain period in a conversation in the local database. |
