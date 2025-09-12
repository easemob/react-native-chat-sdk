//
//  ExtSdkUserInfoManagerWrapper.m
//  im_flutter_sdk
//
//  Created by liujinliang on 2021/4/26.
//

#import "ExtSdkUserInfoManagerWrapper.h"
#import "ExtSdkClientWrapper.h"
#import "ExtSdkMethodTypeObjc.h"
#import "ExtSdkToJson.h"

@interface ExtSdkUserInfoManagerWrapper ()

@end

@implementation ExtSdkUserInfoManagerWrapper

+ (nonnull instancetype)getInstance {
    static ExtSdkUserInfoManagerWrapper *instance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
      instance = [[ExtSdkUserInfoManagerWrapper alloc] init];
    });
    return instance;
}

- (void)updateOwnUserInfo:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    EMUserInfo *userInfo = [EMUserInfo fromJsonObject:param[@"userInfo"]];
    [EMClient.sharedClient.userInfoManager
        updateOwnUserInfo:userInfo
               completion:^(EMUserInfo *aUserInfo, EMError *aError) {
                 NSDictionary *objDic = [aUserInfo toJsonObject];

                 [weakSelf onResult:result
                     withMethodType:aChannelName
                          withError:aError
                         withParams:objDic];
               }];
}

- (void)updateOwnUserInfoWithType:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;

    int typeValue = [param[@"userInfoType"] intValue];
    EMUserInfoType userInfoType = [self userInfoTypeFromInt:typeValue];
    NSString *userInfoValue = param[@"userInfoValue"];

    [EMClient.sharedClient.userInfoManager
        updateOwnUserInfo:userInfoValue
                 withType:userInfoType
               completion:^(EMUserInfo *aUserInfo, EMError *aError) {
                 NSDictionary *objDic = [aUserInfo toJsonObject];
                 [weakSelf onResult:result
                     withMethodType:aChannelName
                          withError:aError
                         withParams:objDic];
               }];
}

- (void)fetchUserInfoById:(NSDictionary *)param
           withMethodType:(NSString *)aChannelName
                   result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray *userIds = param[@"userIds"];

    [EMClient.sharedClient.userInfoManager
        fetchUserInfoById:userIds
               completion:^(NSDictionary *aUserDatas, EMError *aError) {
                 NSMutableDictionary *dic = NSMutableDictionary.new;
                 [aUserDatas enumerateKeysAndObjectsUsingBlock:^(
                                 id _Nonnull key, id _Nonnull obj,
                                 BOOL *_Nonnull stop) {
                   dic[key] = [(EMUserInfo *)obj toJsonObject];
                 }];

                 [weakSelf onResult:result
                     withMethodType:aChannelName
                          withError:aError
                         withParams:[dic copy]];
               }];
}

- (void)fetchUserInfoByIdWithType:(NSDictionary *)param
                   withMethodType:(NSString *)aChannelName
                           result:(nonnull id<ExtSdkCallbackObjc>)result {
    __weak typeof(self) weakSelf = self;
    NSArray *userIds = param[@"userIds"];
    NSArray<NSNumber *> *userInfoTypes = param[@"userInfoTypes"];

    [EMClient.sharedClient.userInfoManager
        fetchUserInfoById:userIds
                     type:userInfoTypes
               completion:^(NSDictionary *aUserDatas, EMError *aError) {
                 NSMutableDictionary *dic = NSMutableDictionary.new;
                 [aUserDatas enumerateKeysAndObjectsUsingBlock:^(
                                 id _Nonnull key, id _Nonnull obj,
                                 BOOL *_Nonnull stop) {
                   dic[key] = [(EMUserInfo *)obj toJsonObject];
                 }];

                 [weakSelf onResult:result
                     withMethodType:aChannelName
                          withError:aError
                         withParams:dic];
               }];
}

- (EMUserInfoType)userInfoTypeFromInt:(int)typeValue {
    EMUserInfoType userInfoType;

    switch (typeValue) {
    case 0:
        userInfoType = EMUserInfoTypeNickName;
        break;
    case 1:
        userInfoType = EMUserInfoTypeAvatarURL;
        break;
    case 2:
        userInfoType = EMUserInfoTypePhone;
        break;
    case 3:
        userInfoType = EMUserInfoTypeMail;
        break;
    case 4:
        userInfoType = EMUserInfoTypeGender;
        break;
    case 5:
        userInfoType = EMUserInfoTypeSign;
        break;
    case 6:
        userInfoType = EMUserInfoTypeBirth;
        break;
    case 7:
        userInfoType = EMUserInfoTypeExt;
        break;
    default:
        userInfoType = EMUserInfoTypeNickName;
        break;
    }

    return userInfoType;
}

@end
