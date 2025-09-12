package com.easemob.ext_sdk.dispatch;

import android.content.Context;
import android.net.Uri;
import com.hyphenate.chat.EMChatRoom;
import com.hyphenate.chat.EMChatThread;
import com.hyphenate.chat.EMChatThreadEvent;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMCmdMessageBody;
import com.hyphenate.chat.EMCombineMessageBody;
import com.hyphenate.chat.EMContact;
import com.hyphenate.chat.EMConversation;
import com.hyphenate.chat.EMConversationFilter;
import com.hyphenate.chat.EMCursorResult;
import com.hyphenate.chat.EMCustomMessageBody;
import com.hyphenate.chat.EMDeviceInfo;
import com.hyphenate.chat.EMFetchMessageOption;
import com.hyphenate.chat.EMFileMessageBody;
import com.hyphenate.chat.EMGroup;
import com.hyphenate.chat.EMGroupInfo;
import com.hyphenate.chat.EMGroupManager;
import com.hyphenate.chat.EMGroupOptions;
import com.hyphenate.chat.EMGroupReadAck;
import com.hyphenate.chat.EMImageMessageBody;
import com.hyphenate.chat.EMLanguage;
import com.hyphenate.chat.EMLocationMessageBody;
import com.hyphenate.chat.EMMessage;
import com.hyphenate.chat.EMMessage.Type;
import com.hyphenate.chat.EMMessageBody;
import com.hyphenate.chat.EMMessagePinInfo;
import com.hyphenate.chat.EMMessageReaction;
import com.hyphenate.chat.EMMessageReactionChange;
import com.hyphenate.chat.EMMessageReactionOperation;
import com.hyphenate.chat.EMMucSharedFile;
import com.hyphenate.chat.EMNormalFileMessageBody;
import com.hyphenate.chat.EMOptions;
import com.hyphenate.chat.EMPageResult;
import com.hyphenate.chat.EMPresence;
import com.hyphenate.chat.EMPushConfigs;
import com.hyphenate.chat.EMPushManager;
import com.hyphenate.chat.EMSilentModeParam;
import com.hyphenate.chat.EMSilentModeResult;
import com.hyphenate.chat.EMSilentModeTime;
import com.hyphenate.chat.EMTextMessageBody;
import com.hyphenate.chat.EMUserInfo;
import com.hyphenate.chat.EMVideoMessageBody;
import com.hyphenate.chat.EMVoiceMessageBody;
import com.hyphenate.exceptions.HyphenateException;
import com.hyphenate.push.EMPushConfig;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

class ExtSdkOptionsHelper {

    static EMOptions fromJson(JSONObject json, Context context) throws JSONException {
        EMOptions options = new EMOptions();
        options.setAppKey(json.getString("appKey"));
        options.setAutoLogin(json.getBoolean("autoLogin"));
        options.setRequireAck(json.getBoolean("requireAck"));
        options.setRequireDeliveryAck(json.getBoolean("requireDeliveryAck"));
        options.setSortMessageByServerTime(json.getBoolean("sortMessageByServerTime"));
        options.setAcceptInvitationAlways(json.getBoolean("acceptInvitationAlways"));
        options.setAutoAcceptGroupInvitation(json.getBoolean("autoAcceptGroupInvitation"));
        options.setDeleteMessagesAsExitGroup(json.getBoolean("deleteMessagesAsExitGroup"));
        options.setDeleteMessagesAsExitChatRoom(json.getBoolean("deleteMessagesAsExitChatRoom"));
        options.setAutoDownloadThumbnail(json.getBoolean("isAutoDownload"));
        options.allowChatroomOwnerLeave(json.getBoolean("isChatRoomOwnerLeaveAllowed"));
        options.setAutoTransferMessageAttachments(json.getBoolean("serverTransfer"));
        options.setUsingHttpsOnly(json.getBoolean("usingHttpsOnly"));
        options.enableDNSConfig(json.getBoolean("enableDNSConfig"));
        if (!json.getBoolean("enableDNSConfig")) {
            options.setImPort(json.getInt("imPort"));
            options.setIMServer(json.getString("imServer"));
            options.setRestServer(json.getString("restServer"));
            options.setDnsUrl(json.getString("dnsUrl"));
        }
        options.setAreaCode(json.getInt("areaCode"));
        options.setLoadEmptyConversations(json.optBoolean("enableEmptyConversation", false));
        if (json.has("customDeviceName")) {
            options.setCustomDeviceName(json.optString("customDeviceName"));
        }
        if (json.has("customOSType")) {
            options.setCustomOSPlatform(json.optInt("customOSType"));
        }

        if (json.has("pushConfig")) {
            EMPushConfig.Builder builder = new EMPushConfig.Builder(context);
            JSONObject pushConfig = json.getJSONObject("pushConfig");
            String manufacturer = pushConfig.getString("manufacturer");
            if (manufacturer.equalsIgnoreCase("google")) {
                builder.enableFCM(pushConfig.getString("deviceId"));
            } else if (manufacturer.equalsIgnoreCase("huawei")) {
                builder.enableHWPush();
            } else if (manufacturer.equalsIgnoreCase("meizu")) {
                builder.enableFCM(pushConfig.getString("deviceId"));
            } else if (manufacturer.equalsIgnoreCase("xiaomi")) {
                builder.enableFCM(pushConfig.getString("deviceId"));
            } else if (manufacturer.equalsIgnoreCase("oppo")) {
                builder.enableOppoPush(pushConfig.getString("deviceId"), "");
            } else if (manufacturer.equalsIgnoreCase("vivo")) {
                builder.enableFCM(pushConfig.getString("deviceId"));
            } else {
                builder.enableFCM(pushConfig.getString("deviceId"));
            }
            options.setPushConfig(builder.build());
        }

        // 2024-04-16 4.5.0
        options.setEnableTLSConnection(json.optBoolean("enableTLS", false));
        options.setUseReplacedMessageContents(json.optBoolean("useReplacedMessageContents", false));
        options.setIncludeSendMessageInMessageListener(json.optBoolean("messagesReceiveCallbackIncludeSend", false));
        options.setRegardImportedMsgAsRead(json.optBoolean("regardImportMessagesAsRead", false));

        return options;
    }

    // static Map<String, Object> toJson(EMOptions options) {
    //     Map<String, Object> data = new HashMap<>();
    //     data.put("appKey", options.getAppKey());
    //     data.put("autoLogin", options.getAutoLogin());
    //     data.put("requireAck", options.getRequireAck());
    //     data.put("requireDeliveryAck", options.getRequireDeliveryAck());
    //     data.put("sortMessageByServerTime", options.isSortMessageByServerTime());
    //     data.put("acceptInvitationAlways", options.getAcceptInvitationAlways());
    //     data.put("autoAcceptGroupInvitation", options.autoAcceptGroupInvitations());
    //     data.put("deleteMessagesAsExitGroup", options.deleteMessagesOnLeaveGroup());
    //     data.put("deleteMessagesAsExitChatRoom", options.deleteMessagesOnLeaveChatroom());
    //     data.put("isAutoDownload", options.getAutodownloadThumbnail());
    //     data.put("isChatRoomOwnerLeaveAllowed", options.canChatroomOwnerLeave());
    //     // data.put("serverTransfer", "");
    //     // data.put("debugModel", options.);
    //     // data.put("serverTransfer", options.);
    //     data.put("usingHttpsOnly", options.getUsingHttpsOnly());
    //     // data.put("EMPushConfig", "");
    //     // data.put("enableDNSConfig", "");
    //     data.put("imPort", options.getImPort());
    //     data.put("imServer", options.getImServer());
    //     data.put("restServer", options.getRestServer());
    //     data.put("dnsUrl", options.getDnsUrl());
    //     data.put("areaCode", options.getAreaCode());
    //     data.put("customOSType", options.getCustomOSPlatform());
    //     data.put("customDeviceName", options.getCustomDeviceName());
    //     data.put("enableEmptyConversation", options.isLoadEmptyConversations());

