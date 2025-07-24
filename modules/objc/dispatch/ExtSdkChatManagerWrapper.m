//
//  ExtSdkChatManagerWrapper.m
//
//
//  Created by 杜洁鹏 on 2019/10/8.
//

#import "ExtSdkChatManagerWrapper.h"
#import "ExtSdkMethodTypeObjc.h"

#import "ExtSdkToJson.h"

@interface ExtSdkChatManagerWrapper () <EMChatManagerDelegate>

@end

@implementation ExtSdkChatManagerWrapper

+ (nonnull instancetype)getInstance {
    static ExtSdkChatManagerWrapper *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkChatManagerWrapper alloc] init];
    });
    return instance;
}

- (void)initSdk {
    [EMClient.sharedClient.chatManager removeDelegate:self];
    [EMClient.sharedClient.chatManager addDelegate:self delegateQueue:nil];
}

#pragma mark - Actions

- (void)sendMessage:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;
    __block EMChatMessage *msg = [EMChatMessage fromJsonObject:param];

    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }

    [EMClient.sharedClient.chatManager sendMessage:msg
        progress:^(int progress) {
          [weakSelf onReceive:aChannelName
                   withParams:@{
                       @"progress" : @(progress),
                       @"localTime" : @(msg.localTime),
                       @"callbackType" : ExtSdkMethodKeyOnMessageProgressUpdate
                   }];
        }
        completion:^(EMChatMessage *message, EMError *error) {
          if (error) {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"error" : [error toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"message" : [message toJsonObject],
                           @"callbackType" : ExtSdkMethodKeyOnMessageError
                       }];
          } else {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"message" : [message toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"callbackType" : ExtSdkMethodKeyOnMessageSuccess
                       }];
          }
        }];

    [weakSelf onResult:result withMethodType:aChannelName withError:nil withParams:[msg toJsonObject]];
}

- (void)resendMessage:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {

    __weak typeof(self) weakSelf = self;
    __block EMChatMessage *msg = [EMChatMessage fromJsonObject:param];

    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }

    [EMClient.sharedClient.chatManager resendMessage:msg
        progress:^(int progress) {
          [weakSelf onReceive:aChannelName
                   withParams:@{
                       @"progress" : @(progress),
                       @"localTime" : @(msg.localTime),
                       @"callbackType" : ExtSdkMethodKeyOnMessageProgressUpdate
                   }];
        }
        completion:^(EMChatMessage *message, EMError *error) {
          if (error) {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"error" : [error toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"message" : [message toJsonObject],
                           @"callbackType" : ExtSdkMethodKeyOnMessageError
                       }];
          } else {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"message" : [message toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"callbackType" : ExtSdkMethodKeyOnMessageSuccess
                       }];
          }
        }];

    [weakSelf onResult:result withMethodType:aChannelName withError:nil withParams:[msg toJsonObject]];
}

- (void)ackMessageRead:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *msgId = param[@"msg_id"];
    NSString *to = param[@"to"];
    [EMClient.sharedClient.chatManager sendMessageReadAck:msgId
                                                   toUser:to
                                               completion:^(EMError *aError) {
                                                 [weakSelf onResult:result
                                                     withMethodType:aChannelName
                                                          withError:aError
                                                         withParams:@(!aError)];
                                               }];
}

- (void)ackGroupMessageRead:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *msgId = param[@"msg_id"];
    NSString *groupId = param[@"group_id"];
    NSString *content = param[@"content"];
    [EMClient.sharedClient.chatManager sendGroupMessageReadAck:msgId
                                                       toGroup:groupId
                                                       content:content
                                                    completion:^(EMError *aError) {
                                                      [weakSelf onResult:result
                                                          withMethodType:aChannelName
                                                               withError:aError
                                                              withParams:@(!aError)];
                                                    }];
}

- (void)ackConversationRead:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *conversationId = param[@"convId"];
    [EMClient.sharedClient.chatManager ackConversationRead:conversationId
                                                completion:^(EMError *aError) {
                                                  [weakSelf onResult:result
                                                      withMethodType:aChannelName
                                                           withError:aError
                                                          withParams:@(!aError)];
                                                }];
}

- (void)recallMessage:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *msgId = param[@"msg_id"];
    NSString *ext = param[@"ext"];
    EMChatMessage *msg = [EMClient.sharedClient.chatManager getMessageWithMessageId:msgId];
    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }
    [EMClient.sharedClient.chatManager recallMessageWithMessageId:msgId
                                                              ext:ext
                                                       completion:^(EMError *aError) {
                                                         [weakSelf onResult:result
                                                             withMethodType:aChannelName
                                                                  withError:aError
                                                                 withParams:@(!aError)];
                                                       }];
}

- (void)getMessageWithMessageId:(NSDictionary *)param
                 withMethodType:(NSString *)aChannelName
                         result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *msgId = param[@"msg_id"];
    EMChatMessage *msg = [EMClient.sharedClient.chatManager getMessageWithMessageId:msgId];
    if ([self getMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }
    [self onResult:result withMethodType:aChannelName withError:nil withParams:[msg toJsonObject]];
}

- (void)getConversationApi:(NSDictionary *)param
            withMethodType:(NSString *)aChannelName
                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    EMConversation *conv = [self getConversation:param];

    [weakSelf onResult:result withMethodType:aChannelName withError:nil withParams:[conv toJsonObject]];
}

- (void)markAllMessagesAsRead:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    EMError *error = [EMClient.sharedClient.chatManager markAllConversationsAsRead];

    [weakSelf onResult:result withMethodType:aChannelName withError:error withParams:nil];
}

