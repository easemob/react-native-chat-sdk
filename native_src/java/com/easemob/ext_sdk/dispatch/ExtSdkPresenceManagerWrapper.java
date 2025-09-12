package com.easemob.ext_sdk.dispatch;

import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.easemob.ext_sdk.common.ExtSdkMethodType;
import com.hyphenate.EMCallBack;
import com.hyphenate.EMGroupChangeListener;
import com.hyphenate.EMPresenceListener;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMPresence;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkPresenceManagerWrapper extends ExtSdkWrapper {
    public static class SingleHolder {
        static ExtSdkPresenceManagerWrapper instance = new ExtSdkPresenceManagerWrapper();
    }

    public static ExtSdkPresenceManagerWrapper getInstance() {
        return ExtSdkPresenceManagerWrapper.SingleHolder.instance;
    }

    ExtSdkPresenceManagerWrapper() { registerEaseListener(); }

    public void publishPresenceWithDescription(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        String desc = params.getString("desc");
        EMClient.getInstance().presenceManager().publishPresence(desc, new EMCallBack() {
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

    public void subscribe(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        List<String> members = new ArrayList<>();
        if (params.has("members")) {
            JSONArray array = params.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }
        int expiry = 0;
        if (params.has("expiry")) {
            expiry = params.getInt("expiry");
        }
        EMClient.getInstance().presenceManager().subscribePresences(
            members, expiry, new EMValueCallBack<List<EMPresence>>() {
                @Override
                public void onSuccess(List<EMPresence> value) {
                    List<Map> list = new ArrayList<>();
                    for (EMPresence presence : value) {
                        list.add(ExtSdkPresenceHelper.toJson(presence));
                    }
                    ExtSdkWrapper.onSuccess(result, channelName, list);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void unsubscribe(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        List<String> members = new ArrayList<>();
        if (params.has("members")) {
            JSONArray array = params.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }
        EMClient.getInstance().presenceManager().unsubscribePresences(members, new EMCallBack() {
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

    public void fetchSubscribedMembersWithPageNum(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        int pageSize = params.getInt("pageSize");
        int pageNum = params.getInt("pageNum");
        EMClient.getInstance().presenceManager().fetchSubscribedMembers(
            pageNum, pageSize, new EMValueCallBack<List<String>>() {
                @Override
                public void onSuccess(List<String> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, value);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void fetchPresenceStatus(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        List<String> members = new ArrayList<>();
        if (params.has("members")) {
            JSONArray array = params.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }
        EMClient.getInstance().presenceManager().fetchPresenceStatus(members, new EMValueCallBack<List<EMPresence>>() {
            @Override
            public void onSuccess(List<EMPresence> value) {
                List<Map> list = new ArrayList<>();
                for (EMPresence presence : value) {
                    list.add(ExtSdkPresenceHelper.toJson(presence));
                }
                ExtSdkWrapper.onSuccess(result, channelName, list);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void registerEaseListener() {
        if (this.presenceListener != null) {
            EMClient.getInstance().presenceManager().removeListener(this.presenceListener);
        }
        this.presenceListener = new EMPresenceListener() {
            @Override
            public void onPresenceUpdated(List<EMPresence> presences) {
                Map<String, Object> data = new HashMap<>();
                List<Map> list = new ArrayList<>();
                for (EMPresence presence : presences) {
                    list.add(ExtSdkPresenceHelper.toJson(presence));
                }
                data.put("presences", list);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onPresenceStatusChanged, data);
            }
        };
        EMClient.getInstance().presenceManager().addListener(this.presenceListener);
    }

    private EMPresenceListener presenceListener = null;
}
