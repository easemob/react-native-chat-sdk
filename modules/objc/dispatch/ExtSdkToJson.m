#import "ExtSdkToJson.h"

#import <HyphenateChat/EMClient.h>
#import <HyphenateChat/EMOptions+PrivateDeploy.h>

@implementation ExtSdkConvertHelper

+ (int)conversationTypeToInt:(EMConversationType)aType {
    int ret = 0;
    switch (aType) {
    case EMConversationTypeChat:
        ret = 0;
        break;
    case EMConversationTypeGroupChat:
        ret = 1;
        break;
    case EMConversationTypeChatRoom:
        ret = 2;
        break;
    default:
        break;
    }
    return ret;
}

+ (EMConversationType)conversationTypeFromInt:(int)aType {
    EMConversationType ret = EMConversationTypeChat;
    switch (aType) {
    case 0:
        ret = EMConversationTypeChat;
        break;
    case 1:
        ret = EMConversationTypeGroupChat;
        break;
    case 2:
        ret = EMConversationTypeChatRoom;
        break;
    default:
        break;
    }
    return ret;
}

+ (int)roomPremissionTypeToInt:(EMChatroomPermissionType)type {
    int ret = -1;
    switch (type) {
    case EMChatroomPermissionTypeNone: {
        ret = -1;
    } break;
    case EMChatroomPermissionTypeMember: {
        ret = 0;
    } break;
    case EMChatroomPermissionTypeAdmin: {
        ret = 1;
    } break;
    case EMChatroomPermissionTypeOwner: {
        ret = 2;
    } break;
    default:
        break;
    }
    return ret;
}

+ (int)groupPremissionTypeToInt:(EMGroupPermissionType)type {
    int ret = -1;
    switch (type) {
    case EMGroupPermissionTypeNone: {
        ret = -1;
    } break;
    case EMGroupPermissionTypeMember: {
        ret = 0;
    } break;
    case EMGroupPermissionTypeAdmin: {
        ret = 1;
    } break;
    case EMGroupPermissionTypeOwner: {
        ret = 2;
    } break;
    default:
        break;
    }
    return ret;
}

+ (EMGroupPermissionType)groupPremissionTypeFromInt:(int)type {
    EMGroupPermissionType ret = EMGroupPermissionTypeMember;
    switch (type) {
    case -1: {
        ret = EMGroupPermissionTypeNone;
    } break;
    case 0: {
        ret = EMGroupPermissionTypeMember;
    } break;
    case 1: {
        ret = EMGroupPermissionTypeAdmin;
    } break;
    case 2: {
        ret = EMGroupPermissionTypeOwner;
    } break;
    default:
        break;
    }
    return ret;
}

+ (EMGroupStyle)groupStyleFromInt:(int)style {
    EMGroupStyle ret = EMGroupStylePrivateOnlyOwnerInvite;
    switch (style) {
    case 0: {
        ret = EMGroupStylePrivateOnlyOwnerInvite;
    } break;
    case 1: {
        ret = EMGroupStylePrivateMemberCanInvite;
    } break;
    case 2: {
        ret = EMGroupStylePublicJoinNeedApproval;
    } break;
    case 3: {
        ret = EMGroupStylePublicOpenJoin;
    } break;
    default:
        break;
    }

    return ret;
}

+ (int)groupStyleToInt:(EMGroupStyle)style {
    int ret = 0;
    switch (style) {
    case EMGroupStylePrivateOnlyOwnerInvite: {
        ret = 0;
    } break;
    case EMGroupStylePrivateMemberCanInvite: {
        ret = 1;
    } break;
    case EMGroupStylePublicJoinNeedApproval: {
        ret = 2;
    } break;
    case EMGroupStylePublicOpenJoin: {
        ret = 3;
    } break;
    default:
        break;
    }

    return ret;
}

+ (EMChatType)chatTypeFromInt:(int)aType {
    EMChatType type = EMChatTypeChat;
    switch (aType) {
    case 0:
        type = EMChatTypeChat;
        break;
    case 1:
        type = EMChatTypeGroupChat;
        break;
    case 2:
        type = EMChatTypeChatRoom;
        break;
    }

    return type;
}

+ (int)chatTypeToInt:(EMChatType)aType {
    int type;
    switch (aType) {
    case EMChatTypeChat:
        type = 0;
        break;
    case EMChatTypeGroupChat:
        type = 1;
        break;
    case EMChatTypeChatRoom:
        type = 2;
        break;
    }
    return type;
}

+ (EMChatRoomMessagePriority)priorityFromInt:(int)priority {
    EMChatRoomMessagePriority ret = EMChatRoomMessagePriorityNormal;
    switch (priority) {
    case 0:
        ret = EMChatRoomMessagePriorityHigh;
        break;
    case 1:
        ret = EMChatRoomMessagePriorityNormal;
        break;
    case 2:
        ret = EMChatRoomMessagePriorityLow;
        break;
    }

    return ret;
}
+ (int)priorityToInt:(EMChatRoomMessagePriority)priority {
    int ret;
    switch (priority) {
    case EMChatRoomMessagePriorityHigh:
        ret = 0;
        break;
    case EMChatRoomMessagePriorityNormal:
        ret = 1;
        break;
    case EMChatRoomMessagePriorityLow:
        ret = 2;
        break;
    }
    return ret;
}

+ (EMMessageBodyType)messageBodyFromString:(NSString *)aStrType {

    EMMessageBodyType ret = EMMessageBodyTypeText;

    if ([aStrType isEqualToString:@"txt"]) {
        ret = EMMessageBodyTypeText;
    } else if ([aStrType isEqualToString:@"loc"]) {
        ret = EMMessageBodyTypeLocation;
    } else if ([aStrType isEqualToString:@"cmd"]) {
        ret = EMMessageBodyTypeCmd;
    } else if ([aStrType isEqualToString:@"custom"]) {
        ret = EMMessageBodyTypeCustom;
    } else if ([aStrType isEqualToString:@"file"]) {
        ret = EMMessageBodyTypeFile;
    } else if ([aStrType isEqualToString:@"img"]) {
        ret = EMMessageBodyTypeImage;
    } else if ([aStrType isEqualToString:@"video"]) {
        ret = EMMessageBodyTypeVideo;
    } else if ([aStrType isEqualToString:@"voice"]) {
        ret = EMMessageBodyTypeVoice;
    } else if ([aStrType isEqualToString:@"combine"]) {
        ret = EMMessageBodyTypeCombine;
    }
    return ret;
}

+ (NSString *)messageBodyToString:(EMMessageBodyType)type {
    NSString *ret = @"txt";
    switch (type) {
    case EMMessageBodyTypeText:
        ret = @"txt";
        break;
    case EMMessageBodyTypeLocation:
        ret = @"loc";
        break;
    case EMMessageBodyTypeCmd:
        ret = @"cmd";
        break;
    case EMMessageBodyTypeCustom:
        ret = @"custom";
        break;
    case EMMessageBodyTypeFile:
        ret = @"file";
        break;
    case EMMessageBodyTypeImage:
        ret = @"img";
        break;
    case EMMessageBodyTypeVideo:
        ret = @"video";
        break;
    case EMMessageBodyTypeVoice:
        ret = @"voice";
        break;
    case EMMessageBodyTypeCombine:
        ret = @"combine";
        break;
    default:
        break;
    }

    return ret;
}

+ (AreaCode)AreaCodeFromInt:(int)code {
    AreaCode ret = AreaCodeGLOB;
    switch (code) {
    case 1 << 0:
        ret = AreaCodeCN;
        break;
    case 1 << 1:
        ret = AreaCodeNA;
        break;
    case 1 << 2:
        ret = AreaCodeEU;
        break;
    case 1 << 3:
        ret = AreaCodeAS;
        break;
    case 1 << 4:
        ret = AreaCodeJP;
        break;
    case 1 << 5:
        ret = AreaCodeIN;
        break;
    default:
        ret = AreaCodeGLOB;
        break;
    }
    return ret;
}

