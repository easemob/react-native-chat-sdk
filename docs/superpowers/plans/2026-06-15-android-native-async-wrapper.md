# Android Native Async Wrapper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert active Android server/network wrapper methods from synchronous Hyphenate SDK calls to asynchronous callback APIs while preserving existing JS-facing success values and error behavior, except for approved Android async SDK parameter limitations that must be documented in TypeScript comments.

**Architecture:** Keep the existing React Native bridge shape unchanged: TypeScript managers call the same method constants, Android dispatch routes to the same wrapper methods, and wrappers resolve or reject `ExtSdkCallback` from SDK async callbacks. Each wrapper method should continue parsing the same JSON inputs and returning the same success payload, except for the approved Android async SDK parameter differences in the design spec.

**Tech Stack:** Java Android native wrappers, Hyphenate Chat Android SDK callbacks (`EMCallBack`, `EMValueCallBack`), React Native bridge callback helpers (`ExtSdkWrapper.onSuccess`, `ExtSdkWrapper.onError`), Yarn 3 validation commands.

---

## Source Spec

Use this spec as the contract for all implementation decisions:

- `docs/superpowers/specs/2026-06-15-android-native-async-wrapper-design.md`

If a target API mapping, return conversion, TypeScript deprecation relationship, or major uncovered case is uncertain, stop and ask the project owner before editing behavior.

## Files

- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkContactManagerWrapper.java`
  - Convert active contact server operations to `EMCallBack` or `EMValueCallBack`.
- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkChatRoomManagerWrapper.java`
  - Convert active chat room server operations to async methods.
- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkGroupManagerWrapper.java`
  - Convert active group info and member-add methods to async methods.
- Modify: `src/ChatContactManager.ts`
  - Add Android platform documentation for `deleteContact` and `keepConversation`.
- Modify: `src/ChatGroupManager.ts`
  - Add Android platform documentation for `addMembers` and `welcome`.
- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java`
  - Convert `recallMessage` only.
- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkPushManagerWrapper.java`
  - Convert `updatePushNickname`.
- Do not modify: `modules/objc/`, `modules/*/flutter/`, `lib/`.
- Do not change TypeScript method signatures, method constants, runtime behavior, or generated output. TypeScript changes in this plan are documentation comments only.

## Task 1: Convert Contact Wrapper

**Files:**
- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkContactManagerWrapper.java`

- [ ] **Step 1: Replace `addContact` with async callback**

Replace the whole `addContact` method with:

```java
public void addContact(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String username = param.getString("username");
    String reason = param.getString("reason");

    EMClient.getInstance().contactManager().asyncAddContact(username, reason, new EMCallBack() {
        @Override
        public void onSuccess() {
            ExtSdkWrapper.onSuccess(result, channelName, username);
        }

        @Override
        public void onError(int code, String error) {
            ExtSdkWrapper.onError(result, code, error);
        }
    });
}
```

- [ ] **Step 2: Replace `deleteContact` with approved async behavior**

Replace the whole `deleteContact` method with this code. It intentionally reads `keepConversation` to preserve JSON validation but does not pass it to the async SDK API, matching the approved spec difference.

```java
public void deleteContact(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String username = param.getString("username");
    param.getBoolean("keepConversation");

    EMClient.getInstance().contactManager().asyncDeleteContact(username, new EMCallBack() {
        @Override
        public void onSuccess() {
            ExtSdkWrapper.onSuccess(result, channelName, username);
        }

        @Override
        public void onError(int code, String error) {
            ExtSdkWrapper.onError(result, code, error);
        }
    });
}
```

- [ ] **Step 3: Replace contact list server query methods**

Replace `getAllContactsFromServer` with:

```java
public void getAllContactsFromServer(JSONObject params, String channelName, ExtSdkCallback result)
    throws JSONException {
    EMClient.getInstance().contactManager().asyncGetAllContactsFromServer(new EMValueCallBack<List<String>>() {
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
```

Replace `getBlockListFromServer` with:

```java
public void getBlockListFromServer(JSONObject params, String channelName, ExtSdkCallback result)
    throws JSONException {
    EMClient.getInstance().contactManager().asyncGetBlackListFromServer(new EMValueCallBack<List<String>>() {
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
```

Replace `getSelfIdsOnOtherPlatform` with:

```java
public void getSelfIdsOnOtherPlatform(JSONObject params, String channelName, ExtSdkCallback result)
    throws JSONException {
    EMClient.getInstance().contactManager().asyncGetSelfIdsOnOtherPlatform(new EMValueCallBack<List<String>>() {
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
```

- [ ] **Step 4: Replace contact mutation methods that return username**

Replace `addUserToBlockList` with:

```java
public void addUserToBlockList(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
    String username = params.getString("username");
    EMClient.getInstance().contactManager().asyncAddUserToBlackList(username, false, new EMCallBack() {
        @Override
        public void onSuccess() {
            ExtSdkWrapper.onSuccess(result, channelName, username);
        }

        @Override
        public void onError(int code, String error) {
            ExtSdkWrapper.onError(result, code, error);
        }
    });
}
```

Replace `removeUserFromBlockList` with:

```java
public void removeUserFromBlockList(JSONObject params, String channelName, ExtSdkCallback result)
    throws JSONException {
    String username = params.getString("username");
    EMClient.getInstance().contactManager().asyncRemoveUserFromBlackList(username, new EMCallBack() {
        @Override
        public void onSuccess() {
            ExtSdkWrapper.onSuccess(result, channelName, username);
        }

        @Override
        public void onError(int code, String error) {
            ExtSdkWrapper.onError(result, code, error);
        }
    });
}
```

Replace `acceptInvitation` with:

```java
public void acceptInvitation(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
    String username = params.getString("username");
    EMClient.getInstance().contactManager().asyncAcceptInvitation(username, new EMCallBack() {
        @Override
        public void onSuccess() {
            ExtSdkWrapper.onSuccess(result, channelName, username);
        }

        @Override
        public void onError(int code, String error) {
            ExtSdkWrapper.onError(result, code, error);
        }
    });
}
```

Replace `declineInvitation` with:

```java
public void declineInvitation(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
    String username = params.getString("username");
    EMClient.getInstance().contactManager().asyncDeclineInvitation(username, new EMCallBack() {
        @Override
        public void onSuccess() {
            ExtSdkWrapper.onSuccess(result, channelName, username);
        }

        @Override
        public void onError(int code, String error) {
            ExtSdkWrapper.onError(result, code, error);
        }
    });
}
```

- [ ] **Step 5: Remove unused contact import if needed**

After the replacements, run:

```bash
rg -n "HyphenateException" modules/java/com/chatsdk/dispatch/ExtSdkContactManagerWrapper.java -g '!*.md'
```

Expected: output may include the import line. There should be no catch block usage unless a later untouched contact method still catches `HyphenateException`.

If the only output is the import line, remove this import:

```java
import com.hyphenate.exceptions.HyphenateException;
```

- [ ] **Step 6: Add TypeScript platform note for `deleteContact`**

Update the JSDoc for `ChatContactManager.deleteContact` in `src/ChatContactManager.ts`.

Required content:

- Explain that on Android, this method uses the Android SDK async delete-contact API.
- Explain that the Android SDK async delete-contact API does not accept `keepConversation`, so the parameter is not passed through on Android.
- Explain that iOS is not affected by this Android SDK async API limitation.
- Do not change the method signature or runtime code.

Do not add a TypeScript platform note for `ChatRoomManager.fetchChatRoomInfoFromServer`; the TypeScript API does not expose `fetchMembers`.

- [ ] **Step 7: Commit contact wrapper and documentation changes**

Run:

```bash
git diff -- modules/java/com/chatsdk/dispatch/ExtSdkContactManagerWrapper.java
git diff -- src/ChatContactManager.ts
git add modules/java/com/chatsdk/dispatch/ExtSdkContactManagerWrapper.java src/ChatContactManager.ts
git commit -m "fix(android): use async contact wrapper APIs"
```

Expected: commit succeeds. If `git add` or `git commit` fails because `.git` writes require approval in this environment, rerun the same git command with escalated permissions.

## Task 2: Convert Chat Room Wrapper

**Files:**
- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkChatRoomManagerWrapper.java`

- [ ] **Step 1: Replace `fetchChatRoomInfoFromServer` with approved async behavior**

Replace the whole method with this code. It intentionally ignores legacy `fetchMembers`; the active TypeScript API does not pass it.

```java
public void fetchChatRoomInfoFromServer(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");

    EMClient.getInstance().chatroomManager().asyncFetchChatRoomFromServer(
        roomId, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

- [ ] **Step 2: Replace chat room creation and void mutations**

Replace `createChatRoom` with:

```java
public void createChatRoom(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String subject = param.getString("subject");
    String description = param.getString("desc");
    String welcomeMessage = param.getString("welcomeMsg");
    int maxUserCount = param.getInt("maxUserCount");
    JSONArray members = param.getJSONArray("members");
    List<String> membersList = new ArrayList<>();
    for (int i = 0; i < members.length(); i++) {
        membersList.add((String)members.get(i));
    }
    EMClient.getInstance().chatroomManager().asyncCreateChatRoom(
        subject, description, welcomeMessage, maxUserCount, membersList, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

Replace `destroyChatRoom` with:

```java
public void destroyChatRoom(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String roomId = param.getString("roomId");
    EMClient.getInstance().chatroomManager().asyncDestroyChatRoom(roomId, new EMCallBack() {
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
```

Replace `updateChatRoomAnnouncement` with:

```java
public void updateChatRoomAnnouncement(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");
    String announcement = param.getString("announcement");
    EMClient.getInstance().chatroomManager().asyncUpdateChatRoomAnnouncement(roomId, announcement, new EMCallBack() {
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
```

- [ ] **Step 3: Replace chat room methods returning `EMChatRoom`**

Use the same callback shape for each method in this step: call the listed async API and return `ExtSdkChatRoomHelper.toJson(value)` from `onSuccess`.

Replace `changeChatRoomSubject` with:

```java
public void changeChatRoomSubject(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");
    String subject = param.getString("subject");
    EMClient.getInstance().chatroomManager().asyncChangeChatRoomSubject(
        roomId, subject, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

Replace `changeChatRoomDescription` with:

```java
public void changeChatRoomDescription(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");
    String description = param.getString("description");
    EMClient.getInstance().chatroomManager().asyncChangeChatroomDescription(
        roomId, description, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

Replace `muteChatRoomMembers` with:

```java
public void muteChatRoomMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String roomId = param.getString("roomId");
    long duration = param.getLong("duration");
    JSONArray muteMembers = param.getJSONArray("muteMembers");
    List<String> muteMembersList = new ArrayList<>();
    for (int i = 0; i < muteMembers.length(); i++) {
        muteMembersList.add((String)muteMembers.get(i));
    }
    EMClient.getInstance().chatroomManager().asyncMuteChatRoomMembers(
        roomId, muteMembersList, duration, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

Replace `unMuteChatRoomMembers` with:

```java
public void unMuteChatRoomMembers(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");
    JSONArray muteMembers = param.getJSONArray("unMuteMembers");
    List<String> unMuteMembersList = new ArrayList<>();
    for (int i = 0; i < muteMembers.length(); i++) {
        unMuteMembersList.add((String)muteMembers.get(i));
    }
    EMClient.getInstance().chatroomManager().asyncUnMuteChatRoomMembers(
        roomId, unMuteMembersList, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

Replace `changeChatRoomOwner` with:

```java
public void changeChatRoomOwner(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String roomId = param.getString("roomId");
    String newOwner = param.getString("newOwner");
    EMClient.getInstance().chatroomManager().asyncChangeOwner(
        roomId, newOwner, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

Replace `addChatRoomAdmin` with:

```java
public void addChatRoomAdmin(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String roomId = param.getString("roomId");
    String admin = param.getString("admin");
    EMClient.getInstance().chatroomManager().asyncAddChatRoomAdmin(
        roomId, admin, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

Replace `removeChatRoomAdmin` with:

```java
public void removeChatRoomAdmin(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String roomId = param.getString("roomId");
    String admin = param.getString("admin");
    EMClient.getInstance().chatroomManager().asyncRemoveChatRoomAdmin(
        roomId, admin, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

- [ ] **Step 4: Replace chat room list and cursor query methods**

Replace `fetchChatRoomMembers` with:

```java
public void fetchChatRoomMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String roomId = param.getString("roomId");
    String cursor = null;
    if (param.has("cursor")) {
        cursor = param.getString("cursor");
    }
    int pageSize = param.getInt("pageSize");
    EMClient.getInstance().chatroomManager().asyncFetchChatRoomMembers(
        roomId, cursor, pageSize, new EMValueCallBack<EMCursorResult<String>>() {
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
```

Replace `fetchChatRoomMuteList` with:

```java
public void fetchChatRoomMuteList(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");
    int pageNum = param.getInt("pageNum");
    int pageSize = param.getInt("pageSize");
    EMClient.getInstance().chatroomManager().asyncFetchChatRoomMuteList(
        roomId, pageNum, pageSize, new EMValueCallBack<Map<String, Long>>() {
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
```

Replace `fetchChatRoomBlockList` with:

```java
public void fetchChatRoomBlockList(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");
    int pageNum = param.getInt("pageNum");
    int pageSize = param.getInt("pageSize");
    EMClient.getInstance().chatroomManager().asyncFetchChatRoomBlackList(
        roomId, pageNum, pageSize, new EMValueCallBack<List<String>>() {
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
```

Replace `fetchChatRoomAnnouncement` with:

```java
public void fetchChatRoomAnnouncement(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");
    EMClient.getInstance().chatroomManager().asyncFetchChatRoomAnnouncement(
        roomId, new EMValueCallBack<String>() {
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
```

- [ ] **Step 5: Replace chat room member mutation methods returning `EMChatRoom`**

Replace `removeChatRoomMembers` with:

```java
public void removeChatRoomMembers(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");
    JSONArray members = param.getJSONArray("members");
    List<String> membersList = new ArrayList<>();
    for (int i = 0; i < members.length(); i++) {
        membersList.add((String)members.get(i));
    }
    EMClient.getInstance().chatroomManager().asyncRemoveChatRoomMembers(
        roomId, membersList, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

Replace `blockChatRoomMembers` with:

```java
public void blockChatRoomMembers(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String roomId = param.getString("roomId");
    JSONArray blockMembers = param.getJSONArray("members");
    List<String> blockMembersList = new ArrayList<>();
    for (int i = 0; i < blockMembers.length(); i++) {
        blockMembersList.add((String)blockMembers.get(i));
    }
    EMClient.getInstance().chatroomManager().asyncBlockChatroomMembers(
        roomId, blockMembersList, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

Replace `unBlockChatRoomMembers` with:

```java
public void unBlockChatRoomMembers(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String roomId = param.getString("roomId");
    JSONArray blockMembers = param.getJSONArray("members");
    List<String> blockMembersList = new ArrayList<>();
    for (int i = 0; i < blockMembers.length(); i++) {
        blockMembersList.add((String)blockMembers.get(i));
    }
    EMClient.getInstance().chatroomManager().asyncUnBlockChatRoomMembers(
        roomId, blockMembersList, new EMValueCallBack<EMChatRoom>() {
            @Override
            public void onSuccess(EMChatRoom value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatRoomHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
}
```

- [ ] **Step 6: Ensure chat room imports include `EMCallBack`**

The file currently imports callback types near the top. Confirm `EMCallBack` is present:

```bash
rg -n "import com\\.hyphenate\\.EMCallBack;" modules/java/com/chatsdk/dispatch/ExtSdkChatRoomManagerWrapper.java
```

Expected output includes:

```text
import com.hyphenate.EMCallBack;
```

If not present, add this import with the other `com.hyphenate` imports:

```java
import com.hyphenate.EMCallBack;
```

Then check whether `HyphenateException` is still used:

```bash
rg -n "HyphenateException" modules/java/com/chatsdk/dispatch/ExtSdkChatRoomManagerWrapper.java
```

Expected: output may include the import line. There should be no catch block usage unless an untouched chat room method still catches `HyphenateException`. If the only output is the import line, remove:

```java
import com.hyphenate.exceptions.HyphenateException;
```

- [ ] **Step 7: Commit chat room wrapper changes**

Run:

```bash
git diff -- modules/java/com/chatsdk/dispatch/ExtSdkChatRoomManagerWrapper.java
git add modules/java/com/chatsdk/dispatch/ExtSdkChatRoomManagerWrapper.java
git commit -m "fix(android): use async chat room wrapper APIs"
```

Expected: commit succeeds. If `.git` writes are blocked, rerun the git command with escalated permissions.

## Task 3: Convert Group Wrapper

**Files:**
- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkGroupManagerWrapper.java`

- [ ] **Step 1: Replace `getGroupSpecificationFromServer` with approved async behavior**

Replace the whole method with this code. It intentionally ignores legacy `fetchMembers`; the active TypeScript API using this native method fetches group info without members.

```java
public void getGroupSpecificationFromServer(JSONObject param, String channelName, ExtSdkCallback result)
    throws JSONException {
    String groupId = param.getString("groupId");
    EMClient.getInstance().groupManager().asyncGetGroupFromServer(
        groupId, new EMValueCallBack<EMGroup>() {
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
```

- [ ] **Step 2: Replace `addMembers` with approved async behavior**

Replace the whole method with this code. It intentionally ignores legacy `welcome` because the async SDK API does not accept it and the spec approved that difference.

```java
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

    EMClient.getInstance().groupManager().asyncAddUsersToGroup(groupId, members, new EMCallBack() {
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
```

- [ ] **Step 3: Add TypeScript platform note for `addMembers`**

Update the JSDoc for `ChatGroupManager.addMembers` in `src/ChatGroupManager.ts`.

Required content:

- Explain that on Android, this method uses the Android SDK async add-users-to-group API.
- Explain that the Android SDK async add-users-to-group API does not accept `welcome`, so the parameter is not passed through on Android.
- Explain that iOS is not affected by this Android SDK async API limitation.
- Do not change the method signature or runtime code.

Do not add a TypeScript platform note for `ChatGroupManager.fetchGroupInfoFromServer` or `ChatGroupManager.fetchGroupInfoWithoutMembersFromServer` about `isFetchMembers`. `fetchGroupInfoFromServer` is deprecated, and the active replacement `fetchGroupInfoWithoutMembersFromServer` does not expose `isFetchMembers`.

- [ ] **Step 4: Check imports**

Run:

```bash
rg -n "HyphenateException|EMCallBack|EMValueCallBack" modules/java/com/chatsdk/dispatch/ExtSdkGroupManagerWrapper.java
```

Expected:

- `EMCallBack` remains imported and used by many methods.
- `EMValueCallBack` remains imported and used by many methods.
- `HyphenateException` may still be used elsewhere in this large wrapper. Remove its import only if `rg` shows no usage after the import line is ignored.

- [ ] **Step 5: Commit group wrapper and documentation changes**

Run:

```bash
git diff -- modules/java/com/chatsdk/dispatch/ExtSdkGroupManagerWrapper.java
git diff -- src/ChatGroupManager.ts
git add modules/java/com/chatsdk/dispatch/ExtSdkGroupManagerWrapper.java src/ChatGroupManager.ts
git commit -m "fix(android): use async group wrapper APIs"
```

Expected: commit succeeds. If `.git` writes are blocked, rerun the git command with escalated permissions.

## Task 4: Convert Chat Recall Wrapper

**Files:**
- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java`

- [ ] **Step 1: Replace `recallMessage` with async recall**

Replace the whole method with this code:

```java
public void recallMessage(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
    String msgId = param.getString("msg_id");
    String ext;
    if (param.has("ext")) {
        ext = param.getString("ext");
    } else {
        ext = null;
    }
    EMMessage msg = EMClient.getInstance().chatManager().getMessage(msgId);
    if (ExtSdkWrapper.checkMessageParams(msg, channelName, result)) {
        return;
    }
    EMClient.getInstance().chatManager().asyncRecallMessage(msg, ext, new EMCallBack() {
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
```

- [ ] **Step 2: Confirm `EMCallBack` import is present**

Run:

```bash
rg -n "import com\\.hyphenate\\.EMCallBack;" modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java
```

Expected output includes:

```text
import com.hyphenate.EMCallBack;
```

If not present, add this import with other `com.hyphenate` imports:

```java
import com.hyphenate.EMCallBack;
```

- [ ] **Step 3: Commit chat recall change**

Run:

```bash
git diff -- modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java
git add modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java
git commit -m "fix(android): use async recall wrapper API"
```

Expected: commit succeeds. If `.git` writes are blocked, rerun the git command with escalated permissions.

## Task 5: Convert Push Nickname Wrapper

**Files:**
- Modify: `modules/java/com/chatsdk/dispatch/ExtSdkPushManagerWrapper.java`

- [ ] **Step 1: Replace `updatePushNickname` with async callback**

Replace the whole method with this code:

```java
public void updatePushNickname(JSONObject params, String channelName, ExtSdkCallback result) throws JSONException {
    String nickname = params.getString("nickname");
    EMClient.getInstance().pushManager().asyncUpdatePushNickname(nickname, new EMCallBack() {
        @Override
        public void onSuccess() {
            ExtSdkWrapper.onSuccess(result, channelName, nickname);
        }

        @Override
        public void onError(int code, String error) {
            ExtSdkWrapper.onError(result, code, error);
        }
    });
}
```

- [ ] **Step 2: Check imports**

Run:

```bash
rg -n "HyphenateException|EMCallBack" modules/java/com/chatsdk/dispatch/ExtSdkPushManagerWrapper.java
```

Expected:

- `EMCallBack` remains imported and used by multiple methods.
- `HyphenateException` remains if `getImPushConfigFromServer` still catches it. Do not remove it while that method uses it.

- [ ] **Step 3: Commit push wrapper change**

Run:

```bash
git diff -- modules/java/com/chatsdk/dispatch/ExtSdkPushManagerWrapper.java
git add modules/java/com/chatsdk/dispatch/ExtSdkPushManagerWrapper.java
git commit -m "fix(android): use async push nickname API"
```

Expected: commit succeeds. If `.git` writes are blocked, rerun the git command with escalated permissions.

## Task 6: Verify Deprecated APIs Were Not Converted

**Files:**
- Inspect: `modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java`

- [ ] **Step 1: Confirm deprecated `getConversationsFromServer` still uses sync path**

Run:

```bash
rg -n "fetchConversationsFromServer\\(\\)|asyncFetchConversationsFromServer" modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java
```

Expected:

```text
EMClient.getInstance().chatManager().fetchConversationsFromServer()
```

There should be no new `asyncFetchConversationsFromServer` call for this deprecated API.

- [ ] **Step 2: Confirm deprecated `fetchHistoryMessages` still uses sync path**

Run:

```bash
rg -n "fetchHistoryMessages\\(|asyncFetchHistoryMessages" modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java
```

Expected:

- The deprecated `fetchHistoryMessages` method still calls sync `fetchHistoryMessages(...)`.
- The existing non-deprecated `fetchHistoryMessagesByOptions` method still calls `asyncFetchHistoryMessages(...)`.

- [ ] **Step 3: Confirm only approved Java and TypeScript documentation files changed**

Run:

```bash
git diff --name-only HEAD
```

Expected output includes only files under:

```text
modules/java/com/chatsdk/dispatch/
```

It may also include these TypeScript documentation-only files:

```text
src/ChatContactManager.ts
src/ChatGroupManager.ts
```

If the plan document itself is still uncommitted, it may also appear under:

```text
docs/superpowers/plans/
docs/superpowers/specs/
```

Do not proceed with unrelated file changes. Do not allow TypeScript runtime, signature, constant, iOS, Flutter, or generated `lib/` changes.

## Task 7: Full Validation

**Files:**
- Inspect build and test output only.

- [ ] **Step 1: Run TypeScript typecheck**

Run:

```bash
yarn typecheck
```

Expected: command exits with status 0.

- [ ] **Step 2: Run Android compile check**

Run:

```bash
yarn example build:android
```

Expected: command exits with status 0 and compiles the Android Java wrappers.

If the command fails because of local Android SDK, Gradle cache, emulator, or environment configuration unrelated to the Java edits, record the exact failure summary and continue to the next verification step. If it fails with Java compile errors in the edited wrapper files, fix those errors before continuing.

- [ ] **Step 3: Run Jest tests**

Run:

```bash
yarn test --no-watchman
```

Expected: command exits with status 0. These tests do not directly cover Java wrapper behavior, but they confirm the TS side was not unintentionally disturbed.

- [ ] **Step 4: Run final status and diff review**

Run:

```bash
git status --short
git diff --check
git diff --stat HEAD
```

Expected:

- `git diff --check` exits with status 0.
- Only intended Android wrapper changes and approved TypeScript documentation comments remain uncommitted if previous task commits were skipped.

- [ ] **Step 5: Commit validation fixes if any**

If validation required Java fixes or approved TypeScript documentation comment fixes after the task commits, commit only those fixes:

```bash
git add modules/java/com/chatsdk/dispatch/ExtSdkContactManagerWrapper.java modules/java/com/chatsdk/dispatch/ExtSdkChatRoomManagerWrapper.java modules/java/com/chatsdk/dispatch/ExtSdkGroupManagerWrapper.java modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java modules/java/com/chatsdk/dispatch/ExtSdkPushManagerWrapper.java src/ChatContactManager.ts src/ChatGroupManager.ts
git commit -m "fix(android): address async wrapper compile issues"
```

Expected: commit succeeds, or there is nothing to commit because no validation fixes were needed.

## Manual Release Validation

Before release, manually exercise affected features in the example app because native wrapper behavior is not covered by automated tests:

- Contact add/delete/block/unblock/invite accept/invite decline/server list queries.
- Chat room create/destroy/update/info/member admin/mute/block/list/announcement flows.
- Group info fetch without members and add members.
- Message recall.
- Push nickname update.
