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

## Chat Client

| Method | Description |
| :----- | :---------- |
| {@link ChatClient.init init}                                                 | Initializes the SDK.                                         |
| {@link ChatClient.loginWithAgoraToken loginWithAgoraToken}                   | Logs in to the chat server with the user ID and Agora token. |
| {@link ChatClient.renewAgoraToken renewAgoraToken}                           | Renews the Agora token.                                      |
| {@link ChatClient.logout logout}                                             | Logs out of the chat server.                                 |
| {@link ChatClient.getCurrentUsername getCurrentUsername}                     | Gets the user ID of the current logged-in user.              |
| {@link ChatClient.isLoginBefore isLoginBefore}                               | Checks whether the user has logged in before.                |
| {@link ChatClient.isConnected isConnected}                                   | Checks whether the SDK is connected to the Chat server.      |
| {@link ChatClient.updatePushConfig updatePushConfig}                         | Binds a device token to the Chat server.                     |
| {@link ChatClient.addConnectionListener addConnectionListener}               | Adds a connection status listener.                           |
| {@link ChatClient.removeConnectionListener removeConnectionListener}         | remove a connection status listener.                         |
| {@link ChatClient.removeAllConnectionListener removeAllConnectionListener}   | remove all connection status listeners.                      |
| {@link ChatClient.addMultiDeviceListener addMultiDeviceListener}             | Adds a multi device status listener.                         |
| {@link ChatClient.removeMultiDeviceListener removeMultiDeviceListener}       | remove a multi device status listener.                       |
| {@link ChatClient.removeAllMultiDeviceListener removeAllMultiDeviceListener} | remove all multi device status listeners.                    |
| {@link ChatClient.addCustomListener addCustomListener}                       | Adds a custom status listener.                               |
| {@link ChatClient.removeCustomListener removeCustomListener}                 | remove a custom status listener.                             |
| {@link ChatClient.removeAllCustomListener removeAllCustomListener}           | remove all custom status listeners.                          |
| {@link ChatClient.groupManager groupManager}                                 | Gets the `ChatGroupManager` class.                           |
| {@link ChatClient.pushManager pushManager}                                   | Gets the `ChatPushManager` class.                            |
| {@link ChatClient.roomManager roomManager}                                   | Gets the `ChatRoomManager` class.                            |
| {@link ChatClient.chatManager chatManager}                                   | Gets the `ChatManager` class.                                |
| {@link ChatClient.userManager userManager}                                   | Gets the `ChatUserInfoManager` class.                        |
| {@link ChatClient.contactManager contactManager}                             | Gets the `ChatContactManager` class.                         |
| {@link ChatClient.presenceManager presenceManager}                           | Gets the `ChatPresenceManager` class.                        |

| Event                                                                | Description                                                   |
| :------------------------------------------------------------------- | :------------------------------------------------------------ |
| {@link ChatConnectEventListener.onConnected onConnected}             | Occurs when the SDK connects to the chat server successfully. |
| {@link ChatConnectEventListener.onDisconnected onDisconnected}       | Occurs when the SDK disconnects from the chat server.         |
| {@link ChatConnectEventListener.onTokenDidExpire onTokenDidExpire}   | Occurs when the token has expired.                            |
| {@link ChatConnectEventListener.onTokenWillExpire onTokenWillExpire} | Occurs when the token is about to expire.                     |

## Chat manager

