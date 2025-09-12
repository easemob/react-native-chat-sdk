#import "ExtSdkDispatch.h"
#import "ExtSdkDelegateObjc.h"
#import "ExtSdkMethodTypeObjc.h"
#import "ExtSdkTypeUtilObjc.h"

#import "ExtSdkChatManagerWrapper.h"
#import "ExtSdkChatMessageWrapper.h"
#import "ExtSdkChatThreadManagerWrapper.h"
#import "ExtSdkChatroomManagerWrapper.h"
#import "ExtSdkClientWrapper.h"
#import "ExtSdkContactManagerWrapper.h"
#import "ExtSdkConversationWrapper.h"
#import "ExtSdkGroupManagerWrapper.h"
#import "ExtSdkPresenceManagerWrapper.h"
#import "ExtSdkPushManagerWrapper.h"
#import "ExtSdkUserInfoManagerWrapper.h"

static NSString *const TAG = @"ExtSdkDispatch";
@interface ExtSdkDispatch () {
    id<ExtSdkDelegateObjc> _listener;
}

@end

@implementation ExtSdkDispatch

+ (nonnull instancetype)getInstance {
    static ExtSdkDispatch *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkDispatch alloc] init];
    });
    return instance;
}

- (void)addListener:(nonnull id<ExtSdkDelegateObjc>)listener {
    NSLog(@"%@: addListener:", TAG);
    _listener = listener;
}

