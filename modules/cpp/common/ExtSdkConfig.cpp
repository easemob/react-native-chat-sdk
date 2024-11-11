//
// Created by asterisk on 2022/3/3.
//

#include "ExtSdkConfig.h"

EXT_SDK_NAMESPACE_BEGIN


const std::string ExtSdkConfig::current_ext_sdk_version = "1.0.0";

#if defined(JAVA_LANGUAGE)
const ExtSdkLanguageTypeValue ExtSdkConfig::current_language_type = ExtSdkLanguageTypeValue::LANGUAGE_JAVA;
#elif defined(CPP_LANGUAGE)
const ExtSdkLanguageTypeValue ExtSdkConfig::current_language_type = ExtSdkLanguageTypeValue::LANGUAGE_CPP;
#elif defined(OBJC_LANGUAGE)
const ExtSdkLanguageTypeValue ExtSdkConfig::current_language_type = ExtSdkLanguageTypeValue::LANGUAGE_OBJECTIVE_C;
#else
#error "Please specify the language macro definition."
#endif

#if defined(FLUTTER_ARCHITECTURE)
const ExtSdkArchitectureTypeValue ExtSdkConfig::current_architecture_type = ExtSdkArchitectureTypeValue::ARCHITECTURE_FLUTTER;
#elif defined(REACT_NATIVE_ARCHITECTURE)
const ExtSdkArchitectureTypeValue ExtSdkConfig::current_architecture_type = ExtSdkArchitectureTypeValue::ARCHITECTURE_RN;
#elif defined(UNITY_ARCHITECTURE)
const ExtSdkArchitectureTypeValue ExtSdkConfig::current_architecture_type = ExtSdkArchitectureTypeValue::ARCHITECTURE_UNITY;
#else
#error "Please specify the platform macro definition."
#endif

#if defined(ANDROID_PLATFORM)
const ExtSdkPlatformTypeValue ExtSdkConfig::current_platform_type = ExtSdkPlatformTypeValue::PLATFORM_ANDROID;
#elif defined(IOS_PLATFORM)
const ExtSdkPlatformTypeValue ExtSdkConfig::current_platform_type = ExtSdkPlatformTypeValue::PLATFORM_IOS;
#elif defined(MAC_PLATFORM)
const ExtSdkPlatformTypeValue ExtSdkConfig::current_platform_type = ExtSdkPlatformTypeValue::PLATFORM_MAC;
#elif defined(WIN_PLATFORM)
const ExtSdkPlatformTypeValue ExtSdkConfig::current_platform_type = ExtSdkPlatformTypeValue::PLATFORM_WIN;
#else
#error "Please specify the platform macro definition."
#endif

EXT_SDK_NAMESPACE_END