- (void)getMessageCount:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager getMessageCountWithCompletion:^(NSInteger count, EMError *_Nullable aError) {
      [weakSelf onResult:result withMethodType:aChannelName withError:aError withParams:@(count)];
    }];
}

- (void)getUnreadMessageCount:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray *conList = [EMClient.sharedClient.chatManager getAllConversations];
    int unreadCount = 0;
    EMError *error = nil;
    for (EMConversation *con in conList) {
        unreadCount += con.unreadMessagesCount;
    }

    [weakSelf onResult:result withMethodType:aChannelName withError:error withParams:@(unreadCount)];
}

- (void)updateChatMessage:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    EMChatMessage *msg = [EMChatMessage fromJsonObject:param[@"message"]];
    EMChatMessage *dbMsg = [EMClient.sharedClient.chatManager getMessageWithMessageId:param[@"message"][@"msgId"]];

    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }
    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:dbMsg]) {
        return;
    }

    [self mergeMessage:msg withDBMessage:dbMsg];

    [EMClient.sharedClient.chatManager updateMessage:dbMsg
                                          completion:^(EMChatMessage *aMessage, EMError *aError) {
                                            [weakSelf onResult:result
                                                withMethodType:aChannelName
                                                     withError:aError
                                                    withParams:[aMessage toJsonObject]];
                                          }];
}

- (void)importMessages:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray *dictAry = param[@"messages"];
    NSMutableArray *messages = [NSMutableArray array];
    for (NSDictionary *dict in dictAry) {
        [messages addObject:[EMChatMessage fromJsonObject:dict]];
    }
    [[EMClient sharedClient].chatManager importMessages:messages
                                             completion:^(EMError *aError) {
                                               [weakSelf onResult:result
                                                   withMethodType:aChannelName
                                                        withError:aError
                                                       withParams:@(!aError)];
                                             }];
}

- (void)downloadAttachmentInCombine:(NSDictionary *)param
                     withMethodType:(NSString *)aChannelName
                             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    __block EMChatMessage *msg = [EMChatMessage fromJsonObject:param[@"message"]];

    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }

    [EMClient.sharedClient.chatManager downloadMessageAttachment:msg
        progress:^(int progress) {
          [weakSelf onReceive:aChannelName
                   withParams:@{
                       @"progress" : @(progress),
                       @"localTime" : @(msg.localTime),
                       @"msgId" : msg.messageId,
                       @"callbackType" : ExtSdkMethodKeyOnMessageProgressUpdate
                   }];
        }
        completion:^(EMChatMessage *message, EMError *error) {
          if (error) {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"error" : [error toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"message" : [message toJsonObject],
                           @"msgId" : msg.messageId,
                           @"callbackType" : ExtSdkMethodKeyOnMessageError
                       }];
          } else {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"message" : [message toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"msgId" : msg.messageId,
                           @"callbackType" : ExtSdkMethodKeyOnMessageSuccess
                       }];
          }
        }];

    [weakSelf onResult:result withMethodType:aChannelName withError:nil withParams:[msg toJsonObject]];
}

- (void)downloadThumbnailInCombine:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    __block EMChatMessage *msg = [EMChatMessage fromJsonObject:param[@"message"]];

    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }

    [EMClient.sharedClient.chatManager downloadMessageThumbnail:msg
        progress:^(int progress) {
          [weakSelf onReceive:aChannelName
                   withParams:@{
                       @"progress" : @(progress),
                       @"localTime" : @(msg.localTime),
                       @"msgId" : msg.messageId,
                       @"callbackType" : ExtSdkMethodKeyOnMessageProgressUpdate
                   }];
        }
        completion:^(EMChatMessage *message, EMError *error) {
          if (error) {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"error" : [error toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"message" : [message toJsonObject],
                           @"msgId" : msg.messageId,
                           @"callbackType" : ExtSdkMethodKeyOnMessageError
                       }];
          } else {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"message" : [message toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"msgId" : msg.messageId,
                           @"callbackType" : ExtSdkMethodKeyOnMessageSuccess
                       }];
          }
        }];

    [weakSelf onResult:result withMethodType:aChannelName withError:nil withParams:[msg toJsonObject]];
}

- (void)downloadAttachment:(NSDictionary *)param
            withMethodType:(NSString *)aChannelName
                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    __block EMChatMessage *msg = [EMChatMessage fromJsonObject:param[@"message"]];

    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }

    EMChatMessage *needDownMSg = [EMClient.sharedClient.chatManager getMessageWithMessageId:msg.messageId];
    [EMClient.sharedClient.chatManager downloadMessageAttachment:needDownMSg
        progress:^(int progress) {
          [weakSelf onReceive:aChannelName
                   withParams:@{
                       @"progress" : @(progress),
                       @"localTime" : @(msg.localTime),
                       @"msgId" : msg.messageId,
                       @"callbackType" : ExtSdkMethodKeyOnMessageProgressUpdate
                   }];
        }
        completion:^(EMChatMessage *message, EMError *error) {
          if (error) {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"error" : [error toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"message" : [message toJsonObject],
                           @"msgId" : msg.messageId,
                           @"callbackType" : ExtSdkMethodKeyOnMessageError
                       }];
          } else {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"message" : [message toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"msgId" : msg.messageId,
                           @"callbackType" : ExtSdkMethodKeyOnMessageSuccess
                       }];
          }
        }];

    [weakSelf onResult:result withMethodType:aChannelName withError:nil withParams:[msg toJsonObject]];
}

