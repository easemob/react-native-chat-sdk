# SDK 升级 Skill 设计方案

## 背景

每次 native SDK 升级（如 HyphenateChat 4.16 → 4.17），RN SDK 需要同步更新。这类工作重复性高、创造性低，适合用 skill 自动化。

## 涉及的项目

| 项目 | 路径 | 用途 |
|------|------|------|
| RN SDK (主项目) | `/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72` | 主项目，所有升级工作的目标 |
| iOS Native SDK | `/Users/asterisk/Codes/easemob/emclient-ios` | git diff 获取变更、API 注释来源。Tag 格式: `4.16.1`, `4.17.0` |
| Android Native SDK | `/Users/asterisk/Codes/easemob/emclient-android` | git diff 获取变更、API 注释来源。Tag 格式: `SDK_4.16.1`, `SDK_4.17.1` |
| 中文文档项目 | `/Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn` | 中文 API 文档生成 |
| API Overview 生成器 | `/Users/asterisk/Codes/zuoyu/api_docs_parser` | 生成 `docs/rn_api_overview.md` 的部分内容 |

## 升级流程（正确顺序）

```
1. 获取 native diff（iOS + Android tag 对比，只看公开 API）
2. 升级 native 版本号，安装依赖，更新 native wrapper（Java + ObjC）
3. 根据 native 变更同步 TypeScript API、监听器
4. 更新文档和版本号
```

## Skill 划分

### Skill 1: 获取 Native 变更清单

**输入：** iOS 旧 tag / 新 tag，Android 旧 tag / 新 tag
**操作：**
- `git diff <old_tag>..<new_tag>` 在 iOS 和 Android native repo
- 只关注对外公开的 API（头文件/公开接口），忽略内部实现
- 输出结构化的变更清单：新增 API、作废 API、重命名 API、参数变更 API、新增监听器等

**人工介入点：** iOS 和 Android 不对齐时需要人工决策

**iOS 关注的文件模式（已确认）：**
- 路径：`newSDK/HyphenateSDK/` 及其子目录
- 子目录：`ChatManager/`、`ChatroomMagager/`、`ContactManager/`、`GroupManager/`、`Helper/`、`LogCallback/`、`Presence/`、`PushManager/`、`ReactionManager/`、`Statistics/`、`ThreadManager/`、`UserInfoManager/`
- 匹配模式：`*.h`（排除 `+Private.h`、`+Category.h`）
- 典型文件：`EMClient.h`、`IEMChatManager.h`、`EMChatManagerDelegate.h`、`EMChatMessage.h`、`EMGroupManager.h` 等

**Android 关注的文件模式（已确认）：**
- 路径：`hyphenatechatsdk/src/com/hyphenate/chat/`
- 匹配模式：`EM*.java`（排除 `EMA*` adapter 类）
- 排除内部实现类：`EMSmartHeartBeat`、`EMHeartBeatReceiver`、`EMMonitorReceiver`、`EMJobService`、`EMChatService`、`EMEncryptProvider`、`EMEncryptUtils`、`EMCollector`、`EMBase`
- 排除子目录：`adapter/`、`core/`
- 典型文件：`EMClient.java`、`EMChatManager.java`、`EMGroupManager.java`、`EMMessage.java` 等

### Skill 2: 核心升级

**输入：** Skill 1 的变更清单
**操作：**

1. 升级版本号：
   - `react-native-chat-sdk.podspec` → `s.dependency 'HyphenateChat','~> x.y.z'`
   - Android: `android/build.gradle` 中的依赖版本（如有）

2. 安装依赖（pod install / gradle sync）

