package com.easemob.ext_sdk.dispatch;

import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMMessage;
import com.hyphenate.chat.EMMessageReaction;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
// import com.hyphenate.chat.EMMessageReaction;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkChatMessageWrapper {

    public static class SingleHolder {
        static ExtSdkChatMessageWrapper instance = new ExtSdkChatMessageWrapper();
    }

    public static ExtSdkChatMessageWrapper getInstance() { return ExtSdkChatMessageWrapper.SingleHolder.instance; }

    ExtSdkChatMessageWrapper() { registerEaseListener(); }

    private void registerEaseListener() {}

    public void getReactionList(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String msgId = param.getString("msgId");
        EMMessage msg = EMClient.getInstance().chatManager().getMessage(msgId);
        if (ExtSdkWrapper.getMessageParams(msg, channelName, result)) {
            return;
        }
        ArrayList<Map<String, Object>> list = new ArrayList<>();
        if (msg != null) {
            List<EMMessageReaction> reactions = msg.getMessageReaction();
            if (reactions != null) {
                for (int i = 0; i < reactions.size(); i++) {
                    list.add(ExtSdkMessageReactionHelper.toJson(reactions.get(i)));
                }
            }
        }
        ExtSdkWrapper.onSuccess(result, channelName, list);
    }

    public void groupAckCount(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String msgId = param.getString("msgId");
        EMMessage msg = EMClient.getInstance().chatManager().getMessage(msgId);
        if (ExtSdkWrapper.getMessageParams(msg, channelName, result)) {
            return;
        }
        ExtSdkWrapper.onSuccess(result, channelName, msg.groupAckCount());
    }

    public void getPinInfo(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String msgId = params.getString("msgId");
        EMMessage msg = EMClient.getInstance().chatManager().getMessage(msgId);
        if (ExtSdkWrapper.getMessageParams(msg, channelName, result)) {
            return;
        }
        ExtSdkWrapper.onSuccess(result, channelName,
                                msg.pinnedInfo() != null ? ExtSdkMessagePinInfoHelper.toJson(msg.pinnedInfo()) : null);
    }
}
