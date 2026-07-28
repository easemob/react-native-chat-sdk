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

    public void createAccount(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String username = param.getString("username");
        String password = param.getString("password");
        try {
            EMClient.getInstance().createAccount(username, password);
            onSuccess(result, channelName, username);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void login(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        boolean isPwd = param.getBoolean("isPassword");
        String username = param.getString("username");
        String pwdOrToken = param.getString("pwdOrToken");

        if (isPwd) {
            EMClient.getInstance().login(username, pwdOrToken, new EMCallBack() {
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
        } else {
            EMClient.getInstance().loginWithToken(username, pwdOrToken, new EMCallBack() {
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
        String password = param.getString("password");
        String resource = param.getString("resource");
        boolean isPassword = param.getBoolean("isPassword");

        try {
            if (isPassword) {
                EMClient.getInstance().kickDevice(username, password, resource);
            } else {
                EMClient.getInstance().kickDeviceWithToken(username, password, resource);
            }

            onSuccess(result, channelName, true);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void kickAllDevices(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String username = param.getString("username");
        String password = param.getString("password");
        boolean isPassword = param.getBoolean("isPassword");

        try {
            if (isPassword) {
                EMClient.getInstance().kickAllDevices(username, password);
            } else {
                EMClient.getInstance().kickAllDevicesWithToken(username, password);
            }

            onSuccess(result, channelName, true);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void isLoggedInBefore(JSONObject param, String channelName, ExtSdkCallback result) {
        onSuccess(result, channelName, EMClient.getInstance().isLoggedInBefore());
    }

    public void getLoggedInDevicesFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String username = param.getString("username");
        String password = param.getString("password");
        boolean isPassword = param.getBoolean("isPassword");

        try {
            List<Map> jsonList = new ArrayList<>();
            if (isPassword) {
                List<EMDeviceInfo> devices = EMClient.getInstance().getLoggedInDevicesFromServer(username, password);
                for (EMDeviceInfo info : devices) {
                    jsonList.add(ExtSdkDeviceInfoHelper.toJson(info));
                }
            } else {
                List<EMDeviceInfo> devices =
                    EMClient.getInstance().getLoggedInDevicesFromServerWithToken(username, password);
                for (EMDeviceInfo info : devices) {
                    jsonList.add(ExtSdkDeviceInfoHelper.toJson(info));
                }
            }

            onSuccess(result, channelName, jsonList);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
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

    public void loginWithAgoraToken(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String username = param.getString("username");
        String agoratoken = param.getString("agoratoken");

        EMClient.getInstance().loginWithAgoraToken(username, agoratoken, new EMCallBack() {
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
            public void onProgress(int progress, String status) {}
        });
    }

    public void isConnected(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        onSuccess(result, channelName, EMClient.getInstance().isConnected());
    }

    public void renewToken(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String agoraToken = param.getString("agora_token");
        EMClient.getInstance().renewToken(agoraToken, new EMCallBack() {
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
                if (errorCode == 206) {
                    // move to onLogout
                    //                    onReceive(ExtSdkMethodType.onUserDidLoginFromOtherDevice, null);
                } else if (errorCode == 207) {
                    onReceive(ExtSdkMethodType.onUserDidRemoveFromServer, null);
                } else if (errorCode == 305) {
                    onReceive(ExtSdkMethodType.onUserDidForbidByServer, null);
                } else if (errorCode == 216) {
                    onReceive(ExtSdkMethodType.onUserDidChangePassword, null);
                } else if (errorCode == 214) {
                    onReceive(ExtSdkMethodType.onUserDidLoginTooManyDevice, null);
                } else if (errorCode == 217) {
                    onReceive(ExtSdkMethodType.onUserKickedByOtherDevice, null);
                } else if (errorCode == 202) {
                    onReceive(ExtSdkMethodType.onUserAuthenticationFailed, null);
                } else if (errorCode == 8) {
                    onReceive(ExtSdkMethodType.onAppActiveNumberReachLimit, null);
                } else {
                    onReceive(ExtSdkMethodType.onDisconnected, null);
                }
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
            public void onLogout(int errorCode, String info) {
                if (errorCode == 206) {
                    Map<String, String> attributes = new HashMap<>();
                    attributes.put("deviceName", info);
                    onReceive(ExtSdkMethodType.onUserDidLoginFromOtherDevice, attributes);
                }
            }

            @Override
            public void onLogout(int errorCode, EMLoginExtensionInfo info) {
                EMConnectionListener.super.onLogout(errorCode, info);
                Map<String, String> attributes = new HashMap<>();
                attributes.put("deviceName", info.getDeviceInfo());
                attributes.put("ext", info.getDeviceExt());
                onReceive(ExtSdkMethodType.onUserDidLoginFromOtherDeviceWithInfo, attributes);
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
