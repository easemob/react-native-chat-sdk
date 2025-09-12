package com.easemob.ext_sdk.rn;

import android.net.Uri;
import android.os.Build;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class ExtSdkMapHelperRN {

    public void toWritableMap(Map<String, Object> data, WritableMap result) {
        this.toWritableMap(data, result, 0);
    }

    public void toWritableMap(Map<String, Object> data, WritableMap result, int depth) {
        if (MAX_COUNT < depth) {
            throw new RuntimeException("Too many recursions. " + depth);
        }
        ++depth;
        Iterator<Map.Entry<String, Object>> iterator = data.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Object> entry = iterator.next();
            String key = entry.getKey();
            Object value = entry.getValue();
            if (value == null) {
                result.putNull(key);
                continue;
            }
            Class valueClass = value.getClass();
            if (valueClass == Boolean.class) {
                result.putBoolean(key, ((Boolean) value).booleanValue());
            } else if (value instanceof Number) {
                if (valueClass == Integer.class) {
                    result.putInt(key, ((Integer) value).intValue());
                } else if (valueClass == Double.class) {
                    result.putDouble(key, ((Double) value).doubleValue());
                } else if (valueClass == Float.class) {
                    result.putDouble(key, ((Float) value).doubleValue());
                } else if (valueClass == Long.class) {
                    result.putDouble(key, ((Long) value).longValue());
                } else if (valueClass == Short.class) {
                    result.putInt(key, ((Short) value).shortValue());
                } else {
                    result.putInt(key, ((Integer) value).intValue());
                }
            } else if (value instanceof String) {
                result.putString(key, value.toString());
            } else if (value instanceof android.net.Uri) {
                result.putString(key, value.toString());
            } else if (value instanceof Map) {
                WritableMap m = Arguments.createMap();
                toWritableMap((Map<String, Object>) value, m, depth);
                result.putMap(key, (WritableNativeMap) m);
            } else if (value instanceof Object[]) {
                WritableNativeArray a = Arguments.fromJavaArgs(new Object[0]);
                toWritableArray((Object[]) value, a, depth);
                result.putArray(key, (WritableNativeArray) a);
            } else if (value instanceof List) {
                WritableNativeArray a = Arguments.fromJavaArgs(new Object[0]);
                toWritableArray((Object[]) ((List<?>) value).toArray(), a, depth);
                result.putArray(key, (WritableNativeArray) a);
            } else {
                throw new RuntimeException("Cannot convert argument of type " + value + " " + valueClass);
            }
        }
    }

    protected void toWritableArray(Object[] data, WritableNativeArray result) {
        toWritableArray(data, result, 0);
    }

    protected void toWritableArray(Object[] data, WritableNativeArray result, int depth) {
        if (MAX_COUNT < depth) {
            throw new RuntimeException("Too many recursions. " + depth);
        }
        ++depth;
        for (int i = 0; i < data.length; i++) {
            Object value = data[i];
            if (value == null) {
                result.pushNull();
                continue;
            }
            Class valueClass = value.getClass();
            if (valueClass == Boolean.class) {
                result.pushBoolean(((Boolean) value).booleanValue());
            } else if (value instanceof Number) {
                if (valueClass == Integer.class) {
                    result.pushInt(((Integer) value).intValue());
                } else if (valueClass == Double.class) {
                    result.pushDouble(((Double) value).doubleValue());
                } else if (valueClass == Float.class) {
                    result.pushDouble(((Float) value).doubleValue());
                } else if (valueClass == Long.class) {
                    result.pushDouble(((Long) value).longValue());
                } else if (valueClass == Short.class) {
                    result.pushInt(((Short) value).shortValue());
                } else {
                    result.pushInt(((Integer) value).intValue());
                }
            } else if (value instanceof String) {
                result.pushString(value.toString());
            } else if (value instanceof android.net.Uri) {
                result.pushString(value.toString());
            } else if (value instanceof Map) {
                WritableMap m = Arguments.createMap();
                toWritableMap((Map<String, Object>) value, m, depth);
                result.pushMap((WritableNativeMap) m);
            } else if (value instanceof Object[]) {
                WritableNativeArray a = Arguments.fromJavaArgs(new Object[0]);
                toWritableArray((Object[]) value, a, depth);
                result.pushArray((WritableNativeArray) a);
            } else if (value instanceof List) {
                WritableNativeArray a = Arguments.fromJavaArgs(new Object[0]);
                toWritableArray((Object[]) ((List<?>) value).toArray(), a, depth);
                result.pushArray((WritableNativeArray) a);
            } else {
                throw new RuntimeException("Cannot convert argument of type " + value + " " + valueClass);
            }
        }
    }

    private static final int MAX_COUNT = 50;
}
