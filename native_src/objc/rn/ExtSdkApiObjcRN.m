//
//  ExtSdkApiObjcRN.m
//  react-native-chat-sdk
//
//  Created by asterisk on 2022/3/29.
//

#import "ExtSdkApiObjcRN.h"
#import "ExtSdkApiRNImpl.h"
#import "ExtSdkCallbackObjcRN.h"
#import "ExtSdkDelegateObjcRN.h"
#import "ExtSdkMethodTypeObjc.h"
#import "ExtSdkThreadUtilObjc.h"
#import <HyphenateChat/EMClient.h>
#import <UIKit/UIApplication.h>

static NSString *const TAG = @"ExtSdkApiRN";

@interface ExtSdkApiRN () {
    id<ExtSdkApiObjc> impl;
    id<ExtSdkDelegateObjc> delegate;
}

@end

@implementation ExtSdkApiRN

//+ (nonnull instancetype)getInstance {
//    static ExtSdkApiRN *instance = nil;
//    static dispatch_once_t predicate;
//    dispatch_once(&predicate, ^{
//      instance = [[ExtSdkApiRN alloc] init];
//      instance->impl = [[ExtSdkApiRNImpl alloc] init];
//    });
//    return instance;
//}

- (instancetype)init {
    NSLog(@"%@: init:", TAG);
    self = [super init];
    if (self) {
        self->impl = [[ExtSdkApiRNImpl alloc] init];
        self->delegate = [[ExtSdkDelegateObjcRN alloc] initWithApi:self];
        [self->impl
            addListener:[[ExtSdkDelegateObjcRN alloc] initWithApi:self]];
        [self registerSystemNotify];
    }
    return self;
}

- (void)onReceive:(nonnull NSString *)methodType
       withParams:(nullable id<NSObject>)data {
    NSLog(@"%@: onReceive:", TAG);
    [ExtSdkThreadUtilObjc mainThreadExecute:^{
      [self sendEventWithName:methodType body:data];
    }];
}

- (id<ExtSdkApiObjc>)getApi {
    return self->impl;
}

#pragma mark - Others

- (void)registerSystemNotify {
    [[NSNotificationCenter defaultCenter]
        addObserver:self
           selector:@selector(applicationWillEnterForeground:)
               name:UIApplicationWillEnterForegroundNotification
             object:nil];
    [[NSNotificationCenter defaultCenter]
        addObserver:self
           selector:@selector(applicationDidEnterBackground:)
               name:UIApplicationDidEnterBackgroundNotification
             object:nil];
}

- (void)applicationWillEnterForeground:(NSNotification *)notification {
    NSLog(@"%@: applicationWillEnterForeground:", TAG);
    [[EMClient sharedClient]
        applicationWillEnterForeground:[UIApplication sharedApplication]];
}
- (void)applicationDidEnterBackground:(NSNotification *)notification {
    NSLog(@"%@: applicationDidEnterBackground:", TAG);
    [[EMClient sharedClient]
        applicationDidEnterBackground:[UIApplication sharedApplication]];
}

#pragma mark - RCTBridgeModule

RCT_EXPORT_MODULE(ExtSdkApiRN)

RCT_EXPORT_METHOD(callMethod
                  : (NSString *)methodName
                  : (NSDictionary *)params
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
    NSLog(@"%@: callMethod:", TAG);
    id<ExtSdkCallbackObjc> callback =
        [[ExtSdkCallbackObjcRN alloc] initWithResolve:resolve
                                           withReject:reject];
    __weak typeof(self) weakself =
        self; // TODO: 后续解决 mm文件无法使用typeof关键字: 使用分类方式解决
    [ExtSdkThreadUtilObjc asyncExecute:^{
      if (weakself) {
          [[weakself getApi] callSdkApi:methodName
                             withParams:params
                           withCallback:callback];
      }
    }];
}

