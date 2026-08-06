# 迁移规格文档：react-native-chat-sdk（RN 0.72 → RN 0.83.10 新项目）

> **2026-08-04 修订**：按景玉 review 意见修正——
> 1. `android/` 目标仓库**不做任何修改**（原生桥接接线留作后续单独任务，景玉已回滚）
> 2. `ios/` 目标仓库**不做任何修改**（同上，模板 ChatSdk.h/mm 已恢复）
> 3. **最高优先级**：验证新旧 RN 版本间 JSON 数据传输技术一致性 → 结论见 §12
> 4. `docs/` **需要迁移**（景玉已复制完成）
> 5. example 的 `ios/`、`android/` 原生工程不做任何修改
>
> Q 确认结果：Q1=1.15.3 ✅ ｜ Q2=dpdm 独立命令不进 prepare ✅ ｜ Q3=podspec 保留 flutter 排除 ✅ ｜ Q4=CHANGELOG/README 迁移但不改内容 ✅ ｜ Q5=android-24（因 android/ 整体不改，本条作废）｜ Q6=同意 ✅
>
> codegenConfig.name 已由景玉改为 `RNChatSdkSpec`（与 modules 内旧代码引用一致）。

- **源仓库**：`/Users/asterisk/Codes/zuoyu_rn/react-native-chat-sdk`（dev 分支，已 `git clean -xdf`）
- **目标仓库**：`/Users/asterisk/Codes/zuoyu_rn/test/react-native-chat-sdk`（create-react-native-library 0.63.0 模板，RN 0.83.10）
- **日期**：2026-08-03（2026-08-04 修订）
- **状态**：执行中，待 review

## 0. 总原则

1. **绝不修改 RN 版本号**——新项目就是 RN 0.83.10，只迁业务代码和配置。
2. **依赖版本**：目标仓库已有的包一律不动；缺失的包才添加，且用当前最新版本。
3. **配置文件**：两边都有的配置（tsconfig、eslint、babel、prettier、metro 等），以目标仓库为准。
4. 迁移完成后**不执行任何 git commit**，留给景玉 review。
5. `modules/`（核心 native 代码）景玉已复制完毕，本 spec 不含其内容迁移，只处理对它的**引用配置**（podspec / build.gradle / codegen）。

## 1. 迁移范围总览

| 区域 | 动作 | 说明 |
|---|---|---|
| `src/` TS 源码 | **整体复制**（58 个文件） | 替换模板 stub |
| `src/__specs__/` codegen spec | 随 src 复制 | codegen `jsSrcsDir` 改为 `src/__specs__` |
| `package.json` | **合并** | 字段级取舍，见 §3 |
| `ChatSdk.podspec` | **改写** | source_files 指向 `modules/`，见 §4 |
| `android/` | ❌ **不修改**（2026-08-04 修订） | 原生桥接接线留作后续单独任务 |
| `ios/` | ❌ **不修改**（2026-08-04 修订） | 同上；注意 §13 的类名冲突 |
| `docs/` | **复制**（景玉已完成） | 含 rn_api_overview 等 |
| `scripts/` | **部分复制**（6 个文件） | 见 §7 |
| `example/` | **合并** | 只迁 JS/TS 代码和依赖，不迁原生工程，见 §8 |
| `lefthook.yml` / `.gitleaksconfig.toml` | 合并/复制 | 见 §7 |

## 2. src/ TypeScript 迁移

### 2.1 删除目标仓库模板文件

```
src/index.tsx            # 模板 demo
src/multiply.tsx         # 模板 demo
src/multiply.native.tsx  # 模板 demo
src/NativeChatSdk.ts     # 模板 TurboModule spec（被旧的 src/__specs__/NativeChatSdk.ts 取代）
src/__tests__/index.test.tsx
```

### 2.2 复制源仓库 `src/` 全量（58 个文件）

- `src/index.ts`（含 `export { default as CHAT_VERSION } from './version'`）
- `src/ChatClient.ts`、`Chat*Manager.ts`、`ChatEvents.ts`
- `src/common/`（22 个模型文件）
- `src/__internal__/`（Base / Consts / ErrorHandler / Factory / Native / Utils）
- `src/__specs__/`（NativeChatSdk.ts + index.ts 桥接通道：`TurboModuleRegistry.get('ChatSdk')` + NativeEventEmitter）
- `src/__tests__/`（unit 12 个 + contract 2 个 + helpers + setup.ts）

### 2.3 生成 `src/version.ts`