| Method                                                                          | Description                                                                       |
| :------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------- |
| {@link ChatManager.sendMessage sendMessage}                                     | Sends a message.                                                                  |
| {@link ChatManager.sendConversationReadAck sendConversationReadAck}             | Sends the conversation read receipt to the server.                                |
| {@link ChatManager.sendMessageReadAck sendMessageReadAck}                       | Sends the read receipt for a message to the server.                               |
| {@link ChatManager.sendGroupMessageReadAck sendGroupMessageReadAck}             | Sends the read receipt for a group message to the server.                         |
| {@link ChatManager.getConversation getConversation}                             | Gets the conversation object by conversation ID.                                  |
| {@link ChatManager.markAllConversationsAsRead markAllConversationsAsRead}       | Marks all conversations as read.                                                  |
| {@link ChatManager.updateMessage updateMessage}                                 | Updates the local message.                                                        |
| {@link ChatManager.downloadAttachment downloadAttachment}                       | Downloads the message attachment.                                                 |
| {@link ChatManager.downloadThumbnail downloadThumbnail}                         | Downloads the message thumbnail.                                                  |
| {@link ChatManager.importMessages importMessages}                               | Imports messages to the local database.                                           |
| {@link ChatManager.getAllConversations getAllConversations}                     | Gets all local conversations.                                                     |
| {@link ChatManager.fetchAllConversations fetchAllConversations}                 | Gets the conversation list from the server.                                       |
| {@link ChatManager.deleteConversation deleteConversation}                       | Deletes a conversation and its local messages from the local database.            |
| {@link ChatManager.removeConversationFromServer removeConversationFromServer}   | Deletes the specified conversation and its historical messages from the server.   |
| {@link ChatManager.fetchGroupAcks fetchGroupAcks}                               | Uses the pagination to get read receipts for a group message from the server.     |
| {@link ChatManager.searchMsgFromDB searchMsgFromDB}                             | Retrieves messages of a certain type in the conversation from the local database. |
| {@link ChatManager.deleteMessagesBeforeTimestamp deleteMessagesBeforeTimestamp} | Deletes local historical messages with a Unix timestamp before a specified one.   |
| {@link ChatManager.reportMessage reportMessage}                                 | Reports an inappropriate message.                                                 |
| {@link ChatManager.fetchSupportedLanguages fetchSupportedLanguages}             | Gets all languages supported by the translation service.                          |
| {@link ChatManager.translateMessage translateMessage}                           | Translates a text message.                                                        |
| {@link ChatManager.addReaction addReaction}                                     | Adds a Reaction.                                                                  |
| {@link ChatManager.removeReaction removeReaction}                               | Deletes a Reaction.                                                               |
| {@link ChatManager.getReactionList getReactionList}                             | Gets the list of Reactions for a message.                                         |
| {@link ChatManager.fetchReactionList fetchReactionList}                         | Gets the list of Reactions for more messages.                                     |
| {@link ChatManager.fetchReactionDetail fetchReactionDetail}                     | Gets the Reaction details.                                                        |
| {@link ChatManager.addMessageListener addMessageListener}                       | Adds the message listener.                                                        |
| {@link ChatManager.removeMessageListener removeMessageListener}                 | Removes the message listener.                                                     |
| {@link ChatManager.removeAllMessageListener removeAllMessageListener}           | Remove all the message listeners.                                                 |

| Event                                                                                          | Description                                                 |
| :--------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| {@link ChatMessageEventListener.onMessagesReceived onMessagesReceived}                         | Occurs when a message is received.                          |
| {@link ChatMessageEventListener.onCmdMessagesReceived onCmdMessagesReceived}                   | Occurs when a command message is received.                  |
| {@link ChatMessageEventListener.onMessagesRead onMessagesRead}                                 | Occurs when a read receipt is received for a message.       |
| {@link ChatMessageEventListener.onGroupMessageRead onGroupMessageRead}                         | Occurs when a read receipt is received for a group message. |
| {@link ChatMessageEventListener.onMessagesDelivered onMessagesDelivered}                       | Occurs when a delivery receipt is received.                 |
| {@link ChatMessageEventListener.onMessagesRecalled onMessagesRecalled}                         | Occurs when a received message is recalled.                 |
| {@link ChatMessageEventListener.onConversationsUpdate onConversationsUpdate}                   | Occurs when the conversation is updated.                    |
| {@link ChatMessageEventListener.onConversationRead onConversationRead}                         | Occurs when the conversation read receipt is received.      |
| {@link ChatMessageEventListener.onMessageReactionDidChange onMessageReactionDidChange}         | Occurs when the reaction is changed.                        |
| {@link ChatMessageEventListener.onChatMessageThreadCreated onChatMessageThreadCreated}         | Occurs when the reaction is created.                        |
| {@link ChatMessageEventListener.onChatMessageThreadUpdated onChatMessageThreadUpdated}         | Occurs when the reaction is updated.                        |
| {@link ChatMessageEventListener.onChatMessageThreadDestroyed onChatMessageThreadDestroyed}     | Occurs when the reaction is destroyed.                      |
| {@link ChatMessageEventListener.onChatMessageThreadUserRemoved onChatMessageThreadUserRemoved} | Occurs when the reaction is removed.                        |

## Messages

