package com.easemob.ext_sdk.common;


public class ExtSdkTypeUtil {
    public enum ExtSdkPlatformTypeValue {
        PLATFORM_ANDROID,
        PLATFORM_IOS,
        PLATFORM_WIN,
        PLATFORM_MAC
    }

    public enum ExtSdkArchitectureTypeValue {
        ARCHITECTURE_FLUTTER,
        ARCHITECTURE_UNITY,
        ARCHITECTURE_RN,
    }

    public static ExtSdkPlatformTypeValue currentPlatformType() throws Exception {
        ExtSdkPlatformTypeValue ret;
        switch (nativeCurrentPlatform()) {
            case 1:
                ret = ExtSdkPlatformTypeValue.PLATFORM_ANDROID;
                break;
            case 2:
                ret = ExtSdkPlatformTypeValue.PLATFORM_IOS;
                break;
            case 3:
                ret = ExtSdkPlatformTypeValue.PLATFORM_WIN;
                break;
            case 4:
                ret = ExtSdkPlatformTypeValue.PLATFORM_MAC;
                break;
            default:
                throw new Exception("not this type");

        }
        return ret;
    }

    public static ExtSdkArchitectureTypeValue currentArchitectureType() throws Exception {
        ExtSdkArchitectureTypeValue ret;
        switch (nativeCurrentArchitecture()) {
            case 1:
                ret = ExtSdkArchitectureTypeValue.ARCHITECTURE_FLUTTER;
                break;
            case 2:
                ret = ExtSdkArchitectureTypeValue.ARCHITECTURE_UNITY;
                break;
            case 3:
                ret = ExtSdkArchitectureTypeValue.ARCHITECTURE_RN;
                break;
            default:
                throw new Exception("not this type");

        }
        return ret;
    }

    protected static native int nativeCurrentPlatform();

    protected static native int nativeCurrentArchitecture();
}