+ (EMSilentModeParamType)slientModeParamTypeFromInt:(int)iParamType {
    EMSilentModeParamType ret = EMSilentModeParamTypeRemindType;
    if (iParamType == 0) {
        ret = EMSilentModeParamTypeRemindType;
    } else if (iParamType == 1) {
        ret = EMSilentModeParamTypeDuration;
    } else if (iParamType == 2) {
        ret = EMSilentModeParamTypeInterval;
    }
    return ret;
}
+ (EMPushRemindType)remindTypeFromInt:(int)iRemindTime {
    EMPushRemindType ret = EMPushRemindTypeAll;
    if (iRemindTime == 0) {
        ret = EMPushRemindTypeAll;
    } else if (iRemindTime == 1) {
        ret = EMPushRemindTypeMentionOnly;
    } else if (iRemindTime == 2) {
        ret = EMPushRemindTypeNone;
    }
    return ret;
}
+ (int)remindTypeToInt:(EMPushRemindType)type {
    int ret = 0;
    switch (type) {
    case EMPushRemindTypeAll:
        ret = 0;
        break;
    case EMPushRemindTypeMentionOnly:
        ret = 1;
        break;
    case EMPushRemindTypeNone:
        ret = 2;
        break;
    }
    return ret;
}

+ (EMMessageStatus)messageStatusFromInt:(int)aStatus {
    EMMessageStatus status = EMMessageStatusPending;
    switch (aStatus) {
    case 0: {
        status = EMMessageStatusPending;
    } break;
    case 1: {
        status = EMMessageStatusDelivering;
    } break;
    case 2: {
        status = EMMessageStatusSucceed;
    } break;
    case 3: {
        status = EMMessageStatusFailed;
    } break;
    }

    return status;
}

+ (int)messageStatusToInt:(EMMessageStatus)aStatus {
    int status = 0;
    switch (aStatus) {
    case EMMessageStatusPending: {
        status = 0;
    } break;
    case EMMessageStatusDelivering: {
        status = 1;
    } break;
    case EMMessageStatusSucceed: {
        status = 2;
    } break;
    case EMMessageStatusFailed: {
        status = 3;
    } break;
    }

    return status;
}

+ (EMDownloadStatus)downloadStatusFromInt:(int)aStatus {
    EMDownloadStatus ret = EMDownloadStatusPending;
    switch (aStatus) {
    case 0:
        ret = EMDownloadStatusDownloading;
        break;
    case 1:
        ret = EMDownloadStatusSucceed;
        break;
    case 2:
        ret = EMDownloadStatusFailed;
        break;
    case 3:
        ret = EMDownloadStatusPending;
        break;
    default:
        break;
    }

    return ret;
}

+ (int)downloadStatusToInt:(EMDownloadStatus)aStatus {
    int ret = 0;
    switch (aStatus) {
    case EMDownloadStatusDownloading:
        ret = 0;
        break;
    case EMDownloadStatusSucceed:
        ret = 1;
        break;
    case EMDownloadStatusFailed:
        ret = 2;
        break;
    case EMDownloadStatusPending:
        ret = 3;
        break;
    default:
        break;
    }
    return ret;
}

+ (int)threadOperationToInt:(EMThreadOperation)aType {
    int ret = 0;
    switch (aType) {
    case EMThreadOperationUnknown:
        ret = 0;
        break;
    case EMThreadOperationCreate:
        ret = 1;
        break;
    case EMThreadOperationUpdate:
        ret = 2;
        break;
    case EMThreadOperationDelete:
        ret = 3;
        break;
    case EMThreadOperationUpdate_msg:
        ret = 4;
        break;
    case EMThreadOperationUserRemoved:
        ret = 5;
        break;
    }

    return ret;
}

+ (EMMessageSearchDirection)searchDirectionFromString:(NSString *)aType {
    EMMessageSearchDirection ret = EMMessageSearchDirectionUp;
    if ([aType isEqualToString:@"up"]) {
        ret = EMMessageSearchDirectionUp;
    } else if ([aType isEqualToString:@"down"]) {
        ret = EMMessageSearchDirectionDown;
    }
    return ret;
}
+ (NSString *)searchDirectionToString:(EMMessageSearchDirection)direction {
    NSString *ret = @"up";
    switch (direction) {
    case EMMessageSearchDirectionUp:
        ret = @"up";
        break;
    case EMMessageSearchDirectionDown:
        ret = @"down";
        break;

    default:
        break;
    }
    return ret;
}
+ (EMMessageSearchScope)searchScopeFromInt:(int)aType {
    EMMessageSearchScope ret = EMMessageSearchScopeAll;
    switch (aType) {
    case 0:
        ret = EMMessageSearchScopeContent;
        break;
    case 1:
        ret = EMMessageSearchScopeExt;
        break;
    case 2:
        ret = EMMessageSearchScopeAll;
        break;

    default:
        break;
    }
    return ret;
}
+ (int)searchScopeToInt:(EMMessageSearchScope)scope {
    int ret = 0;
    switch (scope) {
    case EMMessageSearchScopeContent:
        ret = 0;
        break;
    case EMMessageSearchScopeExt:
        ret = 1;
        break;
    case EMMessageSearchScopeAll:
        ret = 2;
        break;

    default:
        break;
    }
    return ret;
}
+ (int)streamChunkStatus:(EMStreamChunkStatus)status {
  int ret = 4;
  switch (status) {
    case EMStreamChunkStatusStart:
      ret = 0;
      break;
    case EMStreamChunkStatusStartAndComplete:
      ret = 1;
      break;
    case EMStreamChunkStatusProgress:
      ret = 2;
      break;
    case EMStreamChunkStatusComplete:
      ret = 3;
      break;
    case EMStreamChunkStatusError:
      ret = 4;
      break;

    default:
      break;
  }
  return ret;
}
@end

@implementation EMChatroom (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"roomId"] = self.chatroomId;
    ret[@"roomName"] = self.subject;
    ret[@"description"] = self.description;
    ret[@"owner"] = self.owner;
    ret[@"maxUsers"] = @(self.maxOccupantsCount);
    ret[@"memberCount"] = @(self.occupantsCount);
    ret[@"adminList"] = self.adminList;
    ret[@"memberList"] = self.memberList;
    ret[@"blockList"] = self.blacklist;
    // !!! It has been marked as invalid in the typescript language.
    ret[@"muteList"] = self.muteList;
    ret[@"muteKVList"] = self.muteMembers;
    ret[@"isAllMemberMuted"] = @(self.isMuteAllMembers);
    ret[@"announcement"] = self.announcement;
    ret[@"permissionType"] = @([ExtSdkConvertHelper roomPremissionTypeToInt:self.permissionType]);
    ret[@"isInWhitelist"] = @(self.isInWhitelist);
    ret[@"createTimestamp"] = @(self.createTimestamp);
    ret[@"muteExpireTimestamp"] = @(self.muteExpireTimestamp);

    return ret;
}

@end

@implementation EMConversation (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"convId"] = self.conversationId;
    ret[@"convType"] = @([ExtSdkConvertHelper conversationTypeToInt:self.type]);
    ret[@"isChatThread"] = @(self.isChatThread);
    ret[@"isPinned"] = @(self.isPinned);
    ret[@"pinnedTime"] = @(self.pinnedTime);
    ret[@"ext"] = self.ext;
    ret[@"marks"] = self.marks;
    ret[@"remindType"] = @(self.disturbType);
    return ret;
}

@end

@implementation EMCursorResult (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    NSMutableArray *dataList = [NSMutableArray array];

    for (id obj in self.list) {
        if ([obj respondsToSelector:@selector(toJsonObject)]) {
            [dataList addObject:[obj toJsonObject]];
        } else if ([obj isKindOfClass:[NSString class]]) {
            [dataList addObject:obj];
        }
    }

    data[@"list"] = dataList;
    data[@"cursor"] = self.cursor;

    return data;
}
@end

@implementation EMDeviceConfig (Json)
- (NSDictionary *)toJsonObject {
    return @{
        @"resource" : self.resource,
        @"deviceUUID" : self.deviceUUID,
        @"deviceName" : self.deviceName,
    };
}
@end

@implementation EMError (Json)
- (NSDictionary *)toJsonObject {
    return @{
        @"code" : @(self.code),
        @"description" : self.errorDescription,
    };
}
@end