| Method                                                                     | Description                                                                      |
| :------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| {@link ChatConversation.convId convId}                                     | The conversation ID, which depends on the conversation type.                     |
| {@link ChatConversation.getUnreadCount getUnreadCount}                     | Gets the number of unread messages in the conversation.                          |
| {@link ChatConversation.markAllMessagesAsRead markAllMessagesAsRead}       | Marks all unread messages as read.                                               |
| {@link ChatConversation.isChatThread isChatThread}                         | Checks whether the current conversation is a thread conversation.                |
| {@link ChatConversation.markMessageAsRead markMessageAsRead}               | Marks a message as read.                                                         |
| {@link ChatConversation.getMessages getMessages}                           | Gets messages of the conversation in the local memory.                           |
| {@link ChatConversation.deleteMessage deleteMessage}                       | Deletes a message in the local database.                                         |
| {@link ChatConversation.getLatestMessage getLatestMessage}                 | Gets the latest message in the conversation.                                     |
| {@link ChatConversation.deleteAllMessages deleteAllMessages}               | Deletes all the messages in the conversation from the memory and local database. |
| {@link ChatConversation.setConversationExtension setConversationExtension} | Sets the extension field of the conversation.                                    |
| {@link ChatConversation.ext ext}                                           | Gets the extension field of the conversation.                                    |
| {@link ChatConversation.updateMessage updateMessage}                       | Updates a message in the local database.                                         |
| {@link ChatMessage.status status}                                          | Gets and Sets the message sending or reception status.                           |
| {@link ChatMessage.chatType chatType}                                      | Gets and Sets the chat message type.                                             |
| {@link ChatMessage.body body}                                              | Gets and Sets the message body.                                                  |
| {@link ChatMessage.serverTime serverTime}                                  | Gets and Sets the Unix timestamp when the server receives the message.           |
| {@link ChatMessage.localTime localTime}                                    | Gets and Sets the local timestamp of the message.                                |
| {@link ChatMessage.isChatThread isChatThread}                              | Sets and Gets whether the message is a threaded message.                         |
| {@link ChatMessage.threadInfo threadInfo}                                  | Gets the overview of the message thread.                                         |
| {@link ChatMessage.createSendMessage createSendMessage}                    | Creates a message instance for sending.                                          |
| {@link ChatMessage.createReceiveMessage createReceiveMessage}              | Creates a received message instance.                                             |
| {@link ChatMessage.createTextMessage createTextMessage}                    | Creates a text message for sending.                                              |
| {@link ChatMessage.createVoiceMessage createVoiceMessage}                  | Creates a voice message for sending.                                             |
| {@link ChatMessage.createImageMessage createImageMessage}                  | Creates an image message for sending.                                            |
| {@link ChatMessage.createVideoMessage createVideoMessage}                  | Creates a video message for sending.                                             |
| {@link ChatMessage.createLocationMessage createLocationMessage}            | Creates a location message for sending.                                          |
| {@link ChatMessage.createFileMessage createFileMessage}                    | Creates a file message for sending.                                              |
| {@link ChatMessage.from from}                                              | Gets and sets the user ID of the message sender.                                 |
| {@link ChatMessage.to to}                                                  | Sets and gets the user ID of the message recipient.                              |
| {@link ChatMessage.msgId msgId}                                            | Gets and sets the message ID.                                                    |
| {@link ChatMessage.localMsgId localMsgId}                                  | Sets and gets the local message ID.                                              |
| {@link ChatMessage.attributes attributes}                                  | Sets and gets a message extension attribute of the String type.                  |
| {@link ChatMessage.hasRead hasRead}                                        | Gets and gets whether the message is read.                                       |
| {@link ChatMessage.hasDeliverAck hasDeliverAck}                            | Gets and gets whether the message is successfully delivered.                     |
| {@link ChatMessage.direction direction}                                    | Gets and sets the message direction.                                             |
| {@link ChatMessage.reactionList reactionList}                              | Gets the list of Reactions.                                                      |
| {@link ChatMessage.isOnline isOnline}                                      | Checks whether the message gets delivered to an online user.                     |

## Contacts