由 `scripts/generate-version.js` 从 package.json version 生成（gitignored，随 `prepare` 再生成）。

### 2.4 已知需要后续人工处理的点（不在本次改）

- `src/__specs__/index.ts` 里有 3 行 `console.log('dev:...')` 调试输出——**原样保留**，是否清理由景玉决定。
- 旧 jest preset 是 `react-native`，新仓库是 `@react-native/jest-preset` + custom export conditions。**保留新 preset**，旧测试用全局 `jest/describe/it` → 需补 `@types/jest`。

## 3. package.json 合并方案

### 3.1 保留目标仓库的字段（不动）

`name`、`description`、`main`/`exports` 映射（module + esm 条件）、`types`、`repository`/`author`/`bugs`/`homepage`（AsteriskZuo）、`publishConfig`、`peerDependencies`、`workspaces`、`packageManager`、`engines`、`react-native-builder-bob`（module+typescript，**不恢复 commonjs target**）、`prettier`、`create-react-native-library`、所有现有 devDependencies 版本、`eslintConfig`（目标用 `eslint.config.mjs` flat config，不迁旧的 package.json 内嵌 eslintConfig）、`tsconfig*`。

### 3.2 从源仓库迁入的字段

| 字段 | 取值 | 备注 |
|---|---|---|
| `version` | `1.15.3` | ⚠️ 待确认，见 §10-Q1 |
| `files` | 追加 `"modules"`、`"scripts/generate-cmake.js"`、`"scripts/generate-version.js"`、`"scripts/generate-env.js"` | 其余保留目标仓库 |
| `codegenConfig.jsSrcsDir` | `"src/__specs__"` | `name` 保持目标仓库的 `ChatSdkSpec`；`javaPackageName` 两边一致 |
| `scripts` | 合并，见 §3.3 | |
| `jest` | 在目标仓库配置基础上追加：`setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"]`、`testPathIgnorePatterns`（去掉 `.kiro`）、`collectCoverageFrom` | preset 和 export conditions 保留目标仓库 |
| `commitlint.rules` | 迁入旧 type-enum（含 `tag`/`api`/`example`） | |
| `devDependencies` 新增 | `dpdm@^4.3.0`、`madge@^8.0.0`、`@types/jest@^30.0.0` | 均为最新版 |

### 3.3 scripts 合并明细

**迁入**：

```
test:unit, test:contract, test:coverage
scan:deprecated, scan:deprecated:android, scan:deprecated:ios
gen:env_file, gen:version_file, gen:cmake_file
check:circular:dpdm, check:circular:madge
hooks:install, hooks:repair
```

**改写**：

```
prepare = gen:version_file && gen:cmake_file && gen:env_file && bob build
```

（目标仓库原为 `bob build`；不迁旧 prepare 末尾的 `check:circular:dpdm`，避免 npm install 即触发重活——⚠️ 待确认，见 §10-Q2）

**不迁入**（及原因）：

| script | 原因 |
|---|---|
| `doc:*`（6 个 typedoc 相关） | 依赖 `docs/` 目录，docs 不在迁移范围 |
| `yarn_pack` | 依赖被跳过的 prepare 完整链路，后续需要再补 |
| `clean:*` 变体 | 目标仓库已有 `clean`，保留新版 |
| `example` | 目标仓库已有（workspace 名不同），保留新版 |
| `typecheck` / `lint` | 保留目标仓库版本 |

### 3.4 明确丢弃的源仓库配置

- `resolutions: { "@types/react": "17.0.21" }`——React 19 时代有毒，必须丢。
- `main: lib/commonjs/index`、`module`、`react-native`、`source` 旧入口字段——被新 exports 映射取代。
- 旧 `eslintConfig`/`eslintIgnore`（package.json 内嵌）——新仓库用 flat config。
- devDeps 里的 `fast-check`（src 中无引用）、`typedoc*`（docs 不迁）、`pod-install`、`@types/react-native`（已废弃的包）、`metro-react-native-babel-preset`。

## 4. ChatSdk.podspec 改写

基于**目标仓库**现有骨架（`min_ios_version_supported` + `install_modules_dependencies`），合入源仓库 podspec 的 modules 配置：

