//
// Created by asterisk on 2022/3/3.
//

#ifndef ANDROID_EXTSDKLOG_H
#define ANDROID_EXTSDKLOG_H

#if defined(ANDROID_PLATFORM)
#include "ExtSdkLogAndroid.h"
#elif defined(IOS_PLATFORM)
#elif defined(MAC_PLATFORM)
#elif defined(WIN_PLATFORM)
#else
#error "Please specify the platform macro definition."
#endif

#endif //ANDROID_EXTSDKLOG_H
