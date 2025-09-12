#import <Foundation/Foundation.h>

@protocol ExtSdkCallbackObjc

- (void)onSuccess:(nullable id<NSObject>)data;

- (void)onFail:(int)code withExtension:(nullable id<NSObject>)ext;

@end