```ruby
s.source_files = ['ios/**/*.{h,m,mm}', 'modules/cpp/**/*.{h,cpp,mm}', 'modules/objc/**/*.{h,m,mm}']
s.private_header_files = ['modules/cpp/**/*.h']
s.exclude_files = ['modules/cpp/java/**/*', 'modules/cpp/android/**/*', 'modules/objc/flutter/**/*']

s.xcconfig = {
  "OTHER_LDFLAGS": "-ObjC",
  'GCC_PREPROCESSOR_DEFINITIONS' => ["OBJC_LANGUAGE", "REACT_NATIVE_ARCHITECTURE", "IOS_PLATFORM"]
}
s.pod_target_xcconfig = {
  "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
  "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
  'HEADER_SEARCH_PATHS' => [
    "$(PODS_ROOT)/boost",
    "$(PODS_TARGET_SRCROOT)/modules/cpp/common",
    "$(PODS_TARGET_SRCROOT)/modules/cpp/core",
    "$(PODS_TARGET_SRCROOT)/modules/cpp/objc",
    "$(PODS_TARGET_SRCROOT)/modules/objc/common",
    "$(PODS_TARGET_SRCROOT)/modules/objc/dispatch",
    "$(PODS_TARGET_SRCROOT)/modules/objc/rn"
  ]
}

s.dependency 'HyphenateChat', '~> 4.19.1'
```

- **flutter 排除问题**：`modules/objc/flutter/*.h` 里有 `#import <Flutter/Flutter.h>`，不排除则 `pod install` 后编译必挂。景玉说 flutter 目录"不用管"——我的处理是**保留 exclude 这一行**（不编译 ≠ 管它的内容）。如果后续会物理删除 flutter 目录，这行留着也无害。见 §10-Q3。
- `platforms` 用目标仓库的 `min_ios_version_supported`（不回到旧的 11.0）。
- 不恢复旧 podspec 里 `if respond_to?(:install_modules_dependencies)` 的 fallback 分支（RN 0.83 必有）。

## 5. android/ 合并

### 5.1 删除目标仓库模板

```
android/src/main/java/com/chatsdk/ChatSdkModule.kt
android/src/main/java/com/chatsdk/ChatSdkPackage.kt
```

### 5.2 从源仓库复制

```
android/src/main/java/com/chatsdk/ChatSdkModule.java   # 真正的模块入口在 ChatSdkPackage 里返回 ExtSdkApiRN
android/src/main/java/com/chatsdk/ChatSdkPackage.java  # TurboReactPackage + System.loadLibrary("ext_sdk")
android/src/newarch/com/chatsdk/ChatSdkSpec.java       # extends NativeChatSdkSpec
android/src/main/cpp/CMakeLists.txt                    # 复制（build.gradle 实际指向 ../modules/cpp/CMakeLists.txt）
```

**不复制** `android/src/oldarch/`——RN 0.83 已无旧架构，oldarch spec 永远不会被编译引用。

### 5.3 AndroidManifest.xml

目标仓库模板是空 manifest，旧仓库权限在 `AndroidManifestNew.xml`。处理：**把 7 个 uses-permission 合并进目标仓库的 `android/src/main/AndroidManifest.xml`**，不引入 AndroidManifestNew.xml（新模板没有双 manifest 机制）。

### 5.4 build.gradle

以**目标仓库版本为基底**（AGP 8.7.2、kotlin-android 插件、com.facebook.react 插件、namespace、compileSdk 36、Java 17），合入旧仓库的：

```gradle
defaultConfig {
  externalNativeBuild {
    cmake {
      arguments.add "-DANDROID_PLATFORM=android-24"   // 对齐新 minSdk，原为 21 ⚠️
      arguments.add "-DANDROID_ARM_NEON=TRUE"
      arguments.add "-DANDROID_TOOLCHAIN=clang"
      cFlags "-Wall", "-Werror", "-fexceptions", "-frtti", "-DWITH_INSPECTOR=1"
      cppFlags "-std=c++17"
    }
  }
}
externalNativeBuild { cmake { path file('../modules/cpp/CMakeLists.txt') } }
sourceSets.main {
  java.srcDirs += ["../modules/java", "src/newarch", "${project.buildDir}/generated/source/codegen/java"]
  java.excludes = ["com/chatsdk/flutter"]
}
dependencies {
  implementation 'io.hyphenate:hyphenate-chat:4.19.3'
}
```

**不迁入**：`isNewArchitectureEnabled()` 条件逻辑（0.83 恒为新架构）、旧 buildscript AGP 7.2.1、`jniLibs srcDirs ../lib/android`（依赖已走 maven，且该目录不存在）、`react {}` 块（新模板靠 package.json codegenConfig 默认推导，两边 javaPackageName 一致）、旧 `gradle.properties`（minSdk 21 等——保留目标仓库的 24/36）。

