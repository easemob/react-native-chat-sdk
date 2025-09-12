//
//  ExtSdkCallbackObjcRN.m
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/14.
//

#import "ExtSdkCallbackObjcRN.h"
#import "ExtSdkThreadUtilObjc.h"

@interface ExtSdkCallbackObjcRN () <NSCopying> {
    RCTPromiseResolveBlock _resolve;
    RCTPromiseRejectBlock _reject;
}

@end

@implementation ExtSdkCallbackObjcRN

- (nonnull instancetype)initWithResolve:(nonnull RCTPromiseResolveBlock)resolve
                             withReject:(nonnull RCTPromiseRejectBlock)reject {
    _resolve = resolve;
    _reject = reject;
    return self;
}

- (id)copyWithZone:(nullable NSZone *)zone {
    // _resolve _reject 浅拷贝
    // ExtSdkCallbackObjcRN 深拷贝
    ExtSdkCallbackObjcRN *clone = [[ExtSdkCallbackObjcRN alloc] initWithResolve:_resolve withReject:_reject];
    return clone;
}

- (void)onFail:(int)code withExtension:(nullable id<NSObject>)ext {
    __block ExtSdkCallbackObjcRN *clone = [self copy];
    [ExtSdkThreadUtilObjc mainThreadExecute:^{
      typeof(self) strongSelf = clone;
      if (!strongSelf) {
          return;
      }
        RCTPromiseResolveBlock callback = [strongSelf getResolve];
        if (nil != callback) {
            callback(ext);
        }
//      RCTPromiseRejectBlock callback = [strongSelf getReject]; // todo: 后续修改
//      if (nil != callback) {
//          NSDictionary *map = (NSDictionary *)ext;
//          NSDictionary *error = map[@"error"];
//          NSNumber *code = error[@"code"];
//          NSString *description = error[@"description"];
//          callback([NSString stringWithFormat:@"%d", [code intValue]], description, nil);
//      }
    }];
}

- (void)onSuccess:(nullable id<NSObject>)data {
    __block ExtSdkCallbackObjcRN *clone = [self copy];
    [ExtSdkThreadUtilObjc mainThreadExecute:^{
      typeof(self) strongSelf = clone;
      if (!strongSelf) {
          return;
      }
      RCTPromiseResolveBlock callback = [strongSelf getResolve];
      if (nil != callback) {
          callback(data);
      }
    }];
}

- (RCTPromiseResolveBlock)getResolve {
    return self->_resolve;
}

- (RCTPromiseRejectBlock)getReject {
    return self->_reject;
}

@end
