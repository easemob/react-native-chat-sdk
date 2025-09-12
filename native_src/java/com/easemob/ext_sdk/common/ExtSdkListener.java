package com.easemob.ext_sdk.common;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface ExtSdkListener {

    /**
     * 接收消息
     * @param methodType 监听器具体方法
     * @param data 携带的数据，选填
     */
    void onReceive(@NonNull String methodType, @Nullable Object data);

    /**
     * 设置监听器类型
     * @param listenerType 参考`ExtSdkListenerType`
     */
    void setType(@NonNull String listenerType);

    /**
     * 获取监听器类型
     */
    void getType();
}