| Method                                                                         | Description                                                            |
| :----------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| {@link ChatContactManager.addContact addContact}                               | Adds a new contact.                                                    |
| {@link ChatContactManager.deleteContact deleteContact}                         | Deletes a contact.                                                     |
| {@link ChatContactManager.getAllContactsFromServer getAllContactsFromServer}   | Gets all contacts from the server.                                     |
| {@link ChatContactManager.addUserToBlockList addUserToBlockList}               | Adds a user to block list.                                             |
| {@link ChatContactManager.removeUserFromBlockList removeUserFromBlockList}     | Removes the contact from the block list.                               |
| {@link ChatContactManager.getBlockListFromServer getBlockListFromServer}       | Gets the block list from the server.                                   |
| {@link ChatContactManager.declineInvitation declineInvitation}                 | Declines a friend invitation.                                          |
| {@link ChatContactManager.getAllContactsFromDB getAllContactsFromDB}           | Gets the contact list from the local database.                         |
| {@link ChatContactManager.getSelfIdsOnOtherPlatform getSelfIdsOnOtherPlatform} | Gets the unique self-ID list of the current user on the other devices. |
| {@link ChatContactManager.addContactListener addContactListener}               | Add a contact listener.                                                |
| {@link ChatContactManager.removeContactListener removeContactListener}         | Remove a contact listener.                                             |
| {@link ChatContactManager.removeAllContactListener removeAllContactListener}   | Remove all contact listeners.                                          |

| Event                                                                            | Description                                          |
| :------------------------------------------------------------------------------- | :--------------------------------------------------- |
| {@link ChatContactEventListener.onContactAdded onContactAdded}                   | Occurs when a user is added as a contact.            |
| {@link ChatContactEventListener.onContactDeleted onContactDeleted}               | Occurs when a user is removed from the contact list. |
| {@link ChatContactEventListener.onContactInvited onContactInvited}               | Occurs when a user receives a friend request.        |
| {@link ChatContactEventListener.onFriendRequestAccepted onFriendRequestAccepted} | Occurs when a friend request is approved.            |
| {@link ChatContactEventListener.onFriendRequestDeclined onFriendRequestDeclined} | Occurs when a friend request is declined.            |

## Chat Group

| Method                                                                             | Description                                                          |
| :--------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| {@link ChatGroupManager.createGroup createGroup}                                   | Creates a group instance.                                            |
| {@link ChatGroupManager.destroyGroup destroyGroup}                                 | Destroys the group instance.                                         |
| {@link ChatGroupManager.leaveGroup leaveGroup}                                     | Leaves a group.                                                      |
| {@link ChatGroupManager.joinPublicGroup joinPublicGroup}                           | Joins a public group.                                                |
| {@link ChatGroupManager.addMembers addMembers}                                     | Adds users to the group.                                             |
| {@link ChatGroupManager.removeMembers removeMembers}                               | Removes members from the group.                                      |
| {@link ChatGroupManager.fetchGroupInfoFromServer fetchGroupInfoFromServer}         | Gets group information from the server.                              |
| {@link ChatGroupManager.fetchJoinedGroupsFromServer fetchJoinedGroupsFromServer}   | Gets all groups of the current user from the server with pagination. |
| {@link ChatGroupManager.fetchPublicGroupsFromServer fetchPublicGroupsFromServer}   | Gets public groups from the server with pagination.                  |
| {@link ChatGroupManager.changeGroupName changeGroupName}                           | Changes the group name.                                              |
| {@link ChatGroupManager.changeGroupDescription changeGroupDescription}             | Changes the group description.                                       |
| {@link ChatGroupManager.acceptInvitation acceptInvitation}                         | Accepts a group invitation.                                          |
| {@link ChatGroupManager.declineInvitation declineInvitation}                       | Declines a group invitation.                                         |
| {@link ChatGroupManager.acceptJoinApplication acceptJoinApplication}               | Approves a group request.                                            |
| {@link ChatGroupManager.declineJoinApplication declineJoinApplication}             | Declines a group request.                                            |
| {@link ChatGroupManager.inviterUser inviterUser}                                   | Invites users to join a group.                                       |
| {@link ChatGroupManager.requestToJoinPublicGroup requestToJoinPublicGroup}         | Requests to join a group.                                            |
| {@link ChatGroupManager.blockGroup blockGroup}                                     | Blocks group messages.                                               |
| {@link ChatGroupManager.unblockGroup unblockGroup}                                 | Unblocks group messages.                                             |
| {@link ChatGroupManager.blockMembers blockMembers}                                 | Adds the user to the group block list.                               |
| {@link ChatGroupManager.unblockMembers unblockMembers}                             | Removes users from the group block list.                             |
| {@link ChatGroupManager.fetchMemberListFromServer fetchMemberListFromServer}       | Gets the member list of a group with pagination.                     |
| {@link ChatGroupManager.changeOwner changeOwner}                                   | Transfers the group ownership.                                       |
| {@link ChatGroupManager.addAdmin addAdmin}                                         | Adds a group admin.                                                  |
| {@link ChatGroupManager.removeAdmin removeAdmin}                                   | Removes a group admin.                                               |
| {@link ChatGroupManager.muteMembers muteMembers}                                   | Mutes group members.                                                 |
| {@link ChatGroupManager.unMuteMembers unMuteMembers}                               | Unmutes group members.                                               |
| {@link ChatGroupManager.fetchMuteListFromServer fetchMuteListFromServer}           | Gets the mute list of the group from the server.                     |
| {@link ChatGroupManager.fetchBlockListFromServer fetchBlockListFromServer}         | Gets the block list of group from the server with pagination.        |
| {@link ChatGroupManager.addAllowList addAllowList}                                 | Adds members to the allow list.                                      |
| {@link ChatGroupManager.removeAllowList removeAllowList}                           | Removes members from the allow list.                                 |
| {@link ChatGroupManager.fetchAllowListFromServer fetchAllowListFromServer}         | Gets the allow list of the group from the server.                    |
| {@link ChatGroupManager.updateGroupAnnouncement updateGroupAnnouncement}           | Updates the group announcement.                                      |
| {@link ChatGroupManager.fetchAnnouncementFromServer fetchAnnouncementFromServer}   | Gets the group announcement from the server.                         |
| {@link ChatGroupManager.uploadGroupSharedFile uploadGroupSharedFile}               | Uploads the shared file to the group.                                |
| {@link ChatGroupManager.fetchGroupFileListFromServer fetchGroupFileListFromServer} | Gets the shared file list from the server.                           |
| {@link ChatGroupManager.removeGroupSharedFile removeGroupSharedFile}               | Removes the shared file of the group.                                |
| {@link ChatGroupManager.downloadGroupSharedFile downloadGroupSharedFile}           | Downloads the shared file of the group.                              |
| {@link ChatGroupManager.addGroupListener addGroupListener}                         | Registers a group change listener.                                   |
| {@link ChatGroupManager.removeGroupListener removeGroupListener}                   | Remove a group change listener.                                      |
| {@link ChatGroupManager.removeAllGroupListener removeAllGroupListener}             | Remove all group change listeners.                                   |