    //     return data;
    // }
}

class ExtSdkGroupHelper {
    static Map<String, Object> toJson(EMGroup group) {
        if (group == null) {
            return null;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("groupId", group.getGroupId());
        data.put("groupName", group.getGroupName());
        data.put("description", group.getDescription());
        data.put("owner", group.getOwner());
        data.put("announcement", group.getAnnouncement());
        data.put("memberCount", group.getMemberCount());
        data.put("memberList", group.getMembers());
        data.put("adminList", group.getAdminList());
        data.put("blockList", group.getBlackList());
        data.put("muteList", group.getMuteList());
        if (group.getGroupId() != null && EMClient.getInstance().pushManager().getNoPushGroups() != null) {
            data.put("noticeEnable",
                     !EMClient.getInstance().pushManager().getNoPushGroups().contains(group.getGroupId()));
        }
        data.put("messageBlocked", group.isMsgBlocked());
        data.put("isAllMemberMuted", group.isAllMemberMuted());
        data.put("permissionType", intTypeFromGroupPermissionType(group.getGroupPermissionType()));

        Map<String, Object> option = new HashMap<>();
        option.put("maxCount", group.getMaxUserCount());
        option.put("inviteNeedConfirm", group.isMemberAllowToInvite());
        option.put("ext", group.getExtension());
        option.put("isDisabled", group.isDisabled());
        option.put("isMemberOnly", group.isMemberOnly());
        data.put("options", option);

        return data;
    }

    static int intTypeFromGroupPermissionType(EMGroup.EMGroupPermissionType type) {
        int ret = -1;
        switch (type) {
        case none: {
            ret = -1;
        } break;
        case member: {
            ret = 0;
        } break;
        case admin: {
            ret = 1;
        } break;
        case owner: {
            ret = 2;
        } break;
        }
        return ret;
    }
}

class ExtSdkGroupInfoHelper {
    static Map<String, Object> toJson(EMGroupInfo group) {
        Map<String, Object> data = new HashMap<>();
        data.put("groupId", group.getGroupId());
        data.put("groupName", group.getGroupName());
        return data;
    }
}

class ExtSdkMucSharedFileHelper {
    static Map<String, Object> toJson(EMMucSharedFile file) {
        Map<String, Object> data = new HashMap<>();
        data.put("fileId", file.getFileId());
        data.put("name", file.getFileName());
        data.put("owner", file.getFileOwner());
        data.put("createTime", file.getFileUpdateTime());
        data.put("fileSize", file.getFileSize());

        return data;
    }
}

class ExtSdkGroupOptionsHelper {

    static EMGroupOptions fromJson(JSONObject json) throws JSONException {
        EMGroupOptions options = new EMGroupOptions();
        options.maxUsers = json.getInt("maxCount");
        options.inviteNeedConfirm = json.getBoolean("inviteNeedConfirm");
        if (json.has("ext")) {
            options.extField = json.getString("ext");
        }
        options.style = styleFromInt(json.getInt("style"));
        return options;
    }

    static Map<String, Object> toJson(EMGroupOptions options) {
        Map<String, Object> data = new HashMap<>();
        data.put("maxCount", options.maxUsers);
        data.put("inviteNeedConfirm", options.inviteNeedConfirm);
        data.put("ext", options.extField);
        data.put("style", styleToInt(options.style));
        return data;
    }

    private static EMGroupManager.EMGroupStyle styleFromInt(int style) {
        switch (style) {
        case 0:
            return EMGroupManager.EMGroupStyle.EMGroupStylePrivateOnlyOwnerInvite;
        case 1:
            return EMGroupManager.EMGroupStyle.EMGroupStylePrivateMemberCanInvite;
        case 2:
            return EMGroupManager.EMGroupStyle.EMGroupStylePublicJoinNeedApproval;
        case 3:
            return EMGroupManager.EMGroupStyle.EMGroupStylePublicOpenJoin;
        }

        return EMGroupManager.EMGroupStyle.EMGroupStylePrivateOnlyOwnerInvite;
    }

    private static int styleToInt(EMGroupManager.EMGroupStyle style) {
        switch (style) {
        case EMGroupStylePrivateOnlyOwnerInvite:
            return 0;
        case EMGroupStylePrivateMemberCanInvite:
            return 1;
        case EMGroupStylePublicJoinNeedApproval:
            return 2;
        case EMGroupStylePublicOpenJoin:
            return 3;
        }

        return 0;
    }
}

class ExtSdkChatRoomHelper {

    static Map<String, Object> toJson(EMChatRoom chatRoom) {
        if (chatRoom == null) {
            return null;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("roomId", chatRoom.getId());
        data.put("roomName", chatRoom.getName());
        data.put("description", chatRoom.getDescription());
        data.put("owner", chatRoom.getOwner());
        data.put("maxUsers", chatRoom.getMaxUsers());
        data.put("memberCount", chatRoom.getMemberCount());
        data.put("adminList", chatRoom.getAdminList());
        data.put("memberList", chatRoom.getMemberList());
        data.put("blockList", chatRoom.getBlacklist());
        List<String> muteList = new ArrayList<String>();
        for (Map.Entry<String, Long> item : chatRoom.getMuteList().entrySet()) {
            muteList.add(item.getKey());
        }
        data.put("muteList", muteList);
        data.put("isAllMemberMuted", chatRoom.isAllMemberMuted());
        data.put("announcement", chatRoom.getAnnouncement());
        data.put("permissionType", intTypeFromPermissionType(chatRoom.getChatRoomPermissionType()));

        return data;
    }

    static int intTypeFromPermissionType(EMChatRoom.EMChatRoomPermissionType type) {
        int ret = -1;
        switch (type) {
        case none: {
            ret = -1;
        } break;
        case member: {
            ret = 0;
        } break;
        case admin: {
            ret = 1;
        } break;
        case owner: {
            ret = 2;
        } break;
        default:
            break;
        }
        return ret;
    }
}

class ExtSdkMessageHelper {

