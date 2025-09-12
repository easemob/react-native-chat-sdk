package com.easemob.ext_sdk.dispatch;

import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.easemob.ext_sdk.common.ExtSdkMethodType;
import com.hyphenate.EMCallBack;
import com.hyphenate.EMContactListener;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMContact;
import com.hyphenate.chat.EMCursorResult;
import com.hyphenate.exceptions.HyphenateException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkContactManagerWrapper extends ExtSdkWrapper {

    public static class SingleHolder {
        static ExtSdkContactManagerWrapper instance = new ExtSdkContactManagerWrapper();
    }

    public static ExtSdkContactManagerWrapper getInstance() {
        return ExtSdkContactManagerWrapper.SingleHolder.instance;
    }

    ExtSdkContactManagerWrapper() { registerEaseListener(); }

    public void addContact(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String username = param.getString("username");
        String reason = param.getString("reason");

        try {
            EMClient.getInstance().contactManager().addContact(username, reason);
            onSuccess(result, channelName, username);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void deleteContact(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String username = param.getString("username");
        boolean keepConversation = param.getBoolean("keepConversation");
        try {
            EMClient.getInstance().contactManager().deleteContact(username, keepConversation);
            onSuccess(result, channelName, username);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void getAllContactsFromServer(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        try {
            List contacts = EMClient.getInstance().contactManager().getAllContactsFromServer();
            onSuccess(result, channelName, contacts);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void getAllContactsFromDB(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        try {
            List contacts = EMClient.getInstance().contactManager().getContactsFromLocal();
            onSuccess(result, channelName, contacts);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void addUserToBlockList(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String username = params.getString("username");
        try {
            EMClient.getInstance().contactManager().addUserToBlackList(username, false);
            onSuccess(result, channelName, username);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void removeUserFromBlockList(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        String username = params.getString("username");
        try {
            EMClient.getInstance().contactManager().removeUserFromBlackList(username);
            onSuccess(result, channelName, username);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void getBlockListFromServer(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        try {
            List contacts = EMClient.getInstance().contactManager().getBlackListFromServer();
            onSuccess(result, channelName, contacts);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void getBlockListFromDB(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        List contacts = EMClient.getInstance().contactManager().getBlackListUsernames();
        onSuccess(result, channelName, contacts);
    }

    public void acceptInvitation(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String username = params.getString("username");
        try {
            EMClient.getInstance().contactManager().acceptInvitation(username);
            onSuccess(result, channelName, username);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void declineInvitation(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String username = params.getString("username");
        try {
            EMClient.getInstance().contactManager().declineInvitation(username);
            onSuccess(result, channelName, username);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void getSelfIdsOnOtherPlatform(JSONObject params, String channelName, ExtSdkCallback result)
        throws JSONException {
        try {
            List platforms = EMClient.getInstance().contactManager().getSelfIdsOnOtherPlatform();
            onSuccess(result, channelName, platforms);
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void getAllContacts(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMClient.getInstance().contactManager().asyncFetchAllContactsFromLocal(new EMValueCallBack<List<EMContact>>() {
            @Override
            public void onSuccess(List<EMContact> value) {
                List<Map> contactList = new ArrayList<>();
                for (EMContact contact : value) {
                    contactList.add(ExtSdkContactHelper.toJson(contact));
                }
                ExtSdkWrapper.onSuccess(result, channelName, contactList);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void setContactRemark(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String userId = params.getString("userId");
        String remark = params.getString("remark");
        EMClient.getInstance().contactManager().asyncSetContactRemark(userId, remark, new EMCallBack() {
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

    public void getContact(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        String userId = params.getString("userId");
        try {
            EMContact contact = EMClient.getInstance().contactManager().fetchContactFromLocal(userId);
            if (contact != null) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkContactHelper.toJson(contact));
            } else {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }
        } catch (HyphenateException e) {
            ExtSdkWrapper.onError(result, e, null);
        }
    }

    public void fetchAllContacts(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        EMClient.getInstance().contactManager().asyncFetchAllContactsFromServer(new EMValueCallBack<List<EMContact>>() {
            @Override
            public void onSuccess(List<EMContact> value) {
                List<Map> contactList = new ArrayList<>();
                for (EMContact contact : value) {
                    contactList.add(ExtSdkContactHelper.toJson(contact));
                }
                ExtSdkWrapper.onSuccess(result, channelName, contactList);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void fetchContacts(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
        int pageSize = params.getInt("pageSize");
        String cursor = null;
        if (params.has("cursor")) {
            cursor = params.getString("cursor");
        }
        EMClient.getInstance().contactManager().asyncFetchAllContactsFromServer(
            pageSize, cursor, new EMValueCallBack<EMCursorResult<EMContact>>() {
                @Override
                public void onSuccess(EMCursorResult<EMContact> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkCursorResultHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    private void registerEaseListener() {
        if (this.contactListener != null) {
            EMClient.getInstance().contactManager().removeContactListener(this.contactListener);
        }
        this.contactListener = new EMContactListener() {
            @Override
            public void onContactAdded(String userName) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onContactAdded");
                data.put("username", userName);
                onReceive(ExtSdkMethodType.onContactChanged, data);
            }

            @Override
            public void onContactDeleted(String userName) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onContactDeleted");
                data.put("username", userName);
                onReceive(ExtSdkMethodType.onContactChanged, data);
            }

            @Override
            public void onContactInvited(String userName, String reason) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onContactInvited");
                data.put("username", userName);
                data.put("reason", reason);
                onReceive(ExtSdkMethodType.onContactChanged, data);
            }

            @Override
            public void onFriendRequestAccepted(String userName) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onFriendRequestAccepted");
                data.put("username", userName);
                onReceive(ExtSdkMethodType.onContactChanged, data);
            }

            @Override
            public void onFriendRequestDeclined(String userName) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onFriendRequestDeclined");
                data.put("username", userName);
                onReceive(ExtSdkMethodType.onContactChanged, data);
            }
        };
        EMClient.getInstance().contactManager().setContactListener(this.contactListener);
    }
    private EMContactListener contactListener = null;
}