## 6. ios/ 处理

- **删除** `ios/ChatSdk.h` + `ios/ChatSdk.mm`（模板 multiply demo）。
- 原因：真正的 iOS RN 模块类名也是 `ChatSdk`，实现在 `modules/objc/rn/ExtSdkApiObjcRN.mm`（RCT 模块 + TurboModule 桥）。两个同名模块会冲突。
- 源仓库 `ios/` 里只有 `.xcodeproj` 和 README（历史残留），不迁。

## 7. scripts/ 与其他根文件

**复制（6 个）**：

```
scripts/generate-version.js   # 生成 src/version.ts
scripts/generate-cmake.js     # modules/cpp/CMakeLists.txt.rn → CMakeLists.txt
scripts/generate-env.js       # 生成 example/src/env.ts
scripts/scan-deprecated.sh / scan-deprecated-android.sh / scan-deprecated-ios.sh
scripts/repair-lefthook-hooks.js
.gitleaksconfig.toml          # lefthook post-commit 用
```

**不复制**：`publish_agora_package*.sh`（7 个，声网发包脚本）、`eas-build-*.sh`（EAS 构建钩子）、`scripts/docs/`、`scripts/rename_modules`、`scan_safe.sh`、`.kiro/`、`.agents/`、`.worktree/`、`AGENTS.md`、`docs/`、`CHANGELOG*`、`README*`（目标仓库已有模板版，⚠️ 见 §10-Q4）。

**lefthook.yml**：以目标仓库为基底（修掉 `glob` 里的空格 typo），追加旧仓库的：

```
pre-commit test 命令（unit 测试 findRelatedTests）
pre-commit contract 命令（监听 Consts.ts / ExtSdkMethodType 三端文件变更 → yarn test:contract）
post-commit gitleaks 命令
```

## 8. example/ 合并

**只迁 JS/TS，不迁原生工程**（`example/ios`、`example/android` 保持目标仓库 RN 0.83 版本）。

### 8.1 代码

- 目标仓库 `example/src/App.tsx`（模板 demo）→ 替换为源仓库 `example/src/` 全量（demo2 测试套件 + App.tsx）。
- `example/index.js`：保留目标仓库版本（含 web `runApplication` 支持），仅把 `./src/App` 改为 `./src/demo2/App`（旧入口指向 demo2）。
- `example/app.json`：保留目标仓库（name 一致；不迁 eas projectId）。
- `example/babel.config.js` / `metro.config.js` / `react-native.config.js` / `jest.config.js`：**全部保留目标仓库版本**（bob/monorepo-config 新机制已覆盖旧 module-resolver alias 的作用）。
- `example/patches/react-native-modal-dropdown+1.0.2.patch`：复制，并加 `postinstall: patch-package`。
- `example/src/env.ts`：由 `generate-env.js` 生成。

### 8.2 example/package.json 依赖（缺失项用最新版）

| 包 | 版本 | 旧版 |
|---|---|---|
| `@react-navigation/native` | ^7.3.14 | 6.x |
| `@react-navigation/native-stack` | ^7.18.6 | 6.x |
| `react-native-safe-area-context` | ^5.8.0 | 4.7 |
| `react-native-screens` | ^4.26.2 | 3.25 |
| `react-native-gesture-handler` | ^3.1.0 | 2.13 |
| `react-native-image-picker` | ^8.2.1 | 7.x |
| `react-native-document-picker` | ^9.3.1 | 同 |
| `react-native-fs` | ^2.20.0 | 同 |
| `react-native-modal-dropdown` | ^1.0.2 | 同 |
| `@types/react-native-modal-dropdown` | ^1.0.5 | 同 |
| `patch-package`（dev） | ^8.0.1 | 同 |

⚠️ 风险提醒：navigation 6→7、gesture-handler 2→3 有 breaking changes，demo2 代码编译通过后仍可能需要小改 API 调用（typecheck 阶段会发现）。保留目标仓库的 react/RN/web/vite 相关依赖不动。

## 9. 验证计划（迁移后）

1. `yarn install`（装齐新增依赖）
2. `yarn prepare`（验证 gen 脚本 + bob build）
3. `yarn typecheck`（tsc）
4. `yarn test:unit`、`yarn test:contract`（jest）
5. `yarn lint`
6. iOS/Android 实际构建（pod install / gradle）——**不在本次范围**，review 后另行验证。

## 10. 待景玉确认的问题

