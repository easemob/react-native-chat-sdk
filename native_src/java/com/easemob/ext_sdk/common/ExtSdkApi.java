package com.easemob.ext_sdk.common;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface ExtSdkApi {
    /**
     * 初始化SDK
     * @param config 配置信息，必填
     */
    void init(@NonNull Object config);

    /**
     * 反初始化SDK
     * @param params 选填
     */
    void unInit(@Nullable Object params);

    /**
     * 添加监听器
     * @param listener
     */
    void addListener(@NonNull ExtSdkListener listener);

    /**
     * 删除监听器
     * @param listener
     */
    void delListener(@NonNull ExtSdkListener listener);

    /**
     * 调用者: 适配层接口
     * 被调用者: C++接口
     * 不同框架(flutter, react-native, unity etc.)参数和回调可能都不相同。
     * 向服务器请求类型的调用请使用此api
     *
     * @param methodType 必填，具体方法类型名称
     * @param params     选填，后续确定。可以是空，map，json, pb字符串等。
     * @param callback   选填，不关注结果可以为空
     */
    void callSdkApi(@NonNull String methodType, @Nullable Object params, @NonNull ExtSdkCallback callback);
}
