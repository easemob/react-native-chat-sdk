//
//  ExtSdkChatThreadManagerWrapper.m
//  im_flutter_sdk
//
//  Created by asterisk on 2022/5/25.
//

#import "ExtSdkChatThreadManagerWrapper.h"
#import "ExtSdkMethodTypeObjc.h"
#import "ExtSdkToJson.h"

@interface ExtSdkChatThreadManagerWrapper () <EMThreadManagerDelegate>

@end

@implementation ExtSdkChatThreadManagerWrapper

+ (nonnull instancetype)getInstance {
    static ExtSdkChatThreadManagerWrapper *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkChatThreadManagerWrapper alloc] init];
    });
    return instance;
}

- (void)initSDK {
    [EMClient.sharedClient.threadManager removeDelegate:self];
    [EMClient.sharedClient.threadManager addDelegate:self delegateQueue:nil];
}

- (void)fetchChatThreadDetail:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *threadId = param[@"threadId"];
    [EMClient.sharedClient.threadManager
        getChatThreadFromSever:threadId
                    completion:^(EMChatThread *_Nonnull thread,
                                 EMError *_Nonnull aError) {
                      [weakSelf onResult:result
                          withMethodType:aChannelName
                               withError:aError
                              withParams:[thread toJsonObject]];
                    }];
}

- (void)fetchJoinedChatThreads:(NSDictionary *)param
                withMethodType:(NSString *)aChannelName
                        result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *cursor = param[@"cursor"];
    NSNumber *pageSize = param[@"pageSize"];
    [EMClient.sharedClient.threadManager
        getJoinedChatThreadsFromServerWithCursor:cursor
                                        pageSize:pageSize.intValue
                                      completion:^(
                                          EMCursorResult *_Nonnull aResult,
                                          EMError *_Nonnull aError) {
                                        [weakSelf onResult:result
                                            withMethodType:aChannelName
                                                 withError:aError
                                                withParams:[aResult
                                                               toJsonObject]];
                                      }];
}

- (void)fetchChatThreadsWithParentId:(NSDictionary *)param
                      withMethodType:(NSString *)aChannelName
                              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *parentId = param[@"parentId"];
    NSString *cursor = param[@"cursor"];
    NSNumber *pageSize = param[@"pageSize"];
    [EMClient.sharedClient.threadManager
        getChatThreadsFromServerWithParentId:parentId
                                      cursor:cursor
                                    pageSize:pageSize.intValue
                                  completion:^(EMCursorResult *_Nonnull aResult,
                                               EMError *_Nonnull aError) {
                                    [weakSelf onResult:result
                                        withMethodType:aChannelName
                                             withError:aError
                                            withParams:[aResult toJsonObject]];
                                  }];
}

- (void)fetchJoinedChatThreadsWithParentId:(NSDictionary *)param
                            withMethodType:(NSString *)aChannelName
                                    result:
                                        (nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *parentId = param[@"parentId"];
    NSString *cursor = param[@"cursor"];
    NSNumber *pageSize = param[@"pageSize"];
    [EMClient.sharedClient.threadManager
        getJoinedChatThreadsFromServerWithParentId:parentId
                                            cursor:cursor
                                          pageSize:pageSize.intValue
                                        completion:^(
                                            EMCursorResult *_Nonnull aResult,
                                            EMError *_Nonnull aError) {
                                          [weakSelf onResult:result
                                              withMethodType:aChannelName
                                                   withError:aError
                                                  withParams:[aResult
                                                                 toJsonObject]];
                                        }];
}

- (void)fetchChatThreadMember:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *threadId = param[@"threadId"];
    NSString *cursor = param[@"cursor"];
    NSNumber *pageSize = param[@"pageSize"];
    [EMClient.sharedClient.threadManager
        getChatThreadMemberListFromServerWithId:threadId
                                         cursor:cursor
                                       pageSize:pageSize.intValue
                                     completion:^(
                                         EMCursorResult *_Nonnull aResult,
                                         EMError *_Nonnull aError) {
                                       [weakSelf onResult:result
                                           withMethodType:aChannelName
                                                withError:aError
                                               withParams:[aResult
                                                              toJsonObject]];
                                     }];
}

- (void)fetchLastMessageWithChatThreads:(NSDictionary *)param
                         withMethodType:(NSString *)aChannelName
                                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray *ids = param[@"threadIds"];
    [EMClient.sharedClient.threadManager
        getLastMessageFromSeverWithChatThreads:ids
                                    completion:^(NSDictionary<NSString *,
                                                              EMChatMessage *>
                                                     *_Nonnull messageMap,
                                                 EMError *_Nonnull aError) {
                                      NSMutableDictionary *ret =
                                          [NSMutableDictionary
                                              dictionaryWithCapacity:0];
                                      for (NSString *key in messageMap
                                               .allKeys) {
                                          EMChatMessage *msg = messageMap[key];
                                          [ret setValue:[msg toJsonObject]
                                                 forKey:key];
                                      }
                                      [weakSelf onResult:result
                                          withMethodType:aChannelName
                                               withError:aError
                                              withParams:ret];
                                    }];
}

