//
// Created by asterisk on 2022/3/3.
//

#include "ExtSdkMethodType.h"

EXT_SDK_NAMESPACE_BEGIN

/// EMClient methods
const std::string ExtSdkMethodType::init = "init";
const std::string ExtSdkMethodType::createAccount = "createAccount";
const std::string ExtSdkMethodType::login = "login";
const std::string ExtSdkMethodType::logout = "logout";
const std::string ExtSdkMethodType::changeAppKey = "changeAppKey";
const std::string ExtSdkMethodType::isLoggedInBefore = "isLoggedInBefore";
const std::string ExtSdkMethodType::updateCurrentUserNick = "updateCurrentUserNick";
const std::string ExtSdkMethodType::uploadLog = "uploadLog";
const std::string ExtSdkMethodType::compressLogs = "compressLogs";
const std::string ExtSdkMethodType::kickDevice = "kickDevice";
const std::string ExtSdkMethodType::kickAllDevices = "kickAllDevices";
const std::string ExtSdkMethodType::getLoggedInDevicesFromServer = "getLoggedInDevicesFromServer";
const std::string ExtSdkMethodType::getCurrentUser = "getCurrentUser";

const std::string ExtSdkMethodType::onConnected = "onConnected";
const std::string ExtSdkMethodType::onDisconnected = "onDisconnected";
const std::string ExtSdkMethodType::onMultiDeviceEvent = "onMultiDeviceEvent";
const std::string ExtSdkMethodType::onSendDataToFlutter = "onSendDataToFlutter";

/// EMContactManager methods
const std::string ExtSdkMethodType::addContact = "addContact";
const std::string ExtSdkMethodType::deleteContact = "deleteContact";
const std::string ExtSdkMethodType::getAllContactsFromServer = "getAllContactsFromServer";
const std::string ExtSdkMethodType::getAllContactsFromDB = "getAllContactsFromDB";
const std::string ExtSdkMethodType::addUserToBlockList = "addUserToBlockList";
const std::string ExtSdkMethodType::removeUserFromBlockList = "removeUserFromBlockList";
const std::string ExtSdkMethodType::getBlockListFromServer = "getBlockListFromServer";
const std::string ExtSdkMethodType::getBlockListFromDB = "getBlockListFromDB";
const std::string ExtSdkMethodType::acceptInvitation = "acceptInvitation";
const std::string ExtSdkMethodType::declineInvitation = "declineInvitation";
const std::string ExtSdkMethodType::getSelfIdsOnOtherPlatform = "getSelfIdsOnOtherPlatform";


const std::string ExtSdkMethodType::onContactChanged = "onContactChanged";

/// EMChatManager methods
const std::string ExtSdkMethodType::sendMessage = "sendMessage";
const std::string ExtSdkMethodType::resendMessage = "resendMessage";
const std::string ExtSdkMethodType::ackMessageRead = "ackMessageRead";
const std::string ExtSdkMethodType::ackGroupMessageRead = "ackGroupMessageRead";
const std::string ExtSdkMethodType::ackConversationRead = "ackConversationRead";
const std::string ExtSdkMethodType::recallMessage = "recallMessage";
const std::string ExtSdkMethodType::getConversation = "getConversation";
const std::string ExtSdkMethodType::markAllChatMsgAsRead = "markAllChatMsgAsRead";
const std::string ExtSdkMethodType::getUnreadMessageCount = "getUnreadMessageCount";
const std::string ExtSdkMethodType::updateChatMessage = "updateChatMessage";
const std::string ExtSdkMethodType::downloadAttachment = "downloadAttachment";
const std::string ExtSdkMethodType::downloadThumbnail = "downloadThumbnail";
const std::string ExtSdkMethodType::importMessages = "importMessages";
const std::string ExtSdkMethodType::loadAllConversations = "loadAllConversations";
const std::string ExtSdkMethodType::getConversationsFromServer = "getConversationsFromServer";
const std::string ExtSdkMethodType::deleteConversation = "deleteConversation";
const std::string ExtSdkMethodType::fetchHistoryMessages = "fetchHistoryMessages";
const std::string ExtSdkMethodType::searchChatMsgFromDB = "searchChatMsgFromDB";
const std::string ExtSdkMethodType::getMessage = "getMessage";
const std::string ExtSdkMethodType::asyncFetchGroupAcks = "asyncFetchGroupAcks";

