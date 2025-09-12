//
//  ExtSdkDelegateObjcRN.h
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/14.
//

#import "ExtSdkDelegateObjc.h"
#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

@class ExtSdkApiRN;

@interface ExtSdkDelegateObjcRN : NSObject <ExtSdkDelegateObjc>

- (instancetype)initWithApi:(ExtSdkApiRN*)sdk;

- (nonnull NSString *)getType;

- (void)onReceive:(nonnull NSString *)methodType withParams:(nullable id<NSObject>)data;

- (void)setType:(nonnull NSString *)listenerType;

@end