- (void)downloadThumbnail:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    __block EMChatMessage *msg = [EMChatMessage fromJsonObject:param[@"message"]];

    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }

    EMChatMessage *needDownMSg = [EMClient.sharedClient.chatManager getMessageWithMessageId:msg.messageId];
    [EMClient.sharedClient.chatManager downloadMessageThumbnail:needDownMSg
        progress:^(int progress) {
          [weakSelf onReceive:aChannelName
                   withParams:@{
                       @"progress" : @(progress),
                       @"localTime" : @(msg.localTime),
                       @"msgId" : msg.messageId,
                       @"callbackType" : ExtSdkMethodKeyOnMessageProgressUpdate
                   }];
        }
        completion:^(EMChatMessage *message, EMError *error) {
          if (error) {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"error" : [error toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"message" : [message toJsonObject],
                           @"msgId" : msg.messageId,
                           @"callbackType" : ExtSdkMethodKeyOnMessageError
                       }];
          } else {
              [weakSelf onReceive:aChannelName
                       withParams:@{
                           @"message" : [message toJsonObject],
                           @"localTime" : @(msg.localTime),
                           @"msgId" : msg.messageId,
                           @"callbackType" : ExtSdkMethodKeyOnMessageSuccess
                       }];
          }
        }];

    [weakSelf onResult:result withMethodType:aChannelName withError:nil withParams:[msg toJsonObject]];
}

- (void)loadAllConversations:(NSDictionary *)param
              withMethodType:(NSString *)aChannelName
                      result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSArray *conversations = [EMClient.sharedClient.chatManager getAllConversations];
    NSArray *sortedList =
        [conversations sortedArrayUsingComparator:^NSComparisonResult(id _Nonnull obj1, id _Nonnull obj2) {
          if (((EMConversation *)obj1).latestMessage.timestamp > ((EMConversation *)obj2).latestMessage.timestamp) {
              return NSOrderedAscending;
          } else {
              return NSOrderedDescending;
          }
        }];
    NSMutableArray *conList = [NSMutableArray array];
    for (EMConversation *conversation in sortedList) {
        [conList addObject:[conversation toJsonObject]];
    }

    [self onResult:result withMethodType:aChannelName withError:nil withParams:conList];
}

- (void)getConversationsFromServer:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    // !!! It has been marked as invalid in the typescript language.
    [EMClient.sharedClient.chatManager getConversationsFromServer:^(NSArray *aCoversations, EMError *aError) {
      NSArray *sortedList =
          [aCoversations sortedArrayUsingComparator:^NSComparisonResult(id _Nonnull obj1, id _Nonnull obj2) {
            if (((EMConversation *)obj1).latestMessage.timestamp > ((EMConversation *)obj2).latestMessage.timestamp) {
                return NSOrderedAscending;
            } else {
                return NSOrderedDescending;
            }
          }];
      NSMutableArray *conList = [NSMutableArray array];
      for (EMConversation *conversation in sortedList) {
          [conList addObject:[conversation toJsonObject]];
      }

      [weakSelf onResult:result withMethodType:aChannelName withError:nil withParams:conList];
    }];
}

- (void)deleteConversation:(NSDictionary *)param
            withMethodType:(NSString *)aChannelName
                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *conversationId = param[@"convId"];
    BOOL isDeleteMsgs = [param[@"deleteMessages"] boolValue];
    [EMClient.sharedClient.chatManager deleteConversation:conversationId
                                         isDeleteMessages:isDeleteMsgs
                                               completion:^(NSString *aConversationId, EMError *aError) {
                                                 [weakSelf onResult:result
                                                     withMethodType:aChannelName
                                                          withError:aError
                                                         withParams:@(!aError)];
                                               }];
}

- (void)fetchHistoryMessages:(NSDictionary *)param
              withMethodType:(NSString *)aChannelName
                      result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *conversationId = param[@"convId"];
    EMConversationType type = (EMConversationType)[param[@"convType"] intValue];
    int pageSize = [param[@"pageSize"] intValue];
    NSString *startMsgId = param[@"startMsgId"];
    int direction = [param[@"direction"] intValue];
    // !!! It has been marked as invalid in the typescript language.
    [EMClient.sharedClient.chatManager
        asyncFetchHistoryMessagesFromServer:conversationId
                           conversationType:type
                             startMessageId:startMsgId
                             fetchDirection:(direction == 0 ? EMMessageFetchHistoryDirectionUp
                                                            : EMMessageFetchHistoryDirectionDown)
                                   pageSize:pageSize
                                 completion:^(EMCursorResult<EMChatMessage *> *_Nullable aResult,
                                              EMError *_Nullable aError) {
                                   [weakSelf onResult:result
                                       withMethodType:aChannelName
                                            withError:aError
                                           withParams:[aResult toJsonObject]];
                                 }];
}

- (void)fetchGroupReadAck:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *msgId = param[@"msg_id"];
    int pageSize = [param[@"pageSize"] intValue];
    NSString *ackId = param[@"ack_id"];
    NSString *groupId = param[@"group_id"];

    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager
        asyncFetchGroupMessageAcksFromServer:msgId
                                     groupId:groupId
                             startGroupAckId:ackId
                                    pageSize:pageSize
                                  completion:^(EMCursorResult *aResult, EMError *aError, int totalCount) {
                                    [weakSelf onResult:result
                                        withMethodType:aChannelName
                                             withError:aError
                                            withParams:[aResult toJsonObject]];
                                  }];
}

