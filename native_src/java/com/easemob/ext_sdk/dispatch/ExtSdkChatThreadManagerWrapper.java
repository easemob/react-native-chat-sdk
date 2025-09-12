package com.easemob.ext_sdk.dispatch;

import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.easemob.ext_sdk.common.ExtSdkMethodType;
import com.hyphenate.EMCallBack;
import com.hyphenate.EMChatThreadChangeListener;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMChatThread;
import com.hyphenate.chat.EMChatThreadEvent;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMConversation;
import com.hyphenate.chat.EMCursorResult;
import com.hyphenate.chat.EMMessage;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ExtSdkChatThreadManagerWrapper extends ExtSdkWrapper {
    public static class SingleHolder {
        static ExtSdkChatThreadManagerWrapper instance = new ExtSdkChatThreadManagerWrapper();
    }

    public static ExtSdkChatThreadManagerWrapper getInstance() {
        return ExtSdkChatThreadManagerWrapper.SingleHolder.instance;
    }

    ExtSdkChatThreadManagerWrapper() { registerEaseListener(); }

    private void registerEaseListener() {
        if (this.threadChangeListener != null) {
            EMClient.getInstance().chatThreadManager().removeChatThreadChangeListener(this.threadChangeListener);
        }
        this.threadChangeListener = new EMChatThreadChangeListener() {
            @Override
            public void onChatThreadCreated(EMChatThreadEvent event) {
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onChatThreadCreated,
                                        ExtSdkChatThreadEventHelper.toJson(event));
            }

            @Override
            public void onChatThreadUpdated(EMChatThreadEvent event) {
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onChatThreadUpdated,
                                        ExtSdkChatThreadEventHelper.toJson(event));
            }

            @Override
            public void onChatThreadDestroyed(EMChatThreadEvent event) {
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onChatThreadDestroyed,
                                        ExtSdkChatThreadEventHelper.toJson(event));
            }

            @Override
            public void onChatThreadUserRemoved(EMChatThreadEvent event) {
                ExtSdkWrapper.onReceive(ExtSdkMethodType.onChatThreadUserRemoved,
                                        ExtSdkChatThreadEventHelper.toJson(event));
            }
        };
        EMClient.getInstance().chatThreadManager().addChatThreadChangeListener(this.threadChangeListener);
    }

    public void fetchChatThreadDetail(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String threadId = param.getString("threadId");
        EMClient.getInstance().chatThreadManager().getChatThreadFromServer(
            threadId, new EMValueCallBack<EMChatThread>() {
                @Override
                public void onSuccess(EMChatThread value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatThreadHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }
    public void fetchJoinedChatThreads(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String cursor = param.getString("cursor");
        int pageSize = param.getInt("pageSize");
        EMClient.getInstance().chatThreadManager().getJoinedChatThreadsFromServer(
            pageSize, cursor, new EMValueCallBack<EMCursorResult<EMChatThread>>() {
                @Override
                public void onSuccess(EMCursorResult<EMChatThread> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkCursorResultHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }
    public void fetchChatThreadsWithParentId(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String parentId = param.getString("parentId");
        String cursor = param.getString("cursor");
        int pageSize = param.getInt("pageSize");
        EMClient.getInstance().chatThreadManager().getChatThreadsFromServer(
            parentId, pageSize, cursor, new EMValueCallBack<EMCursorResult<EMChatThread>>() {
                @Override
                public void onSuccess(EMCursorResult<EMChatThread> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkCursorResultHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }
    public void fetchJoinedChatThreadsWithParentId(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String parentId = param.getString("parentId");
        String cursor = param.getString("cursor");
        int pageSize = param.getInt("pageSize");
        EMClient.getInstance().chatThreadManager().getJoinedChatThreadsFromServer(
            parentId, pageSize, cursor, new EMValueCallBack<EMCursorResult<EMChatThread>>() {
                @Override
                public void onSuccess(EMCursorResult<EMChatThread> value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkCursorResultHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }
    public void fetchChatThreadMember(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String threadId = param.getString("threadId");
        String cursor = param.getString("cursor");
        int pageSize = param.getInt("pageSize");
        EMClient.getInstance().chatThreadManager().getChatThreadMembers(
            threadId, pageSize, cursor, new EMValueCallBack<EMCursorResult<String>>() {
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
    public void fetchLastMessageWithChatThreads(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        List<String> list = new ArrayList<String>();
        JSONArray array = param.getJSONArray("threadIds");
        for (int i = 0; i < array.length(); i++) {
            list.add(array.getString(i));
        }
        EMClient.getInstance().chatThreadManager().getChatThreadLatestMessage(
            list, new EMValueCallBack<Map<String, EMMessage>>() {
                @Override
                public void onSuccess(Map<String, EMMessage> value) {
                    Map<String, Object> data = new HashMap<>();
                    for (Map.Entry<String, EMMessage> item : value.entrySet()) {
                        data.put(item.getKey(), ExtSdkMessageHelper.toJson(item.getValue()));
                    }
                    ExtSdkWrapper.onSuccess(result, channelName, data);
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }
    public void removeMemberFromChatThread(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String threadId = param.getString("threadId");
        String memberId = param.getString("memberId");
        EMClient.getInstance().chatThreadManager().removeMemberFromChatThread(threadId, memberId, new EMCallBack() {
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
    public void updateChatThreadSubject(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        String threadId = param.getString("threadId");
        String name = param.getString("name");
        EMClient.getInstance().chatThreadManager().updateChatThreadName(threadId, name, new EMCallBack() {
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
    public void createChatThread(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String name = param.getString("name");
        String messageId = param.getString("messageId");
        String parentId = param.getString("parentId");
        EMClient.getInstance().chatThreadManager().createChatThread(
            parentId, messageId, name, new EMValueCallBack<EMChatThread>() {
                @Override
                public void onSuccess(EMChatThread value) {
                    ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatThreadHelper.toJson(value));
                }

                @Override
                public void onError(int error, String errorMsg) {
                    ExtSdkWrapper.onError(result, error, errorMsg);
                }
            });
    }
    public void joinChatThread(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String threadId = param.getString("threadId");
        EMClient.getInstance().chatThreadManager().joinChatThread(threadId, new EMValueCallBack<EMChatThread>() {
            @Override
            public void onSuccess(EMChatThread value) {
                ExtSdkWrapper.onSuccess(result, channelName, ExtSdkChatThreadHelper.toJson(value));
            }

            @Override
            public void onError(int error, String errorMsg) {
                ExtSdkWrapper.onError(result, error, errorMsg);
            }
        });
    }
    public void leaveChatThread(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String threadId = param.getString("threadId");
        EMClient.getInstance().chatThreadManager().leaveChatThread(threadId, new EMCallBack() {
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
    public void destroyChatThread(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String threadId = param.getString("threadId");
        EMClient.getInstance().chatThreadManager().destroyChatThread(threadId, new EMCallBack() {
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
    public void getMessageThread(JSONObject param, String channelName, ExtSdkCallback result) throws JSONException {
        String msgId = param.getString("msgId");
        EMMessage msg = EMClient.getInstance().chatManager().getMessage(msgId);
        if (ExtSdkWrapper.getMessageParams(msg, channelName, result)) {
            return;
        }
        if (!msg.isChatThreadMessage()) {
            EMChatThread info = msg.getChatThread();
            ExtSdkWrapper.onSuccess(result, channelName, info != null ? ExtSdkChatThreadHelper.toJson(info) : null);
        } else {
            ExtSdkWrapper.onSuccess(result, channelName, null);
        }
    }
    public void getThreadConversation(JSONObject param, String channelName, ExtSdkCallback result)
        throws JSONException {
        if (!param.has("isChatThread")) {
            param.put("isChatThread", true);
        }

        EMConversation conversation = this.getConversation(param);
        ExtSdkWrapper.onSuccess(result, channelName, ExtSdkConversationHelper.toJson(conversation));
    }

    private EMChatThreadChangeListener threadChangeListener = null;
}
