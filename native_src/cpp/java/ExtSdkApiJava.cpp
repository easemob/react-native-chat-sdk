//
// Created by asterisk on 2022/3/3.
//

#include "ExtSdkApiJava.h"
#include "ExtSdkObjectJava.h"
#include "ExtSdkApi.h"
#include "ExtSdkJniHelper.h"
#include "ExtSdkConfig.h"
#include <jni.h>

EXT_SDK_NAMESPACE_BEGIN

static jclass jcls_ExtSdkDispatch;
static jmethodID jmid_getInstance;
static jmethodID jmid_callSdkApi;
static jmethodID jmid_addListener;
static jmethodID jmid_init;

void ExtSdkApiJava::initJni(JNIEnv* env) {
    if (!env)
        return;

    jclass jcls = env->FindClass("com/easemob/ext_sdk/dispatch/ExtSdkDispatch");
    if (jcls) {
        jcls_ExtSdkDispatch = (jclass)env->NewGlobalRef(jcls);
        env->DeleteLocalRef(jcls);
    }

    jmid_getInstance = env->GetStaticMethodID(jcls_ExtSdkDispatch, "getInstance",
                                                        "()Lcom/easemob/ext_sdk/dispatch/ExtSdkDispatch;");
    jmid_callSdkApi = env->GetMethodID(jcls_ExtSdkDispatch, "callSdkApi",
                                                 "(Ljava/lang/String;Ljava/lang/Object;Lcom/easemob/ext_sdk/common/ExtSdkCallback;)V");
    jmid_addListener = env->GetMethodID(jcls_ExtSdkDispatch, "addListener",
                                        "(Lcom/easemob/ext_sdk/common/ExtSdkListener;)V");
    jmid_init = env->GetMethodID(jcls_ExtSdkDispatch, "init", "(Ljava/lang/Object;)V");
}
void ExtSdkApiJava::unInitJni(JNIEnv* env) {
    if (jcls_ExtSdkDispatch) {
        env->DeleteGlobalRef(jcls_ExtSdkDispatch);
    }
    jmid_getInstance = 0;
    jmid_callSdkApi = 0;
    jmid_addListener = 0;
    jmid_init = 0;
}

void ExtSdkApiJava::init(const std::shared_ptr<ExtSdkObject> config) {
    JNIEnv *env = 0;
    env = ExtSdkJniHelper::getInstance()->attachCurrentThread();
    if (!env)
        return;
    jobject jobj = env->CallStaticObjectMethod(jcls_ExtSdkDispatch, jmid_getInstance);
    env->CallVoidMethod(jobj, jmid_init, jobject(nullptr));
}

void ExtSdkApiJava::addListener(const std::shared_ptr<ExtSdkObject> listener) {
    JNIEnv *env = 0;
    env = ExtSdkJniHelper::getInstance()->attachCurrentThread();
    if (!env)
        return;
    std::shared_ptr<ExtSdkObjectJava> java_listener = std::dynamic_pointer_cast<ExtSdkObjectJava>(
            listener);
    jobject jobj = env->CallStaticObjectMethod(jcls_ExtSdkDispatch, jmid_getInstance);
    env->CallVoidMethod(jobj, jmid_addListener, java_listener->obj);
    env->DeleteLocalRef(jobj);
}

void ExtSdkApiJava::delListener(const std::shared_ptr<ExtSdkObject> listener) {

}

void
ExtSdkApiJava::callSdkApi(const std::string &methodType, const std::shared_ptr<ExtSdkObject> params,
                          const std::shared_ptr<ExtSdkObject> callback) {
    JNIEnv *env = 0;
    env = ExtSdkJniHelper::getInstance()->attachCurrentThread();
    if (!env)
        return;
    std::shared_ptr<ExtSdkObjectJava> java_params = std::dynamic_pointer_cast<ExtSdkObjectJava>(
            params);
    std::shared_ptr<ExtSdkObjectJava> java_callback = std::dynamic_pointer_cast<ExtSdkObjectJava>(
            callback);
    jstring java_method_type = env->NewStringUTF(methodType.c_str());
    jobject jobj = env->CallStaticObjectMethod(jcls_ExtSdkDispatch, jmid_getInstance);
    env->CallVoidMethod(jobj, jmid_callSdkApi, java_method_type, java_params->obj,
                        java_callback->obj);
    env->DeleteLocalRef(jobj);
    env->DeleteLocalRef(java_method_type);
}

void ExtSdkApiJava::unInit() {

}

EXT_SDK_NAMESPACE_END

extern "C"
JNIEXPORT void JNICALL
Java_com_easemob_ext_1sdk_jni_ExtSdkApiJni_nativeInit(JNIEnv *env, jclass clazz,
                                                      jobject configures) {
    EXT_SDK_NAMESPACE_USING
    std::shared_ptr<ExtSdkObject> java_config = std::make_shared<ExtSdkObjectJava>(configures);
    ExtSdkApi::getInstance()->init(java_config);
}
extern "C"
JNIEXPORT void JNICALL
Java_com_easemob_ext_1sdk_jni_ExtSdkApiJni_nativeAddListener(JNIEnv *env, jclass clazz,
                                                             jobject listener) {
    EXT_SDK_NAMESPACE_USING
    std::shared_ptr<ExtSdkObject> java_listener = std::make_shared<ExtSdkObjectJava>(listener);
    ExtSdkApi::getInstance()->addListener(java_listener);
}
extern "C"
JNIEXPORT void JNICALL
Java_com_easemob_ext_1sdk_jni_ExtSdkApiJni_nativeDelListener(JNIEnv *env, jclass clazz,
                                                             jobject listener) {
    EXT_SDK_NAMESPACE_USING
    std::shared_ptr<ExtSdkObject> java_listener = std::make_shared<ExtSdkObjectJava>(listener);
    ExtSdkApi::getInstance()->delListener(java_listener);
}
extern "C"
JNIEXPORT void JNICALL
Java_com_easemob_ext_1sdk_jni_ExtSdkApiJni_nativeCallSdkApi(JNIEnv *env, jclass clazz,
                                                            jstring method_type, jobject params,
                                                            jobject callback) {
    EXT_SDK_NAMESPACE_USING
    std::shared_ptr<ExtSdkObject> java_params = std::make_shared<ExtSdkObjectJava>(params);
    std::shared_ptr<ExtSdkObject> java_callback = std::make_shared<ExtSdkObjectJava>(callback);
    const char *java_method_type = env->GetStringUTFChars(method_type, 0);
    ExtSdkApi::getInstance()->callSdkApi(java_method_type, java_params, java_callback);
}
extern "C"
JNIEXPORT void JNICALL
Java_com_easemob_ext_1sdk_jni_ExtSdkApiJni_nativeUnInit(JNIEnv *env, jclass clazz) {
    EXT_SDK_NAMESPACE_USING
    ExtSdkApi::getInstance()->unInit();
}
extern "C"
JNIEXPORT jint JNICALL
Java_com_easemob_ext_1sdk_common_ExtSdkTypeUtil_nativeCurrentPlatform(JNIEnv *env, jclass clazz) {
    EXT_SDK_NAMESPACE_USING
    return (jint) ExtSdkConfig::current_platform_type;
}
extern "C"
JNIEXPORT jint JNICALL
Java_com_easemob_ext_1sdk_common_ExtSdkTypeUtil_nativeCurrentArchitecture(JNIEnv *env,
                                                                          jclass clazz) {
    EXT_SDK_NAMESPACE_USING
    return (jint) ExtSdkConfig::current_architecture_type;
}