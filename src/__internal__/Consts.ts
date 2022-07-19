/**
 * Constant expression
 */

/// ChatClient methods
export const MTinit = 'init';
export const MTcreateAccount = 'createAccount';
export const MTlogin = 'login';
export const MTlogout = 'logout';
export const MTchangeAppKey = 'changeAppKey';
export const MTisLoggedInBefore = 'isLoggedInBefore';
export const MTupdateCurrentUserNick = 'updateCurrentUserNick';
export const MTuploadLog = 'uploadLog';
export const MTcompressLogs = 'compressLogs';
export const MTkickDevice = 'kickDevice';
export const MTkickAllDevices = 'kickAllDevices';
export const MTgetLoggedInDevicesFromServer = 'getLoggedInDevicesFromServer';
export const MTgetCurrentUser = 'getCurrentUser';
export const MTgetToken = 'getToken';
export const MTloginWithAgoraToken = 'loginWithAgoraToken';
export const MTisConnected = 'isConnected';
export const MTrenewToken = 'renewToken';

/// ChatClient listener
export const MTonConnected = 'onConnected';
export const MTonDisconnected = 'onDisconnected';
export const MTonMultiDeviceEvent = 'onMultiDeviceEvent';
export const MTonCustomEvent = 'onSendDataToFlutter';
export const MTonTokenWillExpire = 'onTokenWillExpire';
export const MTonTokenDidExpire = 'onTokenDidExpire';

export const MTonUserDidLoginFromOtherDevice = 'onUserDidLoginFromOtherDevice';
export const MTonUserDidRemoveFromServer = 'onUserDidRemoveFromServer';
export const MTonUserDidForbidByServer = 'onUserDidForbidByServer';
export const MTonUserDidChangePassword = 'onUserDidChangePassword';
export const MTonUserDidLoginTooManyDevice = 'onUserDidLoginTooManyDevice';
export const MTonUserKickedByOtherDevice = 'onUserKickedByOtherDevice';
export const MTonUserAuthenticationFailed = 'onUserAuthenticationFailed';

/// ChatContactManager methods
export const MTaddContact = 'addContact';
export const MTdeleteContact = 'deleteContact';
export const MTgetAllContactsFromServer = 'getAllContactsFromServer';
export const MTgetAllContactsFromDB = 'getAllContactsFromDB';
export const MTaddUserToBlockList = 'addUserToBlockList';
export const MTremoveUserFromBlockList = 'removeUserFromBlockList';
export const MTgetBlockListFromServer = 'getBlockListFromServer';
export const MTgetBlockListFromDB = 'getBlockListFromDB';
export const MTacceptInvitation = 'acceptInvitation';
export const MTdeclineInvitation = 'declineInvitation';
export const MTgetSelfIdsOnOtherPlatform = 'getSelfIdsOnOtherPlatform';

/// ChatContactManager listener
export const MTonContactChanged = 'onContactChanged';

/// ChatManager methods
export const MTsendMessage = 'sendMessage';
export const MTresendMessage = 'resendMessage';
export const MTackMessageRead = 'ackMessageRead';
export const MTackGroupMessageRead = 'ackGroupMessageRead';
export const MTackConversationRead = 'ackConversationRead';
export const MTrecallMessage = 'recallMessage';
export const MTgetConversation = 'getConversation';
export const MTmarkAllChatMsgAsRead = 'markAllChatMsgAsRead';
export const MTgetUnreadMessageCount = 'getUnreadMessageCount';
export const MTupdateChatMessage = 'updateChatMessage';
export const MTdownloadAttachment = 'downloadAttachment';
export const MTdownloadThumbnail = 'downloadThumbnail';
export const MTimportMessages = 'importMessages';
export const MTloadAllConversations = 'loadAllConversations';
export const MTgetConversationsFromServer = 'getConversationsFromServer';
export const MTdeleteConversation = 'deleteConversation';
export const MTfetchHistoryMessages = 'fetchHistoryMessages';
export const MTsearchChatMsgFromDB = 'searchChatMsgFromDB';
export const MTgetMessage = 'getMessage';
export const MTasyncFetchGroupAcks = 'asyncFetchGroupAcks';
export const MTdeleteRemoteConversation = 'deleteRemoteConversation';