/// EMChatManager listener
const std::string ExtSdkMethodType::onMessagesReceived = "onMessagesReceived";
const std::string ExtSdkMethodType::onCmdMessagesReceived = "onCmdMessagesReceived";
const std::string ExtSdkMethodType::onMessagesRead = "onMessagesRead";
const std::string ExtSdkMethodType::onGroupMessageRead = "onGroupMessageRead";
const std::string ExtSdkMethodType::onMessagesDelivered = "onMessagesDelivered";
const std::string ExtSdkMethodType::onMessagesRecalled = "onMessagesRecalled";

const std::string ExtSdkMethodType::onConversationUpdate = "onConversationUpdate";
const std::string ExtSdkMethodType::onConversationHasRead = "onConversationHasRead";

/// EMMessage listener
const std::string ExtSdkMethodType::onMessageProgressUpdate = "onMessageProgressUpdate";
const std::string ExtSdkMethodType::onMessageError = "onMessageError";
const std::string ExtSdkMethodType::onMessageSuccess = "onMessageSuccess";
const std::string ExtSdkMethodType::onMessageReadAck = "onMessageReadAck";
const std::string ExtSdkMethodType::onMessageDeliveryAck = "onMessageDeliveryAck";
const std::string ExtSdkMethodType::onMessageStatusChanged = "onMessageStatusChanged";

/// EMConversation
const std::string ExtSdkMethodType::getUnreadMsgCount = "getUnreadMsgCount";
const std::string ExtSdkMethodType::markAllMessagesAsRead = "markAllMessagesAsRead";
const std::string ExtSdkMethodType::markMessageAsRead = "markMessageAsRead";
const std::string ExtSdkMethodType::syncConversationExt = "syncConversationExt";
const std::string ExtSdkMethodType::syncConversationName = "syncConversationName";
const std::string ExtSdkMethodType::removeMessage = "removeMessage";
const std::string ExtSdkMethodType::getLatestMessage = "getLatestMessage";
const std::string ExtSdkMethodType::getLatestMessageFromOthers = "getLatestMessageFromOthers";
const std::string ExtSdkMethodType::clearAllMessages = "clearAllMessages";
const std::string ExtSdkMethodType::insertMessage = "insertMessage";
const std::string ExtSdkMethodType::appendMessage = "appendMessage";
const std::string ExtSdkMethodType::updateConversationMessage = "updateConversationMessage";

// 根据消息id获取消息
const std::string ExtSdkMethodType::loadMsgWithId = "loadMsgWithId";
// 根据起始消息id获取消息
const std::string ExtSdkMethodType::loadMsgWithStartId = "loadMsgWithStartId";
// 根据关键字获取消息
const std::string ExtSdkMethodType::loadMsgWithKeywords = "loadMsgWithKeywords";
// 根据消息类型获取消息
const std::string ExtSdkMethodType::loadMsgWithMsgType = "loadMsgWithMsgType";
// 通过时间获取消息
const std::string ExtSdkMethodType::loadMsgWithTime = "loadMsgWithTime";

