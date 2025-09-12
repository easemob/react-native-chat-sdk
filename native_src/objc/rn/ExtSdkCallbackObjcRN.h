//
//  ExtSdkCallbackObjcRN.h
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/14.
//

#import "ExtSdkCallbackObjc.h"
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface ExtSdkCallbackObjcRN : NSObject <ExtSdkCallbackObjc>

- (nonnull instancetype)initWithResolve:(nonnull RCTPromiseResolveBlock)resolve
                             withReject:(nonnull RCTPromiseRejectBlock)reject;

- (void)onFail:(int)code withExtension:(nullable id<NSObject>)ext;

- (void)onSuccess:(nullable id<NSObject>)data;

@end
