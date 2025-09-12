//
//  ExtSdkApiObjcRN.h
//  react-native-chat-sdk
//
//  Created by asterisk on 2022/3/29.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

NS_ASSUME_NONNULL_BEGIN

@interface ExtSdkApiRN : RCTEventEmitter <RCTBridgeModule>

//+ (nonnull instancetype)getInstance;

- (void)onReceive:(nonnull NSString *)methodType withParams:(nullable id<NSObject>)data;

@end

NS_ASSUME_NONNULL_END
