//
// Created by asterisk on 2022/3/3.
//

#ifndef ANDROID_EXTSDKAPI_H
#define ANDROID_EXTSDKAPI_H

#include <ExtSdkObject.h>
#include <memory>
#include <string>

EXT_SDK_NAMESPACE_BEGIN

/// 分发接口
class ExtSdkApi {
public:
    virtual ~ExtSdkApi() {}
    
    static ExtSdkApi* getInstance();

    virtual void init(const std::shared_ptr<ExtSdkObject> config) = 0;
    virtual void addListener(const std::shared_ptr<ExtSdkObject> listener) = 0;
    virtual void delListener(const std::shared_ptr<ExtSdkObject> listener) = 0;
    virtual void callSdkApi(const std::string& methodType, const std::shared_ptr<ExtSdkObject> params, const std::shared_ptr<ExtSdkObject> callback) = 0;
    virtual void unInit() = 0;
};

EXT_SDK_NAMESPACE_END

#endif //ANDROID_EXTSDKAPI_H