| Event                                                                                            | Description                                                                        |
| :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| {@link ChatGroupEventListener.onInvitationReceived onInvitationReceived}                         | Occurs when the user receives a group invitation.                                  |
| {@link ChatGroupEventListener.onRequestToJoinReceived onRequestToJoinReceived}                   | Occurs when the group owner or administrator receives a group request from a user. |
| {@link ChatGroupEventListener.onRequestToJoinAccepted onRequestToJoinAccepted}                   | Occurs when a group request is accepted.                                           |
| {@link ChatGroupEventListener.onRequestToJoinDeclined onRequestToJoinDeclined}                   | Occurs when a group request is declined.                                           |
| {@link ChatGroupEventListener.onInvitationAccepted onInvitationAccepted}                         | Occurs when a group invitation is accepted.                                        |
| {@link ChatGroupEventListener.onInvitationDeclined onInvitationDeclined}                         | Occurs when a group invitation is declined.                                        |
| {@link ChatGroupEventListener.onUserRemoved onUserRemoved}                                       | Occurs when the current user is removed from the group by the group admin.         |
| {@link ChatGroupEventListener.onGroupDestroyed onGroupDestroyed}                                 | Occurs when a group is destroyed.                                                  |
| {@link ChatGroupEventListener.onAutoAcceptInvitation onAutoAcceptInvitation}                     | Occurs when the group invitation is accepted automatically.                        |
| {@link ChatGroupEventListener.onMuteListAdded onMuteListAdded}                                   | Occurs when one or more group members are muted.                                   |
| {@link ChatGroupEventListener.onMuteListRemoved onMuteListRemoved}                               | Occurs when one or more group members are unmuted.                                 |
| {@link ChatGroupEventListener.onAllowListAdded onAllowListAdded}                                 | Occurs when one or more group members are added to the allowlist.                  |
| {@link ChatGroupEventListener.onAllowListRemoved onAllowListRemoved}                             | Occurs when one or more members are removed from the allowlist.                    |
| {@link ChatGroupEventListener.onAllGroupMemberMuteStateChanged onAllGroupMemberMuteStateChanged} | Occurs when all group members are muted or unmuted.                                |
| {@link ChatGroupEventListener.onAdminAdded onAdminAdded}                                         | Occurs when a member is set as an admin.                                           |
| {@link ChatGroupEventListener.onAdminRemoved onAdminRemoved}                                     | Occurs when a member's admin privileges are removed.                               |
| {@link ChatGroupEventListener.onOwnerChanged onOwnerChanged}                                     | Occurs when the group ownership is transferred.                                    |
| {@link ChatGroupEventListener.onMemberJoined onMemberJoined}                                     | Occurs when a member joins a group.                                                |
| {@link ChatGroupEventListener.onMemberExited onMemberExited}                                     | Occurs when a member proactively leaves the group.                                 |
| {@link ChatGroupEventListener.onAnnouncementChanged onAnnouncementChanged}                       | Occurs when the announcement is updated.                                           |
| {@link ChatGroupEventListener.onSharedFileAdded onSharedFileAdded}                               | Occurs when a shared file is added to a group.                                     |
| {@link ChatGroupEventListener.onSharedFileDeleted onSharedFileDeleted}                           | Occurs when a shared file is removed from a group.                                 |

