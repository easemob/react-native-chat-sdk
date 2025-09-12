package com.easemob.ext_sdk.dispatch;

import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.easemob.ext_sdk.common.ExtSdkApi;
import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.easemob.ext_sdk.common.ExtSdkListener;
import com.easemob.ext_sdk.common.ExtSdkMethodType;
import com.easemob.ext_sdk.common.ExtSdkTypeUtil;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkDispatch implements ExtSdkApi {

    private static class SingleHolder {
        static ExtSdkDispatch instance = new ExtSdkDispatch();
    }

    public static ExtSdkDispatch getInstance() { return ExtSdkDispatch.SingleHolder.instance; }

    @Override
    public void init(@NonNull Object config) {}

    @Override
    public void unInit(@Nullable Object params) {}

    @Override
    public void addListener(@NonNull ExtSdkListener listener) {
        this.listener = listener;
    }

    @Override
    public void delListener(@NonNull ExtSdkListener listener) {}

    @Override
    public void callSdkApi(@NonNull String methodType, @Nullable Object params, @NonNull ExtSdkCallback callback) {
        Log.d(TAG, "callSdkApi"
                       + ": " + methodType + ": " + (params != null ? params : ""));

        JSONObject jsonParams = null;

        try {
            if (ExtSdkTypeUtil.currentArchitectureType() == ExtSdkTypeUtil.ExtSdkArchitectureTypeValue.ARCHITECTURE_FLUTTER) {
                jsonParams = (JSONObject)params;
            } else if (ExtSdkTypeUtil.currentArchitectureType() == ExtSdkTypeUtil.ExtSdkArchitectureTypeValue.ARCHITECTURE_UNITY) {

            } else if (ExtSdkTypeUtil.currentArchitectureType() == ExtSdkTypeUtil.ExtSdkArchitectureTypeValue.ARCHITECTURE_RN) {
                if (params instanceof Map) {
                    jsonParams = new JSONObject((Map)params);
                }
            } else {
                throw new Exception("not this type: " + ExtSdkTypeUtil.currentArchitectureType());
            }
        } catch (Exception e) {
            ExtSdkWrapper.onError(callback, new JSONException(e.getMessage()), null);
            return;
        }

        try {
            switch (methodType) {
            /// EMClient methods
            case ExtSdkMethodType.init:
                ExtSdkClientWrapper.getInstance().init(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.createAccount:
                ExtSdkClientWrapper.getInstance().createAccount(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.login:
                ExtSdkClientWrapper.getInstance().login(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.logout:
                ExtSdkClientWrapper.getInstance().logout(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.changeAppKey:
                ExtSdkClientWrapper.getInstance().changeAppKey(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.isLoggedInBefore:
                ExtSdkClientWrapper.getInstance().isLoggedInBefore(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateCurrentUserNick:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.uploadLog:
                ExtSdkClientWrapper.getInstance().uploadLog(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.compressLogs:
                ExtSdkClientWrapper.getInstance().compressLogs(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.kickDevice:
                ExtSdkClientWrapper.getInstance().kickDevice(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.kickAllDevices:
                ExtSdkClientWrapper.getInstance().kickAllDevices(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getLoggedInDevicesFromServer:
                ExtSdkClientWrapper.getInstance().getLoggedInDevicesFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getCurrentUser:
                ExtSdkClientWrapper.getInstance().getCurrentUser(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getToken:
                ExtSdkClientWrapper.getInstance().getToken(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.loginWithAgoraToken:
                ExtSdkClientWrapper.getInstance().loginWithAgoraToken(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.isConnected:
                ExtSdkClientWrapper.getInstance().isConnected(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.renewToken:
                ExtSdkClientWrapper.getInstance().renewToken(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updatePushConfig:
                ExtSdkClientWrapper.getInstance().updatePushConfig(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.onConnected:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onDisconnected:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMultiDeviceEvent:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onSendDataToFlutter:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onTokenDidExpire:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onTokenWillExpire:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onUserDidLoginFromOtherDevice:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onUserDidRemoveFromServer:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onUserDidForbidByServer:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onUserDidChangePassword:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onUserDidLoginTooManyDevice:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onUserKickedByOtherDevice:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onUserAuthenticationFailed:
                callback.fail(1, "no implement: " + methodType);
                break;

                /// EMContactManager methods
            case ExtSdkMethodType.addContact:
                ExtSdkContactManagerWrapper.getInstance().addContact(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.deleteContact:
                ExtSdkContactManagerWrapper.getInstance().deleteContact(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getAllContactsFromServer:
                ExtSdkContactManagerWrapper.getInstance().getAllContactsFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getAllContactsFromDB:
                ExtSdkContactManagerWrapper.getInstance().getAllContactsFromDB(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.addUserToBlockList:
                ExtSdkContactManagerWrapper.getInstance().addUserToBlockList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeUserFromBlockList:
                ExtSdkContactManagerWrapper.getInstance().removeUserFromBlockList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getBlockListFromServer:
                ExtSdkContactManagerWrapper.getInstance().getBlockListFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getBlockListFromDB:
                ExtSdkContactManagerWrapper.getInstance().getBlockListFromDB(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.acceptInvitation:
                ExtSdkContactManagerWrapper.getInstance().acceptInvitation(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.declineInvitation:
                ExtSdkContactManagerWrapper.getInstance().declineInvitation(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getSelfIdsOnOtherPlatform:
                ExtSdkContactManagerWrapper.getInstance().getSelfIdsOnOtherPlatform(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.onContactChanged:
                callback.fail(1, "no implement: " + methodType);
                break;

                /// EMChatManager methods
            case ExtSdkMethodType.sendMessage:
                ExtSdkChatManagerWrapper.getInstance().sendMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.resendMessage:
                ExtSdkChatManagerWrapper.getInstance().resendMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.ackMessageRead:
                ExtSdkChatManagerWrapper.getInstance().ackMessageRead(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.ackGroupMessageRead:
                ExtSdkChatManagerWrapper.getInstance().ackGroupMessageRead(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.ackConversationRead:
                ExtSdkChatManagerWrapper.getInstance().ackConversationRead(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.recallMessage:
                ExtSdkChatManagerWrapper.getInstance().recallMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getConversation:
                ExtSdkChatManagerWrapper.getInstance().getConversation(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.markAllChatMsgAsRead:
                ExtSdkChatManagerWrapper.getInstance().markAllChatMsgAsRead(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getUnreadMessageCount:
                ExtSdkChatManagerWrapper.getInstance().getUnreadMessageCount(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateChatMessage:
                ExtSdkChatManagerWrapper.getInstance().updateChatMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.downloadAttachmentInCombine:
                ExtSdkChatManagerWrapper.getInstance().downloadAttachmentInCombine(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.downloadThumbnailInCombine:
                ExtSdkChatManagerWrapper.getInstance().downloadThumbnailInCombine(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.downloadAttachment:
                ExtSdkChatManagerWrapper.getInstance().downloadAttachment(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.downloadThumbnail:
                ExtSdkChatManagerWrapper.getInstance().downloadThumbnail(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.importMessages:
                ExtSdkChatManagerWrapper.getInstance().importMessages(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.loadAllConversations:
                ExtSdkChatManagerWrapper.getInstance().loadAllConversations(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getConversationsFromServer:
                ExtSdkChatManagerWrapper.getInstance().getConversationsFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.deleteConversation:
                ExtSdkChatManagerWrapper.getInstance().deleteConversation(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchHistoryMessages:
                ExtSdkChatManagerWrapper.getInstance().fetchHistoryMessages(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchHistoryMessagesByOptions:
                ExtSdkChatManagerWrapper.getInstance().fetchHistoryMessagesByOptions(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.searchChatMsgFromDB:
                ExtSdkChatManagerWrapper.getInstance().searchChatMsgFromDB(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getMessage:
                ExtSdkChatManagerWrapper.getInstance().getMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.asyncFetchGroupAcks:
                ExtSdkChatManagerWrapper.getInstance().asyncFetchGroupAcks(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.deleteRemoteConversation:
                ExtSdkChatManagerWrapper.getInstance().deleteRemoteConversation(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.deleteMessagesBeforeTimestamp:
                ExtSdkChatManagerWrapper.getInstance().deleteMessagesBeforeTimestamp(jsonParams, methodType, callback);
                break;

                /// EMChatManager listener
            case ExtSdkMethodType.onMessagesReceived:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onCmdMessagesReceived:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMessagesRead:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onGroupMessageRead:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMessagesDelivered:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMessagesRecalled:
                callback.fail(1, "no implement: " + methodType);
                break;

            case ExtSdkMethodType.onConversationUpdate:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onConversationHasRead:
                callback.fail(1, "no implement: " + methodType);
                break;

                /// EMMessage listener
            case ExtSdkMethodType.onMessageProgressUpdate:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMessageError:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMessageSuccess:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMessageReadAck:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMessageDeliveryAck:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMessageStatusChanged:
                callback.fail(1, "no implement: " + methodType);
                break;

                /// EMConversation
            case ExtSdkMethodType.getUnreadMsgCount:
                ExtSdkConversationWrapper.getInstance().getUnreadMsgCount(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getMsgCount:
                ExtSdkConversationWrapper.getInstance().getMsgCount(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.markAllMessagesAsRead:
                ExtSdkConversationWrapper.getInstance().markAllMessagesAsRead(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.markMessageAsRead:
                ExtSdkConversationWrapper.getInstance().markMessageAsRead(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.syncConversationExt:
                ExtSdkConversationWrapper.getInstance().syncConversationExt(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.syncConversationName:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.removeMessage:
                ExtSdkConversationWrapper.getInstance().removeMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getLatestMessage:
                ExtSdkConversationWrapper.getInstance().getLatestMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getLatestMessageFromOthers:
                ExtSdkConversationWrapper.getInstance().getLatestMessageFromOthers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.clearAllMessages:
                ExtSdkConversationWrapper.getInstance().clearAllMessages(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.deleteMessagesWithTs:
                ExtSdkConversationWrapper.getInstance().deleteMessagesWithTimestamp(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.insertMessage:
                ExtSdkConversationWrapper.getInstance().insertMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.appendMessage:
                ExtSdkConversationWrapper.getInstance().appendMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateConversationMessage:
                ExtSdkConversationWrapper.getInstance().updateConversationMessage(jsonParams, methodType, callback);
                break;

                // 根据消息id获取消息
            case ExtSdkMethodType.loadMsgWithId:
                ExtSdkConversationWrapper.getInstance().loadMsgWithId(jsonParams, methodType, callback);
                break;
                // 根据起始消息id获取消息
            case ExtSdkMethodType.loadMsgWithStartId:
                ExtSdkConversationWrapper.getInstance().loadMsgWithStartId(jsonParams, methodType, callback);
                break;
                // 根据关键字获取消息
            case ExtSdkMethodType.loadMsgWithKeywords:
                ExtSdkConversationWrapper.getInstance().loadMsgWithKeywords(jsonParams, methodType, callback);
                break;
                // 根据消息类型获取消息
            case ExtSdkMethodType.loadMsgWithMsgType:
                ExtSdkConversationWrapper.getInstance().loadMsgWithMsgType(jsonParams, methodType, callback);
                break;
                // 通过时间获取消息
            case ExtSdkMethodType.loadMsgWithTime:
                ExtSdkConversationWrapper.getInstance().loadMsgWithTime(jsonParams, methodType, callback);
                break;

                // EMChatRoomManager
            case ExtSdkMethodType.joinChatRoom:
                ExtSdkChatRoomManagerWrapper.getInstance().joinChatRoom(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.leaveChatRoom:
                ExtSdkChatRoomManagerWrapper.getInstance().leaveChatRoom(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchPublicChatRoomsFromServer:
                ExtSdkChatRoomManagerWrapper.getInstance().fetchPublicChatRoomsFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchChatRoomInfoFromServer:
                ExtSdkChatRoomManagerWrapper.getInstance().fetchChatRoomInfoFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getChatRoom:
                ExtSdkChatRoomManagerWrapper.getInstance().getChatRoom(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getAllChatRooms:
                ExtSdkChatRoomManagerWrapper.getInstance().getAllChatRooms(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.createChatRoom:
                ExtSdkChatRoomManagerWrapper.getInstance().createChatRoom(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.destroyChatRoom:
                ExtSdkChatRoomManagerWrapper.getInstance().destroyChatRoom(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.changeChatRoomSubject:
                ExtSdkChatRoomManagerWrapper.getInstance().changeChatRoomSubject(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.changeChatRoomDescription:
                ExtSdkChatRoomManagerWrapper.getInstance().changeChatRoomDescription(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchChatRoomMembers:
                ExtSdkChatRoomManagerWrapper.getInstance().fetchChatRoomMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.muteChatRoomMembers:
                ExtSdkChatRoomManagerWrapper.getInstance().muteChatRoomMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.unMuteChatRoomMembers:
                ExtSdkChatRoomManagerWrapper.getInstance().unMuteChatRoomMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.changeChatRoomOwner:
                ExtSdkChatRoomManagerWrapper.getInstance().changeChatRoomOwner(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.addChatRoomAdmin:
                ExtSdkChatRoomManagerWrapper.getInstance().addChatRoomAdmin(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeChatRoomAdmin:
                ExtSdkChatRoomManagerWrapper.getInstance().removeChatRoomAdmin(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchChatRoomMuteList:
                ExtSdkChatRoomManagerWrapper.getInstance().fetchChatRoomMuteList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeChatRoomMembers:
                ExtSdkChatRoomManagerWrapper.getInstance().removeChatRoomMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.blockChatRoomMembers:
                ExtSdkChatRoomManagerWrapper.getInstance().blockChatRoomMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.unBlockChatRoomMembers:
                ExtSdkChatRoomManagerWrapper.getInstance().unBlockChatRoomMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchChatRoomBlockList:
                ExtSdkChatRoomManagerWrapper.getInstance().fetchChatRoomBlockList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateChatRoomAnnouncement:
                ExtSdkChatRoomManagerWrapper.getInstance().updateChatRoomAnnouncement(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchChatRoomAnnouncement:
                ExtSdkChatRoomManagerWrapper.getInstance().fetchChatRoomAnnouncement(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.addMembersToChatRoomWhiteList:
                ExtSdkChatRoomManagerWrapper.getInstance().addMembersToChatRoomWhiteList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeMembersFromChatRoomWhiteList:
                ExtSdkChatRoomManagerWrapper.getInstance().removeMembersFromChatRoomWhiteList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchChatRoomWhiteListFromServer:
                ExtSdkChatRoomManagerWrapper.getInstance().fetchChatRoomWhiteListFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.isMemberInChatRoomWhiteListFromServer:
                ExtSdkChatRoomManagerWrapper.getInstance().isMemberInChatRoomWhiteListFromServer(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.muteAllChatRoomMembers:
                ExtSdkChatRoomManagerWrapper.getInstance().muteAllChatRoomMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.unMuteAllChatRoomMembers:
                ExtSdkChatRoomManagerWrapper.getInstance().unMuteAllChatRoomMembers(jsonParams, methodType, callback);
                break;

                // EMChatRoomManagerListener
            case ExtSdkMethodType.chatRoomChange:
                callback.fail(1, "no implement: " + methodType);
                break;

                /// EMGroupManager
            case ExtSdkMethodType.getGroupWithId:
                ExtSdkGroupManagerWrapper.getInstance().getGroupWithId(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getJoinedGroups:
                ExtSdkGroupManagerWrapper.getInstance().getJoinedGroups(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getGroupsWithoutPushNotification:
                ExtSdkGroupManagerWrapper.getInstance().getGroupsWithoutPushNotification(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getJoinedGroupsFromServer:
                ExtSdkGroupManagerWrapper.getInstance().getJoinedGroupsFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getPublicGroupsFromServer:
                ExtSdkGroupManagerWrapper.getInstance().getPublicGroupsFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.createGroup:
                ExtSdkGroupManagerWrapper.getInstance().createGroup(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getGroupSpecificationFromServer:
                ExtSdkGroupManagerWrapper.getInstance().getGroupSpecificationFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getGroupMemberListFromServer:
                ExtSdkGroupManagerWrapper.getInstance().getGroupMemberListFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getGroupBlockListFromServer:
                ExtSdkGroupManagerWrapper.getInstance().getGroupBlockListFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getGroupMuteListFromServer:
                ExtSdkGroupManagerWrapper.getInstance().getGroupMuteListFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getGroupWhiteListFromServer:
                ExtSdkGroupManagerWrapper.getInstance().getGroupWhiteListFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.isMemberInWhiteListFromServer:
                ExtSdkGroupManagerWrapper.getInstance().isMemberInWhiteListFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getGroupFileListFromServer:
                ExtSdkGroupManagerWrapper.getInstance().getGroupFileListFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getGroupAnnouncementFromServer:
                ExtSdkGroupManagerWrapper.getInstance().getGroupAnnouncementFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.addMembers:
                ExtSdkGroupManagerWrapper.getInstance().addMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.inviterUser:
                ExtSdkGroupManagerWrapper.getInstance().inviterUser(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeMembers:
                ExtSdkGroupManagerWrapper.getInstance().removeMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.blockMembers:
                ExtSdkGroupManagerWrapper.getInstance().blockMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.unblockMembers:
                ExtSdkGroupManagerWrapper.getInstance().unblockMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateGroupSubject:
                ExtSdkGroupManagerWrapper.getInstance().updateGroupSubject(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateDescription:
                ExtSdkGroupManagerWrapper.getInstance().updateDescription(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.leaveGroup:
                ExtSdkGroupManagerWrapper.getInstance().leaveGroup(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.destroyGroup:
                ExtSdkGroupManagerWrapper.getInstance().destroyGroup(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.blockGroup:
                ExtSdkGroupManagerWrapper.getInstance().blockGroup(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.unblockGroup:
                ExtSdkGroupManagerWrapper.getInstance().unblockGroup(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateGroupOwner:
                ExtSdkGroupManagerWrapper.getInstance().updateGroupOwner(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.addAdmin:
                ExtSdkGroupManagerWrapper.getInstance().addAdmin(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeAdmin:
                ExtSdkGroupManagerWrapper.getInstance().removeAdmin(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.muteMembers:
                ExtSdkGroupManagerWrapper.getInstance().muteMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.unMuteMembers:
                ExtSdkGroupManagerWrapper.getInstance().unMuteMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.muteAllMembers:
                ExtSdkGroupManagerWrapper.getInstance().muteAllMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.unMuteAllMembers:
                ExtSdkGroupManagerWrapper.getInstance().unMuteAllMembers(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.addWhiteList:
                ExtSdkGroupManagerWrapper.getInstance().addWhiteList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeWhiteList:
                ExtSdkGroupManagerWrapper.getInstance().removeWhiteList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.uploadGroupSharedFile:
                ExtSdkGroupManagerWrapper.getInstance().uploadGroupSharedFile(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.downloadGroupSharedFile:
                ExtSdkGroupManagerWrapper.getInstance().downloadGroupSharedFile(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeGroupSharedFile:
                ExtSdkGroupManagerWrapper.getInstance().removeGroupSharedFile(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateGroupAnnouncement:
                ExtSdkGroupManagerWrapper.getInstance().updateGroupAnnouncement(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateGroupExt:
                ExtSdkGroupManagerWrapper.getInstance().updateGroupExt(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.joinPublicGroup:
                ExtSdkGroupManagerWrapper.getInstance().joinPublicGroup(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.requestToJoinPublicGroup:
                ExtSdkGroupManagerWrapper.getInstance().requestToJoinPublicGroup(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.acceptJoinApplication:
                ExtSdkGroupManagerWrapper.getInstance().acceptJoinApplication(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.declineJoinApplication:
                ExtSdkGroupManagerWrapper.getInstance().declineJoinApplication(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.acceptInvitationFromGroup:
                ExtSdkGroupManagerWrapper.getInstance().acceptInvitationFromGroup(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.declineInvitationFromGroup:
                ExtSdkGroupManagerWrapper.getInstance().declineInvitationFromGroup(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.setMemberAttributesFromGroup:
                ExtSdkGroupManagerWrapper.getInstance().setMemberAttribute(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchMemberAttributesFromGroup:
                ExtSdkGroupManagerWrapper.getInstance().fetchMemberAttributes(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchMembersAttributesFromGroup:
                ExtSdkGroupManagerWrapper.getInstance().fetchMembersAttributes(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.ignoreGroupPush:
                callback.fail(1, "no implement: " + methodType);
                break;

                /// EMGroupManagerListener
            case ExtSdkMethodType.onGroupChanged:
                callback.fail(1, "no implement: " + methodType);
                break;

                /// EMPushManager
            case ExtSdkMethodType.getImPushConfig:
                ExtSdkPushManagerWrapper.getInstance().getImPushConfig(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getImPushConfigFromServer:
                ExtSdkPushManagerWrapper.getInstance().getImPushConfigFromServer(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updatePushNickname:
                ExtSdkPushManagerWrapper.getInstance().updatePushNickname(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateHMSPushToken:
                ExtSdkPushManagerWrapper.getInstance().updateHMSPushToken(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateFCMPushToken:
                ExtSdkPushManagerWrapper.getInstance().updateFCMPushToken(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.enableOfflinePush:
                ExtSdkPushManagerWrapper.getInstance().enableOfflinePush(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.disableOfflinePush:
                ExtSdkPushManagerWrapper.getInstance().disableOfflinePush(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getNoPushGroups:
                ExtSdkPushManagerWrapper.getInstance().getNoPushGroups(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.setNoDisturbUsers:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.getNoDisturbUsersFromServer:
                callback.fail(1, "no implement: " + methodType);
                break;

                /// ImPushConfig
            case ExtSdkMethodType.imPushNoDisturb:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.updateImPushStyle:
                ExtSdkPushManagerWrapper.getInstance().updateImPushStyle(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateGroupPushService:
                ExtSdkPushManagerWrapper.getInstance().updateGroupPushService(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getNoDisturbGroups:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.updateUserPushService:
                ExtSdkPushManagerWrapper.getInstance().updateUserPushService(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getNoPushUsers:
                ExtSdkPushManagerWrapper.getInstance().getNoPushUsers(jsonParams, methodType, callback);
                break;

                /// EMUserInfoManager
            case ExtSdkMethodType.updateOwnUserInfo:
                ExtSdkUserInfoManagerWrapper.getInstance().updateOwnUserInfo(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateOwnUserInfoWithType:
                ExtSdkUserInfoManagerWrapper.getInstance().updateOwnUserInfoWithType(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchUserInfoById:
                ExtSdkUserInfoManagerWrapper.getInstance().fetchUserInfoByUserId(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchUserInfoByIdWithType:
                ExtSdkUserInfoManagerWrapper.getInstance().fetchUserInfoByIdWithType(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.translateMessage:
                ExtSdkChatManagerWrapper.getInstance().translateMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchSupportedLanguages:
                ExtSdkChatManagerWrapper.getInstance().fetchSupportedLanguages(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.onPresenceStatusChanged:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.presenceWithDescription:
                ExtSdkPresenceManagerWrapper.getInstance().publishPresenceWithDescription(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.presenceSubscribe:
                ExtSdkPresenceManagerWrapper.getInstance().subscribe(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.presenceUnsubscribe:
                ExtSdkPresenceManagerWrapper.getInstance().unsubscribe(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchSubscribedMembersWithPageNum:
                ExtSdkPresenceManagerWrapper.getInstance().fetchSubscribedMembersWithPageNum(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchPresenceStatus:
                ExtSdkPresenceManagerWrapper.getInstance().fetchPresenceStatus(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.addReaction:
                ExtSdkChatManagerWrapper.getInstance().addReaction(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeReaction:
                ExtSdkChatManagerWrapper.getInstance().removeReaction(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchReactionList:
                ExtSdkChatManagerWrapper.getInstance().fetchReactionList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchReactionDetail:
                ExtSdkChatManagerWrapper.getInstance().fetchReactionDetail(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.reportMessage:
                ExtSdkChatManagerWrapper.getInstance().reportMessage(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.fetchConversationsFromServerWithPage:
                ExtSdkChatManagerWrapper.getInstance().fetchConversationsFromServerWithPage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeMessagesFromServerWithMsgIds:
                ExtSdkChatManagerWrapper.getInstance().removeMessagesFromServerWithMsgIds(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeMessagesFromServerWithTs:
                ExtSdkChatManagerWrapper.getInstance().removeMessagesFromServerWithTs(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.onReadAckForGroupMessageUpdated:
                callback.fail(1, "no implement: " + methodType);
                break;
            case ExtSdkMethodType.onMessageReactionDidChange:
                callback.fail(1, "no implement: " + methodType);
                break;

            case ExtSdkMethodType.getReactionList:
                ExtSdkChatMessageWrapper.getInstance().getReactionList(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.groupAckCount:
                ExtSdkChatMessageWrapper.getInstance().groupAckCount(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.fetchChatThreadDetail:
                ExtSdkChatThreadManagerWrapper.getInstance().fetchChatThreadDetail(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchJoinedChatThreads:
                ExtSdkChatThreadManagerWrapper.getInstance().fetchJoinedChatThreads(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchChatThreadsWithParentId:
                ExtSdkChatThreadManagerWrapper.getInstance().fetchChatThreadsWithParentId(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchJoinedChatThreadsWithParentId:
                ExtSdkChatThreadManagerWrapper.getInstance().fetchJoinedChatThreadsWithParentId(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchChatThreadMember:
                ExtSdkChatThreadManagerWrapper.getInstance().fetchChatThreadMember(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchLastMessageWithChatThreads:
                ExtSdkChatThreadManagerWrapper.getInstance().fetchLastMessageWithChatThreads(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeMemberFromChatThread:
                ExtSdkChatThreadManagerWrapper.getInstance().removeMemberFromChatThread(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.updateChatThreadSubject:
                ExtSdkChatThreadManagerWrapper.getInstance().updateChatThreadSubject(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.createChatThread:
                ExtSdkChatThreadManagerWrapper.getInstance().createChatThread(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.joinChatThread:
                ExtSdkChatThreadManagerWrapper.getInstance().joinChatThread(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.leaveChatThread:
                ExtSdkChatThreadManagerWrapper.getInstance().leaveChatThread(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.destroyChatThread:
                ExtSdkChatThreadManagerWrapper.getInstance().destroyChatThread(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getMessageThread:
                ExtSdkChatThreadManagerWrapper.getInstance().getMessageThread(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getThreadConversation:
                ExtSdkChatThreadManagerWrapper.getInstance().getThreadConversation(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.reportPushAction:
                ExtSdkPushManagerWrapper.getInstance().reportPushAction(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.setConversationSilentMode:
                ExtSdkPushManagerWrapper.getInstance().setConversationSilentMode(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.removeConversationSilentMode:
                ExtSdkPushManagerWrapper.getInstance().removeConversationSilentMode(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchConversationSilentMode:
                ExtSdkPushManagerWrapper.getInstance().fetchConversationSilentMode(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.setSilentModeForAll:
                ExtSdkPushManagerWrapper.getInstance().setSilentModeForAll(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchSilentModeForAll:
                ExtSdkPushManagerWrapper.getInstance().fetchSilentModeForAll(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchSilentModeForConversations:
                ExtSdkPushManagerWrapper.getInstance().fetchSilentModeForConversations(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.setPreferredNotificationLanguage:
                ExtSdkPushManagerWrapper.getInstance().setPreferredNotificationLanguage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchPreferredNotificationLanguage:
                ExtSdkPushManagerWrapper.getInstance().fetchPreferredNotificationLanguage(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.MJfetchChatRoomAttributes:
                ExtSdkChatRoomManagerWrapper.getInstance().fetchChatRoomAttributes(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.MJfetchChatRoomAllAttributes:
                ExtSdkChatRoomManagerWrapper.getInstance().fetchChatRoomAllAttributes(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.MJsetChatRoomAttributes:
                ExtSdkChatRoomManagerWrapper.getInstance().setChatRoomAttributes(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.MJremoveChatRoomAttributes:
                ExtSdkChatRoomManagerWrapper.getInstance().removeChatRoomAttributes(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getConversationsFromServerWithCursor:
                ExtSdkChatManagerWrapper.getInstance().getConversationsFromServerWithCursor(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getPinnedConversationsFromServerWithCursor:
                ExtSdkChatManagerWrapper.getInstance().getPinnedConversationsFromServerWithCursor(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.pinConversation:
                ExtSdkChatManagerWrapper.getInstance().pinConversation(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.modifyMessage:
                ExtSdkChatManagerWrapper.getInstance().modifyMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.downloadAndParseCombineMessage:
                ExtSdkChatManagerWrapper.getInstance().downloadAndParseCombineMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.setPushTemplate:
                ExtSdkPushManagerWrapper.getInstance().setPushTemplate(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getPushTemplate:
                ExtSdkPushManagerWrapper.getInstance().getPushTemplate(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.fetchJoinedGroupCount:
                ExtSdkGroupManagerWrapper.getInstance().fetchJoinedGroupCount(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getAllContacts:
                ExtSdkContactManagerWrapper.getInstance().getAllContacts(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.setContactRemark:
                ExtSdkContactManagerWrapper.getInstance().setContactRemark(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.getContact:
                ExtSdkContactManagerWrapper.getInstance().getContact(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchAllContacts:
                ExtSdkContactManagerWrapper.getInstance().fetchAllContacts(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchContacts:
                ExtSdkContactManagerWrapper.getInstance().fetchContacts(jsonParams, methodType, callback);
                break;

            case ExtSdkMethodType.getPinInfo:
                ExtSdkChatMessageWrapper.getInstance().getPinInfo(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.pinnedMessages:
                ExtSdkConversationWrapper.getInstance().pinnedMessages(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.addRemoteAndLocalConversationsMark:
                ExtSdkChatManagerWrapper.getInstance().addRemoteAndLocalConversationsMark(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.deleteRemoteAndLocalConversationsMark:
                ExtSdkChatManagerWrapper.getInstance().deleteRemoteAndLocalConversationsMark(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchConversationsByOptions:
                ExtSdkChatManagerWrapper.getInstance().fetchConversationsByOptions(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.deleteAllMessageAndConversation:
                ExtSdkChatManagerWrapper.getInstance().deleteAllMessageAndConversation(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.pinMessage:
                ExtSdkChatManagerWrapper.getInstance().pinMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.unpinMessage:
                ExtSdkChatManagerWrapper.getInstance().unpinMessage(jsonParams, methodType, callback);
                break;
            case ExtSdkMethodType.fetchPinnedMessages:
                ExtSdkChatManagerWrapper.getInstance().fetchPinnedMessages(jsonParams, methodType, callback);
                break;

            default:
                callback.fail(1, "no implement: " + methodType);
                break;
            }
        } catch (JSONException e) {
            ExtSdkWrapper.onError(callback, e, null);
        }
    }

    public void onReceive(@NonNull String methodType, @Nullable Object data) {
        Log.d(TAG, "onReceive"
                       + ": " + methodType + ": " + (data != null ? data : ""));
        listener.onReceive(methodType, data);
    }

    private ExtSdkListener listener;
    private static final String TAG = "ExtSdkDispatch";
}
