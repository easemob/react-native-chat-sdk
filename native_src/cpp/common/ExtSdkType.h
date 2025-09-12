//
// Created by asterisk on 2022/3/3.
//

#ifndef ANDROID_EXTSDKLANGUAGETYPE_H
#define ANDROID_EXTSDKLANGUAGETYPE_H

#include "ExtSdkDefine.h"
#include <cstdint>

EXT_SDK_NAMESPACE_BEGIN

enum class ExtSdkLanguageTypeValue : std::uint8_t {
    LANGUAGE_CPP = 1, // with C language
    LANGUAGE_JAVA = 2, // with kotlin language
    LANGUAGE_OBJECTIVE_C = 3, // with C language, swift language
};

class ExtSdkLanguageType {

};

enum class ExtSdkPlatformTypeValue : std::uint8_t  {
    PLATFORM_ANDROID = 1,
    PLATFORM_IOS = 2,
    PLATFORM_WIN = 3,
    PLATFORM_MAC = 4
};

class ExtSdkPlatformType {

};

enum class ExtSdkArchitectureTypeValue : std::uint8_t  {
    ARCHITECTURE_FLUTTER = 1,
    ARCHITECTURE_UNITY = 2,
    ARCHITECTURE_RN = 3,
};

class ExtSdkArchitectureType {

};

EXT_SDK_NAMESPACE_END

#endif //ANDROID_EXTSDKLANGUAGETYPE_H
