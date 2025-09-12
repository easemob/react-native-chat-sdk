
#import <Foundation/Foundation.h>
#import "ExtSdkCallbackObjc.h"
#import "ExtSdkDelegateObjc.h"

//@class ExtSdkDelegateObjc;
//@class ExtSdkCallbackObjc;

@protocol ExtSdkApiObjc <NSObject>

- (void)init:(nonnull id<NSObject>)config;

- (void)unInit:(nullable id<NSObject>)params;

- (void)addListener:(nonnull id<ExtSdkDelegateObjc>)listener;

- (void)delListener:(nonnull id<ExtSdkDelegateObjc>)listener;

- (void)callSdkApi:(nonnull NSString*)methodType withParams:(nullable id<NSObject>)params withCallback:(nonnull id<ExtSdkCallbackObjc>)callback;

@end
