# Skill 4: Generate Chinese API Docs

同步源码到中文文档项目，执行智能合并保留中文注释，生成中文 API Overview 和最终中文 API 文档。

---

## Trigger Conditions

当满足以下任一条件时触发本 Skill：

- Skill 2（Core Upgrade）和 Skill 3（Update Docs and Version）均已完成
- 用户明确要求"生成中文 API 文档"或"更新中文文档"
- 本次升级的代码变更和版本号更新已全部完成，准备生成中文文档

---

## Input Parameters

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| 无 | — | — | 本 Skill 不需要额外输入参数，所有信息从项目文件和前置 Skill 产出中获取 |

**前置条件：**
- Skill 2（Core Upgrade）已完成：RN SDK 的 `src/` 中包含最新英文注释的 TypeScript 代码
- Skill 3（Update Docs and Version）已完成：版本号和 CHANGELOG 已更新

---

## Execution Steps

> ⚠️ **严格执行顺序约束：** 步骤 1→2→3→4→5→6 必须按顺序执行，不可跳步。每一步的输出是下一步的输入前提。

### Step 1: Sync English Source to Chinese Project

将 RN SDK 主项目的最新英文源码同步到中文文档项目。

```bash
cd /Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn
bash restore.sh
```

**效果：** 将 `/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72/src/` 的内容复制到中文项目的 `src/` 目录。

**错误处理：**
- 如果 `restore.sh` 执行失败，检查脚本是否存在、是否有执行权限
- 如果 RN SDK 项目路径不可达，报告路径错误并终止

### Step 2: Smart Merge (Preserve Chinese Comments)

执行智能合并脚本，对比新旧源码，保留既有中文注释。

```bash
cd /Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn
python smart_merge_v5.py src
```

**合并逻辑：**
- 对于既有中文又有英文的注释块：移除英文，保留中文
- 对于新增/纯英文的注释块：保留英文待翻译（这些是新增 API 的注释）

**错误处理：**
- 如果 `smart_merge_v5.py` 执行失败，显示 Python 错误信息
- 检查 Python 虚拟环境（`.venv`）是否已激活
- 常见问题：Python 版本不兼容、缺少依赖

### Step 3: Supplement Chinese Comments for New APIs

> 🔴 **人工介入点**

检查 Step 2 的输出，找出仍为英文的新增 API 注释，补充中文翻译。

**操作流程：**

1. 检查 `smart_merge_v5.py` 的输出日志，识别哪些文件/方法的注释仍为英文
2. 对于每个需要翻译的注释块：
   - **优先**：从 iOS Native 源码获取中文注释
     - 路径：`/Users/asterisk/Codes/easemob/emclient-ios/newSDK/HyphenateSDK/`
     - 查找对应的 `.h` 文件中的中文注释
   - **其次**：从 Android Native 源码获取中文注释
     - 路径：`/Users/asterisk/Codes/easemob/emclient-android/hyphenatechatsdk/src/com/hyphenate/chat/`
     - 查找对应的 `.java` 文件中的中文 JavaDoc
   - **最后**：由 agent 辅助翻译英文注释为中文
3. 将中文注释写入中文项目的对应源文件

**等待用户确认翻译质量后再继续下一步。**

### Step 4: Copy Back to RN SDK Project

将中文注释版本的源码覆盖回 RN SDK 主项目。

```bash
cd /Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn
bash target.sh
```

**效果：** 将中文项目的 `src/` 内容覆盖到 `/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72/src/`。

> ⚠️ 执行此步骤后，RN SDK 主项目的 `src/` 中的注释将变为中文版本。

**错误处理：**
- 如果 `target.sh` 执行失败，检查脚本是否存在、是否有执行权限
- 如果目标路径不可达，报告路径错误并终止

### Step 5: Generate Chinese API Overview

在 API Overview 生成器项目中执行生成，然后将结果写入 RN SDK 的中文 API Overview 文件。

**5a. 执行生成器：**

```bash
cd /Users/asterisk/Codes/zuoyu/api_docs_parser
yarn start
```

**输出文件：**
- `output.md` — 原始生成结果
- `output2.md` — 排序后的结果（用于最终替换）

> 注意：`api_docs_parser/index.js` 的 `targetDir` 已配置指向 `/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72/src/`，会扫描中文注释版本的源码。

**错误处理：**
- 如果 `yarn start` 执行失败，显示错误信息
- 检查 Node.js 环境和依赖是否已安装（`yarn install`）
- 检查 `index.js` 中的 `targetDir` 配置是否正确指向 rn72 的 `src/`

**5b. 替换 `rn_api_overview.zh.md` 内容：**

> 🔴 **人工介入点**：确认 `output2.md` 内容正确后再执行替换。

将 `output2.md` 的内容替换到 RN SDK 项目的 `docs/rn_api_overview.zh.md` 文件中：

