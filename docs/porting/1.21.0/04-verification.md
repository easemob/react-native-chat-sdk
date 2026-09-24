# 04 - 验证记录：React Native 1.21.0

验证日期：2026-09-10。环境：worktree `.worktree/1.21.0`（分支 1.21.0）。native 4.25.0 未发布到 maven/CocoaPods，example 构建验证走本地依赖覆盖（`rn-local-deps.sh apply`，验证后已 restore 且零残留）。

## 验证结果总表

| 验证项 | 结果 | 失败原因/备注 |
|---|---|---|
| `yarn typecheck` | ✅ | |
| `yarn lint` | ✅ | 含 prettier |
| `yarn check:circular:dpdm` | ✅ | 1 条存量 warning（skip `react-native/index.js`），基线即有 |
| `yarn test --no-watchman`（unit+contract） | ✅ | 19 suites / 121 tests 全过；契约测试强制 TS↔Java↔ObjC 方法名 parity，新 key 通过 |
| `yarn prepare`（bob build + gen 文件） | ✅ | `lib/` 正常产出 |
| example 构建 Android（`yarn example build:android`，本地依赖） | ✅ | BUILD SUCCESSFUL 1m15s；aab 含 `libhyphenate.so`（24B 占位 stub，官网包既有行为，见 references）+ `libaosl.so`（arm64-v8a，脚本单 ABI 构建配置） |
| example 构建 iOS（`yarn example build:ios`，本地依赖） | ✅ | 首次失败：bundler 找不到 Gemfile.lock 钉住的 gems（环境问题）；`bundle install` 后重试成功 |
| iOS 本地依赖实证 | ✅ | `pod install` 后 Podfile.lock 中 HyphenateChat 消失、ShengwangInfra_iOS(1.3.5) 出现；`.app/Frameworks/` 内本地 `HyphenateChat.framework`（CFBundleShortVersionString=4.25.0）+ `aosl.framework` |
| 契约要素 grep 逐字抽查 | ✅ | 见下节 |
| API 脚本实机回归（fetchConversationsFromDB） | ✅ | 双端各 5 步全过（2026-09-10，真实 appKey/账号，本地依赖+真 so）。脚本：init（`autoLoadConversations:false` 注入）→ login（zuoyu01）→ sendMessage×2（造会话）→ page1（pageSize 1）→ page2（`$step.page1.cursor` 翻页）→ 无效 cursor。Android（emulator-5554）：全过，page 返回 `{cursor, list}` 结构正确，无效 cursor 返回 110 `invalid cursor for getConversationsFromDB`；iOS（iPhone 16 Pro 模拟器）：全过，实际翻页取到不同会话（page1=zuoyu02、page2=zuoyu01，返回真实游标 `eyJpc3RvcCI6...`），无效 cursor 同样 110。日志 `/tmp/rn_425_android.log`、`/tmp/rn_425_ios.log`；脚本 `/tmp/rn_425_convdb.json`（内联路径 Android `/data/local/tmp/rn_425_convdb.json`、iOS 同 host 路径，jsbundle strings 实证未中 metro 缓存毒化） |

实机回归备注：

- Android 运行前需把官网包 24B 占位 `libhyphenate.so` 替换为 `easemob-sdk-symbolLibs-4.25.0.zip` 内真 so（4 ABI 全替换），否则运行时不可用（编译不受影响）。
- 首跑 login 报 200 "The user is already logged in"（模拟器残留登录态，auto 模式重试不覆盖该码），卸载应用清数据后通过；同 Flutter KI 系经验。
- 观察（非缺陷）：自发消息建会话在双端时序不同——iOS page1 时自建会话尚未落库（page2 才出现），Android 回归窗口内未见自建会话；不影响分页机制验证。

## 契约要素 grep 实证

方法名 key `getConversationsFromDBWithCursor`：

| 位置 | 证据 |
|---|---|
| TS `src/__internal__/Consts.ts:120-121` | `MTgetConversationsFromDBWithCursor = 'getConversationsFromDBWithCursor'` |
| Java `ExtSdkMethodType.java:107` | `"getConversationsFromDBWithCursor"` |
| ObjC `ExtSdkMethodTypeObjc.h:116` | key 常量；`:517` Value=546 |
| ObjC `ExtSdkMethodTypeObjc.m:342` | methodMap 映射 key→546 |
| ObjC `ExtSdkDispatch.m:1023` | case 分发 |
| cpp `ExtSdkMethodType.cpp:66` | 常量定义 |

