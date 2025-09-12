#import "ExtSdkApiRNImpl.h"
#include "ExtSdkApiObjcImpl.h"
#import "ExtSdkCallbackObjcRN.h"
#import "ExtSdkDelegateObjcRN.h"
#include "ExtSdkObjectObjcImpl.h"

static NSString *const TAG = @"ExtSdkApiRNImpl";

@implementation ExtSdkApiRNImpl

#pragma mark - ExtSdkApiObjc

- (void)addListener:(nonnull id<ExtSdkDelegateObjc>)listener {
    // NSLog(@"%@: addListener:", TAG);
    EXT_SDK_NAMESPACE_USING
    ExtSdkApi::getInstance()->addListener(std::make_shared<ExtSdkObjectObjcImpl>(listener));
}

- (void)callSdkApi:(nonnull NSString *)methodType
        withParams:(nullable id<NSObject>)params
      withCallback:(nonnull id<ExtSdkCallbackObjc>)callback {
    // NSLog(@"%@: callSdkApi: %@: %@", TAG, methodType, nil != params ? params : @"");
    EXT_SDK_NAMESPACE_USING
    std::string cpp_method_type = std::string([methodType UTF8String]);
    std::shared_ptr<ExtSdkObject> cpp_params = std::make_shared<ExtSdkObjectObjcImpl>(params);
    std::shared_ptr<ExtSdkObject> cpp_callback = std::make_shared<ExtSdkObjectObjcImpl>(callback);
    ExtSdkApi::getInstance()->callSdkApi(cpp_method_type, cpp_params, cpp_callback);
}

- (void)delListener:(nonnull id<ExtSdkDelegateObjc>)listener {
    // NSLog(@"%@: delListener:", TAG);
    // TODO: no implement
}

- (void)init:(nonnull id<NSObject>)config {
    // NSLog(@"%@: init:", TAG);
    EXT_SDK_NAMESPACE_USING
    std::shared_ptr<ExtSdkObjectObjcImpl> cpp_config = std::make_shared<ExtSdkObjectObjcImpl>(config);
    ExtSdkApi::getInstance()->init(cpp_config);
}

- (void)unInit:(nullable id<NSObject>)params {
    // NSLog(@"%@: unInit:", TAG);
    EXT_SDK_NAMESPACE_USING
    ExtSdkApi::getInstance()->unInit();
}

@synthesize description;

@synthesize hash;

@synthesize superclass;

@end