- **保留**：文件的前 13 行（固定头部，包含标题和说明信息）
- **替换**：从第 14 行起的所有内容，用 `output2.md` 的完整内容替换

**操作伪代码：**
```
header = read rn_api_overview.zh.md lines 1-13
new_content = read output2.md
write rn_api_overview.zh.md = header + "\n" + new_content
```

**错误处理：**
- 如果 `rn_api_overview.zh.md` 文件行数不足 13 行，报告文件结构异常并暂停执行
- 等待用户确认文件状态后再决定如何处理

### Step 6: Generate Final Chinese API Docs

在 RN SDK 主项目中执行中文文档生成命令。

```bash
cd /Users/asterisk/Codes/rn/react-native-chat-sdk-rn72
yarn doc:cn
```

**输出：** `docs/build/cn/` 目录，包含完整的中文 API 参考文档（HTML 格式，由 TypeDoc 生成）。

**错误处理：**
- 如果 `yarn doc:cn` 执行失败，显示 TypeDoc 错误信息
- 常见原因：TypeScript 编译错误（通常是源码中的类型问题）
- 建议先执行 `yarn typecheck` 确认类型正确性

---

## Output

### Execution Summary

执行完成后，输出摘要包含：

1. **同步状态**：`restore.sh` 同步的文件数量
2. **智能合并结果**：
   - 保留中文注释的文件数
   - 新增/仍为英文的注释块数量
3. **中文注释补充**：补充翻译的 API 数量
4. **API Overview 更新**：`rn_api_overview.zh.md` 的变更行数
5. **最终文档生成**：`docs/build/cn/` 目录的文件数量
6. **已修改文件列表**：
   - `/Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn/src/` — 中文注释源码
   - `/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72/src/` — 覆盖为中文注释版本
   - `/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72/docs/rn_api_overview.zh.md` — 中文 API Overview
   - `/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72/docs/build/cn/` — 最终中文文档

---

## Human Intervention Points

### 1. New API Chinese Comment Supplementation (Step 3)

**触发条件：** `smart_merge_v5.py` 执行后存在仍为英文的新增 API 注释

**处理：**
- 展示需要翻译的 API 列表（文件路径 + 方法名 + 英文注释内容）
- 提供翻译建议（从 Native 源码获取或 agent 辅助翻译）
- 等待用户确认翻译质量或提供修正
- 用户确认后继续执行 Step 4

### 2. Confirm `output2.md` Content (Step 5b)

**触发条件：** `api_docs_parser` 生成 `output2.md` 后，替换 `rn_api_overview.zh.md` 之前

**处理：**
- 展示 `output2.md` 的内容摘要（总行数、包含的 Manager 数量、方法总数）
- 如有明显异常（如方法数量大幅减少），提醒用户注意
- 等待用户确认后执行替换

---

## Project Paths

| 项目 | 路径 | 说明 |
|------|------|------|
| RN SDK 主项目 | `/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72` | TypeScript 源码和最终文档输出 |
| 中文文档项目 | `/Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn` | 中文注释维护、智能合并脚本 |
| API Overview 生成器 | `/Users/asterisk/Codes/zuoyu/api_docs_parser` | 扫描 TS 源码生成 API 方法表格 |
| iOS Native SDK | `/Users/asterisk/Codes/easemob/emclient-ios` | 中文注释来源（`.h` 文件） |
| Android Native SDK | `/Users/asterisk/Codes/easemob/emclient-android` | 中文注释来源（`.java` 文件） |

---

## Key Constraints

- **执行顺序严格**：1→2→3→4→5→6，不可跳步。每步依赖前一步的输出。
- **`api_docs_parser/index.js`** 的 `targetDir` 已指向 rn72 的 `src/`，Step 5 执行时会扫描 Step 4 覆盖后的中文注释源码。
- **Step 4 执行后**，rn72 的 `src/` 中注释变为中文版本。如需恢复英文版本，需要从 git 恢复。
- **`rn_api_overview.zh.md`** 的前 13 行是固定头部，任何情况下不得修改。

---

## Reference

- 中文文档项目脚本：`restore.sh`（同步源码）、`target.sh`（覆盖回主项目）
- 智能合并脚本：`smart_merge_v5.py`（保留中文注释的 diff 合并）
- API Overview 生成器：`api_docs_parser/index.js`（扫描 TypeScript 源码生成方法表格）
- RN SDK 文档生成命令：`yarn doc:cn`（TypeDoc 中文文档生成）
- iOS Native 源码路径：`/Users/asterisk/Codes/easemob/emclient-ios/newSDK/HyphenateSDK/`
- Android Native 源码路径：`/Users/asterisk/Codes/easemob/emclient-android/hyphenatechatsdk/src/com/hyphenate/chat/`
