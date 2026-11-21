package com.chatsdk.common;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface ExtSdkListener {

    /**
     * Receives a message.
     * @param methodType The specific listener method.
     * @param data The carried data. Optional.
     */
    void onReceive(@NonNull String methodType, @Nullable Object data);

    /**
     * Sets the listener type.
     * @param listenerType See `ExtSdkListenerType`.
     */
    void setType(@NonNull String listenerType);

    /**
     * Gets the listener type.
     */
    void getType();
}