    static EMMessage fromJson(JSONObject json) throws JSONException {
        EMMessage message = null;
        JSONObject bodyJson = json.getJSONObject("body");
        String type = bodyJson.getString("type");
        if (json.getString("direction").equals("send")) {
            switch (type) {
            case "txt": {
                message = EMMessage.createSendMessage(Type.TXT);
                message.addBody(ExtSdkMessageBodyHelper.textBodyFromJson(bodyJson));
            } break;
            case "img": {
                message = EMMessage.createSendMessage(Type.IMAGE);
                message.addBody(ExtSdkMessageBodyHelper.imageBodyFromJson(bodyJson));
            } break;
            case "loc": {
                message = EMMessage.createSendMessage(Type.LOCATION);
                message.addBody(ExtSdkMessageBodyHelper.localBodyFromJson(bodyJson));
            } break;
            case "video": {
                message = EMMessage.createSendMessage(Type.VIDEO);
                message.addBody(ExtSdkMessageBodyHelper.videoBodyFromJson(bodyJson));
            } break;
            case "voice": {
                message = EMMessage.createSendMessage(Type.VOICE);
                message.addBody(ExtSdkMessageBodyHelper.voiceBodyFromJson(bodyJson));
            } break;
            case "file": {
                message = EMMessage.createSendMessage(Type.FILE);
                message.addBody(ExtSdkMessageBodyHelper.fileBodyFromJson(bodyJson));
            } break;
            case "cmd": {
                message = EMMessage.createSendMessage(Type.CMD);
                message.addBody(ExtSdkMessageBodyHelper.cmdBodyFromJson(bodyJson));
            } break;
            case "custom": {
                message = EMMessage.createSendMessage(Type.CUSTOM);
                message.addBody(ExtSdkMessageBodyHelper.customBodyFromJson(bodyJson));
            } break;
            case "combine": {
                message = EMMessage.createSendMessage(Type.COMBINE);
                message.addBody(ExtSdkMessageBodyHelper.combineBodyFromJson(bodyJson));
            } break;
            }
            if (message != null) {
                message.setDirection(EMMessage.Direct.SEND);
            }
        } else {
            switch (type) {
            case "txt": {
                message = EMMessage.createReceiveMessage(Type.TXT);
                message.addBody(ExtSdkMessageBodyHelper.textBodyFromJson(bodyJson));
            } break;
            case "img": {
                message = EMMessage.createReceiveMessage(Type.IMAGE);
                message.addBody(ExtSdkMessageBodyHelper.imageBodyFromJson(bodyJson));
            } break;
            case "loc": {
                message = EMMessage.createReceiveMessage(Type.LOCATION);
                message.addBody(ExtSdkMessageBodyHelper.localBodyFromJson(bodyJson));
            } break;
            case "video": {
                message = EMMessage.createReceiveMessage(Type.VIDEO);
                message.addBody(ExtSdkMessageBodyHelper.videoBodyFromJson(bodyJson));
            } break;
            case "voice": {
                message = EMMessage.createReceiveMessage(Type.VOICE);
                message.addBody(ExtSdkMessageBodyHelper.voiceBodyFromJson(bodyJson));
            } break;
            case "file": {
                message = EMMessage.createReceiveMessage(Type.FILE);
                message.addBody(ExtSdkMessageBodyHelper.fileBodyFromJson(bodyJson));
            } break;
            case "cmd": {
                message = EMMessage.createReceiveMessage(Type.CMD);
                message.addBody(ExtSdkMessageBodyHelper.cmdBodyFromJson(bodyJson));
            } break;
            case "custom": {
                message = EMMessage.createReceiveMessage(Type.CUSTOM);
                message.addBody(ExtSdkMessageBodyHelper.customBodyFromJson(bodyJson));
            } break;
            case "combine": {
                message = EMMessage.createReceiveMessage(Type.COMBINE);
                message.addBody(ExtSdkMessageBodyHelper.combineBodyFromJson(bodyJson));
            } break;
            }
            if (message != null) {
                message.setDirection(EMMessage.Direct.RECEIVE);
            }
        }

        if (json.has("to")) {
            message.setTo(json.getString("to"));
        }

        if (json.has("from")) {
            message.setFrom(json.getString("from"));
        }

        message.setAcked(json.getBoolean("hasReadAck"));
        if (statusFromInt(json.getInt("status")) == EMMessage.Status.SUCCESS) {
            message.setUnread(!json.getBoolean("hasRead"));
        }
        // sdk auto invoke
        //        message.setDelivered(json.getBoolean("hasDeliverAck"));
        message.setIsNeedGroupAck(json.getBoolean("needGroupAck"));
        if (json.has("groupAckCount")) {
            message.setGroupAckCount(json.getInt("groupAckCount"));
        }

        message.setLocalTime(json.getLong("localTime"));
        if (json.has("serverTime")) {
            message.setMsgTime(json.getLong("serverTime"));
        }
        message.setStatus(statusFromInt(json.getInt("status")));
        message.setChatType(chatTypeFromInt(json.getInt("chatType")));
        if (json.has("msgId")) {
            message.setMsgId(json.getString("msgId"));
        }
        if (json.has("isChatThread")) {
            message.setIsChatThreadMessage(json.getBoolean("isChatThread"));
        }
        if (json.has("deliverOnlineOnly")) {
            message.deliverOnlineOnly(json.getBoolean("deliverOnlineOnly"));
        }

        if (json.has("attributes")) {
            JSONObject data = json.getJSONObject("attributes");
            Iterator iterator = data.keys();
            while (iterator.hasNext()) {
                String key = iterator.next().toString();
                Object result = data.get(key);
                if (result.getClass().getSimpleName().equals("Integer")) {
                    message.setAttribute(key, (Integer)result);
                } else if (result.getClass().getSimpleName().equals("Boolean")) {
                    message.setAttribute(key, (Boolean)result);
                } else if (result.getClass().getSimpleName().equals("Long")) {
                    message.setAttribute(key, (Long)result);
                } else if (result.getClass().getSimpleName().equals("Double") ||
                           result.getClass().getSimpleName().equals("Float")) {
                    message.setAttribute(key, (Double)result);
                } else if (result.getClass().getSimpleName().equals("JSONObject")) {
                    message.setAttribute(key, (JSONObject)result);
                } else if (result.getClass().getSimpleName().equals("JSONArray")) {
                    message.setAttribute(key, (JSONArray)result);
                } else {
                    message.setAttribute(key, data.getString(key));
                }
            }
        }
        if (json.has("priority")) {
            message.setPriority(priorityFromInt(json.getInt("priority")));
        }
        if (json.has("receiverList")) {
            ArrayList<String> receiverList = new ArrayList<>();
            JSONArray ja = json.getJSONArray("receiverList");
            for (int i = 0; i < ja.length(); i++) {
                receiverList.add((String)ja.get(i));
            }
            message.setReceiverList(receiverList);
        }
        return message;
    }

    static Map<String, Object> toJson(EMMessage message) {
        if (message == null) {
            return null;
        }
        Map<String, Object> data = new HashMap<>();
        switch (message.getType()) {
        case TXT: {
            data.put("body", ExtSdkMessageBodyHelper.textBodyToJson((EMTextMessageBody)message.getBody()));
        } break;
        case IMAGE: {
            data.put("body", ExtSdkMessageBodyHelper.imageBodyToJson((EMImageMessageBody)message.getBody()));
        } break;
        case LOCATION: {
            data.put("body", ExtSdkMessageBodyHelper.localBodyToJson((EMLocationMessageBody)message.getBody()));
        } break;
        case CMD: {
            data.put("body", ExtSdkMessageBodyHelper.cmdBodyToJson((EMCmdMessageBody)message.getBody()));
        } break;
        case CUSTOM: {
            data.put("body", ExtSdkMessageBodyHelper.customBodyToJson((EMCustomMessageBody)message.getBody()));
        } break;
        case FILE: {
            data.put("body", ExtSdkMessageBodyHelper.fileBodyToJson((EMNormalFileMessageBody)message.getBody()));
        } break;
        case VIDEO: {
            data.put("body", ExtSdkMessageBodyHelper.videoBodyToJson((EMVideoMessageBody)message.getBody()));
        } break;
        case VOICE: {
            data.put("body", ExtSdkMessageBodyHelper.voiceBodyToJson((EMVoiceMessageBody)message.getBody()));
        } break;
        case COMBINE: {
            data.put("body", ExtSdkMessageBodyHelper.combineBodyToJson((EMCombineMessageBody)message.getBody()));
        } break;
        }

        if (message.ext().size() > 0 && null != message.ext()) {
            data.put("attributes", message.ext());
        }
        data.put("from", message.getFrom());
        data.put("to", message.getTo());
        data.put("hasReadAck", message.isAcked());
        data.put("hasDeliverAck", message.isDelivered());
        data.put("localTime", message.localTime());
        data.put("serverTime", message.getMsgTime());
        data.put("status", statusToInt(message.status()));
        data.put("chatType", chatTypeToInt(message.getChatType()));
        data.put("direction", message.direct() == EMMessage.Direct.SEND ? "send" : "rec");
        data.put("conversationId", message.conversationId());
        data.put("msgId", message.getMsgId());
        data.put("hasRead", !message.isUnread());
        data.put("needGroupAck", message.isNeedGroupAck());
        data.put("groupAckCount", message.groupAckCount());
        data.put("isChatThread", message.isChatThreadMessage());
        data.put("isOnline", message.isOnlineState());
        data.put("deliverOnlineOnly", message.isDeliverOnlineOnly());
        data.put("isBroadcast", message.isBroadcast());
        data.put("isContentReplaced", message.isContentReplaced());
        //        data.put("priority", ExtSdkMessageHelper.priorityToInt(;));
        if (message.receiverList().size() > 0) {
            data.put("receiverList", message.receiverList());
        }

        return data;
    }

