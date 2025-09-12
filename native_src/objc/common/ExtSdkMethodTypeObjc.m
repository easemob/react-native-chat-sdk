//
//  ExtSdkMethodType.m
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/11.
//

#import "ExtSdkMethodTypeObjc.h"

@implementation ExtSdkMethodTypeObjc

+ (int)getEnumValue:(nonnull NSString *)key {
    static NSDictionary *methodMap;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      methodMap = @{

          /// EMClientWrapper
          ExtSdkMethodKeyInit : @(ExtSdkMethodKeyInitValue),
          ExtSdkMethodKeyCreateAccount : @(ExtSdkMethodKeyCreateAccountValue),
          ExtSdkMethodKeyLogin : @(ExtSdkMethodKeyLoginValue),
          ExtSdkMethodKeyLogout : @(ExtSdkMethodKeyLogoutValue),
          ExtSdkMethodKeyChangeAppKey : @(ExtSdkMethodKeyChangeAppKeyValue),
          ExtSdkMethodKeyIsLoggedInBefore : @(ExtSdkMethodKeyIsLoggedInBeforeValue),
          ExtSdkMethodKeyUploadLog : @(ExtSdkMethodKeyUploadLogValue),
          ExtSdkMethodKeyCompressLogs : @(ExtSdkMethodKeyCompressLogsValue),
          ExtSdkMethodKeyKickDevice : @(ExtSdkMethodKeyKickDeviceValue),
          ExtSdkMethodKeyKickAllDevices : @(ExtSdkMethodKeyKickAllDevicesValue),
          ExtSdkMethodKeyCurrentUser : @(ExtSdkMethodKeyCurrentUserValue),
          ExtSdkMethodKeyGetLoggedInDevicesFromServer : @(ExtSdkMethodKeyGetLoggedInDevicesFromServerValue),
          ExtSdkMethodKeyGetToken : @(ExtSdkMethodKeyGetTokenValue),
          ExtSdkMethodKeyLoginWithAgoraToken : @(ExtSdkMethodKeyLoginWithAgoraTokenValue),
          ExtSdkMethodKeyGetCurrentUser : @(ExtSdkMethodKeyGetCurrentUserValue),
          ExtSdkMethodKeyIsConnected : @(ExtSdkMethodKeyIsConnectedValue),
          ExtSdkMethodKeyRenewToken : @(ExtSdkMethodKeyRenewTokenValue),

          /// EMClientDelegate
          ExtSdkMethodKeyOnConnected : @(ExtSdkMethodKeyOnConnectedValue),
          ExtSdkMethodKeyOnDisconnected : @(ExtSdkMethodKeyOnDisconnectedValue),
          ExtSdkMethodKeyOnMultiDeviceEvent : @(ExtSdkMethodKeyOnMultiDeviceEventValue),
          ExtSdkMethodKeySendDataToFlutter : @(ExtSdkMethodKeySendDataToFlutterValue),
          ExtSdkMethodKeyOnTokenWillExpire : @(ExtSdkMethodKeyOnTokenWillExpireValue),
          ExtSdkMethodKeyOnTokenDidExpire : @(ExtSdkMethodKeyOnTokenDidExpireValue),
          ExtSdkMethodKeyOnUserDidLoginFromOtherDevice : @(ExtSdkMethodKeyOnUserDidLoginFromOtherDeviceValue),
          ExtSdkMethodKeyOnUserDidRemoveFromServer : @(ExtSdkMethodKeyOnUserDidRemoveFromServerValue),
          ExtSdkMethodKeyOnUserDidForbidByServer : @(ExtSdkMethodKeyOnUserDidForbidByServerValue),
          ExtSdkMethodKeyOnUserDidChangePassword : @(ExtSdkMethodKeyOnUserDidChangePasswordValue),
          ExtSdkMethodKeyOnUserDidLoginTooManyDevice : @(ExtSdkMethodKeyOnUserDidLoginTooManyDeviceValue),
          ExtSdkMethodKeyOnUserKickedByOtherDevice : @(ExtSdkMethodKeyOnUserKickedByOtherDeviceValue),
          ExtSdkMethodKeyOnUserAuthenticationFailed : @(ExtSdkMethodKeyOnUserAuthenticationFailedValue),

          /// EMContactManagerWrapper
          ExtSdkMethodKeyAddContact : @(ExtSdkMethodKeyAddContactValue),
          ExtSdkMethodKeyDeleteContact : @(ExtSdkMethodKeyDeleteContactValue),
          ExtSdkMethodKeyGetAllContactsFromServer : @(ExtSdkMethodKeyGetAllContactsFromServerValue),
          ExtSdkMethodKeyGetAllContactsFromDB : @(ExtSdkMethodKeyGetAllContactsFromDBValue),
          ExtSdkMethodKeyAddUserToBlockList : @(ExtSdkMethodKeyAddUserToBlockListValue),
          ExtSdkMethodKeyRemoveUserFromBlockList : @(ExtSdkMethodKeyRemoveUserFromBlockListValue),
          ExtSdkMethodKeyGetBlockListFromServer : @(ExtSdkMethodKeyGetBlockListFromServerValue),
          ExtSdkMethodKeyGetBlockListFromDB : @(ExtSdkMethodKeyGetBlockListFromDBValue),
          ExtSdkMethodKeyAcceptInvitation : @(ExtSdkMethodKeyAcceptInvitationValue),
          ExtSdkMethodKeyDeclineInvitation : @(ExtSdkMethodKeyDeclineInvitationValue),
          ExtSdkMethodKeyGetSelfIdsOnOtherPlatform : @(ExtSdkMethodKeyGetSelfIdsOnOtherPlatformValue),

          /// EMContactDelegate
          ExtSdkMethodKeyOnContactChanged : @(ExtSdkMethodKeyOnContactChangedValue),

          /// EMChatManagerWrapper
          ExtSdkMethodKeySendMessage : @(ExtSdkMethodKeySendMessageValue),
          ExtSdkMethodKeyResendMessage : @(ExtSdkMethodKeyResendMessageValue),
          ExtSdkMethodKeyAckMessageRead : @(ExtSdkMethodKeyAckMessageReadValue),
          ExtSdkMethodKeyAckGroupMessageRead : @(ExtSdkMethodKeyAckGroupMessageReadValue),
          ExtSdkMethodKeyAckConversationRead : @(ExtSdkMethodKeyAckConversationReadValue),
          ExtSdkMethodKeyRecallMessage : @(ExtSdkMethodKeyRecallMessageValue),
          ExtSdkMethodKeyGetConversation : @(ExtSdkMethodKeyGetConversationValue),
          ExtSdkMethodKeyMarkAllChatMsgAsRead : @(ExtSdkMethodKeyMarkAllChatMsgAsReadValue),
          ExtSdkMethodKeyGetUnreadMessageCount : @(ExtSdkMethodKeyGetUnreadMessageCountValue),
          ExtSdkMethodKeyUpdateChatMessage : @(ExtSdkMethodKeyUpdateChatMessageValue),
          ExtSdkMethodKeyDownloadAttachment : @(ExtSdkMethodKeyDownloadAttachmentValue),
          ExtSdkMethodKeyDownloadThumbnail : @(ExtSdkMethodKeyDownloadThumbnailValue),
          ExtSdkMethodKeyDownloadAttachmentInCombine : @(ExtSdkMethodKeyDownloadAttachmentInCombineValue),
          ExtSdkMethodKeyDownloadThumbnailInCombine : @(ExtSdkMethodKeyDownloadThumbnailInCombineValue),
          ExtSdkMethodKeyImportMessages : @(ExtSdkMethodKeyImportMessagesValue),
          ExtSdkMethodKeyLoadAllConversations : @(ExtSdkMethodKeyLoadAllConversationsValue),
          ExtSdkMethodKeyGetConversationsFromServer : @(ExtSdkMethodKeyGetConversationsFromServerValue),

          ExtSdkMethodKeyDeleteConversation : @(ExtSdkMethodKeyDeleteConversationValue),
          // ExtSdkMethodKeySetVoiceMessageListened: @(ExtSdkMethodKeySetVoiceMessageListenedValue),
          // ExtSdkMethodKeyUpdateParticipant: @(ExtSdkMethodKeyUpdateParticipantValue),
          ExtSdkMethodKeyUpdateConversationsName : @(ExtSdkMethodKeyUpdateConversationsNameValue),
          ExtSdkMethodKeyFetchHistoryMessages : @(ExtSdkMethodKeyFetchHistoryMessagesValue),
          ExtSdkMethodKeySearchChatMsgFromDB : @(ExtSdkMethodKeySearchChatMsgFromDBValue),
          ExtSdkMethodKeyGetMessage : @(ExtSdkMethodKeyGetMessageValue),
          ExtSdkMethodKeyAsyncFetchGroupAcks : @(ExtSdkMethodKeyAsyncFetchGroupAcksValue),
          ExtSdkMethodKeydeleteRemoteConversation : @(ExtSdkMethodKeydeleteRemoteConversationValue),
          ExtSdkMethodKeyDeleteMessagesBeforeTimestamp : @(ExtSdkMethodKeyDeleteMessagesBeforeTimestampValue),

          ExtSdkMethodKeyTranslateMessage : @(ExtSdkMethodKeyTranslateMessageValue),
          ExtSdkMethodKeyFetchSupportedLanguages : @(ExtSdkMethodKeyFetchSupportedLanguagesValue),

          ExtSdkMethodKeyChatAddReaction : @(ExtSdkMethodKeyChatAddReactionValue),
          ExtSdkMethodKeyChatRemoveReaction : @(ExtSdkMethodKeyChatRemoveReactionValue),
          ExtSdkMethodKeyChatFetchReactionList : @(ExtSdkMethodKeyChatFetchReactionListValue),
          ExtSdkMethodKeyChatFetchReactionDetail : @(ExtSdkMethodKeyChatFetchReactionDetailValue),
          ExtSdkMethodKeyChatReportMessage : @(ExtSdkMethodKeyChatReportMessageValue),
          
          ExtSdkMethodKeyFetchConversationsFromServerWithPage : @(ExtSdkMethodKeyFetchConversationsFromServerWithPageValue),
          ExtSdkMethodKeyRemoveMessagesFromServerWithMsgIds : @(ExtSdkMethodKeyRemoveMessagesFromServerWithMsgIdsValue),
          ExtSdkMethodKeyRemoveMessagesFromServerWithTs : @(ExtSdkMethodKeyRemoveMessagesFromServerWithTsValue),

          /// EMChatManagerDelegate
          ExtSdkMethodKeyOnMessagesReceived : @(ExtSdkMethodKeyOnMessagesReceivedValue),
          ExtSdkMethodKeyOnCmdMessagesReceived : @(ExtSdkMethodKeyOnCmdMessagesReceivedValue),
          ExtSdkMethodKeyOnMessagesRead : @(ExtSdkMethodKeyOnMessagesReadValue),
          ExtSdkMethodKeyOnGroupMessageRead : @(ExtSdkMethodKeyOnGroupMessageReadValue),
          ExtSdkMethodKeyOnMessagesDelivered : @(ExtSdkMethodKeyOnMessagesDeliveredValue),
          ExtSdkMethodKeyOnMessagesRecalled : @(ExtSdkMethodKeyOnMessagesRecalledValue),

          ExtSdkMethodKeyOnConversationUpdate : @(ExtSdkMethodKeyOnConversationUpdateValue),
          ExtSdkMethodKeyOnConversationHasRead : @(ExtSdkMethodKeyOnConversationHasReadValue),

          ExtSdkMethodKeyChatOnReadAckForGroupMessageUpdated : @(ExtSdkMethodKeyChatOnReadAckForGroupMessageUpdatedValue),
          ExtSdkMethodKeyChatOnMessageReactionDidChange : @(ExtSdkMethodKeyChatOnMessageReactionDidChangeValue),

          /// EMMessageListener
          ExtSdkMethodKeyOnMessageProgressUpdate : @(ExtSdkMethodKeyOnMessageProgressUpdateValue),
          ExtSdkMethodKeyOnMessageSuccess : @(ExtSdkMethodKeyOnMessageSuccessValue),
          ExtSdkMethodKeyOnMessageError : @(ExtSdkMethodKeyOnMessageErrorValue),
          ExtSdkMethodKeyOnMessageReadAck : @(ExtSdkMethodKeyOnMessageReadAckValue),
          ExtSdkMethodKeyOnMessageDeliveryAck : @(ExtSdkMethodKeyOnMessageDeliveryAckValue),
          ExtSdkMethodKeyOnMessageStatusChanged : @(ExtSdkMethodKeyOnMessageStatusChangedValue),

          /// EMConversationWrapper

          ExtSdkMethodKeyGetUnreadMsgCount : @(ExtSdkMethodKeyGetUnreadMsgCountValue),
          ExtSdkMethodKeyMarkAllMsgsAsRead : @(ExtSdkMethodKeyMarkAllMsgsAsReadValue),
          ExtSdkMethodKeyMarkMsgAsRead : @(ExtSdkMethodKeyMarkMsgAsReadValue),
          ExtSdkMethodKeySyncConversationExt : @(ExtSdkMethodKeySyncConversationExtValue),
          ExtSdkMethodKeySyncConversationName : @(ExtSdkMethodKeySyncConversationNameValue),
          ExtSdkMethodKeyRemoveMsg : @(ExtSdkMethodKeyRemoveMsgValue),
          ExtSdkMethodKeyGetLatestMsg : @(ExtSdkMethodKeyGetLatestMsgValue),
          ExtSdkMethodKeyGetLatestMsgFromOthers : @(ExtSdkMethodKeyGetLatestMsgFromOthersValue),
          ExtSdkMethodKeyClearAllMsg : @(ExtSdkMethodKeyClearAllMsgValue),
          ExtSdkMethodKeyInsertMsg : @(ExtSdkMethodKeyInsertMsgValue),
          ExtSdkMethodKeyAppendMsg : @(ExtSdkMethodKeyAppendMsgValue),
          ExtSdkMethodKeyUpdateConversationMsg : @(ExtSdkMethodKeyUpdateConversationMsgValue),

          ExtSdkMethodKeyLoadMsgWithId : @(ExtSdkMethodKeyLoadMsgWithIdValue),
          ExtSdkMethodKeyLoadMsgWithStartId : @(ExtSdkMethodKeyLoadMsgWithStartIdValue),
          ExtSdkMethodKeyLoadMsgWithKeywords : @(ExtSdkMethodKeyLoadMsgWithKeywordsValue),
          ExtSdkMethodKeyLoadMsgWithMsgType : @(ExtSdkMethodKeyLoadMsgWithMsgTypeValue),
          ExtSdkMethodKeyLoadMsgWithTime : @(ExtSdkMethodKeyLoadMsgWithTimeValue),

          ExtSdkMethodKeyChatGetReactionList : @(ExtSdkMethodKeyChatGetReactionListValue),
          ExtSdkMethodKeyChatGroupAckCount : @(ExtSdkMethodKeyChatGroupAckCountValue),

          /// EMChatroomManagerWrapper

          ExtSdkMethodKeyJoinChatRoom : @(ExtSdkMethodKeyJoinChatRoomValue),
          ExtSdkMethodKeyLeaveChatRoom : @(ExtSdkMethodKeyLeaveChatRoomValue),
          ExtSdkMethodKeyGetChatroomsFromServer : @(ExtSdkMethodKeyGetChatroomsFromServerValue),
          ExtSdkMethodKeyFetchChatRoomFromServer : @(ExtSdkMethodKeyFetchChatRoomFromServerValue),
          ExtSdkMethodKeyGetChatRoom : @(ExtSdkMethodKeyGetChatRoomValue),
          ExtSdkMethodKeyGetAllChatRooms : @(ExtSdkMethodKeyGetAllChatRoomsValue),
          ExtSdkMethodKeyCreateChatRoom : @(ExtSdkMethodKeyCreateChatRoomValue),
          ExtSdkMethodKeyDestroyChatRoom : @(ExtSdkMethodKeyDestroyChatRoomValue),
          ExtSdkMethodKeyChatRoomUpdateSubject : @(ExtSdkMethodKeyChatRoomUpdateSubjectValue),
          ExtSdkMethodKeyChatRoomUpdateDescription : @(ExtSdkMethodKeyChatRoomUpdateDescriptionValue),
          ExtSdkMethodKeyGetChatroomMemberListFromServer : @(ExtSdkMethodKeyGetChatroomMemberListFromServerValue),
          ExtSdkMethodKeyChatRoomMuteMembers : @(ExtSdkMethodKeyChatRoomMuteMembersValue),
          ExtSdkMethodKeyChatRoomUnmuteMembers : @(ExtSdkMethodKeyChatRoomUnmuteMembersValue),
          ExtSdkMethodKeyChangeChatRoomOwner : @(ExtSdkMethodKeyChangeChatRoomOwnerValue),
          ExtSdkMethodKeyChatRoomAddAdmin : @(ExtSdkMethodKeyChatRoomAddAdminValue),
          ExtSdkMethodKeyChatRoomRemoveAdmin : @(ExtSdkMethodKeyChatRoomRemoveAdminValue),
          ExtSdkMethodKeyGetChatroomMuteListFromServer : @(ExtSdkMethodKeyGetChatroomMuteListFromServerValue),
          ExtSdkMethodKeyChatRoomRemoveMembers : @(ExtSdkMethodKeyChatRoomRemoveMembersValue),
          ExtSdkMethodKeyChatRoomBlockMembers : @(ExtSdkMethodKeyChatRoomBlockMembersValue),
          ExtSdkMethodKeyChatRoomUnblockMembers : @(ExtSdkMethodKeyChatRoomUnblockMembersValue),
          ExtSdkMethodKeyFetchChatroomBlockListFromServer : @(ExtSdkMethodKeyFetchChatroomBlockListFromServerValue),
          ExtSdkMethodKeyUpdateChatRoomAnnouncement : @(ExtSdkMethodKeyUpdateChatRoomAnnouncementValue),
          ExtSdkMethodKeyFetchChatroomAnnouncement : @(ExtSdkMethodKeyFetchChatroomAnnouncementValue),

          ExtSdkMethodKeyAddMembersToChatRoomWhiteList : @(ExtSdkMethodKeyAddMembersToChatRoomWhiteListValue),
          ExtSdkMethodKeyRemoveMembersFromChatRoomWhiteList : @(ExtSdkMethodKeyRemoveMembersFromChatRoomWhiteListValue),
          ExtSdkMethodKeyFetchChatRoomWhiteListFromServer : @(ExtSdkMethodKeyFetchChatRoomWhiteListFromServerValue),
          ExtSdkMethodKeyIsMemberInChatRoomWhiteListFromServer : @(ExtSdkMethodKeyIsMemberInChatRoomWhiteListFromServerValue),

          ExtSdkMethodKeyMuteAllChatRoomMembers : @(ExtSdkMethodKeyMuteAllChatRoomMembersValue),
          ExtSdkMethodKeyUnMuteAllChatRoomMembers : @(ExtSdkMethodKeyUnMuteAllChatRoomMembersValue),
          
          MKfetchChatRoomAttributes : @(MKfetchChatRoomAttributesValue),
          MKfetchChatRoomAllAttributes : @(MKfetchChatRoomAllAttributesValue),
          MKsetChatRoomAttributes : @(MKsetChatRoomAttributesValue),
          MKremoveChatRoomAttributes : @(MKremoveChatRoomAttributesValue),

          ExtSdkMethodKeyChatroomChanged : @(ExtSdkMethodKeyChatroomChangedValue),

          /// EMGroupManagerWrapper

          ExtSdkMethodKeyGetGroupWithId : @(ExtSdkMethodKeyGetGroupWithIdValue),
          ExtSdkMethodKeyGetJoinedGroups : @(ExtSdkMethodKeyGetJoinedGroupsValue),
          ExtSdkMethodKeyGetGroupsWithoutPushNotification : @(ExtSdkMethodKeyGetGroupsWithoutPushNotificationValue),
          ExtSdkMethodKeyGetJoinedGroupsFromServer : @(ExtSdkMethodKeyGetJoinedGroupsFromServerValue),
          ExtSdkMethodKeyGetPublicGroupsFromServer : @(ExtSdkMethodKeyGetPublicGroupsFromServerValue),
          ExtSdkMethodKeyCreateGroup : @(ExtSdkMethodKeyCreateGroupValue),
          ExtSdkMethodKeyGetGroupSpecificationFromServer : @(ExtSdkMethodKeyGetGroupSpecificationFromServerValue),
          ExtSdkMethodKeyGetGroupMemberListFromServer : @(ExtSdkMethodKeyGetGroupMemberListFromServerValue),
          ExtSdkMethodKeyGetGroupBlockListFromServer : @(ExtSdkMethodKeyGetGroupBlockListFromServerValue),
          ExtSdkMethodKeyGetGroupMuteListFromServer : @(ExtSdkMethodKeyGetGroupMuteListFromServerValue),
          ExtSdkMethodKeyGetGroupWhiteListFromServer : @(ExtSdkMethodKeyGetGroupWhiteListFromServerValue),
          ExtSdkMethodKeyIsMemberInWhiteListFromServer : @(ExtSdkMethodKeyIsMemberInWhiteListFromServerValue),
          ExtSdkMethodKeyGetGroupFileListFromServer : @(ExtSdkMethodKeyGetGroupFileListFromServerValue),
          ExtSdkMethodKeyGetGroupAnnouncementFromServer : @(ExtSdkMethodKeyGetGroupAnnouncementFromServerValue),
          ExtSdkMethodKeyAddMembers : @(ExtSdkMethodKeyAddMembersValue),
          ExtSdkMethodKeyInviterUser : @(ExtSdkMethodKeyInviterUserValue),
          ExtSdkMethodKeyRemoveMembers : @(ExtSdkMethodKeyRemoveMembersValue),
          ExtSdkMethodKeyBlockMembers : @(ExtSdkMethodKeyBlockMembersValue),
          ExtSdkMethodKeyUnblockMembers : @(ExtSdkMethodKeyUnblockMembersValue),
          ExtSdkMethodKeyUpdateGroupSubject : @(ExtSdkMethodKeyUpdateGroupSubjectValue),
          ExtSdkMethodKeyUpdateDescription : @(ExtSdkMethodKeyUpdateDescriptionValue),
          ExtSdkMethodKeyLeaveGroup : @(ExtSdkMethodKeyLeaveGroupValue),
          ExtSdkMethodKeyDestroyGroup : @(ExtSdkMethodKeyDestroyGroupValue),
          ExtSdkMethodKeyBlockGroup : @(ExtSdkMethodKeyBlockGroupValue),
          ExtSdkMethodKeyUnblockGroup : @(ExtSdkMethodKeyUnblockGroupValue),
          ExtSdkMethodKeyUpdateGroupOwner : @(ExtSdkMethodKeyUpdateGroupOwnerValue),
          ExtSdkMethodKeyAddAdmin : @(ExtSdkMethodKeyAddAdminValue),
          ExtSdkMethodKeyRemoveAdmin : @(ExtSdkMethodKeyRemoveAdminValue),
          ExtSdkMethodKeyMuteMembers : @(ExtSdkMethodKeyMuteMembersValue),
          ExtSdkMethodKeyUnMuteMembers : @(ExtSdkMethodKeyUnMuteMembersValue),
          ExtSdkMethodKeyMuteAllMembers : @(ExtSdkMethodKeyMuteAllMembersValue),
          ExtSdkMethodKeyUnMuteAllMembers : @(ExtSdkMethodKeyUnMuteAllMembersValue),
          ExtSdkMethodKeyAddWhiteList : @(ExtSdkMethodKeyAddWhiteListValue),
          ExtSdkMethodKeyRemoveWhiteList : @(ExtSdkMethodKeyRemoveWhiteListValue),
          ExtSdkMethodKeyUploadGroupSharedFile : @(ExtSdkMethodKeyUploadGroupSharedFileValue),
          ExtSdkMethodKeyDownloadGroupSharedFile : @(ExtSdkMethodKeyDownloadGroupSharedFileValue),
          ExtSdkMethodKeyRemoveGroupSharedFile : @(ExtSdkMethodKeyRemoveGroupSharedFileValue),
          ExtSdkMethodKeyUpdateGroupAnnouncement : @(ExtSdkMethodKeyUpdateGroupAnnouncementValue),
          ExtSdkMethodKeyUpdateGroupExt : @(ExtSdkMethodKeyUpdateGroupExtValue),
          ExtSdkMethodKeyJoinPublicGroup : @(ExtSdkMethodKeyJoinPublicGroupValue),
          ExtSdkMethodKeyRequestToJoinPublicGroup : @(ExtSdkMethodKeyRequestToJoinPublicGroupValue),
          ExtSdkMethodKeyAcceptJoinApplication : @(ExtSdkMethodKeyAcceptJoinApplicationValue),
          ExtSdkMethodKeyDeclineJoinApplication : @(ExtSdkMethodKeyDeclineJoinApplicationValue),
          ExtSdkMethodKeyAcceptInvitationFromGroup : @(ExtSdkMethodKeyAcceptInvitationFromGroupValue),
          ExtSdkMethodKeyDeclineInvitationFromGroup : @(ExtSdkMethodKeyDeclineInvitationFromGroupValue),
          ExtSdkMethodKeyIgnoreGroupPush : @(ExtSdkMethodKeyIgnoreGroupPushValue),

          ExtSdkMethodKeyOnGroupChanged : @(ExtSdkMethodKeyOnGroupChangedValue),

          /// EMPushManagerWrapper
          ExtSdkMethodKeyGetImPushConfig : @(ExtSdkMethodKeyGetImPushConfigValue),
          ExtSdkMethodKeyGetImPushConfigFromServer : @(ExtSdkMethodKeyGetImPushConfigFromServerValue),
          ExtSdkMethodKeyUpdatePushNickname : @(ExtSdkMethodKeyUpdatePushNicknameValue),

          ExtSdkMethodKeyImPushNoDisturb : @(ExtSdkMethodKeyImPushNoDisturbValue),
          ExtSdkMethodKeyUpdateImPushStyle : @(ExtSdkMethodKeyUpdateImPushStyleValue),
          ExtSdkMethodKeyUpdateGroupPushService : @(ExtSdkMethodKeyUpdateGroupPushServiceValue),
          ExtSdkMethodKeyGetNoDisturbGroups : @(ExtSdkMethodKeyGetNoDisturbGroupsValue),
          ExtSdkMethodKeyBindDeviceToken : @(ExtSdkMethodKeyBindDeviceTokenValue),
          ExtSdkMethodKeyEnablePush : @(ExtSdkMethodKeyEnablePushValue),
          ExtSdkMethodKeyDisablePush : @(ExtSdkMethodKeyDisablePushValue),
          ExtSdkMethodKeyGetNoPushGroups : @(ExtSdkMethodKeyGetNoPushGroupsValue),
          ExtSdkMethodKeySetNoDisturbUsers : @(ExtSdkMethodKeySetNoDisturbUsersValue),
          ExtSdkMethodKeyGetNoDisturbUsersFromServer : @(ExtSdkMethodKeyGetNoDisturbUsersFromServerValue),
          ExtSdkMethodKeyUpdateUserPushService : @(ExtSdkMethodKeyUpdateUserPushServiceValue),
          ExtSdkMethodKeyGetNoPushUsers : @(ExtSdkMethodKeyGetNoPushUsersValue),
          ExtSdkMethodKeyUpdatePushConfig : @(ExtSdkMethodKeyUpdatePushConfigValue),

          ExtSdkReportPushAction : @(ExtSdkReportPushActionValue),
          ExtSdkSetConversationSilentMode : @(ExtSdkSetConversationSilentModeValue),
          ExtSdkRemoveConversationSilentMode : @(ExtSdkRemoveConversationSilentModeValue),
          ExtSdkFetchConversationSilentMode : @(ExtSdkFetchConversationSilentModeValue),
          ExtSdkSetSilentModeForAll : @(ExtSdkSetSilentModeForAllValue),
          ExtSdkFetchSilentModeForAll : @(ExtSdkFetchSilentModeForAllValue),
          ExtSdkFetchSilentModeForConversations : @(ExtSdkFetchSilentModeForConversationsValue),
          ExtSdkSetPreferredNotificationLanguage : @(ExtSdkSetPreferredNotificationLanguageValue),
          ExtSdkFetchPreferredNotificationLanguage : @(ExtSdkFetchPreferredNotificationLanguageValue),

          /// EMUserInfoManagerWrapper
          ExtSdkMethodKeyUpdateOwnUserInfo : @(ExtSdkMethodKeyUpdateOwnUserInfoValue),
          ExtSdkMethodKeyUpdateOwnUserInfoWithType : @(ExtSdkMethodKeyUpdateOwnUserInfoWithTypeValue),
          ExtSdkMethodKeyFetchUserInfoById : @(ExtSdkMethodKeyFetchUserInfoByIdValue),
          ExtSdkMethodKeyFetchUserInfoByIdWithType : @(ExtSdkMethodKeyFetchUserInfoByIdWithTypeValue),

          /// EMPresenceManagerWrapper
          ExtSdkMethodKeyPublishPresenceWithDescription : @(ExtSdkMethodKeyPublishPresenceWithDescriptionValue),
          ExtSdkMethodKeyPresenceSubscribe : @(ExtSdkMethodKeyPresenceSubscribeValue),
          ExtSdkMethodKeyPresenceUnsubscribe : @(ExtSdkMethodKeyPresenceUnsubscribeValue),
          ExtSdkMethodKeyFetchSubscribedMembersWithPageNum : @(ExtSdkMethodKeyFetchSubscribedMembersWithPageNumValue),
          ExtSdkMethodKeyFetchPresenceStatus : @(ExtSdkMethodKeyFetchPresenceStatusValue),

          ExtSdkMethodKeyOnPresenceStatusChanged : @(ExtSdkMethodKeyOnPresenceStatusChangedValue),

          ExtSdkMethodKeyChatFetchChatThreadDetail : @(ExtSdkMethodKeyChatFetchChatThreadDetailValue),
          ExtSdkMethodKeyChatFetchJoinedChatThreads : @(ExtSdkMethodKeyChatFetchJoinedChatThreadsValue),
          ExtSdkMethodKeyChatFetchChatThreadsWithParentId : @(ExtSdkMethodKeyChatFetchChatThreadsWithParentIdValue),
          ExtSdkMethodKeyChatFetchJoinedChatThreadsWithParentId : @(ExtSdkMethodKeyChatFetchJoinedChatThreadsWithParentIdValue),
          ExtSdkMethodKeyChatFetchChatThreadMember : @(ExtSdkMethodKeyChatFetchChatThreadMemberValue),
          ExtSdkMethodKeyChatFetchLastMessageWithChatThreads : @(ExtSdkMethodKeyChatFetchLastMessageWithChatThreadsValue),
          ExtSdkMethodKeyChatRemoveMemberFromChatThread : @(ExtSdkMethodKeyChatRemoveMemberFromChatThreadValue),
          ExtSdkMethodKeyChatUpdateChatThreadSubject : @(ExtSdkMethodKeyChatUpdateChatThreadSubjectValue),
          ExtSdkMethodKeyChatCreateChatThread : @(ExtSdkMethodKeyChatCreateChatThreadValue),
          ExtSdkMethodKeyChatJoinChatThread : @(ExtSdkMethodKeyChatJoinChatThreadValue),
          ExtSdkMethodKeyChatLeaveChatThread : @(ExtSdkMethodKeyChatLeaveChatThreadValue),
          ExtSdkMethodKeyChatDestroyChatThread : @(ExtSdkMethodKeyChatDestroyChatThreadValue),
          ExtSdkMethodKeyChatGetMessageThread : @(ExtSdkMethodKeyChatGetMessageThreadValue),
          ExtSdkMethodKeyChatGetThreadConversation : @(ExtSdkMethodKeyChatGetThreadConversationValue),

          /// EMThreadManagerDelegate
          ExtSdkMethodKeyChatOnChatThreadCreated : @(ExtSdkMethodKeyChatOnChatThreadCreatedValue),
          ExtSdkMethodKeyChatOnChatThreadUpdated : @(ExtSdkMethodKeyChatOnChatThreadUpdatedValue),
          ExtSdkMethodKeyChatOnChatThreadDestroyed : @(ExtSdkMethodKeyChatOnChatThreadDestroyedValue),
          ExtSdkMethodKeyChatOnChatThreadUserRemoved : @(ExtSdkMethodKeyChatOnChatThreadUserRemovedValue),
          
          ExtSdkMethodKeyfetchHistoryMessagesByOptions : @(ExtSdkMethodKeyfetchHistoryMessagesByOptionsValue),
          ExtSdkMethodKeydeleteMessagesWithTs : @(ExtSdkMethodKeydeleteMessagesWithTsValue),
          ExtSdkMethodKeysetMemberAttributesFromGroup : @(ExtSdkMethodKeysetMemberAttributesFromGroupValue),
          ExtSdkMethodKeyfetchMemberAttributesFromGroup : @(ExtSdkMethodKeyfetchMemberAttributesFromGroupValue),
          ExtSdkMethodKeyfetchMembersAttributesFromGroup : @(ExtSdkMethodKeyfetchMembersAttributesFromGroupValue),
          ExtSdkMethodKeyOnAppActiveNumberReachLimit : @(ExtSdkMethodKeyOnAppActiveNumberReachLimitValue),
          
          ExtSdkMethodKeyGetConversationsFromServerWithCursor : @(ExtSdkMethodKeyGetConversationsFromServerWithCursorValue),
          ExtSdkMethodKeyGetPinnedConversationsFromServerWithCursor : @(ExtSdkMethodKeyGetPinnedConversationsFromServerWithCursorValue),
          ExtSdkMethodKeyPinConversation : @(ExtSdkMethodKeyPinConversationValue),
          ExtSdkMethodKeyModifyMessage : @(ExtSdkMethodKeyModifyMessageValue),
          ExtSdkMethodKeyDownloadAndParseCombineMessage : @(ExtSdkMethodKeyDownloadAndParseCombineMessageValue),
          ExtSdkMethodKeyOnMessageContentChanged : @(ExtSdkMethodKeyOnMessageContentChangedValue),
          ExtSdkSetPushTemplate : @(ExtSdkSetPushTemplateValue),
          ExtSdkGetPushTemplate : @(ExtSdkGetPushTemplateValue),
          
          ExtSdkMethodKeyOnMultiDeviceEventContact : @(ExtSdkMethodKeyOnMultiDeviceEventContactValue),
          ExtSdkMethodKeyOnMultiDeviceEventGroup : @(ExtSdkMethodKeyOnMultiDeviceEventGroupValue),
          ExtSdkMethodKeyOnMultiDeviceEventThread : @(ExtSdkMethodKeyOnMultiDeviceEventThreadValue),
          ExtSdkMethodKeyOnMultiDeviceEventRemoveMessage : @(ExtSdkMethodKeyOnMultiDeviceEventRemoveMessageValue),
          ExtSdkMethodKeyOnMultiDeviceEventConversation : @(ExtSdkMethodKeyOnMultiDeviceEventConversationValue),
          
          ExtSdkMethodKeyGetMsgCount : @(ExtSdkMethodKeyGetMsgCountValue),
          
          ExtSdkMethodKeygetAllContacts : @(ExtSdkMethodKeygetAllContactsValue),
          ExtSdkMethodKeysetContactRemark : @(ExtSdkMethodKeysetContactRemarkValue),
          ExtSdkMethodKeygetContact : @(ExtSdkMethodKeygetContactValue),
          ExtSdkMethodKeyfetchAllContacts : @(ExtSdkMethodKeyfetchAllContactsValue),
          ExtSdkMethodKeyfetchContacts : @(ExtSdkMethodKeyfetchContactsValue),
          ExtSdkMethodKeyfetchJoinedGroupCount : @(ExtSdkMethodKeyfetchJoinedGroupCountValue),
          
          ExtSdkMethodKeygetPinInfo : @(ExtSdkMethodKeygetPinInfoValue),
          ExtSdkMethodKeypinnedMessages : @(ExtSdkMethodKeypinnedMessagesValue),
          ExtSdkMethodKeyonMessagePinChanged : @(ExtSdkMethodKeyonMessagePinChangedValue),
          ExtSdkMethodKeyaddRemoteAndLocalConversationsMark : @(ExtSdkMethodKeyaddRemoteAndLocalConversationsMarkValue),
          ExtSdkMethodKeydeleteRemoteAndLocalConversationsMark : @(ExtSdkMethodKeydeleteRemoteAndLocalConversationsMarkValue),
          ExtSdkMethodKeyfetchConversationsByOptions : @(ExtSdkMethodKeyfetchConversationsByOptionsValue),
          ExtSdkMethodKeydeleteAllMessageAndConversation : @(ExtSdkMethodKeydeleteAllMessageAndConversationValue),
          ExtSdkMethodKeyfetchPinnedMessages : @(ExtSdkMethodKeyfetchPinnedMessagesValue),
          ExtSdkMethodKeypinMessage : @(ExtSdkMethodKeypinMessageValue),
          ExtSdkMethodKeyunpinMessage : @(ExtSdkMethodKeyunpinMessageValue),
      };
    });
    if (nil != key) {
        NSNumber *value = [methodMap valueForKey:key];
        if (nil != value) {
            return [value intValue];
        }
    }
    @throw [NSException exceptionWithName:NSInvalidArgumentException reason:[NSString stringWithFormat:@"invoke method type is not exist: %@", key] userInfo:nil];
}
//
//- (int)getValue {
//    return 0;
//}
//
//- (void)test {
//    switch ([ExtSdkMethodType getEnumValue:(ExtSdkMethodKeyGetJoinedGroups)]) {
//        case 1:
//
//            break;
//        case 2:
//
//            break;
//        case ExtSdkMethodKeyGetJoinedGroupsValue:
//
//            break;
//        default:
//            break;
//    }
//}

@end
