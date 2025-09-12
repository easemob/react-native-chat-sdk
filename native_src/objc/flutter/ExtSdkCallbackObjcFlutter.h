//
//  ExtSdkCallbackObjcFlutter.h
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/14.
//

#import "ExtSdkCallbackObjc.h"
#import <Flutter/Flutter.h>
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface ExtSdkCallbackObjcFlutter : NSObject <ExtSdkCallbackObjc>

- (nonnull instancetype)init:(nonnull FlutterResult)result;

- (void)onFail:(int)code withExtension:(nullable id<NSObject>)ext;

- (void)onSuccess:(nullable id<NSObject>)data;

@end

NS_ASSUME_NONNULL_END
