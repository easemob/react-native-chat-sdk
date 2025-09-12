package com.easemob.ext_sdk.flutter;

import androidx.annotation.NonNull;

import java.util.HashMap;

import io.flutter.plugin.common.BinaryMessenger;
import io.flutter.plugin.common.JSONMethodCodec;
import io.flutter.plugin.common.MethodChannel;

/**
 * 通道管理器
 */
public class ExtSdkChannelManager {

    public class ExtSdkChannelName {
        public static final String SEND_CHANNEL = "com.chat.im.ext.dart_to_native";
        public static final String RECV_CHANNEL = "com.chat.im.ext.native_to_dart";
    }

    private static class SingleHolder {
        static ExtSdkChannelManager instance = new ExtSdkChannelManager();
    }

    public static ExtSdkChannelManager getInstance() {
        return ExtSdkChannelManager.SingleHolder.instance;
    }

    public boolean add(@NonNull BinaryMessenger messenger, @NonNull String name) {
        MethodChannel channel = list.get(name);
        if (channel == null) {
            channel = new MethodChannel(messenger, name, JSONMethodCodec.INSTANCE);
            list.put(name, channel);
            return true;
        }
        return false;
    }
    public void del(@NonNull String name) {
        list.remove(name);
    }
    public MethodChannel get(@NonNull String name) {
        return list.get(name);
    }
    private HashMap<String, MethodChannel> list = new HashMap<>();
}


