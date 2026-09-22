/**
 * Constant expression
 */

/// ChatClient methods
export const MTinit = 'init';
export const MTlogin = 'login';
export const MTlogout = 'logout';
export const MTchangeAppKey = 'changeAppKey';
export const MTchangeAppId = 'changeAppId';
export const MTupdateCurrentUserNick = 'updateCurrentUserNick'; // deprecated 2026-05-21
export const MTuploadLog = 'uploadLog';
export const MTcompressLogs = 'compressLogs';
export const MTkickDevice = 'kickDevice';
export const MTkickAllDevices = 'kickAllDevices';
export const MTgetLoggedInDevicesFromServer = 'getLoggedInDevicesFromServer';
export const MTgetCurrentUser = 'getCurrentUser';
export const MTgetToken = 'getToken';
export const MTisConnected = 'isConnected';
export const MTrenewToken = 'renewToken';

/// ChatClient listener
export const MTonConnected = 'onConnected';
export const MTonDisconnected = 'onDisconnected';
export const MTonMultiDeviceEvent = 'onMultiDeviceEvent';
export const MTonCustomEvent = 'onSendDataToFlutter';
export const MTonTokenWillExpire = 'onTokenWillExpire';
export const MTonTokenDidExpire = 'onTokenDidExpire';

export const MTonMultiDeviceEventContact = 'onMultiDeviceEventContact';
export const MTonMultiDeviceEventGroup = 'onMultiDeviceEventGroup';
export const MTonMultiDeviceEventThread = 'onMultiDeviceEventThread';
export const MTonMultiDeviceEventRemoveMessage =
  'onMultiDeviceEventRemoveMessage';
export const MTonMultiDeviceEventConversation =
  'onMultiDeviceEventConversation';

export const MTonDataSyncStart = 'onDataSyncStart';
export const MTonDataSyncFinish = 'onDataSyncFinish';
export const MTonDatabaseOpened = 'onDatabaseOpened';

/// ChatContactManager methods
export const MTaddContact = 'addContact';
export const MTdeleteContact = 'deleteContact';
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
export const MTsendMessageReadReceipts = 'sendMessageReadReceipts';
export const MTclearConversationUnreadMessageCount =
  'clearConversationUnreadMessageCount';
export const MTclearAllConversationUnreadMessageCount =
  'clearAllConversationUnreadMessageCount';
export const MTgetGroupMessageReadReceipts = 'getGroupMessageReadReceipts';
export const MTfetchGroupMessageReadReceipts = 'fetchGroupMessageReadReceipts';
export const MTrecallMessage = 'recallMessage';
export const MTgetConversation = 'getConversation';
export const MTgetUnreadMessageCount = 'getUnreadMessageCount';
export const MTupdateChatMessage = 'updateChatMessage';
export const MTdownloadAttachmentInCombine = 'downloadAttachmentInCombine';
export const MTdownloadThumbnailInCombine = 'downloadThumbnailInCombine';
export const MTdownloadAttachment = 'downloadAttachment';
export const MTdownloadThumbnail = 'downloadThumbnail';
export const MTdownloadBigImage = 'downloadBigImage';
export const MTvoiceMessageToText = 'voiceMessageToText';
export const MTvoiceFileToText = 'voiceFileToText';
export const MTimportMessages = 'importMessages';
export const MTloadAllConversations = 'loadAllConversations';
export const MTdeleteConversation = 'deleteConversation';
export const MTdeleteConversations = 'deleteConversations';
export const MTfetchHistoryMessagesByOptions = 'fetchHistoryMessagesByOptions';
export const MTsearchChatMsgFromDB = 'searchChatMsgFromDB';
export const MTgetConvsMsgsWithKeyword = 'getConvsMsgsWithKeyword';
export const MTgetMessage = 'getMessage';
export const MTgetMessagesWithIds = 'getMessagesWithIds';
export const MTdeleteRemoteConversation = 'deleteRemoteConversation';
export const MTdeleteMessagesBeforeTimestamp = 'deleteMessagesBeforeTimestamp';

export const MTtranslateMessage = 'translateMessage';
export const MTfetchSupportLanguages = 'fetchSupportLanguages';

export const MTaddReaction = 'addReaction';
export const MTremoveReaction = 'removeReaction';
export const MTfetchReactionList = 'fetchReactionList';
export const MTfetchReactionDetail = 'fetchReactionDetail';

export const MTremoveMessagesFromServerWithMsgIds =
  'removeMessagesFromServerWithMsgIds';