@implementation EMGroup (Json)

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"groupId"] = self.groupId;
    ret[@"groupName"] = self.groupName;
    ret[@"groupAvatar"] = self.groupAvatar;
    ret[@"description"] = self.description;
    ret[@"owner"] = self.owner;
    ret[@"announcement"] = self.announcement;
    ret[@"memberCount"] = @(self.occupantsCount);
    ret[@"memberList"] = self.memberList;
    ret[@"adminList"] = self.adminList;
    ret[@"blockList"] = self.blacklist;
    ret[@"muteList"] = self.muteList;
    ret[@"noticeEnable"] = @(self.isPushNotificationEnabled);
    ret[@"messageBlocked"] = @(self.isBlocked);
    ret[@"isAllMemberMuted"] = @(self.isMuteAllMembers);
    ret[@"permissionType"] = @([ExtSdkConvertHelper groupPremissionTypeToInt:self.permissionType]);

    if (self.settings != nil) {
        NSMutableDictionary *opt = [NSMutableDictionary dictionary];
        opt[@"maxCount"] = @(self.settings.maxUsers);
        opt[@"style"] = @(self.settings.style);
        opt[@"inviteNeedConfirm"] = @([self isMemberAllowToInvite]);
        opt[@"ext"] = self.settings.ext;
        opt[@"isDisabled"] = @(self.isDisabled);
        opt[@"isMemberOnly"] = @([self isMemberOnly]);
        ret[@"options"] = opt;
    }

    return ret;
}

- (BOOL)isMemberOnly {

    if (self.settings.style == EMGroupStylePrivateOnlyOwnerInvite ||
        self.settings.style == EMGroupStylePrivateMemberCanInvite ||
        self.settings.style == EMGroupStylePublicJoinNeedApproval) {
        return YES;
    }

    return NO;
}

- (BOOL)isMemberAllowToInvite {
    return self.settings.style == EMGroupStylePrivateMemberCanInvite;
}

@end

@implementation EMGroupOptions (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"maxCount"] = @(self.maxUsers);
    ret[@"ext"] = self.ext;
    ret[@"style"] = @([ExtSdkConvertHelper groupStyleToInt:self.style]);
    ret[@"inviteNeedConfirm"] = @(self.IsInviteNeedConfirm);
    return ret;
}

+ (EMGroupOptions *)fromJsonObject:(NSDictionary *)dict {
    EMGroupOptions *options = [[EMGroupOptions alloc] init];
    if (dict[@"maxCount"]) { options.maxUsers = [dict[@"maxCount"] intValue]; }
    (dict[@"ext"] && [dict[@"ext"] length] > 0) ? (options.ext = dict[@"ext"]) : nil;
    if (dict[@"inviteNeedConfirm"]) { options.IsInviteNeedConfirm = [dict[@"inviteNeedConfirm"] boolValue]; }
    if (dict[@"style"]) { options.style = [ExtSdkConvertHelper groupStyleFromInt:[dict[@"style"] intValue]]; }
    return options;
}

@end

@implementation EMGroupSharedFile (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"fileId"] = self.fileId;
    data[@"name"] = self.fileName;
    data[@"owner"] = self.fileOwner;
    data[@"createTime"] = @(self.createdAt);
    data[@"fileSize"] = @(self.fileSize);
    return data;
}

@end

@implementation EMGroupMessageAck (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"msg_id"] = self.messageId;
    data[@"ack_id"] = self.readAckId;
    data[@"from"] = self.from;
    data[@"content"] = self.content;
    data[@"count"] = @(self.readCount);
    data[@"timestamp"] = @(self.timestamp);
    return data;
}
@end

@interface LocalFileHandler : NSObject

+ (NSString *)reset:(NSString *)localPath;

@end

@implementation LocalFileHandler

+ (NSString *)reset:(NSString *)localPath {
#if !TARGET_OS_SIMULATOR
    NSRange range = [localPath rangeOfString:@"/Library/" options:NSBackwardsSearch];
    NSRange range2 = [localPath rangeOfString:@"file://" options:NSAnchoredSearch];
    if (range.location == NSNotFound && range2.location != NSNotFound) {
        return [localPath stringByReplacingCharactersInRange:NSMakeRange(0, range2.length) withString:@""];

    } else {
        return localPath;
    }
#else
    return localPath;
#endif
}

@end

@implementation EMChatMessage (Json)

+ (EMChatMessage *)fromJsonObject:(NSDictionary *)aJson {
    EMMessageBody *body = [EMMessageBody fromJsonObject:aJson[@"body"]];
    if (!body) {
        return nil;
    }

    NSString *from = aJson[@"from"];
    if (from.length == 0) {
        from = EMClient.sharedClient.currentUsername;
    }

    NSString *to = aJson[@"to"];
    NSString *conversationId = aJson[@"conversationId"];

    EMChatMessage *msg = [[EMChatMessage alloc] initWithConversationID:conversationId
                                                                  from:from
                                                                    to:to
                                                                  body:body
                                                                   ext:nil];
    if (aJson[@"msgId"]) {
        msg.messageId = aJson[@"msgId"];
    }

    if (aJson[@"direction"]) { msg.direction = [aJson[@"direction"] isEqualToString:@"send"] ? EMMessageDirectionSend : EMMessageDirectionReceive; }

    if (aJson[@"chatType"]) { msg.chatType = [ExtSdkConvertHelper chatTypeFromInt:[aJson[@"chatType"] intValue]]; }
    if (aJson[@"status"]) { msg.status = [ExtSdkConvertHelper messageStatusFromInt:[aJson[@"status"] intValue]]; }
    if (aJson[@"localTime"]) { msg.localTime = [aJson[@"localTime"] longLongValue]; }
    if (aJson[@"serverTime"]) { msg.timestamp = [aJson[@"serverTime"] longLongValue]; }
    if (aJson[@"hasReadAck"]) { msg.isReadAcked = [aJson[@"hasReadAck"] boolValue]; }
    if (aJson[@"hasDeliverAck"]) { msg.isDeliverAcked = [aJson[@"hasDeliverAck"] boolValue]; }
    if (aJson[@"hasRead"]) { msg.isRead = [aJson[@"hasRead"] boolValue]; }
    if (aJson[@"needGroupAck"]) { msg.isNeedGroupAck = [aJson[@"needGroupAck"] boolValue]; }
    // read only
    // msg.groupAckCount = [aJson[@"groupAckCount"] intValue]
    // msg.isContentReplaced = [aJson[@"isContentReplaced"] boolValue];
    if (aJson[@"isChatThread"]) { msg.isChatThreadMessage = [aJson[@"isChatThread"] boolValue]; }
    if (aJson[@"attributes"]) { msg.ext = aJson[@"attributes"]; }
    if (aJson[@"priority"]) { msg.priority = [ExtSdkConvertHelper priorityFromInt:[aJson[@"priority"] intValue]]; }
    if (aJson[@"deliverOnlineOnly"]) { msg.deliverOnlineOnly = [aJson[@"deliverOnlineOnly"] boolValue]; }
    (aJson[@"receiverList"] && [aJson[@"receiverList"] count] > 0) ? (msg.receiverList = aJson[@"receiverList"]) : nil;
    if (aJson[@"webhookEnv"]) { msg.webhookEnv = aJson[@"webhookEnv"]; }

    return msg;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"from"] = self.from;
    ret[@"msgId"] = self.messageId;
    ret[@"to"] = self.to;
    ret[@"conversationId"] = self.conversationId;
    ret[@"hasRead"] = @(self.isRead);
    ret[@"hasDeliverAck"] = @(self.isDeliverAcked);
    ret[@"hasReadAck"] = @(self.isReadAcked);
    ret[@"needGroupAck"] = @(self.isNeedGroupAck);
    ret[@"serverTime"] = @(self.timestamp);
    ret[@"groupAckCount"] = @(self.groupAckCount);
    ret[@"attributes"] = self.ext ?: @{};
    ret[@"localTime"] = @(self.localTime);
    ret[@"status"] = @([ExtSdkConvertHelper messageStatusToInt:self.status]);
    ret[@"chatType"] = @([ExtSdkConvertHelper chatTypeToInt:self.chatType]);
    ret[@"direction"] = self.direction == EMMessageDirectionSend ? @"send" : @"rec";
    ret[@"body"] = [self.body toJsonObject];
    ret[@"isChatThread"] = @(self.isChatThreadMessage);
    ret[@"isOnline"] = @(self.onlineState);
    ret[@"priority"] = @([ExtSdkConvertHelper priorityToInt:self.priority]);
    ret[@"deliverOnlineOnly"] = @(self.deliverOnlineOnly);
    ret[@"receiverList"] = self.receiverList;
    if (self.webhookEnv) {
        ret[@"webhookEnv"] = self.webhookEnv;
    }
    ret[@"isBroadcast"] = @(self.broadcast);
    ret[@"isContentReplaced"] = @(self.isContentReplaced);
  if (self.streamChunk) {
    ret[@"streamChunk"] = [self.streamChunk toJsonObject];
  }
  if (self.senderInfo) {
    ret[@"senderInfo"] = [self.senderInfo toJsonObject];
  }

    return ret;
}