export const MTtranslateMessage = 'translateMessage';
export const MTfetchSupportLanguages = 'fetchSupportLanguages';

export const MTaddReaction = 'addReaction';
export const MTremoveReaction = 'removeReaction';
export const MTfetchReactionList = 'fetchReactionList';
export const MTfetchReactionDetail = 'fetchReactionDetail';
export const MTreportMessage = 'reportMessage';

/// ChatManager listener
export const MTonMessagesReceived = 'onMessagesReceived';
export const MTonCmdMessagesReceived = 'onCmdMessagesReceived';
export const MTonMessagesRead = 'onMessagesRead';
export const MTonGroupMessageRead = 'onGroupMessageRead';
export const MTonMessagesDelivered = 'onMessagesDelivered';
export const MTonMessagesRecalled = 'onMessagesRecalled';

export const MTonConversationUpdate = 'onConversationUpdate';
export const MTonConversationHasRead = 'onConversationHasRead';

export const MTonReadAckForGroupMessageUpdated =
  'onReadAckForGroupMessageUpdated';
export const MTmessageReactionDidChange = 'messageReactionDidChange';

export const MTonMessageProgressUpdate = 'onMessageProgressUpdate';
export const MTonMessageError = 'onMessageError';
export const MTonMessageSuccess = 'onMessageSuccess';
export const MTonMessageReadAck = 'onMessageReadAck';
export const MTonMessageDeliveryAck = 'onMessageDeliveryAck';
export const MTonMessageStatusChanged = 'onMessageStatusChanged'; // deprecated 2022.05.05

export const MTonChatThreadCreated = 'onChatThreadCreated';
export const MTonChatThreadUpdated = 'onChatThreadUpdated';
export const MTonChatThreadDestroyed = 'onChatThreadDestroyed';
export const MTonChatThreadUserRemoved = 'onChatThreadUserRemoved';

/// ChatConversionManager methods
export const MTgetUnreadMsgCount = 'getUnreadMsgCount';
export const MTmarkAllMessagesAsRead = 'markAllMessagesAsRead';
export const MTmarkMessageAsRead = 'markMessageAsRead';
export const MTsyncConversationExt = 'syncConversationExt';
export const MTsyncConversationName = 'syncConversationName'; // deprecated 2022.05.05
export const MTremoveMessage = 'removeMessage';
export const MTgetLatestMessage = 'getLatestMessage';
export const MTgetLatestMessageFromOthers = 'getLatestMessageFromOthers';
export const MTclearAllMessages = 'clearAllMessages';
export const MTinsertMessage = 'insertMessage';
export const MTappendMessage = 'appendMessage';
export const MTupdateConversationMessage = 'updateConversationMessage';

export const MTloadMsgWithId = 'loadMsgWithId';
export const MTloadMsgWithStartId = 'loadMsgWithStartId';
export const MTloadMsgWithKeywords = 'loadMsgWithKeywords';
export const MTloadMsgWithMsgType = 'loadMsgWithMsgType';
export const MTloadMsgWithTime = 'loadMsgWithTime';

// ChatMessage methods
export const MTgetReactionList = 'getReactionList';
export const MTgroupAckCount = 'groupAckCount';

// ChatRoomManager methods
export const MTjoinChatRoom = 'joinChatRoom';
export const MTleaveChatRoom = 'leaveChatRoom';
export const MTfetchPublicChatRoomsFromServer =
  'fetchPublicChatRoomsFromServer';
export const MTfetchChatRoomInfoFromServer = 'fetchChatRoomInfoFromServer';
export const MTgetChatRoom = 'getChatRoom';
export const MTgetAllChatRooms = 'getAllChatRooms';
export const MTcreateChatRoom = 'createChatRoom';
export const MTdestroyChatRoom = 'destroyChatRoom';
export const MTchangeChatRoomSubject = 'changeChatRoomSubject';
export const MTchangeChatRoomDescription = 'changeChatRoomDescription';
export const MTfetchChatRoomMembers = 'fetchChatRoomMembers';
export const MTmuteChatRoomMembers = 'muteChatRoomMembers';
export const MTunMuteChatRoomMembers = 'unMuteChatRoomMembers';
export const MTchangeChatRoomOwner = 'changeChatRoomOwner';
export const MTaddChatRoomAdmin = 'addChatRoomAdmin';
export const MTremoveChatRoomAdmin = 'removeChatRoomAdmin';
export const MTfetchChatRoomMuteList = 'fetchChatRoomMuteList';
export const MTremoveChatRoomMembers = 'removeChatRoomMembers';
export const MTblockChatRoomMembers = 'blockChatRoomMembers';
export const MTunBlockChatRoomMembers = 'unBlockChatRoomMembers';
export const MTfetchChatRoomBlockList = 'fetchChatRoomBlockList';
export const MTupdateChatRoomAnnouncement = 'updateChatRoomAnnouncement';
export const MTfetchChatRoomAnnouncement = 'fetchChatRoomAnnouncement';