    private static EMMessage.ChatType chatTypeFromInt(int type) {
        switch (type) {
        case 0:
            return EMMessage.ChatType.Chat;
        case 1:
            return EMMessage.ChatType.GroupChat;
        case 2:
            return EMMessage.ChatType.ChatRoom;
        }
        return EMMessage.ChatType.Chat;
    }

    private static int chatTypeToInt(EMMessage.ChatType type) {
        switch (type) {
        case Chat:
            return 0;
        case GroupChat:
            return 1;
        case ChatRoom:
            return 2;
        }
        return 0;
    }

    private static EMMessage.EMChatRoomMessagePriority priorityFromInt(int priority) {
        switch (priority) {
        case 0:
            return EMMessage.EMChatRoomMessagePriority.PriorityHigh;
        case 1:
            return EMMessage.EMChatRoomMessagePriority.PriorityNormal;
        case 2:
            return EMMessage.EMChatRoomMessagePriority.PriorityLow;
        }
        return EMMessage.EMChatRoomMessagePriority.PriorityNormal;
    }

    private static int priorityToInt(EMMessage.EMChatRoomMessagePriority priority) {
        switch (priority) {
        case PriorityHigh:
            return 0;
        case PriorityNormal:
            return 1;
        case PriorityLow:
            return 2;
        }
        return 1;
    }

    private static EMMessage.Status statusFromInt(int status) {
        switch (status) {
        case 0:
            return EMMessage.Status.CREATE;
        case 1:
            return EMMessage.Status.INPROGRESS;
        case 2:
            return EMMessage.Status.SUCCESS;
        case 3:
            return EMMessage.Status.FAIL;
        }
        return EMMessage.Status.CREATE;
    }

    private static int statusToInt(EMMessage.Status status) {
        switch (status) {
        case CREATE:
            return 0;
        case INPROGRESS:
            return 1;
        case SUCCESS:
            return 2;
        case FAIL:
            return 3;
        }
        return 0;
    }
}

class ExtSdkGroupAckHelper {
    static Map<String, Object> toJson(EMGroupReadAck ack) {
        Map<String, Object> data = new HashMap<>();
        data.put("msg_id", ack.getMsgId());
        data.put("ack_id", ack.getAckId());
        data.put("from", ack.getFrom());
        data.put("count", ack.getCount());
        data.put("timestamp", ack.getTimestamp());
        if (ack.getContent() != null) {
            data.put("content", ack.getContent());
        }
        return data;
    }
}

class ExtSdkMessageBodyHelper {

    static void baseBodyToJson(EMMessageBody body, Map<String, Object> data) {
        if (body.operatorId() != null && body.operatorId().length() > 0) {
            data.put("lastModifyOperatorId", body.operatorId());
            data.put("lastModifyTime", body.operationTime());
            data.put("modifyCount", body.operationCount());
        }
    }

    static EMTextMessageBody textBodyFromJson(JSONObject json) throws JSONException {
        String content = json.getString("content");
        List<String> list = new ArrayList<>();
        if (json.has("targetLanguageCodes")) {
            JSONArray ja = json.getJSONArray("targetLanguageCodes");
            for (int i = 0; i < ja.length(); i++) {
                list.add(ja.getString(i));
            }
        }
        EMTextMessageBody body = new EMTextMessageBody(content);
        body.setTargetLanguages(list);
        // 给底层的时候不需要设置
        return body;
    }

    static Map<String, Object> textBodyToJson(EMTextMessageBody body) {
        Map<String, Object> data = new HashMap<>();
        baseBodyToJson(body, data);
        data.put("content", body.getMessage());
        data.put("type", "txt");
        if (body.getTargetLanguages() != null) {
            data.put("targetLanguageCodes", body.getTargetLanguages());
        }
        if (body.getTranslations() != null) {
            HashMap<String, String> map = new HashMap<>();
            List<EMTextMessageBody.EMTranslationInfo> list = body.getTranslations();
            for (int i = 0; i < list.size(); ++i) {
                String key = list.get(i).languageCode;
                String value = list.get(i).translationText;
                map.put(key, value);
            }
            data.put("translations", map);
        }
        return data;
    }

    static EMLocationMessageBody localBodyFromJson(JSONObject json) throws JSONException {
        double latitude = json.getDouble("latitude");
        double longitude = json.getDouble("longitude");
        String address = null;
        String buildingName = null;
        if (json.has("address")) {
            address = json.getString("address");
        }

        if (json.has("buildingName")) {
            buildingName = json.getString("buildingName");
        }

        EMLocationMessageBody body = new EMLocationMessageBody(address, latitude, longitude, buildingName);

        return body;
    }

    static Map<String, Object> localBodyToJson(EMLocationMessageBody body) {
        Map<String, Object> data = new HashMap<>();
        baseBodyToJson(body, data);
        data.put("latitude", body.getLatitude());
        data.put("longitude", body.getLongitude());
        data.put("buildingName", body.getBuildingName());
        data.put("address", body.getAddress());
        data.put("type", "loc");
        return data;
    }

    static EMCmdMessageBody cmdBodyFromJson(JSONObject json) throws JSONException {
        String action = json.getString("action");
        EMCmdMessageBody body = new EMCmdMessageBody(action);
        // if (json.has("deliverOnlineOnly")) {
        //     boolean deliverOnlineOnly = json.getBoolean("deliverOnlineOnly");
        //     body.deliverOnlineOnly(deliverOnlineOnly);
        // }
        return body;
    }

    static Map<String, Object> cmdBodyToJson(EMCmdMessageBody body) {
        Map<String, Object> data = new HashMap<>();
        baseBodyToJson(body, data);
        // data.put("deliverOnlineOnly", body.isDeliverOnlineOnly());
        data.put("action", body.action());
        data.put("type", "cmd");
        return data;
    }

    static EMCustomMessageBody customBodyFromJson(JSONObject json) throws JSONException {
        String event = json.getString("event");
        EMCustomMessageBody body = new EMCustomMessageBody(event);

        if (json.has("params") && json.get("params") != JSONObject.NULL) {
            JSONObject jsonObject = json.getJSONObject("params");
            Map<String, String> params = new HashMap<>();
            Iterator iterator = jsonObject.keys();
            while (iterator.hasNext()) {
                String key = iterator.next().toString();
                params.put(key, jsonObject.getString(key));
            }
            body.setParams(params);
        }
        return body;
    }

    static Map<String, Object> customBodyToJson(EMCustomMessageBody body) {
        Map<String, Object> data = new HashMap<>();
        baseBodyToJson(body, data);
        data.put("event", body.event());
        data.put("params", body.getParams());
        data.put("type", "custom");
        return data;
    }