配置项 key 计数（声明+params+赋值+withAppId+withAppKey / fromJson+toJson 各成对）：

- `enableChatroomConversation`：ChatOptions.ts×6、ExtSdkHelper.java×2、ExtSdkToJson.m×2 ✅
- `autoLoadConversations`：ChatOptions.ts×5、ExtSdkHelper.java×2、ExtSdkToJson.m×2 ✅
- `useAgoraChatDomain`：`src/`、`modules/`、`example/src/` grep 0 匹配 ✅（KI-107 零残留）

参数/返回：TS 包装 `{getConversationsFromDBWithCursor: {cursor, pageSize}}`；Android `optString("cursor")`/`optInt("pageSize")` → `asyncGetConversationsFromDB(cursor, pageSize, ...)`（顺序经 native 源码核实）；iOS `param[@"cursor"]`/`integerValue` → `getConversationsFromDBWithCursor:pageSize:`；返回 `{cursor, list}` 双端序列化同构（`ExtSdkCursorResultHelper.toJson` / `EMCursorResult toJsonObject`）。

## 版本互核

- `package.json` 1.21.0 = `src/version.ts`（gen）1.21.0 = `example/package.json` 1.21.0 = versionName/MARKETING_VERSION 1.21.0；versionCode/CURRENT_PROJECT_VERSION 2→3 ✅
- native 依赖三处 4.25.0（`android/build.gradle:91`、`ChatSdk.podspec:53` SPM、`:57` CocoaPods）✅
- CHANGELOG 双语 `## 1.21.0` 就位 ✅

## gate 留痕（阶段四必跑命令输出）

```json
{"decision": "block", "reason": "平版门禁检查未过（修复后再收尾；确认为合理差异时，说明理由后可结束）：key 在 TS(Consts) 有、Java(ExtSdkMethodType) 缺失: updateAPNsPushToken ；key 在 TS(Consts) 有、ObjC(ExtSdkMethodTypeObjc) 缺失: getNoDisturbUsersFromServer onMessageStatusChanged updateCurrentUserNick updateFCMPushToken updateHMSPushToken ；"}
```

与阶段二基线输出逐字相同：仅 6 个存量 deprecated key（`Consts.ts` 均有 `// deprecated` 标注，契约测试经 stripDeprecated 剔除），**本次新增 key 零 flag**，版本一致性检查通过。判定为脚本口径差异（不剔除 deprecated），合理差异。

## 本地依赖覆盖与还原

- apply：`rn-local-deps.sh apply`（因两个依赖文件含平版 bump 的未提交改动，按脚本提示用 `LOCAL_DEPS_ALLOW_DIRTY=1`，属 porting 流标准用法）。
- restore：脚本 restore 后 `LOCAL-DEP-TEST` 标记 grep 0 残留、`android/libs/` 与 `framework/` 已删、`.git/info/exclude` 已清理、example/ios 全部还原（Podfile.lock 无 diff）。
- ⚠️ 发现的脚本行为（记入问题清单）：restore 的 `git checkout` 会连带还原这两个文件与 `example/ios/` 中**有意的未提交改动**（本次的 4.25.0 bump 与 pbxproj 版本号被一并回退，已手工重新施加并复核）。建议 skill 脚本在 `LOCAL_DEPS_ALLOW_DIRTY=1` 场景改为锚点反向替换而非 `git checkout`。

## 自检清单（references/react-native.md）

- MT 常量三处一致 ✅（契约测试强制 + grep 抽查）
- 事件聚合 key 与 type：本次无新事件，N/A
- TS 参数 key 与 native 读取 key 一致 ✅（cursor/pageSize）
- 枚举值与原生映射：无新枚举，N/A
- 返回结构可被 TS 反序列化 ✅（`ChatCursorResult<ChatConversation>` 既有模式）
- 新类型进入 `src/index.ts` 导出：无新类型（`ChatCursorResult`/`ChatConversation` 已导出，方法挂在既有 `ChatManager`），N/A
- 版本对齐（package.json/example 三处/podspec 两处/gradle/双语 CHANGELOG）✅
- 附件/下载类新 API 实机验证：本次无此类 API，N/A