- (void)searchChatMsgFromDB:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *keywords = param[@"keywords"];
    long long timestamp = [param[@"timestamp"] longLongValue];
    int maxCount = [param[@"maxCount"] intValue];
    NSString *from = param[@"from"];
    EMMessageSearchDirection direction = [ExtSdkConvertHelper searchDirectionFromString:param[@"direction"]];
    EMMessageSearchScope scope = [ExtSdkConvertHelper searchScopeFromInt:[param[@"searchScope"] integerValue]];
    [EMClient.sharedClient.chatManager loadMessagesWithKeyword:keywords
                                                     timestamp:timestamp
                                                         count:maxCount
                                                      fromUser:from
                                               searchDirection:direction
                                                         scope:scope
                                                    completion:^(NSArray<EMChatMessage *> *aMessages, EMError *aError) {
                                                      NSMutableArray *msgList = [NSMutableArray array];
                                                      for (EMChatMessage *msg in aMessages) {
                                                          [msgList addObject:[msg toJsonObject]];
                                                      }

                                                      [weakSelf onResult:result
                                                          withMethodType:aChannelName
                                                               withError:aError
                                                              withParams:msgList];
                                                    }];
}

- (void)deleteRemoteConversation:(NSDictionary *)param
                  withMethodType:(NSString *)aChannelName
                          result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *conversationId = param[@"conversationId"];
    EMConversationType type = EMConversationTypeChat;
    BOOL isDeleteRemoteMessage = [param[@"isDeleteRemoteMessage"] boolValue];
    int intType = [param[@"conversationType"] intValue];
    if (intType == 0) {
        type = EMConversationTypeChat;
    } else if (intType == 1) {
        type = EMConversationTypeGroupChat;
    } else {
        type = EMConversationTypeChatRoom;
    }

    [EMClient.sharedClient.chatManager deleteServerConversation:conversationId
                                               conversationType:type
                                         isDeleteServerMessages:isDeleteRemoteMessage
                                                     completion:^(NSString *aConversationId, EMError *aError) {
                                                       [weakSelf onResult:result
                                                           withMethodType:aChannelName
                                                                withError:aError
                                                               withParams:@(!aError)];
                                                     }];
}

- (void)translateMessage:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result {
    EMChatMessage *msg = [EMChatMessage fromJsonObject:param[@"message"]];
    NSArray *languages = param[@"languages"];

    EMChatMessage *dbMsg = [EMClient.sharedClient.chatManager getMessageWithMessageId:msg.messageId];

    if ([self checkMessageParams:result withMethodType:aChannelName withMessage:msg]) {
        return;
    }

    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager translateMessage:dbMsg
                                        targetLanguages:languages
                                             completion:^(EMChatMessage *message, EMError *error) {
                                               [weakSelf onResult:result
                                                   withMethodType:aChannelName
                                                        withError:error
                                                       withParams:@{@"message" : [message toJsonObject]}];
                                             }];
}

- (void)fetchSupportLanguages:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager
        fetchSupportedLanguages:^(NSArray<EMTranslateLanguage *> *_Nullable languages, EMError *_Nullable error) {
          [weakSelf onResult:result withMethodType:aChannelName withError:error withParams:[languages toJsonArray]];
        }];
}

- (void)addReaction:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *reaction = param[@"reaction"];
    NSString *msgId = param[@"msgId"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager addReaction:reaction
                                         toMessage:msgId
                                        completion:^(EMError *error) {
                                          [weakSelf onResult:result
                                              withMethodType:aChannelName
                                                   withError:error
                                                  withParams:nil];
                                        }];
}

- (void)removeReaction:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *reaction = param[@"reaction"];
    NSString *msgId = param[@"msgId"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager removeReaction:reaction
                                          fromMessage:msgId
                                           completion:^(EMError *error) {
                                             [weakSelf onResult:result
                                                 withMethodType:aChannelName
                                                      withError:error
                                                     withParams:nil];
                                           }];
}

- (void)fetchReactionList:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSArray *msgIds = param[@"msgIds"];
    NSString *groupId = param[@"groupId"];
    EMChatType type = [ExtSdkConvertHelper chatTypeFromInt:[param[@"chatType"] intValue]];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager getReactionList:msgIds
                                               groupId:groupId
                                              chatType:type
                                            completion:^(NSDictionary<NSString *, NSArray *> *dic, EMError *error) {
                                              NSMutableDictionary *dictionary = [NSMutableDictionary dictionary];
                                              for (NSString *key in dic.allKeys) {
                                                  NSArray *ary = dic[key];
                                                  NSMutableArray *list = [NSMutableArray array];
                                                  for (EMMessageReaction *reaction in ary) {
                                                      [list addObject:[reaction toJsonObject]];
                                                  }
                                                  dictionary[key] = list;
                                              }

                                              [weakSelf onResult:result
                                                  withMethodType:aChannelName
                                                       withError:error
                                                      withParams:dictionary];
                                            }];
}

- (void)fetchReactionDetail:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *msgId = param[@"msgId"];
    NSString *reaction = param[@"reaction"];
    NSString *cursor = param[@"cursor"];
    int pageSize = 50;
    if (param[@"pageSize"] != nil) {
        pageSize = [param[@"pageSize"] intValue];
    }
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager
        getReactionDetail:msgId
                 reaction:reaction
                   cursor:cursor
                 pageSize:pageSize
               completion:^(EMMessageReaction *reaction, NSString *_Nullable cursor, EMError *error) {
                 EMCursorResult *cursorResult = nil;
                 if (error == nil) {
                     cursorResult = [EMCursorResult cursorResultWithList:@[ reaction ] andCursor:cursor];
                 }

                 [weakSelf onResult:result
                     withMethodType:aChannelName
                          withError:error
                         withParams:[cursorResult toJsonObject]];
               }];
}

