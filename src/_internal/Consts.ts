/**
 * Constant expression
 */

/// ChatClient methods
export const MethodTypeinit = 'init';
export const MethodTypecreateAccount = 'createAccount';
export const MethodTypelogin = 'login';
export const MethodTypelogout = 'logout';
export const MethodTypechangeAppKey = 'changeAppKey';
export const MethodTypeisLoggedInBefore = 'isLoggedInBefore';
export const MethodTypeupdateCurrentUserNick = 'updateCurrentUserNick';
export const MethodTypeuploadLog = 'uploadLog';
export const MethodTypecompressLogs = 'compressLogs';
export const MethodTypekickDevice = 'kickDevice';
export const MethodTypekickAllDevices = 'kickAllDevices';
export const MethodTypegetLoggedInDevicesFromServer =
  'getLoggedInDevicesFromServer';
export const MethodTypegetCurrentUser = 'getCurrentUser';
export const MethodTypegetToken = 'getToken';
export const MethodTypeloginWithAgoraToken = 'loginWithAgoraToken';
export const MethodTypeisConnected = 'isConnected';
export const MethodTyperenewToken = 'renewToken';

/// ChatClient listener
export const MethodTypeonConnected = 'onConnected';
export const MethodTypeonDisconnected = 'onDisconnected';
export const MethodTypeonMultiDeviceEvent = 'onMultiDeviceEvent';
export const MethodTypeonSendDataToFlutter = 'onSendDataToFlutter';
export const MethodTypeonTokenWillExpire = 'onTokenWillExpire';
export const MethodTypeonTokenDidExpire = 'onTokenDidExpire';

/// ChatContactManager methods
export const MethodTypeaddContact = 'addContact';
export const MethodTypedeleteContact = 'deleteContact';
export const MethodTypegetAllContactsFromServer = 'getAllContactsFromServer';
export const MethodTypegetAllContactsFromDB = 'getAllContactsFromDB';
export const MethodTypeaddUserToBlockList = 'addUserToBlockList';
export const MethodTyperemoveUserFromBlockList = 'removeUserFromBlockList';
export const MethodTypegetBlockListFromServer = 'getBlockListFromServer';
export const MethodTypegetBlockListFromDB = 'getBlockListFromDB';
export const MethodTypeacceptInvitation = 'acceptInvitation';
export const MethodTypedeclineInvitation = 'declineInvitation';
export const MethodTypegetSelfIdsOnOtherPlatform = 'getSelfIdsOnOtherPlatform';

/// ChatContactManager listener
export const MethodTypeonContactChanged = 'onContactChanged';

/// ChatManager methods
export const MethodTypesendMessage = 'sendMessage';
export const MethodTyperesendMessage = 'resendMessage';
export const MethodTypeackMessageRead = 'ackMessageRead';
export const MethodTypeackGroupMessageRead = 'ackGroupMessageRead';
export const MethodTypeackConversationRead = 'ackConversationRead';
export const MethodTyperecallMessage = 'recallMessage';
export const MethodTypegetConversation = 'getConversation';
export const MethodTypemarkAllChatMsgAsRead = 'markAllChatMsgAsRead';
export const MethodTypegetUnreadMessageCount = 'getUnreadMessageCount';
export const MethodTypeupdateChatMessage = 'updateChatMessage';
export const MethodTypedownloadAttachment = 'downloadAttachment';
export const MethodTypedownloadThumbnail = 'downloadThumbnail';
export const MethodTypeimportMessages = 'importMessages';
export const MethodTypeloadAllConversations = 'loadAllConversations';
export const MethodTypegetConversationsFromServer =
  'getConversationsFromServer';
export const MethodTypedeleteConversation = 'deleteConversation';
export const MethodTypefetchHistoryMessages = 'fetchHistoryMessages';
export const MethodTypesearchChatMsgFromDB = 'searchChatMsgFromDB';
export const MethodTypegetMessage = 'getMessage';
export const MethodTypeasyncFetchGroupAcks = 'asyncFetchGroupAcks';
export const MethodTypedeleteRemoteConversation = 'deleteRemoteConversation';