export const MTremoveMessagesFromServerWithTs =
  'removeMessagesFromServerWithTs';

export const MTpinConversation = 'pinConversation';
export const MTmodifyMsgBody = 'modifyMsgBody';
export const MTdownloadAndParseCombineMessage =
  'downloadAndParseCombineMessage';

/// ChatManager listener
export const MTonMessagesReceived = 'onMessagesReceived';
export const MTonCmdMessagesReceived = 'onCmdMessagesReceived';
export const MTonMessageReadReceipts = 'onMessageReadReceipts';
export const MTonMessagesDelivered = 'onMessagesDelivered';
export const MTonMessagesRecalledInfo = 'onMessagesRecalledInfo';

export const MTonConversationUpdate = 'onConversationUpdate';

export const MTmessageReactionDidChange = 'messageReactionDidChange';
export const MTonMessageContentChanged = 'onMessageContentChanged';

export const MTonMessageProgressUpdate = 'onMessageProgressUpdate';
export const MTonMessageError = 'onMessageError';
export const MTonMessageSuccess = 'onMessageSuccess';

export const MTonChatThreadCreated = 'onChatThreadCreated';
export const MTonChatThreadUpdated = 'onChatThreadUpdated';
export const MTonChatThreadDestroyed = 'onChatThreadDestroyed';
export const MTonChatThreadUserRemoved = 'onChatThreadUserRemoved';

/// ChatConversionManager methods
export const MTgetUnreadMsgCount = 'getUnreadMsgCount';
export const MTgetMsgCount = 'getMsgCount';
export const MTsyncConversationExt = 'syncConversationExt';
export const MTsyncConversationName = 'syncConversationName'; // deprecated 2022.05.05
export const MTremoveMessage = 'removeMessage';
export const MTgetLatestMessage = 'getLatestMessage';
export const MTgetLatestMessageFromOthers = 'getLatestMessageFromOthers';
export const MTclearAllMessages = 'clearAllMessages';
export const MTdeleteMessagesWithTs = 'deleteMessagesWithTs';
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

// ChatRoomManager methods
export const MTjoinChatRoom = 'joinChatRoom';
export const MTleaveChatRoom = 'leaveChatRoom';
export const MTfetchPublicChatRoomsFromServer =
  'fetchPublicChatRoomsFromServer';
export const MTfetchChatRoomInfoFromServer = 'fetchChatRoomInfoFromServer';
export const MTgetChatRoom = 'getChatRoom';
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
export const MTisMemberInChatRoomMuteListFromServer =
  'isMemberInChatRoomMuteListFromServer';

export const MTmuteAllChatRoomMembers = 'muteAllChatRoomMembers';
export const MTunMuteAllChatRoomMembers = 'unMuteAllChatRoomMembers';

export const MTfetchChatRoomAttributes = 'fetchChatRoomAttributes';
export const MTfetchChatRoomAllAttributes = 'fetchChatRoomAllAttributes';
export const MTsetChatRoomAttributes = 'setChatRoomAttributes';
export const MTremoveChatRoomAttributes = 'removeChatRoomAttributes';

// ChatRoomManager listener
export const MTchatRoomChange = 'onChatRoomChanged';

/// ChatGroupManager methods
export const MTgetGroupWithId = 'getGroupWithId';
export const MTgetJoinedGroups = 'getJoinedGroups';
export const MTcreateGroup = 'createGroup';
export const MTupdateGroupConfigs = 'updateGroupConfigs';
export const MTgetGroupSpecificationFromServer =
  'getGroupSpecificationFromServer';
export const MTgetGroupMemberListFromServer = 'getGroupMemberListFromServer';
export const MTfetchMemberInfoListFromServer = 'fetchMemberInfoListFromServer';
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
export const MTupdateGroupAvatar = 'updateGroupAvatar';
export const MTupdateGroupExt = 'updateGroupExt';
export const MTjoinPublicGroup = 'joinPublicGroup';
export const MTrequestToJoinPublicGroup = 'requestToJoinPublicGroup';
export const MTacceptJoinApplication = 'acceptJoinApplication';
export const MTdeclineJoinApplication = 'declineJoinApplication';
export const MTacceptInvitationFromGroup = 'acceptInvitationFromGroup';
export const MTdeclineInvitationFromGroup = 'declineInvitationFromGroup';
export const MTsetMemberAttributesFromGroup = 'setMemberAttributesFromGroup';
export const MTfetchMemberAttributesFromGroup =
  'fetchMemberAttributesFromGroup';
export const MTfetchMembersAttributesFromGroup =
  'fetchMembersAttributesFromGroup';
