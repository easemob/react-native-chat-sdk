//
//  ExtSdkWrapper.m
//
//
//  Created by 杜洁鹏 on 2019/10/8.
//

#import "ExtSdkWrapper.h"
#import "ExtSdkDispatch.h"
#import "ExtSdkToJson.h"

#define easemob_dispatch_main_async_safe(block)                                \
    if ([NSThread isMainThread]) {                                             \
        block();                                                               \
    } else {                                                                   \
        dispatch_async(dispatch_get_main_queue(), block);                      \
    }

static NSString *const TAG = @"ExtSdkWrapper";
@implementation ExtSdkWrapper

- (void)onResult:(nonnull id<ExtSdkCallbackObjc>)result
    withMethodType:(nonnull NSString *)methodType
         withError:(nullable EMError *)error
        withParams:(nullable NSObject *)params {
    NSLog(@"%@: onResult: %@, %@, %@", TAG, methodType,
          error ? [error toJsonObject] : @"", params ? params : @"");
    if (nil == error) {
        NSMutableDictionary *data = [NSMutableDictionary dictionary];
        if (params) {
            data[methodType] = params;
        }
        [result onSuccess:data];
    } else {
        NSMutableDictionary *data = [NSMutableDictionary dictionary];
        data[@"error"] = [error toJsonObject];
        [result onFail:error.code withExtension:data];
    }
}

- (void)onReceive:(NSString *)methodType
       withParams:(nullable NSObject *)params {
    [[ExtSdkDispatch getInstance] onReceive:methodType withParams:params];
}

- (BOOL)checkMessageParams:(nonnull id<ExtSdkCallbackObjc>)result
            withMethodType:(nonnull NSString *)methodType
               withMessage:(nullable EMChatMessage *)message {
    if (message == nil) {
        [self onResult:result
            withMethodType:methodType
                 withError:[EMError errorWithDescription:
                                        @"The message does not exist."
                                                    code:1]
                withParams:nil];
        return YES;
    }
    return NO;
}

- (BOOL)getMessageParams:(nonnull id<ExtSdkCallbackObjc>)result
          withMethodType:(nonnull NSString *)methodType
             withMessage:(nullable EMChatMessage *)message {
    if (message == nil) {
        [self onResult:result
            withMethodType:methodType
                 withError:nil
                withParams:nil];
        return YES;
    }
    return NO;
}

