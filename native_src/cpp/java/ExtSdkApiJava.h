//
// Created by asterisk on 2022/3/3.
//

#ifndef ANDROID_EXTSDKAPIJAVA_H
#define ANDROID_EXTSDKAPIJAVA_H

#include "ExtSdkApi.h"
#include "ExtSdkObject.h"
#include <memory>
#include <string>
#include <jni.h>

EXT_SDK_NAMESPACE_BEGIN

/// 分发接口
class ExtSdkApiJava : public ExtSdkApi {
public:
    static void initJni(JNIEnv* env);
    static void unInitJni(JNIEnv* env);

    virtual void init(const std::shared_ptr<ExtSdkObject> config) override;
    virtual void addListener(const std::shared_ptr<ExtSdkObject> listener) override;
    virtual void delListener(const std::shared_ptr<ExtSdkObject> listener) override;
    virtual void callSdkApi(const std::string& methodType, const std::shared_ptr<ExtSdkObject> params, const std::shared_ptr<ExtSdkObject> callback)  override;
    virtual void unInit() override;
};

EXT_SDK_NAMESPACE_END

#endif //ANDROID_EXTSDKAPIJAVA_H
