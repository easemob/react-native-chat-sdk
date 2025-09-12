//
//  ExtSdkClientWrapper.m
//
//
//  Created by 杜洁鹏 on 2019/10/8.
//

#import "ExtSdkClientWrapper.h"
#import "ExtSdkChatManagerWrapper.h"
#import "ExtSdkChatThreadManagerWrapper.h"
#import "ExtSdkChatroomManagerWrapper.h"
#import "ExtSdkContactManagerWrapper.h"
#import "ExtSdkConversationWrapper.h"
#import "ExtSdkGroupManagerWrapper.h"
#import "ExtSdkMethodTypeObjc.h"
#import "ExtSdkPresenceManagerWrapper.h"
#import "ExtSdkPushManagerWrapper.h"
#import "ExtSdkThreadUtilObjc.h"
#import "ExtSdkToJson.h"
#import "ExtSdkUserInfoManagerWrapper.h"
#import <UserNotifications/UserNotifications.h>

@interface ExtSdkClientWrapper () <EMClientDelegate, EMMultiDevicesDelegate>
@end

@implementation ExtSdkClientWrapper

+ (nonnull instancetype)getInstance {
    static ExtSdkClientWrapper *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkClientWrapper alloc] init];
    });
    return instance;
}

#pragma mark - Actions

- (void)initSDKWithDict:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result {

    EMOptions *options = [EMOptions fromJsonObject:param];
    if (nil == options) {
        EMError *e = [EMError errorWithDescription:@"params parse error."
                                              code:1];
        [self onResult:result
            withMethodType:ExtSdkMethodKeyInit
                 withError:e
                withParams:nil];
        return;
    }
    options.enableConsoleLog = options.enableConsoleLog;
    [EMClient.sharedClient initializeSDKWithOptions:options];
    [EMClient.sharedClient removeDelegate:self];
    [EMClient.sharedClient addDelegate:self delegateQueue:nil];
    [EMClient.sharedClient removeMultiDevicesDelegate:self];
    [EMClient.sharedClient addMultiDevicesDelegate:self delegateQueue:nil];

    [ExtSdkChatManagerWrapper.getInstance initSdk];
    [ExtSdkChatroomManagerWrapper.getInstance initSDK];
    [ExtSdkContactManagerWrapper.getInstance initSdk];
    [ExtSdkGroupManagerWrapper.getInstance initSdk];
    [ExtSdkPresenceManagerWrapper.getInstance initSdk];
    [ExtSdkChatThreadManagerWrapper.getInstance initSDK];
    [ExtSdkPushManagerWrapper.getInstance initSDK];

    [self onResult:result
        withMethodType:ExtSdkMethodKeyInit
             withError:nil
            withParams:nil];
}

- (void)getToken:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    [self onResult:result
        withMethodType:ExtSdkMethodKeyGetToken
             withError:nil
            withParams:EMClient.sharedClient.accessUserToken];
}

- (void)createAccount:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *password = param[@"password"];
    [EMClient.sharedClient
        registerWithUsername:username
                    password:password
                  completion:^(NSString *aUsername, EMError *aError) {
                    [weakSelf onResult:result
                        withMethodType:ExtSdkMethodKeyCreateAccount
                             withError:aError
                            withParams:aUsername];
                  }];
}

- (void)login:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *pwdOrToken = param[@"pwdOrToken"];
    BOOL isPwd = [param[@"isPassword"] boolValue];

    if (isPwd) {
        [EMClient.sharedClient
            loginWithUsername:username
                     password:pwdOrToken
                   completion:^(NSString *aUsername, EMError *aError) {
                     [weakSelf onResult:result
                         withMethodType:ExtSdkMethodKeyLogin
                              withError:aError
                             withParams:@{
                                 @"username" : aUsername,
                                 @"token" :
                                     EMClient.sharedClient.accessUserToken
                             }];
                   }];
    } else {
        [EMClient.sharedClient
            loginWithUsername:username
                        token:pwdOrToken
                   completion:^(NSString *aUsername, EMError *aError) {
                     [weakSelf onResult:result
                         withMethodType:ExtSdkMethodKeyLogin
                              withError:aError
                             withParams:@{
                                 @"username" : aUsername,
                                 @"token" :
                                     EMClient.sharedClient.accessUserToken
                             }];
                   }];
    }
}