---

# 补录（2026-09-24）：iOS PushKit 回移验证

对应 `06-pushkit-backport.md` / `02-contract.md` 补录节 / `03-implementation.md` 补录节。

## 1. 静态检查

| 验证项 | 结果 | 备注 |
|---|---|---|
| `yarn test --no-watchman` | ✅ | 19 suites / 121 tests 全通过（与基线同数；本次为薄封装 API，无新增用例，符合仓库「不加 pass-through 测试」纪律） |
| `yarn typecheck` | ✅ | 无输出 |
| `yarn lint` | ✅ | 无输出 |
| `yarn check:circular:dpdm` | ✅ | `no circular dependency was found` |
| `yarn prepare` | ✅ | `src/version.ts` / `modules/cpp/CMakeLists.txt` / `example/src/env.ts` 生成成功，bob build 通过（worktree 首次需要） |

## 2. 契约要素逐字 grep 抽查

### 2.1 方法名 key（五处 + dispatch/wrapper）

命令：`grep -c 'bindPushKitToken' <文件>`，逐文件核对取值均为字面量 `bindPushKitToken` / `unbindPushKitToken`。

| 层 | 文件 | 结果 |
|---|---|---|
| TS | `src/__internal__/Consts.ts:24-25` | ✅ `MTbindPushKitToken = 'bindPushKitToken'`、`MTunbindPushKitToken = 'unbindPushKitToken'` |
| Java 常量 | `modules/java/com/chatsdk/common/ExtSdkMethodType.java:23-25` | ✅ 同值 |
| ObjC key | `modules/objc/common/ExtSdkMethodTypeObjc.h:22-24` | ✅ 同值 |
| ObjC methodMap | `modules/objc/common/ExtSdkMethodTypeObjc.m:38-40` | ✅ 两条映射齐备 |
| ObjC dispatch | `modules/objc/dispatch/ExtSdkDispatch.m:115-121` | ✅ 两个 case |
| Java dispatch | `modules/java/com/chatsdk/dispatch/ExtSdkDispatch.java:121-130` | ✅ 两个 case |
| iOS wrapper | `modules/objc/dispatch/ExtSdkClientWrapper.{h,m}` | ✅ 声明 + 实现 |
| Android wrapper | `modules/java/com/chatsdk/dispatch/ExtSdkClientWrapper.java:325-333` | ✅ 两个方法 |
| cpp 透传 | `modules/cpp/common/ExtSdkMethodType.{h,cpp}` | ✅ 两个常量（该层整体滞后，KI-105，按仓库规范补齐） |

契约测试本身（`src/__tests__/contract/methodNames.test.ts`）强制「TS `MT*` ⊆ Java 常量值 ⊆ ObjC header key 值」，121 tests 全绿即该约束通过。

### 2.2 初始化选项 key

| 层 | 文件 | 结果 |
|---|---|---|
| TS 字段 | `src/common/ChatOptions.ts:128,134` | ✅ `apnsCertName` / `pushKitCertName` |
| TS 5 处同步 | 声明 + params + 赋值 + `withAppId` + `withAppKey` | ✅ grep 计数各 5 处（:128/134、:340/341、:393/394、:444/445、:495/496） |
| iOS fromJson | `modules/objc/dispatch/ExtSdkToJson.m:1310,1313` | ✅ 两个 key 映射到 `EMOptions.apnsCertName` / `.pushKitCertName` |
| iOS toJson | `modules/objc/dispatch/ExtSdkToJson.m:1252-1253` | ✅ 对称回写 |
| Android | `ExtSdkHelper.java` | ✅ **有意不改**：Android native 无该能力（`EMOptions.java` 无对应属性） |

### 2.3 Value 编号撞号核查

- 新增 `ExtSdkMethodKeyBindPushKitTokenValue = 1027`、`ExtSdkMethodKeyUnbindPushKitTokenValue = 1028`（`ExtSdkMethodTypeObjc.h:708-709`），接在 push 段已用最大号 1026 之后。
- 全文件扫描 `Value = N` 重复项：**仅 611 一处重复，且为存量问题**（`ExtSdkMethodKeyOnMessagesRecalledInfoValue` :535 与 `ExtSdkMethodKeyOnStreamMessagesReceivedValue` :807，两个都是事件 key，均不参与 dispatch switch）。本次新增值无撞号。
- 存量 611 重复记入验收报告问题清单，本次不修（不在范围内）。