/// ChatManager listener
export const MethodTypeonMessagesReceived = 'onMessagesReceived';
export const MethodTypeonCmdMessagesReceived = 'onCmdMessagesReceived';
export const MethodTypeonMessagesRead = 'onMessagesRead';
export const MethodTypeonGroupMessageRead = 'onGroupMessageRead';
export const MethodTypeonMessagesDelivered = 'onMessagesDelivered';
export const MethodTypeonMessagesRecalled = 'onMessagesRecalled';

export const MethodTypeonConversationUpdate = 'onConversationUpdate';
export const MethodTypeonConversationHasRead = 'onConversationHasRead';

export const MethodTypeonMessageProgressUpdate = 'onMessageProgressUpdate';
export const MethodTypeonMessageError = 'onMessageError';
export const MethodTypeonMessageSuccess = 'onMessageSuccess';
export const MethodTypeonMessageReadAck = 'onMessageReadAck';
export const MethodTypeonMessageDeliveryAck = 'onMessageDeliveryAck';
export const MethodTypeonMessageStatusChanged = 'onMessageStatusChanged';

/// ChatConversionManager methods
export const MethodTypegetUnreadMsgCount = 'getUnreadMsgCount';
export const MethodTypemarkAllMessagesAsRead = 'markAllMessagesAsRead';
export const MethodTypemarkMessageAsRead = 'markMessageAsRead';
export const MethodTypesyncConversationExt = 'syncConversationExt';
export const MethodTypesyncConversationName = 'syncConversationName';
export const MethodTyperemoveMessage = 'removeMessage';
export const MethodTypegetLatestMessage = 'getLatestMessage';
export const MethodTypegetLatestMessageFromOthers =
  'getLatestMessageFromOthers';
export const MethodTypeclearAllMessages = 'clearAllMessages';
export const MethodTypeinsertMessage = 'insertMessage';
export const MethodTypeappendMessage = 'appendMessage';
export const MethodTypeupdateConversationMessage = 'updateConversationMessage';

export const MethodTypeloadMsgWithId = 'loadMsgWithId';
export const MethodTypeloadMsgWithStartId = 'loadMsgWithStartId';
export const MethodTypeloadMsgWithKeywords = 'loadMsgWithKeywords';
export const MethodTypeloadMsgWithMsgType = 'loadMsgWithMsgType';
export const MethodTypeloadMsgWithTime = 'loadMsgWithTime';

// ChatRoomManager methods
export const MethodTypejoinChatRoom = 'joinChatRoom';
export const MethodTypeleaveChatRoom = 'leaveChatRoom';
export const MethodTypefetchPublicChatRoomsFromServer =
  'fetchPublicChatRoomsFromServer';
export const MethodTypefetchChatRoomInfoFromServer =
  'fetchChatRoomInfoFromServer';
export const MethodTypegetChatRoom = 'getChatRoom';
export const MethodTypegetAllChatRooms = 'getAllChatRooms';
export const MethodTypecreateChatRoom = 'createChatRoom';
export const MethodTypedestroyChatRoom = 'destroyChatRoom';
export const MethodTypechangeChatRoomSubject = 'changeChatRoomSubject';
export const MethodTypechangeChatRoomDescription = 'changeChatRoomDescription';
export const MethodTypefetchChatRoomMembers = 'fetchChatRoomMembers';
export const MethodTypemuteChatRoomMembers = 'muteChatRoomMembers';
export const MethodTypeunMuteChatRoomMembers = 'unMuteChatRoomMembers';
export const MethodTypechangeChatRoomOwner = 'changeChatRoomOwner';
export const MethodTypeaddChatRoomAdmin = 'addChatRoomAdmin';
export const MethodTyperemoveChatRoomAdmin = 'removeChatRoomAdmin';
export const MethodTypefetchChatRoomMuteList = 'fetchChatRoomMuteList';
export const MethodTyperemoveChatRoomMembers = 'removeChatRoomMembers';
export const MethodTypeblockChatRoomMembers = 'blockChatRoomMembers';
export const MethodTypeunBlockChatRoomMembers = 'unBlockChatRoomMembers';
export const MethodTypefetchChatRoomBlockList = 'fetchChatRoomBlockList';
export const MethodTypeupdateChatRoomAnnouncement =
  'updateChatRoomAnnouncement';
