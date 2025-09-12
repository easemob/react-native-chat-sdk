//
// Created by asterisk on 2022/3/3.
//

#ifndef ANDROID_EXTSDKMETHODTYPE_H
#define ANDROID_EXTSDKMETHODTYPE_H

#include <string>
#include "ExtSdkDefine.h"

EXT_SDK_NAMESPACE_BEGIN

class ExtSdkMethodType {
public:
    /// EMClient methods
    static const std::string init;
    static const std::string createAccount;
    static const std::string login;
    static const std::string logout;
    static const std::string changeAppKey;
    static const std::string isLoggedInBefore;
    static const std::string updateCurrentUserNick;
    static const std::string uploadLog;
    static const std::string compressLogs;
    static const std::string kickDevice;
    static const std::string kickAllDevices;
    static const std::string getLoggedInDevicesFromServer;
    static const std::string getCurrentUser;

    static const std::string onConnected;
    static const std::string onDisconnected;
    static const std::string onMultiDeviceEvent;
    static const std::string onSendDataToFlutter;

    /// EMContactManager methods
    static const std::string addContact;
    static const std::string deleteContact;
    static const std::string getAllContactsFromServer;
    static const std::string getAllContactsFromDB;
    static const std::string addUserToBlockList;
    static const std::string removeUserFromBlockList;
    static const std::string getBlockListFromServer;
    static const std::string getBlockListFromDB;
    static const std::string acceptInvitation;
    static const std::string declineInvitation;
    static const std::string getSelfIdsOnOtherPlatform;


    static const std::string onContactChanged;

    /// EMChatManager methods
    static const std::string sendMessage;
    static const std::string resendMessage;
    static const std::string ackMessageRead;
    static const std::string ackGroupMessageRead;
    static const std::string ackConversationRead;
    static const std::string recallMessage;
    static const std::string getConversation;
    static const std::string markAllChatMsgAsRead;
    static const std::string getUnreadMessageCount;
    static const std::string updateChatMessage;
    static const std::string downloadAttachment;
    static const std::string downloadThumbnail;
    static const std::string importMessages;
    static const std::string loadAllConversations;
    static const std::string getConversationsFromServer;
    static const std::string deleteConversation;
    static const std::string fetchHistoryMessages;
    static const std::string searchChatMsgFromDB;
    static const std::string getMessage;
    static const std::string asyncFetchGroupAcks;

    /// EMChatManager listener
    static const std::string onMessagesReceived;
    static const std::string onCmdMessagesReceived;
    static const std::string onMessagesRead;
    static const std::string onGroupMessageRead;
    static const std::string onMessagesDelivered;
    static const std::string onMessagesRecalled;

    static const std::string onConversationUpdate;
    static const std::string onConversationHasRead;

    /// EMMessage listener
    static const std::string onMessageProgressUpdate;
    static const std::string onMessageError;
    static const std::string onMessageSuccess;
    static const std::string onMessageReadAck;
    static const std::string onMessageDeliveryAck;
    static const std::string onMessageStatusChanged;

    /// EMConversation
    static const std::string getUnreadMsgCount;
    static const std::string markAllMessagesAsRead;
    static const std::string markMessageAsRead;
    static const std::string syncConversationExt;
    static const std::string syncConversationName;
    static const std::string removeMessage;
    static const std::string getLatestMessage;
    static const std::string getLatestMessageFromOthers;
    static const std::string clearAllMessages;
    static const std::string insertMessage;
    static const std::string appendMessage;
    static const std::string updateConversationMessage;

    // 根据消息id获取消息
    static const std::string loadMsgWithId;
    // 根据起始消息id获取消息
    static const std::string loadMsgWithStartId;
    // 根据关键字获取消息
    static const std::string loadMsgWithKeywords;
    // 根据消息类型获取消息
    static const std::string loadMsgWithMsgType;
    // 通过时间获取消息
    static const std::string loadMsgWithTime;