## 3. 原生依赖与发布产物核实

| 验证项 | 结果 | 备注 |
|---|---|---|
| `ChatSdk.podspec` 两处版本 | ✅ | SPM `minimumVersion: '4.25.0'`(:53)、CocoaPods `~> 4.25.0`(:57) |
| `android/build.gradle` | ✅ | `io.hyphenate:hyphenate-chat:4.25.1`(:91) |
| CocoaPods trunk 可解析 4.25.0 | ✅ | `pod update HyphenateChat` 成功；`Podfile.lock` 由 4.24.1 更新为 `HyphenateChat (4.25.0)`（checksum `ea10cee2…`） |
| 发布头文件含 PushKit API | ✅ | `Pods/HyphenateChat/.../Headers/EMClient.h:753,776,825` 有 `bindPushKitToken:` / `registerPushKitToken:completion:` / `unRegisterPushKitTokenWithCompletion:`；`EMOptions.h:290,305` 有 `apnsCertName` / `pushKitCertName` |
| 发布头文件含证书名属性 | ✅ | 同上 |

> 说明：`example/ios/Podfile.lock` 由 4.24.1 更新为 4.25.0 属**修复既有不一致**——该 lock 文件被 git 跟踪，而 1.21.0 的 native 依赖 bump 只改了 podspec，未同步 lock，导致 `pod install` 直接报 "could not find compatible versions"。本次一并修正。

## 4. 构建验证

| 验证项 | 结果 | 备注 |
|---|---|---|
| example Android（`yarn example build:android`） | ✅ | `BUILD SUCCESSFUL in 1m 40s`，245 tasks |
| Android 产物含新路由（反编译） | ✅ | `javap -p android/build/intermediates/.../ExtSdkClientWrapper.class` 输出 `public void bindPushKitToken(JSONObject, String, ExtSdkCallback)` 与 `unbindPushKitToken(...)`，证明 Java 侧（含 `EMError` 导入）真实编译进产物 |
| example iOS（`yarn example build:ios`） | 见下节 | |

## 5. 实机功能验证

| 验证项 | 结果 | 备注 |
|---|---|---|
| PushKit 真机绑定/解绑回归 | ⏭️ 未执行 | 需要真实 APNs + PushKit 证书、iOS 真机（模拟器不支持 VoIP push）与 `PKPushRegistry` 直连凭据，本环境不具备。按纪律改由静态证据链覆盖：发布头文件 API 存在（§3）+ iOS 编译通过（§4）+ dispatch/methodMap/常量三处 grep 一致（§2）。交用户在真机环境补验 |
| Android 非法调用路径（预期 111） | ⏭️ 未执行 | TS 侧 `Platform.OS !== 'ios'` 守卫使该路径在 RN 中不可达；`smoke_local.sh` 冒烟脚本覆盖的是各 manager 的未登录路径，不含跨端非法调用。若要固化，需在 `example/ci/no_login_smoke.json` 加一条绕过 TS 守卫的直连用例，属额外范围，交用户决策（D-3） |

### 4.1 构建结果补记

| 验证项 | 结果 | 备注 |
|---|---|---|
| example iOS（`yarn example build:ios`） | ✅ | `success Successfully built the app`；含 Pods 重新集成后的完整编译与链接 |

iOS 构建覆盖点：`modules/objc/common/ExtSdkMethodTypeObjc.{h,m}`（key/Value/methodMap）、`modules/objc/dispatch/ExtSdkDispatch.m`（两个 case）、`ExtSdkClientWrapper.{h,m}`（两个方法，真实调用 `registerPushKitToken:completion:` / `unRegisterPushKitTokenWithCompletion:`）、`ExtSdkToJson.m`（两个证书名选项映射）全部参与编译链接，无 `undeclared selector` / `property not found` 报错，即对 HyphenateChat 4.25.0 发布头文件的 API 引用全部成立。

## 6. 本次暴露的基线问题（不在本次范围）