3. 更新 native wrapper（模式固定，不新增文件，如需新增文件要和用户确认）：
   - `modules/java/com/chatsdk/common/ExtSdkMethodType.java` → 新增常量
   - `modules/java/com/chatsdk/dispatch/ExtSdk*Wrapper.java` → 新增/修改方法
   - `modules/java/com/chatsdk/dispatch/ExtSdkHelper.java` → JSON 转换
   - `modules/objc/common/ExtSdkMethodTypeObjc.h` + `.m` → 新增常量 + 枚举值
   - `modules/objc/dispatch/ExtSdk*Wrapper.m` → 新增/修改方法
   - `modules/objc/dispatch/ExtSdkToJson.h` + `.m` → JSON 转换
   - `modules/objc/rn/ExtSdkApiObjcRN.mm` → 注册新事件名

4. 更新 TypeScript 层：
   - `src/__internal__/Consts.ts` → 新增方法名常量
   - `src/Chat*.ts` (Manager) → 新增/修改 API 方法、注册监听器
   - `src/ChatEvents.ts` → 新增/修改监听器接口
   - `src/common/Chat*.ts` → 新增/修改类型定义
   - `src/index.ts` → 导出新类型

**变更类型需区分：**
- 新增 API（全新方法）
- 作废 API（标记 @deprecated，保留实现）
- 更新 API（参数变化、返回值变化）
- 替换 API（旧废新增，成对出现）
- 以上均包括监听器

**C++ 层（`modules/cpp/`）不需要更新。**

### Skill 3: 更新文档和版本号

**操作：**

1. 版本号规则：
   - Bug fix: `x.y.Z+1`
   - 新特性: `x.Y+1.0`（Z 归零）

2. 更新的文件：
   - `package.json` → version 字段
   - `package.json` → `doc:cn:update` 脚本中的版本参数
   - `CHANGELOG.md` → 英文更新日志
   - `CHANGELOG.zh.md` → 中文更新日志

3. `docs/rn_api_overview.md`：
   - 部分内容由 `api_docs_parser` 项目生成
   - API 注释从 native 源码获取

### Skill 4: 生成中文 API 文档

**依赖：** `react-native-chat-sdk-cn` 项目、`api_docs_parser` 项目
**前置条件：** Skill 2 和 Skill 3 已完成（rn72 项目代码和文档已更新）

**操作流程（已确认）：**

1. **同步英文源码到中文项目：**
   ```bash
   # 在中文项目中执行 restore.sh
   cd /Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn
   bash restore.sh
   ```
   - 将 rn72 的 `src/` 拷贝到中文项目，覆盖旧文件

2. **智能合并（还原中文注释）：**
   ```bash
   cd /Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn
   python smart_merge_v5.py src
   ```
   - 通过 `git diff` 检测变更，对于既有中文又有英文的注释块，保留中文、移除英文
   - 只有新增/纯英文的注释块会保留英文（待人工翻译或从 native 获取中文注释）

3. **补充新增 API 的中文注释：**
   - 人工介入：对 smart_merge 后仍为英文的新增 API 注释，从 iOS/Android native 源码获取中文注释补充
   - 或由 agent 辅助翻译

4. **覆盖回 rn72 项目：**
   ```bash
   cd /Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn
   bash target.sh
   ```
   - 将中文项目的 `src/` 覆盖回 rn72 项目

5. **生成中文 overview 文档：**
   ```bash
   cd /Users/asterisk/Codes/zuoyu/api_docs_parser
   yarn start
   ```
   - 扫描 rn72 的 `src/` 目录（此时已是中文注释版本）
   - 输出 `output.md`（原始数据）和 `output2.md`（二次加工，按固定顺序排列）
   - 手动将 `output2.md` 内容替换到 `docs/rn_api_overview.zh.md` 的第 14 行起（前 13 行为固定头部描述）

6. **生成最终中文 API 文档：**
   ```bash
   cd /Users/asterisk/Codes/rn/react-native-chat-sdk-rn72
   yarn doc:cn
   ```
   - 使用 typedoc 生成中文 API 文档到 `docs/build/cn/`