    static EMFileMessageBody fileBodyFromJson(JSONObject json) throws JSONException {
        String localPath = json.getString("localPath");

        EMNormalFileMessageBody body = new EMNormalFileMessageBody(Uri.parse(localPath));

        if (json.has("displayName")) {
            body.setFileName(json.getString("displayName"));
        }
        if (json.has("remotePath")) {
            body.setRemoteUrl(json.getString("remotePath"));
        }
        if (json.has("secret")) {
            body.setSecret(json.getString("secret"));
        }
        body.setDownloadStatus(downloadStatusFromInt(json.getInt("fileStatus")));
        if (json.has("fileSize")) {
            body.setFileLength(json.getInt("fileSize"));
        }

        return body;
    }

    static Map<String, Object> fileBodyToJson(EMNormalFileMessageBody body) {
        Map<String, Object> data = new HashMap<>();
        baseBodyToJson(body, data);
        data.put("localPath", body.getLocalUrl());
        data.put("fileSize", body.getFileSize());
        data.put("displayName", body.getFileName());
        data.put("remotePath", body.getRemoteUrl());
        data.put("secret", body.getSecret());
        data.put("fileStatus", downloadStatusToInt(body.downloadStatus()));
        data.put("type", "file");
        return data;
    }

    static Map<String, Object> combineBodyToJson(EMCombineMessageBody body) {
        Map<String, Object> ret = new HashMap<>();
        baseBodyToJson(body, ret);
        if (body.getTitle() != null) {
            ret.put("title", body.getTitle());
        }
        if (body.getSummary() != null) {
            ret.put("summary", body.getSummary());
        }
        if (body.getCompatibleText() != null) {
            ret.put("compatibleText", body.getCompatibleText());
        }
        if (body.getLocalUrl() != null) {
            ret.put("localPath", body.getLocalUrl());
        }
        if (body.getRemoteUrl() != null) {
            ret.put("remotePath", body.getRemoteUrl());
        }
        if (body.getSecret() != null) {
            ret.put("secret", body.getSecret());
        }
        ret.put("type", "combine");

        return ret;
    }

    static EMCombineMessageBody combineBodyFromJson(JSONObject json) throws JSONException {
        String title = json.optString("title");
        String summary = json.optString("summary");
        String compatibleText = json.optString("compatibleText");
        String localPath = json.optString("localPath");
        String remotePath = json.optString("remotePath");
        String secret = json.optString("secret");
        List<String> msgIds = new ArrayList<>();
        if (json.has("messageIdList")) {
            JSONArray array = json.getJSONArray("messageIdList");
            for (int i = 0; i < array.length(); i++) {
                msgIds.add(array.getString(i));
            }
        }

        EMCombineMessageBody ret = new EMCombineMessageBody();
        ret.setTitle(title);
        ret.setSummary(summary);
        ret.setCompatibleText(compatibleText);
        ret.setLocalUrl(localPath);
        ret.setRemoteUrl(remotePath);
        ret.setSecret(secret);
        ret.setMessageList(msgIds);

        return ret;
    }

    static EMImageMessageBody imageBodyFromJson(JSONObject json) throws JSONException {
        String localPath = json.getString("localPath");

        EMImageMessageBody body = new EMImageMessageBody(Uri.parse(localPath));
        if (json.has("displayName")) {
            body.setFileName(json.getString("displayName"));
        }
        if (json.has("remotePath")) {
            body.setRemoteUrl(json.getString("remotePath"));
        }
        if (json.has("secret")) {
            body.setSecret(json.getString("secret"));
        }
        if (json.has("thumbnailLocalPath")) {
            body.setThumbnailLocalPath(json.getString("thumbnailLocalPath"));
        }
        if (json.has("thumbnailRemotePath")) {
            body.setThumbnailUrl(json.getString("thumbnailRemotePath"));
        }
        if (json.has("thumbnailSecret")) {
            body.setThumbnailSecret(json.getString("thumbnailSecret"));
        }
        if (json.has("fileSize")) {
            body.setFileLength(json.getInt("fileSize"));
        }
        if (json.has("width") && json.has("height")) {
            int width = json.getInt("width");
            int height = json.getInt("height");
            body.setThumbnailSize(width, height);
        }
        if (json.has("sendOriginalImage")) {
            body.setSendOriginalImage(json.getBoolean("sendOriginalImage"));
        }

        if (json.has("fileStatus")) {
            body.setDownloadStatus(downloadStatusFromInt(json.getInt("fileStatus")));
        }

        return body;
    }

    static Map<String, Object> imageBodyToJson(EMImageMessageBody body) {
        Map<String, Object> data = new HashMap<>();
        baseBodyToJson(body, data);
        data.put("localPath", body.getLocalUrl());
        data.put("displayName", body.getFileName());
        data.put("remotePath", body.getRemoteUrl());
        data.put("secret", body.getSecret());
        data.put("fileStatus", downloadStatusToInt(body.downloadStatus()));
        data.put("thumbnailLocalPath", body.thumbnailLocalPath());
        data.put("thumbnailRemotePath", body.getThumbnailUrl());
        data.put("thumbnailSecret", body.getThumbnailSecret());
        data.put("height", body.getHeight());
        data.put("width", body.getWidth());
        data.put("sendOriginalImage", body.isSendOriginalImage());
        data.put("fileSize", body.getFileSize());
        data.put("type", "img");
        return data;
    }

    static EMVideoMessageBody videoBodyFromJson(JSONObject json) throws JSONException {
        String localPath = json.getString("localPath");
        int duration = 0;
        if (json.has("duration")) {
            duration = json.getInt("duration");
        }
        String thumbnailLocalPath = "";
        if (json.has("thumbnailLocalPath")) {
            thumbnailLocalPath = json.getString("thumbnailLocalPath");
        }
        EMVideoMessageBody body =
            new EMVideoMessageBody(Uri.parse(localPath), Uri.parse(thumbnailLocalPath), duration, 0);

        if (json.has("thumbnailRemotePath")) {
            body.setThumbnailUrl(json.getString("thumbnailRemotePath"));
        }
        if (json.has("thumbnailSecret")) {
            body.setThumbnailSecret(json.getString("thumbnailSecret"));
        }
        if (json.has("displayName")) {
            body.setFileName(json.getString("displayName"));
        }
        if (json.has("remotePath")) {
            body.setRemoteUrl(json.getString("remotePath"));
        }
        if (json.has("secret")) {
            body.setSecret(json.getString("secret"));
        }
        if (json.has("fileSize")) {
            body.setVideoFileLength(json.getInt("fileSize"));
        }

        if (json.has("fileStatus")) {
            body.setDownloadStatus(downloadStatusFromInt(json.getInt("fileStatus")));
        }

        if (json.has("width") && json.has("height")) {
            int width = json.getInt("width");
            int height = json.getInt("height");
            body.setThumbnailSize(width, height);
        }

        return body;
    }

    static Map<String, Object> videoBodyToJson(EMVideoMessageBody body) {
        Map<String, Object> data = new HashMap<>();
        baseBodyToJson(body, data);
        data.put("localPath", body.getLocalUrl());
        data.put("thumbnailLocalPath", body.getLocalThumbUri());
        data.put("duration", body.getDuration());
        data.put("fileSize", body.getVideoFileLength());
        data.put("thumbnailRemotePath", body.getThumbnailUrl());
        data.put("thumbnailSecret", body.getThumbnailSecret());
        data.put("displayName", body.getFileName());
        data.put("height", body.getThumbnailHeight());
        data.put("width", body.getThumbnailWidth());
        data.put("remotePath", body.getRemoteUrl());
        data.put("fileStatus", downloadStatusToInt(body.downloadStatus()));
        data.put("secret", body.getSecret());
        data.put("type", "video");

        return data;
    }