## Chat Room

| Method                                                                                        | Description                                                                   |
| :-------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| {@link ChatRoomManager.createChatRoom createChatRoom}                                         | Creates a chat room.                                                          |
| {@link ChatRoomManager.destroyChatRoom destroyChatRoom}                                       | Destroys a chat room.                                                         |
| {@link ChatRoomManager.joinChatRoom joinChatRoom}                                             | Joins a chat room.                                                            |
| {@link ChatRoomManager.leaveChatRoom leaveChatRoom}                                           | Exits a chat room.                                                            |
| {@link ChatRoomManager.fetchPublicChatRoomsFromServer fetchPublicChatRoomsFromServer}         | Gets chat room data from the server with pagination.                          |
| {@link ChatRoomManager.fetchChatRoomInfoFromServer fetchChatRoomInfoFromServer}               | Gets details of a chat room from the server.                                  |
| {@link ChatRoomManager.changeChatRoomSubject changeChatRoomSubject}                           | Changes the chat room name.                                                   |
| {@link ChatRoomManager.changeChatRoomDescription changeChatRoomDescription}                   | Modifies the chat room description.                                           |
| {@link ChatRoomManager.fetchChatRoomMembers fetchChatRoomMembers}                             | Gets the chat room member list.                                               |
| {@link ChatRoomManager.muteChatRoomMembers muteChatRoomMembers}                               | Mutes members in a chat room.                                                 |
| {@link ChatRoomManager.unMuteChatRoomMembers unMuteChatRoomMembers}                           | Unmutes members in a chat room.                                               |
| {@link ChatRoomManager.addChatRoomAdmin addChatRoomAdmin}                                     | Adds a chat room admin.                                                       |
| {@link ChatRoomManager.removeChatRoomAdmin removeChatRoomAdmin}                               | Removes the administrative privilege of a chat room admin.                    |
| {@link ChatRoomManager.fetchChatRoomMuteList fetchChatRoomMuteList}                           | Gets the list of muted chat room members from the server.                     |
| {@link ChatRoomManager.removeChatRoomMembers removeChatRoomMembers}                           | Removes members from a chat room.                                             |
| {@link ChatRoomManager.blockChatRoomMembers blockChatRoomMembers}                             | Adds members to the block list of the chat room.                              |
| {@link ChatRoomManager.unBlockChatRoomMembers unBlockChatRoomMembers}                         | Removes members from the block list of the chat room.                         |
| {@link ChatRoomManager.fetchChatRoomBlockList fetchChatRoomBlockList}                         | Gets the chat room block list with pagination.                                |
| {@link ChatRoomManager.addMembersToChatRoomAllowList addMembersToChatRoomAllowList}           | Adds members to the allow list of the chat room.                              |
| {@link ChatRoomManager.removeMembersFromChatRoomAllowList removeMembersFromChatRoomAllowList} | Removes members from the chat room block list.                                |
| {@link ChatRoomManager.fetchChatRoomAllowListFromServer fetchChatRoomAllowListFromServer}     | Gets the chat room allow list from the server.                                |
| {@link ChatRoomManager.muteAllChatRoomMembers muteAllChatRoomMembers}                         | Mutes all members.                                                            |
| {@link ChatRoomManager.unMuteAllChatRoomMembers unMuteAllChatRoomMembers}                     | Unmutes all members.                                                          |
| {@link ChatRoomManager.updateChatRoomAnnouncement updateChatRoomAnnouncement}                 | Updates the chat room announcement.                                           |
| {@link ChatRoomManager.fetchChatRoomAnnouncement fetchChatRoomAnnouncement}                   | Gets the chat room announcement from the server.                              |
| {@link ChatRoomManager.addAttributes addAttributes}                                           | Adds custom chat room attributes.                                             |
| {@link ChatRoomManager.fetchChatRoomAttributes fetchChatRoomAttributes}                       | Gets the list of custom chat room attributes based on the attribute key list. |
| {@link ChatRoomManager.removeAttributes removeAttributes}                                     | Removes custom chat room attributes by the attribute key list.                |
| {@link ChatRoomManager.addRoomListener addRoomListener}                                       | Adds a chat room event listener.                                              |
| {@link ChatRoomManager.removeRoomListener removeRoomListener}                                 | Removes a chat room event listener.                                           |
| {@link ChatRoomManager.removeAllRoomListener removeAllRoomListener}                           | Removes all chat room event listeners.                                        |