@end

@implementation EMMessageSenderInfo (Json)

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    if (self.userId) { ret[@"userId"] = self.userId; }
    if (self.nickname) { ret[@"nickname"] = self.nickname; }
    if (self.avatarUrl) { ret[@"avatarUrl"] = self.avatarUrl; }
    if (self.remark) { ret[@"remark"] = self.remark; }
    if (self.groupNameCard) { ret[@"groupNameCard"] = self.groupNameCard; }
    return ret;
}

@end

@implementation EMMessageBody (Json)

+ (EMMessageBody *)fromJsonObject:(NSDictionary *)bodyJson {
    EMMessageBody *ret = nil;
    if (bodyJson == nil) {
        return ret;
    }
    NSString *type = bodyJson[@"type"];
    if ([type isEqualToString:@"txt"]) {
        ret = [EMTextMessageBody fromJsonObject:bodyJson];
    } else if ([type isEqualToString:@"img"]) {
        ret = [EMImageMessageBody fromJsonObject:bodyJson];
    } else if ([type isEqualToString:@"loc"]) {
        ret = [EMLocationMessageBody fromJsonObject:bodyJson];
    } else if ([type isEqualToString:@"video"]) {
        ret = [EMVideoMessageBody fromJsonObject:bodyJson];
    } else if ([type isEqualToString:@"voice"]) {
        ret = [EMVoiceMessageBody fromJsonObject:bodyJson];
    } else if ([type isEqualToString:@"file"]) {
        ret = [EMFileMessageBody fromJsonObject:bodyJson];
    } else if ([type isEqualToString:@"cmd"]) {
        ret = [EMCmdMessageBody fromJsonObject:bodyJson];
    } else if ([type isEqualToString:@"custom"]) {
        ret = [EMCustomMessageBody fromJsonObject:bodyJson];
    } else if ([type isEqualToString:@"combine"]) {
        ret = [EMCombineMessageBody fromJsonObject:bodyJson];
    }
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    NSString *type = [ExtSdkConvertHelper messageBodyToString:self.type];
    ret[@"type"] = type;
    if (self.operatorId && self.operatorId.length > 0) {
        ret[@"lastModifyOperatorId"] = self.operatorId;
        ret[@"lastModifyTime"] = @(self.operationTime);
        ret[@"modifyCount"] = @(self.operatorCount);
    }

    return ret;
}

@end

#pragma mark - txt

@interface EMTextMessageBody (Json)
+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@implementation EMTextMessageBody (Json)

+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    EMTextMessageBody *body = [[EMTextMessageBody alloc] initWithText:aJson[@"content"]];
    (aJson[@"targetLanguageCodes"] && [aJson[@"targetLanguageCodes"] count] > 0) ? (body.targetLanguages = aJson[@"targetLanguageCodes"]) : nil;
    // 给底层的时候不需要设置
    return body;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"content"] = self.text;
    ret[@"targetLanguageCodes"] = self.targetLanguages;
    NSMutableDictionary *kv = [NSMutableDictionary dictionary];
    for (NSString *key in self.translations.allKeys) {
        [kv setValue:[self.translations valueForKey:key] forKey:key];
    }
    if (kv != nil) {
        ret[@"translations"] = kv;
    }
    return ret;
}

@end

#pragma mark - loc

@interface EMLocationMessageBody (Json)
+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@implementation EMLocationMessageBody (Json)

+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    double latitude = [aJson[@"latitude"] doubleValue];
    double longitude = [aJson[@"longitude"] doubleValue];
    NSString *address = aJson[@"address"];
    address = (address && address.length > 0) ? address : nil;
    NSString *buildingName = aJson[@"buildingName"];
    buildingName = (buildingName && buildingName.length > 0) ? buildingName : nil;
    EMLocationMessageBody *ret = [[EMLocationMessageBody alloc] initWithLatitude:latitude
                                                                       longitude:longitude
                                                                         address:address
                                                                    buildingName:buildingName];
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"address"] = self.address;
    ret[@"latitude"] = @(self.latitude);
    ret[@"longitude"] = @(self.longitude);
    ret[@"buildingName"] = self.buildingName;
    return ret;
}

@end

#pragma mark - cmd

@interface EMCmdMessageBody (Json)
+ (EMCmdMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@implementation EMCmdMessageBody (Json)

+ (EMCmdMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    EMCmdMessageBody *ret = [[EMCmdMessageBody alloc] initWithAction:aJson[@"action"]];
    //    ret.isDeliverOnlineOnly = [aJson[@"deliverOnlineOnly"] boolValue];
    // if (aJson[@"action"]) { ret.action = aJson[@"action"]; }
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"action"] = self.action;
    //    ret[@"deliverOnlineOnly"] = @(self.isDeliverOnlineOnly);
    return ret;
}

@end

#pragma mark - custom

@interface EMCustomMessageBody (Json)
+ (EMCustomMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@implementation EMCustomMessageBody (Json)

+ (EMCustomMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    NSDictionary *dic = aJson[@"params"];
    if ([dic isKindOfClass:[NSNull class]]) {
        dic = nil;
    } else if ([dic isKindOfClass:[NSString class]]) {
        NSError *err = nil;
        NSData *jsonData = [(NSString *)dic dataUsingEncoding:NSUTF8StringEncoding];
        id obj = [NSJSONSerialization JSONObjectWithData:jsonData options:NSJSONReadingMutableContainers error:&err];
        if (err == nil && obj != nil) {
            dic = (NSDictionary *)obj;
        } else {
            dic = nil;
        }
    }

    EMCustomMessageBody *ret = [[EMCustomMessageBody alloc] initWithEvent:aJson[@"event"] customExt:dic];
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"event"] = self.event;
    ret[@"params"] = self.customExt;
    return ret;
}

@end

#pragma mark - combine

@interface EMCombineMessageBody (Json)

+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;

@end

@implementation EMCombineMessageBody (Json)

+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson {

    NSString *title = aJson[@"title"];
    title = (title && title.length > 0) ? title : nil;
    NSString *summary = aJson[@"summary"];
    summary = (summary && summary.length > 0) ? summary : nil;
    NSArray *messageIdList = aJson[@"messageIdList"];
    NSString *compatibleText = aJson[@"compatibleText"];
    compatibleText = (compatibleText && compatibleText.length > 0) ? compatibleText : nil;

    EMCombineMessageBody *ret = [[EMCombineMessageBody alloc] initWithTitle:title
                                                                    summary:summary
                                                             compatibleText:compatibleText
                                                              messageIdList:messageIdList];

    (aJson[@"remotePath"] && [aJson[@"remotePath"] length] > 0) ? (ret.remotePath = aJson[@"remotePath"]) : nil;
    (aJson[@"secret"] && [aJson[@"secret"] length] > 0) ? (ret.secretKey = aJson[@"secret"]) : nil;
    (aJson[@"localPath"] && [aJson[@"localPath"] length] > 0) ? (ret.localPath = aJson[@"localPath"]) : nil;
    return ret;
}
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"title"] = self.title;
    ret[@"summary"] = self.summary;
    ret[@"compatibleText"] = self.compatibleText;
    ret[@"localPath"] = self.localPath;
    ret[@"remotePath"] = self.remotePath;
    ret[@"secret"] = self.secretKey;
    // ret[@"messageIdList"] = self.messageIdList;
    return ret;
}

