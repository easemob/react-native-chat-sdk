//
//  ExtSdkClientWrapper.h
//
//
//  Created by 杜洁鹏 on 2019/10/8.
//

#import "ExtSdkWrapper.h"

NS_ASSUME_NONNULL_BEGIN

@interface ExtSdkClientWrapper : ExtSdkWrapper

+ (nonnull instancetype)getInstance;

- (void)getToken:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)initSDKWithDict:(NSDictionary *)param
         withMethodType:(NSString *)aChannelName
                 result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)createAccount:(NSDictionary *)param
       withMethodType:(NSString *)aChannelName
               result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)login:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)logout:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)changeAppKey:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)getCurrentUser:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)uploadLog:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)compressLogs:(NSDictionary *)param
      withMethodType:(NSString *)aChannelName
              result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)kickDevice:(NSDictionary *)param
    withMethodType:(NSString *)aChannelName
            result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)kickAllDevices:(NSDictionary *)param
        withMethodType:(NSString *)aChannelName
                result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)isLoggedInBefore:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)getLoggedInDevicesFromServer:(NSDictionary *)param
                      withMethodType:(NSString *)aChannelName
                              result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)loginWithAgoraToken:(NSDictionary *)param
             withMethodType:(NSString *)aChannelName
                     result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)isConnected:(NSDictionary *)param
     withMethodType:(NSString *)aChannelName
             result:(nonnull id<ExtSdkCallbackObjc>)result;

- (void)updatePushConfig:(NSDictionary *)param
          withMethodType:(NSString *)aChannelName
                  result:(nonnull id<ExtSdkCallbackObjc>)result;

@end

NS_ASSUME_NONNULL_END
