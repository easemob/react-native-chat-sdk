package com.easemob.ext_sdk.flutter;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.easemob.ext_sdk.common.ExtSdkApi;
import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.easemob.ext_sdk.common.ExtSdkListener;
import com.easemob.ext_sdk.common.ExtSdkThreadUtil;
import com.easemob.ext_sdk.jni.ExtSdkApiJni;

import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel;

public class ExtSdkApiFlutter implements ExtSdkApi, MethodChannel.MethodCallHandler {

    @Override
    public void onMethodCall(@NonNull MethodCall call, @NonNull MethodChannel.Result result) {
        Log.d(TAG, "onMethodCall" + ": " + call.method + ": " + (call.arguments != null ? call.arguments.toString() : ""));
        ExtSdkThreadUtil.asyncExecute(()->{
            this.callSdkApi(call.method, call.arguments, new ExtSdkCallback() {
                @Override
                public void success(@Nullable Object data) {
                    ExtSdkThreadUtil.mainThreadExecute(()->{
                        result.success(data);
                    });
                }

                @Override
                public void fail(@NonNull int code, @Nullable Object ext) {
                    ExtSdkThreadUtil.mainThreadExecute(()->{
                        // todo: errorMessage: 是code的字符串形式
                        result.error(String.valueOf(code), "", ext);
                    });
                }
            });
        });
    }

    private static class SingleHolder {
        static ExtSdkApiFlutter instance = new ExtSdkApiFlutter();
    }

    public static ExtSdkApiFlutter getInstance() {
        return ExtSdkApiFlutter.SingleHolder.instance;
    }

    @Override
    public void init(@NonNull Object config) {
        Log.d(TAG, "initialize: ");
        ExtSdkApiJni.nativeInit(config);
        this.addListener(new ExtSdkListener() {
            @Override
            public void onReceive(@NonNull String methodType, @Nullable Object data) {
                Log.d(TAG, "onReceive: " + methodType + (data != null ? data : ""));
                ExtSdkThreadUtil.mainThreadExecute(()->{
                    ExtSdkChannelManager.getInstance().get(ExtSdkChannelManager.ExtSdkChannelName.RECV_CHANNEL).invokeMethod(methodType, data);
                });
            }

            @Override
            public void setType(@NonNull String listenerType) {

            }

            @Override
            public void getType() {

            }
        });
    }

    @Override
    public void unInit(@Nullable Object params) {
        Log.d(TAG, "unInit: " + params);
        ExtSdkApiJni.nativeUnInit();
    }

    @Override
    public void addListener(@NonNull ExtSdkListener listener) {
        Log.d(TAG, "addListener: " + listener);
        ExtSdkApiJni.nativeAddListener(listener);
    }

    @Override
    public void delListener(@NonNull ExtSdkListener listener) {
        Log.d(TAG, "delListener: " + listener);
        ExtSdkApiJni.nativeDelListener(listener);
    }

    @Override
    public void callSdkApi(@NonNull String methodType, @Nullable Object params, @NonNull ExtSdkCallback callback) {
        ExtSdkApiJni.nativeCallSdkApi(methodType, params, callback);
    }

    private static final String TAG = "ExtSdkApiFlutter";
}
