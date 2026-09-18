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
    options.platform = EMSDKPlatformReactNative;
    if (nil == options) {
        EMError *e = [EMError errorWithDescription:@"params parse error." code:1];
        [self onResult:result withMethodType:ExtSdkMethodKeyInit withError:e withParams:nil];
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
    [ExtSdkUserInfoManagerWrapper.getInstance initSdk];
    [ExtSdkPresenceManagerWrapper.getInstance initSdk];
    [ExtSdkChatThreadManagerWrapper.getInstance initSDK];
    [ExtSdkPushManagerWrapper.getInstance initSDK];

    [self onResult:result withMethodType:ExtSdkMethodKeyInit withError:nil withParams:nil];
}

- (void)getToken:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    [self onResult:result
        withMethodType:ExtSdkMethodKeyGetToken
             withError:nil
            withParams:EMClient.sharedClient.accessUserToken];
}

- (void)login:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *token = param[@"pwdOrToken"];

    [EMClient.sharedClient
        loginWithUsername:username
                    token:token
               completion:^(NSString *aUsername, EMError *aError) {
                 [weakSelf onResult:result
                     withMethodType:ExtSdkMethodKeyLogin
                          withError:aError
                         withParams:@{@"username" : aUsername, @"token" : EMClient.sharedClient.accessUserToken}];
               }];
}

- (void)logout:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    BOOL unbindToken = [param[@"unbindToken"] boolValue];
    if (YES == unbindToken && nil == EMClient.sharedClient.options.apnsCertName) {
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
    [self onResult:result withMethodType:ExtSdkMethodKeyChangeAppKey withError:aError withParams:@(!aError)];
}

- (void)changeAppId:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *appId = param[@"appId"];
    EMError *aError = [EMClient.sharedClient changeAppId:appId];
    [self onResult:result withMethodType:aChannelName withError:aError withParams:@(!aError)];
}

- (void)getCurrentUser:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *username = EMClient.sharedClient.currentUsername;
    [self onResult:result withMethodType:ExtSdkMethodKeyGetCurrentUser withError:nil withParams:username];
}

- (void)uploadLog:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient uploadDebugLogToServerWithCompletion:^(EMError *aError) {
      [weakSelf onResult:result withMethodType:ExtSdkMethodKeyUploadLog withError:aError withParams:nil];
    }];
}

- (void)compressLogs:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient getLogFilesPathWithCompletion:^(NSString *aPath, EMError *aError) {
      [weakSelf onResult:result withMethodType:ExtSdkMethodKeyCompressLogs withError:aError withParams:aPath];
    }];
}

- (void)kickDevice:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *token = param[@"token"];
    NSString *resource = param[@"resource"];

    [EMClient.sharedClient kickDeviceWithUserId:username
                                          token:token
                                       resource:resource
                                     completion:^(EMError *_Nullable aError) {
                                       [weakSelf onResult:result
                                           withMethodType:aChannelName
                                                withError:aError
                                               withParams:nil];
                                     }];
}

- (void)kickAllDevices:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *token = param[@"token"];

    [EMClient.sharedClient kickAllDevicesWithUserId:username
                                              token:token
                                         completion:^(EMError *_Nullable aError) {
                                           [weakSelf onResult:result
                                               withMethodType:aChannelName
                                                    withError:aError
                                                   withParams:nil];
                                         }];
}

- (void)getLoggedInDevicesFromServer:(NSDictionary *)param
                      withMethodType:(NSString *)aChannelName
                              result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSString *username = param[@"username"];
    NSString *token = param[@"token"];

    [EMClient.sharedClient getLoggedInDevicesFromServerWithUserId:username
                                                            token:token
                                                       completion:^(NSArray<EMDeviceConfig *> *_Nullable aList,
                                                                    EMError *_Nullable aError) {
                                                         NSMutableArray *list = [NSMutableArray array];
                                                         for (EMDeviceConfig *deviceInfo in aList) {
                                                             [list addObject:[deviceInfo toJsonObject]];
                                                         }
                                                         [weakSelf onResult:result
                                                             withMethodType:aChannelName
                                                                  withError:aError
                                                                 withParams:aError ? nil : list];
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
    NSString *token = param[@"token"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient renewToken:token
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
    NSString *deviceId = dict[@"deviceId"];
    NSString *deviceToken = dict[@"deviceToken"];
    //    NSData *deviceTokenData =
    //        [deviceToken dataUsingEncoding:NSUTF8StringEncoding];

    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient registerForRemoteNotificationsWithCertName:deviceId
                                                          deviceToken:deviceToken
                                                           completion:^(EMError *_Nullable aError) {
                                                             [weakSelf onResult:result
                                                                 withMethodType:aChannelName
                                                                      withError:aError
                                                                     withParams:nil];
                                                           }];
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
    //    [EMClient.sharedClient
    //        registerForRemoteNotificationsWithDeviceToken:deviceToken
    //                                           completion:^(
    //                                               EMError *_Nullable aError)
    //                                               {
    //                                             [self onResult:result
    //                                                 withMethodType:aChannelName
    //                                                      withError:aError
    //                                                     withParams:nil];
    //                                           }];
}

- (void)getRTCTokenInfoWithChannelName:(NSDictionary *)param
                        withMethodType:(NSString *)aChannelName
                                result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSString *channelName = param[@"channelName"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient getRTCTokenWithChannel:channelName
                                       completion:^(NSUInteger rtcUId, NSString *_Nullable aToken, NSInteger expiredTs,
                                                    EMError *_Nullable aError) {
      if (aToken != nil) {
        [weakSelf onResult:result
            withMethodType:aChannelName
                 withError:aError
                withParams:@{
                    @"rtcToken" : aToken,
                    @"expireTimeStamp" : @(expiredTs),
                    @"uid" : @(rtcUId)
                }];
      } else {
        [weakSelf onResult:result
            withMethodType:aChannelName
                 withError:aError
                withParams:nil];
      }

                                       }];
}