- (void)mergeMessageBody:(EMMessageBody *)msgBody
       withDBMessageBody:(EMMessageBody *)dbMsgBody {
    if (msgBody.type == EMMessageBodyTypeText) {
        EMTextMessageBody *body = (EMTextMessageBody *)msgBody;
        EMTextMessageBody *dbBody = (EMTextMessageBody *)dbMsgBody;
        dbBody.targetLanguages = body.targetLanguages;
    } else if (msgBody.type == EMMessageBodyTypeImage) {
        EMImageMessageBody *body = (EMImageMessageBody *)msgBody;
        EMImageMessageBody *dbBody = (EMImageMessageBody *)dbMsgBody;
        dbBody.displayName = body.displayName;
        dbBody.localPath = body.localPath;
        dbBody.remotePath = body.remotePath;
        dbBody.secretKey = body.secretKey;
        dbBody.fileLength = body.fileLength;
        dbBody.downloadStatus = body.downloadStatus;
        dbBody.size = body.size;
        dbBody.compressionRatio = body.compressionRatio;
        dbBody.thumbnailDisplayName = body.thumbnailDisplayName;
        dbBody.thumbnailLocalPath = body.thumbnailLocalPath;
        dbBody.thumbnailRemotePath = body.thumbnailRemotePath;
        dbBody.thumbnailSecretKey = body.thumbnailSecretKey;
        dbBody.thumbnailSize = body.thumbnailSize;
        dbBody.thumbnailFileLength = body.thumbnailFileLength;
        dbBody.thumbnailDownloadStatus = body.thumbnailDownloadStatus;
    } else if (msgBody.type == EMMessageBodyTypeVideo) {
        EMVideoMessageBody *body = (EMVideoMessageBody *)msgBody;
        EMVideoMessageBody *dbBody = (EMVideoMessageBody *)dbMsgBody;
        dbBody.displayName = body.displayName;
        dbBody.localPath = body.localPath;
        dbBody.remotePath = body.remotePath;
        dbBody.secretKey = body.secretKey;
        dbBody.fileLength = body.fileLength;
        dbBody.downloadStatus = body.downloadStatus;
        dbBody.duration = body.duration;
        dbBody.thumbnailLocalPath = body.thumbnailLocalPath;
        dbBody.thumbnailRemotePath = body.thumbnailRemotePath;
        dbBody.thumbnailSecretKey = body.thumbnailSecretKey;
        dbBody.thumbnailSize = body.thumbnailSize;
        dbBody.thumbnailDownloadStatus = body.thumbnailDownloadStatus;
    } else if (msgBody.type == EMMessageBodyTypeLocation) {
        EMLocationMessageBody *body = (EMLocationMessageBody *)msgBody;
        EMLocationMessageBody *dbBody = (EMLocationMessageBody *)dbMsgBody;
        dbBody.latitude = body.latitude;
        dbBody.longitude = body.longitude;
        dbBody.address = body.address;
        dbBody.buildingName = body.buildingName;
    } else if (msgBody.type == EMMessageBodyTypeVoice) {
        EMVoiceMessageBody *body = (EMVoiceMessageBody *)msgBody;
        EMVoiceMessageBody *dbBody = (EMVoiceMessageBody *)dbMsgBody;
        dbBody.displayName = body.displayName;
        dbBody.localPath = body.localPath;
        dbBody.remotePath = body.remotePath;
        dbBody.secretKey = body.secretKey;
        dbBody.fileLength = body.fileLength;
        dbBody.downloadStatus = body.downloadStatus;
        dbBody.duration = body.duration;
    } else if (msgBody.type == EMMessageBodyTypeFile) {
        EMFileMessageBody *body = (EMFileMessageBody *)msgBody;
        EMFileMessageBody *dbBody = (EMFileMessageBody *)dbMsgBody;
        dbBody.displayName = body.displayName;
        dbBody.localPath = body.localPath;
        dbBody.remotePath = body.remotePath;
        dbBody.secretKey = body.secretKey;
        dbBody.fileLength = body.fileLength;
        dbBody.downloadStatus = body.downloadStatus;
    } else if (msgBody.type == EMMessageBodyTypeCmd) {
        EMCmdMessageBody *body = (EMCmdMessageBody *)msgBody;
        EMCmdMessageBody *dbBody = (EMCmdMessageBody *)dbMsgBody;
        dbBody.action = body.action;
        dbBody.isDeliverOnlineOnly = body.isDeliverOnlineOnly;
    } else if (msgBody.type == EMMessageBodyTypeCustom) {
        EMCustomMessageBody *body = (EMCustomMessageBody *)msgBody;
        EMCustomMessageBody *dbBody = (EMCustomMessageBody *)dbMsgBody;
        dbBody.event = body.event;
        dbBody.customExt = body.customExt;
    } else if (msgBody.type == EMMessageBodyTypeCombine) {
        EMCombineMessageBody *body = (EMCombineMessageBody *)msgBody;
        EMCombineMessageBody *dbBody = (EMCombineMessageBody *)dbMsgBody;
        dbBody.title = body.title;
        dbBody.summary = body.summary;
        dbBody.compatibleText = body.compatibleText;
    }
}

- (void)mergeMessage:(EMChatMessage *)msg withDBMessage:(EMChatMessage *)dbMsg {
    //    dbMsg.messageId = msg.messageId;
    //    dbMsg.conversationId = msg.conversationId;
    //    dbMsg.direction = msg.direction;
    //    dbMsg.from = msg.from;
    //    dbMsg.to = msg.to;
    //    dbMsg.timestamp = msg.timestamp;
    dbMsg.localTime = msg.localTime;
    //    dbMsg.chatType = msg.chatType;
    dbMsg.status = msg.status;
    //    dbMsg.isReadAcked = msg.isReadAcked;
    dbMsg.isChatThreadMessage = msg.isChatThreadMessage;
    dbMsg.isNeedGroupAck = msg.isNeedGroupAck;
    //    dbMsg.isDeliverAcked = msg.isDeliverAcked;
    dbMsg.isRead = msg.isRead;
    dbMsg.isListened = msg.isListened;
    dbMsg.ext = msg.ext;
    //    dbMsg.priority = msg.priority;
    dbMsg.deliverOnlineOnly = msg.deliverOnlineOnly;
    dbMsg.receiverList = msg.receiverList;
    [self mergeMessageBody:msg.body withDBMessageBody:dbMsg.body];
}

- (EMConversation *)getConversation:(NSDictionary *)param {
    NSString *convId = param[@"convId"];
    EMConversationType convType =
        [EMConversation typeFromInt:[param[@"convType"] intValue]];
    BOOL isChatThread =
        param[@"isChatThread"] ? [param[@"isChatThread"] boolValue] : NO;
    BOOL createIfNotExist =
        param[@"createIfNeed"] ? [param[@"createIfNeed"] boolValue] : YES;
    return [[EMClient.sharedClient chatManager] getConversation:convId
                                                           type:convType
                                               createIfNotExist:createIfNotExist
                                                       isThread:isChatThread];
}

- (EMConversation *)getConversationFromMessage:(EMChatMessage *)msg {
    BOOL createIfNotExist = msg.body.type != EMMessageBodyTypeCmd;
    return [[EMClient.sharedClient chatManager]
         getConversation:msg.conversationId
                    type:(EMConversationType)msg.chatType
        createIfNotExist:createIfNotExist
                isThread:msg.isChatThreadMessage];
}

@end
