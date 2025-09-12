#import "ExtSdkApiObjc.h"
#import <Foundation/Foundation.h>

@interface ExtSdkDispatch : NSObject <ExtSdkApiObjc>

+ (nonnull instancetype)getInstance;

- (void)addListener:(nonnull id<ExtSdkDelegateObjc>)listener;

- (void)callSdkApi:(nonnull NSString *)methodType
        withParams:(nullable id<NSObject>)params
      withCallback:(nonnull id<ExtSdkCallbackObjc>)callback;

- (void)delListener:(nonnull id<ExtSdkDelegateObjc>)listener;

- (void)init:(nonnull id<NSObject>)config;

- (void)unInit:(nullable id<NSObject>)params;

- (void)onReceive:(nonnull NSString *)methodType
       withParams:(nullable NSObject *)params;

@end
