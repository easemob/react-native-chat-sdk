mapping = {
    # Core SDK components
    "HyphenateChat": "AgoraChat",
    "EMClient": "AgoraChatClient",
    "EMOptions": "AgoraChatOptions",
    "EMDeviceConfig": "AgoraChatDeviceConfig",
    "EMLog": "AgoraChatLog",
    "EMDefine": "AgoraChatDefine",
    "EMClientDelegate": "AgoraChatClientDelegate",
    "EMMulti": "AgoraChatMulti",
    "EMServer": "AgoraChatServer",
    # Utility classes
    "EMStringUtil": "AgoraChatStringUtil",
    "EMDownloadStatus": "AgoraChatDownloadStatus",
    "EMCommonDefs": "AgoraChatCommonDefs",
    # "EMEncrypt": "AgoraEncrypt",
    "EMImageUtil": "AgoraChatImageUtil",
    "EMDataUtil": "AgoraChatDataUtil",
    "EMDictionaryUtil": "AgoraChatDictionaryUtil",
    "EMError": "AgoraChatError",
    # Message related classes
    "EMChatMessage": "AgoraChatMessage",
    "EMMessageStatus": "AgoraChatMessageStatus",
    "EMMessageDirection": "AgoraChatMessageDirection",
    "EMMessageBody": "AgoraChatMessageBody",
    "EMMessageUtil": "AgoraChatMessageUtil",
    "EMMessageBodyType": "AgoraChatMessageBodyType",
    # Message body types
    "EMCmdMessageBody": "AgoraChatCmdMessageBody",
    "EMCustomMessageBody": "AgoraChatCustomMessageBody",
    "EMFileMessageBody": "AgoraChatFileMessageBody",
    "EMImageMessageBody": "AgoraChatImageMessageBody",
    "EMLocationMessageBody": "AgoraChatLocationMessageBody",
    "EMTextMessageBody": "AgoraChatTextMessageBody",
    "EMVideoMessageBody": "AgoraChatVideoMessageBody",
    "EMVoiceMessageBody": "AgoraChatVoiceMessageBody",
    "EMCombineMessageBody": "AgoraChatCombineMessageBody",
    # Chat features
    "EMConversation": "AgoraChatConversation",
    "EMGroupMessageAck": "AgoraChatGroupMessageAck",
    "EMManager": "AgoraChatBaseManager",
    "EMMulticastDelegate": "AgoraChatMulticastDelegate",
    "EMReachability": "AgoraChatReachability",
    "EMChat": "AgoraChat",
    "EMContact": "AgoraChatContact",
    "EMChatroom": "AgoraChatroom",
    "EMGroup": "AgoraChatGroup",
    # Thread related
    "EMSDKThread": "AgoraChatThread",
    "IEMThread": "IAgoraChatThread",
    "EMThread": "AgoraChatThread",
    # Additional features
    "EMPush": "AgoraChatPush",
    "EMUserInfo": "AgoraChatUserInfo",
    "EMCursorResult": "AgoraChatCursorResult",
    "EMPageResult": "AgoraChatPageResult",
    "EMConnection": "AgoraChatConnection",
    "EMHTTP": "AgoraChatHTTP",
    "EMSilentMode": "AgoraChatSilentMode",
    "EMFetchServerMessagesOption": "AgoraChatFetchServerMessagesOption",
    # Connection and notification
    "EMConnectionState": "AgoraChatConnectionState",
    "EMLocalNotification": "AgoraChatLocalNotification",
    # Translation features
    "EMTranslate": "AgoraChatTranslate",
    "EMTranslation": "AgoraChatTranslation",
    # Presence and reactions
    "EMPresence": "AgoraChatPresence",
    "EMReaction": "AgoraChatReaction",
    # Swift bridge
    "EMBridgeHeader": "AgoraChatBridgeHeader",
    "EMMessage": "AgoraChatMessage",
    "EMRecallMessageInfo": "AgoraChatRecallMessageInfo",
    "EMNotificationState": "AgoraChatNotificationState",
    "EMWillPresentNotification": "AgoraChatWillPresentNotification",
    "EMDidReceiveNotificationResponse": "AgoraChatDidReceiveNotificationResponse",
    # Message statistics
    "EMChatMessageStatistics": "AgoraChatMessageStatistics",
    "EMStatisticsManager": "AgoraChatStatisticsManager",
    "EMContact": "AgoraChatContact",
    "EMConversationFilter": "AgoraChatConversationFilter",
    "EMMarkType": "AgoraChatMarkType",
}

# Sort keys by length in descending order to avoid replacement issues
sorted_keys = sorted(mapping.keys(), key=len, reverse=True)