| Event                                                                                                 | Description                                                          |
| :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| {@link ChatRoomEventListener.onChatRoomDestroyed onChatRoomDestroyed}                                 | Occurs when the chat room is destroyed.                              |
| {@link ChatRoomEventListener.onMemberJoined onMemberJoined}                                           | Occurs when a member joins the chat room.                            |
| {@link ChatRoomEventListener.onMemberExited onMemberExited}                                           | Occurs when a member exits the chat room.                            |
| {@link ChatRoomEventListener.onRemoved onRemoved}                                                     | Occurs when a member is removed from a chat room.                    |
| {@link ChatRoomEventListener.onMuteListAdded onMuteListAdded}                                         | Occurs when the chat room member is/are added to the mute list.      |
| {@link ChatRoomEventListener.onMuteListRemoved onMuteListRemoved}                                     | Occurs when the chat room member is/are removed from the mute list.  |
| {@link ChatRoomEventListener.onAllowListAdded onAllowListAdded}                                       | Occurs when the chat room member is/are added to the allow list.     |
| {@link ChatRoomEventListener.onAllowListRemoved onAllowListRemoved}                                   | Occurs when the chat room member is/are removed from the allow list. |
| {@link ChatRoomEventListener.onAllChatRoomMemberMuteStateChanged onAllChatRoomMemberMuteStateChanged} | Occurs when all members in the chat room are muted or unmuted.       |
| {@link ChatRoomEventListener.onAdminAdded onAdminAdded}                                               | Occurs when a chat room member is set as an admin.                   |
| {@link ChatRoomEventListener.onAdminRemoved onAdminRemoved}                                           | Occurs when the chat room member is/are removed from the admin list. |
| {@link ChatRoomEventListener.onOwnerChanged onOwnerChanged}                                           | Occurs when the chat room owner is changed.                          |
| {@link ChatRoomEventListener.onAnnouncementChanged onAnnouncementChanged}                             | Occurs when the chat room announcement changes.                      |
| {@link ChatRoomEventListener.onSpecificationChanged onSpecificationChanged}                           | Occurs when the chat room specifications changes.                    |
| {@link ChatRoomEventListener.onAttributesUpdated onAttributesUpdated}                                 | Occurs when the custom chat room attribute is/are updated.           |
| {@link ChatRoomEventListener.onAttributesRemoved onAttributesRemoved}                                 | Occurs when the custom chat room attribute is/are removed.           |

## Presence

| Method                                                                          | Description                                                                          |
| :------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
| {@link ChatPresenceManager.publishPresence publishPresence}                     | Publishes a custom presence state.                                                   |
| {@link ChatPresenceManager.subscribe subscribe}                                 | Subscribes to a user's presence states.                                              |
| {@link ChatPresenceManager.unsubscribe unsubscribe}                             | Unsubscribes from a user's presence states.                                          |
| {@link ChatPresenceManager.fetchSubscribedMembers fetchSubscribedMembers}       | Uses pagination to get a list of users whose presence states you have subscribed to. |
| {@link ChatPresenceManager.fetchPresenceStatus fetchPresenceStatus}             | Gets the current presence state of users.                                            |
| {@link ChatPresenceManager.addPresenceListener addPresenceListener}             | Adds a presence listener.                                                            |
| {@link ChatPresenceManager.removePresenceListener removePresenceListener}       | Removes a presence listener.                                                         |
| {@link ChatPresenceManager.removeAllPresenceListener removeAllPresenceListener} | Removes all presence listeners.                                                      |

| Event                                                                             | Description                                                       |
| :-------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| {@link ChatPresenceEventListener.onPresenceStatusChanged onPresenceStatusChanged} | Occurs when the presence state of the user subscribed is updated. |

