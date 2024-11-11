//
// Created by asterisk on 2022/3/3.
//

#ifndef ANDROID_EXTSDKJNIHELPER_H
#define ANDROID_EXTSDKJNIHELPER_H

#include <jni.h>
#include "ExtSdkDefine.h"

EXT_SDK_NAMESPACE_BEGIN

class ExtSdkJniHelper {
public:
    static ExtSdkJniHelper* getInstance();
    void init(JavaVM* vm);
    void unInit(JavaVM* vm);
    JNIEnv *attachCurrentThread();
    void detachCurrentThread();

private:
    static void _destructor(void*);
};

EXT_SDK_NAMESPACE_END

#endif //ANDROID_EXTSDKJNIHELPER_H
