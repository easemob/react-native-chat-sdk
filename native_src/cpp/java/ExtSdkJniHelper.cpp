//
// Created by asterisk on 2022/3/3.
//

#include "ExtSdkJniHelper.h"
#include "ExtSdkApiJava.h"
#include "ExtSdkLog.h"
#include <pthread.h>

EXT_SDK_NAMESPACE_BEGIN

static JavaVM *gvm = NULL;
static pthread_key_t gkey = 0;

ExtSdkJniHelper *ExtSdkJniHelper::getInstance() {
    static ExtSdkJniHelper ghelper;
    return &ghelper;
}

void ExtSdkJniHelper::init(JavaVM *vm) {
    gvm = vm;
}

void ExtSdkJniHelper::unInit(JavaVM *vm) {
    gvm = NULL;
}

JNIEnv *ExtSdkJniHelper::attachCurrentThread() {
    JNIEnv *env = 0;
    if (!gvm)
        return env;
    if (gvm->GetEnv((void **) &env, JNI_VERSION_1_6) == JNI_OK)
        return env;
    if (0 > gvm->AttachCurrentThread(&env, NULL)) {
        ALOGW("env attach current thread is failed.");
        return env;
    }
    pthread_key_create(&gkey, ExtSdkJniHelper::_destructor);
    if (pthread_getspecific(gkey) == NULL) {
        pthread_setspecific(gkey, env);
    }
    return env;
}

void ExtSdkJniHelper::detachCurrentThread() {
    if (gvm)
        gvm->DetachCurrentThread();
}

void ExtSdkJniHelper::_destructor(void *p) {
    ExtSdkJniHelper::getInstance()->detachCurrentThread();
}

EXT_SDK_NAMESPACE_END

/*
* processing one time initialization:
*     Cache the javaVM into our context
*     Find class ID for ExtSdkJniHelper
*     Create an instance of ExtSdkJniHelper
*     Make global reference since we are using them from a native thread
* Note:
*     All resources allocated here are never released by application
*     we rely on system to free all global refs when it goes away;
*     the pairing function JNI_OnUnload() never gets called at all.
*/
JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *reserved) {

    JNIEnv *env = 0;
    if (vm && vm->GetEnv((void **) &env, JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR; // JNI version not supported.
    }

    EXT_SDK_NAMESPACE_USING
    ExtSdkJniHelper::getInstance()->init(vm);
    ExtSdkApiJava::initJni(env);

    return JNI_VERSION_1_6;
}

JNIEXPORT void JNI_OnUnload(JavaVM *vm, void *reserved) {
    EXT_SDK_NAMESPACE_USING
    JNIEnv *env = 0;
    env = ExtSdkJniHelper::getInstance()->attachCurrentThread();
    if (!env)
        return;

    ExtSdkJniHelper::getInstance()->unInit(vm);
    ExtSdkApiJava::unInitJni(env);
}