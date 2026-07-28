# Requirements Document

## Introduction

SDK 升级 Skills 是一套自动化脚本（Kiro Skills），用于在 HyphenateChat Native SDK 升级时，自动同步更新 React Native Chat SDK。该系统覆盖从获取 Native 变更清单、更新 Native Wrapper 和 TypeScript 层、更新文档版本号，到生成中文 API 文档的完整升级流程。

本系统涉及 5 个项目的协同工作：
- RN SDK 主项目（`react-native-chat-sdk-rn72`）
- iOS Native SDK（`emclient-ios`）
- Android Native SDK（`emclient-android`）
- 中文文档项目（`react-native-chat-sdk-cn`）
- API Overview 生成器（`api_docs_parser`）

## Glossary

- **Skill**: Kiro 自动化脚本，定义特定升级步骤的输入、操作和输出
- **Native_SDK**: HyphenateChat 底层 IM SDK，分为 iOS 和 Android 两个平台
- **RN_SDK**: React Native Chat SDK，本项目的主体
- **Native_Wrapper**: Java 和 Objective-C 桥接层代码，位于 `modules/java/` 和 `modules/objc/`
- **TypeScript_Layer**: RN SDK 的 TypeScript 公开 API 层，位于 `src/`
- **Change_Manifest**: 结构化的 Native SDK 公开 API 变更清单
- **Tag**: Git 标签，iOS 格式为 `x.y.z`（如 `4.17.0`），Android 格式为 `SDK_x.y.z`（如 `SDK_4.17.1`）
- **Smart_Merge**: 智能合并脚本（`smart_merge_v5.py`），通过 git diff 检测变更并保留中文注释
- **API_Overview_Generator**: `api_docs_parser` 项目中的 `index.js`，扫描 TypeScript 源码生成 API 方法表格
- **Upgrade_System**: 本需求文档描述的 SDK 升级 Skills 整体系统

## Requirements

### 需求 1：获取 Native 变更清单

**用户故事：** 作为 RN SDK 维护者，我希望通过对比 Native SDK 的 Git Tag 自动提取公开 API 变更清单，以便明确本次升级需要同步的内容。

#### 验收标准

1. WHEN 用户提供 iOS 旧 Tag 和新 Tag，THE Upgrade_System SHALL 在 `emclient-ios` 仓库执行 `git diff <old_tag>..<new_tag>` 并提取公开 API 变更
2. WHEN 用户提供 Android 旧 Tag 和新 Tag，THE Upgrade_System SHALL 在 `emclient-android` 仓库执行 `git diff <old_tag>..<new_tag>` 并提取公开 API 变更
3. WHILE 分析 iOS 变更时，THE Upgrade_System SHALL 仅关注路径 `newSDK/HyphenateSDK/` 下的 `*.h` 文件，排除 `+Private.h` 和 `+Category.h` 后缀的文件
4. WHILE 分析 Android 变更时，THE Upgrade_System SHALL 仅关注路径 `hyphenatechatsdk/src/com/hyphenate/chat/` 下的 `EM*.java` 文件，排除 `EMA*` adapter 类、内部实现类和 `adapter/`、`core/` 子目录
5. THE Upgrade_System SHALL 输出结构化的 Change_Manifest，包含以下分类：新增 API、废弃 API、重命名 API、参数变更 API、新增监听器
6. WHEN iOS 和 Android 的变更内容不对齐时，THE Upgrade_System SHALL 标记差异并提示用户进行人工决策
7. THE Upgrade_System SHALL 排除以下 Android 内部实现类：`EMSmartHeartBeat`、`EMHeartBeatReceiver`、`EMMonitorReceiver`、`EMJobService`、`EMChatService`、`EMEncryptProvider`、`EMEncryptUtils`、`EMCollector`、`EMBase`

### 需求 2：核心升级 — 更新版本号和 Native Wrapper

**用户故事：** 作为 RN SDK 维护者，我希望根据变更清单自动更新 Native 依赖版本号和 Native Wrapper 代码，以便 RN SDK 能正确调用新版 Native SDK 的 API。