export const MethodTypefetchChatRoomAnnouncement = 'fetchChatRoomAnnouncement';

export const MethodTypeaddMembersToChatRoomWhiteList =
  'addMembersToChatRoomWhiteList';
export const MethodTyperemoveMembersFromChatRoomWhiteList =
  'removeMembersFromChatRoomWhiteList';
export const MethodTypefetchChatRoomWhiteListFromServer =
  'fetchChatRoomWhiteListFromServer';
export const MethodTypeisMemberInChatRoomWhiteListFromServer =
  'isMemberInChatRoomWhiteListFromServer';

export const MethodTypemuteAllChatRoomMembers = 'muteAllChatRoomMembers';
export const MethodTypeunMuteAllChatRoomMembers = 'umMuteAllChatRoomMembers';

// ChatRoomManager listener
export const MethodTypechatRoomChange = 'onChatRoomChanged';

/// ChatGroupManager methods
export const MethodTypegetGroupWithId = 'getGroupWithId';
export const MethodTypegetJoinedGroups = 'getJoinedGroups';
export const MethodTypegetGroupsWithoutPushNotification =
  'getGroupsWithoutPushNotification';
export const MethodTypegetJoinedGroupsFromServer = 'getJoinedGroupsFromServer';
export const MethodTypegetPublicGroupsFromServer = 'getPublicGroupsFromServer';
export const MethodTypecreateGroup = 'createGroup';
export const MethodTypegetGroupSpecificationFromServer =
  'getGroupSpecificationFromServer';
export const MethodTypegetGroupMemberListFromServer =
  'getGroupMemberListFromServer';
export const MethodTypegetGroupBlockListFromServer =
  'getGroupBlockListFromServer';
export const MethodTypegetGroupMuteListFromServer =
  'getGroupMuteListFromServer';
export const MethodTypegetGroupWhiteListFromServer =
  'getGroupWhiteListFromServer';
export const MethodTypeisMemberInWhiteListFromServer =
  'isMemberInWhiteListFromServer';
export const MethodTypegetGroupFileListFromServer = 'getGroupFileList';
export const MethodTypegetGroupAnnouncementFromServer =
  'getGroupAnnouncementFromServer';
export const MethodTypeaddMembers = 'addMembers';
export const MethodTypeinviterUser = 'inviterUser';
export const MethodTyperemoveMembers = 'removeMembers';
export const MethodTypeblockMembers = 'blockMembers';
export const MethodTypeunblockMembers = 'unblockMembers';
export const MethodTypeupdateGroupSubject = 'updateGroupSubject';
export const MethodTypeupdateDescription = 'updateDescription';
export const MethodTypeleaveGroup = 'leaveGroup';
export const MethodTypedestroyGroup = 'destroyGroup';
export const MethodTypeblockGroup = 'blockGroup';
export const MethodTypeunblockGroup = 'unblockGroup';
export const MethodTypeupdateGroupOwner = 'updateGroupOwner';
export const MethodTypeaddAdmin = 'addAdmin';
export const MethodTyperemoveAdmin = 'removeAdmin';
export const MethodTypemuteMembers = 'muteMembers';
export const MethodTypeunMuteMembers = 'unMuteMembers';
export const MethodTypemuteAllMembers = 'muteAllMembers';
export const MethodTypeunMuteAllMembers = 'unMuteAllMembers';
export const MethodTypeaddWhiteList = 'addWhiteList';
export const MethodTyperemoveWhiteList = 'removeWhiteList';
export const MethodTypeuploadGroupSharedFile = 'uploadGroupSharedFile';
export const MethodTypedownloadGroupSharedFile = 'downloadGroupSharedFile';
export const MethodTyperemoveGroupSharedFile = 'removeGroupSharedFile';
export const MethodTypeupdateGroupAnnouncement = 'updateGroupAnnouncement';
export const MethodTypeupdateGroupExt = 'updateGroupExt';
export const MethodTypejoinPublicGroup = 'joinPublicGroup';
export const MethodTyperequestToJoinPublicGroup = 'requestToJoinPublicGroup';
export const MethodTypeacceptJoinApplication = 'acceptJoinApplication';
export const MethodTypedeclineJoinApplication = 'declineJoinApplication';
export const MethodTypeacceptInvitationFromGroup = 'acceptInvitationFromGroup';
export const MethodTypedeclineInvitationFromGroup =
  'declineInvitationFromGroup';
