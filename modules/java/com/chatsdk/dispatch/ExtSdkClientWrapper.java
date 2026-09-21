package com.chatsdk.dispatch;

import static com.chatsdk.common.ExtSdkMethodType.onMultiDeviceEventContact;
import static com.chatsdk.common.ExtSdkMethodType.onMultiDeviceEventConversation;
import static com.chatsdk.common.ExtSdkMethodType.onMultiDeviceEventGroup;
import static com.chatsdk.common.ExtSdkMethodType.onMultiDeviceEventRemoveMessage;
import static com.chatsdk.common.ExtSdkMethodType.onMultiDeviceEventThread;
import static com.chatsdk.dispatch.InternalConvertHelper.conversationTypeToInt;

import com.chatsdk.common.ExtSdkCallback;
import com.chatsdk.common.ExtSdkContext;
import com.chatsdk.common.ExtSdkMethodType;
import com.chatsdk.common.ExtSdkThreadUtil;
import com.hyphenate.EMCallBack;
import com.hyphenate.EMConnectionListener;
import com.hyphenate.EMError;
import com.hyphenate.EMMultiDeviceListener;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMConversation;
import com.hyphenate.chat.EMDeviceInfo;
import com.hyphenate.chat.EMLoginExtensionInfo;
import com.hyphenate.chat.EMOptions;
import com.hyphenate.chat.EMRTCTokenInfo;
import com.hyphenate.exceptions.HyphenateException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkClientWrapper extends ExtSdkWrapper {

    public static class SingleHolder {
        static ExtSdkClientWrapper instance = new ExtSdkClientWrapper();
    }

    public static ExtSdkClientWrapper getInstance() { return ExtSdkClientWrapper.SingleHolder.instance; }

    public void getToken(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        onSuccess(result, channelName, EMClient.getInstance().getAccessToken());
    }

    public void login(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String username = param.getString("username");
        String token = param.getString("pwdOrToken");

        EMClient.getInstance().loginWithToken(username, token, new EMCallBack() {
            @Override
            public void onSuccess() {
                Map<String, String> param = new HashMap<>();
                param.put("username", EMClient.getInstance().getCurrentUser());
                param.put("token", EMClient.getInstance().getAccessToken());
                ExtSdkWrapper.onSuccess(result, channelName, param);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {
                // todo: 原来就没有写
            }
        });
    }

    public void logout(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        boolean unbindToken = param.getBoolean("unbindToken");
        EMClient.getInstance().logout(unbindToken, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, true);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void changeAppKey(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String appKey = param.getString("appKey");
        try {
            EMClient.getInstance().changeAppkey(appKey);
            onSuccess(result, channelName, true);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void changeAppId(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String appId = param.getString("appId");
        try {
            EMClient.getInstance().changeAppId(appId);
            onSuccess(result, channelName, true);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void getCurrentUser(JSONObject param, String channelName, ExtSdkCallback result) {
        onSuccess(result, channelName, EMClient.getInstance().getCurrentUser());
    }

    public void uploadLog(JSONObject param, String channelName, ExtSdkCallback result) {
        EMClient.getInstance().uploadLog(new EMCallBack() {
            @Override
            public void onSuccess() {}

            @Override
            public void onError(int code, String error) {}

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void compressLogs(JSONObject param, String channelName, ExtSdkCallback result) {
        try {
            String path = EMClient.getInstance().compressLogs();
            onSuccess(result, channelName, path);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void kickDevice(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {

        String username = param.getString("username");
        String token = param.getString("token");
        String resource = param.getString("resource");

        try {
            EMClient.getInstance().kickDeviceWithToken(username, token, resource);
            onSuccess(result, channelName, true);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void kickAllDevices(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String username = param.getString("username");
        String token = param.getString("token");

        try {
            EMClient.getInstance().kickAllDevicesWithToken(username, token);
            onSuccess(result, channelName, true);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void getLoggedInDevicesFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String username = param.getString("username");
        String token = param.getString("token");

        EMClient.getInstance().fetchLoggedInDevicesFromServerWithToken(
            username, token, new EMValueCallBack<List<EMDeviceInfo>>() {
                @Override
                public void onSuccess(List<EMDeviceInfo> value) {
                    List<Map> jsonList = new ArrayList<>();
                    for (EMDeviceInfo info : value) {
                        jsonList.add(ExtSdkDeviceInfoHelper.toJson(info));
                    }
                    ExtSdkWrapper.onSuccess(result, channelName, jsonList);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void init(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        EMOptions options = ExtSdkOptionsHelper.fromJson(param, ExtSdkContext.context);
        options.setSDKPlatform(EMOptions.EMSDKPlatform.EMSDKPlatformReactNative);
        boolean debugModel = param.getBoolean("debugModel");

        ExtSdkThreadUtil.mainThreadExecute(() -> {
            EMClient.getInstance().init(ExtSdkContext.context, options);
            EMClient.getInstance().setDebugMode(debugModel);

            addEMListener();

            ExtSdkChatManagerWrapper.getInstance();
            ExtSdkChatRoomManagerWrapper.getInstance();
            ExtSdkContactManagerWrapper.getInstance();
            ExtSdkConversationWrapper.getInstance();
            ExtSdkGroupManagerWrapper.getInstance();
            ExtSdkPresenceManagerWrapper.getInstance();
            ExtSdkPushManagerWrapper.getInstance();
            ExtSdkUserInfoManagerWrapper.getInstance();
            ExtSdkChatThreadManagerWrapper.getInstance();

            ExtSdkThreadUtil.asyncExecute(() -> { onSuccess(result, channelName, null); });
        });
    }

    public void isConnected(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        onSuccess(result, channelName, EMClient.getInstance().isConnected());
    }

    public void renewToken(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String token = param.getString("token");
        EMClient.getInstance().renewToken(token, new EMCallBack() {
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

    public void updatePushConfig(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        JSONObject config = param.getJSONObject("config");
        String deviceId = config.getString("deviceId");
        String deviceToken = config.getString("deviceToken");
        EMClient.getInstance().pushManager().bindDeviceToken(deviceId, deviceToken, new EMCallBack() {
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

    public void getRTCTokenInfoWithChannelName(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String c = param.getString("channelName");
        EMClient.getInstance().asyncGetRTCTokenInfoWithChannelName(c, new EMValueCallBack<EMRTCTokenInfo>() {
            @Override
            public void onSuccess(EMRTCTokenInfo emrtcTokenInfo) {
                Map<String, Object> data = new HashMap<>();
                data.put("rtcToken", emrtcTokenInfo.getRtcToken());
                data.put("expireTimeStamp", emrtcTokenInfo.getExpireTimeStamp());
                data.put("uid", emrtcTokenInfo.getUid());
                ExtSdkWrapper.onSuccess(result, channelName, data);
            }

            @Override
            public void onError(int i, String s) {
                ExtSdkWrapper.onError(result, i, s);
            }
        });
    }

    public void getUserIdsWithRTCUids(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        JSONArray idsarray = param.getJSONArray("rtcUids");
        List<Integer> ids = new ArrayList<>();
        for (int i = 0; i < idsarray.length(); i++) {
            ids.add(idsarray.getInt(i));
        }

        EMClient.getInstance().asyncGetUserIdsWithRTCUids(ids, new EMValueCallBack<Map<Integer, String>>() {
            @Override
            public void onSuccess(Map<Integer, String> integerStringMap) {
              HashMap<String, String> list = new HashMap<String, String>();
              for (Map.Entry<Integer, String> entry : integerStringMap.entrySet()) {
                Integer key = entry.getKey();
                String value = entry.getValue();
                list.put(String.valueOf(key), value);
              }
                ExtSdkWrapper.onSuccess(result, channelName, list);
            }

            @Override
            public void onError(int i, String s) {
                ExtSdkWrapper.onError(result, i, s);
            }
        });
    }

    public void addEMListener() {
        if (this.multiDeviceListener != null) {
            EMClient.getInstance().removeMultiDeviceListener(this.multiDeviceListener);
        }
        this.multiDeviceListener = new EMMultiDeviceListener() {
            @Override
            public void onContactEvent(int event, String target, String ext) {
                Map<String, Object> data = new HashMap<>();
                data.put("event", Integer.valueOf(event));
                data.put("target", target);
                data.put("ext", ext);
                data.put("type", onMultiDeviceEventContact);
                onReceive(ExtSdkMethodType.onMultiDeviceEvent, data);
            }

            @Override
            public void onGroupEvent(int event, String target, List<String> userNames) {
                Map<String, Object> data = new HashMap<>();
                data.put("event", Integer.valueOf(event));
                data.put("target", target);
                data.put("ext", userNames);
                data.put("type", onMultiDeviceEventGroup);
                onReceive(ExtSdkMethodType.onMultiDeviceEvent, data);
            }

            @Override
            public void onChatThreadEvent(int event, String target, List<String> usernames) {
                Map<String, Object> data = new HashMap<>();
                data.put("event", Integer.valueOf(event));
                data.put("target", target);
                data.put("ext", usernames);
                data.put("type", onMultiDeviceEventThread);
                onReceive(ExtSdkMethodType.onMultiDeviceEvent, data);
            }

            @Override
            public void onMessageRemoved(String conversationId, String deviceId) {
                Map<String, Object> data = new HashMap<>();
                data.put("convId", conversationId);
                data.put("deviceId", deviceId);
                data.put("type", onMultiDeviceEventRemoveMessage);
                onReceive(ExtSdkMethodType.onMultiDeviceEvent, data);
            }

            @Override
            public void onConversationEvent(int event, String conversationId, EMConversation.EMConversationType type) {
                Map<String, Object> data = new HashMap<>();
                data.put("event", Integer.valueOf(event));
                data.put("convId", conversationId);
                data.put("convType", conversationTypeToInt(type));
                data.put("type", onMultiDeviceEventConversation);
                onReceive(ExtSdkMethodType.onMultiDeviceEvent, data);
            }
        };
        EMClient.getInstance().addMultiDeviceListener(this.multiDeviceListener);

        if (this.connectionListener != null) {
            EMClient.getInstance().removeConnectionListener(this.connectionListener);
        }

        this.connectionListener = new EMConnectionListener() {
            @Override
            public void onConnected() {
                Map<String, Object> data = new HashMap<>();
                data.put("connected", Boolean.TRUE);
                onReceive(ExtSdkMethodType.onConnected, data);
            }

            @Override
            public void onDisconnected(int errorCode) {
                if (errorCode == EMError.USER_LOGIN_ANOTHER_DEVICE) {
                    // 206 is emitted by onLogout(int, EMLoginExtensionInfo) below, which carries the device info.
                    return;
                }
                Map<String, Object> data = new HashMap<>();
                data.put("errorCode", Integer.valueOf(errorCode));
                onReceive(ExtSdkMethodType.onDisconnected, data);
            }

            @Override
            public void onTokenExpired() {
                onReceive(ExtSdkMethodType.onTokenDidExpire, null);
            }

            @Override
            public void onTokenWillExpire() {
                onReceive(ExtSdkMethodType.onTokenWillExpire, null);
            }

            @Override
            public void onLogout(int errorCode, EMLoginExtensionInfo info) {
                EMConnectionListener.super.onLogout(errorCode, info);
                // onLogout fires for every forced logout, but onDisconnected(int) has already
                // delivered the error code; only 206 carries extra device info worth emitting.
                if (errorCode == EMError.USER_LOGIN_ANOTHER_DEVICE) {
                    Map<String, Object> data = new HashMap<>();
                    data.put("errorCode", Integer.valueOf(errorCode));
                    data.put("deviceName", info.getDeviceInfo());
                    data.put("ext", info.getDeviceExt());
                    onReceive(ExtSdkMethodType.onDisconnected, data);
                }
            }

            @Override
            public void onDataSyncStart(EMOptions.EMDataSyncType type) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", type.getValue());
                onReceive(ExtSdkMethodType.onDataSyncStart, data);
            }

            @Override
            public void onDataSyncFinish(EMOptions.EMDataSyncType type, int errorCode) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", type.getValue());
                data.put("errorCode", errorCode);
                onReceive(ExtSdkMethodType.onDataSyncFinish, data);
            }

            @Override
            public void onDatabaseOpened(String username) {
                Map<String, Object> data = new HashMap<>();
                data.put("username", username);
                data.put("errorCode", 0);
                onReceive(ExtSdkMethodType.onDatabaseOpened, data);
            }

            @Override
            public void onOfflineMessageSyncStart() {
                Map<String, String> attributes = new HashMap<>();
                onReceive(ExtSdkMethodType.onOfflineMessageSyncStart, attributes);
            }

            @Override
            public void onOfflineMessageSyncFinish() {
                Map<String, String> attributes = new HashMap<>();
                onReceive(ExtSdkMethodType.onOfflineMessageSyncFinish, attributes);
            }
        };

        // setup connection listener
        EMClient.getInstance().addConnectionListener(this.connectionListener);
    }

    private EMConnectionListener connectionListener;
    private EMMultiDeviceListener multiDeviceListener;
}
