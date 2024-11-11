package com.chatsdk;

import androidx.annotation.Nullable;

import com.chatsdk.rn.ExtSdkApiRN;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;

import java.util.HashMap;
import java.util.Map;

public class ChatSdkPackage extends TurboReactPackage {

  static {
    System.loadLibrary("ext_sdk");
  }

  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    if (name.equals(ChatSdkModule.NAME)) {
      return new ExtSdkApiRN(reactContext);
//      return new ChatSdkModule(reactContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      moduleInfos.put(
              ChatSdkModule.NAME,
              new ReactModuleInfo(
                      ChatSdkModule.NAME,
                      ChatSdkModule.NAME,
                      false, // canOverrideExistingModule
                      false, // needsEagerInit
                      true, // hasConstants
                      false, // isCxxModule
                      isTurboModule // isTurboModule
      ));
      return moduleInfos;
    };
  }
}
