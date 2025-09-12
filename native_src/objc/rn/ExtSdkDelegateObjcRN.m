//
//  ExtSdkDelegateObjcRN.m
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/14.
//

#import "ExtSdkDelegateObjcRN.h"
#import "ExtSdkApiObjcRN.h"

@interface ExtSdkDelegateObjcRN () {
    NSString *_listenerType;
    __weak ExtSdkApiRN *_weak;
}

@end

@implementation ExtSdkDelegateObjcRN

- (instancetype)initWithApi:(ExtSdkApiRN *)sdk {
    _weak = sdk;
    _listenerType = @"";
    return self;
}

- (nonnull NSString *)getType {
    return _listenerType;
}

- (void)onReceive:(nonnull NSString *)methodType withParams:(nullable id<NSObject>)data {
    if (_weak) {
        [_weak onReceive:methodType withParams:data];
    }
}

- (void)setType:(nonnull NSString *)listenerType {
    _listenerType = listenerType;
}

@end