- (void)logout:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    BOOL unbindToken = [param[@"unbindToken"] boolValue];
    if (YES == unbindToken &&
        nil == EMClient.sharedClient.options.apnsCertName) {
        unbindToken = NO;
    }
    [EMClient.sharedClient logout:unbindToken
                       completion:^(EMError *aError) {
                         [weakSelf onResult:result
                             withMethodType:ExtSdkMethodKeyLogout
                                  withError:aError
                                 withParams:@(!aError)];
                       }];
}

- (void)changeAppKey:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *appKey = param[@"appKey"];
    EMError *aError = [EMClient.sharedClient changeAppkey:appKey];
    [self onResult:result
        withMethodType:ExtSdkMethodKeyChangeAppKey
             withError:aError
            withParams:@(!aError)];
}

- (void)getCurrentUser:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *username = EMClient.sharedClient.currentUsername;
    [self onResult:result
        withMethodType:ExtSdkMethodKeyGetCurrentUser
             withError:nil
            withParams:username];
}

- (void)uploadLog:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient
        uploadDebugLogToServerWithCompletion:^(EMError *aError) {
          [weakSelf onResult:result
              withMethodType:ExtSdkMethodKeyUploadLog
                   withError:aError
                  withParams:nil];
        }];
}

- (void)compressLogs:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient
        getLogFilesPathWithCompletion:^(NSString *aPath, EMError *aError) {
          [weakSelf onResult:result
              withMethodType:ExtSdkMethodKeyCompressLogs
                   withError:aError
                  withParams:aPath];
        }];
}

- (void)kickDevice:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *password = param[@"password"];
    NSString *resource = param[@"resource"];
    Boolean isPassword = [param[@"isPassword"] boolValue];

    if (isPassword) {
        [EMClient.sharedClient
            kickDeviceWithUsername:username
                          password:password
                          resource:resource
                        completion:^(EMError *aError) {
                          [weakSelf onResult:result
                              withMethodType:ExtSdkMethodKeyKickDevice
                                   withError:aError
                                  withParams:nil];
                        }];
    } else {
        [EMClient.sharedClient
            kickDeviceWithUserId:username
                           token:password
                        resource:resource
                      completion:^(EMError *_Nullable aError) {
                        [weakSelf onResult:result
                            withMethodType:aChannelName
                                 withError:aError
                                withParams:nil];
                      }];
    }
}

- (void)kickAllDevices:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *password = param[@"password"];
    Boolean isPassword = [param[@"isPassword"] boolValue];

    if (isPassword) {
        [EMClient.sharedClient
            kickAllDevicesWithUsername:username
                              password:password
                            completion:^(EMError *aError) {
                              [weakSelf onResult:result
                                  withMethodType:ExtSdkMethodKeyKickAllDevices
                                       withError:aError
                                      withParams:nil];
                            }];
    } else {
        [EMClient.sharedClient
            kickAllDevicesWithUserId:username
                               token:password
                          completion:^(EMError *_Nullable aError) {
                            [weakSelf onResult:result
                                withMethodType:aChannelName
                                     withError:aError
                                    withParams:nil];
                          }];
    }
}

- (void)isLoggedInBefore:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result {
    [self onResult:result
        withMethodType:ExtSdkMethodKeyIsLoggedInBefore
             withError:nil
            withParams:@(EMClient.sharedClient.isLoggedIn)];
}

