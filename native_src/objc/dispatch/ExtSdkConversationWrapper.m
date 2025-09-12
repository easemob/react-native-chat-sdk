//
//  ExtSdkConversationWrapper.m
//
//
//  Created by 杜洁鹏 on 2019/10/8.
//

#import "ExtSdkConversationWrapper.h"
#import "ExtSdkMethodTypeObjc.h"

#import "ExtSdkToJson.h"

@interface ExtSdkConversationWrapper ()

@end

@implementation ExtSdkConversationWrapper

+ (nonnull instancetype)getInstance {
    static ExtSdkConversationWrapper *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkConversationWrapper alloc] init];
    });
    return instance;
}

#pragma mark - Private
- (void)getConversationWithParam:(NSDictionary *)param
                      completion:
                          (void (^)(EMConversation *conversation))aCompletion {
    EMConversation *conv;
    if (param[@"convId"]) {
        conv = [self getConversation:param];
    } else if (param[@"msg"]) {
        EMChatMessage *msg = [EMChatMessage fromJsonObject:param[@"msg"]];
        conv = [self getConversationFromMessage:msg];
    }

    if (aCompletion) {
        aCompletion(conv);
    }
}

#pragma mark - Actions
- (void)getUnreadMsgCount:(nullable NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self
        getConversationWithParam:param
                      completion:^(EMConversation *conversation) {
                        [weakSelf onResult:result
                            withMethodType:ExtSdkMethodKeyGetUnreadMsgCount
                                 withError:nil
                                withParams:@(conversation.unreadMessagesCount)];
                      }];
}

- (void)getMsgCount:(nullable NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          [weakSelf onResult:result
                              withMethodType:aChannelName
                                   withError:nil
                                  withParams:@(conversation.messagesCount)];
                        }];
}

- (void)getLatestMsg:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          EMChatMessage *msg = conversation.latestMessage;
                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeyGetLatestMsg
                                   withError:nil
                                  withParams:[msg toJsonObject]];
                        }];
}

- (void)getLatestMsgFromOthers:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self
        getConversationWithParam:param
                      completion:^(EMConversation *conversation) {
                        EMChatMessage *msg = conversation.lastReceivedMessage;
                        [weakSelf onResult:result
                            withMethodType:ExtSdkMethodKeyGetLatestMsgFromOthers
                                 withError:nil
                                withParams:[msg toJsonObject]];
                      }];
}

- (void)markMsgAsRead:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          NSString *msgId = param[@"msg_id"];
                          EMError *error = nil;
                          [conversation markMessageAsReadWithId:msgId
                                                          error:&error];

                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeyMarkMsgAsRead
                                   withError:error
                                  withParams:nil];
                        }];
}

- (void)syncConversationExt:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          NSDictionary *ext = param[@"ext"];
                          conversation.ext = ext;
                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeySyncConversationExt
                                   withError:nil
                                  withParams:nil];
                        }];
}

- (void)markAllMsgsAsRead:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          EMError *error = nil;
                          [conversation markAllMessagesAsRead:&error];
                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeyMarkAllMsgsAsRead
                                   withError:error
                                  withParams:nil];
                        }];
}

- (void)insertMsg:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          NSDictionary *msgDict = param[@"msg"];
                          EMChatMessage *msg =
                              [EMChatMessage fromJsonObject:msgDict];

                          EMError *error = nil;
                          [conversation insertMessage:msg error:&error];
                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeyInsertMsg
                                   withError:error
                                  withParams:nil];
                        }];
}

- (void)appendMsg:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          NSDictionary *msgDict = param[@"msg"];
                          EMChatMessage *msg =
                              [EMChatMessage fromJsonObject:msgDict];

                          EMError *error = nil;
                          [conversation appendMessage:msg error:&error];
                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeyAppendMsg
                                   withError:error
                                  withParams:nil];
                        }];
}

- (void)updateConversationMsg:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self
        getConversationWithParam:param
                      completion:^(EMConversation *conversation) {
                        NSDictionary *msgDict = param[@"msg"];
                        EMChatMessage *msg =
                            [EMChatMessage fromJsonObject:msgDict];
                        EMChatMessage *dbMsg =
                            [EMClient.sharedClient.chatManager
                                getMessageWithMessageId:msg.messageId];
                        if ([weakSelf checkMessageParams:result
                                          withMethodType:aChannelName
                                             withMessage:msg]) {
                            return;
                        }
                        if ([weakSelf checkMessageParams:result
                                          withMethodType:aChannelName
                                             withMessage:dbMsg]) {
                            return;
                        }
                        [self mergeMessage:msg withDBMessage:dbMsg];

                        EMError *error = nil;
                        [conversation updateMessageChange:dbMsg error:&error];
                        [weakSelf onResult:result
                            withMethodType:ExtSdkMethodKeyUpdateConversationMsg
                                 withError:error
                                withParams:nil];
                      }];
}

- (void)removeMsg:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          NSString *msgId = param[@"msg_id"];
                          EMError *error = nil;
                          [conversation deleteMessageWithId:msgId error:&error];

                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeyRemoveMsg
                                   withError:error
                                  withParams:nil];
                        }];
}

- (void)clearAllMsg:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          EMError *error = nil;
                          [conversation deleteAllMessages:&error];
                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeyClearAllMsg
                                   withError:error
                                  withParams:nil];
                        }];
}

- (void)deleteMessagesWithTimestamp:(NSDictionary *)param
                     withMethodType:(NSString *)aChannelName
                             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          long startTs = [param[@"startTs"] longLongValue];
                          long endTs = [param[@"endTs"] longLongValue];
                          EMError *error =
                              [conversation removeMessagesStart:startTs
                                                             to:endTs];
                          [weakSelf onResult:result
                              withMethodType:aChannelName
                                   withError:error
                                  withParams:nil];
                        }];
}

