package com.chatsdk;

import com.facebook.react.bridge.ReactApplicationContext;

public abstract class ChatSdkSpec extends NativeChatSdkSpec {
  protected ChatSdkSpec(ReactApplicationContext context) {
    super(context);
  }
}