- (void)reportMessage:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *msgId = param[@"msgId"];
    NSString *tag = param[@"tag"];
    NSString *reason = param[@"reason"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager reportMessageWithId:msgId
                                                       tag:tag
                                                    reason:reason
                                                completion:^(EMError *error) {
                                                  [weakSelf onResult:result
                                                      withMethodType:aChannelName
                                                           withError:error
                                                          withParams:nil];
                                                }];
}

- (void)deleteMessagesBeforeTimestamp:(NSDictionary *)param
                       withMethodType:(NSString *)aChannelName
                               result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSUInteger timestamp = [param[@"timestamp"] longValue];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.chatManager deleteMessagesBefore:timestamp
                                                 completion:^(EMError *error) {
                                                   [weakSelf onResult:result
                                                       withMethodType:aChannelName
                                                            withError:error
                                                           withParams:nil];
                                                 }];
}

- (void)fetchConversationsFromServerWithPage:(NSDictionary *)param
                              withMethodType:(NSString *)aChannelName
                                      result:(nonnull id<ExtSdkCallbackObjc>)result {
    int pageSize = [param[@"pageSize"] intValue];
    int pageNum = [param[@"pageNum"] intValue];
    __weak typeof(self) weakSelf = self;
    // !!! It has been marked as invalid in the typescript language.
    [EMClient.sharedClient.chatManager
        getConversationsFromServerByPage:pageNum
                                pageSize:pageSize
                              completion:^(NSArray<EMConversation *> *_Nullable aConversations,
                                           EMError *_Nullable aError) {
                                NSArray *sortedList = [aConversations
                                    sortedArrayUsingComparator:^NSComparisonResult(id _Nonnull obj1, id _Nonnull obj2) {
                                      if (((EMConversation *)obj1).latestMessage.timestamp >
                                          ((EMConversation *)obj2).latestMessage.timestamp) {
                                          return NSOrderedAscending;
                                      } else {
                                          return NSOrderedDescending;
                                      }
                                    }];
                                NSMutableArray *conList = [NSMutableArray array];
                                for (EMConversation *conversation in sortedList) {
                                    [conList addObject:[conversation toJsonObject]];
                                }

                                [weakSelf onResult:result
                                    withMethodType:aChannelName
                                         withError:aError
                                        withParams:conList];
                              }];
}

- (void)removeMessagesFromServerWithMsgIds:(NSDictionary *)param
                            withMethodType:(NSString *)aChannelName
                                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *convId = param[@"convId"];
    EMConversationType type = [ExtSdkConvertHelper conversationTypeFromInt:[param[@"convType"] intValue]];
    EMConversation *conversation = [self getConversation:param];
    NSArray *msgIds = param[@"msgIds"];
    [conversation removeMessagesFromServerMessageIds:msgIds
                                          completion:^(EMError *_Nullable aError) {
                                            [weakSelf onResult:result
                                                withMethodType:aChannelName
                                                     withError:aError
                                                    withParams:nil];
                                          }];
}

- (void)removeMessagesFromServerWithTs:(NSDictionary *)param
                        withMethodType:(NSString *)aChannelName
                                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *convId = param[@"convId"];
    EMConversationType type = [ExtSdkConvertHelper conversationTypeFromInt:[param[@"convType"] intValue]];
    long timestamp = [param[@"timestamp"] longValue];
    EMConversation *conversation = [self getConversation:param];
    [conversation removeMessagesFromServerWithTimeStamp:timestamp
                                             completion:^(EMError *_Nullable aError) {
                                               [weakSelf onResult:result
                                                   withMethodType:aChannelName
                                                        withError:aError
                                                       withParams:nil];
                                             }];
}

- (void)fetchHistoryMessagesByOptions:(NSDictionary *)param
                       withMethodType:(NSString *)aChannelName
                               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *convId = param[@"convId"];
    EMConversationType type = [ExtSdkConvertHelper conversationTypeFromInt:[param[@"convType"] intValue]];
    NSString *cursor = param[@"cursor"];
    int pageSize = [param[@"pageSize"] intValue];
    EMFetchServerMessagesOption *option = [EMFetchServerMessagesOption fromJsonObject:param[@"options"]];

    [EMClient.sharedClient.chatManager
        fetchMessagesFromServerBy:convId
                 conversationType:type
                           cursor:cursor
                         pageSize:pageSize
                           option:option
                       completion:^(EMCursorResult<EMChatMessage *> *_Nullable data, EMError *_Nullable aError) {
                         [weakSelf onResult:result
                             withMethodType:aChannelName
                                  withError:aError
                                 withParams:[data toJsonObject]];
                       }];
}

- (void)getConversationsFromServerWithCursor:(NSDictionary *)param
                              withMethodType:(NSString *)aChannelName
                                      result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *cursor = param[@"cursor"];
    int pageSize = [param[@"pageSize"] intValue];
    [EMClient.sharedClient.chatManager
        getConversationsFromServerWithCursor:cursor
                                    pageSize:pageSize
                                  completion:^(EMCursorResult<EMConversation *> *_Nullable ret,
                                               EMError *_Nullable error) {
                                    [weakSelf onResult:result
                                        withMethodType:aChannelName
                                             withError:error
                                            withParams:[ret toJsonObject]];
                                  }];
}

