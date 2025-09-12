package com.easemob.ext_sdk.dispatch;

import static com.hyphenate.EMError.GENERAL_ERROR;

import android.text.TextUtils;
import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMConversation;
import com.hyphenate.chat.EMMessage;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkConversationWrapper extends ExtSdkWrapper {

    public static class SingleHolder {
        static ExtSdkConversationWrapper instance = new ExtSdkConversationWrapper();
    }

    public static ExtSdkConversationWrapper getInstance() { return ExtSdkConversationWrapper.SingleHolder.instance; }

    ExtSdkConversationWrapper() {}

    public void getUnreadMsgCount(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        onSuccess(result, channelName, conversation.getUnreadMsgCount());
    }

    public void getMsgCount(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        onSuccess(result, channelName, conversation.getAllMsgCount());
    }

    public void markAllMessagesAsRead(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        EMConversation conversation = this.getConversation(params);
        conversation.markAllMessagesAsRead();
        onSuccess(result, channelName, null);
    }

    public void markMessageAsRead(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        String msg_id = params.getString("msg_id");
        conversation.markMessageAsRead(msg_id);
        onSuccess(result, channelName, null);
    }

    public void syncConversationExt(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        JSONObject ext = params.getJSONObject("ext");
        String jsonStr = "";
        if (ext.length() != 0) {
            jsonStr = ext.toString();
        }
        conversation.setExtField(jsonStr);
        onSuccess(result, channelName, null);
    }

    public void removeMessage(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        String msg_id = params.getString("msg_id");
        conversation.removeMessage(msg_id);
        onSuccess(result, channelName, null);
    }

    public void getLatestMessage(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        EMMessage msg = conversation.getLastMessage();
        onSuccess(result, channelName, ExtSdkMessageHelper.toJson(msg));
    }

    public void getLatestMessageFromOthers(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        EMConversation conversation = this.getConversation(params);
        EMMessage msg = conversation.getLatestMessageFromOthers();
        onSuccess(result, channelName, ExtSdkMessageHelper.toJson(msg));
    }

    public void clearAllMessages(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        conversation.clearAllMessages();
        onSuccess(result, channelName, null);
    }

    public void deleteMessagesWithTimestamp(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        long startTs = params.getLong("startTs");
        long endTs = params.getLong("endTs");
        EMConversation conversation = this.getConversation(params);
        boolean ret = conversation.removeMessages(startTs, endTs);
        if (ret == true) {
            onSuccess(result, channelName, null);
        } else {
            onError(result, GENERAL_ERROR, "remove local message is failed.");
        }
    }

    public void insertMessage(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        //        EMConversation conversation = this.getConversation(params);
        JSONObject msg = params.getJSONObject("msg");
        EMMessage message = ExtSdkMessageHelper.fromJson(msg);
        if (message != null) {
            final EMConversation conversation = this.getConversationFromMessage(message);
            conversation.insertMessage(message);
        }
        onSuccess(result, channelName, null);
    }

    public void appendMessage(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        //        EMConversation conversation = this.getConversation(params);
        JSONObject msg = params.getJSONObject("msg");
        EMMessage message = ExtSdkMessageHelper.fromJson(msg);
        if (message != null) {
            final EMConversation conversation = this.getConversationFromMessage(message);
            conversation.appendMessage(message);
        }
        onSuccess(result, channelName, null);
    }

    public void updateConversationMessage(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        EMConversation conversation = this.getConversation(params);
        JSONObject msg = params.getJSONObject("msg");
        EMMessage message = ExtSdkMessageHelper.fromJson(msg);
        EMMessage dbMsg = EMClient.getInstance().chatManager().getMessage(message.getMsgId());
        if (ExtSdkWrapper.checkMessageParams(dbMsg, channelName, result)) {
            return;
        }
        this.mergeMessage(message, dbMsg);
        conversation.updateMessage(dbMsg);
        onSuccess(result, channelName, null);
    }

    public void loadMsgWithId(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String msgId = params.getString("msg_id");
        EMMessage msg = EMClient.getInstance().chatManager().getMessage(msgId);
        if (ExtSdkWrapper.getMessageParams(msg, channelName, result)) {
            return;
        }
        onSuccess(result, channelName, ExtSdkMessageHelper.toJson(msg));
    }

    public void loadMsgWithStartId(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        String startId = params.getString("startId");
        int pageSize = params.getInt("count");
        EMConversation.EMSearchDirection direction = searchDirectionFromString(params.getString("direction"));
        List<EMMessage> msgList = conversation.loadMoreMsgFromDB(startId, pageSize, direction);
        List<Map> messages = new ArrayList<>();
        for (EMMessage msg : msgList) {
            messages.add(ExtSdkMessageHelper.toJson(msg));
        }
        onSuccess(result, channelName, messages);
    }

    public void loadMsgWithKeywords(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        String keywords = params.getString("keywords");
        String sender = null;
        if (params.has("sender")) {
            sender = params.getString("sender");
        }
        final String name = sender;
        int count = params.getInt("count");
        long timestamp = params.getLong("timestamp");
        EMConversation.EMSearchDirection direction = searchDirectionFromString(params.getString("direction"));
        EMConversation.EMMessageSearchScope scope;
        if (params.has("searchScope")) {
            scope = EMConversation.EMMessageSearchScope.values()[params.getInt("searchScope")];
        } else {
            scope = EMConversation.EMMessageSearchScope.ALL;
        }
        List<EMMessage> msgList = conversation.searchMsgFromDB(keywords, timestamp, count, name, direction, scope);
        List<Map> messages = new ArrayList<>();
        for (EMMessage msg : msgList) {
            messages.add(ExtSdkMessageHelper.toJson(msg));
        }
        onSuccess(result, channelName, messages);
    }

    public void loadMsgWithMsgType(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        long timestamp = params.getLong("timestamp");
        String sender = params.getString("sender");
        int count = params.getInt("count");
        EMConversation.EMSearchDirection direction = searchDirectionFromString(params.getString("direction"));
        String typeStr = params.getString("msg_type");
        EMMessage.Type type = EMMessage.Type.TXT;
        switch (typeStr) {
        case "txt":
            type = EMMessage.Type.TXT;
            break;
        case "loc":
            type = EMMessage.Type.LOCATION;
            break;
        case "cmd":
            type = EMMessage.Type.CMD;
            break;
        case "custom":
            type = EMMessage.Type.CUSTOM;
            break;
        case "file":
            type = EMMessage.Type.FILE;
            break;
        case "img":
            type = EMMessage.Type.IMAGE;
            break;
        case "video":
            type = EMMessage.Type.VIDEO;
            break;
        case "voice":
            type = EMMessage.Type.VOICE;
            break;
        case "combine":
            type = EMMessage.Type.COMBINE;
            break;
        }

        EMMessage.Type finalType = type;
        List<EMMessage> msgList = conversation.searchMsgFromDB(finalType, timestamp, count, sender, direction);
        List<Map> messages = new ArrayList<>();
        for (EMMessage msg : msgList) {
            messages.add(ExtSdkMessageHelper.toJson(msg));
        }
        onSuccess(result, channelName, messages);
    }

    public void loadMsgWithTime(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        long startTime = params.getLong("startTime");
        long endTime = params.getLong("endTime");
        int count = params.getInt("count");
        List<EMMessage> msgList = conversation.searchMsgFromDB(startTime, endTime, count);
        List<Map> messages = new ArrayList<>();
        for (EMMessage msg : msgList) {
            messages.add(ExtSdkMessageHelper.toJson(msg));
        }
        onSuccess(result, channelName, messages);
    }

    public void pinnedMessages(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMConversation conversation = this.getConversation(params);
        List<EMMessage> msgList = conversation.pinnedMessages();
        List<Map> messages = new ArrayList<>();
        for (EMMessage msg : msgList) {
            messages.add(ExtSdkMessageHelper.toJson(msg));
        }
        onSuccess(result, channelName, messages);
    }

    private EMConversation.EMSearchDirection searchDirectionFromString(String direction) {
        return TextUtils.equals(direction, "up") ? EMConversation.EMSearchDirection.UP
                                                 : EMConversation.EMSearchDirection.DOWN;
    }
}