- (void)getUserIdsWithRTCUids:(NSDictionary *)param
               withMethodType:(NSString *)aChannelName
                       result:(nonnull id<ExtSdkCallbackObjc>)result {
    NSArray<NSNumber *> *ids = param[@"rtcUids"];
    __weak typeof(self) weakSelf = self;
    [EMClient.sharedClient
        getUserIdByRTCUIds:ids
                completion:^(NSDictionary<NSNumber *, NSString *> *_Nullable accountInfos, EMError *_Nullable aError) {
                  [weakSelf onResult:result withMethodType:aChannelName withError:aError withParams:accountInfos];
                }];
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

- (void)tokenWillExpire:(EMErrorCode)aErrorCode {
    [self onReceive:ExtSdkMethodKeyOnTokenWillExpire withParams:nil];
}

- (void)tokenDidExpire:(EMErrorCode)aErrorCode {
    [self onReceive:ExtSdkMethodKeyOnTokenDidExpire withParams:nil];
}

- (void)onOfflineMessageSyncStart {
    [self onReceive:ExtSdkMethodKeyOnOfflineMessageSyncStart withParams:nil];
}

- (void)onOfflineMessageSyncFinish {
    [self onReceive:ExtSdkMethodKeyOnOfflineMessageSyncFinish withParams:nil];
}

- (void)syncDataStartWithType:(EMDataSyncType)type {
    [self onReceive:ExtSdkMethodKeyOnDataSyncStart withParams:@{@"type" : @(type)}];
}

- (void)syncDataFinished:(EMError *_Nullable)error type:(EMDataSyncType)type {
    [self onReceive:ExtSdkMethodKeyOnDataSyncFinish
         withParams:@{@"type" : @(type), @"errorCode" : @(error ? error.code : 0)}];
}

- (void)onDatabaseOpened:(EMError *_Nullable)error username:(NSString *_Nonnull)username {
    [self onReceive:ExtSdkMethodKeyOnDatabaseOpened
         withParams:@{@"username" : username, @"errorCode" : @(error ? error.code : 0)}];
}

- (void)userAccountDidLoginFromOtherDeviceWithInfo:(EMLoginExtensionInfo *_Nullable)info {
    [self onReceive:ExtSdkMethodKeyOnUserDidLoginFromOtherDeviceWithInfo
         withParams:@{@"deviceName" : info.deviceName, @"ext" : info.extensionInfo}];
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
        [self onReceive:ExtSdkMethodKeyOnUserDidLoginTooManyDevice withParams:nil];
    } else if (aError.code == EMErrorUserKickedByOtherDevice) {
        [self onReceive:ExtSdkMethodKeyOnUserKickedByOtherDevice withParams:nil];
    } else if (aError.code == EMErrorUserAuthenticationFailed) {
        [self onReceive:ExtSdkMethodKeyOnUserAuthenticationFailed withParams:nil];
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

- (void)multiDevicesGroupEventDidReceive:(EMMultiDevicesEvent)aEvent groupId:(NSString *)aGroupId ext:(id)aExt {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"event"] = @(aEvent);
    data[@"target"] = aGroupId;
    data[@"ext"] = aExt;
    data[@"type"] = ExtSdkMethodKeyOnMultiDeviceEventGroup;
    [self onReceive:ExtSdkMethodKeyOnMultiDeviceEvent withParams:data];
}

- (void)multiDevicesThreadEventDidReceive:(EMMultiDevicesEvent)aEvent threadId:(NSString *)aThreadId ext:(id)aExt {
    NSMutableDictionary *data = [NSMutableDictionary dictionary];
    data[@"event"] = @(aEvent);
    data[@"target"] = aThreadId;
    data[@"ext"] = aExt;
    data[@"type"] = ExtSdkMethodKeyOnMultiDeviceEventThread;
    [self onReceive:ExtSdkMethodKeyOnMultiDeviceEvent withParams:data];
}

- (void)multiDevicesMessageBeRemoved:(NSString *_Nonnull)conversationId deviceId:(NSString *_Nonnull)deviceId;
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
    data[@"convType"] = @([ExtSdkConvertHelper conversationTypeToInt:conversationType]);
    data[@"type"] = ExtSdkMethodKeyOnMultiDeviceEventConversation;
    [self onReceive:ExtSdkMethodKeyOnMultiDeviceEvent withParams:data];
}

@end
