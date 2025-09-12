package com.easemob.ext_sdk.jni;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.easemob.ext_sdk.common.ExtSdkListener;

public class ExtSdkApiJni {
    public static native void nativeInit(@NonNull Object configures);
    public static native void nativeAddListener(ExtSdkListener listener);
    public static native void nativeDelListener(ExtSdkListener listener);
    public static native void nativeCallSdkApi(@NonNull String methodType, @Nullable Object params, @Nullable ExtSdkCallback callback);
    public static native void nativeUnInit();
}