- (void)removeMemberFromChatThread:(NSDictionary *)param
                    withMethodType:(NSString *)aChannelName
                            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *threadId = param[@"threadId"];
    NSString *memberId = param[@"memberId"];
    [EMClient.sharedClient.threadManager
        removeMemberFromChatThread:threadId
                          threadId:memberId
                        completion:^(EMError *_Nonnull aError) {
                          [weakSelf onResult:result
                              withMethodType:aChannelName
                                   withError:aError
                                  withParams:nil];
                        }];
}

- (void)updateChatThreadSubject:(NSDictionary *)param
                 withMethodType:(NSString *)aChannelName
                         result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *threadId = param[@"threadId"];
    NSString *name = param[@"name"];
    [EMClient.sharedClient.threadManager
        updateChatThreadName:name
                    threadId:threadId
                  completion:^(EMError *_Nonnull aError) {
                    [weakSelf onResult:result
                        withMethodType:aChannelName
                             withError:aError
                            withParams:nil];
                  }];
}

- (void)createChatThread:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *name = param[@"name"];
    NSString *messageId = param[@"messageId"];
    NSString *parentId = param[@"parentId"];
    [EMClient.sharedClient.threadManager
        createChatThread:name
               messageId:messageId
                parentId:parentId
              completion:^(EMChatThread *_Nonnull thread,
                           EMError *_Nonnull aError) {
                [weakSelf onResult:result
                    withMethodType:aChannelName
                         withError:aError
                        withParams:[thread toJsonObject]];
              }];
}

- (void)joinChatThread:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *threadId = param[@"threadId"];
    [EMClient.sharedClient.threadManager
        joinChatThread:threadId
            completion:^(EMChatThread *_Nonnull thread,
                         EMError *_Nonnull aError) {
              [weakSelf onResult:result
                  withMethodType:aChannelName
                       withError:aError
                      withParams:[thread toJsonObject]];
            }];
}

- (void)leaveChatThread:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *threadId = param[@"threadId"];
    [EMClient.sharedClient.threadManager
        leaveChatThread:threadId
             completion:^(EMError *_Nonnull aError) {
               [weakSelf onResult:result
                   withMethodType:aChannelName
                        withError:aError
                       withParams:nil];
             }];
}

- (void)destroyChatThread:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *threadId = param[@"threadId"];
    [EMClient.sharedClient.threadManager
        destroyChatThread:threadId
               completion:^(EMError *_Nonnull aError) {
                 [weakSelf onResult:result
                     withMethodType:aChannelName
                          withError:aError
                         withParams:nil];
               }];
}

- (void)getChatThread:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *msgId = param[@"msgId"];
    EMChatMessage *msg =
        [EMClient.sharedClient.chatManager getMessageWithMessageId:msgId];
    if ([self getMessageParams:result
                withMethodType:aChannelName
                   withMessage:msg]) {
        return;
    }
    [self onResult:result
        withMethodType:aChannelName
             withError:nil
            withParams:msg.chatThread != nil ? [msg.chatThread toJsonObject]
                                             : nil];
}

- (void)getThreadConversation:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *conId = param[@"convId"];
    BOOL needCreate = [param[@"createIfNeed"] boolValue];
    EMConversation *conv;
    if (!param[@"isChatThread"]) {
        NSMutableDictionary *newParam =
            [[NSMutableDictionary alloc] initWithDictionary:param];
        newParam[@"isChatThread"] = @(YES);
        EMConversation *conv = [self getConversation:newParam];

    } else {
        EMConversation *conv = [self getConversation:param];
    }
    if (conv) {
        [weakSelf onResult:result
            withMethodType:aChannelName
                 withError:nil
                withParams:[conv toJsonObject]];
    } else {
        EMError *aError = [EMError errorWithDescription:@"no have conversation"
                                                   code:1];
        [weakSelf onResult:result
            withMethodType:aChannelName
                 withError:aError
                withParams:nil];
    }
}

#pragma mark - EMThreadManagerDelegate

- (void)onChatThreadCreate:(EMChatThreadEvent *)event {
    [self onReceive:ExtSdkMethodKeyChatOnChatThreadCreated
         withParams:[event toJsonObject]];
}

- (void)onChatThreadUpdate:(EMChatThreadEvent *)event {
    [self onReceive:ExtSdkMethodKeyChatOnChatThreadUpdated
         withParams:[event toJsonObject]];
}

- (void)onChatThreadDestroy:(EMChatThreadEvent *)event {
    [self onReceive:ExtSdkMethodKeyChatOnChatThreadDestroyed
         withParams:[event toJsonObject]];
}

- (void)onUserKickOutOfChatThread:(EMChatThreadEvent *)event {
    [self onReceive:ExtSdkMethodKeyChatOnChatThreadUserRemoved
         withParams:[event toJsonObject]];
}

@end
