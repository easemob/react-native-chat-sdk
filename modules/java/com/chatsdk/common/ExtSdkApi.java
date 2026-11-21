package com.chatsdk.common;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface ExtSdkApi {
    /**
     * Initializes the SDK.
     * @param config The configuration. Required.
     */
    void init(@NonNull Object config);

    /**
     * Uninitializes the SDK.
     * @param params Optional.
     */
    void unInit(@Nullable Object params);

    /**
     * Adds a listener.
     * @param listener
     */
    void addListener(@NonNull ExtSdkListener listener);

    /**
     * Removes a listener.
     * @param listener
     */
    void delListener(@NonNull ExtSdkListener listener);

    /**
     * Caller: the adapter-layer interface.
     * Callee: the C++ interface.
     * Parameters and callbacks may differ across frameworks (flutter, react-native, unity etc.).
     * Use this api for calls that send requests to the server.
     *
     * @param methodType Required. The concrete method type name.
     * @param params     Optional, to be defined. Can be empty, a map, json, a pb string, etc.
     * @param callback   Optional; can be null if the result is not needed.
     */
    void callSdkApi(@NonNull String methodType, @Nullable Object params, @NonNull ExtSdkCallback callback);
}
