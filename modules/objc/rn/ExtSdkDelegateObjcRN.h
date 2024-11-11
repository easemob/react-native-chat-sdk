//
//  ExtSdkDelegateObjcRN.h
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/14.
//

#import "ExtSdkDelegateObjc.h"
#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

@class ChatSdk;

@interface ExtSdkDelegateObjcRN : NSObject <ExtSdkDelegateObjc>

- (instancetype _Nonnull )initWithApi:(ChatSdk*_Nullable)sdk;

- (nonnull NSString *)getType;

- (void)onReceive:(nonnull NSString *)methodType withParams:(nullable id<NSObject>)data;

- (void)setType:(nonnull NSString *)listenerType;

@end
