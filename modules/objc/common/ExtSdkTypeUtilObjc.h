//
//  ExtSdkTypeUtilObjc.h
//  react-native-chat-sdk
//
//  Created by asterisk on 2022/4/13.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSUInteger, ExtSdkPlatformTypeValueObjc) {
    ExtSdkPlatformTypeValueAndroid,
    ExtSdkPlatformTypeValueIos,
    ExtSdkPlatformTypeValueWin,
    ExtSdkPlatformTypeValueMac,
};

typedef NS_ENUM(NSUInteger, ExtSdkArchitectureTypeValueObjc) {
    ExtSdkArchitectureTypeValueFlutter,
    ExtSdkArchitectureTypeValueUnity,
    ExtSdkArchitectureTypeValueRN,
};

@interface ExtSdkTypeUtilObjc : NSObject

+ (ExtSdkPlatformTypeValueObjc)currentPlatformType;

+ (ExtSdkArchitectureTypeValueObjc)currentArchitectureType;

@end

NS_ASSUME_NONNULL_END
