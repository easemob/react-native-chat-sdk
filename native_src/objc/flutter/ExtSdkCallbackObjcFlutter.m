//
//  ExtSdkCallbackObjcFlutter.m
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/14.
//

#import "ExtSdkCallbackObjcFlutter.h"
#import "ExtSdkChannelManager.h"
#import "ExtSdkThreadUtilObjc.h"

@interface ExtSdkCallbackObjcFlutter () <NSCopying> {
    FlutterResult _result;
}

@end

@implementation ExtSdkCallbackObjcFlutter

- (nonnull instancetype)init:(nonnull FlutterResult)result {
    _result = result;
    return self;
}

- (void)onFail:(int)code withExtension:(nullable id<NSObject>)ext {
    __block ExtSdkCallbackObjcFlutter *clone = [self copy];
    [ExtSdkThreadUtilObjc mainThreadExecute:^{
      typeof(self) strongSelf = clone;
      if (!strongSelf) {
          return;
      }
      FlutterResult _result = [strongSelf getResult];
      if (nil != _result) {
          _result(ext);
      }
    }];
}

- (id)copyWithZone:(nullable NSZone *)zone {
    // _result 浅拷贝
    // ExtSdkCallbackObjcFlutter 深拷贝
    ExtSdkCallbackObjcFlutter *clone = [[ExtSdkCallbackObjcFlutter alloc] init:_result];
    return clone;
}

- (void)onSuccess:(nullable id<NSObject>)data {
    __block ExtSdkCallbackObjcFlutter *clone = [self copy];
    [ExtSdkThreadUtilObjc mainThreadExecute:^{
      typeof(self) strongSelf = clone;
      if (!strongSelf) {
          return;
      }
      FlutterResult _result = [strongSelf getResult];
      if (nil != _result) {
          _result(data);
      }
    }];
}

- (FlutterResult)getResult {
    return self->_result;
}

@end
