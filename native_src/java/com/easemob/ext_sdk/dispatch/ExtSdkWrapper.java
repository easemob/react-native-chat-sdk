package com.easemob.ext_sdk.dispatch;

import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMCmdMessageBody;
import com.hyphenate.chat.EMCombineMessageBody;
import com.hyphenate.chat.EMConversation;
import com.hyphenate.chat.EMCustomMessageBody;
import com.hyphenate.chat.EMFileMessageBody;
import com.hyphenate.chat.EMImageMessageBody;
import com.hyphenate.chat.EMLocationMessageBody;
import com.hyphenate.chat.EMMessage;
import com.hyphenate.chat.EMMessageBody;
import com.hyphenate.chat.EMNormalFileMessageBody;
import com.hyphenate.chat.EMTextMessageBody;
import com.hyphenate.chat.EMVideoMessageBody;
import com.hyphenate.chat.EMVoiceMessageBody;
import com.hyphenate.exceptions.HyphenateException;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkWrapper {

    protected static void onSuccess(@NonNull ExtSdkCallback callback, @NonNull String methodType,
                                    @Nullable Object object) {
        Log.d(TAG, "onSuccess: " + methodType + ": " + (object != null ? object : ""));
        Map<String, Object> data = new HashMap<>();
        if (object != null) {
            data.put(methodType, object);
        }
        callback.success(data);
    }

    public static void onError(@NonNull ExtSdkCallback callback, @NonNull Object e, @Nullable Object ext) {
        Log.d(TAG, "onError: " + e + ": " + (ext != null ? ext : ""));
        Map<String, Object> data = new HashMap<>();
        if (e instanceof HyphenateException) {
            data.put("error", ExtSdkExceptionHelper.toJson((HyphenateException)e));
        } else if (e instanceof Integer) {
            data.put("error", ExtSdkErrorHelper.toJson((int)e, ext != null ? ext.toString() : ""));
        } else if (e instanceof JSONException) {
            data.put("error", ExtSdkJSONExceptionHelper.toJson((JSONException)e));
        } else {
            data.put("error", "no implement");
        }
        callback.success(data);
    }

    protected static void onReceive(@NonNull String methodType, @Nullable Object data) {
        Log.d(TAG, "onReceive: " + methodType + ": " + (data != null ? data : ""));
        ExtSdkDispatch.getInstance().onReceive(methodType, data);
    }

    protected void mergeMessageBody(EMMessageBody msgBody, EMMessage dbMsg) throws JSONException {
        if (dbMsg.getType() == EMMessage.Type.TXT) {
            EMTextMessageBody text = (EMTextMessageBody)msgBody;
            EMTextMessageBody dbtext = (EMTextMessageBody)dbMsg.getBody();
            dbtext.setMessage(text.getMessage());
            dbtext.setTargetLanguages(text.getTargetLanguages());
            dbMsg.setBody(dbtext);
        } else if (dbMsg.getType() == EMMessage.Type.CMD) {
            EMCmdMessageBody cmd = (EMCmdMessageBody)msgBody;
            EMCmdMessageBody dbcmd = (EMCmdMessageBody)dbMsg.getBody();
            dbcmd.deliverOnlineOnly(cmd.isDeliverOnlineOnly());
            dbMsg.setBody(dbcmd);
        } else if (dbMsg.getType() == EMMessage.Type.IMAGE) {
            EMImageMessageBody image = (EMImageMessageBody)msgBody;
            EMImageMessageBody dbimage = (EMImageMessageBody)dbMsg.getBody();
            dbimage.setFileName(image.getFileName());
            dbimage.setLocalUrl(image.getLocalUrl());
            dbimage.setRemoteUrl(image.getRemoteUrl());
            dbimage.setSecret(image.getSecret());
            dbimage.setFileLength(image.getFileSize());
            dbimage.setDownloadStatus(image.downloadStatus());
            dbimage.setSendOriginalImage(image.isSendOriginalImage());
            dbimage.setThumbnailLocalPath(image.thumbnailLocalPath());
            dbimage.setThumbnailDownloadStatus(image.thumbnailDownloadStatus());
            dbimage.setThumbnailUrl(image.getThumbnailUrl());
            //        dbimage.setThumbnailSize(image.getWidth(), image.getHeight());
            dbMsg.setBody(dbimage);
        } else if (dbMsg.getType() == EMMessage.Type.VOICE) {
            EMVoiceMessageBody voice = (EMVoiceMessageBody)msgBody;
            EMVoiceMessageBody dbvoice = (EMVoiceMessageBody)dbMsg.getBody();
            dbvoice.setFileName(voice.getFileName());
            dbvoice.setLocalUrl(voice.getLocalUrl());
            dbvoice.setRemoteUrl(voice.getRemoteUrl());
            dbvoice.setSecret(voice.getSecret());
            dbvoice.setFileLength(voice.getFileSize());
            dbvoice.setDownloadStatus(voice.downloadStatus());
            dbMsg.setBody(dbvoice);
        } else if (dbMsg.getType() == EMMessage.Type.VIDEO) {
            EMVideoMessageBody video = (EMVideoMessageBody)msgBody;
            EMVideoMessageBody dbvideo = (EMVideoMessageBody)dbMsg.getBody();
            dbvideo.setFileName(video.getFileName());
            dbvideo.setLocalUrl(video.getLocalUrl());
            dbvideo.setRemoteUrl(video.getRemoteUrl());
            dbvideo.setSecret(video.getSecret());
            dbvideo.setDownloadStatus(video.downloadStatus());
            dbvideo.setVideoFileLength(video.getVideoFileLength());
            dbvideo.setThumbnailUrl(video.getThumbnailUrl());
            dbvideo.setThumbnailSize(video.getThumbnailWidth(), video.getThumbnailHeight());
            dbvideo.setLocalThumb(video.getLocalThumb());
            dbvideo.setThumbnailSecret(video.getThumbnailSecret());
            dbvideo.setThumbnailDownloadStatus(video.thumbnailDownloadStatus());
            dbMsg.setBody(video);
        } else if (dbMsg.getType() == EMMessage.Type.LOCATION) {
            EMLocationMessageBody location = (EMLocationMessageBody)msgBody;
            dbMsg.setBody(location);
        } else if (dbMsg.getType() == EMMessage.Type.FILE) {
            EMNormalFileMessageBody file = (EMNormalFileMessageBody)msgBody;
            EMFileMessageBody dbfile = (EMFileMessageBody)dbMsg.getBody();
            dbfile.setFileName(file.getFileName());
            dbfile.setLocalUrl(file.getLocalUrl());
            dbfile.setRemoteUrl(file.getRemoteUrl());
            dbfile.setSecret(file.getSecret());
            dbfile.setDownloadStatus(file.downloadStatus());
            dbfile.setFileLength(file.getFileSize());
            dbMsg.setBody(dbfile);
        } else if (dbMsg.getType() == EMMessage.Type.CUSTOM) {
            EMCustomMessageBody cutom = (EMCustomMessageBody)msgBody;
            dbMsg.setBody(cutom);
        } else if (dbMsg.getType() == EMMessage.Type.COMBINE) {
            EMCombineMessageBody combine = (EMCombineMessageBody)msgBody;
            dbMsg.setBody(combine);
        }
    }

    protected void mergeMessage(EMMessage msg, EMMessage dbMsg) throws JSONException {
        dbMsg.setStatus(msg.status());
        //      dbMsg.setMsgTime(msg.getMsgTime());
        dbMsg.setLocalTime(msg.localTime());
        dbMsg.setIsNeedGroupAck(msg.isNeedGroupAck());
        //      dbMsg.setGroupAckCount(msg.groupAckCount());
        dbMsg.setIsChatThreadMessage(msg.isChatThreadMessage());
        //      dbMsg.setFrom(msg.getFrom());
        //      dbMsg.setTo(msg.getTo());
        //      dbMsg.setMsgId(msg.getMsgId());
        //      dbMsg.setChatType(msg.getChatType());
        //      dbMsg.setAcked(msg.isAcked());
        //      dbMsg.setDelivered(msg.isDelivered());
        dbMsg.setUnread(msg.isUnread());
        dbMsg.setListened(msg.isListened());
        //      dbMsg.setDirection(msg.direct());
        dbMsg.setReceiverList(msg.receiverList());
        //      dbMsg.setPriority();
        Map<String, Object> list = msg.getAttributes();
        if (list.size() > 0) {
            JSONObject jsonParams = new JSONObject(list);
            for (Map.Entry<String, Object> entry : list.entrySet()) {
                String key = entry.getKey();
                Object result = entry.getValue();
                if (result.getClass().getSimpleName().equals("Integer")) {
                    dbMsg.setAttribute(key, (Integer)result);
                } else if (result.getClass().getSimpleName().equals("Boolean")) {
                    dbMsg.setAttribute(key, (Boolean)result);
                } else if (result.getClass().getSimpleName().equals("Long")) {
                    dbMsg.setAttribute(key, (Long)result);
                } else if (result.getClass().getSimpleName().equals("Double") ||
                           result.getClass().getSimpleName().equals("Float")) {
                    dbMsg.setAttribute(key, (Double)result);
                } else if (result.getClass().getSimpleName().equals("JSONObject")) {
                    dbMsg.setAttribute(key, (JSONObject)result);
                } else if (result.getClass().getSimpleName().equals("JSONArray")) {
                    dbMsg.setAttribute(key, (JSONArray)result);
                } else {
                    dbMsg.setAttribute(key, jsonParams.getString(key));
                }
            }
        }

        this.mergeMessageBody(msg.getBody(), dbMsg);
    }

    protected EMConversation getConversation(JSONObject params) throws JSONException {
        String convId = params.getString("convId");
        EMConversation.EMConversationType convType = ExtSdkConversationHelper.typeFromInt(params.getInt("convType"));
        boolean isChatThread = params.optBoolean("isChatThread", false);
        boolean createIfNotExists = params.optBoolean("createIfNeed", true);
        return EMClient.getInstance().chatManager().getConversation(convId, convType, createIfNotExists, isChatThread);
    }

    protected EMConversation getConversationFromMessage(EMMessage message) {
        boolean createConv = message.getType() != EMMessage.Type.CMD;
        return EMClient.getInstance().chatManager().getConversation(
            message.conversationId(), EMConversation.msgType2ConversationType(message.getTo(), message.getChatType()),
            createConv, message.isChatThreadMessage());
    }

    protected static boolean checkMessageParams(EMMessage msg, String channelName, ExtSdkCallback result)
        throws JSONException {
        if (msg == null) {
            ExtSdkWrapper.onError(result, 1, "The message does not exist.");
            return true;
        }
        return false;
    }

    protected static boolean getMessageParams(EMMessage msg, String channelName, ExtSdkCallback result)
        throws JSONException {
        if (msg == null) {
            ExtSdkWrapper.onSuccess(result, channelName, null);
            return true;
        }
        return false;
    }

    private static final String TAG = "EMWrapper";
}