@end

#pragma mark - file

@interface EMFileMessageBody (Json)
+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@implementation EMFileMessageBody (Json)

+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    NSString *path = aJson[@"localPath"];
    NSString *displayName = aJson[@"displayName"];
    displayName = (displayName && displayName.length > 0) ? displayName : nil;
    EMFileMessageBody *ret = [[EMFileMessageBody alloc] initWithLocalPath:[LocalFileHandler reset:path]
                                                              displayName:displayName];
    (aJson[@"secret"] && [aJson[@"secret"] length] > 0) ? (ret.secretKey = aJson[@"secret"]) : (ret.secretKey = @"");
    (aJson[@"remotePath"] && [aJson[@"remotePath"] length] > 0) ? (ret.remotePath = aJson[@"remotePath"]) : nil;
    if (aJson[@"fileSize"]) { ret.fileLength = [aJson[@"fileSize"] longLongValue]; }
    if (aJson[@"fileStatus"]) { ret.downloadStatus = [ExtSdkConvertHelper downloadStatusFromInt:[aJson[@"fileStatus"] intValue]]; }
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"localPath"] = self.localPath;
    ret[@"displayName"] = self.displayName;
    ret[@"secret"] = self.secretKey;
    ret[@"remotePath"] = self.remotePath;
    ret[@"fileSize"] = @(self.fileLength);
    ret[@"fileStatus"] = @([ExtSdkConvertHelper downloadStatusToInt:self.downloadStatus]);
    return ret;
}

@end

#pragma mark - img

@interface EMImageMessageBody (Json)
+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@implementation EMImageMessageBody (Json)

+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    NSString *path = aJson[@"localPath"];
    NSString *displayName = aJson[@"displayName"];
    displayName = (displayName && displayName.length > 0) ? displayName : nil;
    EMImageMessageBody *ret = [[EMImageMessageBody alloc] initWithLocalPath:[LocalFileHandler reset:path]
                                                                displayName:displayName];

    (aJson[@"secret"] && [aJson[@"secret"] length] > 0) ? (ret.secretKey = aJson[@"secret"]) : nil;
    (aJson[@"remotePath"] && [aJson[@"remotePath"] length] > 0) ? (ret.remotePath = aJson[@"remotePath"]) : nil;
    if (aJson[@"fileSize"]) { ret.fileLength = [aJson[@"fileSize"] longLongValue]; }
    if (aJson[@"fileStatus"]) { ret.downloadStatus = [ExtSdkConvertHelper downloadStatusFromInt:[aJson[@"fileStatus"] intValue]]; }
    (aJson[@"thumbnailLocalPath"] && [aJson[@"thumbnailLocalPath"] length] > 0) ? (ret.thumbnailLocalPath = aJson[@"thumbnailLocalPath"]) : nil;
    (aJson[@"thumbnailRemotePath"] && [aJson[@"thumbnailRemotePath"] length] > 0) ? (ret.thumbnailRemotePath = aJson[@"thumbnailRemotePath"]) : nil;
    (aJson[@"thumbnailSecret"] && [aJson[@"thumbnailSecret"] length] > 0) ? (ret.thumbnailSecretKey = aJson[@"thumbnailSecret"]) : nil;
    if (aJson[@"width"] && aJson[@"height"]) { ret.size = CGSizeMake([aJson[@"width"] floatValue], [aJson[@"height"] floatValue]); }
    if (aJson[@"thumbnailStatus"]) { ret.thumbnailDownloadStatus = [ExtSdkConvertHelper downloadStatusFromInt:[aJson[@"thumbnailStatus"] intValue]]; }
    if (aJson[@"sendOriginalImage"]) { ret.compressionRatio = [aJson[@"sendOriginalImage"] boolValue] ? 1.0 : 0.6; }
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"thumbnailLocalPath"] = self.thumbnailLocalPath;
    ret[@"thumbnailRemotePath"] = self.thumbnailRemotePath;
    ret[@"thumbnailSecret"] = self.thumbnailSecretKey;
    ret[@"thumbnailStatus"] = @([ExtSdkConvertHelper downloadStatusToInt:self.thumbnailDownloadStatus]);
    ret[@"fileStatus"] = @([ExtSdkConvertHelper downloadStatusToInt:self.downloadStatus]);
    ret[@"width"] = @(self.size.width);
    ret[@"height"] = @(self.size.height);
    ret[@"fileSize"] = @(self.fileLength);
    ret[@"remotePath"] = self.remotePath;
    ret[@"secret"] = self.secretKey;
    ret[@"displayName"] = self.displayName;
    ret[@"localPath"] = self.localPath;
    ret[@"sendOriginalImage"] = self.compressionRatio == 1.0 ? @(YES) : @(NO);
    if (self.bigImageLocalPath) { ret[@"bigImageLocalPath"] = self.bigImageLocalPath; }
    if (self.bigImageRemotePath) { ret[@"bigImageRemotePath"] = self.bigImageRemotePath; }
    ret[@"bigImageDownloadStatus"] = @([ExtSdkConvertHelper downloadStatusToInt:self.bigImageDownloadStatus]);
    ret[@"isOriginalImage"] = @(self.isOriginalImage);
    return ret;
}
@end

#pragma mark - video

@interface EMVideoMessageBody (Json)
+ (EMVideoMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@implementation EMVideoMessageBody (Json)
+ (EMVideoMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    NSString *path = aJson[@"localPath"];
    NSString *displayName = aJson[@"displayName"];
    displayName = (displayName && displayName.length > 0) ? displayName : nil;
    EMVideoMessageBody *ret = [[EMVideoMessageBody alloc] initWithLocalPath:[LocalFileHandler reset:path]
                                                                displayName:displayName];
    if (aJson[@"duration"]) { ret.duration = [aJson[@"duration"] intValue]; }
    (aJson[@"secret"] && [aJson[@"secret"] length] > 0) ? (ret.secretKey = aJson[@"secret"]) : nil;
    (aJson[@"remotePath"] && [aJson[@"remotePath"] length] > 0) ? (ret.remotePath = aJson[@"remotePath"]) : nil;
    if (aJson[@"fileSize"]) { ret.fileLength = [aJson[@"fileSize"] longLongValue]; }
    (aJson[@"thumbnailLocalPath"] && [aJson[@"thumbnailLocalPath"] length] > 0) ? (ret.thumbnailLocalPath = aJson[@"thumbnailLocalPath"]) : nil;
    (aJson[@"thumbnailRemotePath"] && [aJson[@"thumbnailRemotePath"] length] > 0) ? (ret.thumbnailRemotePath = aJson[@"thumbnailRemotePath"]) : nil;
    (aJson[@"thumbnailSecret"] && [aJson[@"thumbnailSecret"] length] > 0) ? (ret.thumbnailSecretKey = aJson[@"thumbnailSecret"]) : nil;
    if (aJson[@"thumbnailStatus"]) { ret.thumbnailDownloadStatus = [ExtSdkConvertHelper downloadStatusFromInt:[aJson[@"thumbnailStatus"] intValue]]; }
    if (aJson[@"width"] && aJson[@"height"]) { ret.thumbnailSize = CGSizeMake([aJson[@"width"] floatValue], [aJson[@"height"] floatValue]); }
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"duration"] = @(self.duration);
    ret[@"thumbnailLocalPath"] = self.thumbnailLocalPath;
    ret[@"secret"] = self.secretKey;
    ret[@"remotePath"] = self.remotePath;
    ret[@"thumbnailRemotePath"] = self.thumbnailRemotePath;
    ret[@"thumbnailSecret"] = self.thumbnailSecretKey;
    ret[@"thumbnailStatus"] = @([ExtSdkConvertHelper downloadStatusToInt:self.thumbnailDownloadStatus]);
    ret[@"width"] = @(self.thumbnailSize.width);
    ret[@"height"] = @(self.thumbnailSize.height);
    ret[@"fileSize"] = @(self.fileLength);
    ret[@"displayName"] = self.displayName;
    ret[@"duration"] = @(self.duration);
    return ret;
}
@end

#pragma mark - voice

