package com.easemob.ext_sdk.common;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface ExtSdkCallback<T> {
    /**
     * 成功回调
     * @param data 选填，参数
     */
    void success(@Nullable T data);

    /**
     * 失败回调
     * @param code 必填，错误码
     * @param ext 选填，扩展信息
     */
    void fail(@NonNull int code, @Nullable Object ext);
}
