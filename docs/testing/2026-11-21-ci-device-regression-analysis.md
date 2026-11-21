# 1.21.0 CI 设备回归失败分析（2026-11-20 两次运行）

本文记录 `1.21.0` 分支 CI Device Regression 两次失败的完整排查结论，证据均来自原始运行日志并内联关键片段（Actions artifact 保留期 7 天，过期后以本文内联内容为准）。两个失败相互独立：

- **问题 1**:Android logged-in 10 个 `RN-CONV-*` 用例报 `[1] remove conversation is failed.` —— native SDK 4.25.1 登录后数据库未就绪窗口期的时序竞态。
- **问题 2**:`RN-GROUP-008` 报 `server config inviteNeedConfirm must be true` —— Android wrapper 群字段映射错误（确定性 bug，非服务端问题）。

## 来源

| 项 | 运行 A（首次失败） | 运行 B（复查失败） |
| --- | --- | --- |
| Run | [44705169878](https://github.com/easemob/react-native-chat-sdk/actions/runs/44705169878) | [44719871577](https://github.com/easemob/react-native-chat-sdk/actions/runs/44719871577) |
| 触发 | 2026-11-20T08:46:06Z workflow_dispatch | 2026-11-20T10:30:53Z workflow_dispatch |
| 分支 / HEAD | `1.21.0` / `dd54a32` | `1.21.0` / `684962f` |
| 失败 Job | Android logged-in lane `136185158328` | Android logged-in lane `136234945972` |
| Artifact | `rn-ci-device-android-logged-in-44705169878` | `rn-ci-device-android-logged-in-44719871577` |
| iOS 对照 | 同 run iOS logged-in（受网络问题干扰，不作对照） | 同 run iOS logged-in **全绿**,artifact `rn-ci-device-ios-logged-in-44719871577` |
| 5.1.0 对照 | 同时段 run [44705143902](https://github.com/easemob/react-native-chat-sdk/actions/runs/44705143902) **全绿** | — |

测试环境：appKey `easemob-demo#zuoyu`,REST 主机 `ngi-a1.easemob.com`,Android 登录用户 `zuoyu01_rn_android`,iOS 为 `zuoyu01_rn_ios`；原生依赖 Android `io.hyphenate:hyphenate-chat:4.25.1`、iOS HyphenateChat `~> 4.25.0`。

## 问题 1:deleteConversation 在 DB 未就绪窗口静默返回 false

### 现象

运行 B `android/base/api_test.log`:`RN-CONV-004/005/006/007/008/009/010/012/013/017` 共 10 例失败，全部为 `[1] remove conversation is failed.`,`counts pass=29 fail=10`。同 run iOS 全过；运行 A 同样的用例 `deleteConversation` 25/25 全部成功。

### 根因（字节码级确认）

反编译 Maven AAR `io.hyphenate:hyphenate-chat:4.25.1`(`javap -p -c`),`EMChatManager.deleteConversation(String, boolean)`:

```
0: aload_1
1: invokestatic  android/text/TextUtils.isEmpty
4: ifne          42
7: invokestatic  com/hyphenate/chat/EMClient.getInstance
10: invokevirtual com/hyphenate/chat/EMClient.isDatabaseOpened:()Z
13: ifne          19
16: goto          42        // DB 未打开 → 直接 return false
19: ... emaObject.removeConversation(...); iconst_1; ireturn
42: iconst_0
43: ireturn
```

- `mIsDBOpened` 仅在 `EMClient$MyConnectionListener.onDatabaseOpened` 中置 `true`,logout 时置 `false`。
- DB 未打开时该方法**在 Java 层直接返回 false，不进入 C++ 层、不产生任何 SDK 日志**;wrapper `modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java:630` 拿到 false 即报 `[1] remove conversation is failed.`，错误文案与真实删除失败无法区分。
- 5.1.0 AAR 同样字节码有相同检查，但其 DB open 为毫秒级（见对照），窗口实际不存在。

### 时序证据（运行 B,`android/base/logcat.log`，时间 UTC)

| 时间 | 事件（原始日志出处） |
| --- | --- |
| 10:37:18.706 | `callMethod: login` #1（用户 `zuoyu01_rn_android`) |
| 10:37:21.361 | `ONE SDK: EMConnectionListener onDatabaseOpened`(#1) |
| 10:37:21.379 | `EMWrapper: onSuccess: login` |
| 10:37:23.976 | `callMethod: logout`(RN-AUTH-003 用例内）→ `mIsDBOpened=false` |
| 10:37:23.987 | `callMethod: login` #2 |
| 10:37:25.971 | `onSuccess: login` #2 —— **此时无 onDatabaseOpened** |
| 10:37:26.810 | 首次 `callSdkApi: deleteConversation` → 同毫秒 `onError: 1: remove conversation is failed.`,**前后无 `EMConversationManager::removeConversation` C++ 日志** |
| 10:37:26.810–28.076 | 15 次 deleteConversation 全部同样失败（10 用例的 body/cleanup) |
| 10:37:36.565 | `EMConnectionListener onDatabaseOpened`(#2,**距 login 成功 10.6s**) |
| 10:38:02.097 起 | deleteConversation 恢复成功，且每次都有 3 行 C++ 日志：`EMChatManager::removeConversation` / `EMConversationManager::removeConversation` / `removeConversation : conversationId ...` |

窗口拉大的直接原因：登录后 SDK 在清理服务器侧积累的数百个已销毁群（`fetchMucSpecification:: retCode: 404` → `EMDatabase::removeGroup` 在 26.0–31.3s 持续刷屏）,DB open 回调被饿在后面。

### 对照

- 运行 A：相同 login→logout→login 流程，#2 `onDatabaseOpened` 在 08:52:59.341，距 login 仅 1.08s（赶在 login onSuccess 08:52:59.352 之前）,deleteConversation 25/25 成功。
- 5.1.0 run 44705143902:relogin 08:51:21.663 → `onDatabaseOpened` 08:51:21.668(5ms),0 失败。
- 结论：**时序竞态**——4.25.1 在 logout→login 后，`login` 成功回调先于 `onDatabaseOpened` 到达，期间 `deleteConversation`（及 `loadAllConversations`）静默失败；窗口时长取决于登录后同步清理工作量，服务器侧垃圾群越多窗口越大。

### 处置

- 测试侧（已落地）:`example/src/ci/support/login.ts` 的 `loginForCi` 末尾增加 DB 就绪探测（创建再删除探测会话 `ci_db_ready_probe`，直到 `deleteConversation` 成功）。所有 logged-in entry 与 RN-AUTH-003 的重登录都经此入口。
- 上报 native（建议提工单）:4.25.x `login` onSuccess 不保证 DB 就绪、`deleteConversation` 静默 false 且无日志；建议 native 保证 login 成功时 DB 已打开，或在未就绪时返回明确错误码与日志。
- 账号卫生：共享账号积累的大量已销毁群是窗口放大器，建议定期清理。

## 问题 2:RN-GROUP-008 —— Android wrapper 群字段映射错误（修正此前"服务端问题"结论）

### 现象

运行 A、B 的 Android logged-in group entry 均失败：`case RN-GROUP-008 failed (body): server config inviteNeedConfirm must be true`。同 run iOS 通过，5.1.0 分支通过。

用例逻辑（`example/src/ci/modules/group_cases.ts` `RN-GROUP-008`)：以 `inviteNeedConfirm: true, style: 2` 建群，再从服务器拉群详情断言 `options.inviteNeedConfirm === true`。

### 根因（修正结论）

`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:452`（群 → JSON 映射）:

```java
option.put("inviteNeedConfirm", group.isMemberAllowToInvite());
```

**`inviteNeedConfirm` 被映射自 `EMGroup.isMemberAllowToInvite()`（成员是否可邀请，另一个字段）**，因此 Android 上所有群 JSON 的 `inviteNeedConfirm` 恒为 `false`，与服务器存储值无关。logcat 中 `onSuccess: createGroup: {... inviteNeedConfirm=false ...}` 是 **wrapper 映射后的输出，不是服务器原始响应**——此前"服务端把 flag 归一化为 false"的判断据此修正：这是确定性的客户端映射 bug，凡是基于 4.25.1 的分支（`1.21.0`、`dev`)100% 复现。

4.25.1 的正确值在 `EMAGroupSetting.inviteNeedConfirm()`，但需经 package-private `EMBase.emaObject` 访问，无公开 getter（详见 `docs/testing/2026-11-20-ci-device-regression-fixes.md` 的"Android 待确认事项")。对照：5.1.0 分支同一文件 `:433` 为 `configs.put("inviteNeedConfirm", group.isInviteNeedConfirm())`(native 5.1.0 已提供公开 getter)，故通过；iOS 侧 684962f 已改为读 `settings.IsInviteNeedConfirm`，故通过。

### 证据（原始日志）

运行 B(`android/group/logcat.log`,UTC):

```
10:38:59.750 callSdkApi: createGroup: {options={ext=ci_group_1795171139749_1_invite_confirm, inviteNeedConfirm=true, style=2.0, isDisabled=false, maxCount=100.0}, ...}
10:39:00.358 onSuccess: createGroup: {owner=zuoyu01_rn_android, groupId=331111716683777, ..., options={ext=..., inviteNeedConfirm=false, isMemberOnly=true, ...}}
```

运行 A(`android/group/logcat.log`,UTC)——服务器再拉取同样为 false:

```
08:54:09.941  callSdkApi: createGroup: {options={..., inviteNeedConfirm=true, style=2.0, ...}}
08:54:10.434  onSuccess: createGroup: {groupId=331105121140738, ..., inviteNeedConfirm=false, ...}
08:54:12.307  onSuccess: getGroupSpecificationFromServer: {groupId=331105121140738, ..., inviteNeedConfirm=false, ...}
```

iOS 同 run B(`ios/group/simulator.log`，相同请求参数，响应为 true，用例通过）:

```
10:48:07.118 callSdkApi: createGroup, { options = { ext = "..."; inviteNeedConfirm = 1; isDisabled = 0; maxCount = 100; style = 2; }; }
10:48:07.700 onResult: createGroup, , { groupId = 331112290254852; ...; inviteNeedConfirm = 1; ... }
```

### 处置（已修复）

- 用户确认按方案②修复：新增同包桥接 `modules/java/com/hyphenate/chat/ExtSdkGroupBridge.java`，经 `EMBase.emaObject`（同包可访问 protected，不用反射）读取 `EMAGroupSetting.inviteNeedConfirm()`;`ExtSdkHelper.java` 的群 JSON 映射改走桥接。`1.21.0` 与 `dev` 均已应用，`5.1.0` 使用 native 公开 getter 不受影响。
- 后续若 native 4.25.x 暴露公开 getter（可向 native 团队提工单），桥接类即可删除。

## 复验方式

```bash
# 原始 artifact（保留期 7 天）
gh run download 44719871577 --repo easemob/react-native-chat-sdk \
  -n rn-ci-device-android-logged-in-44719871577
gh run download 44719871577 --repo easemob/react-native-chat-sdk \
  -n rn-ci-device-ios-logged-in-44719871577
gh run download 44705169878 --repo easemob/react-native-chat-sdk \
  -n rn-ci-device-android-logged-in-44705169878

# 问题 1：窗口期内外 deleteConversation 的成功/失败与 C++ 日志有无
grep -n 'callSdkApi: deleteConversation\|onSuccess: deleteConversation\|onError: 1: remove conversation' \
  */android/base/logcat.log
grep -n 'onDatabaseOpened\|callMethod: login\|callMethod: logout' */android/base/logcat.log

# 问题 2：建群请求 flag=true、wrapper 输出 flag=false（运行 B 与 iOS 对照）
grep -n 'invite_confirm' */android/group/logcat.log | head
grep -n 'inviteNeedConfirm' */ios/group/simulator.log | head

# 字节码复核（本机 gradle 缓存或重新下载 AAR）
javap -p -c com/hyphenate/chat/EMChatManager.class | \
  sed -n '/public boolean deleteConversation/,/^$/p'
```

代码侧复核：`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java:452`(`1.21.0`/`dev`）对比 `.worktree/5.1.0` 同文件 `:433`。