export const MTupdateGroupNamecard = 'updateGroupNamecard';
export const MTgetGroupNamecard = 'getGroupNamecard';

/// ChatGroupManager listener
export const MTonGroupChanged = 'onGroupChanged';

/// ChatPushManager methods
export const MTgetImPushConfig = 'getImPushConfig';
export const MTgetImPushConfigFromServer = 'getImPushConfigFromServer';
export const MTupdatePushNickname = 'updatePushNickname';
export const MTenableOfflinePush = 'enableOfflinePush';
export const MTdisableOfflinePush = 'disableOfflinePush';
export const MTgetNoPushGroups = 'getNoPushGroups';
export const MTsetNoDisturbUsers = 'setNoDisturbUsers'; // deprecated 2022.05.04
export const MTgetNoDisturbUsersFromServer = 'getNoDisturbUsersFromServer'; // deprecated 2022.05.04

export const MTupdateHMSPushToken = 'updateHMSPushToken'; // deprecated 2026-05-21
export const MTupdateFCMPushToken = 'updateFCMPushToken'; // deprecated 2026-05-21
export const MTupdateAPNsPushToken = 'updateAPNsPushToken'; // deprecated 2026-05-21

export const MTimPushNoDisturb = 'imPushNoDisturb'; // deprecated 2022.05.04
export const MTupdateImPushStyle = 'updateImPushStyle';
export const MTupdateGroupPushService = 'updateGroupPushService';
export const MTgetNoDisturbGroups = 'getNoDisturbGroups'; // deprecated 2022.05.04
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
export const MTsetPushTemplate = 'setPushTemplate';
export const MTgetPushTemplate = 'getPushTemplate';

/// ChatUserInfoManager methods
export const MTupdateOwnUserInfo = 'updateOwnUserInfo';
export const MTupdateOwnUserInfoWithType = 'updateOwnUserInfoWithType';
export const MTfetchUserInfoById = 'fetchUserInfoById';
export const MTfetchUserInfoByIdWithType = 'fetchUserInfoByIdWithType';
export const MTgetLocalUserInfoByIds = 'getLocalUserInfoByIds';
export const MTsubscribeUsersInfo = 'subscribeUsersInfo';
export const MTunsubscribeUsersInfo = 'unsubscribeUsersInfo';
export const MTfetchSubscribedUsers = 'fetchSubscribedUsers';

/// ChatUserInfoManager listener
export const MTonUserInfoChanged = 'onUserInfoChanged';

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
export const MTgetThreadConversation = 'getThreadConversation';

export const MTgetAllContacts = 'getAllContacts';
export const MTsetContactRemark = 'setContactRemark';
export const MTgetContact = 'getContact';
export const MTfetchJoinedGroupCount = 'fetchJoinedGroupCount';

// 2024-04-17 added
export const MTgetPinInfo = 'getPinInfo';
export const MTpinnedMessages = 'pinnedMessages';
export const MTonMessagePinChanged = 'onMessagePinChanged';
export const MTaddRemoteAndLocalConversationsMark =
  'addRemoteAndLocalConversationsMark';
export const MTdeleteRemoteAndLocalConversationsMark =
  'deleteRemoteAndLocalConversationsMark';
export const MTdeleteAllMessageAndConversation =
  'deleteAllMessageAndConversation';
export const MTpinMessage = 'pinMessage';
export const MTunpinMessage = 'unpinMessage';
export const MTfetchPinnedMessages = 'fetchPinnedMessages';

// 2024-08-15 added
export const MTsearchMessages = 'searchMessages';
export const MTsearchMessagesInConversation = 'searchMessagesInConversation';
export const MTremoveMessagesWithTimestamp = 'removeMessagesWithTimestamp';
export const MTgetMessageCountWithTimestamp = 'getMessageCountWithTimestamp';

// 2024-11-28 added
export const MTgetMessageCount = 'getMessageCount';
export const MTonOfflineMessageSyncStart = 'onOfflineMessageSyncStart';
export const MTonOfflineMessageSyncFinish = 'onOfflineMessageSyncFinish';

// 2025-11-19 added
export const MTgetRTCTokenInfoWithChannelName =
  'getRTCTokenInfoWithChannelName';
export const MTgetUserIdsWithRTCUids = 'getUserIdsWithRTCUids';

// 2026-04-10 added
export const MTonStreamMessagesReceived = 'onStreamMessagesReceived';

// 2026-08-25 added
export const MTsearchMessagesFromServer = 'searchMessagesFromServer';
