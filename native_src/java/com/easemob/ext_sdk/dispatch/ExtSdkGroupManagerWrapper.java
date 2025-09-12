package com.easemob.ext_sdk.dispatch;

import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.easemob.ext_sdk.common.ExtSdkMethodType;
import com.hyphenate.EMCallBack;
import com.hyphenate.EMGroupChangeListener;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMCursorResult;
import com.hyphenate.chat.EMGroup;
import com.hyphenate.chat.EMGroupInfo;
import com.hyphenate.chat.EMGroupOptions;
import com.hyphenate.chat.EMMucSharedFile;
import com.hyphenate.exceptions.HyphenateException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkGroupManagerWrapper extends ExtSdkWrapper {

    public static class SingleHolder {
        static ExtSdkGroupManagerWrapper instance = new ExtSdkGroupManagerWrapper();
    }

    public static ExtSdkGroupManagerWrapper getInstance() { return ExtSdkGroupManagerWrapper.SingleHolder.instance; }

    ExtSdkGroupManagerWrapper() { registerEaseListener(); }

    public void getGroupWithId(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        EMGroup group = EMClient.getInstance().groupManager().getGroup(groupId);
        onSuccess(result, channelName, ExtSdkGroupHelper.toJson(group));
    }

    public void getJoinedGroups(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        EMClient.getInstance().groupManager().loadAllGroups();
        List<EMGroup> groups = EMClient.getInstance().groupManager().getAllGroups();
        List<Map> groupList = new ArrayList<>();
        for (EMGroup group : groups) {
            groupList.add(ExtSdkGroupHelper.toJson(group));
        }
        onSuccess(result, channelName, groupList);
    }

    public void getGroupsWithoutPushNotification(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        List<String> groups = EMClient.getInstance().pushManager().getNoPushGroups();
        onSuccess(result, channelName, groups);
    }

    public void getJoinedGroupsFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {

        int pageSize = 0;
        if (param.has("pageSize")) {
            pageSize = param.getInt("pageSize");
        }
        int pageNum = 0;
        if (param.has("pageNum")) {
            pageNum = param.getInt("pageNum");
        }
        boolean needRole = false;
        if (param.has("needRole")) {
            needRole = param.getBoolean("needRole");
        }
        boolean needMemberCount = false;
        if (param.has("needMemberCount")) {
            needMemberCount = param.getBoolean("needMemberCount");
        }

        EMClient.getInstance().groupManager().asyncGetJoinedGroupsFromServer(
            pageNum, pageSize, needMemberCount, needRole, new EMValueCallBack<List<EMGroup>>() {
                @Override
                public void onSuccess(List<EMGroup> value) {
                    List<Map> groupList = new ArrayList<>();
                    for (EMGroup group : value) {
                        groupList.add(ExtSdkGroupHelper.toJson(group));
                    }
                    ExtSdkWrapper.onSuccess(result, channelName, groupList);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void getPublicGroupsFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        int pageSize = 0;
        if (param.has("pageSize")) {
            pageSize = param.getInt("pageSize");
        }
        String cursor = null;
        if (param.has("cursor")) {
            cursor = param.getString("cursor");
        }
        EMClient.getInstance().groupManager().asyncGetPublicGroupsFromServer(
            pageSize, cursor, new EMValueCallBack<EMCursorResult<EMGroupInfo>>() {
                @Override
                public void onSuccess(EMCursorResult<EMGroupInfo> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkCursorResultHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void createGroup(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupName = null;

        if (param.has("groupName")) {
            groupName = param.getString("groupName");
        }

        String desc = null;
        if (param.has("desc")) {
            desc = param.getString("desc");
        }

        String[] members = null;
        if (param.has("inviteMembers")) {
            JSONArray inviteMembers = param.getJSONArray("inviteMembers");
            members = new String[inviteMembers.length()];
            for (int i = 0; i < inviteMembers.length(); i++) {
                members[i] = inviteMembers.getString(i);
            }
        }
        if (members == null) {
            members = new String[0];
        }
        String inviteReason = null;

        if (param.has("inviteReason")) {
            inviteReason = param.getString("inviteReason");
        }

        EMGroupOptions options = ExtSdkGroupOptionsHelper.fromJson(param.getJSONObject("options"));
        EMClient.getInstance().groupManager().asyncCreateGroup(
            groupName, desc, members, inviteReason, options, new EMValueCallBack<EMGroup>() {
                @Override
                public void onSuccess(EMGroup value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void getGroupSpecificationFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        boolean isFetchMembers = false;
        if (param.has("fetchMembers")) {
            isFetchMembers = param.getBoolean("fetchMembers");
        }
        try {
            EMGroup group = EMClient.getInstance().groupManager().getGroupFromServer(groupId, isFetchMembers);
            ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(group));
        } catch (HyphenateException e) {
            ExtSdkWrapper.onError(result, e, null);
        }
    }

    public void getGroupMemberListFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String cursor = null;
        if (param.has("cursor")) {
            cursor = param.getString("cursor");
        }
        int pageSize = param.getInt("pageSize");
        EMClient.getInstance().groupManager().asyncFetchGroupMembers(
            groupId, cursor, pageSize, new EMValueCallBack<EMCursorResult<String>>() {
                @Override
                public void onSuccess(EMCursorResult<String> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkCursorResultHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void getGroupBlockListFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        int pageSize = 0;
        if (param.has("pageSize")) {
            pageSize = param.getInt("pageSize");
        }
        int pageNum = 0;
        if (param.has("pageNum")) {
            pageNum = param.getInt("pageNum");
        }
        EMClient.getInstance().groupManager().asyncGetBlockedUsers(
            groupId, pageNum, pageSize, new EMValueCallBack<List<String>>() {
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

    public void getGroupMuteListFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        int pageSize = 0;
        if (param.has("pageSize")) {
            pageSize = param.getInt("pageSize");
        }
        int pageNum = 0;
        if (param.has("pageNum")) {
            pageNum = param.getInt("pageNum");
        }
        EMClient.getInstance().groupManager().asyncFetchGroupMuteList(
            groupId, pageNum, pageSize, new EMValueCallBack<Map<String, Long>>() {
                @Override
                public void onSuccess(Map<String, Long> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, value.keySet().toArray());
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void getGroupWhiteListFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        EMClient.getInstance().groupManager().fetchGroupWhiteList(groupId, new EMValueCallBack<List<String>>() {
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

    public void isMemberInWhiteListFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        EMClient.getInstance().groupManager().checkIfInGroupWhiteList(groupId, new EMValueCallBack<Boolean>() {
            @Override
            public void onSuccess(Boolean value) {
                ExtSdkWrapper.onSuccess(result, channelName, value);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void getGroupFileListFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        int pageNum = 0;
        if (param.has("pageNum")) {
            pageNum = param.getInt("pageNum");
        }
        int pageSize = 0;
        if (param.has("pageSize")) {
            pageSize = param.getInt("pageSize");
        }
        EMClient.getInstance().groupManager().asyncFetchGroupSharedFileList(
            groupId, pageNum, pageSize, new EMValueCallBack<List<EMMucSharedFile>>() {
                @Override
                public void onSuccess(List<EMMucSharedFile> value) {
                    List<Map> fileList = new ArrayList<>();
                    for (EMMucSharedFile file : value) {
                        fileList.add(ExtSdkMucSharedFileHelper.toJson(file));
                    }
                    ExtSdkWrapper.onSuccess(result, channelName, fileList);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void getGroupAnnouncementFromServer(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        EMClient.getInstance().groupManager().asyncFetchGroupAnnouncement(groupId, new EMValueCallBack<String>() {
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

    public void inviterUser(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        String reason = null;
        if (param.has("reason")) {
            reason = param.getString("reason");
        }
        JSONArray array = param.getJSONArray("members");
        String[] members = new String[array.length()];
        for (int i = 0; i < array.length(); i++) {
            members[i] = array.getString(i);
        }
        EMClient.getInstance().groupManager().asyncInviteUser(groupId, members, reason, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void addMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");

        String[] members = null;
        if (param.has("members")) {
            JSONArray array = param.getJSONArray("members");
            members = new String[array.length()];
            for (int i = 0; i < array.length(); i++) {
                members[i] = array.getString(i);
            }
        }
        if (members == null) {
            members = new String[0];
        }

        String welcome = null;
        if (param.has("welcome")) {
            welcome = param.getString("welcome");
        }

        try {
            EMClient.getInstance().groupManager().addUsersToGroup(groupId, members, welcome);
            ExtSdkWrapper.onSuccess(result, channelName, null);
        } catch (HyphenateException e) {
            ExtSdkWrapper.onError(result, e, null);
        }
    }

    public void removeMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        List<String> members = new ArrayList<>();
        if (param.has("members")) {
            JSONArray array = param.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }

        EMClient.getInstance().groupManager().asyncRemoveUsersFromGroup(groupId, members, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void blockMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        List<String> members = new ArrayList<>();
        if (param.has("members")) {
            JSONArray array = param.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }

        EMClient.getInstance().groupManager().asyncBlockUsers(groupId, members, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void unblockMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        List<String> members = new ArrayList<>();
        if (param.has("members")) {
            JSONArray array = param.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }

        EMClient.getInstance().groupManager().asyncUnblockUsers(groupId, members, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void updateGroupSubject(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        String name = "";
        if (param.has("name")) {
            name = param.getString("name");
        }

        EMClient.getInstance().groupManager().asyncChangeGroupName(groupId, name, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void updateDescription(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        String desc = "";
        if (param.has("desc")) {
            desc = param.getString("desc");
        }

        EMClient.getInstance().groupManager().asyncChangeGroupDescription(groupId, desc, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void leaveGroup(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        EMClient.getInstance().groupManager().asyncLeaveGroup(groupId, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void destroyGroup(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        EMClient.getInstance().groupManager().asyncDestroyGroup(groupId, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void blockGroup(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");

        EMClient.getInstance().groupManager().asyncBlockGroupMessage(groupId, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void unblockGroup(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");

        EMClient.getInstance().groupManager().asyncUnblockGroupMessage(groupId, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void updateGroupOwner(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        String newOwner = param.getString("owner");

        EMClient.getInstance().groupManager().asyncChangeOwner(groupId, newOwner, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void addAdmin(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        String admin = param.getString("admin");

        EMClient.getInstance().groupManager().asyncAddGroupAdmin(groupId, admin, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void removeAdmin(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        String admin = param.getString("admin");

        EMClient.getInstance().groupManager().asyncRemoveGroupAdmin(groupId, admin, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void muteMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        int duration = 0;
        if (param.has("duration")) {
            duration = param.getInt("duration");
        }
        List<String> members = new ArrayList<>();
        if (param.has("members")) {
            JSONArray array = param.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }

        EMClient.getInstance().groupManager().asyncMuteGroupMembers(
            groupId, members, duration, new EMValueCallBack<EMGroup>() {
                @Override
                public void onSuccess(EMGroup value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void unMuteMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        List<String> members = new ArrayList<>();
        if (param.has("members")) {
            JSONArray array = param.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }

        EMClient.getInstance().groupManager().asyncUnMuteGroupMembers(groupId, members, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void muteAllMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");

        EMClient.getInstance().groupManager().muteAllMembers(groupId, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void unMuteAllMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");

        EMClient.getInstance().groupManager().unmuteAllMembers(groupId, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void addWhiteList(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        List<String> members = new ArrayList<>();
        if (param.has("members")) {
            JSONArray array = param.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }

        EMClient.getInstance().groupManager().addToGroupWhiteList(groupId, members, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void removeWhiteList(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        List<String> members = new ArrayList<>();
        if (param.has("members")) {
            JSONArray array = param.getJSONArray("members");
            for (int i = 0; i < array.length(); i++) {
                members.add(array.getString(i));
            }
        }

        EMClient.getInstance().groupManager().removeFromGroupWhiteList(groupId, members, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void uploadGroupSharedFile(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String filePath = null;
        if (param.has("filePath")) {
            filePath = param.getString("filePath");
        }

        String finalFilePath = filePath;
        EMClient.getInstance().groupManager().asyncUploadGroupSharedFile(
            groupId, filePath, new EMValueCallBack<EMMucSharedFile>() {
                @Override
                public void onSuccess(EMMucSharedFile value) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("groupId", groupId);
                    map.put("filePath", finalFilePath);
                    map.put("callbackType", ExtSdkMethodType.onMessageSuccess);
                    ExtSdkWrapper.onReceive(channelName, map);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    Map<String, Object> data = new HashMap<>();
                    data.put("code", error);
                    data.put("description", errorMsg);

                    Map<String, Object> map = new HashMap<>();
                    map.put("groupId", groupId);
                    map.put("filePath", finalFilePath);
                    map.put("error", data);
                    map.put("callbackType", ExtSdkMethodType.onMessageError);
                    ExtSdkWrapper.onReceive(channelName, map);
                }

                @Override
                public void onProgress(int progress, String status) {
                    EMValueCallBack.super.onProgress(progress, status);
                    Map<String, Object> map = new HashMap<>();
                    map.put("progress", progress);
                    map.put("groupId", groupId);
                    map.put("filePath", finalFilePath);
                    map.put("callbackType", ExtSdkMethodType.onMessageProgressUpdate);
                    ExtSdkWrapper.onReceive(channelName, map);
                }
            });

        ExtSdkWrapper.onSuccess(result, channelName, null);
    }

    public void downloadGroupSharedFile(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String fileId = null;
        if (param.has("fileId")) {
            fileId = param.getString("fileId");
        }
        String savePath = null;
        if (param.has("savePath")) {
            savePath = param.getString("savePath");
        }

        String finalSavePath = savePath;
        EMClient.getInstance().groupManager().asyncDownloadGroupSharedFile(groupId, fileId, savePath, new EMCallBack() {
            @Override
            public void onSuccess() {
                Map<String, Object> map = new HashMap<>();
                map.put("groupId", groupId);
                map.put("filePath", finalSavePath);
                map.put("callbackType", ExtSdkMethodType.onMessageSuccess);
                ExtSdkWrapper.onReceive(channelName, map);
            }

            @Override
            public void onError(int code, String error) {
                Map<String, Object> data = new HashMap<>();
                data.put("code", code);
                data.put("description", error);

                Map<String, Object> map = new HashMap<>();
                map.put("groupId", groupId);
                map.put("filePath", finalSavePath);
                map.put("error", data);
                map.put("callbackType", ExtSdkMethodType.onMessageError);
                ExtSdkWrapper.onReceive(channelName, map);
            }

            @Override
            public void onProgress(int progress, String status) {
                Map<String, Object> map = new HashMap<>();
                map.put("progress", progress);
                map.put("groupId", groupId);
                map.put("filePath", finalSavePath);
                map.put("callbackType", ExtSdkMethodType.onMessageProgressUpdate);
                ExtSdkWrapper.onReceive(channelName, map);
            }
        });

        ExtSdkWrapper.onSuccess(result, channelName, null);
    }

    public void removeGroupSharedFile(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String fileId = null;
        if (param.has("fileId")) {
            fileId = param.getString("fileId");
        }
        EMClient.getInstance().groupManager().asyncDeleteGroupSharedFile(groupId, fileId, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void updateGroupAnnouncement(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String announcement = null;
        if (param.has("announcement")) {
            announcement = param.getString("announcement");
        }

        EMClient.getInstance().groupManager().asyncUpdateGroupAnnouncement(groupId, announcement, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void updateGroupExt(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");
        String ext = null;
        if (param.has("ext")) {
            ext = param.getString("ext");
        }
        try {
            EMGroup group = EMClient.getInstance().groupManager().updateGroupExtension(groupId, ext);
            onSuccess(result, channelName, ExtSdkGroupHelper.toJson(group));
        } catch (HyphenateException e) {
            onError(result, e, null);
        }
    }

    public void joinPublicGroup(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String groupId = param.getString("groupId");

        EMClient.getInstance().groupManager().asyncJoinGroup(groupId, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void requestToJoinPublicGroup(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String reason = null;
        if (param.has("reason")) {
            reason = param.getString("reason");
        }

        EMClient.getInstance().groupManager().asyncApplyJoinToGroup(groupId, reason, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void acceptJoinApplication(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String username = null;
        if (param.has("username")) {
            username = param.getString("username");
        }

        EMClient.getInstance().groupManager().asyncAcceptApplication(username, groupId, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void declineJoinApplication(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String username = null;
        if (param.has("username")) {
            username = param.getString("username");
        }
        String reason = null;
        if (param.has("reason")) {
            reason = param.getString("reason");
        }

        EMClient.getInstance().groupManager().asyncDeclineApplication(username, groupId, reason, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void acceptInvitationFromGroup(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String inviter = null;
        if (param.has("inviter")) {
            inviter = param.getString("inviter");
        }

        EMClient.getInstance().groupManager().asyncAcceptInvitation(groupId, inviter, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkGroupHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    public void declineInvitationFromGroup(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String username = null;
        if (param.has("username")) {
            username = param.getString("username");
        }
        String reason = null;
        if (param.has("reason")) {
            reason = param.getString("reason");
        }

        EMClient.getInstance().groupManager().asyncDeclineInvitation(groupId, username, reason, new EMCallBack() {
            @Override
            public void onSuccess() {
                ExtSdkWrapper.onSuccess(result, channelName, null);
            }

            @Override
            public void onError(int code, String error) {
                ExtSdkWrapper.onError(result, code, error);
            }

            @Override
            public void onProgress(int progress, String status) {}
        });
    }

    public void setMemberAttribute(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        Map<String, String> attributes = new HashMap<>();

        String groupId = param.getString("groupId");
        String userId = param.getString("member");
        JSONObject jsonObject = param.getJSONObject("attributes");
        Iterator iterator = jsonObject.keys();
        while (iterator.hasNext()) {
            String key = iterator.next().toString();
            attributes.put(key, jsonObject.getString(key));
        }
        EMClient.getInstance().groupManager().asyncSetGroupMemberAttributes(
            groupId, userId, attributes, new EMCallBack() {
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

    public void fetchMemberAttributes(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        String userId = param.getString("member");
        EMClient.getInstance().groupManager().asyncFetchGroupMemberAllAttributes(
            groupId, userId, new EMValueCallBack<Map<String, Map<String, String>>>() {
                @Override
                public void onSuccess(Map<String, Map<String, String>> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, value.get(userId));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void fetchMembersAttributes(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String groupId = param.getString("groupId");
        JSONArray jUsers = param.getJSONArray("members");
        List<String> userIds = new ArrayList<>();
        for (int i = 0; i < jUsers.length(); i++) {
            userIds.add(jUsers.getString(i));
        }
        List<String> keys = new ArrayList<>();
        if (param.has("keys")) {
            JSONArray jsonArray = param.getJSONArray("keys");
            for (int i = 0; i < jsonArray.length(); i++) {
                keys.add(jsonArray.getString(i));
            }
        }
        EMClient.getInstance().groupManager().asyncFetchGroupMembersAttributes(
            groupId, userIds, keys, new EMValueCallBack<Map<String, Map<String, String>>>() {
                @Override
                public void onSuccess(Map<String, Map<String, String>> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, value);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }

    public void fetchJoinedGroupCount(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        EMClient.getInstance().groupManager().asyncGetJoinedGroupsCountFromServer(new EMValueCallBack<Integer>() {
            @Override
            public void onSuccess(Integer value) {
                ExtSdkWrapper.onSuccess(result, channelName, value);
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }

    private void registerEaseListener() {
        if (this.groupChangeListener != null) {
            EMClient.getInstance().groupManager().removeGroupChangeListener(this.groupChangeListener);
        }
        this.groupChangeListener = new EMGroupChangeListener() {
            @Override
            public void onWhiteListAdded(String groupId, List<String> whitelist) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onAllowListAdded");
                data.put("groupId", groupId);
                data.put("allowList", whitelist);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onWhiteListRemoved(String groupId, List<String> whitelist) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onAllowListRemoved");
                data.put("groupId", groupId);
                data.put("allowList", whitelist);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onAllMemberMuteStateChanged(String groupId, boolean isMuted) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onAllMemberMuteStateChanged");
                data.put("groupId", groupId);
                data.put("isMuted", isMuted);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onInvitationReceived(String groupId, String groupName, String inviter, String reason) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onInvitationReceived");
                data.put("groupId", groupId);
                data.put("groupName", groupName);
                data.put("inviter", inviter);
                data.put("reason", reason);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onRequestToJoinReceived(String groupId, String groupName, String applicant, String reason) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onRequestToJoinReceived");
                data.put("groupId", groupId);
                data.put("groupName", groupName);
                data.put("applicant", applicant);
                data.put("reason", reason);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onRequestToJoinAccepted(String groupId, String groupName, String accepter) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onRequestToJoinAccepted");
                data.put("groupId", groupId);
                data.put("groupName", groupName);
                data.put("accepter", accepter);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onRequestToJoinDeclined(String groupId, String groupName, String decliner, String reason) {
                // Map<String, Object> data = new HashMap<>();
                // data.put("type", "onRequestToJoinDeclined");
                // data.put("groupId", groupId);
                // data.put("groupName", groupName);
                // data.put("decliner", decliner);
                // data.put("reason", reason);
                // ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onRequestToJoinDeclined(String groupId, String groupName, String decliner, String reason,
                                                String applicant) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onRequestToJoinDeclined");
                data.put("groupId", groupId);
                data.put("groupName", groupName);
                data.put("applicant", applicant);
                data.put("decliner", decliner);
                data.put("reason", reason);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onInvitationAccepted(String groupId, String invitee, String reason) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onInvitationAccepted");
                data.put("groupId", groupId);
                data.put("invitee", invitee);
                data.put("reason", reason);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onInvitationDeclined(String groupId, String invitee, String reason) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onInvitationDeclined");
                data.put("groupId", groupId);
                data.put("invitee", invitee);
                data.put("reason", reason);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onUserRemoved(String groupId, String groupName) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onUserRemoved");
                data.put("groupId", groupId);
                data.put("groupName", groupName);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onGroupDestroyed(String groupId, String groupName) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onGroupDestroyed");
                data.put("groupId", groupId);
                data.put("groupName", groupName);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onAutoAcceptInvitationFromGroup(String groupId, String inviter, String inviteMessage) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onAutoAcceptInvitationFromGroup");
                data.put("groupId", groupId);
                data.put("inviter", inviter);
                data.put("inviteMessage", inviteMessage);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onMuteListAdded(String groupId, List<String> mutes, long muteExpire) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onMuteListAdded");
                data.put("groupId", groupId);
                data.put("mutes", mutes);
                data.put("muteExpire", muteExpire);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onMuteListRemoved(String groupId, List<String> mutes) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onMuteListRemoved");
                data.put("groupId", groupId);
                data.put("mutes", mutes);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onAdminAdded(String groupId, String administrator) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onAdminAdded");
                data.put("groupId", groupId);
                data.put("administrator", administrator);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onAdminRemoved(String groupId, String administrator) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onAdminRemoved");
                data.put("groupId", groupId);
                data.put("administrator", administrator);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onOwnerChanged(String groupId, String newOwner, String oldOwner) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onOwnerChanged");
                data.put("groupId", groupId);
                data.put("newOwner", newOwner);
                data.put("oldOwner", oldOwner);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onMemberJoined(String groupId, String member) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onMemberJoined");
                data.put("groupId", groupId);
                data.put("member", member);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onMemberExited(String groupId, String member) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onMemberExited");
                data.put("groupId", groupId);
                data.put("member", member);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onAnnouncementChanged(String groupId, String announcement) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onAnnouncementChanged");
                data.put("groupId", groupId);
                data.put("announcement", announcement);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onSharedFileAdded(String groupId, EMMucSharedFile sharedFile) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onSharedFileAdded");
                data.put("groupId", groupId);
                data.put("sharedFile", ExtSdkMucSharedFileHelper.toJson(sharedFile));
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onSharedFileDeleted(String groupId, String fileId) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onSharedFileDeleted");
                data.put("groupId", groupId);
                data.put("fileId", fileId);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onSpecificationChanged(EMGroup group) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onSpecificationChanged");
                data.put("group", ExtSdkGroupHelper.toJson(group));
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onStateChanged(EMGroup group, boolean isDisabled) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onStateChanged");
                data.put("group", ExtSdkGroupHelper.toJson(group));
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }

            @Override
            public void onGroupMemberAttributeChanged(String groupId, String userId, Map<String, String> attribute,
                                                      String from) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "onMemberAttributesChanged");
                data.put("groupId", groupId);
                data.put("member", userId);
                data.put("attributes", attribute);
                data.put("operator", from);
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onGroupChanged, data);
            }
        };
        EMClient.getInstance().groupManager().addGroupChangeListener(this.groupChangeListener);
    }
    private EMGroupChangeListener groupChangeListener = null;
}