    // EMChatRoomManager
    static const std::string joinChatRoom;
    static const std::string leaveChatRoom;
    static const std::string fetchPublicChatRoomsFromServer;
    static const std::string fetchChatRoomInfoFromServer;
    static const std::string getChatRoom;
    static const std::string getAllChatRooms;
    static const std::string createChatRoom;
    static const std::string destroyChatRoom;
    static const std::string changeChatRoomSubject;
    static const std::string changeChatRoomDescription;
    static const std::string fetchChatRoomMembers;
    static const std::string muteChatRoomMembers;
    static const std::string unMuteChatRoomMembers;
    static const std::string changeChatRoomOwner;
    static const std::string addChatRoomAdmin;
    static const std::string removeChatRoomAdmin;
    static const std::string fetchChatRoomMuteList;
    static const std::string removeChatRoomMembers;
    static const std::string blockChatRoomMembers;
    static const std::string unBlockChatRoomMembers;
    static const std::string fetchChatRoomBlockList;
    static const std::string updateChatRoomAnnouncement;
    static const std::string fetchChatRoomAnnouncement;

    static const std::string addMembersToChatRoomWhiteList;
    static const std::string removeMembersFromChatRoomWhiteList;
    static const std::string fetchChatRoomWhiteListFromServer;
    static const std::string isMemberInChatRoomWhiteListFromServer;

    static const std::string muteAllChatRoomMembers;
    static const std::string unMuteAllChatRoomMembers;


    // EMChatRoomManagerListener
    static const std::string chatRoomChange;

    /// EMGroupManager
    static const std::string getGroupWithId;
    static const std::string getJoinedGroups;
    static const std::string getGroupsWithoutPushNotification;
    static const std::string getJoinedGroupsFromServer;
    static const std::string getPublicGroupsFromServer;
    static const std::string createGroup;
    static const std::string getGroupSpecificationFromServer;
    static const std::string getGroupMemberListFromServer;
    static const std::string getGroupBlockListFromServer;
    static const std::string getGroupMuteListFromServer;
    static const std::string getGroupWhiteListFromServer;
    static const std::string isMemberInWhiteListFromServer;
    static const std::string getGroupFileListFromServer;
    static const std::string getGroupAnnouncementFromServer;
    static const std::string addMembers;
    static const std::string inviterUser;
    static const std::string removeMembers;
    static const std::string blockMembers;
    static const std::string unblockMembers;
    static const std::string updateGroupSubject;
    static const std::string updateDescription;
    static const std::string leaveGroup;
    static const std::string destroyGroup;
    static const std::string blockGroup;
    static const std::string unblockGroup;
    static const std::string updateGroupOwner;
    static const std::string addAdmin;
    static const std::string removeAdmin;
    static const std::string muteMembers;
    static const std::string unMuteMembers;
    static const std::string muteAllMembers;
    static const std::string unMuteAllMembers;
    static const std::string addWhiteList;
    static const std::string removeWhiteList;
    static const std::string uploadGroupSharedFile;
    static const std::string downloadGroupSharedFile;
    static const std::string removeGroupSharedFile;
    static const std::string updateGroupAnnouncement;
    static const std::string updateGroupExt;
    static const std::string joinPublicGroup;
    static const std::string requestToJoinPublicGroup;
    static const std::string acceptJoinApplication;
    static const std::string declineJoinApplication;
    static const std::string acceptInvitationFromGroup;
    static const std::string declineInvitationFromGroup;
    static const std::string ignoreGroupPush;

    /// EMGroupManagerListener
    static const std::string onGroupChanged;

    /// EMPushManager
    static const std::string getImPushConfig;
    static const std::string getImPushConfigFromServer;
    static const std::string updatePushNickname;
    static const std::string updateHMSPushToken;
    static const std::string updateFCMPushToken;

    /// ImPushConfig
    static const std::string imPushNoDisturb;
    static const std::string updateImPushStyle;
    static const std::string updateGroupPushService;
    static const std::string getNoDisturbGroups;


    /// EMUserInfoManager
    static const std::string updateOwnUserInfo;
    static const std::string updateOwnUserInfoWithType;
    static const std::string fetchUserInfoById;
    static const std::string fetchUserInfoByIdWithType;
};

EXT_SDK_NAMESPACE_END

#endif //ANDROID_EXTSDKMETHODTYPE_H
