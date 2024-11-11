//
//  ExtSdkDelegateObjcFlutter.m
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/14.
//

#import "ExtSdkDelegateObjcFlutter.h"
#import "ExtSdkThreadUtilObjc.h"
#import "ExtSdkChannelManager.h"

@interface ExtSdkDelegateObjcFlutter () {
    NSString* _listenerType;
}

@end

@implementation ExtSdkDelegateObjcFlutter

- (nonnull NSString *)getType {
    return _listenerType;
}

- (void)onReceive:(nonnull NSString *)methodType withParams:(nullable id<NSObject>)data {
    [ExtSdkThreadUtilObjc mainThreadExecute:^{
        [[[ExtSdkChannelManager getInstance] get:RECV_CHANNEL] invokeMethod:methodType arguments:data];
    }];
}

- (void)setType:(nonnull NSString *)listenerType {
    _listenerType = listenerType;
}

@end