export const MTaddMembersToChatRoomAllowList = 'addMembersToChatRoomAllowList';
export const MTremoveMembersFromChatRoomAllowList =
  'removeMembersFromChatRoomAllowList';
export const MTfetchChatRoomAllowListFromServer =
  'fetchChatRoomAllowListFromServer';
export const MTisMemberInChatRoomAllowListFromServer =
  'isMemberInChatRoomAllowListFromServer';

export const MTmuteAllChatRoomMembers = 'muteAllChatRoomMembers';
export const MTunMuteAllChatRoomMembers = 'unMuteAllChatRoomMembers';

// ChatRoomManager listener
export const MTchatRoomChange = 'onChatRoomChanged';

/// ChatGroupManager methods
export const MTgetGroupWithId = 'getGroupWithId';
export const MTgetJoinedGroups = 'getJoinedGroups';
export const MTgetGroupsWithoutPushNotification =
  'getGroupsWithoutPushNotification';
export const MTgetJoinedGroupsFromServer = 'getJoinedGroupsFromServer';
export const MTgetPublicGroupsFromServer = 'getPublicGroupsFromServer';
export const MTcreateGroup = 'createGroup';
export const MTgetGroupSpecificationFromServer =
  'getGroupSpecificationFromServer';
export const MTgetGroupMemberListFromServer = 'getGroupMemberListFromServer';
export const MTgetGroupBlockListFromServer = 'getGroupBlockListFromServer';
export const MTgetGroupMuteListFromServer = 'getGroupMuteListFromServer';
export const MTgetGroupAllowListFromServer = 'getGroupAllowListFromServer';
export const MTisMemberInAllowListFromServer = 'isMemberInAllowListFromServer';
export const MTgetGroupFileListFromServer = 'getGroupFileListFromServer';
export const MTgetGroupAnnouncementFromServer =
  'getGroupAnnouncementFromServer';
export const MTaddMembers = 'addMembers';
export const MTinviterUser = 'inviterUser';
export const MTremoveMembers = 'removeMembers';
export const MTblockMembers = 'blockMembers';
export const MTunblockMembers = 'unblockMembers';
export const MTupdateGroupSubject = 'updateGroupSubject';
export const MTupdateDescription = 'updateDescription';
export const MTleaveGroup = 'leaveGroup';
export const MTdestroyGroup = 'destroyGroup';
export const MTblockGroup = 'blockGroup';
export const MTunblockGroup = 'unblockGroup';
export const MTupdateGroupOwner = 'updateGroupOwner';
export const MTaddAdmin = 'addAdmin';
export const MTremoveAdmin = 'removeAdmin';
export const MTmuteMembers = 'muteMembers';
export const MTunMuteMembers = 'unMuteMembers';
export const MTmuteAllMembers = 'muteAllMembers';
export const MTunMuteAllMembers = 'unMuteAllMembers';
export const MTaddAllowList = 'addAllowList';
export const MTremoveAllowList = 'removeAllowList';
export const MTuploadGroupSharedFile = 'uploadGroupSharedFile';
export const MTdownloadGroupSharedFile = 'downloadGroupSharedFile';
export const MTremoveGroupSharedFile = 'removeGroupSharedFile';
export const MTupdateGroupAnnouncement = 'updateGroupAnnouncement';
export const MTupdateGroupExt = 'updateGroupExt';
export const MTjoinPublicGroup = 'joinPublicGroup';
export const MTrequestToJoinPublicGroup = 'requestToJoinPublicGroup';
export const MTacceptJoinApplication = 'acceptJoinApplication';
export const MTdeclineJoinApplication = 'declineJoinApplication';
export const MTacceptInvitationFromGroup = 'acceptInvitationFromGroup';
export const MTdeclineInvitationFromGroup = 'declineInvitationFromGroup';