    static EMVoiceMessageBody voiceBodyFromJson(JSONObject json) throws JSONException {
        String localPath = json.getString("localPath");
        int duration = json.getInt("duration");
        EMVoiceMessageBody body = new EMVoiceMessageBody(Uri.parse(localPath), duration);
        body.setDownloadStatus(downloadStatusFromInt(json.getInt("fileStatus")));
        if (json.has("displayName")) {
            body.setFileName(json.getString("displayName"));
        }
        if (json.has("secret")) {
            body.setSecret(json.getString("secret"));
        }
        if (json.has("remotePath")) {
            body.setRemoteUrl(json.getString("remotePath"));
        }
        if (json.has("fileSize")) {
            body.setFileLength(json.getLong("fileSize"));
        }

        return body;
    }

    static Map<String, Object> voiceBodyToJson(EMVoiceMessageBody body) {
        Map<String, Object> data = new HashMap<>();
        baseBodyToJson(body, data);
        data.put("localPath", body.getLocalUrl());
        data.put("duration", body.getLength());
        data.put("displayName", body.getFileName());
        data.put("remotePath", body.getRemoteUrl());
        data.put("fileStatus", downloadStatusToInt(body.downloadStatus()));
        data.put("secret", body.getSecret());
        data.put("type", "voice");
        data.put("fileSize", body.getFileSize());
        return data;
    }

    private static EMFileMessageBody.EMDownloadStatus downloadStatusFromInt(int downloadStatus) {
        switch (downloadStatus) {
        case 0:
            return EMFileMessageBody.EMDownloadStatus.DOWNLOADING;
        case 1:
            return EMFileMessageBody.EMDownloadStatus.SUCCESSED;
        case 2:
            return EMFileMessageBody.EMDownloadStatus.FAILED;
        case 3:
            return EMFileMessageBody.EMDownloadStatus.PENDING;
        }
        return EMFileMessageBody.EMDownloadStatus.DOWNLOADING;
    }

    private static int downloadStatusToInt(EMFileMessageBody.EMDownloadStatus downloadStatus) {
        switch (downloadStatus) {
        case DOWNLOADING:
            return 0;
        case SUCCESSED:
            return 1;
        case FAILED:
            return 2;
        case PENDING:
            return 3;
        }
        return 0;
    }
}

class ExtSdkConversationHelper {

    static Map<String, Object> toJson(EMConversation conversation) {
        if (conversation == null) {
            return null;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("convId", conversation.conversationId());
        data.put("convType", typeToInt(conversation.getType()));
        data.put("isChatThread", conversation.isChatThread());
        data.put("isPinned", conversation.isPinned());
        data.put("pinnedTime", conversation.getPinnedTime());
        if (conversation.marks() != null) {
            List<Integer> list = new ArrayList<>();
            for (EMConversation.EMMarkType type : conversation.marks()) {
              list.add(type.ordinal());
            }
            data.put("marks", list);
        }
        try {
            data.put("ext", jsonStringToMap(conversation.getExtField()));
        } catch (Exception ignored) {
            return data;
        }
        return data;
    }

    static EMConversation.EMConversationType typeFromInt(int type) {
        switch (type) {
        case 0:
            return EMConversation.EMConversationType.Chat;
        case 1:
            return EMConversation.EMConversationType.GroupChat;
        case 2:
            return EMConversation.EMConversationType.ChatRoom;
        }

        return EMConversation.EMConversationType.Chat;
    }

    protected static int typeToInt(EMConversation.EMConversationType type) {
        switch (type) {
        case Chat:
            return 0;
        case GroupChat:
            return 1;
        case ChatRoom:
            return 2;
        }

        return 0;
    }

    private static Map<String, Object> jsonStringToMap(String content) throws JSONException {
        if (content == null)
            return null;
        content = content.trim();
        Map<String, Object> result = new HashMap<>();
        try {
            if (content.charAt(0) == '[') {
                JSONArray jsonArray = new JSONArray(content);
                for (int i = 0; i < jsonArray.length(); i++) {
                    Object value = jsonArray.get(i);
                    if (value instanceof JSONArray || value instanceof JSONObject) {
                        result.put(i + "", jsonStringToMap(value.toString().trim()));
                    } else {
                        result.put(i + "", jsonArray.getString(i));
                    }
                }
            } else if (content.charAt(0) == '{') {
                JSONObject jsonObject = new JSONObject(content);
                Iterator<String> iterator = jsonObject.keys();
                while (iterator.hasNext()) {
                    String key = iterator.next();
                    Object value = jsonObject.get(key);
                    if (value instanceof JSONArray || value instanceof JSONObject) {
                        result.put(key, jsonStringToMap(value.toString().trim()));
                    } else if (value instanceof Double) {
                        result.put(key, ((Double)value).doubleValue());
                    } else if (value instanceof Integer) {
                        result.put(key, ((Integer)value).intValue());
                    } else if (value instanceof Long) {
                        result.put(key, ((Long)value).longValue());
                    } else if (value instanceof Boolean) {
                        result.put(key, ((Boolean)value).booleanValue());
                    } else {
                        result.put(key, value.toString().trim());
                    }
                }
            } else {
                throw new JSONException("");
            }
        } catch (JSONException e) {
            throw new JSONException("");
        }
        return result;
    }
}

class ExtSdkDeviceInfoHelper {

    static Map<String, Object> toJson(EMDeviceInfo device) {
        Map<String, Object> data = new HashMap<>();
        data.put("resource", device.getResource());
        data.put("deviceUUID", device.getDeviceUUID());
        data.put("deviceName", device.getDeviceName());

        return data;
    }
}

class ExtSdkCursorResultHelper {

    static Map<String, Object> toJson(EMCursorResult result) {
        Map<String, Object> data = new HashMap<>();
        data.put("cursor", result.getCursor());
        List<Object> jsonList = new ArrayList<>();
        if (null != result.getData()) {
            List list = (List)result.getData();

            for (Object obj : list) {
                if (obj instanceof EMMessage) {
                    jsonList.add(ExtSdkMessageHelper.toJson((EMMessage)obj));
                }

                if (obj instanceof EMGroup) {
                    jsonList.add(ExtSdkGroupHelper.toJson((EMGroup)obj));
                }

                if (obj instanceof EMChatRoom) {
                    jsonList.add(ExtSdkChatRoomHelper.toJson((EMChatRoom)obj));
                }

                if (obj instanceof EMGroupReadAck) {
                    jsonList.add(ExtSdkGroupAckHelper.toJson((EMGroupReadAck)obj));
                }

                if (obj instanceof String) {
                    jsonList.add(obj);
                }

                if (obj instanceof EMGroupInfo) {
                    jsonList.add(ExtSdkGroupInfoHelper.toJson((EMGroupInfo)obj));
                }

                if (obj instanceof EMChatThread) {
                    jsonList.add(ExtSdkChatThreadHelper.toJson((EMChatThread)obj));
                }

                if (obj instanceof EMMessageReaction) {
                    jsonList.add(ExtSdkMessageReactionHelper.toJson((EMMessageReaction)obj));
                }

                if (obj instanceof EMConversation) {
                    jsonList.add(ExtSdkConversationHelper.toJson((EMConversation)obj));
                }

                if (obj instanceof EMContact) {
                    jsonList.add(ExtSdkContactHelper.toJson((EMContact)obj));
                }
            }
        }

        data.put("list", jsonList);

        return data;
    }
}

class ExtSdkPageResultHelper {