@interface EMVoiceMessageBody (Json)
+ (EMVoiceMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@implementation EMVoiceMessageBody (Json)
+ (EMVoiceMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    NSString *path = aJson[@"localPath"];
    NSString *displayName = aJson[@"displayName"];
    displayName = (displayName && displayName.length > 0) ? displayName : nil;
    EMVoiceMessageBody *ret = [[EMVoiceMessageBody alloc] initWithLocalPath:[LocalFileHandler reset:path]
                                                                displayName:displayName];
    (aJson[@"secret"] && [aJson[@"secret"] length] > 0) ? (ret.secretKey = aJson[@"secret"]) : nil;
    (aJson[@"remotePath"] && [aJson[@"remotePath"] length] > 0) ? (ret.remotePath = aJson[@"remotePath"]) : nil;
    if (aJson[@"duration"]) { ret.duration = [aJson[@"duration"] intValue]; }
    if (aJson[@"fileStatus"]) { ret.downloadStatus = [ExtSdkConvertHelper downloadStatusFromInt:[aJson[@"fileStatus"] intValue]]; }
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"duration"] = @(self.duration);
    ret[@"displayName"] = self.displayName;
    ret[@"localPath"] = self.localPath;
    ret[@"fileSize"] = @(self.fileLength);
    ret[@"secret"] = self.secretKey;
    ret[@"remotePath"] = self.remotePath;
    ret[@"fileStatus"] = @([ExtSdkConvertHelper downloadStatusToInt:self.downloadStatus]);
    if (self.text) { ret[@"text"] = self.text; }
    ;
    return ret;
}

@end

@implementation EMOptions (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"appKey"] = self.appkey;
    data[@"autoLogin"] = @(self.isAutoLogin);
    data[@"debugModel"] = @(self.enableConsoleLog);
    data[@"requireAck"] = @(self.enableRequireReadAck);
    data[@"requireDeliveryAck"] = @(self.enableDeliveryAck);
    data[@"sortMessageByServerTime"] = @(self.sortMessageByServerTime);
    data[@"acceptInvitationAlways"] = @(self.autoAcceptFriendInvitation);
    data[@"autoAcceptGroupInvitation"] = @(self.autoAcceptGroupInvitation);
    data[@"deleteMessagesAsExitGroup"] = @(self.deleteMessagesOnLeaveGroup);
    data[@"deleteMessagesAsExitChatRoom"] = @(self.deleteMessagesOnLeaveChatroom);
    data[@"isAutoDownload"] = @(self.autoDownloadThumbnail);
    data[@"isChatRoomOwnerLeaveAllowed"] = @(self.canChatroomOwnerLeave);
    data[@"serverTransfer"] = @(self.isAutoTransferMessageAttachments);
    data[@"usingHttpsOnly"] = @(self.usingHttpsOnly);
    data[@"pushConfig"] = @{@"deviceId" : self.apnsCertName};
    data[@"enableDNSConfig"] = @(self.enableDnsConfig);
    data[@"imPort"] = @(self.chatPort);
    data[@"imServer"] = self.chatServer;
    data[@"restServer"] = self.restServer;
    data[@"dnsUrl"] = self.dnsURL;
    data[@"areaCode"] = @(self.area);
    data[@"enableEmptyConversation"] = @(self.loadEmptyConversations);
    data[@"customDeviceName"] = self.customDeviceName;
    data[@"customOSType"] = @(self.customOSType);
    data[@"useReplacedMessageContents"] = @(self.useReplacedMessageContents);
    data[@"enableTLS"] = @(self.enableTLSConnection);
    data[@"messagesReceiveCallbackIncludeSend"] = @(self.includeSendMessageInMessageListener);
    data[@"regardImportMessagesAsRead"] = @(self.regardImportMessagesAsRead);
    data[@"loginExtraInfo"] = self.loginExtensionInfo;
    data[@"workPathCopiable"] = @(self.workPathCopiable);
    data[@"appId"] = self.appId;
    data[@"webSocketServer"] = self.webSocketServer;
    data[@"webSocketPort"] = @(self.webSocketPort);
    data[@"dohVendor"] = @(self.dohVendor);
    data[@"enableUserInfo"] = @(self.enableUserInfo);
    data[@"enableAutoSyncContacts"] = @(self.enableAutoSyncContacts);
    // 2026-08-25 4.24.1
    data[@"ntpServers"] = self.ntpServers;

    return data;
}
+ (EMOptions *)fromJsonObject:(NSDictionary *)aJson {
    NSString *appKey = aJson[@"appKey"];
    NSString *appId = aJson[@"appId"];
    EMOptions *options;
    if (appKey != nil) {
        options = [EMOptions optionsWithAppkey:appKey];
    } else if (appId != nil) {
        options = [EMOptions optionsWithAppId:appId];
    } else {
        NSLog(@"EMOptions: fromJsonObject: appKey and appId is empty");
    }

    if (aJson[@"autoLogin"]) { options.isAutoLogin = [aJson[@"autoLogin"] boolValue]; }
    if (aJson[@"debugModel"]) { options.enableConsoleLog = [aJson[@"debugModel"] boolValue]; }
    if (aJson[@"requireAck"]) { options.enableRequireReadAck = [aJson[@"requireAck"] boolValue]; }
    if (aJson[@"requireDeliveryAck"]) { options.enableDeliveryAck = [aJson[@"requireDeliveryAck"] boolValue]; }
    if (aJson[@"sortMessageByServerTime"]) { options.sortMessageByServerTime = [aJson[@"sortMessageByServerTime"] boolValue]; }
    if (aJson[@"acceptInvitationAlways"]) { options.autoAcceptFriendInvitation = [aJson[@"acceptInvitationAlways"] boolValue]; }
    if (aJson[@"autoAcceptGroupInvitation"]) { options.autoAcceptGroupInvitation = [aJson[@"autoAcceptGroupInvitation"] boolValue]; }
    if (aJson[@"deleteMessagesAsExitGroup"]) { options.deleteMessagesOnLeaveGroup = [aJson[@"deleteMessagesAsExitGroup"] boolValue]; }
    if (aJson[@"deleteMessagesAsExitChatRoom"]) { options.deleteMessagesOnLeaveChatroom = [aJson[@"deleteMessagesAsExitChatRoom"] boolValue]; }
    if (aJson[@"isAutoDownload"]) { options.autoDownloadThumbnail = [aJson[@"isAutoDownload"] boolValue]; }
    if (aJson[@"isChatRoomOwnerLeaveAllowed"]) { options.canChatroomOwnerLeave = [aJson[@"isChatRoomOwnerLeaveAllowed"] boolValue]; }
    if (aJson[@"serverTransfer"]) { options.isAutoTransferMessageAttachments = [aJson[@"serverTransfer"] boolValue]; }
    if (aJson[@"usingHttpsOnly"]) { options.usingHttpsOnly = [aJson[@"usingHttpsOnly"] boolValue]; }
    (aJson[@"pushConfig"] && aJson[@"pushConfig"][@"deviceId"] && [aJson[@"pushConfig"][@"deviceId"] length] > 0) ? (options.apnsCertName = aJson[@"pushConfig"][@"deviceId"]) : nil;
    if (aJson[@"enableDNSConfig"]) { options.enableDnsConfig = [aJson[@"enableDNSConfig"] boolValue]; }
    if (aJson[@"imPort"]) { options.chatPort = [aJson[@"imPort"] intValue]; }
    (aJson[@"imServer"] && [aJson[@"imServer"] length] > 0) ? (options.chatServer = aJson[@"imServer"]) : nil;
    (aJson[@"restServer"] && [aJson[@"restServer"] length] > 0) ? (options.restServer = aJson[@"restServer"]) : nil;
    (aJson[@"dnsUrl"] && [aJson[@"dnsUrl"] length] > 0) ? (options.dnsURL = aJson[@"dnsUrl"]) : nil;
    if (aJson[@"areaCode"]) { options.area = [ExtSdkConvertHelper AreaCodeFromInt:[aJson[@"areaCode"] intValue]]; }
    if (aJson[@"enableEmptyConversation"]) { options.loadEmptyConversations = [aJson[@"enableEmptyConversation"] boolValue]; }
    (aJson[@"customDeviceName"] && [aJson[@"customDeviceName"] length] > 0) ? (options.customDeviceName = aJson[@"customDeviceName"]) : nil;
    if (aJson[@"customOSType"]) {
        options.customOSType = [aJson[@"customOSType"] intValue];
    }

    if (aJson[@"enableTLS"]) { options.enableTLSConnection = [aJson[@"enableTLS"] boolValue]; }
    if (aJson[@"useReplacedMessageContents"]) { options.useReplacedMessageContents = [aJson[@"useReplacedMessageContents"] boolValue]; }
    if (aJson[@"messagesReceiveCallbackIncludeSend"]) { options.includeSendMessageInMessageListener = [aJson[@"messagesReceiveCallbackIncludeSend"] boolValue]; }
    if (aJson[@"regardImportMessagesAsRead"]) { options.regardImportMessagesAsRead = [aJson[@"regardImportMessagesAsRead"] boolValue]; }

    (aJson[@"loginExtraInfo"] && [aJson[@"loginExtraInfo"] length] > 0) ? (options.loginExtensionInfo = aJson[@"loginExtraInfo"]) : nil;
    if (aJson[@"workPathCopiable"]) { options.workPathCopiable = [aJson[@"workPathCopiable"] boolValue]; }

    (aJson[@"webSocketServer"] && [aJson[@"webSocketServer"] length] > 0) ? (options.webSocketServer = aJson[@"webSocketServer"]) : nil;
    if (aJson[@"webSocketPort"]) { options.webSocketPort = [aJson[@"webSocketPort"] intValue]; }

    if (aJson[@"dohVendor"]) { options.dohVendor = [aJson[@"dohVendor"] intValue]; }

    if (aJson[@"enableUserInfo"]) { options.enableUserInfo = [aJson[@"enableUserInfo"] boolValue]; }
    if (aJson[@"enableAutoSyncContacts"]) { options.enableAutoSyncContacts = [aJson[@"enableAutoSyncContacts"] boolValue]; }

    // 2026-08-25 4.24.1
    if (aJson[@"ntpServers"]) { options.ntpServers = aJson[@"ntpServers"]; }

    return options;
}
@end