## Threading

| Method                                                                                                  | Description                                                                                                     |
| :------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------- |
| {@link ChatManager.createChatThread createChatThread}                                                   | Creates a message thread.                                                                                       |
| {@link ChatManager.joinChatThread joinChatThread}                                                       | Joins a message thread.                                                                                         |
| {@link ChatManager.destroyChatThread destroyChatThread}                                                 | Destroys the message thread.                                                                                    |
| {@link ChatManager.leaveChatThread leaveChatThread}                                                     | Leaves a message thread.                                                                                        |
| {@link ChatManager.getMessageThread getMessageThread}                                                   | Gets the details of the message thread from the server.                                                         |
| {@link ChatManager.updateChatThreadName updateChatThreadName}                                           | Changes the name of the message thread.                                                                         |
| {@link ChatManager.removeMemberWithChatThread removeMemberWithChatThread}                               | Removes a member from the message thread.                                                                       |
| {@link ChatManager.fetchMembersWithChatThreadFromServer fetchMembersWithChatThreadFromServer}           | Gets a list of members in the message thread with pagination.                                                   |
| {@link ChatManager.fetchJoinedChatThreadFromServer fetchJoinedChatThreadFromServer}                     | Uses the pagination to get the list of message threads that the current user has joined.                        |
| {@link ChatManager.fetchJoinedChatThreadWithParentFromServer fetchJoinedChatThreadWithParentFromServer} | Uses the pagination to get the list of message threads that the current user has joined in the specified group. |
| {@link ChatManager.fetchChatThreadWithParentFromServer fetchChatThreadWithParentFromServer}             | Uses the pagination to get the list of message threads in the specified group.                                  |
| {@link ChatManager.fetchChatThreadFromServer fetchChatThreadFromServer}                                 | Uses the pagination to get the list of message threads in the specified group.                                  |
| {@link ChatManager.fetchLastMessageWithChatThread fetchLastMessageWithChatThread}                       | Gets the last reply in the specified message threads from the server.                                           |

| Event                                                                                          | Description                                                                                                                              |
| :--------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| {@link ChatMessageEventListener.onChatMessageThreadCreated onChatMessageThreadCreated}         | Occurs when a message thread is created.                                                                                                 |
| {@link ChatMessageEventListener.onChatMessageThreadUpdated onChatMessageThreadUpdated}         | Occurs when a message thread is updated.                                                                                                 |
| {@link ChatMessageEventListener.onChatMessageThreadDestroyed onChatMessageThreadDestroyed}     | Occurs when a message thread is destroyed.                                                                                               |
| {@link ChatMessageEventListener.onChatMessageThreadUserRemoved onChatMessageThreadUserRemoved} | Occurs when the current user is removed from the message thread by the group owner or a group admin to which the message thread belongs. |

## Offline push

| Method                                                                                  | Description                                                                |
| :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| {@link ChatPushManager.fetchPushOptionFromServer fetchPushOptionFromServer}             | Gets the push configurations from the server.                              |
| {@link ChatPushManager.updatePushNickname updatePushNickname}                           | Updates the push display nickname of the current user.                     |
| {@link ChatPushManager.setSilentModeForConversation setSilentModeForConversation}       | Sets the DND of the conversation.                                          |
| {@link ChatPushManager.removeSilentModeForConversation removeSilentModeForConversation} | Clears the setting of offline push notification type for the conversation. |
| {@link ChatPushManager.fetchSilentModeForConversation fetchSilentModeForConversation}   | Gets the DND setting of the conversation.                                  |
| {@link ChatPushManager.setSilentModeForAll setSilentModeForAll}                         | Sets the DND settings for the current login user.                          |
| {@link ChatPushManager.fetchSilentModeForAll fetchSilentModeForAll}                     | Gets the DND settings of the current logged-in user.                       |
| {@link ChatPushManager.fetchSilentModeForConversations fetchSilentModeForConversations} | Obtains the DND Settings of specified conversations in batches.            |

## User Attributes

| Method                                                          | Description                                          |
| :-------------------------------------------------------------- | :--------------------------------------------------- |
| {@link ChatUserInfoManager.updateOwnUserInfo updateOwnUserInfo} | Modifies information of the current user.            |
| {@link ChatUserInfoManager.fetchUserInfoById fetchUserInfoById} | Gets user information by user ID.                    |
| {@link ChatUserInfoManager.fetchOwnInfo fetchOwnInfo}           | Gets attributes of the current user from the server. |
