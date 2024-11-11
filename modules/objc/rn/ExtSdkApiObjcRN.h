//
//  ExtSdkApiObjcRN.h
//  react-native-chat-sdk
//
//  Created by asterisk on 2022/3/29.
//  Updated by asterisk on 2024-10-31.
//

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

// NS_ASSUME_NONNULL_BEGIN

#ifdef RCT_NEW_ARCH_ENABLED

#import "RNChatSdkSpec.h"
@interface ChatSdk : RCTEventEmitter <NativeChatSdkSpec>

#else

#import <React/RCTBridgeModule.h>

@interface ChatSdk : RCTEventEmitter <RCTBridgeModule>

#endif

//+ (nonnull instancetype)getInstance;

- (void)onReceive:(nonnull NSString *)methodType
       withParams:(nullable id<NSObject>)data;

@end

// NS_ASSUME_NONNULL_END