- (void)getPinnedConversationsFromServerWithCursor:(NSDictionary *)param
                                    withMethodType:(NSString *)aChannelName
                                            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *cursor = param[@"cursor"];
    int pageSize = [param[@"pageSize"] intValue];
    [EMClient.sharedClient.chatManager
        getPinnedConversationsFromServerWithCursor:cursor
                                          pageSize:pageSize
                                        completion:^(EMCursorResult<EMConversation *> *_Nullable ret,
                                                     EMError *_Nullable error) {
                                          [weakSelf onResult:result
                                              withMethodType:aChannelName
                                                   withError:error
                                                  withParams:[ret toJsonObject]];
                                        }];
}

- (void)pinConversation:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *convId = param[@"convId"];
    BOOL isPinned = [param[@"isPinned"] boolValue];
    [EMClient.sharedClient.chatManager pinConversation:convId
                                              isPinned:isPinned
                                       completionBlock:^(EMError *_Nullable error) {
                                         [weakSelf onResult:result
                                             withMethodType:aChannelName
                                                  withError:error
                                                 withParams:nil];
                                       }];
}

- (void)modifyMessage:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *msgId = param[@"msgId"];
    EMMessageBody *body = [EMTextMessageBody fromJsonObject:param[@"body"]];
    [EMClient.sharedClient.chatManager modifyMessage:msgId
                                                body:body
                                          completion:^(EMError *_Nullable error, EMChatMessage *_Nullable message) {
                                            [weakSelf onResult:result
                                                withMethodType:aChannelName
                                                     withError:error
                                                    withParams:error != nil ? nil : [message toJsonObject]];
                                          }];
}

- (void)downloadAndParseCombineMessage:(NSDictionary *)param
                        withMethodType:(NSString *)aChannelName
                                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    EMChatMessage *msg = [EMChatMessage fromJsonObject:param[@"message"]];
    [EMClient.sharedClient.chatManager
        downloadAndParseCombineMessage:msg
                            completion:^(NSArray<EMChatMessage *> *_Nullable messages, EMError *_Nullable error) {
                              NSMutableArray *msgJsonAry = [NSMutableArray array];
                              for (EMChatMessage *msg in messages) {
                                  [msgJsonAry addObject:[msg toJsonObject]];
                              }
                              [weakSelf onResult:result
                                  withMethodType:aChannelName
                                       withError:error
                                      withParams:msgJsonAry];
                            }];
}

- (void)addRemoteAndLocalConversationsMark:(NSDictionary *)param
                            withMethodType:(NSString *)aChannelName
                                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray *conversationIds = param[@"convIds"];
    EMMarkType mark = (EMMarkType)[param[@"mark"] integerValue];
    [EMClient.sharedClient.chatManager addConversationMark:conversationIds
                                                      mark:mark
                                                completion:^(EMError *_Nullable aError) {
                                                  [weakSelf onResult:result
                                                      withMethodType:aChannelName
                                                           withError:aError
                                                          withParams:nil];
                                                }];
}

- (void)deleteRemoteAndLocalConversationsMark:(NSDictionary *)param
                               withMethodType:(NSString *)aChannelName
                                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray *conversationIds = param[@"convIds"];
    EMMarkType mark = (EMMarkType)[param[@"mark"] integerValue];
    [EMClient.sharedClient.chatManager removeConversationMark:conversationIds
                                                         mark:mark
                                                   completion:^(EMError *_Nullable aError) {
                                                     [weakSelf onResult:result
                                                         withMethodType:aChannelName
                                                              withError:aError
                                                             withParams:nil];
                                                   }];
}

- (void)fetchConversationsByOptions:(NSDictionary *)param
                     withMethodType:(NSString *)aChannelName
                             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *cursor = [EMConversationFilter getCursor:param];
    BOOL isPinned = [EMConversationFilter getPinned:param];
    BOOL isMark = [EMConversationFilter hasMark:param];
    NSInteger pageSize = [EMConversationFilter pageSize:param];
    if (isPinned) {
        [EMClient.sharedClient.chatManager
            getPinnedConversationsFromServerWithCursor:cursor
                                              pageSize:pageSize
                                            completion:^(EMCursorResult<EMConversation *> *_Nullable ret,
                                                         EMError *_Nullable error) {
                                              [weakSelf onResult:result
                                                  withMethodType:aChannelName
                                                       withError:error
                                                      withParams:[ret toJsonObject]];
                                            }];
        return;
    }

    if (isMark) {
        EMConversationFilter *filter = [EMConversationFilter fromJsonObject:param];
        [EMClient.sharedClient.chatManager
            getConversationsFromServerWithCursor:cursor
                                          filter:filter
                                      completion:^(EMCursorResult<EMConversation *> *_Nullable ret,
                                                   EMError *_Nullable error) {
                                        [weakSelf onResult:result
                                            withMethodType:aChannelName
                                                 withError:error
                                                withParams:[ret toJsonObject]];
                                      }];
        return;
    }

    [EMClient.sharedClient.chatManager
        getConversationsFromServerWithCursor:cursor
                                    pageSize:pageSize
                                  completion:^(EMCursorResult<EMConversation *> *_Nullable ret,
                                               EMError *_Nullable error) {
                                    [weakSelf onResult:result
                                        withMethodType:aChannelName
                                             withError:error
                                            withParams:[ret toJsonObject]];
                                  }];
}

