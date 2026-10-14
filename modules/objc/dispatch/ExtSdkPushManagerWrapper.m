//
//  ExtSdkPushManagerWrapper.m
//  im_flutter_sdk
//
//  Created by 东海 on 2020/5/7.
//

#import "ExtSdkPushManagerWrapper.h"
#import "ExtSdkMethodTypeObjc.h"
#import "ExtSdkToJson.h"

@implementation ExtSdkPushManagerWrapper

+ (nonnull instancetype)getInstance {
    static ExtSdkPushManagerWrapper *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkPushManagerWrapper alloc] init];
    });
    return instance;
}

- (void)initSDK {
}

- (void)getImPushConfigFromServer:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.pushManager
        getPushNotificationOptionsFromServerWithCompletion:^(
            EMPushOptions *aOptions, EMError *aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:[aOptions toJsonObject]];
        }];
}

- (void)updatePushNickname:(NSDictionary *)param
            withMethodType:(NSString *)aChannelName
                    result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *nickname = param[@"nickname"];
    [EMClient.sharedClient.pushManager
        updatePushDisplayName:nickname
                   completion:^(NSString *_Nonnull aDisplayName,
                                EMError *_Nonnull aError) {
                     [weakSelf onResult:result
                         withMethodType:aChannelName
                              withError:aError
                             withParams:aDisplayName];
                   }];
}

- (void)updateImPushStyle:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;

    EMPushDisplayStyle pushStyle = [param[@"pushStyle"] intValue];

    [EMClient.sharedClient.pushManager
        updatePushDisplayStyle:pushStyle
                    completion:^(EMError *_Nullable aError) {
                      [weakSelf onResult:result
                          withMethodType:aChannelName
                               withError:aError
                              withParams:@(!aError)];
                    }];
}

- (void)setConversationSilentMode:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *conversaionId = param[@"conversationId"];
    EMConversationType type =
        [ExtSdkConvertHelper conversationTypeFromInt:[param[@"conversationType"] intValue]];
    EMSilentModeParam *silmentParam =
        [EMSilentModeParam fromJsonObject:param[@"param"]];
    [EMClient.sharedClient.pushManager
        setSilentModeForConversation:conversaionId
                    conversationType:type
                              params:silmentParam
                          completion:^(EMSilentModeResult *_Nullable aResult,
                                       EMError *_Nullable aError) {
                            [weakSelf onResult:result
                                withMethodType:aChannelName
                                     withError:aError
                                    withParams:nil];
                          }];
}

- (void)removeConversationSilentMode:(NSDictionary *)param
                      withMethodType:(NSString *)aChannelName
                              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *conversaionId = param[@"conversationId"];
    EMConversationType type =
        [ExtSdkConvertHelper conversationTypeFromInt:[param[@"conversationType"] intValue]];
    [EMClient.sharedClient.pushManager
        clearRemindTypeForConversation:conversaionId
                      conversationType:type
                            completion:^(EMSilentModeResult *_Nullable aResult,
                                         EMError *_Nullable aError) {
                              [weakSelf onResult:result
                                  withMethodType:aChannelName
                                       withError:aError
                                      withParams:nil];
                            }];
}

- (void)fetchConversationSilentMode:(NSDictionary *)param
                     withMethodType:(NSString *)aChannelName
                             result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *conversaionId = param[@"conversationId"];
    EMConversationType type =
        [ExtSdkConvertHelper conversationTypeFromInt:[param[@"conversationType"] intValue]];
    [EMClient.sharedClient.pushManager
        getSilentModeForConversation:conversaionId
                    conversationType:type
                          completion:^(EMSilentModeResult *_Nullable aResult,
                                       EMError *_Nullable aError) {
                            [weakSelf onResult:result
                                withMethodType:aChannelName
                                     withError:aError
                                    withParams:[aResult toJsonObject]];
                          }];
}

- (void)setSilentModeForAll:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    EMSilentModeParam *silmentParam =
        [EMSilentModeParam fromJsonObject:param[@"param"]];
    [EMClient.sharedClient.pushManager
        setSilentModeForAll:silmentParam
                 completion:^(EMSilentModeResult *_Nullable aResult,
                              EMError *_Nullable aError) {
                   [weakSelf onResult:result
                       withMethodType:aChannelName
                            withError:aError
                           withParams:nil];
                 }];
}

- (void)fetchSilentModeForAll:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.pushManager
        getSilentModeForAllWithCompletion:^(
            EMSilentModeResult *_Nullable aResult, EMError *_Nullable aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:[aResult toJsonObject]];
        }];
}

- (void)fetchSilentModeForConversations:(NSDictionary *)param
                         withMethodType:(NSString *)aChannelName
                                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSMutableArray *conversations = [NSMutableArray array];
    NSArray *convs = param[@"convs"];
    for (int i = 0; i < convs.count; ++i) {
        EMConversation *conversation =
            [self getConversation:[convs objectAtIndex:i]];
        [conversations addObject:conversation];
    }
    [EMClient.sharedClient.pushManager
        getSilentModeForConversations:conversations
                           completion:^(
                               NSDictionary<NSString *, EMSilentModeResult *>
                                   *_Nullable aResult,
                               EMError *_Nullable aError) {
                             NSMutableDictionary *tmpDict =
                                 [NSMutableDictionary dictionary];
                             for (NSString *conversationId in aResult.allKeys) {
                                 tmpDict[conversationId] =
                                     [aResult[conversationId] toJsonObject];
                             }
                             [weakSelf onResult:result
                                 withMethodType:aChannelName
                                      withError:aError
                                     withParams:tmpDict];
                           }];
}

- (void)setPreferredNotificationLanguage:(NSDictionary *)param
                          withMethodType:(NSString *)aChannelName
                                  result:
                                      (nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *code = param[@"code"];
    [EMClient.sharedClient.pushManager
        setPreferredNotificationLanguage:code
                              completion:^(EMError *_Nullable aError) {
                                [weakSelf onResult:result
                                    withMethodType:aChannelName
                                         withError:aError
                                        withParams:nil];
                              }];
}

- (void)fetchPreferredNotificationLanguage:(NSDictionary *)param
                            withMethodType:(NSString *)aChannelName
                                    result:
                                        (nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.pushManager
        getPreferredNotificationLanguageCompletion:^(
            NSString *_Nullable aLaguangeCode, EMError *_Nullable aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:aLaguangeCode];
        }];
}

- (void)setPushTemplate:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *pushTemplateName = param[@"templateName"];
    [EMClient.sharedClient.pushManager
        setPushTemplate:pushTemplateName
             completion:^(EMError *_Nullable aError) {
               [weakSelf onResult:result
                   withMethodType:aChannelName
                        withError:aError
                       withParams:nil];
             }];
}

- (void)getPushTemplate:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.pushManager
        getPushTemplate:^(NSString *_Nullable aPushTemplateName,
                          EMError *_Nullable aError) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:aError
                  withParams:@{@"templateName" : aPushTemplateName}];
        }];
}

@end