// EMChatRoomManager
const std::string ExtSdkMethodType::joinChatRoom = "joinChatRoom";
const std::string ExtSdkMethodType::leaveChatRoom = "leaveChatRoom";
const std::string ExtSdkMethodType::fetchPublicChatRoomsFromServer = "fetchPublicChatRoomsFromServer";
const std::string ExtSdkMethodType::fetchChatRoomInfoFromServer = "fetchChatRoomInfoFromServer";
const std::string ExtSdkMethodType::getChatRoom = "getChatRoom";
const std::string ExtSdkMethodType::getAllChatRooms = "getAllChatRooms";
const std::string ExtSdkMethodType::createChatRoom = "createChatRoom";
const std::string ExtSdkMethodType::destroyChatRoom = "destroyChatRoom";
const std::string ExtSdkMethodType::changeChatRoomSubject = "changeChatRoomSubject";
const std::string ExtSdkMethodType::changeChatRoomDescription = "changeChatRoomDescription";
const std::string ExtSdkMethodType::fetchChatRoomMembers = "fetchChatRoomMembers";
const std::string ExtSdkMethodType::muteChatRoomMembers = "muteChatRoomMembers";
const std::string ExtSdkMethodType::unMuteChatRoomMembers = "unMuteChatRoomMembers";
const std::string ExtSdkMethodType::changeChatRoomOwner = "changeChatRoomOwner";
const std::string ExtSdkMethodType::addChatRoomAdmin = "addChatRoomAdmin";
const std::string ExtSdkMethodType::removeChatRoomAdmin = "removeChatRoomAdmin";
const std::string ExtSdkMethodType::fetchChatRoomMuteList = "fetchChatRoomMuteList";
const std::string ExtSdkMethodType::removeChatRoomMembers = "removeChatRoomMembers";
const std::string ExtSdkMethodType::blockChatRoomMembers = "blockChatRoomMembers";
const std::string ExtSdkMethodType::unBlockChatRoomMembers = "unBlockChatRoomMembers";
const std::string ExtSdkMethodType::fetchChatRoomBlockList = "fetchChatRoomBlockList";
const std::string ExtSdkMethodType::updateChatRoomAnnouncement = "updateChatRoomAnnouncement";
const std::string ExtSdkMethodType::fetchChatRoomAnnouncement = "fetchChatRoomAnnouncement";

const std::string ExtSdkMethodType::addMembersToChatRoomWhiteList = "addMembersToChatRoomWhiteList";
const std::string ExtSdkMethodType::removeMembersFromChatRoomWhiteList = "removeMembersFromChatRoomWhiteList";
const std::string ExtSdkMethodType::fetchChatRoomWhiteListFromServer = "fetchChatRoomWhiteListFromServer";
const std::string ExtSdkMethodType::isMemberInChatRoomWhiteListFromServer = "isMemberInChatRoomWhiteListFromServer";

const std::string ExtSdkMethodType::muteAllChatRoomMembers = "muteAllChatRoomMembers";
const std::string ExtSdkMethodType::unMuteAllChatRoomMembers = "unMuteAllChatRoomMembers";


// EMChatRoomManagerListener
const std::string ExtSdkMethodType::chatRoomChange = "onChatRoomChanged";