@implementation EMPageResult (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    NSMutableArray *dataList = [NSMutableArray array];
    for (id<ExtSdkToJson> obj in self.list) {
        [dataList addObject:[obj toJsonObject]];
    }

    data[@"list"] = dataList;
    data[@"count"] = @(self.count);

    return data;
}
@end

@implementation EMPushOptions (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"pushStyle"] = @(self.displayStyle != EMPushDisplayStyleSimpleBanner);
    data[@"displayStyle"] = @(self.displayStyle);
    data[@"displayName"] = self.displayName;
    return data;
}

@end

@implementation EMPresence (Json)

- (nonnull NSDictionary *)toJsonObject {
    NSMutableDictionary *details = [NSMutableDictionary dictionary];
    for (EMPresenceStatusDetail *detail in self.statusDetails) {
        details[detail.device] = @(detail.status);
    }
    return @{
        @"publisher" : self.publisher,
        @"statusDetails" : details,
        @"statusDescription" : self.statusDescription,
        @"lastTime" : @(self.lastTime),
        @"expiryTime" : @(self.expirytime)
    };
}

@end

@implementation EMUserInfo (Json)

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"userId"] = self.userId;
    ret[@"nickName"] = self.nickname;
    ret[@"avatarUrl"] = self.avatarUrl;
    ret[@"mail"] = self.mail;
    ret[@"phone"] = self.phone;
    ret[@"gender"] = @(self.gender);
    ret[@"sign"] = self.sign;
    ret[@"birth"] = self.birth;
    ret[@"ext"] = self.ext;

    return ret;
}

+ (EMUserInfo *)fromJsonObject:(NSDictionary *)aJson {
    EMUserInfo *userInfo = EMUserInfo.new;
    if (aJson[@"userId"]) { userInfo.userId = aJson[@"userId"]; }
    if (aJson[@"nickName"]) { userInfo.nickname = aJson[@"nickName"]; }
    if (aJson[@"avatarUrl"]) { userInfo.avatarUrl = aJson[@"avatarUrl"]; }
    if (aJson[@"mail"]) { userInfo.mail = aJson[@"mail"]; }
    if (aJson[@"phone"]) { userInfo.phone = aJson[@"phone"]; }
    if (aJson[@"gender"]) { userInfo.gender = [aJson[@"gender"] integerValue]; }
    if (aJson[@"sign"]) { userInfo.sign = aJson[@"sign"]; }
    if (aJson[@"birth"]) { userInfo.birth = aJson[@"birth"]; }
    if (aJson[@"ext"]) { userInfo.ext = aJson[@"ext"]; }
    return [userInfo copy];
}

@end

@implementation EMTranslateLanguage (Json)

- (nonnull NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"code"] = self.languageCode;
    ret[@"name"] = self.languageName;
    ret[@"nativeName"] = self.languageNativeName;
    return ret;
}

@end

@implementation NSArray (Json)
- (NSArray *)toJsonArray {
    NSMutableArray *ary = nil;
    for (id<ExtSdkToJson> item in self) {
        if (ary == nil) {
            ary = [NSMutableArray array];
        }
        [ary addObject:[item toJsonObject]];
    }
    return ary;
}
@end

@implementation EMMessageReactionOperation (Json)
- (NSDictionary *)toJsonObject {
    return @{
        @"userId" : self.userId,
        @"reaction" : self.reaction,
        @"operate" : @(self.operate),
    };
}
@end

@implementation EMMessageReaction (Json)

- (nonnull NSDictionary *)toJsonObject {
    return @{
        @"reaction" : self.reaction,
        @"count" : @(self.count),
        @"isAddedBySelf" : @(self.isAddedBySelf),
        @"userList" : self.userList,
    };
}

@end

@implementation EMMessageReactionChange (Json)

- (nonnull NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"conversationId"] = self.conversationId;
    ret[@"messageId"] = self.messageId;

    NSMutableArray *reactions = [NSMutableArray array];
    for (EMMessageReaction *reaction in self.reactions) {
        [reactions addObject:[reaction toJsonObject]];
    }
    ret[@"reactions"] = reactions;

    NSMutableArray *operations = [NSMutableArray array];
    for (EMMessageReactionOperation *reaction in self.operations) {
        [operations addObject:[reaction toJsonObject]];
    }
    ret[@"operations"] = operations;
    return ret;
}

@end

@implementation EMChatThread (Json)

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"threadId"] = self.threadId;
    ret[@"threadName"] = self.threadName;
    ret[@"owner"] = self.owner;
    ret[@"msgId"] = self.messageId;
    ret[@"parentId"] = self.parentId;
    ret[@"memberCount"] = @(self.membersCount);
    ret[@"msgCount"] = @(self.messageCount);
    ret[@"createAt"] = @(self.createAt);
    if (self.lastMessage && self.lastMessage.messageId.length > 0) {
        ret[@"lastMessage"] = [self.lastMessage toJsonObject];
    }
    return ret;
}

@end

@implementation EMChatThreadEvent (Json)

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"from"] = self.from;
    ret[@"type"] = @([ExtSdkConvertHelper threadOperationToInt:self.type]);
    ret[@"thread"] = [self.chatThread toJsonObject];
    return ret;
}

@end

@implementation EMSilentModeParam (Json)

+ (EMSilentModeParam *)fromJsonObject:(NSDictionary *)dict {
    EMSilentModeParamType paramType = [ExtSdkConvertHelper slientModeParamTypeFromInt:[dict[@"paramType"] intValue]];
    EMSilentModeParam *param = [[EMSilentModeParam alloc] initWithParamType:paramType];
    if (dict[@"remindType"]) { param.remindType = [ExtSdkConvertHelper remindTypeFromInt:[dict[@"remindType"] intValue]]; }
    if (dict[@"startTime"]) { param.silentModeStartTime = [EMSilentModeTime fromJsonObject:dict[@"startTime"]]; }
    if (dict[@"endTime"]) { param.silentModeEndTime = [EMSilentModeTime fromJsonObject:dict[@"endTime"]]; }
    if (dict[@"duration"]) { param.silentModeDuration = [dict[@"duration"] intValue]; }
    return param;
}

@end