| id | 问题 | 证据 | 处理 |
|---|---|---|---|
| D-2 | ~~iOS `renewToken` dispatch 缺失~~ **已于 2026-09-24 修复**（见本文档 §7）：key、Value、methodMap 条目、wrapper 实现都在，唯独 `ExtSdkDispatch.m` 没有 `ExtSdkMethodKeyRenewTokenValue` 的 case，落到 default 返回 `not implement: renewToken` | 修复前 `grep -n RenewToken modules/objc/dispatch/ExtSdkDispatch.m` 无命中；`ExtSdkMethodTypeObjc.h:21,430`、`.m:36` 均有条目 | 用户裁决「修」：补齐 case + 从 5.0.0 移植「methodMap 条目必须有 dispatch case」契约测试；反向验证已证明用例能抓该缺口 |
| D-4 | `example/ios/Podfile.lock` 与 `ChatSdk.podspec` 不一致：lock 内 `ChatSdk (1.20.0)` + `HyphenateChat (~> 4.24.1)`，而 podspec 已是 1.21.0 且要求 `~> 4.25.0` | `pod install` 直接失败："CocoaPods could not find compatible versions for pod HyphenateChat / In snapshot (Podfile.lock): 4.24.1" | 本次一并修正（lock 更新为 `ChatSdk (1.21.0)` + `HyphenateChat (4.25.0)` + `ShengwangInfra_iOS (1.3.16)`） |
| D-5 | ObjC `Value` 编号存量重复：`ExtSdkMethodKeyOnMessagesRecalledInfoValue` 与 `ExtSdkMethodKeyOnStreamMessagesReceivedValue` 都是 `611` | `ExtSdkMethodTypeObjc.h:535,807` | 两个都是事件 key，不参与 dispatch switch，无实际影响；本次不修，仅登记 |

## 7. D-2 修复验证（2026-09-24，用户裁决「修」）

### 7.1 修复内容

- `modules/objc/dispatch/ExtSdkDispatch.m`：补上 `ExtSdkMethodKeyRenewTokenValue` 的 dispatch case（此前 key/Value/methodMap 条目/wrapper 实现四者齐备，唯独缺这个 case，调用落到 default 返回 `not implement: renewToken`）。
- 移植 5.0.0 的契约测试，让该类缺口不能复现：
  - `src/__tests__/contract/parsers.ts`：新增 `OBJC_DISPATCH_PATH` 常量与 `parseObjcDispatchCases()`（正则提取 `ExtSdkDispatch.m` 中所有 `case ExtSdkMethodKeyXValue:` 标签）。
  - `src/__tests__/contract/methodNames.test.ts`：新增用例 `every non-event ObjC methodMap entry has a dispatch case`（`on` 前缀的事件 key 豁免，因为事件经 `onReceive:` 上报、不从 TS 调用）。

### 7.2 验证（含反向验证）

| 验证项 | 结果 | 备注 |
|---|---|---|
| 新增用例是否真的能抓到这个缺口（反向验证） | ✅ | 临时移除刚补的 `renewToken` case 后跑 `yarn test:contract`：`1 failed, 8 passed`，失败信息逐字指名 `ExtSdkMethodKeyRenewToken ('renewToken') -> ExtSdkMethodKeyRenewTokenValue`；随后从备份恢复文件（`grep -c RenewTokenValue` 由 0 回到 1） |
| `yarn test --no-watchman` | ✅ | 19 suites / **122 tests**（较基线 121 增 1，即新增的 dispatch 契约用例） |
| `yarn typecheck` / `yarn lint` | ✅ | 无输出 |
| iOS 重新构建（`yarn example build:ios`） | 见下 | 补 case 后重新编译确认仍可链接 |

反向验证的意义：新增的契约用例不是「登记即绿」——它对本分支真实存在的缺口会红。这也是 5.0.0 当初新增该用例的原因（commit `bc9915e`）。

### 7.3 补做 header 声明核查时发现第二层原因（重要）

第一次「补 dispatch case」后 iOS 构建**失败**，编译错误为：

```text
error: no visible @interface for 'ExtSdkClientWrapper' declares the selector 'renewToken:withMethodType:result:'
```

即 `renewToken` 的缺口是**两层**的，不只是 dispatch case：

| 层 | 1.21.0 修复前 | 5.0.0 |
|---|---|---|
| `ExtSdkClientWrapper.h` 方法声明 | **缺失**（`.m` 有实现但头文件从未声明） | 有（`:64`） |
| `ExtSdkDispatch.m` dispatch case | **缺失** | 有 |
| `ExtSdkClientWrapper.m` 实现 | 有（`:320`） | 有 |
| key 常量 / Value / methodMap 条目 | 有 | 有 |

