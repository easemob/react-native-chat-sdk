package com.easemob.ext_sdk.common;

import android.os.Handler;
import android.os.Looper;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ExtSdkThreadUtil {
    public static void asyncExecute(Runnable runnable) {
//        asyncThreadPool.submit(runnable);
        asyncThreadPool.execute(runnable);
//        runnable.run();
    }

    public static void mainThreadExecute(Runnable runnable) {
        mainThreadHandler.post(runnable);
//        runnable.run();
    }

    private static String TAG = "ExtSdkThreadUtil";
    private static ExecutorService asyncThreadPool = Executors.newCachedThreadPool();
    private static Handler mainThreadHandler = new Handler(Looper.getMainLooper());
}