#### 验收标准

1. WHEN 执行核心升级时，THE Upgrade_System SHALL 更新 `react-native-chat-sdk.podspec` 中 `s.dependency 'HyphenateChat'` 的版本号
2. WHEN 执行核心升级时，THE Upgrade_System SHALL 更新 `android/build.gradle` 中的 Native SDK 依赖版本号
3. WHEN Change_Manifest 包含新增 API 时，THE Upgrade_System SHALL 在 `modules/java/com/chatsdk/common/ExtSdkMethodType.java` 中新增对应的方法名常量
4. WHEN Change_Manifest 包含新增 API 时，THE Upgrade_System SHALL 在 `modules/java/com/chatsdk/dispatch/ExtSdk*Wrapper.java` 中新增对应的方法实现
5. WHEN Change_Manifest 包含新增 API 时，THE Upgrade_System SHALL 在 `modules/java/com/chatsdk/dispatch/ExtSdkHelper.java` 中新增对应的 JSON 转换逻辑
6. WHEN Change_Manifest 包含新增 API 时，THE Upgrade_System SHALL 在 `modules/objc/common/ExtSdkMethodTypeObjc.h` 和 `.m` 中新增对应的常量声明和枚举映射
7. WHEN Change_Manifest 包含新增 API 时，THE Upgrade_System SHALL 在 `modules/objc/dispatch/ExtSdk*Wrapper.m` 中新增对应的方法实现
8. WHEN Change_Manifest 包含新增 API 时，THE Upgrade_System SHALL 在 `modules/objc/dispatch/ExtSdkToJson.h` 和 `.m` 中新增对应的 JSON 转换逻辑
9. WHEN Change_Manifest 包含新增事件时，THE Upgrade_System SHALL 在 `modules/objc/rn/ExtSdkApiObjcRN.mm` 中注册新事件名
10. WHEN Change_Manifest 包含废弃 API 时，THE Upgrade_System SHALL 保留原有实现并添加 `@deprecated` 标记
11. THE Upgrade_System SHALL 不修改 `modules/cpp/` 目录下的任何文件
12. THE Upgrade_System SHALL 不修改 `modules/*/flutter/` 目录下的任何文件
13. IF 升级过程需要在 Wrapper 层新增文件，THEN THE Upgrade_System SHALL 暂停执行并提示用户确认

### 需求 3：核心升级 — 更新 TypeScript 层

**用户故事：** 作为 RN SDK 维护者，我希望根据变更清单自动更新 TypeScript 公开 API，以便 RN 开发者能使用新版 Native SDK 提供的功能。

#### 验收标准

1. WHEN Change_Manifest 包含新增 API 时，THE Upgrade_System SHALL 在 `src/__internal__/Consts.ts` 中新增对应的方法名常量
2. WHEN Change_Manifest 包含新增 API 时，THE Upgrade_System SHALL 在对应的 `src/Chat*.ts` Manager 文件中新增公开方法
3. WHEN Change_Manifest 包含新增监听器时，THE Upgrade_System SHALL 在 `src/ChatEvents.ts` 中新增对应的监听器接口方法
4. WHEN Change_Manifest 包含新增类型时，THE Upgrade_System SHALL 在 `src/common/Chat*.ts` 中新增对应的类型定义
5. WHEN 新增了公开类型或类时，THE Upgrade_System SHALL 在 `src/index.ts` 中添加对应的导出
6. WHEN Change_Manifest 包含废弃 API 时，THE Upgrade_System SHALL 在 TypeScript 方法上添加 `@deprecated` JSDoc 标记并保留实现
7. THE Upgrade_System SHALL 不修改 `lib/` 目录下的任何文件
8. THE Upgrade_System SHALL 不修改 `src/version.ts` 文件
9. WHEN 核心升级完成后，THE Upgrade_System SHALL 执行 `yarn typecheck` 验证类型正确性
10. WHEN 核心升级完成后，THE Upgrade_System SHALL 执行 `yarn lint:sdk` 验证代码规范

### 需求 4：更新文档和版本号

