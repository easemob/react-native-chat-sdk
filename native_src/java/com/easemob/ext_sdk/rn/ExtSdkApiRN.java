package com.easemob.ext_sdk.rn;

import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.easemob.ext_sdk.common.ExtSdkApi;
import com.easemob.ext_sdk.common.ExtSdkCallback;
import com.easemob.ext_sdk.common.ExtSdkContext;
import com.easemob.ext_sdk.common.ExtSdkListener;
import com.easemob.ext_sdk.common.ExtSdkThreadUtil;
import com.easemob.ext_sdk.jni.ExtSdkApiJni;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Iterator;
import java.util.List;
import java.util.Map;


@ReactModule(name = ExtSdkApiRN.NAME)
public class ExtSdkApiRN extends ReactContextBaseJavaModule implements ExtSdkApi {
    private static final String TAG = "ExtSdkApiRN";
    public static final String NAME = "ExtSdkApiRN";
    private ReactApplicationContext reactContext;
    private DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter;

    public ExtSdkApiRN(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d(TAG, "ExtSdkApiRN: ");
        this.reactContext = reactContext;
        ExtSdkContext.context = this.reactContext;
    }

    @Override
    public void initialize() {
        Log.d(TAG, "initialize: ");
        super.initialize();
        eventEmitter = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
        this.init(new Object());
    }

    @Override
    public void invalidate() {
        Log.d(TAG, "invalidate: ");
        super.invalidate();
        this.unInit(null);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @Override
    public void init(@NonNull Object config) {
        Log.d(TAG, "init: " + config);
        ExtSdkApiJni.nativeInit(config);
        this.addListener(new ExtSdkListener() {
            @Override
            public void onReceive(@NonNull String methodType, @Nullable Object data) {
                Log.d(TAG, "onReceive: " + methodType + ": " + (data != null ? data : ""));
                ExtSdkThreadUtil.mainThreadExecute(() -> {
                    if (data == null) {
                        eventEmitter.emit(methodType, null);
                        return;
                    }
                    if (data instanceof Map) {
                        WritableMap result = Arguments.createMap();
                        new ExtSdkMapHelperRN().toWritableMap((Map<String, Object>) data, result);
                        eventEmitter.emit(methodType, result);
                    } else if (data instanceof Object[]) {
                        WritableNativeArray result = Arguments.fromJavaArgs(new Object[0]);
                        new ExtSdkMapHelperRN().toWritableArray((Object[]) data, result);
                        eventEmitter.emit(methodType, result);
                    } else if (data instanceof List) {
                        int size = ((List<Object>) data).size();
                        Object[] a = new Object[size];
                        for (int i = 0; i < size; ++i) {
                            a[i] = ((List<Object>) data).get(i);
                        }
                        WritableNativeArray result = Arguments.fromJavaArgs(new Object[0]);
                        new ExtSdkMapHelperRN().toWritableArray(a, result);
                        eventEmitter.emit(methodType, result);
                    } else {
                        throw new RuntimeException("Cannot support argument of type " + data.getClass());
                    }
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

    @ReactMethod
    public void addListener(String methodType) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(int count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeAllListeners(String methodType) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    // @ReactMethod
    // public Object[] listeners(String methodType) throws Exception {
    //     // Keep: Required for RN built in Event Emitter Calls.
    //     throw new Exception("Required for RN built in Event Emitter Calls.");
    // }

    @ReactMethod
    public void callMethod(String methodType, ReadableMap params, Promise promise) {
        Log.d(TAG, "callSdkApiRN: " + methodType + ": " + (params != null ? params : ""));
        ExtSdkThreadUtil.asyncExecute(() -> {
            Object subParams = null;
            if (params != null) {
                Iterator<Map.Entry<String, Object>> iterator = params.toHashMap().entrySet().iterator();
                while (iterator.hasNext()) {
                    subParams = iterator.next().getValue();
                    break;
                }
            }

            this.callSdkApi(methodType, subParams, new ExtSdkCallback() {
                @Override
                public void success(@Nullable Object data) {
                    ExtSdkThreadUtil.mainThreadExecute(() -> {
                        WritableMap result = Arguments.createMap();
                        new ExtSdkMapHelperRN().toWritableMap((Map<String, Object>) data, result);
                        promise.resolve(result);
                    });
                }

                @Override
                public void fail(@NonNull int code, @Nullable Object ext) {
                    ExtSdkThreadUtil.mainThreadExecute(() -> {
                        // todo: errorMessage: 是code的字符串形式
                        String reason = "";
                        try {
                            if (ext != null) {
                                reason = ext.toString();
                            }
                        } catch (Exception e) {
                            reason = e.getMessage();
                        }
                        promise.reject(String.valueOf(code), reason);
                    });
                }
            });
        });
    }
}
