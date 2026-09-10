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