- **Q1 version**：用旧的 `1.15.3`（保持版本连续）还是新项目的 `0.1.0`（重新开始）？我倾向 1.15.3。
- **Q2 prepare**：旧 prepare 末尾有 `check:circular:dpdm`（循环依赖检查，较慢），npm install 时会触发。保留还是去掉？我倾向去掉，需要时手动跑。
- **Q3 podspec flutter exclude**：按 §4 保留排除行（否则编译挂），OK 吗？还是你打算直接删掉 `modules/objc/flutter` 目录？
- **Q4 README/CHANGELOG**：旧仓库的 README.zh.md、CHANGELOG.md（24K，有完整发版历史）要不要迁？我倾向迁 CHANGELOG 双文件 + 用旧 README 覆盖模板 README。
- **Q5 android cmake `-DANDROID_PLATFORM`**：旧值 android-21，我建议对齐新 minSdk 24。OK？
- **Q6 example jest.config.js**：旧的是 `preset: react-native`，目标仓库的我还没看内容，计划保留目标仓库版。如果 demo2 有测试需要旧 preset 再议。

## 11. 明确不做的事

- 不执行任何 `git commit` / `git add`。
- 不改 `react-native` / `react` 版本，不碰 `yarn.lock` 以外的依赖解析。
- 不迁移旧 example 的 `ios/`、`android/` 原生工程。
- 不迁移 `docs/` 目录及 typedoc 链路。
- 不动 `modules/` 内容本身（包括 flutter 目录）。

## 12. JSON 数据传输一致性验证（RN 0.72 → 0.83）——景玉最关心的问题

### 12.1 数据传输链路（三层）

```
JS 层:  ExtSdkApiRN.callMethod(method, args)        // args = 普通 JS 对象
   ↓ TurboModuleRegistry.get('ChatSdk')
原生层: iOS  callMethod:args:resolve:reject:        // args = NSDictionary
        Android callMethod(String, ReadableMap, Promise)
   ↓ ExtSdkObjectObjcImpl / ExtSdkObjectJavaImpl 包装
C++ 层: ExtSdkApi::callSdkApi → 自有 JSON 序列化 → Hyphenate SDK
```

**关键点**：跨 RN 边界的只有 `NSDictionary`(iOS) / `ReadableMap`(Android) 这两个 RN 官方数据类型；C++ 层 JSON 序列化是项目自有代码，与 RN 版本无关。

### 12.2 验证结论（2026-08-04，实测）

| 验证项 | 方法 | 结果 |
|---|---|---|
| 旧 spec（`callMethod(method: string, args?: Object): Promise<Object>` + `removeAllListeners`）能否通过 RN 0.83.10 codegen | 本地实跑 `generate-codegen-artifacts.js`（iOS + Android） | ✅ **通过，零报错** |
| iOS 生成的原生签名 | 检查生成的 `RNChatSdkSpec.h` | ✅ `callMethod:(NSString *)method args:(NSDictionary *)args resolve:reject:` 与旧桥接 `ExtSdkApiObjcRN.mm` 的 RCT_EXPORT_METHOD 签名**完全一致** |
| Android 生成的签名 | 检查生成的 `NativeChatSdkSpec.java` | ✅ `callMethod(String method, @Nullable ReadableMap args, Promise promise)` 与旧 `ExtSdkApiRN.java` **完全一致** |
| 事件通道 | 代码审查 | ✅ iOS `RCTEventEmitter.sendEventWithName`、Android `DeviceEventManagerModule.RCTDeviceEventEmitter.emit`、JS `NativeEventEmitter`——0.83 均保留（interop layer 官方承诺"可预见的未来不移除"） |
| `TurboModuleRegistry.get('ChatSdk')` | 代码审查 | ✅ 0.83 正常（新架构下走 codegen TurboModule，旧式模块走 interop） |

### 12.3 RN 0.72 → 0.83 架构时间线（官方核实）

- **0.82（2025-10）**：新架构成为唯一架构，`newArchEnabled=false` 被忽略；**interop layer 保留**，"所有 interop 所需的类和函数短期内不会移除"（官方博客原话）
- **0.83**：React 19.2，官方称"首个无用户感知 breaking change 的版本"
- **0.84**：Hermes V1 默认、继续移除 Legacy Architecture 组件、iOS 预编译产物默认
- **0.85**：当前最新

### 12.4 数据传输层面的最终判断