- (void)deleteAllMessageAndConversation:(NSDictionary *)param
                         withMethodType:(NSString *)aChannelName
                                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    BOOL clearServerData = [param[@"clearServerData"] boolValue];
    [EMClient.sharedClient.chatManager deleteAllMessagesAndConversations:clearServerData
                                                              completion:^(EMError *_Nullable aError) {
                                                                [weakSelf onResult:result
                                                                    withMethodType:aChannelName
                                                                         withError:aError
                                                                        withParams:nil];
                                                              }];
}

- (void)pinMessage:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *msgId = param[@"msgId"];
    [EMClient.sharedClient.chatManager pinMessage:msgId
                                       completion:^(EMChatMessage *_Nullable message, EMError *_Nullable aError) {
                                         [weakSelf onResult:result
                                             withMethodType:aChannelName
                                                  withError:aError
                                                 withParams:nil];
                                       }];
}

- (void)unpinMessage:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *msgId = param[@"msgId"];
    [EMClient.sharedClient.chatManager unpinMessage:msgId
                                         completion:^(EMChatMessage *_Nullable message, EMError *_Nullable aError) {
                                           [weakSelf onResult:result
                                               withMethodType:aChannelName
                                                    withError:aError
                                                   withParams:nil];
                                         }];
}

- (void)fetchPinnedMessages:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *conversationId = param[@"convId"];
    [EMClient.sharedClient.chatManager
        getPinnedMessagesFromServer:conversationId
                         completion:^(NSArray<EMChatMessage *> *_Nullable messages, EMError *_Nullable aError) {
                           NSMutableArray *msgList = [NSMutableArray array];
                           for (EMChatMessage *msg in messages) {
                               [msgList addObject:[msg toJsonObject]];
                           }

                           [weakSelf onResult:result withMethodType:aChannelName withError:aError withParams:msgList];
                         }];
}

- (void)searchMessages:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray *typesJson = param[@"types"];
    NSMutableArray<NSNumber *> *types = [NSMutableArray array];
    for (NSString *type in typesJson) {
        [types addObject:[NSNumber numberWithInteger:[ExtSdkConvertHelper messageBodyFromString:type]]];
    }
    long long timestamp = [param[@"timestamp"] longLongValue];
    int count = [param[@"count"] intValue];
    NSString *from = param[@"from"];
    EMMessageSearchDirection direction = [ExtSdkConvertHelper searchDirectionFromString:param[@"direction"]];
    [EMClient.sharedClient.chatManager
        searchMessagesWithTypes:types
                      timestamp:timestamp
                          count:count
                       fromUser:from
                searchDirection:direction
                     completion:^(NSArray<EMChatMessage *> *_Nullable aMessages, EMError *_Nullable aError) {
                       NSMutableArray *msgs = [NSMutableArray array];
                       if (aMessages) {
                           for (EMChatMessage *msg in aMessages) {
                               [msgs addObject:[msg toJsonObject]];
                           }
                       }
                       [weakSelf onResult:result withMethodType:aChannelName withError:aError withParams:msgs];
                     }];
}

- (void)removeMessagesWithTimestamp:(NSDictionary *)param
                     withMethodType:(NSString *)aChannelName
                             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    EMConversation *conversation = [self getConversation:param];
    NSTimeInterval timestamp = [param[@"timestamp"] doubleValue];
    [conversation removeMessagesFromServerWithTimeStamp:timestamp
                                             completion:^(EMError *_Nullable aError) {
                                               [weakSelf onResult:result
                                                   withMethodType:aChannelName
                                                        withError:aError
                                                       withParams:nil];
                                             }];
}

- (void)getMessagesWithIds:(NSDictionary *)param
            withMethodType:(NSString *)aChannelName
                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray<NSString *> *msgIds = param[@"msgIds"];
    NSString *convId = param[@"convId"];
    [EMClient.sharedClient.chatManager
               getMessages:msgIds
        withConversationId:convId
                completion:^(NSArray<EMChatMessage *> *_Nullable aMessages, EMError *_Nullable aError) {
                  NSMutableArray *msgs = [NSMutableArray array];
                  if (aMessages) {
                      for (EMChatMessage *msg in aMessages) {
                          [msgs addObject:[msg toJsonObject]];
                      }
                  }
                  [weakSelf onResult:result withMethodType:aChannelName withError:aError withParams:msgs];
                }];
}

- (void)getConvsMsgsWithKeyword:(NSDictionary *)param
                 withMethodType:(NSString *)aChannelName
                         result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *keywords = param[@"keywords"];
    long long timestamp = [param[@"timestamp"] longLongValue];
    NSString *from = param[@"from"];
    EMMessageSearchDirection direction = [ExtSdkConvertHelper searchDirectionFromString:param[@"direction"]];
    EMMessageSearchScope scope = [ExtSdkConvertHelper searchScopeFromInt:[param[@"searchScope"] intValue]];
    [EMClient.sharedClient.chatManager
        loadConversationMessagesWithKeyword:keywords
                                  timestamp:timestamp
                                   fromUser:from
                            searchDirection:direction
                                      scope:scope
                                 completion:^(
                                     NSDictionary<NSString *, NSArray<NSString *> *> *_Nullable aConversationMessages,
                                     EMError *_Nullable aError) {
                                   NSMutableArray *convs = [NSMutableArray array];
                                   if (aConversationMessages) {
                                       for (NSString *convId in aConversationMessages) {
                                           [convs addObject:@{
                                               @"convId" : convId,
                                               @"msgIds" : aConversationMessages[convId]
                                           }];
                                       }
                                   }
                                   NSMutableArray *msgs = [NSMutableArray array];
                                   [weakSelf onResult:result
                                       withMethodType:aChannelName
                                            withError:aError
                                           withParams:convs];
                                 }];
}