- (void)getLoggedInDevicesFromServer:(NSDictionary *)param
                      withMethodType:(NSString *)aChannelName
                              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *password = param[@"password"];
    Boolean isPassword = [param[@"isPassword"] boolValue];

    if (isPassword) {
        [EMClient.sharedClient
            getLoggedInDevicesFromServerWithUsername:username
                                            password:password
                                          completion:^(NSArray *aList,
                                                       EMError *aError) {
                                            NSMutableArray *list =
                                                [NSMutableArray array];
                                            for (EMDeviceConfig
                                                     *deviceInfo in aList) {
                                                [list addObject:
                                                          [deviceInfo
                                                              toJsonObject]];
                                            }

                                            [weakSelf onResult:result
                                                withMethodType:
                                                    ExtSdkMethodKeyGetLoggedInDevicesFromServer
                                                     withError:aError
                                                    withParams:aError ? nil
                                                                      : list];
                                          }];
    } else {
        [EMClient.sharedClient
            getLoggedInDevicesFromServerWithUserId:username
                                             token:password
                                        completion:^(
                                            NSArray<EMDeviceConfig *>
                                                *_Nullable aList,
                                            EMError *_Nullable aError) {
                                          NSMutableArray *list =
                                              [NSMutableArray array];
                                          for (EMDeviceConfig
                                                   *deviceInfo in aList) {
                                              [list
                                                  addObject:[deviceInfo
                                                                toJsonObject]];
                                          }
                                          [weakSelf onResult:result
                                              withMethodType:aChannelName
                                                   withError:aError
                                                  withParams:aError ? nil
                                                                    : list];
                                        }];
    }
}

- (void)loginWithAgoraToken:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *agoraToken = param[@"agoratoken"];
    [EMClient.sharedClient
        loginWithUsername:username
               agoraToken:agoraToken
               completion:^(NSString *aUsername, EMError *aError) {
                 [weakSelf onResult:result
                     withMethodType:ExtSdkMethodKeyLoginWithAgoraToken
                          withError:aError
                         withParams:@{
                             @"username" : aUsername,
                             @"token" : EMClient.sharedClient.accessUserToken
                         }];
               }];
}

- (void)isConnected:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    [self onResult:result
        withMethodType:ExtSdkMethodKeyIsConnected
             withError:nil
            withParams:@(EMClient.sharedClient.isConnected)];
}

- (void)renewToken:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *newAgoraToken = param[@"agora_token"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient renewToken:newAgoraToken
                           completion:^(EMError *_Nullable aError) {
                             [weakSelf onResult:result
                                 withMethodType:ExtSdkMethodKeyRenewToken
                                      withError:aError
                                     withParams:nil];
                           }];
}

- (void)updatePushConfig:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSDictionary *dict = param[@"config"];
    NSString *deviceToken = dict[@"deviceToken"];
    NSData *deviceTokenData =
        [deviceToken dataUsingEncoding:NSUTF8StringEncoding];
    //    EMError* error = [EMClient.sharedClient bindDeviceToken:[deviceToken
    //    dataUsingEncoding:NSUTF8StringEncoding]]; [self onResult:result
    //    withMethodType:aChannelName withError:error withParams:nil];

    //    [EMClient.sharedClient asyncBindDeviceToken:[deviceToken
    //    dataUsingEncoding:NSUTF8StringEncoding]] success:^{
    //        [self onResult:result withMethodType:aChannelName withError:nil
    //        withParams:nil];
    //    } failure:^(EMError *aError) {
    //        [self onResult:result withMethodType:aChannelName withError:aError
    //        withParams:nil];
    //    }];

    // must be NSString* type for deviceToken
    [EMClient.sharedClient
        registerForRemoteNotificationsWithDeviceToken:deviceToken
                                           completion:^(
                                               EMError *_Nullable aError) {
                                             [self onResult:result
                                                 withMethodType:aChannelName
                                                      withError:aError
                                                     withParams:nil];
                                           }];
}

- (void)activeNumbersReachLimitation {
    [self onReceive:ExtSdkMethodKeyOnAppActiveNumberReachLimit withParams:nil];
}

#pragma - mark EMClientDelegate

- (void)connectionStateDidChange:(EMConnectionState)aConnectionState {
    BOOL isConnected = aConnectionState == EMConnectionConnected;
    if (isConnected) {
        [self onReceive:ExtSdkMethodKeyOnConnected withParams:nil];
    } else {
        [self onReceive:ExtSdkMethodKeyOnDisconnected withParams:nil];
    }
}

- (void)autoLoginDidCompleteWithError:(EMError *)aError {
    if (aError.code == EMErrorServerServingForbidden) {
        [self userDidForbidByServer];
    } else if (aError.code == EMErrorAppActiveNumbersReachLimitation) {
        [self activeNumbersReachLimitation];
    }
}