历史核查（`git log -S`）证明这不是本次回移引入：`modules/objc/dispatch/ExtSdkDispatch.m` **从未**有过 `ExtSdkMethodKeyRenewTokenValue`，`ExtSdkClientWrapper.h` **从未**声明过 `renewToken:`，`dev` 分支现状同样是 0 —— 也就是说 iOS 上 `ChatClient.renewToken` 自引入以来一直是 `not implement`，从未被接通。

### 7.4 wrapper 声明/实现一致性抽查（本次新固化）

命令（client 域 22 个方法逐个比对 `.h` 声明数与 `.m` 实现数）：

```bash
cd modules/objc/dispatch
for m in initSDKWithDict getToken createAccount login logout changeAppKey changeAppId \
         getCurrentUser uploadLog compressLogs kickDevice kickAllDevices isLoggedInBefore \
         getLoggedInDevicesFromServer loginWithAgoraToken isConnected renewToken updatePushConfig \
         getRTCTokenInfoWithChannelName getUserIdsWithRTCUids bindPushKitToken unbindPushKitToken; do
  h=$(grep -c "^- (void)$m:" ExtSdkClientWrapper.h); m2=$(grep -c "^- (void)$m:" ExtSdkClientWrapper.m)
  [ "$h" != "$m2" ] && printf "%-38s .h=%s .m=%s  ← 缺声明\n" "$m" "$h" "$m2"
done
```

结果：**无输出**（22 个方法全部对齐）。修复前该检查会命中 `renewToken .h=0 .m=1`。

> 为什么契约测试抓不到这个缺口：契约测试是**文本层**比对（key/Value/methodMap/dispatch case），看不到 ObjC 的 selector 可见性；而「methodMap 条目必须有 dispatch case」这条在缺 case 时确实会红（§7.2 反向验证已证），但「dispatch case 调用的 selector 是否有声明」属编译期约束，只能靠 Xcode 构建暴露。本次两层缺口正好被这两个手段分别覆盖。

### 7.5 最终构建结果

| 验证项 | 结果 | 备注 |
|---|---|---|
| iOS 构建（补 dispatch case 后，未补声明） | ❌ 失败（已修复） | `xcodebuild` exit 65，报 `no visible @interface … 'renewToken:withMethodType:result:'` |
| iOS 构建（补 `.h` 声明后） | ✅ | `success Successfully built the app`（exit 0） |
| `yarn test --no-watchman` | ✅ | 19 suites / 122 tests |
| `yarn typecheck` / `yarn lint` | ✅ | 无输出 |

---

## 8. CI 失败排查与修复（2026-09-24，PR #49 / run 35962497865）

### 8.1 现象

`1.21.0 CI` 的 **iOS build** job（ID 107513882137）在 `Install pods` 步骤失败，退出码 31：

```text
[!] The version of CocoaPods used to generate the lockfile (1.16.2) is higher than
    the version of the current executable (1.15.2). Incompatibility issues may arise.
[!] CocoaPods could not find compatible versions for pod "HyphenateChat":
  In snapshot (Podfile.lock):  HyphenateChat (= 4.25.0, ~> 4.25.0)
  In Podfile:                  ChatSdk (from `../..`) was resolved to 1.21.0, which depends on
                                 HyphenateChat (~> 4.25.0)
None of your spec sources contain a spec satisfying the dependencies: ...
```

后续 `Scan deprecated iOS APIs` 的失败是**连带失败**（pod install 失败导致 `build/reports/deprecated-ios-raw.log` 不存在，`scripts/parse-deprecated-ios.sh` 退出 1），不是独立问题。

### 8.2 排查过程与结论（`COCOAPODS: 1.15.2` 那行不是根因）