- (void)pinnedMessages:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          NSArray *pinnedMessages = conversation.pinnedMessages;
                          NSMutableArray *msgJsonAry = [NSMutableArray array];
                          for (EMChatMessage *msg in pinnedMessages) {
                              [msgJsonAry addObject:[msg toJsonObject]];
                          }
                          [weakSelf onResult:result
                              withMethodType:aChannelName
                                   withError:nil
                                  withParams:msgJsonAry];
                        }];
}

#pragma mark - load messages
- (void)loadMsgWithId:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *msgId = param[@"msg_id"];
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          EMError *error = nil;
                          EMChatMessage *msg =
                              [conversation loadMessageWithId:msgId
                                                        error:&error];

                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeyLoadMsgWithId
                                   withError:error
                                  withParams:[msg toJsonObject]];
                        }];
}

- (void)loadMsgWithMsgType:(NSDictionary *)param
            withMethodType:(NSString *)aChannelName
                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;

    EMMessageBodyType type = [EMMessageBody typeFromString:param[@"msg_type"]];
    long long timeStamp = [param[@"timeStamp"] longLongValue];
    int count = [param[@"count"] intValue];
    NSString *sender = param[@"sender"];
    EMMessageSearchDirection direction =
        [self searchDirectionFromString:param[@"direction"]];

    [self
        getConversationWithParam:param
                      completion:^(EMConversation *conversation) {
                        [conversation
                            loadMessagesWithType:type
                                       timestamp:timeStamp
                                           count:count
                                        fromUser:sender
                                 searchDirection:direction
                                      completion:^(NSArray *aMessages,
                                                   EMError *aError) {
                                        NSMutableArray *msgJsonAry =
                                            [NSMutableArray array];
                                        for (EMChatMessage *msg in aMessages) {
                                            [msgJsonAry
                                                addObject:[msg toJsonObject]];
                                        }
                                        [weakSelf onResult:result
                                            withMethodType:
                                                ExtSdkMethodKeyLoadMsgWithMsgType
                                                 withError:aError
                                                withParams:msgJsonAry];
                                      }];
                      }];
}

- (void)loadMsgWithStartId:(NSDictionary *)param
            withMethodType:(NSString *)aChannelName
                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *startId = param[@"startId"];
    int count = [param[@"count"] intValue];
    EMMessageSearchDirection direction =
        [self searchDirectionFromString:param[@"direction"]];

    [self
        getConversationWithParam:param
                      completion:^(EMConversation *conversation) {
                        [conversation
                            loadMessagesStartFromId:startId
                                              count:count
                                    searchDirection:direction
                                         completion:^(NSArray *aMessages,
                                                      EMError *aError) {
                                           NSMutableArray *jsonMsgs =
                                               [NSMutableArray array];
                                           for (EMChatMessage
                                                    *msg in aMessages) {
                                               [jsonMsgs
                                                   addObject:[msg
                                                                 toJsonObject]];
                                           }

                                           [weakSelf onResult:result
                                               withMethodType:
                                                   ExtSdkMethodKeyLoadMsgWithStartId
                                                    withError:aError
                                                   withParams:jsonMsgs];
                                         }];
                      }];
}

- (void)loadMsgWithKeywords:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *keywords = param[@"keywords"];
    long long timestamp = [param[@"timestamp"] longLongValue];
    int count = [param[@"count"] intValue];
    NSString *sender = param[@"sender"];
    EMMessageSearchDirection direction =
        [self searchDirectionFromString:param[@"direction"]];
    EMMessageSearchScope scope =
        (EMMessageSearchScope)[param[@"searchScope"] intValue];
    [self
        getConversationWithParam:param
                      completion:^(EMConversation *conversation) {
                        [conversation
                            loadMessagesWithKeyword:keywords
                                          timestamp:timestamp
                                              count:count
                                           fromUser:sender
                                    searchDirection:direction
                                              scope:scope
                                         completion:^(NSArray *aMessages,
                                                      EMError *aError) {
                                           NSMutableArray *msgJsonAry =
                                               [NSMutableArray array];
                                           for (EMChatMessage
                                                    *msg in aMessages) {
                                               [msgJsonAry
                                                   addObject:[msg
                                                                 toJsonObject]];
                                           }
                                           [weakSelf onResult:result
                                               withMethodType:
                                                   ExtSdkMethodKeyLoadMsgWithKeywords
                                                    withError:aError
                                                   withParams:msgJsonAry];
                                         }];
                      }];
}

- (void)loadMsgWithTime:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    long long startTime = [param[@"startTime"] longLongValue];
    long long entTime = [param[@"endTime"] longLongValue];
    int count = [param[@"count"] intValue];
    [self getConversationWithParam:param
                        completion:^(EMConversation *conversation) {
                          [conversation
                              loadMessagesFrom:startTime
                                            to:entTime
                                         count:count
                                    completion:^(NSArray *aMessages,
                                                 EMError *aError) {
                                      NSMutableArray *msgJsonAry =
                                          [NSMutableArray array];
                                      for (EMChatMessage *msg in aMessages) {
                                          [msgJsonAry
                                              addObject:[msg toJsonObject]];
                                      }
                                      [weakSelf onResult:result
                                          withMethodType:
                                              ExtSdkMethodKeyLoadMsgWithTime
                                               withError:aError
                                              withParams:msgJsonAry];
                                    }];
                        }];
}

- (EMMessageSearchDirection)searchDirectionFromString:(NSString *)aDirection {
    return [aDirection isEqualToString:@"up"] ? EMMessageSearchDirectionUp
                                              : EMMessageSearchDirectionDown;
}

@end