**关键脚本说明：**
| 脚本 | 位置 | 作用 |
|------|------|------|
| `restore.sh` | `react-native-chat-sdk-cn/` | rn72 `src/` → 中文项目 |
| `smart_merge_v5.py` | `react-native-chat-sdk-cn/` | git diff 还原中文注释 |
| `target.sh` | `react-native-chat-sdk-cn/` | 中文项目 `src/` → rn72 |
| `index.js` | `api_docs_parser/` | 生成 overview 表格 |

**`rn_api_overview.zh.md` 结构：**
- 第 1-13 行：固定头部（各 Manager 的中文简介）
- 第 14 行起：由 `api_docs_parser` 的 `output2.md` 生成的 API 方法表格

**注意事项：**
- `api_docs_parser/index.js` 中的 `targetDir` 已指向 `/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72/src`
- 顺序不能错：先生成中文 overview（步骤 5），再生成最终中文 API 文档（步骤 6）
- 中文项目和 rn72 项目最终都需要 git 提交

## 一次典型升级的文件变更清单（以 v1.14.0 → v1.15.0 为例）

```
# 版本号
package.json                                          (version + doc script)
react-native-chat-sdk.podspec                         (HyphenateChat 依赖版本)

# Java native wrapper
modules/java/com/chatsdk/common/ExtSdkMethodType.java (新增常量)
modules/java/com/chatsdk/dispatch/ExtSdk*Wrapper.java (新增方法实现)
modules/java/com/chatsdk/dispatch/ExtSdkHelper.java   (JSON 转换)

# ObjC native wrapper
modules/objc/common/ExtSdkMethodTypeObjc.h            (新增常量声明)
modules/objc/common/ExtSdkMethodTypeObjc.m            (新增枚举映射)
modules/objc/dispatch/ExtSdk*Wrapper.m                (新增方法实现)
modules/objc/dispatch/ExtSdkToJson.h                  (新增 JSON 转换声明)
modules/objc/dispatch/ExtSdkToJson.m                  (新增 JSON 转换实现)
modules/objc/rn/ExtSdkApiObjcRN.mm                    (注册新事件名)

# TypeScript
src/__internal__/Consts.ts                            (新增方法名常量)
src/Chat*.ts                                          (Manager API + 监听器注册)
src/ChatEvents.ts                                     (监听器接口)
src/common/Chat*.ts                                   (类型定义)
src/index.ts                                          (导出)

# 文档
CHANGELOG.md
CHANGELOG.zh.md
docs/rn_api_overview.md                               (部分由 api_docs_parser 生成)

# Example app (保持可用)
example/src/demo2/Test/                               (测试屏幕)
```

## 关键约束

1. **不修改 `lib/`** — 由 `yarn build:exports` 生成
2. **不修改 `src/version.ts`** — 由 `scripts/generate-version.js` 生成
3. **不修改 `modules/*/flutter/`** — Flutter SDK 专用
4. **不修改 `modules/cpp/`** — 虽然有 ExtSdkMethodType，但实际不需要同步
5. **Wrapper 不新增文件** — 如需新增要和用户确认
6. **iOS/Android tag 命名不同** — iOS: `4.17.0`，Android: `SDK_4.17.1`
7. **验证命令** — `yarn typecheck` + `yarn lint:sdk`

## 下一步

1. ~~创建包含所有项目的 VSCode workspace~~ ✅ 已完成
2. 在 workspace 中逐个编写 skill 文件（放在 `.kiro/skills/`）
3. 每个 skill 编写后实际跑一次验证

## 已确认的 Tag 列表

**iOS（`emclient-ios`）近期 tag：**
```
4.16.0, 4.16.1, 4.16.2, 4.17.0, 4.17.1, 4.18.0, 4.18.1, 4.19.0, 4.19.1, 4.20.0
```

**Android（`emclient-android`）近期 tag：**
```
SDK_4.16.2, SDK_4.17.0, SDK_4.17.1, SDK_4.17.1.1, SDK_4.17.1.2, SDK_4.18.0, SDK_4.18.1, SDK_4.19.0, SDK_4.19.1, SDK_4.20.0
```
