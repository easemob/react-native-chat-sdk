//
//  ExtSdkDelegateObjcFlutter.h
//  im_flutter_sdk
//
//  Created by asterisk on 2022/3/14.
//

#import <Foundation/Foundation.h>
#import "ExtSdkDelegateObjc.h"

NS_ASSUME_NONNULL_BEGIN

@interface ExtSdkDelegateObjcFlutter : NSObject <ExtSdkDelegateObjc>

- (nonnull NSString *)getType;

- (void)onReceive:(nonnull NSString *)methodType withParams:(nullable id<NSObject>)data;

- (void)setType:(nonnull NSString *)listenerType;

@end

NS_ASSUME_NONNULL_END
