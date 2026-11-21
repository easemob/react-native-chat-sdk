package com.chatsdk.common;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface ExtSdkCallback<T> {
    /**
     * Success callback.
     * @param data Optional. The data.
     */
    void success(@Nullable T data);

    /**
     * Failure callback.
     * @param code Required. The error code.
     * @param ext Optional. Extra information.
     */
    void fail(@NonNull int code, @Nullable Object ext);
}