    static Map<String, Object> toJson(EMPageResult result) {
        Map<String, Object> data = new HashMap<>();
        data.put("count", result.getPageCount());
        List<Map> jsonList = new ArrayList<>();
        if (null != result.getData()) {
            List list = (List)result.getData();

            for (Object obj : list) {
                if (obj instanceof EMMessage) {
                    jsonList.add(ExtSdkMessageHelper.toJson((EMMessage)obj));
                }

                if (obj instanceof EMGroup) {
                    jsonList.add(ExtSdkGroupHelper.toJson((EMGroup)obj));
                }

                if (obj instanceof EMChatRoom) {
                    jsonList.add(ExtSdkChatRoomHelper.toJson((EMChatRoom)obj));
                }
            }
        }

        data.put("list", jsonList);
        return data;
    }
}

class ExtSdkErrorHelper {
    static Map<String, Object> toJson(int errorCode, String desc) {
        Map<String, Object> data = new HashMap<>();
        data.put("code", errorCode);
        data.put("description", desc);
        return data;
    }
}

class ExtSdkPushConfigsHelper {
    static Map<String, Object> toJson(EMPushConfigs pushConfigs) {
        Map<String, Object> data = new HashMap<>();
        data.put("noDisturb", pushConfigs.silentModeEnabled());
        data.put("noDisturbEndHour", pushConfigs.getSilentModeEnd());
        data.put("noDisturbStartHour", pushConfigs.getSilentModeStart());
        data.put("displayStyle", pushConfigs.getDisplayStyle().ordinal());
        data.put("displayName", pushConfigs.getDisplayNickname());
        return data;
    }
}

class ExtSdkExceptionHelper {
    static Map<String, Object> toJson(HyphenateException e) {
        Map<String, Object> data = new HashMap<>();
        data.put("code", e.getErrorCode());
        data.put("description", e.getDescription());
        return data;
    }
}

class ExtSdkJSONExceptionHelper {
    static Map<String, Object> toJson(JSONException e) {
        Map<String, Object> data = new HashMap<>();
        data.put("code",
                 1); // GENERAL_ERROR = 1
                     // http://sdkdocs.easemob.com/apidoc/android/chat3.0/classcom_1_1hyphenate_1_1_e_m_error.html
        data.put("message", e.getMessage());
        data.put("description", e.getCause());
        return data;
    }
}

class ExtSdkUserInfoHelper {
    static EMUserInfo fromJson(JSONObject obj) throws JSONException {
        EMUserInfo userInfo = new EMUserInfo();

        userInfo.setUserId(obj.getString("userId"));
        if (obj.has("nickName")) {
            userInfo.setNickname(obj.getString("nickName"));
        }

        if (obj.has("gender")) {
            userInfo.setGender(obj.getInt("gender"));
        }
        if (obj.has("mail")) {
            userInfo.setEmail(obj.optString("mail"));
        }
        if (obj.has("phone")) {
            userInfo.setPhoneNumber(obj.optString("phone"));
        }
        if (obj.has("sign")) {
            userInfo.setSignature(obj.optString("sign"));
        }
        if (obj.has("avatarUrl")) {
            userInfo.setAvatarUrl(obj.optString("avatarUrl"));
        }
        if (obj.has("ext")) {
            userInfo.setExt(obj.getString("ext"));
        }
        if (obj.has("birth")) {
            userInfo.setBirth(obj.getString("birth"));
        }

        return userInfo;
    }

    static Map<String, Object> toJson(EMUserInfo userInfo) {
        if (userInfo == null) {
            return null;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("userId", userInfo.getUserId());
        data.put("nickName", userInfo.getNickname());
        data.put("avatarUrl", userInfo.getAvatarUrl());
        data.put("mail", userInfo.getEmail());
        data.put("phone", userInfo.getPhoneNumber());
        data.put("gender", userInfo.getGender());
        data.put("sign", userInfo.getSignature());
        data.put("birth", userInfo.getBirth());
        data.put("ext", userInfo.getExt());

        return data;
    }
}

class ExtSdkPresenceHelper {

    static Map<String, Object> toJson(EMPresence presence) {
        Map<String, Object> data = new HashMap<>();
        data.put("publisher", presence.getPublisher());
        data.put("statusDescription", presence.getExt());
        data.put("lastTime", presence.getLatestTime());
        data.put("expiryTime", presence.getExpiryTime());
        Map<String, Integer> statusList = new HashMap<String, Integer>();
        statusList.putAll(presence.getStatusList());
        data.put("statusDetails", statusList);
        return data;
    }
}

class ExtSdkLanguageHelper {
    static Map<String, Object> toJson(EMLanguage language) {
        Map<String, Object> data = new HashMap<>();
        data.put("code", language.LanguageCode);
        data.put("name", language.LanguageName);
        data.put("nativeName", language.LanguageLocalName);
        return data;
    }
}

class ExtSdkReactionOperationHelper {
    static Map<String, Object> toJson(EMMessageReactionOperation operation) {
        if (operation == null) {
            return null;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("userId", operation.getUserId());
        data.put("reaction", operation.getReaction());
        data.put("operate", operation.getOperation().ordinal());
        return data;
    }
}

class ExtSdkMessageReactionHelper {
    static Map<String, Object> toJson(EMMessageReaction reaction) {
        if (reaction == null) {
            return null;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("reaction", reaction.getReaction());
        data.put("count", reaction.getUserCount());
        data.put("isAddedBySelf", reaction.isAddedBySelf());
        data.put("userList", reaction.getUserList());
        return data;
    }
}

class ExtSdkMessageReactionChangeHelper {
    static Map<String, Object> toJson(EMMessageReactionChange change) {
        Map<String, Object> data = new HashMap<>();
        data.put("conversationId", change.getConversionID());
        data.put("messageId", change.getMessageId());
        ArrayList<Map<String, Object>> list = new ArrayList<>();
        for (int i = 0; i < change.getMessageReactionList().size(); i++) {
            list.add(ExtSdkMessageReactionHelper.toJson(change.getMessageReactionList().get(i)));
        }
        data.put("reactions", list);
        ArrayList<Map<String, Object>> opList = new ArrayList<>();
        for (int i = 0; i < change.getOperations().size(); i++) {
            opList.add(ExtSdkReactionOperationHelper.toJson(change.getOperations().get(i)));
        }
        data.put("operations", opList);

        return data;
    }
}

class ExtSdkChatThreadHelper {
    static Map<String, Object> toJson(EMChatThread thread) {
        if (thread == null) {
            return null;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("threadId", thread.getChatThreadId());
        if (thread.getChatThreadName() != null) {
            data.put("threadName", thread.getChatThreadName());
        }
        data.put("owner", thread.getOwner());
        data.put("msgId", thread.getMessageId());
        data.put("parentId", thread.getParentId());
        data.put("memberCount", thread.getMemberCount());
        data.put("msgCount", thread.getMessageCount());
        data.put("createAt", thread.getCreateAt());
        if (thread.getLastMessage() != null && thread.getLastMessage().getMsgId().length() > 0) {
            data.put("lastMessage", ExtSdkMessageHelper.toJson(thread.getLastMessage()));
        }

        return data;
    }
}

class ExtSdkChatThreadEventHelper {
    static Map<String, Object> toJson(EMChatThreadEvent thread) {
        Map<String, Object> data = new HashMap<>();
        switch (thread.getType()) {
        case UNKNOWN:
            data.put("type", 0);
            break;
        case CREATE:
            data.put("type", 1);
            break;
        case UPDATE:
            data.put("type", 2);
            break;
        case DELETE:
            data.put("type", 3);
            break;
        case UPDATE_MSG:
            data.put("type", 4);
            break;
        }
        data.put("from", thread.getFrom());
        if (thread.getChatThread() != null) {
            data.put("thread", ExtSdkChatThreadHelper.toJson(thread.getChatThread()));
        }

        return data;
    }
}

class ExtSdkSilentModeParamHelper {
    static EMSilentModeParam fromJson(JSONObject obj) throws JSONException {
        EMSilentModeParam.EMSilentModeParamType type = paramTypeFromInt(obj.getInt("paramType"));
        EMSilentModeParam param = new EMSilentModeParam(type);
        ;
        if (obj.has("startTime") && obj.has("endTime")) {
            EMSilentModeTime startTime = ExtSdkSilentModeTimeHelper.fromJson(obj.getJSONObject("startTime"));
            EMSilentModeTime endTime = ExtSdkSilentModeTimeHelper.fromJson(obj.getJSONObject("endTime"));
            param.setSilentModeInterval(startTime, endTime);
        }

        if (obj.has("remindType")) {
            param.setRemindType(pushRemindFromInt(obj.getInt("remindType")));
        }

        if (obj.has("duration")) {
            int duration = obj.getInt("duration");
            param.setSilentModeDuration(duration);
        }
        return param;
    }