| 检查 | 结果 | 结论 |
|---|---|---|
| 本机 `pod --version` | 1.16.2 | 本地比 CI 新 |
| 仓库 `example/Gemfile.lock` 钉的 CocoaPods | **1.15.2** | CI 用 `bundle exec pod install`，跑的就是 1.15.2；第一条 version 警告因此**无法通过改 lock 里那行消除** |
| CI 缓存列表（`gh api .../actions/caches`） | 只有 2 条 pods 缓存：`macOS-pods-5a3de369…`（2026-08-26）、`macOS-pods-4f8dff7e…`（2026-09-17） | 两者都**早于**本次 4.25.0 变更；缓存 key = `macOS-pods-${{ hashFiles('example/ios/Podfile.lock') }}` |
| 当前 Podfile.lock 的 SHA256 前缀 | `4a171f09…` | 与上面两个 key 都**不相等** → 只能靠 `restore-keys: macOS-pods-` 拿到旧缓存 |
| 旧缓存内容 | 含 `~/.cocoapods`（spec 索引）的**旧快照** | 索引里没有 HyphenateChat 4.25.0，而 CI 步骤 `bundle exec pod install --project-directory=ios` **不带 `--repo-update`** → 解析器报 "None of your spec sources contain a spec" |
| 本机同样用 1.15.2 跑 `pod install` | ✅ 成功 | 因为本机 `~/.cocoapods/repos/trunk/Specs` 有 4.25.0（此前 `pod update` 拉过） |
| 本机清空 CocoaPods 缓存（`CP_HOME_DIR` 指向空目录）后跑 1.15.2 `pod install` | ✅ 成功（29s） | 证明 **CDN 侧 4.25.0 完全可用**，不是「新版本未发布」问题 |
| dev 分支 CI 的同一处配置 | 同样不带 `--repo-update` | 属**存量脆弱点**：只要 Podfile.lock 一变（依赖升级就把 cache key 改掉），就会退化到旧 spec 索引而失败 |
| 全仓 `grep repo-update` | 无命中 | 本次首次引入 |

**根因**：iOS job 依赖 `~/.cocoapods` 缓存中的 spec 索引，而该缓存的 key 绑定 Podfile.lock 的哈希；本次依赖从 4.24.1 升到 4.25.0 使 key 改变、命中旧索引，又因为没有 `--repo-update` 而不会刷新索引，于是解析失败。与「4.25.0 未发布」无关（已用冷启动实验证伪）。

### 8.3 修复

| 文件 | 改动 |
|---|---|
| `.github/workflows/ci.yml:137` | `bundle exec pod install --repo-update --project-directory=ios`（附 3 行注释说明为何必须带该参数） |
| `.github/workflows/device-smoke.yml:156` | 同上 |
| `.github/workflows/single-account-nightly.yml:179` | 同上 |
| `example/ios/Podfile.lock` | `COCOAPODS:` 行由 `1.16.2` 回归 `1.15.2`，与 `Gemfile.lock` 钉住的版本一致（本地 `bundle exec pod install` 自动改写所致；该行只记录生成版本，不影响解析） |

未改动 `scripts/ci/smoke_local.sh` / `nightly_local.sh`：它们的 `pod install` 只在 `example/ios/Pods` 不存在时执行，且开发者本机索引通常已是新的，保持原样以减少改动面。

### 8.4 验证

| 验证项 | 结果 | 备注 |
|---|---|---|
| 三个 workflow YAML 解析 | ✅ | `yaml.safe_load` 通过，`Install pods` 步骤命令逐字为 `bundle exec pod install --repo-update --project-directory=ios` |
| 冷启动（空 `~/.cocoapods`）+ 1.15.2 `pod install` | ✅ | 29s 成功，证明 CDN 可解析 4.25.0 |
| 修复后的完整命令 `pod install --repo-update`（bundler 1.15.2） | ✅ | exit 0，32s；日志含 `Updating local specs repositories` → `Pod installation complete! There are 88 dependencies from the Podfile and 89 total pods installed` |
| 本机环境还原 | ✅ | 复现实验期间临时移除的 `~/.cocoapods/.../HyphenateChat/4.25.0` 已从备份还原（`ls` 确认 podspec.json 与 .etag 均在） |

> 遗留观察（不在本次范围）：`--repo-update` 会让每次 iOS job 多约 30 秒并更新时间戳、从而让 `example/ios/Pods` 缓存难以复用；若要优化，可改为按「缓存是否命中」条件决定是否带该参数（需要给 Cache Pods 步骤加 `id` 并读取 `steps.<id>.outputs.cache-hit`）。本次以「先保证正确」为先，不做该优化。
