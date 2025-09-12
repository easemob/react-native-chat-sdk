package com.easemob.ext_sdk.dispatch;

import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMUserInfo;
import java.util.HashMap;
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

    public void updateOwnUserInfoWithType(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        int userInfoTypeInt = params.getInt("userInfoType");
        String userInfoTypeValue = params.getString("userInfoValue");
        EMUserInfo.EMUserInfoType userInfoType = getUserInfoTypeFromInt(userInfoTypeInt);
        EMClient.getInstance().userInfoManager().updateOwnInfoByAttribute(
            userInfoType, userInfoTypeValue, new EMValueCallBack<String>() {
                @Override
                public void onSuccess(String value) {
                    if (value != null && value.length() > 0) {
                        JSONObject obj;
                        try {
                            obj = new JSONObject(value);
                            String userId = EMClient.getInstance().getCurrentUser();
                            obj.put("userId", userId);
                            EMUserInfo userInfo = ExtSdkUserInfoHelper.fromJson(obj);
                            ExtSdkWrapper.onSuccess(result, channelName, ExtSdkUserInfoHelper.toJson(userInfo));

                        } catch (JSONException e) {
                            ExtSdkWrapper.onError(result, e, null);
                        }
                    }
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

    public void fetchUserInfoByIdWithType(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        JSONArray userIdArray = params.getJSONArray("userIds");
        JSONArray userInfoTypeArray = params.getJSONArray("userInfoTypes");

        String[] userIds = new String[userIdArray.length()];
        for (int i = 0; i < userIdArray.length(); i++) {
            userIds[i] = (String)userIdArray.get(i);
        }

        EMUserInfo.EMUserInfoType[] infoTypes = new EMUserInfo.EMUserInfoType[userInfoTypeArray.length()];
        for (int i = 0; i < userInfoTypeArray.length(); i++) {
            EMUserInfo.EMUserInfoType infoType = getUserInfoTypeFromInt((int)userInfoTypeArray.get(i));
            infoTypes[i] = infoType;
        }

        EMClient.getInstance().userInfoManager().fetchUserInfoByAttribute(
            userIds, infoTypes, new EMValueCallBack<Map<String, EMUserInfo>>() {
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

    private EMUserInfo.EMUserInfoType getUserInfoTypeFromInt(int value) {
        EMUserInfo.EMUserInfoType infoType;

        switch (value) {
        case 0: {
            infoType = EMUserInfo.EMUserInfoType.NICKNAME;
        } break;

        case 1: {
            infoType = EMUserInfo.EMUserInfoType.AVATAR_URL;
        } break;

        case 2: {
            infoType = EMUserInfo.EMUserInfoType.EMAIL;
        } break;

        case 3: {
            infoType = EMUserInfo.EMUserInfoType.PHONE;
        } break;

        case 4: {
            infoType = EMUserInfo.EMUserInfoType.GENDER;
        } break;

        case 5: {
            infoType = EMUserInfo.EMUserInfoType.SIGN;
        } break;

        case 6: {
            infoType = EMUserInfo.EMUserInfoType.BIRTH;
        } break;

        case 100: {
            infoType = EMUserInfo.EMUserInfoType.EXT;
        } break;

        default:
            throw new IllegalStateException("Unexpected value: " + value);
        }

        return infoType;
    }
}
