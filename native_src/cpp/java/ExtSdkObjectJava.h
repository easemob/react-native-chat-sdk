//
// Created by asterisk on 2022/3/3.
//

#ifndef ANDROID_EXTSDKOBJECTJAVA_H
#define ANDROID_EXTSDKOBJECTJAVA_H

#include "ExtSdkObject.h"
#include <jni.h>

EXT_SDK_NAMESPACE_BEGIN

class ExtSdkObjectJava : public ExtSdkObject {
public:
    ExtSdkObjectJava(jobject obj);

public:
    jobject obj;
};
EXT_SDK_NAMESPACE_END



#endif //ANDROID_EXTSDKOBJECTJAVA_H
