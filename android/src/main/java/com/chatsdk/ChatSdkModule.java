package com.chatsdk;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import javax.annotation.Nullable;

public class ChatSdkModule extends ChatSdkSpec {
  public static final String NAME = "ChatSdk";

  ChatSdkModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }


  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  @Override
  public void multiply(double a, double b, Promise promise) {
    Log.d(getName(), "multiply");
    promise.resolve(a * b);
  }

  @ReactMethod
  public void callMethod(String method, @Nullable ReadableMap args, Promise promise) {
    Log.d(getName(), "callMethod");
    promise.resolve(null);
  }

  @ReactMethod
  public void addListener(String eventName) {}

  @ReactMethod
  public void removeListeners(double count) {}

  @ReactMethod
  public void removeAllListeners() {}
}