- (void)tokenWillExpire:(EMErrorCode)aErrorCode {
    [self onReceive:ExtSdkMethodKeyOnTokenWillExpire withParams:nil];
}

- (void)tokenDidExpire:(EMErrorCode)aErrorCode {
    [self onReceive:ExtSdkMethodKeyOnTokenDidExpire withParams:nil];
}

- (void)userAccountDidLoginFromOtherDevice:(NSString *_Nullable)aDeviceName {
    [self onReceive:ExtSdkMethodKeyOnUserDidLoginFromOtherDevice
         withParams:@{@"deviceName" : aDeviceName}];
}

- (void)userAccountDidRemoveFromServer {
    [self onReceive:ExtSdkMethodKeyOnUserDidRemoveFromServer withParams:nil];
}

- (void)userDidForbidByServer {
    [self onReceive:ExtSdkMethodKeyOnUserDidForbidByServer withParams:nil];
}

- (void)userAccountDidForcedToLogout:(EMError *)aError {
    if (aError.code == EMErrorUserKickedByChangePassword) {
        [self onReceive:ExtSdkMethodKeyOnUserDidChangePassword withParams:nil];
    } else if (aError.code == EMErrorUserLoginTooManyDevices) {
        [self onReceive:ExtSdkMethodKeyOnUserDidLoginTooManyDevice
             withParams:nil];
    } else if (aError.code == EMErrorUserKickedByOtherDevice) {
        [self onReceive:ExtSdkMethodKeyOnUserKickedByOtherDevice
             withParams:nil];
    } else if (aError.code == EMErrorUserAuthenticationFailed) {
        [self onReceive:ExtSdkMethodKeyOnUserAuthenticationFailed
             withParams:nil];
    }
}

#pragma mark - EMMultiDevicesDelegate

- (void)multiDevicesContactEventDidReceive:(EMMultiDevicesEvent)aEvent
                                  username:(NSString *)aUsername
                                       ext:(NSString *)aExt {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"event"] = @(aEvent);
    data[@"target"] = aUsername;
    data[@"ext"] = aExt;
    data[@"type"] = ExtSdkMethodKeyOnMultiDeviceEventContact;
    [self onReceive:ExtSdkMethodKeyOnMultiDeviceEvent withParams:data];
}

- (void)multiDevicesGroupEventDidReceive:(EMMultiDevicesEvent)aEvent
                                 groupId:(NSString *)aGroupId
                                     ext:(id)aExt {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"event"] = @(aEvent);
    data[@"target"] = aGroupId;
    data[@"ext"] = aExt;
    data[@"type"] = ExtSdkMethodKeyOnMultiDeviceEventGroup;
    [self onReceive:ExtSdkMethodKeyOnMultiDeviceEvent withParams:data];
}

- (void)multiDevicesThreadEventDidReceive:(EMMultiDevicesEvent)aEvent
                                 threadId:(NSString *)aThreadId
                                      ext:(id)aExt {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"event"] = @(aEvent);
    data[@"target"] = aThreadId;
    data[@"ext"] = aExt;
    data[@"type"] = ExtSdkMethodKeyOnMultiDeviceEventThread;
    [self onReceive:ExtSdkMethodKeyOnMultiDeviceEvent withParams:data];
}

- (void)multiDevicesMessageBeRemoved:(NSString *_Nonnull)conversationId
                            deviceId:(NSString *_Nonnull)deviceId;
{
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"convId"] = conversationId;
    data[@"deviceId"] = deviceId;
    data[@"type"] = ExtSdkMethodKeyOnMultiDeviceEventRemoveMessage;
    [self onReceive:ExtSdkMethodKeyOnMultiDeviceEvent withParams:data];
}

- (void)multiDevicesConversationEvent:(EMMultiDevicesEvent)event
                       conversationId:(NSString *_Nonnull)conversationId
                     conversationType:(EMConversationType)conversationType {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"event"] = @(event);
    data[@"convId"] = conversationId;
    data[@"convType"] = @(conversationType);
    data[@"type"] = ExtSdkMethodKeyOnMultiDeviceEventConversation;
    [self onReceive:ExtSdkMethodKeyOnMultiDeviceEvent withParams:data];
}

@end