**JSON 数据传输契约在 0.72 和 0.83 之间完全一致**——codegen 对同一份 spec 生成的原生签名逐字相同，`Object` 参数在两版都映射为 `NSDictionary`/`ReadableMap`，Promise 与事件通道行为不变。桥接方式（0.72 可走旧桥、0.83 强制 JSI bridgeless）对 JSON 兼容数据类型（string/number/bool/null/嵌套对象数组）语义等价。

### 12.5 但这 3 个结构性问题必须解决（与数据传输无关，是接线问题）

1. **`ChatSdk` 类名冲突（iOS）**：模板 `ios/ChatSdk.h`（`NSObject <NativeChatSdkSpec>`，import `<ChatSdkSpec/ChatSdkSpec.h>`）与 `modules/objc/rn/ExtSdkApiObjcRN.h`（`RCTEventEmitter <NativeChatSdkSpec>`，import `"RNChatSdkSpec.h"`）定义了**同名 ObjC 类**。podspec 把两边都编译进去必然链接冲突。且模板 import 的 `<ChatSdkSpec/ChatSdkSpec.h>` 对应旧 codegen name，现 codegen name 已是 `RNChatSdkSpec`，模板头文件 import 会失效。→ 接线时必须二选一（预期：删模板 stub，用 modules 实现）。
2. **Android 同样问题**：模板 `ChatSdkModule.kt/ChatSdkPackage.kt`（只实现 multiply）与 `modules/java/com/chatsdk/rn/ExtSdkApiRN.java`（extends `com.chatsdk.ChatSdkSpec`，依赖被回滚的 `android/src/newarch/ChatSdkSpec.java`）。当前 android/ 不含 modules/java 的 sourceSet，且模板模块不满足新 spec（缺 callMethod 等），**Android 现在直接构建会失败**，属预期内（接线前状态）。
3. **模板 stub 与真实 spec 不匹配**：`jsSrcsDir` 已指向 `src/__specs__`（含 callMethod/addListener/removeListeners/removeAllListeners），模板 Kotlin/ObjC stub 只实现 multiply → 在接线完成前，example 原生构建会挂。这是当前刻意的中间状态。

## 13. 遗留问题清单（2026-08-04 更新：TS 降级后复测）

**2026-08-04 第二轮**：按景玉判断将 `typescript` 从 ^6.0.3 降到 `~5.9.3`、`@types/jest` 用回旧仓库版本 `^28.1.2` 后，**错误从 346 → 45**，TS 6.x 确为主因。

剩余 45 个全部是代码级小问题（可机械修复，与数据传输无关）：

| 错误 | 数量 | 位置 | 原因 | 修法 |
|---|---|---|---|---|
| TS6133 | 24 | example demo2 | 新 tsconfig `jsx: react-jsx` 下 `import React` 未使用 | 删除未用的 React import |
| TS2503 | 10 | example demo2 | React 19 移除全局 `JSX` 命名空间 | `JSX.Element` → `React.JSX.Element` |
| TS2345 | 6 | src/ChatManager.ts | RN 0.83 `NativeEventEmitter.addListener` 严格签名 `(...args: readonly Object[])` | 回调参数类型适配或断言 |
| TS2724 | 3 | example | RN 0.83 类型重命名 `TextInputChangeEventData` → `TextInputChangeEvent` | 改 import 名 |
| TS2322 | 2 | example AppKey.tsx | env.ts 占位符类型为 undefined | env 类型放宽 |

~~原 346 个错误的构成~~：~300 个 jest 类型（@types/jest@30 不兼容旧测试写法，已用回 ^28.1.2 解决）、ChatLog console/util 全局类型（TS 6.x 行为变化，降级后消失）、ChatManager 事件签名（仍在，需改代码）。

## 14. 执行状态追踪（2026-08-04）

- [x] src/ TS 源码迁移（58 文件）
- [x] package.json 合并、podspec 改写、scripts、lefthook、gitleaks、CHANGELOG/README
- [x] example JS/TS 迁移 + 依赖（景玉完成）
- [x] docs/ 迁移（景玉完成）
- [x] gen 脚本验证（version.ts / CMakeLists.txt / env.ts 均生成成功）
- [x] JSON 数据传输一致性验证（§12）
- [x] ~~TS 类型错误~~ 主因定位并解决（TS 6.x → 5.9.3，@types/jest → ^28.1.2；346 → 45）
- [x] 剩余 45 个代码级 TS 错误修复（§13 表格）
- [x] jest 单测/契约测试跑通
- [x] iOS/Android 桥接冲突解决（删模板 stub，恢复 Java 桥接 + build.gradle 接线，景玉方案）
- [x] pod install / gradle 真机构建验证
