//
//  ExtSdkTypeUtilObjc.m
//  react-native-chat-sdk
//
//  Created by asterisk on 2022/4/13.
//

#import "ExtSdkTypeUtilObjc.h"
#include "ExtSdkConfig.h"
#include "ExtSdkType.h"

@implementation ExtSdkTypeUtilObjc

+ (ExtSdkPlatformTypeValueObjc)currentPlatformType {
    ExtSdkPlatformTypeValueObjc ret;
    EXT_SDK_NAMESPACE_USING
    switch (ExtSdkConfig::current_platform_type) {
        case ExtSdkPlatformTypeValue::PLATFORM_ANDROID:
            ret = ExtSdkPlatformTypeValueAndroid;
            break;
        case ExtSdkPlatformTypeValue::PLATFORM_IOS:
            ret = ExtSdkPlatformTypeValueIos;
            break;
        case ExtSdkPlatformTypeValue::PLATFORM_WIN:
            ret = ExtSdkPlatformTypeValueWin;
            break;
        case ExtSdkPlatformTypeValue::PLATFORM_MAC:
            ret = ExtSdkPlatformTypeValueMac;
            break;
        default:
            @throw @"This type is not supported.";
            break;
    }
    return ret;
}

+ (ExtSdkArchitectureTypeValueObjc)currentArchitectureType {
    ExtSdkArchitectureTypeValueObjc ret;
    EXT_SDK_NAMESPACE_USING
    switch (ExtSdkConfig::current_architecture_type) {
        case ExtSdkArchitectureTypeValue::ARCHITECTURE_FLUTTER:
            ret = ExtSdkArchitectureTypeValueFlutter;
            break;
        case ExtSdkArchitectureTypeValue::ARCHITECTURE_UNITY:
            ret = ExtSdkArchitectureTypeValueUnity;
            break;
        case ExtSdkArchitectureTypeValue::ARCHITECTURE_RN:
            ret = ExtSdkArchitectureTypeValueRN;
            break;
        default:
            @throw @"This type is not supported.";
            break;
    }
    return ret;
}

@end
