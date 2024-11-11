#import <Foundation/Foundation.h>

@protocol ExtSdkDelegateObjc

- (void)onReceive:(nonnull NSString*)methodType withParams:(nullable id<NSObject>)data;

- (void)setType:(nonnull NSString*)listenerType;

- (nonnull NSString*)getType;

@end
