//
// Created by asterisk on 2022/3/3.
//

#ifndef ANDROID_EXTSDKDEFINE_H
#define ANDROID_EXTSDKDEFINE_H

#if defined(JAVA_LANGUAGE)
#elif defined(CPP_LANGUAGE)
#elif defined(OBJC_LANGUAGE)
#else
#error "Please specify the language macro definition."
#endif

#if defined(FLUTTER_ARCHITECTURE)
#elif defined(REACT_NATIVE_ARCHITECTURE)
#elif defined(UNITY_ARCHITECTURE)
#else
#error "Please specify the platform macro definition."
#endif

#if defined(ANDROID_PLATFORM)
#elif defined(IOS_PLATFORM)
#elif defined(MAC_PLATFORM)
#elif defined(WIN_PLATFORM)
#else
#error "Please specify the platform macro definition."
#endif

#define EXT_SDK_NAMESPACE_BEGIN namespace com { namespace easemob { namespace ext_sdk {
#define EXT_SDK_NAMESPACE_END }}}
#define EXT_SDK_NAMESPACE_USING using namespace com::easemob::ext_sdk;

#endif //ANDROID_EXTSDKDEFINE_H