/// EMGroupManager
const std::string ExtSdkMethodType::getGroupWithId = "getGroupWithId";
const std::string ExtSdkMethodType::getJoinedGroups = "getJoinedGroups";
const std::string ExtSdkMethodType::getGroupsWithoutPushNotification = "getGroupsWithoutPushNotification";
const std::string ExtSdkMethodType::getJoinedGroupsFromServer = "getJoinedGroupsFromServer";
const std::string ExtSdkMethodType::getPublicGroupsFromServer = "getPublicGroupsFromServer";
const std::string ExtSdkMethodType::createGroup = "createGroup";
const std::string ExtSdkMethodType::getGroupSpecificationFromServer = "getGroupSpecificationFromServer";
const std::string ExtSdkMethodType::getGroupMemberListFromServer = "getGroupMemberListFromServer";
const std::string ExtSdkMethodType::getGroupBlockListFromServer = "getGroupBlockListFromServer";
const std::string ExtSdkMethodType::getGroupMuteListFromServer = "getGroupMuteListFromServer";
const std::string ExtSdkMethodType::getGroupWhiteListFromServer = "getGroupWhiteListFromServer";
const std::string ExtSdkMethodType::isMemberInWhiteListFromServer = "isMemberInWhiteListFromServer";
const std::string ExtSdkMethodType::getGroupFileListFromServer = "getGroupFileListFromServer";
const std::string ExtSdkMethodType::getGroupAnnouncementFromServer = "getGroupAnnouncementFromServer";
const std::string ExtSdkMethodType::addMembers = "addMembers";
const std::string ExtSdkMethodType::inviterUser = "inviterUser";
const std::string ExtSdkMethodType::removeMembers = "removeMembers";
const std::string ExtSdkMethodType::blockMembers = "blockMembers";
const std::string ExtSdkMethodType::unblockMembers = "unblockMembers";
const std::string ExtSdkMethodType::updateGroupSubject = "updateGroupSubject";
const std::string ExtSdkMethodType::updateDescription = "updateDescription";
const std::string ExtSdkMethodType::leaveGroup = "leaveGroup";
const std::string ExtSdkMethodType::destroyGroup = "destroyGroup";
const std::string ExtSdkMethodType::blockGroup = "blockGroup";
const std::string ExtSdkMethodType::unblockGroup = "unblockGroup";
const std::string ExtSdkMethodType::updateGroupOwner = "updateGroupOwner";
const std::string ExtSdkMethodType::addAdmin = "addAdmin";
const std::string ExtSdkMethodType::removeAdmin = "removeAdmin";
const std::string ExtSdkMethodType::muteMembers = "muteMembers";
const std::string ExtSdkMethodType::unMuteMembers = "unMuteMembers";
const std::string ExtSdkMethodType::muteAllMembers = "muteAllMembers";
const std::string ExtSdkMethodType::unMuteAllMembers = "unMuteAllMembers";
const std::string ExtSdkMethodType::addWhiteList = "addWhiteList";
const std::string ExtSdkMethodType::removeWhiteList = "removeWhiteList";
const std::string ExtSdkMethodType::uploadGroupSharedFile = "uploadGroupSharedFile";
const std::string ExtSdkMethodType::downloadGroupSharedFile = "downloadGroupSharedFile";
const std::string ExtSdkMethodType::removeGroupSharedFile = "removeGroupSharedFile";
const std::string ExtSdkMethodType::updateGroupAnnouncement = "updateGroupAnnouncement";
const std::string ExtSdkMethodType::updateGroupExt = "updateGroupExt";
const std::string ExtSdkMethodType::joinPublicGroup = "joinPublicGroup";
const std::string ExtSdkMethodType::requestToJoinPublicGroup = "requestToJoinPublicGroup";
const std::string ExtSdkMethodType::acceptJoinApplication = "acceptJoinApplication";
const std::string ExtSdkMethodType::declineJoinApplication = "declineJoinApplication";
const std::string ExtSdkMethodType::acceptInvitationFromGroup = "acceptInvitationFromGroup";
const std::string ExtSdkMethodType::declineInvitationFromGroup = "declineInvitationFromGroup";
const std::string ExtSdkMethodType::ignoreGroupPush = "ignoreGroupPush";

/// EMGroupManagerListener
const std::string ExtSdkMethodType::onGroupChanged = "onGroupChanged";

/// EMPushManager
const std::string ExtSdkMethodType::getImPushConfig = "getImPushConfig";
const std::string ExtSdkMethodType::getImPushConfigFromServer = "getImPushConfigFromServer";
const std::string ExtSdkMethodType::updatePushNickname = "updatePushNickname";
const std::string ExtSdkMethodType::updateHMSPushToken = "updateHMSPushToken";
const std::string ExtSdkMethodType::updateFCMPushToken = "updateFCMPushToken";

/// ImPushConfig
const std::string ExtSdkMethodType::imPushNoDisturb = "imPushNoDisturb";
const std::string ExtSdkMethodType::updateImPushStyle = "updateImPushStyle";
const std::string ExtSdkMethodType::updateGroupPushService = "updateGroupPushService";
const std::string ExtSdkMethodType::getNoDisturbGroups = "getNoDisturbGroups";


/// EMUserInfoManager
const std::string ExtSdkMethodType::updateOwnUserInfo = "updateOwnUserInfo";
const std::string ExtSdkMethodType::updateOwnUserInfoWithType = "updateOwnUserInfoWithType";
const std::string ExtSdkMethodType::fetchUserInfoById = "fetchUserInfoById";
const std::string ExtSdkMethodType::fetchUserInfoByIdWithType = "fetchUserInfoByIdWithType";

EXT_SDK_NAMESPACE_END