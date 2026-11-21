package com.hyphenate.chat;

import com.hyphenate.chat.adapter.EMAGroup;
import com.hyphenate.chat.adapter.EMAGroupSetting;

/**
 * Read bridge for HyphenateChat 4.25.x: EMGroup exposes no public
 * inviteNeedConfirm getter; the value lives in EMAGroupSetting behind the
 * protected EMBase.emaObject. Same-package access avoids reflection. A
 * future SDK that exposes a public getter makes this bridge obsolete.
 */
public class ExtSdkGroupBridge {
    public static boolean isInviteNeedConfirm(EMGroup group) {
        EMAGroup emaGroup = group.emaObject;
        if (emaGroup == null) {
            return false;
        }
        EMAGroupSetting setting = emaGroup.groupSetting();
        return setting != null && setting.inviteNeedConfirm();
    }
}
