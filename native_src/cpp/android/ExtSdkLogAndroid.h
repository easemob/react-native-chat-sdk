//
// Created by asterisk on 2022/3/3.
//

#ifndef ANDROID_EXTSDKLOGANDROID_H
#define ANDROID_EXTSDKLOGANDROID_H

#include "ExtSdkDefine.h"
#include <android/log.h>

// Android log function wrappers
static const char* kTAG = "EXTSDK";
#define ALOGI(...) \
  ((void)__android_log_print(ANDROID_LOG_INFO, kTAG, __VA_ARGS__))
#define ALOGW(...) \
  ((void)__android_log_print(ANDROID_LOG_WARN, kTAG, __VA_ARGS__))
#define ALOGE(...) \
  ((void)__android_log_print(ANDROID_LOG_ERROR, kTAG, __VA_ARGS__))

#endif //ANDROID_EXTSDKLOGANDROID_H
