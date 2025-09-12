#include "ExtSdkApiObjcImpl.h"
#include "ExtSdkObjectObjcImpl.h"
#import "ExtSdkDispatch.h"


EXT_SDK_NAMESPACE_BEGIN

void ExtSdkApiObjcImpl::init(const std::shared_ptr<ExtSdkObject> config) {
    std::shared_ptr<ExtSdkObjectObjcImpl> cpp_config = std::dynamic_pointer_cast<ExtSdkObjectObjcImpl>(config);
    [[ExtSdkDispatch getInstance] init: cpp_config->obj];
}

void ExtSdkApiObjcImpl::addListener(const std::shared_ptr<ExtSdkObject> listener) {
    std::shared_ptr<ExtSdkObjectObjcImpl> cpp_listener = std::dynamic_pointer_cast<ExtSdkObjectObjcImpl>(listener);
    [[ExtSdkDispatch getInstance] addListener:(id<ExtSdkDelegateObjc>)cpp_listener->obj];
}

void ExtSdkApiObjcImpl::delListener(const std::shared_ptr<ExtSdkObject> listener) {
    // TODO: no implement
}

void ExtSdkApiObjcImpl::callSdkApi(const std::string &methodType, const std::shared_ptr<ExtSdkObject> params, const std::shared_ptr<ExtSdkObject> callback) {
    std::shared_ptr<ExtSdkObjectObjcImpl> cpp_params = std::dynamic_pointer_cast<ExtSdkObjectObjcImpl>(params);
    NSObject* oc_params = cpp_params->obj;
    std::shared_ptr<ExtSdkObjectObjcImpl> cpp_callback = std::dynamic_pointer_cast<ExtSdkObjectObjcImpl>(callback);
    id<ExtSdkCallbackObjc> oc_callback = (id<ExtSdkCallbackObjc>)cpp_callback->obj;
    NSString* oc_method_type = [NSString stringWithUTF8String:methodType.c_str()];
    [[ExtSdkDispatch getInstance] callSdkApi:oc_method_type withParams:oc_params withCallback:oc_callback];
}

void ExtSdkApiObjcImpl::unInit() {
    [[ExtSdkDispatch getInstance] unInit:nil];
}

EXT_SDK_NAMESPACE_END