- (dispatch_queue_t)methodQueue {
    NSLog(@"%@: methodQueue:", TAG);
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    NSLog(@"%@: requiresMainQueueSetup:", TAG);
    return YES;
}

#pragma mark - RCTEventEmitter

- (NSArray<NSString *> *)supportedEvents {
    NSLog(@"%@: supportedEvents:", TAG);
    NSArray<NSString *> *ret = @[
        /// EMClientWrapper
        ExtSdkMethodKeyInit,
        ExtSdkMethodKeyCreateAccount,
        ExtSdkMethodKeyLogin,
        ExtSdkMethodKeyLogout,
        ExtSdkMethodKeyChangeAppKey,
        ExtSdkMethodKeyIsLoggedInBefore,
        ExtSdkMethodKeyUploadLog,
        ExtSdkMethodKeyCompressLogs,
        ExtSdkMethodKeyKickDevice,
        ExtSdkMethodKeyKickAllDevices,
        ExtSdkMethodKeyCurrentUser,
        ExtSdkMethodKeyGetLoggedInDevicesFromServer,
        ExtSdkMethodKeyGetToken,
        ExtSdkMethodKeyLoginWithAgoraToken,
        ExtSdkMethodKeyGetCurrentUser,
        ExtSdkMethodKeyIsConnected,

        /// EMClientDelegate
        ExtSdkMethodKeyOnConnected,
        ExtSdkMethodKeyOnDisconnected,
        ExtSdkMethodKeyOnMultiDeviceEvent,
        ExtSdkMethodKeySendDataToFlutter,
        ExtSdkMethodKeyOnTokenWillExpire,
        ExtSdkMethodKeyOnTokenDidExpire,

        ExtSdkMethodKeyOnUserDidLoginFromOtherDevice,
        ExtSdkMethodKeyOnUserDidRemoveFromServer,
        ExtSdkMethodKeyOnUserDidForbidByServer,
        ExtSdkMethodKeyOnUserDidChangePassword,
        ExtSdkMethodKeyOnUserDidLoginTooManyDevice,
        ExtSdkMethodKeyOnUserKickedByOtherDevice,
        ExtSdkMethodKeyOnUserAuthenticationFailed,

        /// EMContactManagerWrapper
        ExtSdkMethodKeyAddContact,
        ExtSdkMethodKeyDeleteContact,
        ExtSdkMethodKeyGetAllContactsFromServer,
        ExtSdkMethodKeyGetAllContactsFromDB,
        ExtSdkMethodKeyAddUserToBlockList,
        ExtSdkMethodKeyRemoveUserFromBlockList,
        ExtSdkMethodKeyGetBlockListFromServer,
        ExtSdkMethodKeyGetBlockListFromDB,
        ExtSdkMethodKeyAcceptInvitation,
        ExtSdkMethodKeyDeclineInvitation,
        ExtSdkMethodKeyGetSelfIdsOnOtherPlatform,

        /// EMContactDelegate
        ExtSdkMethodKeyOnContactChanged,

        /// EMChatManagerWrapper
        ExtSdkMethodKeySendMessage,
        ExtSdkMethodKeyResendMessage,
        ExtSdkMethodKeyAckMessageRead,
        ExtSdkMethodKeyAckGroupMessageRead,
        ExtSdkMethodKeyAckConversationRead,
        ExtSdkMethodKeyRecallMessage,
        ExtSdkMethodKeyGetConversation,
        ExtSdkMethodKeyMarkAllChatMsgAsRead,
        ExtSdkMethodKeyGetUnreadMessageCount,
        ExtSdkMethodKeyUpdateChatMessage,
        ExtSdkMethodKeyDownloadAttachment,
        ExtSdkMethodKeyDownloadThumbnail,
        ExtSdkMethodKeyImportMessages,
        ExtSdkMethodKeyLoadAllConversations,
        ExtSdkMethodKeyGetConversationsFromServer,

        ExtSdkMethodKeyDeleteConversation,
        // ExtSdkMethodKeySetVoiceMessageListened,
        // ExtSdkMethodKeyUpdateParticipant,
        ExtSdkMethodKeyUpdateConversationsName,
        ExtSdkMethodKeyFetchHistoryMessages,
        ExtSdkMethodKeySearchChatMsgFromDB,
        ExtSdkMethodKeyGetMessage,
        ExtSdkMethodKeyAsyncFetchGroupAcks,
        ExtSdkMethodKeydeleteRemoteConversation,
        ExtSdkMethodKeyDeleteMessagesBeforeTimestamp,

        ExtSdkMethodKeyTranslateMessage,
        ExtSdkMethodKeyFetchSupportedLanguages,

        ExtSdkMethodKeyChatAddReaction,
        ExtSdkMethodKeyChatRemoveReaction,
        ExtSdkMethodKeyChatFetchReactionList,
        ExtSdkMethodKeyChatFetchReactionDetail,
        ExtSdkMethodKeyChatReportMessage,

        ExtSdkMethodKeyFetchConversationsFromServerWithPage,
        ExtSdkMethodKeyRemoveMessagesFromServerWithMsgIds,
        ExtSdkMethodKeyRemoveMessagesFromServerWithTs,

        /// EMChatManagerDelegate
        ExtSdkMethodKeyOnMessagesReceived,
        ExtSdkMethodKeyOnCmdMessagesReceived,
        ExtSdkMethodKeyOnMessagesRead,
        ExtSdkMethodKeyOnGroupMessageRead,
        ExtSdkMethodKeyOnMessagesDelivered,
        ExtSdkMethodKeyOnMessagesRecalled,

        ExtSdkMethodKeyOnConversationUpdate,
        ExtSdkMethodKeyOnConversationHasRead,

        ExtSdkMethodKeyChatOnReadAckForGroupMessageUpdated,
        ExtSdkMethodKeyChatOnMessageReactionDidChange,

        /// EMMessageListener
        ExtSdkMethodKeyOnMessageProgressUpdate,
        ExtSdkMethodKeyOnMessageSuccess,
        ExtSdkMethodKeyOnMessageError,
        ExtSdkMethodKeyOnMessageReadAck,
        ExtSdkMethodKeyOnMessageDeliveryAck,
        ExtSdkMethodKeyOnMessageStatusChanged,

        /// EMPresenceManagerDelegate
        ExtSdkMethodKeyOnPresenceStatusChanged,

        /// EMConversationWrapper

        ExtSdkMethodKeyGetUnreadMsgCount,
        ExtSdkMethodKeyMarkAllMsgsAsRead,
        ExtSdkMethodKeyMarkMsgAsRead,
        ExtSdkMethodKeySyncConversationExt,
        ExtSdkMethodKeySyncConversationName,
        ExtSdkMethodKeyRemoveMsg,
        ExtSdkMethodKeyGetLatestMsg,
        ExtSdkMethodKeyGetLatestMsgFromOthers,
        ExtSdkMethodKeyClearAllMsg,
        ExtSdkMethodKeyInsertMsg,
        ExtSdkMethodKeyAppendMsg,
        ExtSdkMethodKeyUpdateConversationMsg,

        ExtSdkMethodKeyLoadMsgWithId,
        ExtSdkMethodKeyLoadMsgWithStartId,
        ExtSdkMethodKeyLoadMsgWithKeywords,
        ExtSdkMethodKeyLoadMsgWithMsgType,
        ExtSdkMethodKeyLoadMsgWithTime,

        ExtSdkMethodKeyChatGetReactionList,
        ExtSdkMethodKeyChatGroupAckCount,

        /// EMChatroomManagerWrapper

        ExtSdkMethodKeyJoinChatRoom,
        ExtSdkMethodKeyLeaveChatRoom,
        ExtSdkMethodKeyGetChatroomsFromServer,
        ExtSdkMethodKeyFetchChatRoomFromServer,
        ExtSdkMethodKeyGetChatRoom,
        ExtSdkMethodKeyGetAllChatRooms,
        ExtSdkMethodKeyCreateChatRoom,
        ExtSdkMethodKeyDestroyChatRoom,
        ExtSdkMethodKeyChatRoomUpdateSubject,
        ExtSdkMethodKeyChatRoomUpdateDescription,
        ExtSdkMethodKeyGetChatroomMemberListFromServer,
        ExtSdkMethodKeyChatRoomMuteMembers,
        ExtSdkMethodKeyChatRoomUnmuteMembers,
        ExtSdkMethodKeyChangeChatRoomOwner,
        ExtSdkMethodKeyChatRoomAddAdmin,
        ExtSdkMethodKeyChatRoomRemoveAdmin,
        ExtSdkMethodKeyGetChatroomMuteListFromServer,
        ExtSdkMethodKeyChatRoomRemoveMembers,
        ExtSdkMethodKeyChatRoomBlockMembers,
        ExtSdkMethodKeyChatRoomUnblockMembers,
        ExtSdkMethodKeyFetchChatroomBlockListFromServer,
        ExtSdkMethodKeyUpdateChatRoomAnnouncement,
        ExtSdkMethodKeyFetchChatroomAnnouncement,

        ExtSdkMethodKeyAddMembersToChatRoomWhiteList,
        ExtSdkMethodKeyRemoveMembersFromChatRoomWhiteList,
        ExtSdkMethodKeyFetchChatRoomWhiteListFromServer,
        ExtSdkMethodKeyIsMemberInChatRoomWhiteListFromServer,

        ExtSdkMethodKeyMuteAllChatRoomMembers,
        ExtSdkMethodKeyUnMuteAllChatRoomMembers,

        MKfetchChatRoomAttributes,
        MKfetchChatRoomAllAttributes,
        MKsetChatRoomAttributes,
        MKremoveChatRoomAttributes,

        ExtSdkMethodKeyChatroomChanged,

        /// EMGroupManagerWrapper

        ExtSdkMethodKeyGetGroupWithId,
        ExtSdkMethodKeyGetJoinedGroups,
        ExtSdkMethodKeyGetGroupsWithoutPushNotification,
        ExtSdkMethodKeyGetJoinedGroupsFromServer,
        ExtSdkMethodKeyGetPublicGroupsFromServer,
        ExtSdkMethodKeyCreateGroup,
        ExtSdkMethodKeyGetGroupSpecificationFromServer,
        ExtSdkMethodKeyGetGroupMemberListFromServer,
        ExtSdkMethodKeyGetGroupBlockListFromServer,
        ExtSdkMethodKeyGetGroupMuteListFromServer,
        ExtSdkMethodKeyGetGroupWhiteListFromServer,
        ExtSdkMethodKeyIsMemberInWhiteListFromServer,
        ExtSdkMethodKeyGetGroupFileListFromServer,
        ExtSdkMethodKeyGetGroupAnnouncementFromServer,
        ExtSdkMethodKeyAddMembers,
        ExtSdkMethodKeyInviterUser,
        ExtSdkMethodKeyRemoveMembers,
        ExtSdkMethodKeyBlockMembers,
        ExtSdkMethodKeyUnblockMembers,
        ExtSdkMethodKeyUpdateGroupSubject,
        ExtSdkMethodKeyUpdateDescription,
        ExtSdkMethodKeyLeaveGroup,
        ExtSdkMethodKeyDestroyGroup,
        ExtSdkMethodKeyBlockGroup,
        ExtSdkMethodKeyUnblockGroup,
        ExtSdkMethodKeyUpdateGroupOwner,
        ExtSdkMethodKeyAddAdmin,
        ExtSdkMethodKeyRemoveAdmin,
        ExtSdkMethodKeyMuteMembers,
        ExtSdkMethodKeyUnMuteMembers,
        ExtSdkMethodKeyMuteAllMembers,
        ExtSdkMethodKeyUnMuteAllMembers,
        ExtSdkMethodKeyAddWhiteList,
        ExtSdkMethodKeyRemoveWhiteList,
        ExtSdkMethodKeyUploadGroupSharedFile,
        ExtSdkMethodKeyDownloadGroupSharedFile,
        ExtSdkMethodKeyRemoveGroupSharedFile,
        ExtSdkMethodKeyUpdateGroupAnnouncement,
        ExtSdkMethodKeyUpdateGroupExt,
        ExtSdkMethodKeyJoinPublicGroup,
        ExtSdkMethodKeyRequestToJoinPublicGroup,
        ExtSdkMethodKeyAcceptJoinApplication,
        ExtSdkMethodKeyDeclineJoinApplication,
        ExtSdkMethodKeyAcceptInvitationFromGroup,
        ExtSdkMethodKeyDeclineInvitationFromGroup,
        ExtSdkMethodKeyIgnoreGroupPush,

        ExtSdkMethodKeyOnGroupChanged,

        /// EMPushManagerWrapper
        ExtSdkMethodKeyGetImPushConfig,
        ExtSdkMethodKeyGetImPushConfigFromServer,
        ExtSdkMethodKeyUpdatePushNickname,

        ExtSdkMethodKeyImPushNoDisturb,
        ExtSdkMethodKeyUpdateImPushStyle,
        ExtSdkMethodKeyUpdateGroupPushService,
        ExtSdkMethodKeyGetNoDisturbGroups,
        ExtSdkMethodKeyBindDeviceToken,
        ExtSdkMethodKeyEnablePush,
        ExtSdkMethodKeyDisablePush,
        ExtSdkMethodKeyGetNoPushGroups,
        ExtSdkMethodKeySetNoDisturbUsers,
        ExtSdkMethodKeyGetNoDisturbUsersFromServer,
        ExtSdkMethodKeyUpdateUserPushService,
        ExtSdkMethodKeyGetNoPushUsers,
        ExtSdkMethodKeyUpdatePushConfig,

        ExtSdkReportPushAction,
        ExtSdkSetConversationSilentMode,
        ExtSdkRemoveConversationSilentMode,
        ExtSdkFetchConversationSilentMode,
        ExtSdkSetSilentModeForAll,
        ExtSdkFetchSilentModeForAll,
        ExtSdkFetchSilentModeForConversations,
        ExtSdkSetPreferredNotificationLanguage,
        ExtSdkFetchPreferredNotificationLanguage,

        /// EMUserInfoManagerWrapper
        ExtSdkMethodKeyUpdateOwnUserInfo,
        ExtSdkMethodKeyUpdateOwnUserInfoWithType,
        ExtSdkMethodKeyFetchUserInfoById,
        ExtSdkMethodKeyFetchUserInfoByIdWithType,

        /// EMPresenceManagerWrapper
        ExtSdkMethodKeyPublishPresenceWithDescription,
        ExtSdkMethodKeyPresenceSubscribe,
        ExtSdkMethodKeyPresenceUnsubscribe,
        ExtSdkMethodKeyFetchSubscribedMembersWithPageNum,
        ExtSdkMethodKeyFetchPresenceStatus,

        ExtSdkMethodKeyOnPresenceStatusChanged,

        ExtSdkMethodKeyChatFetchChatThreadDetail,
        ExtSdkMethodKeyChatFetchJoinedChatThreads,
        ExtSdkMethodKeyChatFetchChatThreadsWithParentId,
        ExtSdkMethodKeyChatFetchJoinedChatThreadsWithParentId,
        ExtSdkMethodKeyChatFetchChatThreadMember,
        ExtSdkMethodKeyChatFetchLastMessageWithChatThreads,
        ExtSdkMethodKeyChatRemoveMemberFromChatThread,
        ExtSdkMethodKeyChatUpdateChatThreadSubject,
        ExtSdkMethodKeyChatCreateChatThread,
        ExtSdkMethodKeyChatJoinChatThread,
        ExtSdkMethodKeyChatLeaveChatThread,
        ExtSdkMethodKeyChatDestroyChatThread,
        ExtSdkMethodKeyChatGetMessageThread,
        ExtSdkMethodKeyChatGetThreadConversation,

        /// EMThreadManagerDelegate
        ExtSdkMethodKeyChatOnChatThreadCreated,
        ExtSdkMethodKeyChatOnChatThreadUpdated,
        ExtSdkMethodKeyChatOnChatThreadDestroyed,
        ExtSdkMethodKeyChatOnChatThreadUserRemoved,

        ExtSdkMethodKeyfetchHistoryMessagesByOptions,
        ExtSdkMethodKeydeleteMessagesWithTs,
        ExtSdkMethodKeysetMemberAttributesFromGroup,
        ExtSdkMethodKeyfetchMemberAttributesFromGroup,
        ExtSdkMethodKeyfetchMembersAttributesFromGroup,
        ExtSdkMethodKeyOnAppActiveNumberReachLimit,

        ExtSdkMethodKeyGetConversationsFromServerWithCursor,
        ExtSdkMethodKeyGetPinnedConversationsFromServerWithCursor,
        ExtSdkMethodKeyPinConversation,
        ExtSdkMethodKeyModifyMessage,
        ExtSdkMethodKeyDownloadAndParseCombineMessage,
        ExtSdkMethodKeyOnMessageContentChanged,
        ExtSdkSetPushTemplate,
        ExtSdkGetPushTemplate,
        ExtSdkMethodKeyOnMultiDeviceEventContact,
        ExtSdkMethodKeyOnMultiDeviceEventGroup,
        ExtSdkMethodKeyOnMultiDeviceEventThread,
        ExtSdkMethodKeyOnMultiDeviceEventRemoveMessage,
        ExtSdkMethodKeyOnMultiDeviceEventConversation,

        ExtSdkMethodKeyGetMsgCount,
        
        ExtSdkMethodKeygetAllContacts,
        ExtSdkMethodKeysetContactRemark,
        ExtSdkMethodKeygetContact,
        ExtSdkMethodKeyfetchAllContacts,
        ExtSdkMethodKeyfetchContacts,
        ExtSdkMethodKeyfetchJoinedGroupCount,
        ExtSdkMethodKeyDownloadAttachmentInCombine,
        ExtSdkMethodKeyDownloadThumbnailInCombine,
        
        ExtSdkMethodKeygetPinInfo,
        ExtSdkMethodKeypinnedMessages,
        ExtSdkMethodKeyonMessagePinChanged,
        ExtSdkMethodKeyaddRemoteAndLocalConversationsMark,
        ExtSdkMethodKeydeleteRemoteAndLocalConversationsMark,
        ExtSdkMethodKeyfetchConversationsByOptions,
        ExtSdkMethodKeydeleteAllMessageAndConversation,
        ExtSdkMethodKeypinMessage,
        ExtSdkMethodKeyunpinMessage,
        ExtSdkMethodKeyfetchPinnedMessages,
    ];
    //    NSLog(@"%@: supportedEvents: %@", TAG, ret);
    return ret;
}

- (void)invalidate NS_REQUIRES_SUPER {
    [super invalidate];
    NSLog(@"%@: invalidate:", TAG);
}

- (void)addListener:(NSString *)eventName {
    [super addListener:eventName];
    NSLog(@"%@: addListener: %@", TAG, eventName);
}
- (void)removeListeners:(double)count {
    [super removeListeners:count];
    NSLog(@"%@: removeListeners: %f", TAG, count);
}

@end