    static EMSilentModeParam.EMSilentModeParamType paramTypeFromInt(int iParamType) {
        EMSilentModeParam.EMSilentModeParamType ret = EMSilentModeParam.EMSilentModeParamType.REMIND_TYPE;
        if (iParamType == 0) {
            ret = EMSilentModeParam.EMSilentModeParamType.REMIND_TYPE;
        } else if (iParamType == 1) {
            ret = EMSilentModeParam.EMSilentModeParamType.SILENT_MODE_DURATION;
        } else if (iParamType == 2) {
            ret = EMSilentModeParam.EMSilentModeParamType.SILENT_MODE_INTERVAL;
        }
        return ret;
    }

    static int pushRemindTypeToInt(EMPushManager.EMPushRemindType type) {
        int ret = 0;
        if (type == EMPushManager.EMPushRemindType.ALL) {
            ret = 0;
        } else if (type == EMPushManager.EMPushRemindType.MENTION_ONLY) {
            ret = 1;
        } else if (type == EMPushManager.EMPushRemindType.NONE) {
            ret = 2;
        }
        return ret;
    }

    static EMPushManager.EMPushRemindType pushRemindFromInt(int iType) {
        EMPushManager.EMPushRemindType type = EMPushManager.EMPushRemindType.ALL;
        if (iType == 0) {
            type = EMPushManager.EMPushRemindType.ALL;
        } else if (iType == 1) {
            type = EMPushManager.EMPushRemindType.MENTION_ONLY;
        } else if (iType == 2) {
            type = EMPushManager.EMPushRemindType.NONE;
        }
        return type;
    }
}

class ExtSdkSilentModeTimeHelper {
    static EMSilentModeTime fromJson(JSONObject obj) throws JSONException {
        int hour = obj.getInt("hour");
        int minute = obj.getInt("minute");
        EMSilentModeTime modeTime = new EMSilentModeTime(hour, minute);
        return modeTime;
    }

    static Map<String, Object> toJson(EMSilentModeTime modeTime) {
        Map<String, Object> data = new HashMap<>();
        data.put("hour", modeTime.getHour());
        data.put("minute", modeTime.getMinute());
        return data;
    }
}

class ExtSdkSilentModeResultHelper {
    static Map<String, Object> toJson(EMSilentModeResult modeResult) {
        Map<String, Object> data = new HashMap<>();
        if (modeResult.getExpireTimestamp() != 0) {
            data.put("expireTimestamp", modeResult.getExpireTimestamp());
        }
        if (modeResult.getConversationId() != null) {
            data.put("conversationId", modeResult.getConversationId());
        }
        if (modeResult.getConversationType() != null) {
            data.put("conversationType", ExtSdkConversationHelper.typeToInt(modeResult.getConversationType()));
        }
        if (modeResult.getSilentModeStartTime() != null) {
            data.put("startTime", ExtSdkSilentModeTimeHelper.toJson(modeResult.getSilentModeStartTime()));
        }
        if (modeResult.getSilentModeEndTime() != null) {
            data.put("endTime", ExtSdkSilentModeTimeHelper.toJson(modeResult.getSilentModeEndTime()));
        }
        if (modeResult.getRemindType() != null) {
            data.put("remindType", ExtSdkSilentModeParamHelper.pushRemindTypeToInt(modeResult.getRemindType()));
        }

        return data;
    }
}

class ExtSdkFetchMessageOptionHelper {
    static EMFetchMessageOption fromJson(JSONObject json) throws JSONException {
        EMFetchMessageOption options = new EMFetchMessageOption();
        if (json.getInt("direction") == 0) {
            options.setDirection(EMConversation.EMSearchDirection.UP);
        } else {
            options.setDirection(EMConversation.EMSearchDirection.DOWN);
        }
        options.setIsSave(json.getBoolean("needSave"));
        options.setStartTime(json.getLong("startTs"));
        options.setEndTime(json.getLong("endTs"));
        if (json.has("from")) {
            options.setFrom(json.getString("from"));
        }
        if (json.has("msgTypes")) {
            List<EMMessage.Type> list = new ArrayList<>();
            JSONArray array = json.getJSONArray("msgTypes");
            for (int i = 0; i < array.length(); i++) {
                String type = array.getString(i);
                switch (type) {
                case "txt": {
                    list.add(Type.TXT);
                } break;
                case "img": {
                    list.add(Type.IMAGE);
                } break;
                case "loc": {
                    list.add(Type.LOCATION);
                } break;
                case "video": {
                    list.add(Type.VIDEO);
                } break;
                case "voice": {
                    list.add(Type.VOICE);
                } break;
                case "file": {
                    list.add(Type.FILE);
                } break;
                case "cmd": {
                    list.add(Type.CMD);
                } break;
                case "custom": {
                    list.add(Type.CUSTOM);
                } break;
                case "combine": {
                    list.add(Type.COMBINE);
                } break;
                }
            }
            if (list.size() > 0) {
                options.setMsgTypes(list);
            }
        }

        return options;
    }
}

class ExtSdkContactHelper {
    static EMContact fromJson(JSONObject json) throws JSONException {
        String userId = json.optString("userId");
        String remark = json.optString("remark");
        EMContact contact = new EMContact(userId);
        if (remark.length() != 0) {
            contact.setRemark(remark);
        }
        return contact;
    }

    static Map<String, Object> toJson(EMContact contact) {
        Map<String, Object> data = new HashMap<>();
        data.put("userId", contact.getUsername());
        String remark = contact.getRemark();
        if (remark != null) {
            data.put("remark", remark);
        }
        return data;
    }
}

// 2024-04-16 4.5.0
class ExtSdkMessagePinInfoHelper {
    static Map<String, Object> toJson(EMMessagePinInfo info) {
        Map<String, Object> data = new HashMap<>();
        data.put("pinTime", info.pinTime());
        data.put("operatorId", info.operatorId());
        return data;
    }
}

class ExtSdkConversationFilterHelper {
    static EMConversationFilter fromJson(JSONObject json) throws JSONException {
        EMConversation.EMMarkType markType = EMConversation.EMMarkType.values()[json.getInt("mark")];
        int pageSize = json.getInt("pageSize");
        EMConversationFilter filter = new EMConversationFilter(markType, pageSize);
        return filter;
    }

    static String cursor(JSONObject json) throws JSONException {
        if (json.has("cursor")) {
            return json.getString("cursor");
        } else {
            return null;
        }
    }

    static Boolean pinned(JSONObject json) throws JSONException {
        if (json.has("pinned")) {
            return json.getBoolean("pinned");
        } else {
            return false;
        }
    }

    static Boolean hasMark(JSONObject json) throws JSONException { return json.has("mark"); }

    static int pageSize(JSONObject json) throws JSONException {
        if (json.has("pageSize")) {
            return json.getInt("pageSize");
        } else {
            return 0;
        }
    }
}
