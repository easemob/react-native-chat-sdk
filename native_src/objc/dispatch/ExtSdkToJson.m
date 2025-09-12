#import "ExtSdkToJson.h"

#import <HyphenateChat/EMClient.h>
#import <HyphenateChat/EMOptions+PrivateDeploy.h>

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
    ret[@"muteList"] = self.muteList;
    ret[@"isAllMemberMuted"] = @(self.isMuteAllMembers);
    ret[@"announcement"] = self.announcement;
    ret[@"permissionType"] = @([self premissionTypeToInt:self.permissionType]);

    return ret;
}

- (int)premissionTypeToInt:(EMChatroomPermissionType)type {
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
@end

@implementation EMConversation (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"convId"] = self.conversationId;
    ret[@"convType"] = @([self.class typeToInt:self.type]);
    ret[@"isChatThread"] = @(self.isChatThread);
    ret[@"isPinned"] = @(self.isPinned);
    ret[@"pinnedTime"] = @(self.pinnedTime);
    ret[@"ext"] = self.ext;
    ret[@"marks"] = self.marks;
    return ret;
}

+ (int)typeToInt:(EMConversationType)aType {
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

+ (EMConversationType)typeFromInt:(int)aType {
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
    ret[@"permissionType"] =
        @([EMGroup premissionTypeToInt:self.permissionType]);

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

+ (int)premissionTypeToInt:(EMGroupPermissionType)type {
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

+ (EMGroupPermissionType)premissionTypeFromInt:(int)type {
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

@end

@implementation EMGroupOptions (Json)
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];
    ret[@"maxCount"] = @(self.maxUsers);
    ret[@"ext"] = self.ext;
    ret[@"style"] = @([EMGroupOptions styleToInt:self.style]);
    ret[@"inviteNeedConfirm"] = @(self.IsInviteNeedConfirm);
    return ret;
}

+ (EMGroupOptions *)fromJsonObject:(NSDictionary *)dict {
    EMGroupOptions *options = [[EMGroupOptions alloc] init];
    options.maxUsers = [dict[@"maxCount"] intValue];
    options.ext = dict[@"ext"];
    options.IsInviteNeedConfirm = [dict[@"inviteNeedConfirm"] boolValue];
    options.style = [EMGroupOptions styleFromInt:[dict[@"style"] intValue]];
    return options;
}

+ (EMGroupStyle)styleFromInt:(int)style {
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

+ (int)styleToInt:(EMGroupStyle)style {
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
    NSRange range = [localPath rangeOfString:@"/Library/"
                                     options:NSBackwardsSearch];
    NSRange range2 = [localPath rangeOfString:@"file://"
                                      options:NSAnchoredSearch];
    if (range.location == NSNotFound && range2.location != NSNotFound) {
        return [localPath
            stringByReplacingCharactersInRange:NSMakeRange(0, range2.length)
                                    withString:@""];

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

    EMChatMessage *msg =
        [[EMChatMessage alloc] initWithConversationID:conversationId
                                                 from:from
                                                   to:to
                                                 body:body
                                                  ext:nil];
    if (aJson[@"msgId"]) {
        msg.messageId = aJson[@"msgId"];
    }

    msg.direction = ({
        [aJson[@"direction"] isEqualToString:@"send"]
            ? EMMessageDirectionSend
            : EMMessageDirectionReceive;
    });

    msg.chatType =
        [EMChatMessage chatTypeFromInt:[aJson[@"chatType"] intValue]];
    msg.status = [msg statusFromInt:[aJson[@"status"] intValue]];
    msg.localTime = [aJson[@"localTime"] longLongValue];
    msg.timestamp = [aJson[@"serverTime"] longLongValue];
    msg.isReadAcked = [aJson[@"hasReadAck"] boolValue];
    msg.isDeliverAcked = [aJson[@"hasDeliverAck"] boolValue];
    msg.isRead = [aJson[@"hasRead"] boolValue];
    msg.isNeedGroupAck = [aJson[@"needGroupAck"] boolValue];
    // read only
    // msg.groupAckCount = [aJson[@"groupAckCount"] intValue]
    // msg.isContentReplaced = [aJson[@"isContentReplaced"] boolValue];
    msg.isChatThreadMessage = [aJson[@"isChatThread"] boolValue];
    msg.ext = aJson[@"attributes"];
    msg.priority =
        [EMChatMessage priorityFromInt:[aJson[@"priority"] intValue]];
    msg.deliverOnlineOnly = [aJson[@"deliverOnlineOnly"] boolValue];
    if (aJson[@"receiverList"]) {
        msg.receiverList = aJson[@"receiverList"];
    }
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
    ret[@"status"] = @([self statusToInt:self.status]);
    ret[@"chatType"] = @([EMChatMessage chatTypeToInt:self.chatType]);
    ret[@"direction"] =
        self.direction == EMMessageDirectionSend ? @"send" : @"rec";
    ret[@"body"] = [self.body toJsonObject];
    ret[@"isChatThread"] = @(self.isChatThreadMessage);
    ret[@"isOnline"] = @(self.onlineState);
    ret[@"priority"] = @([EMChatMessage priorityToInt:self.priority]);
    ret[@"deliverOnlineOnly"] = @(self.deliverOnlineOnly);
    ret[@"receiverList"] = self.receiverList;
    ret[@"isBroadcast"] = @(self.broadcast);
    ret[@"isContentReplaced"] = @(self.isContentReplaced);

    return ret;
}

- (EMMessageStatus)statusFromInt:(int)aStatus {
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

- (int)statusToInt:(EMMessageStatus)aStatus {
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

@end

@implementation EMMessageBody (Json)

+ (EMMessageBody *)fromJsonObject:(NSDictionary *)bodyJson {
    EMMessageBody *ret = nil;
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
    NSString *type = @"";
    switch (self.type) {
    case EMMessageBodyTypeText:
        type = @"txt";
        break;
    case EMMessageBodyTypeLocation:
        type = @"loc";
        break;
    case EMMessageBodyTypeCmd:
        type = @"cmd";
        break;
    case EMMessageBodyTypeCustom:
        type = @"custom";
        break;
    case EMMessageBodyTypeFile:
        type = @"file";
        break;
    case EMMessageBodyTypeImage:
        type = @"img";
        break;
    case EMMessageBodyTypeVideo:
        type = @"video";
        break;
    case EMMessageBodyTypeVoice:
        type = @"voice";
        break;
    case EMMessageBodyTypeCombine:
        type = @"combine";
        break;
    default:
        break;
    }
    ret[@"type"] = type;
    if (self.operatorId && self.operatorId.length > 0) {
        ret[@"lastModifyOperatorId"] = self.operatorId;
        ret[@"lastModifyTime"] = @(self.operationTime);
        ret[@"modifyCount"] = @(self.operatorCount);
    }

    return ret;
}

+ (EMMessageBodyType)typeFromString:(NSString *)aStrType {

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

@end

#pragma mark - txt

@interface EMTextMessageBody (Json)
+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson;
- (NSDictionary *)toJsonObject;
@end

@implementation EMTextMessageBody (Json)

+ (EMMessageBody *)fromJsonObject:(NSDictionary *)aJson {
    EMTextMessageBody *body =
        [[EMTextMessageBody alloc] initWithText:aJson[@"content"]];
    body.targetLanguages = aJson[@"targetLanguageCodes"];
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
    NSString *buildingName = aJson[@"buildingName"];
    EMLocationMessageBody *ret =
        [[EMLocationMessageBody alloc] initWithLatitude:latitude
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
    EMCmdMessageBody *ret =
        [[EMCmdMessageBody alloc] initWithAction:aJson[@"action"]];
    //    ret.isDeliverOnlineOnly = [aJson[@"deliverOnlineOnly"] boolValue];
    ret.action = aJson[@"action"];
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
        NSData *jsonData =
            [(NSString *)dic dataUsingEncoding:NSUTF8StringEncoding];
        id obj = [NSJSONSerialization
            JSONObjectWithData:jsonData
                       options:NSJSONReadingMutableContainers
                         error:&err];
        if (err == nil && obj != nil) {
            dic = (NSDictionary *)obj;
        } else {
            dic = nil;
        }
    }

    EMCustomMessageBody *ret =
        [[EMCustomMessageBody alloc] initWithEvent:aJson[@"event"]
                                         customExt:dic];
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
    NSString *summary = aJson[@"summary"];
    NSArray *messageIdList = aJson[@"messageIdList"];
    NSString *compatibleText = aJson[@"compatibleText"];
    NSString *localPath = aJson[@"localPath"];
    NSString *remotePath = aJson[@"remotePath"];
    NSString *secret = aJson[@"secret"];

    EMCombineMessageBody *ret =
        [[EMCombineMessageBody alloc] initWithTitle:title
                                            summary:summary
                                     compatibleText:compatibleText
                                      messageIdList:messageIdList];

    ret.remotePath = remotePath;
    ret.secretKey = secret;
    ret.localPath = localPath;
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
    EMFileMessageBody *ret = [[EMFileMessageBody alloc]
        initWithLocalPath:[LocalFileHandler reset:path]
              displayName:displayName];
    ret.secretKey = aJson[@"secret"];
    ret.remotePath = aJson[@"remotePath"];
    ret.fileLength = [aJson[@"fileSize"] longLongValue];
    ret.downloadStatus =
        [ret downloadStatusFromInt:[aJson[@"fileStatus"] intValue]];
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"localPath"] = self.localPath;
    ret[@"displayName"] = self.displayName;
    ret[@"secret"] = self.secretKey;
    ret[@"remotePath"] = self.remotePath;
    ret[@"fileSize"] = @(self.fileLength);
    ret[@"fileStatus"] = @([self downloadStatusToInt:self.downloadStatus]);
    return ret;
}

- (EMDownloadStatus)downloadStatusFromInt:(int)aStatus {
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

- (int)downloadStatusToInt:(EMDownloadStatus)aStatus {
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
    //    NSData *imageData = [NSData dataWithContentsOfFile:path];
    //    EMImageMessageBody *ret =
    //        [[EMImageMessageBody alloc] initWithData:imageData
    //                                     displayName:displayName];
    EMImageMessageBody *ret = [[EMImageMessageBody alloc]
        initWithLocalPath:[LocalFileHandler reset:path]
              displayName:displayName];

    ret.secretKey = aJson[@"secret"];
    ret.remotePath = aJson[@"remotePath"];
    ret.fileLength = [aJson[@"fileSize"] longLongValue];
    ret.downloadStatus =
        [ret downloadStatusFromInt:[aJson[@"fileStatus"] intValue]];
    ret.thumbnailLocalPath = aJson[@"thumbnailLocalPath"];
    ret.thumbnailRemotePath = aJson[@"thumbnailRemotePath"];
    ret.thumbnailSecretKey = aJson[@"thumbnailSecret"];
    ret.size =
        CGSizeMake([aJson[@"width"] floatValue], [aJson[@"height"] floatValue]);
    ret.thumbnailDownloadStatus =
        [ret downloadStatusFromInt:[aJson[@"thumbnailStatus"] intValue]];
    ret.compressionRatio = [aJson[@"sendOriginalImage"] boolValue] ? 1.0 : 0.6;
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"thumbnailLocalPath"] = self.thumbnailLocalPath;
    ret[@"thumbnailRemotePath"] = self.thumbnailRemotePath;
    ret[@"thumbnailSecret"] = self.thumbnailSecretKey;
    ret[@"thumbnailStatus"] =
        @([self downloadStatusToInt:self.thumbnailDownloadStatus]);
    ret[@"fileStatus"] = @([self downloadStatusToInt:self.downloadStatus]);
    ret[@"width"] = @(self.size.width);
    ret[@"height"] = @(self.size.height);
    ret[@"fileSize"] = @(self.fileLength);
    ret[@"remotePath"] = self.remotePath;
    ret[@"secret"] = self.secretKey;
    ret[@"displayName"] = self.displayName;
    ret[@"localPath"] = self.localPath;
    ret[@"sendOriginalImage"] = self.compressionRatio == 1.0 ? @(YES) : @(NO);
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
    EMVideoMessageBody *ret = [[EMVideoMessageBody alloc]
        initWithLocalPath:[LocalFileHandler reset:path]
              displayName:displayName];
    ret.duration = [aJson[@"duration"] intValue];
    ret.secretKey = aJson[@"secret"];
    ret.remotePath = aJson[@"remotePath"];
    ret.fileLength = [aJson[@"fileSize"] longLongValue];
    ret.thumbnailLocalPath = aJson[@"thumbnailLocalPath"];
    ret.thumbnailRemotePath = aJson[@"thumbnailRemotePath"];
    ret.thumbnailSecretKey = aJson[@"thumbnailSecret"];
    ret.thumbnailDownloadStatus =
        [ret downloadStatusFromInt:[aJson[@"thumbnailStatus"] intValue]];
    ret.thumbnailSize =
        CGSizeMake([aJson[@"width"] floatValue], [aJson[@"height"] floatValue]);
    return ret;
}

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[super toJsonObject] mutableCopy];
    ret[@"duration"] = @(self.duration);
    ret[@"thumbnailLocalPath"] = self.thumbnailLocalPath;
    ret[@"secret"] = self.secretKey;
    ret[@"remotePath"] = self.remotePath;
    ret[@"thumbnailRemotePath"] = self.thumbnailRemotePath;
    ret[@"thumbnailSecretKey"] = self.thumbnailSecretKey;
    ret[@"thumbnailStatus"] =
        @([self downloadStatusToInt:self.thumbnailDownloadStatus]);
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
    EMVoiceMessageBody *ret = [[EMVoiceMessageBody alloc]
        initWithLocalPath:[LocalFileHandler reset:path]
              displayName:displayName];
    ret.secretKey = aJson[@"secret"];
    ret.remotePath = aJson[@"remotePath"];
    ret.duration = [aJson[@"duration"] intValue];
    ret.downloadStatus =
        [ret downloadStatusFromInt:[aJson[@"fileStatus"] intValue]];
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
    ret[@"fileStatus"] = @([self downloadStatusToInt:self.downloadStatus]);
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
    data[@"deleteMessagesAsExitChatRoom"] =
        @(self.deleteMessagesOnLeaveChatroom);
    data[@"isAutoDownload"] = @(self.autoDownloadThumbnail);
    data[@"isChatRoomOwnerLeaveAllowed"] = @(self.canChatroomOwnerLeave);
    data[@"serverTransfer"] = @(self.isAutoTransferMessageAttachments);
    data[@"usingHttpsOnly"] = @(self.usingHttpsOnly);
    data[@"pushConfig"] = @{@"pushConfig" : @{@"deviceId" : self.apnsCertName}};
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
    data[@"messagesReceiveCallbackIncludeSend"] =
        @(self.includeSendMessageInMessageListener);
    data[@"regardImportMessagesAsRead"] = @(self.regardImportMessagesAsRead);

    return data;
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
+ (EMOptions *)fromJsonObject:(NSDictionary *)aJson {
    EMOptions *options = [EMOptions optionsWithAppkey:aJson[@"appKey"]];
    options.isAutoLogin = [aJson[@"autoLogin"] boolValue];
    options.enableConsoleLog = [aJson[@"debugModel"] boolValue];
    options.enableRequireReadAck = [aJson[@"requireAck"] boolValue];
    options.enableDeliveryAck = [aJson[@"requireDeliveryAck"] boolValue];
    options.sortMessageByServerTime =
        [aJson[@"sortMessageByServerTime"] boolValue];
    options.autoAcceptFriendInvitation =
        [aJson[@"acceptInvitationAlways"] boolValue];
    options.autoAcceptGroupInvitation =
        [aJson[@"autoAcceptGroupInvitation"] boolValue];
    options.deleteMessagesOnLeaveGroup =
        [aJson[@"deleteMessagesAsExitGroup"] boolValue];
    options.deleteMessagesOnLeaveChatroom =
        [aJson[@"deleteMessagesAsExitChatRoom"] boolValue];
    options.autoDownloadThumbnail = [aJson[@"isAutoDownload"] boolValue];
    options.canChatroomOwnerLeave =
        [aJson[@"isChatRoomOwnerLeaveAllowed"] boolValue];
    options.isAutoTransferMessageAttachments =
        [aJson[@"serverTransfer"] boolValue];
    options.usingHttpsOnly = [aJson[@"usingHttpsOnly"] boolValue];
    options.apnsCertName = aJson[@"pushConfig"][@"apnsCertName"];
    options.enableDnsConfig = [aJson[@"enableDNSConfig"] boolValue];
    options.chatPort = [aJson[@"imPort"] intValue];
    options.chatServer = aJson[@"imServer"];
    options.restServer = aJson[@"restServer"];
    options.dnsURL = aJson[@"dnsURL"];
    options.area = [EMOptions AreaCodeFromInt:[aJson[@"areaCode"] intValue]];
    options.loadEmptyConversations =
        [aJson[@"enableEmptyConversation"] boolValue];
    options.customDeviceName = aJson[@"customDeviceName"];
    if (aJson[@"customOSType"]) {
        options.customOSType = [aJson[@"customOSType"] intValue];
    }

    NSDictionary *pushConfig = aJson[@"pushConfig"];
    if (pushConfig != nil) {
        options.apnsCertName = pushConfig[@"deviceId"];
    }

    options.enableTLSConnection = aJson[@"enableTLS"];
    options.useReplacedMessageContents =
        [aJson[@"useReplacedMessageContents"] boolValue];
    options.includeSendMessageInMessageListener =
        [aJson[@"messagesReceiveCallbackIncludeSend"] boolValue];
    options.regardImportMessagesAsRead =
        [aJson[@"regardImportMessagesAsRead"] boolValue];

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
    data[@"noDisturb"] = @(self.silentModeEnabled);
    data[@"pushStyle"] = @(self.displayStyle != EMPushDisplayStyleSimpleBanner);
    data[@"noDisturbStartHour"] = @(self.silentModeStart);
    data[@"noDisturbEndHour"] = @(self.silentModeEnd);
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
    userInfo.userId = aJson[@"userId"];
    userInfo.nickname = aJson[@"nickName"];
    userInfo.avatarUrl = aJson[@"avatarUrl"];
    userInfo.mail = aJson[@"mail"];
    userInfo.phone = aJson[@"phone"];
    userInfo.gender = [aJson[@"gender"] integerValue] ?: 0;
    userInfo.sign = aJson[@"sign"];
    userInfo.birth = aJson[@"birth"];
    userInfo.ext = aJson[@"ext"];
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
    ret[@"type"] = @([self getIntOperation]);
    ret[@"thread"] = [self.chatThread toJsonObject];
    return ret;
}

- (int)getIntOperation {
    int ret = 0;
    switch (self.type) {
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
    }

    return ret;
}

@end

@implementation EMSilentModeParam (Json)

+ (EMSilentModeParam *)fromJsonObject:(NSDictionary *)dict {
    EMSilentModeParamType paramType =
        [self paramTypeFromInt:[dict[@"paramType"] intValue]];
    EMSilentModeParam *param =
        [[EMSilentModeParam alloc] initWithParamType:paramType];
    NSDictionary *dictStartTime = dict[@"startTime"];
    NSDictionary *dictEndTime = dict[@"endTime"];
    int duration = [dict[@"duration"] intValue];

    EMPushRemindType remindType =
        [self remindTypeFromInt:[dict[@"remindType"] intValue]];

    param.remindType = remindType;
    param.silentModeStartTime = [EMSilentModeTime fromJsonObject:dictStartTime];
    param.silentModeEndTime = [EMSilentModeTime fromJsonObject:dictEndTime];
    param.silentModeDuration = duration;
    return param;
}
+ (EMSilentModeParamType)paramTypeFromInt:(int)iParamType {
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

@end

@implementation EMSilentModeResult (Json)

- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [[NSMutableDictionary alloc] init];
    ret[@"expireTimestamp"] = @(self.expireTimestamp);
    ret[@"startTime"] = [self.silentModeStartTime toJsonObject];
    ret[@"endTime"] = [self.silentModeEndTime toJsonObject];
    ret[@"remindType"] = @([EMSilentModeParam remindTypeToInt:self.remindType]);
    ret[@"conversationId"] = self.conversationID;
    ret[@"conversationType"] =
        @([EMConversation typeToInt:self.conversationType]);
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
    EMFetchServerMessagesOption *options =
        [[EMFetchServerMessagesOption alloc] init];
    options.direction = [dict[@"direction"] isEqual:@(0)]
                            ? EMMessageSearchDirectionUp
                            : EMMessageSearchDirectionDown;
    options.startTime = [dict[@"startTs"] longLongValue];
    options.endTime = [dict[@"endTs"] longLongValue];
    options.from = dict[@"from"];
    options.isSave = [dict[@"needSave"] boolValue];
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
@end

@implementation EMContact (Json)

- (nonnull NSDictionary *)toJsonObject {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"userId"] = self.userId;
    data[@"remark"] = self.remark;
    return data;
}

+ (nonnull EMContact *)fromJsonObject:(nonnull NSDictionary *)dict {
    EMContact *contact = [[EMContact alloc] initWithUserId:dict[@"userId"]
                                                    remark:dict[@"remark"]];
    return contact;
}

@end

@implementation EMConversationFilter (Json)

+ (EMConversationFilter *)fromJsonObject:(NSDictionary *)dict {
    EMConversationFilter *filter = [[EMConversationFilter alloc] init];
    filter.mark = (EMMarkType)[dict[@"mark"] integerValue];
    filter.pageSize = [dict[@"pageSize"] intValue];
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
    info.operatorId = dict[@"operatorId"];
    info.pinTime = [dict[@"pinTime"] integerValue];
    return info;
}
- (NSDictionary *)toJsonObject {
    NSMutableDictionary *ret = [NSMutableDictionary new];
    ret[@"operatorId"] = self.operatorId;
    ret[@"pinTime"] = @(self.pinTime);
    return ret;
}
@end
