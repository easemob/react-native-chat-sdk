package com.easemob.ext_sdk.dispatch;

import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.hyphenate.EMCallBack;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMConversation;
import com.hyphenate.chat.EMPushConfigs;
import com.hyphenate.chat.EMPushManager;
import com.hyphenate.chat.EMSilentModeParam;
import com.hyphenate.chat.EMSilentModeResult;
import com.hyphenate.exceptions.HyphenateException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkPushManagerWrapper extends ExtSdkWrapper {

    public static class SingleHolder {
        static ExtSdkPushManagerWrapper instance = new ExtSdkPushManagerWrapper();
    }

    public static ExtSdkPushManagerWrapper getInstance() { return ExtSdkPushManagerWrapper.SingleHolder.instance; }

    public void getImPushConfig(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMPushConfigs configs = EMClient.getInstance().pushManager().getPushConfigs();
        onSuccess(result, channelName, ExtSdkPushConfigsHelper.toJson(configs));
    }

    public void getImPushConfigFromServer(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        try {
            EMPushConfigs configs = EMClient.getInstance().pushManager().getPushConfigsFromServer();
            onSuccess(result, channelName, ExtSdkPushConfigsHelper.toJson(configs));
        } catch (HyphenateException e) {
            ExtSdkWrapper.onError(result, e, null);
        }
    }

    public void updatePushNickname(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String nickname = params.getString("nickname");
        try {
            EMClient.getInstance().pushManager().updatePushNickname(nickname);
            onSuccess(result, channelName, nickname);
        } catch (HyphenateException e) {
            ExtSdkWrapper.onError(result, e, null);
        }
    }

    public void enableOfflinePush(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        try {
            EMClient.getInstance().pushManager().enableOfflinePush();
            onSuccess(result, channelName, null);
        } catch (HyphenateException e) {
            ExtSdkWrapper.onError(result, e, null);
        }
    }

    public void disableOfflinePush(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        int startTime = params.getInt("start");
        int endTime = params.getInt("end");
        try {
            EMClient.getInstance().pushManager().disableOfflinePush(startTime, endTime);
            onSuccess(result, channelName, null);
        } catch (HyphenateException e) {
            ExtSdkWrapper.onError(result, e, null);
        }
    }

    public void getNoPushGroups(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        List<String> groups = EMClient.getInstance().pushManager().getNoPushGroups();
        onSuccess(result, channelName, groups);
    }

    public void getNoPushUsers(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        List<String> list = EMClient.getInstance().pushManager().getNoPushUsers();
        onSuccess(result, channelName, list);
    }

    public void updateImPushStyle(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMPushManager.DisplayStyle style = params.getInt("pushStyle") == 0 ? EMPushManager.DisplayStyle.SimpleBanner
                                                                           : EMPushManager.DisplayStyle.MessageSummary;
        EMClient.getInstance().pushManager().asyncUpdatePushDisplayStyle(style, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, true);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }
        });
    }

    public void updateGroupPushService(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        JSONArray groupIds = params.getJSONArray("group_ids");
        boolean noPush = params.getBoolean("noPush");

        List<String> groupList = new ArrayList<>();
        for (int i = 0; i < groupIds.length(); i++) {
            String groupId = groupIds.getString(i);
            groupList.add(groupId);
        }
        try {
            EMClient.getInstance().pushManager().updatePushServiceForGroup(groupList, noPush);
            onSuccess(result, channelName, null);
        } catch (HyphenateException e) {
            ExtSdkWrapper.onError(result, e, null);
        }
    }

    public void updateUserPushService(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        JSONArray groupIds = params.getJSONArray("user_ids");
        boolean noPush = params.getBoolean("noPush");

        List<String> userList = new ArrayList<>();
        for (int i = 0; i < groupIds.length(); i++) {
            String userId = groupIds.getString(i);
            userList.add(userId);
        }
        try {
            EMClient.getInstance().pushManager().updatePushServiceForUsers(userList, noPush);
            onSuccess(result, channelName, null);
        } catch (HyphenateException e) {
            ExtSdkWrapper.onError(result, e, null);
        }
    }

    public void updateHMSPushToken(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String token = params.getString("token");
        EMClient.getInstance().sendHMSPushTokenToServer(token);
        onSuccess(result, channelName, token);
    }

    public void updateFCMPushToken(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String token = params.getString("token");
        EMClient.getInstance().sendFCMTokenToServer(token);
        onSuccess(result, channelName, token);
    }

    public void reportPushAction(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        // TODO:
    }

    public void setConversationSilentMode(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        String conversationId = params.getString("conversationId");
        EMConversation.EMConversationType type =
            ExtSdkConversationHelper.typeFromInt(params.getInt("conversationType"));
        EMSilentModeParam param = ExtSdkSilentModeParamHelper.fromJson(params.getJSONObject("param"));
        EMClient.getInstance().pushManager().setSilentModeForConversation(
            conversationId, type, param, new EMValueCallBack<EMSilentModeResult>() {
                @Override
                public void onSuccess(EMSilentModeResult value) {
                    ExtSdkWrapper.onSuccess(result, channelName, null);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void removeConversationSilentMode(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        String conversationId = params.getString("conversationId");
        EMConversation.EMConversationType type =
            ExtSdkConversationHelper.typeFromInt(params.getInt("conversationType"));
        EMClient.getInstance().pushManager().clearRemindTypeForConversation(conversationId, type, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }
        });
    }

    public void fetchConversationSilentMode(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        String conversationId = params.getString("conversationId");
        EMConversation.EMConversationType type =
            ExtSdkConversationHelper.typeFromInt(params.getInt("conversationType"));
        EMClient.getInstance().pushManager().getSilentModeForConversation(
            conversationId, type, new EMValueCallBack<EMSilentModeResult>() {
                @Override
                public void onSuccess(EMSilentModeResult value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkSilentModeResultHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void setSilentModeForAll(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMSilentModeParam param = ExtSdkSilentModeParamHelper.fromJson(params.getJSONObject("param"));
        EMClient.getInstance().pushManager().setSilentModeForAll(param, new EMValueCallBack<EMSilentModeResult>() {
            @Override
            public void onSuccess(EMSilentModeResult value) {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void fetchSilentModeForAll(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        EMClient.getInstance().pushManager().getSilentModeForAll(new EMValueCallBack<EMSilentModeResult>() {
            @Override
            public void onSuccess(EMSilentModeResult value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkSilentModeResultHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void fetchSilentModeForConversations(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        ArrayList<EMConversation> list = new ArrayList<>();
        JSONArray convs = params.getJSONArray("convs");
        for (int i = 0; i < convs.length(); ++i) {
            EMConversation conversation = this.getConversation((JSONObject)convs.get(i));
            list.add(conversation);
        }

        EMClient.getInstance().pushManager().getSilentModeForConversations(
            list, new EMValueCallBack<Map<String, EMSilentModeResult>>() {
                @Override
                public void onSuccess(Map<String, EMSilentModeResult> value) {
                    Map<String, Map> valueJson = new HashMap<>();
                    for (Map.Entry<String, EMSilentModeResult> entry : value.entrySet()) {
                        valueJson.put(entry.getKey(), ExtSdkSilentModeResultHelper.toJson(entry.getValue()));
                    }
                    ExtSdkWrapper.onSuccess(result, channelName, valueJson);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void setPreferredNotificationLanguage(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        String code = params.getString("code");
        EMClient.getInstance().pushManager().setPreferredNotificationLanguage(code, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }
        });
    }

    public void fetchPreferredNotificationLanguage(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        EMClient.getInstance().pushManager().getPreferredNotificationLanguage(new EMValueCallBack<String>() {
            @Override
            public void onSuccess(String value) {
                ExtSdkWrapper.onSuccess(result, channelName, value);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void setPushTemplate(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String templateName = params.getString("templateName");
        EMClient.getInstance().pushManager().setPushTemplate(templateName, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int i, String s) {
                ExtSdkWrapper.onError(result, i, s);
            }
        });
    }
    public void getPushTemplate(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMClient.getInstance().pushManager().getPushTemplate(new EMValueCallBack<String>() {
            @Override
            public void onSuccess(String s) {
                Map<String, String> ret = new HashMap<>();
                ret.put("templateName", s);
                ExtSdkWrapper.onSuccess(result, channelName, ret);
            }

            @Override
            public void onError(int i, String s) {
                ExtSdkWrapper.onError(result, i, s);
            }
        });
    }
}