- (void)callSdkApi:(nonnull NSString *)methodType withParams:(nullable id<NSObject>)params withCallback:(nonnull id<ExtSdkCallbackObjc>)callback {
    NSLog(@"%@: callSdkApi: %@, %@", TAG, methodType, params != nil ? params : @"");
    NSDictionary *ps = (NSDictionary *)params;

    if ([ExtSdkTypeUtilObjc currentArchitectureType] == ExtSdkArchitectureTypeValueFlutter) {

    } else if ([ExtSdkTypeUtilObjc currentArchitectureType] == ExtSdkArchitectureTypeValueUnity) {

    } else if ([ExtSdkTypeUtilObjc currentArchitectureType] == ExtSdkArchitectureTypeValueRN) {
        NSArray *a = [ps allValues];
        ps = a.firstObject;
    } else {
        @throw @"This type is not supported.";
    }

    switch ([ExtSdkMethodTypeObjc getEnumValue:methodType]) {

    /// #pragma mark - EMClientWrapper value
    case ExtSdkMethodKeyInitValue:
        [[ExtSdkClientWrapper getInstance] initSDKWithDict:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyCreateAccountValue:
        [[ExtSdkClientWrapper getInstance] createAccount:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLoginValue:
        [[ExtSdkClientWrapper getInstance] login:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLogoutValue:
        [[ExtSdkClientWrapper getInstance] logout:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChangeAppKeyValue:
        [[ExtSdkClientWrapper getInstance] changeAppKey:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyIsLoggedInBeforeValue:
        [[ExtSdkClientWrapper getInstance] isLoggedInBefore:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUploadLogValue:
        [[ExtSdkClientWrapper getInstance] uploadLog:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyCompressLogsValue:
        [[ExtSdkClientWrapper getInstance] compressLogs:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyKickDeviceValue:
        [[ExtSdkClientWrapper getInstance] kickDevice:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyKickAllDevicesValue:
        [[ExtSdkClientWrapper getInstance] kickAllDevices:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyCurrentUserValue:
        [[ExtSdkClientWrapper getInstance] getCurrentUser:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetLoggedInDevicesFromServerValue:
        [[ExtSdkClientWrapper getInstance] getLoggedInDevicesFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetTokenValue:
        [[ExtSdkClientWrapper getInstance] getToken:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLoginWithAgoraTokenValue:
        [[ExtSdkClientWrapper getInstance] loginWithAgoraToken:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyIsConnectedValue:
        [[ExtSdkClientWrapper getInstance] isConnected:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetCurrentUserValue:
        [[ExtSdkClientWrapper getInstance] getCurrentUser:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdatePushConfigValue:
        [[ExtSdkClientWrapper getInstance] updatePushConfig:ps withMethodType:methodType result:callback];
        break;

    /// #pragma mark - EMClientDelegate value
    case ExtSdkMethodKeyOnConnectedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnDisconnectedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnMultiDeviceEventValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeySendDataToFlutterValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnTokenWillExpireValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnTokenDidExpireValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnUserDidLoginFromOtherDeviceValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnUserDidRemoveFromServerValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnUserDidForbidByServerValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnUserDidChangePasswordValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnUserDidLoginTooManyDeviceValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnUserKickedByOtherDeviceValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnUserAuthenticationFailedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

    /// #pragma mark - EMContactManagerWrapper value
    case ExtSdkMethodKeyAddContactValue:
        [[ExtSdkContactManagerWrapper getInstance] addContact:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDeleteContactValue:
        [[ExtSdkContactManagerWrapper getInstance] deleteContact:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetAllContactsFromServerValue:
        [[ExtSdkContactManagerWrapper getInstance] getAllContactsFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetAllContactsFromDBValue:
        [[ExtSdkContactManagerWrapper getInstance] getAllContactsFromDB:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAddUserToBlockListValue:
        [[ExtSdkContactManagerWrapper getInstance] addUserToBlockList:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRemoveUserFromBlockListValue:
        [[ExtSdkContactManagerWrapper getInstance] removeUserFromBlockList:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetBlockListFromServerValue:
        [[ExtSdkContactManagerWrapper getInstance] getBlockListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetBlockListFromDBValue:
        [[ExtSdkContactManagerWrapper getInstance] getBlockListFromDB:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAcceptInvitationValue:
        [[ExtSdkContactManagerWrapper getInstance] acceptInvitation:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDeclineInvitationValue:
        [[ExtSdkContactManagerWrapper getInstance] declineInvitation:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetSelfIdsOnOtherPlatformValue:
        [[ExtSdkContactManagerWrapper getInstance] getSelfIdsOnOtherPlatform:ps withMethodType:methodType result:callback];
        break;

    /// #pragma mark - EMContactDelegate value
    case ExtSdkMethodKeyOnContactChangedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

    /// #pragma mark - EMChatManagerWrapper value
    case ExtSdkMethodKeySendMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] sendMessage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyResendMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] resendMessage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAckMessageReadValue:
        [[ExtSdkChatManagerWrapper getInstance] ackMessageRead:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAckGroupMessageReadValue:
        [[ExtSdkChatManagerWrapper getInstance] ackGroupMessageRead:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAckConversationReadValue:
        [[ExtSdkChatManagerWrapper getInstance] ackConversationRead:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRecallMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] recallMessage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetConversationValue:
        [[ExtSdkChatManagerWrapper getInstance] getConversationApi:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyMarkAllChatMsgAsReadValue:
        [[ExtSdkChatManagerWrapper getInstance] markAllMessagesAsRead:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetUnreadMessageCountValue:
        [[ExtSdkChatManagerWrapper getInstance] getUnreadMessageCount:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateChatMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] updateChatMessage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDownloadAttachmentInCombineValue:
        [[ExtSdkChatManagerWrapper getInstance] downloadAttachmentInCombine:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDownloadThumbnailInCombineValue:
        [[ExtSdkChatManagerWrapper getInstance] downloadThumbnailInCombine:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDownloadAttachmentValue:
        [[ExtSdkChatManagerWrapper getInstance] downloadAttachment:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDownloadThumbnailValue:
        [[ExtSdkChatManagerWrapper getInstance] downloadThumbnail:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyImportMessagesValue:
        [[ExtSdkChatManagerWrapper getInstance] importMessages:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLoadAllConversationsValue:
        [[ExtSdkChatManagerWrapper getInstance] loadAllConversations:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetConversationsFromServerValue:
        [[ExtSdkChatManagerWrapper getInstance] getConversationsFromServer:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyDeleteConversationValue:
        [[ExtSdkChatManagerWrapper getInstance] deleteConversation:ps withMethodType:methodType result:callback];
        break;
        //    case ExtSdkMethodKeySetVoiceMessageListenedValue:
        //        [callback onFail:1 withExtension:[NSString
        //        stringWithFormat:@"not implement: %@", methodType]]; break;
        //    case ExtSdkMethodKeyUpdateParticipantValue:
        //        [callback onFail:1 withExtension:[NSString
        //        stringWithFormat:@"not implement: %@", methodType]]; break;
    case ExtSdkMethodKeyUpdateConversationsNameValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyFetchHistoryMessagesValue:
        [[ExtSdkChatManagerWrapper getInstance] fetchHistoryMessages:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeySearchChatMsgFromDBValue:
        [[ExtSdkChatManagerWrapper getInstance] searchChatMsgFromDB:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] getMessageWithMessageId:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAsyncFetchGroupAcksValue:
        [[ExtSdkChatManagerWrapper getInstance] fetchGroupReadAck:ps withMethodType:methodType result:callback];
        break;

    /// #pragma mark - EMChatManagerDelegate value
    case ExtSdkMethodKeyOnMessagesReceivedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnCmdMessagesReceivedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnMessagesReadValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnGroupMessageReadValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnMessagesDeliveredValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnMessagesRecalledValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

    case ExtSdkMethodKeyOnConversationUpdateValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnConversationHasReadValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

    /// #pragma mark - EMMessageListener value
    case ExtSdkMethodKeyOnMessageProgressUpdateValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnMessageSuccessValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnMessageErrorValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnMessageReadAckValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnMessageDeliveryAckValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyOnMessageStatusChangedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

        /// #pragma mark - EMConversationWrapper value

    case ExtSdkMethodKeyGetUnreadMsgCountValue:
        [[ExtSdkConversationWrapper getInstance] getUnreadMsgCount:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetMsgCountValue:
        [[ExtSdkConversationWrapper getInstance] getMsgCount:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyMarkAllMsgsAsReadValue:
        [[ExtSdkConversationWrapper getInstance] markAllMsgsAsRead:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyMarkMsgAsReadValue:
        [[ExtSdkConversationWrapper getInstance] markMsgAsRead:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeySyncConversationExtValue:
        [[ExtSdkConversationWrapper getInstance] syncConversationExt:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeySyncConversationNameValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyRemoveMsgValue:
        [[ExtSdkConversationWrapper getInstance] removeMsg:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetLatestMsgValue:
        [[ExtSdkConversationWrapper getInstance] getLatestMsg:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetLatestMsgFromOthersValue:
        [[ExtSdkConversationWrapper getInstance] getLatestMsgFromOthers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyClearAllMsgValue:
        [[ExtSdkConversationWrapper getInstance] clearAllMsg:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyInsertMsgValue:
        [[ExtSdkConversationWrapper getInstance] insertMsg:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAppendMsgValue:
        [[ExtSdkConversationWrapper getInstance] appendMsg:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateConversationMsgValue:
        [[ExtSdkConversationWrapper getInstance] updateConversationMsg:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyLoadMsgWithIdValue:
        [[ExtSdkConversationWrapper getInstance] loadMsgWithId:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLoadMsgWithStartIdValue:
        [[ExtSdkConversationWrapper getInstance] loadMsgWithStartId:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLoadMsgWithKeywordsValue:
        [[ExtSdkConversationWrapper getInstance] loadMsgWithKeywords:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLoadMsgWithMsgTypeValue:
        [[ExtSdkConversationWrapper getInstance] loadMsgWithMsgType:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLoadMsgWithTimeValue:
        [[ExtSdkConversationWrapper getInstance] loadMsgWithTime:ps withMethodType:methodType result:callback];
        break;

        /// #pragma mark - EMChatroomManagerWrapper value

    case ExtSdkMethodKeyJoinChatRoomValue:
        [[ExtSdkChatroomManagerWrapper getInstance] joinChatRoom:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLeaveChatRoomValue:
        [[ExtSdkChatroomManagerWrapper getInstance] leaveChatRoom:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetChatroomsFromServerValue:
        [[ExtSdkChatroomManagerWrapper getInstance] getChatroomsFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyFetchChatRoomFromServerValue:
        [[ExtSdkChatroomManagerWrapper getInstance] fetchChatroomFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetChatRoomValue:
        [[ExtSdkChatroomManagerWrapper getInstance] getChatRoom:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetAllChatRoomsValue:
        [[ExtSdkChatroomManagerWrapper getInstance] getAllChatRooms:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyCreateChatRoomValue:
        [[ExtSdkChatroomManagerWrapper getInstance] createChatRoom:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDestroyChatRoomValue:
        [[ExtSdkChatroomManagerWrapper getInstance] destroyChatRoom:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRoomUpdateSubjectValue:
        [[ExtSdkChatroomManagerWrapper getInstance] chatRoomUpdateSubject:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRoomUpdateDescriptionValue:
        [[ExtSdkChatroomManagerWrapper getInstance] chatRoomUpdateDescription:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetChatroomMemberListFromServerValue:
        [[ExtSdkChatroomManagerWrapper getInstance] getChatroomMemberListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRoomMuteMembersValue:
        [[ExtSdkChatroomManagerWrapper getInstance] chatRoomMuteMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRoomUnmuteMembersValue:
        [[ExtSdkChatroomManagerWrapper getInstance] chatRoomUnmuteMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChangeChatRoomOwnerValue:
        [[ExtSdkChatroomManagerWrapper getInstance] changeChatRoomOwner:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRoomAddAdminValue:
        [[ExtSdkChatroomManagerWrapper getInstance] chatRoomAddAdmin:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRoomRemoveAdminValue:
        [[ExtSdkChatroomManagerWrapper getInstance] chatRoomRemoveAdmin:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetChatroomMuteListFromServerValue:
        [[ExtSdkChatroomManagerWrapper getInstance] getChatroomMuteListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRoomRemoveMembersValue:
        [[ExtSdkChatroomManagerWrapper getInstance] chatRoomRemoveMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRoomBlockMembersValue:
        [[ExtSdkChatroomManagerWrapper getInstance] chatRoomBlockMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRoomUnblockMembersValue:
        [[ExtSdkChatroomManagerWrapper getInstance] chatRoomUnblockMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyFetchChatroomBlockListFromServerValue:
        [[ExtSdkChatroomManagerWrapper getInstance] fetchChatroomBlockListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateChatRoomAnnouncementValue:
        [[ExtSdkChatroomManagerWrapper getInstance] updateChatRoomAnnouncement:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyFetchChatroomAnnouncementValue:
        [[ExtSdkChatroomManagerWrapper getInstance] fetchChatroomAnnouncement:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyAddMembersToChatRoomWhiteListValue:
        [[ExtSdkChatroomManagerWrapper getInstance] addMembersToChatRoomWhiteList:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRemoveMembersFromChatRoomWhiteListValue:
        [[ExtSdkChatroomManagerWrapper getInstance] removeMembersFromChatRoomWhiteList:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyFetchChatRoomWhiteListFromServerValue:
        [[ExtSdkChatroomManagerWrapper getInstance] fetchChatRoomWhiteListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyIsMemberInChatRoomWhiteListFromServerValue:
        [[ExtSdkChatroomManagerWrapper getInstance] isMemberInChatRoomWhiteListFromServer:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyMuteAllChatRoomMembersValue:
        [[ExtSdkChatroomManagerWrapper getInstance] muteAllChatRoomMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUnMuteAllChatRoomMembersValue:
        [[ExtSdkChatroomManagerWrapper getInstance] unMuteAllChatRoomMembers:ps withMethodType:methodType result:callback];
        break;

    /// #pragma mark - EMChatroomManagerDelegate value
    case ExtSdkMethodKeyChatroomChangedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

        /// #pragma mark - EMGroupManagerWrapper value

    case ExtSdkMethodKeyGetGroupWithIdValue:
        [[ExtSdkGroupManagerWrapper getInstance] getGroupWithId:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetJoinedGroupsValue:
        [[ExtSdkGroupManagerWrapper getInstance] getJoinedGroups:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetGroupsWithoutPushNotificationValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"%@ is deprecated", methodType]];
        break;
    case ExtSdkMethodKeyGetJoinedGroupsFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] getJoinedGroupsFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetPublicGroupsFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] getPublicGroupsFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyCreateGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] createGroup:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetGroupSpecificationFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] getGroupSpecificationFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetGroupMemberListFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] getGroupMemberListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetGroupBlockListFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] getGroupBlockListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetGroupMuteListFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] getGroupMuteListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetGroupWhiteListFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] getGroupWhiteListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyIsMemberInWhiteListFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] isMemberInWhiteListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetGroupFileListFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] getGroupFileListFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetGroupAnnouncementFromServerValue:
        [[ExtSdkGroupManagerWrapper getInstance] getGroupAnnouncementFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAddMembersValue:
        [[ExtSdkGroupManagerWrapper getInstance] addMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyInviterUserValue:
        [[ExtSdkGroupManagerWrapper getInstance] inviterUser:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRemoveMembersValue:
        [[ExtSdkGroupManagerWrapper getInstance] removeMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyBlockMembersValue:
        [[ExtSdkGroupManagerWrapper getInstance] blockMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUnblockMembersValue:
        [[ExtSdkGroupManagerWrapper getInstance] unblockMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateGroupSubjectValue:
        [[ExtSdkGroupManagerWrapper getInstance] updateGroupSubject:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateDescriptionValue:
        [[ExtSdkGroupManagerWrapper getInstance] updateDescription:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyLeaveGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] leaveGroup:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDestroyGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] destroyGroup:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyBlockGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] blockGroup:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUnblockGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] unblockGroup:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateGroupOwnerValue:
        [[ExtSdkGroupManagerWrapper getInstance] updateGroupOwner:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAddAdminValue:
        [[ExtSdkGroupManagerWrapper getInstance] addAdmin:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRemoveAdminValue:
        [[ExtSdkGroupManagerWrapper getInstance] removeAdmin:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyMuteMembersValue:
        [[ExtSdkGroupManagerWrapper getInstance] muteMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUnMuteMembersValue:
        [[ExtSdkGroupManagerWrapper getInstance] unMuteMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyMuteAllMembersValue:
        [[ExtSdkGroupManagerWrapper getInstance] muteAllMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUnMuteAllMembersValue:
        [[ExtSdkGroupManagerWrapper getInstance] unMuteAllMembers:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAddWhiteListValue:
        [[ExtSdkGroupManagerWrapper getInstance] addWhiteList:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRemoveWhiteListValue:
        [[ExtSdkGroupManagerWrapper getInstance] removeWhiteList:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUploadGroupSharedFileValue:
        [[ExtSdkGroupManagerWrapper getInstance] uploadGroupSharedFile:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDownloadGroupSharedFileValue:
        [[ExtSdkGroupManagerWrapper getInstance] downloadGroupSharedFile:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRemoveGroupSharedFileValue:
        [[ExtSdkGroupManagerWrapper getInstance] removeGroupSharedFile:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateGroupAnnouncementValue:
        [[ExtSdkGroupManagerWrapper getInstance] updateGroupAnnouncement:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateGroupExtValue:
        [[ExtSdkGroupManagerWrapper getInstance] updateGroupExt:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyJoinPublicGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] joinPublicGroup:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRequestToJoinPublicGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] requestToJoinPublicGroup:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAcceptJoinApplicationValue:
        [[ExtSdkGroupManagerWrapper getInstance] acceptJoinApplication:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDeclineJoinApplicationValue:
        [[ExtSdkGroupManagerWrapper getInstance] declineJoinApplication:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyAcceptInvitationFromGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] acceptInvitationFromGroup:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDeclineInvitationFromGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] declineInvitationFromGroup:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyIgnoreGroupPushValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

    /// #pragma mark - ExtSdkGroupManagerDelegate
    case ExtSdkMethodKeyOnGroupChangedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

    /// #pragma mark - EMPushManagerWrapper value
    case ExtSdkMethodKeyGetImPushConfigValue:
        [[ExtSdkPushManagerWrapper getInstance] getImPushConfig:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetImPushConfigFromServerValue:
        [[ExtSdkPushManagerWrapper getInstance] getImPushConfigFromServer:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdatePushNicknameValue:
        [[ExtSdkPushManagerWrapper getInstance] updatePushNickname:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyImPushNoDisturbValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyUpdateImPushStyleValue:
        [[ExtSdkPushManagerWrapper getInstance] updateImPushStyle:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateGroupPushServiceValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"%@ is deprecated", methodType]];
        break;
    case ExtSdkMethodKeyGetNoDisturbGroupsValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyBindDeviceTokenValue:
        [[ExtSdkPushManagerWrapper getInstance] bindDeviceToken:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyEnablePushValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"%@ is deprecated", methodType]];
        break;
    case ExtSdkMethodKeyDisablePushValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"%@ is deprecated", methodType]];
        break;
    case ExtSdkMethodKeyGetNoPushGroupsValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"%@ is deprecated", methodType]];
        break;
    case ExtSdkMethodKeySetNoDisturbUsersValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyGetNoDisturbUsersFromServerValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyUpdateUserPushServiceValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"%@ is deprecated", methodType]];
        break;
    case ExtSdkMethodKeyGetNoPushUsersValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"%@ is deprecated", methodType]];
        break;

    /// #pragma mark - EMUserInfoManagerWrapper value
    case ExtSdkMethodKeyUpdateOwnUserInfoValue:
        [[ExtSdkUserInfoManagerWrapper getInstance] updateOwnUserInfo:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyUpdateOwnUserInfoWithTypeValue:
        [[ExtSdkUserInfoManagerWrapper getInstance] updateOwnUserInfoWithType:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyFetchUserInfoByIdValue:
        [[ExtSdkUserInfoManagerWrapper getInstance] fetchUserInfoById:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyFetchUserInfoByIdWithTypeValue:
        [[ExtSdkUserInfoManagerWrapper getInstance] fetchUserInfoByIdWithType:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyTranslateMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] translateMessage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyFetchSupportedLanguagesValue:
        [[ExtSdkChatManagerWrapper getInstance] fetchSupportLanguages:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyOnPresenceStatusChangedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyPublishPresenceWithDescriptionValue:
        [[ExtSdkPresenceManagerWrapper getInstance] publishPresenceWithDescription:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyPresenceSubscribeValue:
        [[ExtSdkPresenceManagerWrapper getInstance] subscribe:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyPresenceUnsubscribeValue:
        [[ExtSdkPresenceManagerWrapper getInstance] unsubscribe:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyFetchSubscribedMembersWithPageNumValue:
        [[ExtSdkPresenceManagerWrapper getInstance] fetchSubscribedMembersWithPageNum:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyFetchPresenceStatusValue:
        [[ExtSdkPresenceManagerWrapper getInstance] fetchPresenceStatus:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyChatAddReactionValue:
        [[ExtSdkChatManagerWrapper getInstance] addReaction:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRemoveReactionValue:
        [[ExtSdkChatManagerWrapper getInstance] removeReaction:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatFetchReactionListValue:
        [[ExtSdkChatManagerWrapper getInstance] fetchReactionList:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatFetchReactionDetailValue:
        [[ExtSdkChatManagerWrapper getInstance] fetchReactionDetail:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatReportMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] reportMessage:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyFetchConversationsFromServerWithPageValue:
        [[ExtSdkChatManagerWrapper getInstance] fetchConversationsFromServerWithPage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRemoveMessagesFromServerWithMsgIdsValue:
        [[ExtSdkChatManagerWrapper getInstance] removeMessagesFromServerWithMsgIds:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyRemoveMessagesFromServerWithTsValue:
        [[ExtSdkChatManagerWrapper getInstance] removeMessagesFromServerWithTs:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyChatOnReadAckForGroupMessageUpdatedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyChatOnMessageReactionDidChangeValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

    case ExtSdkMethodKeyChatOnChatThreadCreatedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyChatOnChatThreadUpdatedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyChatOnChatThreadDestroyedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    case ExtSdkMethodKeyChatOnChatThreadUserRemovedValue:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;

    case ExtSdkMethodKeyChatGetReactionListValue:
        [[ExtSdkChatMessageWrapper getInstance] getReactionList:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatGroupAckCountValue:
        [[ExtSdkChatMessageWrapper getInstance] getGroupAckCount:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyChatFetchChatThreadDetailValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] fetchChatThreadDetail:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatFetchJoinedChatThreadsValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] fetchJoinedChatThreads:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatFetchChatThreadsWithParentIdValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] fetchChatThreadsWithParentId:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatFetchJoinedChatThreadsWithParentIdValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] fetchJoinedChatThreadsWithParentId:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatFetchChatThreadMemberValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] fetchChatThreadMember:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatFetchLastMessageWithChatThreadsValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] fetchLastMessageWithChatThreads:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatRemoveMemberFromChatThreadValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] removeMemberFromChatThread:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatUpdateChatThreadSubjectValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] updateChatThreadSubject:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatCreateChatThreadValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] createChatThread:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatJoinChatThreadValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] joinChatThread:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatLeaveChatThreadValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] leaveChatThread:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatDestroyChatThreadValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] destroyChatThread:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyChatGetMessageThreadValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] getChatThread:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkReportPushActionValue:
        [[ExtSdkPushManagerWrapper getInstance] reportPushAction:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkSetConversationSilentModeValue:
        [[ExtSdkPushManagerWrapper getInstance] setConversationSilentMode:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkRemoveConversationSilentModeValue:
        [[ExtSdkPushManagerWrapper getInstance] removeConversationSilentMode:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkFetchConversationSilentModeValue:
        [[ExtSdkPushManagerWrapper getInstance] fetchConversationSilentMode:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkSetSilentModeForAllValue:
        [[ExtSdkPushManagerWrapper getInstance] setSilentModeForAll:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkFetchSilentModeForAllValue:
        [[ExtSdkPushManagerWrapper getInstance] fetchSilentModeForAll:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkFetchSilentModeForConversationsValue:
        [[ExtSdkPushManagerWrapper getInstance] fetchSilentModeForConversations:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkSetPreferredNotificationLanguageValue:
        [[ExtSdkPushManagerWrapper getInstance] setPreferredNotificationLanguage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkFetchPreferredNotificationLanguageValue:
        [[ExtSdkPushManagerWrapper getInstance] fetchPreferredNotificationLanguage:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeydeleteRemoteConversationValue:
        [[ExtSdkChatManagerWrapper getInstance] deleteRemoteConversation:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyDeleteMessagesBeforeTimestampValue:
        [[ExtSdkChatManagerWrapper getInstance] deleteMessagesBeforeTimestamp:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyChatGetThreadConversationValue:
        [[ExtSdkChatThreadManagerWrapper getInstance] getThreadConversation:ps withMethodType:methodType result:callback];
        break;

    case MKfetchChatRoomAttributesValue:
        [[ExtSdkChatroomManagerWrapper getInstance] fetchChatRoomAttributes:ps withMethodType:methodType result:callback];
        break;
    case MKfetchChatRoomAllAttributesValue:
        [[ExtSdkChatroomManagerWrapper getInstance] fetchChatRoomAllAttributes:ps withMethodType:methodType result:callback];
        break;
    case MKsetChatRoomAttributesValue:
        [[ExtSdkChatroomManagerWrapper getInstance] setChatRoomAttributes:ps withMethodType:methodType result:callback];
        break;
    case MKremoveChatRoomAttributesValue:
        [[ExtSdkChatroomManagerWrapper getInstance] removeChatRoomAttributes:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyfetchHistoryMessagesByOptionsValue:
        [[ExtSdkChatManagerWrapper getInstance] fetchHistoryMessagesByOptions:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeydeleteMessagesWithTsValue:
        [[ExtSdkConversationWrapper getInstance] deleteMessagesWithTimestamp:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeysetMemberAttributesFromGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] setMemberAttribute:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyfetchMemberAttributesFromGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] fetchMemberAttributes:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyfetchMembersAttributesFromGroupValue:
        [[ExtSdkGroupManagerWrapper getInstance] fetchMembersAttributes:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyGetConversationsFromServerWithCursorValue:
        [[ExtSdkChatManagerWrapper getInstance] getConversationsFromServerWithCursor:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyGetPinnedConversationsFromServerWithCursorValue:
        [[ExtSdkChatManagerWrapper getInstance] getPinnedConversationsFromServerWithCursor:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyPinConversationValue:
        [[ExtSdkChatManagerWrapper getInstance] pinConversation:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyModifyMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] modifyMessage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyDownloadAndParseCombineMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] downloadAndParseCombineMessage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkSetPushTemplateValue:
        [[ExtSdkPushManagerWrapper getInstance] setPushTemplate:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkGetPushTemplateValue:
        [[ExtSdkPushManagerWrapper getInstance] getPushTemplate:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeyfetchJoinedGroupCountValue:
        [[ExtSdkGroupManagerWrapper getInstance] fetchJoinedGroupCount:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeygetAllContactsValue:
        [[ExtSdkContactManagerWrapper getInstance] getAllContacts:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeysetContactRemarkValue:
        [[ExtSdkContactManagerWrapper getInstance] setContactRemark:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeygetContactValue:
        [[ExtSdkContactManagerWrapper getInstance] getContact:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyfetchAllContactsValue:
        [[ExtSdkContactManagerWrapper getInstance] fetchAllContacts:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyfetchContactsValue:
        [[ExtSdkContactManagerWrapper getInstance] fetchContacts:ps withMethodType:methodType result:callback];
        break;

    case ExtSdkMethodKeygetPinInfoValue:
        [[ExtSdkChatMessageWrapper getInstance] getMessagePinInfo:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeypinnedMessagesValue:
        [[ExtSdkConversationWrapper getInstance] pinnedMessages:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyaddRemoteAndLocalConversationsMarkValue:
        [[ExtSdkChatManagerWrapper getInstance] addRemoteAndLocalConversationsMark:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeydeleteRemoteAndLocalConversationsMarkValue:
        [[ExtSdkChatManagerWrapper getInstance] deleteRemoteAndLocalConversationsMark:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyfetchConversationsByOptionsValue:
        [[ExtSdkChatManagerWrapper getInstance] fetchConversationsByOptions:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeydeleteAllMessageAndConversationValue:
        [[ExtSdkChatManagerWrapper getInstance] deleteAllMessageAndConversation:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeypinMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] pinMessage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyunpinMessageValue:
        [[ExtSdkChatManagerWrapper getInstance] unpinMessage:ps withMethodType:methodType result:callback];
        break;
    case ExtSdkMethodKeyfetchPinnedMessagesValue:
        [[ExtSdkChatManagerWrapper getInstance] fetchPinnedMessages:ps withMethodType:methodType result:callback];
        break;

    default:
        [callback onFail:1 withExtension:[NSString stringWithFormat:@"not implement: %@", methodType]];
        break;
    }
}

- (void)delListener:(nonnull id<ExtSdkDelegateObjc>)listener {
    NSLog(@"%@: delListener:", TAG);
}

- (void)init:(nonnull id<NSObject>)config {
    NSLog(@"%@: init:", TAG);
}

- (void)unInit:(nullable id<NSObject>)params {
    NSLog(@"%@: unInit:", TAG);
}

- (void)onReceive:(nonnull NSString *)methodType withParams:(nullable NSObject *)params {
    NSLog(@"%@: onReceive: %@: %@", TAG, methodType, nil != params ? params : @"");
    [_listener onReceive:methodType withParams:params];
}

@end