- (void)modifyMsgBody:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *msgId = param[@"msgId"];
    EMMessageBody *body = [EMMessageBody fromJsonObject:param[@"body"]];
    NSDictionary *ext = param[@"ext"];
    [EMClient.sharedClient.chatManager modifyMessage:msgId
                                                body:body
                                                 ext:ext
                                          completion:^(EMError *_Nullable error, EMChatMessage *_Nullable message) {
                                            [weakSelf onResult:result
                                                withMethodType:aChannelName
                                                     withError:error
                                                    withParams:[message toJsonObject]];
                                          }];
}

#pragma mark - EMChatManagerDelegate

- (void)conversationListDidUpdate:(NSArray *)aConversationList {
    [self onReceive:ExtSdkMethodKeyOnConversationUpdate withParams:nil];
}

- (void)onConversationRead:(NSString *)from to:(NSString *)to {
    [self onReceive:ExtSdkMethodKeyOnConversationHasRead withParams:@{@"from" : from, @"to" : to}];
}

- (void)messagesDidReceive:(NSArray *)aMessages {
    NSMutableArray *msgList = [NSMutableArray array];
    for (EMChatMessage *msg in aMessages) {
        [msgList addObject:[msg toJsonObject]];
    }
    [self onReceive:ExtSdkMethodKeyOnMessagesReceived withParams:msgList];
}

- (void)cmdMessagesDidReceive:(NSArray *)aCmdMessages {
    NSMutableArray *cmdMsgList = [NSMutableArray array];
    for (EMChatMessage *msg in aCmdMessages) {
        [cmdMsgList addObject:[msg toJsonObject]];
    }

    [self onReceive:ExtSdkMethodKeyOnCmdMessagesReceived withParams:cmdMsgList];
}

- (void)messagesDidRead:(NSArray *)aMessages {
    NSMutableArray *list = [NSMutableArray array];
    for (EMChatMessage *msg in aMessages) {
        NSDictionary *json = [msg toJsonObject];
        [list addObject:json];
        [self onReceive:ExtSdkMethodKeyOnMessageReadAck withParams:json];
    }

    [self onReceive:ExtSdkMethodKeyOnMessagesRead withParams:list];
}

- (void)messagesDidDeliver:(NSArray *)aMessages {
    NSMutableArray *list = [NSMutableArray array];
    for (EMChatMessage *msg in aMessages) {
        NSDictionary *json = [msg toJsonObject];
        [list addObject:json];
        [self onReceive:ExtSdkMethodKeyOnMessageDeliveryAck withParams:@{@"message" : json}];
    }

    [self onReceive:ExtSdkMethodKeyOnMessagesDelivered withParams:list];
}

- (void)messagesInfoDidRecall:(NSArray<EMRecallMessageInfo *> *)aRecallMessagesInfo {
    NSMutableArray *list = [NSMutableArray array];
    for (EMRecallMessageInfo *info in aRecallMessagesInfo) {
        NSDictionary *jsonObject = [info toJsonObject];
        if (jsonObject != nil) {
            [list addObject:jsonObject];
        }
    }

    [self onReceive:ExtSdkMethodKeyOnMessagesRecalledInfo withParams:list];
}

- (void)messageStatusDidChange:(EMChatMessage *)aMessage withError:(EMError *)aError {
}

// TODO: 安卓未找到对应回调
- (void)messageAttachmentStatusDidChange:(EMChatMessage *)aMessage withError:(EMError *)aError {
}

- (void)groupMessageDidRead:(EMChatMessage *)aMessage groupAcks:(NSArray *)aGroupAcks {
    NSMutableArray *list = [NSMutableArray array];
    for (EMGroupMessageAck *ack in aGroupAcks) {
        NSDictionary *json = [ack toJsonObject];
        [list addObject:json];
    }

    [self onReceive:ExtSdkMethodKeyOnGroupMessageRead withParams:list];
}

- (void)groupMessageAckHasChanged {
    [self onReceive:ExtSdkMethodKeyChatOnReadAckForGroupMessageUpdated withParams:nil];
}

- (void)messageReactionDidChange:(NSArray<EMMessageReactionChange *> *)changes {
    NSMutableArray *list = [NSMutableArray array];
    for (EMMessageReactionChange *change in changes) {
        [list addObject:[change toJsonObject]];
    }

    [self onReceive:ExtSdkMethodKeyChatOnMessageReactionDidChange withParams:list];
}

- (void)onMessageContentChanged:(EMChatMessage *_Nonnull)message
                     operatorId:(NSString *_Nonnull)operatorId
                  operationTime:(NSUInteger)operationTime {
    NSDictionary *dict = @{
        @"message" : [message toJsonObject],
        @"lastModifyOperatorId" : operatorId,
        @"lastModifyTime" : @(operationTime)
    };
    [self onReceive:ExtSdkMethodKeyOnMessageContentChanged withParams:dict];
}

- (void)onMessagePinChanged:(NSString *_Nonnull)messageId
             conversationId:(NSString *_Nonnull)conversationId
                  operation:(EMMessagePinOperation)pinOperation
                    pinInfo:(EMMessagePinInfo *_Nonnull)pinInfo {
    NSDictionary *dict = @{
        @"messageId" : messageId,
        @"conversationId" : conversationId,
        @"pinOperation" : @(pinOperation),
        @"pinInfo" : [pinInfo toJsonObject]
    };
    [self onReceive:ExtSdkMethodKeyonMessagePinChanged withParams:dict];
}

@end