/// ChatGroupManager listener
export const MTonGroupChanged = 'onGroupChanged';

/// ChatPushManager methods
export const MTgetImPushConfig = 'getImPushConfig';
export const MTgetImPushConfigFromServer = 'getImPushConfigFromServer';
export const MTupdatePushNickname = 'updatePushNickname';
export const MTenableOfflinePush = 'enableOfflinePush';
export const MTdisableOfflinePush = 'disableOfflinePush';
export const MTgetNoPushGroups = 'getNoPushGroups';
export const MTsetNoDisturbUsers = 'setNoDisturbUsers';
export const MTgetNoDisturbUsersFromServer = 'getNoDisturbUsersFromServer';

export const MTupdateHMSPushToken = 'updateHMSPushToken';
export const MTupdateFCMPushToken = 'updateFCMPushToken';
export const MTupdateAPNsPushToken = 'updateAPNsPushToken';

export const MTimPushNoDisturb = 'imPushNoDisturb';
export const MTupdateImPushStyle = 'updateImPushStyle';
export const MTupdateGroupPushService = 'updateGroupPushService';
export const MTgetNoDisturbGroups = 'getNoDisturbGroups';
export const MTupdateUserPushService = 'updateUserPushService';
export const MTgetNoPushUsers = 'getNoPushUsers';

export const MTupdatePushConfig = 'updatePushConfig';

export const MTreportPushAction = 'reportPushAction';
export const MTsetConversationSilentMode = 'setConversationSilentMode';
export const MTremoveConversationSilentMode = 'removeConversationSilentMode';
export const MTfetchConversationSilentMode = 'fetchConversationSilentMode';
export const MTsetSilentModeForAll = 'setSilentModeForAll';
export const MTfetchSilentModeForAll = 'fetchSilentModeForAll';
export const MTfetchSilentModeForConversations =
  'fetchSilentModeForConversations';
export const MTsetPreferredNotificationLanguage =
  'setPreferredNotificationLanguage';
export const MTfetchPreferredNotificationLanguage =
  'fetchPreferredNotificationLanguage';

/// ChatUserInfoManager methods
export const MTupdateOwnUserInfo = 'updateOwnUserInfo';
export const MTupdateOwnUserInfoWithType = 'updateOwnUserInfoWithType';
export const MTfetchUserInfoById = 'fetchUserInfoById';
export const MTfetchUserInfoByIdWithType = 'fetchUserInfoByIdWithType';

/// PresenceManager methods
export const MTpublishPresenceWithDescription =
  'publishPresenceWithDescription';
export const MTpresenceSubscribe = 'presenceSubscribe';
export const MTpresenceUnsubscribe = 'presenceUnsubscribe';
export const MTfetchSubscribedMembersWithPageNum =
  'fetchSubscribedMembersWithPageNum';
export const MTfetchPresenceStatus = 'fetchPresenceStatus';

/// PresenceManager listener
export const MTonPresenceStatusChanged = 'onPresenceStatusChanged';

/// ChatThreadManager methods
export const MTfetchChatThreadDetail = 'fetchChatThreadDetail';
export const MTfetchJoinedChatThreads = 'fetchJoinedChatThreads';
export const MTfetchChatThreadsWithParentId = 'fetchChatThreadsWithParentId';
export const MTfetchJoinedChatThreadsWithParentId =
  'fetchJoinedChatThreadsWithParentId';
export const MTfetchChatThreadMember = 'fetchChatThreadMember';
export const MTfetchLastMessageWithChatThreads =
  'fetchLastMessageWithChatThreads';
export const MTremoveMemberFromChatThread = 'removeMemberFromChatThread';
export const MTupdateChatThreadSubject = 'updateChatThreadSubject';
export const MTcreateChatThread = 'createChatThread';
export const MTjoinChatThread = 'joinChatThread';
export const MTleaveChatThread = 'leaveChatThread';
export const MTdestroyChatThread = 'destroyChatThread';
export const MTgetMessageThread = 'getMessageThread';