@implementation EMSilentModeResult (Json)

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[NSMutableDictionary alloc] init];
    ret[@"expireTimestamp"] = @(self.expireTimestamp);
    ret[@"startTime"] = [self.silentModeStartTime toJsonObject];
    ret[@"endTime"] = [self.silentModeEndTime toJsonObject];
    ret[@"remindType"] = @([ExtSdkConvertHelper remindTypeToInt:self.remindType]);
    ret[@"conversationId"] = self.conversationID;
    ret[@"conversationType"] = @([ExtSdkConvertHelper conversationTypeToInt:self.conversationType]);
    return ret;
}

@end

@implementation EMSilentModeTime (Json)

+ (EMSilentModeTime *)fromJsonObject:(NSDictionary *)dict {
    int hour = [dict[@"hour"] intValue];
    int minute = [dict[@"minute"] intValue];
    return [[EMSilentModeTime alloc] initWithHours:hour minutes:minute];
}
- (NSDictionary *)toJsonObject {
    return @{@"hour" : @(self.hours), @"minute" : @(self.minutes)};
}

@end

@implementation EMFetchServerMessagesOption (Json)
+ (EMFetchServerMessagesOption *)fromJsonObject:(NSDictionary *)dict {
    if (dict == nil) {
        return nil;
    }
    EMFetchServerMessagesOption *options = [[EMFetchServerMessagesOption alloc] init];
    if (dict[@"direction"]) { options.direction = [dict[@"direction"] isEqual:@(0)] ? EMMessageSearchDirectionUp : EMMessageSearchDirectionDown; }
    if (dict[@"startTs"]) { options.startTime = [dict[@"startTs"] longLongValue]; }
    if (dict[@"endTs"]) { options.endTime = [dict[@"endTs"] longLongValue]; }
    // !!! It has been marked as invalid in the typescript language.
    (dict[@"from"] && [dict[@"from"] length] > 0) ? (options.from = dict[@"from"]) : nil;
    (dict[@"senders"] && [dict[@"senders"] count] > 0) ? (options.fromIds = dict[@"senders"]) : nil;
    if (dict[@"needSave"]) { options.isSave = [dict[@"needSave"] boolValue]; }
    NSArray *types = dict[@"msgTypes"];
    NSMutableArray<NSNumber *> *list = [NSMutableArray new];
    if (types) {
        for (int i = 0; i < types.count; i++) {
            NSString *type = types[i];
            if ([type isEqualToString:@"txt"]) {
                [list addObject:@(EMMessageBodyTypeText)];
            } else if ([type isEqualToString:@"img"]) {
                [list addObject:@(EMMessageBodyTypeImage)];
            } else if ([type isEqualToString:@"loc"]) {
                [list addObject:@(EMMessageBodyTypeLocation)];
            } else if ([type isEqualToString:@"video"]) {
                [list addObject:@(EMMessageBodyTypeVideo)];
            } else if ([type isEqualToString:@"voice"]) {
                [list addObject:@(EMMessageBodyTypeVoice)];
            } else if ([type isEqualToString:@"file"]) {
                [list addObject:@(EMMessageBodyTypeFile)];
            } else if ([type isEqualToString:@"cmd"]) {
                [list addObject:@(EMMessageBodyTypeCmd)];
            } else if ([type isEqualToString:@"custom"]) {
                [list addObject:@(EMMessageBodyTypeCustom)];
            } else if ([type isEqualToString:@"combine"]) {
                [list addObject:@(EMMessageBodyTypeCombine)];
            }
        }
    }

    if (list.count > 0) {
        options.msgTypes = list;
    }

    return options;
}
- (NSDictionary *)toJsonObject {
    return nil;
}
@end

@implementation EMContact (Json)

- (nonnull NSDictionary *)toJsonObject {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"userId"] = self.userId;
    data[@"remark"] = self.remark;
    if (self.userInfo) { data[@"userInfo"] = [self.userInfo toJsonObject]; }
    data[@"addTimestamp"] = @(self.addTimestamp);
    return data;
}

+ (nonnull EMContact *)fromJsonObject:(nonnull NSDictionary *)dict {
    NSString *userId = dict[@"userId"];
    NSString *remark = dict[@"remark"];
    remark = (remark && remark.length > 0) ? remark : nil;
    NSUInteger createAt = dict[@"addTimestamp"] ? [dict[@"addTimestamp"] unsignedLongLongValue] : 0;
    EMContact *contact = [[EMContact alloc] initWithUserId:userId remark:remark createAt:createAt];
    return contact;
}

@end

@implementation EMConversationFilter (Json)

+ (EMConversationFilter *)fromJsonObject:(NSDictionary *)dict {
    EMConversationFilter *filter = [[EMConversationFilter alloc] init];
    if (dict[@"mark"]) { filter.mark = (EMMarkType)[dict[@"mark"] integerValue]; }
    if (dict[@"pageSize"]) { filter.pageSize = [dict[@"pageSize"] intValue]; }
    return filter;
}

+ (NSString *)getCursor:(NSDictionary *)dict {
    return dict[@"cursor"];
}

+ (BOOL)getPinned:(NSDictionary *)dict {
    return [dict[@"pinned"] boolValue];
}

+ (BOOL)hasMark:(NSDictionary *)dict {
    return dict[@"mark"] != nil;
}

+ (NSInteger)pageSize:(NSDictionary *)dict {
    return [dict[@"pageSize"] intValue];
}

@end

@implementation EMMessagePinInfo (Json)
+ (EMMessagePinInfo *)fromJsonObject:(NSDictionary *)dict {
    EMMessagePinInfo *info = [[EMMessagePinInfo alloc] init];
    (dict[@"operatorId"] && [dict[@"operatorId"] length] > 0) ? (info.operatorId = dict[@"operatorId"]) : nil;
    if (dict[@"pinTime"]) { info.pinTime = [dict[@"pinTime"] integerValue]; }
    return info;
}
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary new];
    ret[@"operatorId"] = self.operatorId;
    ret[@"pinTime"] = @(self.pinTime);
    return ret;
}
@end

@implementation EMRecallMessageInfo (Json)
+ (EMRecallMessageInfo *)fromJsonObject:(NSDictionary *)dict {
    return nil;
}
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"recalledMessageId"] = self.recallMessageId;
    ret[@"recalledBy"] = self.recallBy;
    ret[@"recalledExt"] = self.ext;
    ret[@"recalledMessage"] = [self.recallMessage toJsonObject];
    ret[@"recalledConvId"] = self.conversationId;
    return ret;
}
@end

@implementation EMGroupMemberInfo (Json)

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"memberId"] = self.userId;
    ret[@"joinedTimestamp"] = @(self.joinedTimestamp);
    ret[@"role"] = @([ExtSdkConvertHelper groupPremissionTypeToInt:self.role]);
    if (self.namecard) { ret[@"namecard"] = self.namecard; }
    if (self.nickname) { ret[@"nickname"] = self.nickname; }
    if (self.avatarUrl) { ret[@"avatarUrl"] = self.avatarUrl; }
    return ret;
}

@end

@implementation EMStreamChunk (Json)
- (NSDictionary *)toJsonObject {
  NSMutableDictionary *ret = [NSMutableDictionary dictionary];
  ret[@"status"] = @([ExtSdkConvertHelper streamChunkStatus:self.status]);
  ret[@"errorCode"] = @(self.errorCode);
  ret[@"finishReason"] = @(self.finishReason);
  ret[@"text"] = self.text;
  ret[@"customType"] = self.customType;
  return ret;
}
@end

@implementation EMSearchServerMessageResult (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"messageId"] = self.messageId;
    EMMessageBody *body = self.body;
    if (body) {
        ret[@"body"] = [body toJsonObject];
    }
    ret[@"ext"] = self.ext ?: @{};
    ret[@"from"] = self.from;
    ret[@"to"] = self.to;
    ret[@"conversationId"] = self.conversationId;
    ret[@"chatType"] = @([ExtSdkConvertHelper chatTypeToInt:self.chatType]);
    ret[@"timestamp"] = @(self.timestamp);
    if (self.highlightTexts) {
        ret[@"highlightTexts"] = self.highlightTexts;
    }
    return ret;
}
@end
