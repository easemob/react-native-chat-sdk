package com.chatsdk.dispatch;

import com.chatsdk.common.ExtSdkCallback;
import com.chatsdk.common.ExtSdkMethodType;
import com.hyphenate.EMCallBack;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMUserInfo;
import com.hyphenate.chat.EMUserInfoManagerListener;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkUserInfoManagerWrapper extends ExtSdkWrapper {
    public static class SingleHolder {
        static ExtSdkUserInfoManagerWrapper instance = new ExtSdkUserInfoManagerWrapper();
    }

    public static ExtSdkUserInfoManagerWrapper getInstance() {
        return ExtSdkUserInfoManagerWrapper.SingleHolder.instance;
    }

    ExtSdkUserInfoManagerWrapper() { registerEaseListener(); }

    public void getLocalUserInfoByIds(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        JSONArray userIdArray = params.getJSONArray("userIds");
        String[] userIds = new String[userIdArray.length()];
        for (int i = 0; i < userIdArray.length(); i++) {
            userIds[i] = (String)userIdArray.get(i);
        }

        EMClient.getInstance().userInfoManager().getUserInfoWithUserIds(
            userIds, new EMValueCallBack<Map<String, EMUserInfo>>() {
                @Override
                public void onSuccess(Map<String, EMUserInfo> value) {
                    final Map<String, Map> rMap = generateMapFromMap(value);
                    ExtSdkWrapper.onSuccess(result, channelName, rMap);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void subscribeUsersInfo(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        JSONArray userIdArray = params.getJSONArray("userIds");
        String[] userIds = new String[userIdArray.length()];
        for (int i = 0; i < userIdArray.length(); i++) {
            userIds[i] = (String)userIdArray.get(i);
        }

        EMClient.getInstance().userInfoManager().subscribeUsersInfo(userIds, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void unsubscribeUsersInfo(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        JSONArray userIdArray = params.getJSONArray("userIds");
        String[] userIds = new String[userIdArray.length()];
        for (int i = 0; i < userIdArray.length(); i++) {
            userIds[i] = (String)userIdArray.get(i);
        }

        EMClient.getInstance().userInfoManager().unsubscribeUsersInfo(userIds, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void fetchSubscribedUsers(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        EMClient.getInstance().userInfoManager().fetchSubscribedUsers(new EMValueCallBack<List<EMUserInfo>>() {
            @Override
            public void onSuccess(List<EMUserInfo> value) {
                List<Map> users = new ArrayList<>();
                for (EMUserInfo userInfo : value) {
                    users.add(ExtSdkUserInfoHelper.toJson(userInfo));
                }
                Map<String, Object> data = new HashMap<>();
                data.put("users", users);
                ExtSdkWrapper.onSuccess(result, channelName, data);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void updateOwnUserInfo(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        JSONObject obj = params.getJSONObject("userInfo");
        EMUserInfo userInfo = ExtSdkUserInfoHelper.fromJson(obj);

        EMClient.getInstance().userInfoManager().updateOwnInfo(userInfo, new EMValueCallBack<String>() {
            @Override
            public void onSuccess(String value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkUserInfoHelper.toJson(userInfo));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void fetchUserInfoByUserId(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        JSONArray userIdArray = params.getJSONArray("userIds");
        String[] userIds = new String[userIdArray.length()];
        for (int i = 0; i < userIdArray.length(); i++) {
            userIds[i] = (String)userIdArray.get(i);
        }

        EMClient.getInstance().userInfoManager().fetchUserInfoByUserId(
            userIds, new EMValueCallBack<Map<String, EMUserInfo>>() {
                @Override
                public void onSuccess(Map<String, EMUserInfo> value) {
                    final Map<String, Map> rMap = generateMapFromMap(value);
                    ExtSdkWrapper.onSuccess(result, channelName, rMap);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    Map<String, Map> generateMapFromMap(Map<String, EMUserInfo> aMap) {
        Map<String, Map> resultMap = new HashMap<>();

        for (Map.Entry<String, EMUserInfo> entry : aMap.entrySet()) {
            String mapKey = entry.getKey();
            EMUserInfo mapValue = entry.getValue();
            resultMap.put(mapKey, ExtSdkUserInfoHelper.toJson(mapValue));
        }
        return resultMap;
    }

    private void registerEaseListener() {
        if (this.userInfoManagerListener != null) {
            EMClient.getInstance().userInfoManager().removeUserInfoManagerListener(this.userInfoManagerListener);
        }
        this.userInfoManagerListener = new EMUserInfoManagerListener() {
            @Override
            public void onSelfUserInfoUpdate(EMUserInfo userInfo) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onSelfUserInfoUpdate");
                data.put("userInfo", ExtSdkUserInfoHelper.toJson(userInfo));
                onReceive(ExtSdkMethodType.onUserInfoChanged, data);
            }

            @Override
            public void onUserInfoUpdate(List<EMUserInfo> userInfos) {
                List<Map> users = new ArrayList<>();
                for (EMUserInfo userInfo : userInfos) {
                    users.add(ExtSdkUserInfoHelper.toJson(userInfo));
                }
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onUserInfoUpdate");
                data.put("userInfos", users);
                onReceive(ExtSdkMethodType.onUserInfoChanged, data);
            }
        };
        EMClient.getInstance().userInfoManager().addUserInfoManagerListener(this.userInfoManagerListener);
    }
    private EMUserInfoManagerListener userInfoManagerListener = null;
}