export const MethodTypeignoreGroupPush = 'ignoreGroupPush';

/// ChatGroupManager listener
export const MethodTypeonGroupChanged = 'onGroupChanged';

/// ChatPushManager methods
export const MethodTypegetImPushConfig = 'getImPushConfig';
export const MethodTypegetImPushConfigFromServer = 'getImPushConfigFromServer';
export const MethodTypeupdatePushNickname = 'updatePushNickname';
export const MethodTypeupdateHMSPushToken = 'updateHMSPushToken';
export const MethodTypeupdateFCMPushToken = 'updateFCMPushToken';
export const MethodTypeenableOfflinePush = 'enableOfflinePush';
export const MethodTypedisableOfflinePush = 'disableOfflinePush';
export const MethodTypegetNoPushGroups = 'getNoPushGroups';
export const MethodTypesetNoDisturbUsers = 'setNoDisturbUsers';
export const MethodTypegetNoDisturbUsersFromServer =
  'getNoDisturbUsersFromServer';

export const MethodTypeimPushNoDisturb = 'imPushNoDisturb';
export const MethodTypeupdateImPushStyle = 'updateImPushStyle';
export const MethodTypeupdateGroupPushService = 'updateGroupPushService';
export const MethodTypegetNoDisturbGroups = 'getNoDisturbGroups';

/// ChatUserInfoManager methods
export const MethodTypeupdateOwnUserInfo = 'updateOwnUserInfo';
export const MethodTypeupdateOwnUserInfoWithType = 'updateOwnUserInfoWithType';
export const MethodTypefetchUserInfoById = 'fetchUserInfoById';
export const MethodTypefetchUserInfoByIdWithType = 'fetchUserInfoByIdWithType';

export const CHAT_ROOM_EVENT_ON_CHAT_ROOM_DESTROYED = 'onChatRoomDestroyed';
export const CHAT_ROOM_EVENT_ON_MEMBER_JOINED = 'onMemberJoined';
export const CHAT_ROOM_EVENT_ON_MEMBER_EXITED = 'onMemberExited';
export const CHAT_ROOM_EVENT_ON_REMOVED_FROM_CHAT_ROOM =
  'onRemovedFromChatRoom';
export const CHAT_ROOM_EVENT_ON_MUTE_LIST_ADDED = 'onMuteListAdded';
export const CHAT_ROOM_EVENT_ON_MUTE_LIST_REMOVED = 'onMuteListRemoved';
export const CHAT_ROOM_EVENT_ON_ADMIN_ADDED = 'onAdminAdded';
export const CHAT_ROOM_EVENT_ON_ADMIN_REMOVED = 'onAdminRemoved';
export const CHAT_ROOM_EVENT_ON_OWNER_CHANGED = 'onOwnerChanged';
export const CHAT_ROOM_EVENT_ON_ANNOUNCEMENT_CHANGED = 'onAnnouncementChanged';
export const CHAT_ROOM_EVENT_ON_WHITE_LIST_REMOVED = 'onWhiteListRemoved';
export const CHAT_ROOM_EVENT_ON_WHITE_LIST_ADDED = 'onWhiteListAdded';
export const CHAT_ROOM_EVENT_ON_ALL_MEMBER_MUTE_STATE_CHANGED =
  'onAllMemberMuteStateChanged';
