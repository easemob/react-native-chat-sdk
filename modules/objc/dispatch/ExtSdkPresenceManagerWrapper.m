//
//  ExtSdkPresenceManagerWrapper.m
//  im_flutter_sdk
//
//  Created by 佐玉 on 2022/5/4.
//

#import "ExtSdkPresenceManagerWrapper.h"
#import "ExtSdkMethodTypeObjc.h"
#import "ExtSdkToJson.h"

@interface ExtSdkPresenceManagerWrapper () <EMPresenceManagerDelegate>

@end

@implementation ExtSdkPresenceManagerWrapper

+ (nonnull instancetype)getInstance {
    static ExtSdkPresenceManagerWrapper *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkPresenceManagerWrapper alloc] init];
    });
    return instance;
}

- (void)initSdk {
    [EMClient.sharedClient.presenceManager removeDelegate:self];
    [EMClient.sharedClient.presenceManager addDelegate:self delegateQueue:nil];
}

- (void)publishPresenceWithDescription:(NSDictionary *)param
                        withMethodType:(NSString *)aChannelName
                                result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *desc = param[@"desc"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.presenceManager
        publishPresenceWithDescription:desc
                            completion:^(EMError *error) {
                              [weakSelf onResult:result
                                  withMethodType:aChannelName
                                       withError:error
                                      withParams:nil];
                            }];
}

- (void)subscribe:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSArray *members = param[@"members"];
    NSInteger expiry = [param[@"expiry"] integerValue];

    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.presenceManager
         subscribe:members
            expiry:expiry
        completion:^(NSArray<EMPresence *> *presences, EMError *error) {
          [weakSelf onResult:result
              withMethodType:aChannelName
                   withError:error
                  withParams:[presences toJsonArray]];
        }];
}

- (void)unsubscribe:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSArray *members = param[@"members"];

    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.presenceManager unsubscribe:members
                                            completion:^(EMError *error) {
                                              [weakSelf onResult:result
                                                  withMethodType:aChannelName
                                                       withError:error
                                                      withParams:nil];
                                            }];
}

- (void)fetchSubscribedMembersWithPageNum:(NSDictionary *)param
                           withMethodType:(NSString *)aChannelName
                                   result:
                                       (nonnull id<ExtSdkCallbackObjc>)result {
    int pageNum = [param[@"pageNum"] intValue];
    int pageSize = [param[@"pageSize"] intValue];

    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.presenceManager
        fetchSubscribedMembersWithPageNum:pageNum
                                 pageSize:pageSize
                               Completion:^(NSArray<NSString *> *members,
                                            EMError *error) {
                                 [weakSelf onResult:result
                                     withMethodType:aChannelName
                                          withError:error
                                         withParams:members];
                               }];
}

- (void)fetchPresenceStatus:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSArray *members = param[@"members"];

    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient.presenceManager
        fetchPresenceStatus:members
                 completion:^(NSArray<EMPresence *> *presences,
                              EMError *error) {
                   [weakSelf onResult:result
                       withMethodType:aChannelName
                            withError:error
                           withParams:[presences toJsonArray]];
                 }];
}

#pragma mark - EMPresenceManagerDelegate

- (void)presenceStatusDidChanged:(NSArray<EMPresence *> *)presences {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"presences"] = [presences toJsonArray];
    [self onReceive:ExtSdkMethodKeyOnPresenceStatusChanged withParams:data];
}

@end
