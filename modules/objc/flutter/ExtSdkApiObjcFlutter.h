//
//  ExtSdkApiObjcFlutter.h
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/28.
//

#import "ExtSdkApiFlutter.h"
#import <Flutter/Flutter.h>
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface ExtSdkApiFlutter (Objc) <FlutterPlugin>

+ (void)registerWithRegistrar:(nonnull NSObject<FlutterPluginRegistrar> *)registrar;

@end

NS_ASSUME_NONNULL_END
