#ifndef EXTSDKAPIOBJC_H
#define EXTSDKAPIOBJC_H

#include "ExtSdkApi.h"
#include <memory>
#include <string>

EXT_SDK_NAMESPACE_BEGIN

class ExtSdkApiObjcImpl : public ExtSdkApi {
    
public:
    void init(const std::shared_ptr<ExtSdkObject> config) override;
    
    void addListener(const std::shared_ptr<ExtSdkObject> listener) override;
    
    void delListener(const std::shared_ptr<ExtSdkObject> listener) override;
    
    void callSdkApi(const std::string &methodType, const std::shared_ptr<ExtSdkObject> params, const std::shared_ptr<ExtSdkObject> callback) override;
    
    void unInit() override;
};

EXT_SDK_NAMESPACE_END


#endif //EXTSDKAPIOBJC_H