**用户故事：** 作为 RN SDK 维护者，我希望自动更新 CHANGELOG、package.json 版本号和 API Overview 文档，以便发布时文档与代码保持同步。

#### 验收标准

1. WHEN 本次升级为 Bug Fix 时，THE Upgrade_System SHALL 将 `package.json` 中的版本号按 `x.y.Z+1` 规则递增
2. WHEN 本次升级包含新特性时，THE Upgrade_System SHALL 将 `package.json` 中的版本号按 `x.Y+1.0` 规则递增，Z 归零
3. WHEN 版本号更新时，THE Upgrade_System SHALL 同步更新 `package.json` 中 `doc:cn:update` 脚本的版本参数
4. THE Upgrade_System SHALL 在 `CHANGELOG.md` 中按照时间倒序添加英文更新日志条目
5. THE Upgrade_System SHALL 在 `CHANGELOG.zh.md` 中按照时间倒序添加中文更新日志条目
6. WHEN 更新 `docs/rn_api_overview.md` 时，THE Upgrade_System SHALL 使用 API_Overview_Generator 生成部分内容，并从 Native 源码获取 API 注释

### 需求 5：生成中文 API 文档

**用户故事：** 作为 RN SDK 维护者，我希望自动同步源码到中文文档项目并生成中文 API 文档，以便中文用户获得最新的 API 参考文档。

#### 验收标准

1. WHEN 执行中文文档生成时，THE Upgrade_System SHALL 在 `react-native-chat-sdk-cn` 项目中执行 `bash restore.sh` 将 RN SDK 的 `src/` 同步到中文项目
2. WHEN 源码同步完成后，THE Upgrade_System SHALL 执行 `python smart_merge_v5.py src` 进行智能合并，保留既有中文注释
3. WHEN Smart_Merge 完成后存在仍为英文的新增 API 注释时，THE Upgrade_System SHALL 从 iOS 或 Android Native 源码获取中文注释进行补充
4. WHEN 中文注释补充完成后，THE Upgrade_System SHALL 在 `react-native-chat-sdk-cn` 项目中执行 `bash target.sh` 将中文源码覆盖回 RN SDK 项目
5. WHEN 覆盖完成后，THE Upgrade_System SHALL 在 `api_docs_parser` 项目中执行 `yarn start` 生成 `output.md` 和 `output2.md`
6. WHEN `output2.md` 生成后，THE Upgrade_System SHALL 将其内容替换到 `docs/rn_api_overview.zh.md` 的第 14 行起（保留前 13 行固定头部）
7. WHEN API Overview 更新完成后，THE Upgrade_System SHALL 在 RN SDK 项目中执行 `yarn doc:cn` 生成最终中文 API 文档到 `docs/build/cn/`
8. THE Upgrade_System SHALL 确保执行顺序为：同步源码 → 智能合并 → 补充注释 → 覆盖回主项目 → 生成 Overview → 生成最终文档

### 需求 6：全局约束和安全保障

**用户故事：** 作为 RN SDK 维护者，我希望升级系统遵守明确的文件修改边界和验证规则，以防止误操作破坏项目结构。

#### 验收标准

1. THE Upgrade_System SHALL 不修改 `lib/` 目录下的任何文件
2. THE Upgrade_System SHALL 不修改 `src/version.ts` 文件
3. THE Upgrade_System SHALL 不修改 `modules/*/flutter/` 目录下的任何文件
4. THE Upgrade_System SHALL 不修改 `modules/cpp/` 目录下的任何文件
5. WHEN iOS Tag 格式不符合 `x.y.z` 模式时，THE Upgrade_System SHALL 报告格式错误并终止执行
6. WHEN Android Tag 格式不符合 `SDK_x.y.z` 模式时，THE Upgrade_System SHALL 报告格式错误并终止执行
7. WHEN 任一 Skill 执行完成后，THE Upgrade_System SHALL 提供执行摘要，列出已修改的文件和变更内容
8. IF 执行过程中遇到无法自动处理的冲突或歧义，THEN THE Upgrade_System SHALL 暂停执行并向用户展示具体问题和可选方案
