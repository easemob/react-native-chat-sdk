# Skill 3: Update Docs and Version

更新 CHANGELOG、package.json 版本号和 API Overview 文档，确保发布时文档与代码保持同步。

---

## Trigger Conditions

当满足以下任一条件时触发本 Skill：

- Skill 2（Core Upgrade）已完成
- 用户明确要求更新版本号和文档
- 本次升级的代码变更已全部完成，准备进入发布准备阶段

---

## Input Parameters

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `upgrade_type` | `"bugfix"` \| `"feature"` | 是 | 升级类型，决定版本号递增规则 |
| `changelog_en` | string | 是 | 英文更新日志内容（多条用换行分隔） |
| `changelog_zh` | string | 是 | 中文更新日志内容（多条用换行分隔） |
| Change Manifest | JSON | 是 | 来自 Skill 1 的结构化变更清单，用于更新 API Overview |

---

## Execution Steps

### Step 1: Calculate New Version

读取 `package.json` 中的当前版本号，根据 `upgrade_type` 计算新版本号。

**版本递增规则**（参考 `.kiro/skills/__utils__/version.ts`）：

| upgrade_type | 规则 | 示例 |
|---|---|---|
| `bugfix` | patch + 1（若有 prerelease 则仅去除 prerelease） | `1.15.0` → `1.15.1`，`1.15.1-beta.0` → `1.15.1` |
| `feature` | minor + 1，patch 归零（去除 prerelease） | `1.15.1` → `1.16.0`，`1.15.1-beta.0` → `1.16.0` |

**操作：**

```bash
# 读取当前版本
current_version=$(node -e "console.log(require('./package.json').version)")
```

使用 `__utils__/version.ts` 中的逻辑：
- `parseSemVer(current_version)` 解析版本
- 根据 `upgrade_type` 调用 `bumpPatch()` 或 `bumpMinor()`
- `formatSemVer()` 格式化为字符串得到 `new_version`

### Step 2: Update `package.json` version Field

将 `package.json` 中的 `"version"` 字段更新为 `new_version`。

**修改前：**
```json
"version": "1.15.1-beta.0",
```

**修改后（以 bugfix 为例）：**
```json
"version": "1.15.1",
```

### Step 3: Update `doc:cn:update` Script Version in `package.json`

找到 `scripts` 中的 `"doc:cn:update"` 字段，将其中的版本参数替换为 `new_version`。

**脚本格式：**
```
"doc:cn:update": "node ./scripts/update_api_docs.js <version> undefined easemob cn"
```

**修改前：**
```json
"doc:cn:update": "node ./scripts/update_api_docs.js 1.15.0 undefined easemob cn"
```

**修改后：**
```json
"doc:cn:update": "node ./scripts/update_api_docs.js 1.15.1 undefined easemob cn"
```

> 注意：仅替换第一个参数（版本号），其余参数保持不变。

### Step 4: Update `CHANGELOG.md` (English)

在 `CHANGELOG.md` 文件中，在标题行 `# Update Log` 之后插入新的版本条目。

**CHANGELOG 条目格式模板：**

```markdown
## [new_version] - YYYY-MM-DD

### Added
- <新增功能条目>

### Deprecated
- <废弃功能条目>

### Changed
- <变更条目>
```

**规则：**
- 日期使用当天日期，格式为 `YYYY-MM-DD`
- 仅包含有内容的 section（如果没有 Deprecated 内容则省略该 section）
- 每条日志以 `- ` 开头
- 插入位置：在 `# Update Log` 标题后的第一个空行之后（即在所有已有版本条目之前）
- `changelog_en` 的内容按 Added / Deprecated / Changed 分类填入对应 section

**示例：**
```markdown
_English | [Chinese](./CHANGELOG.zh.md)_

# Update Log

## [1.15.1] - 2025-01-15

### Changed
- Fix iOS build error where Xcode attempts to compile markdown files.

## [1.15.0] - 2024-12-01
...
```

### Step 5: Update `CHANGELOG.zh.md` (Chinese)

与 Step 4 相同的逻辑，使用 `changelog_zh` 的中文内容。

**插入位置：** 在 `# Update Log` 标题后的第一个空行之后。

**示例：**
```markdown
_Chinese | [English](./CHANGELOG.md)_

# Update Log

## [1.15.1] - 2025-01-15

### Changed
- 修复 iOS 编译时 Xcode 尝试编译 objc 模块中的 markdown 文件导致的错误。

## [1.15.0] - 2024-12-01
...
```

### Step 6: Update `docs/rn_api_overview.md`

根据 Change Manifest 中的变更内容更新英文 API Overview 文档。

**对于新增 API（`new_api` 类型）：**
- 找到对应 Manager 的表格（如 `## ChatManager`、`## ChatGroupManager` 等）
- 在表格末尾添加新方法行
- 格式：`| {@link ClassName.methodName methodName} | <description> |`
- description 从 Change Manifest 的 `description` 字段获取，或从 Native 源码头文件/JavaDoc 提取

**对于废弃 API（`deprecated_api` 类型）：**
- 找到对应方法行
- 在 Description 列前面添加 `@deprecated` 标记
- 格式：`| {@link ClassName.methodName methodName} | @deprecated <原描述> |`

**Manager 与 domain 的映射关系：**

| Change Manifest domain | API Overview 表格标题 | TypeScript 类名 |
|---|---|---|
| `client` | `## ChatClient` | `ChatClient` |
| `chat` | `## ChatManager` | `ChatManager` |
| `group` | `## ChatGroupManager` | `ChatGroupManager` |
| `contact` | `## ChatContactManager` | `ChatContactManager` |
| `room` | `## ChatRoomManager` | `ChatRoomManager` |
| `push` | `## ChatPushManager` | `ChatPushManager` |
| `presence` | `## ChatPresenceManager` | `ChatPresenceManager` |
| `thread` | `## ChatThreadManager` | `ChatThreadManager` |
| `userinfo` | `## ChatUserInfoManager` | `ChatUserInfoManager` |

---

## Output

### Execution Summary

执行完成后，输出摘要包含：

1. **新版本号**：显示 `current_version` → `new_version`
2. **已修改文件列表**：
   - `package.json`（version 字段 + doc:cn:update 脚本）
   - `CHANGELOG.md`（新增条目）
   - `CHANGELOG.zh.md`（新增条目）
   - `docs/rn_api_overview.md`（新增/废弃 API 行）
3. **变更内容概要**：列出每个文件的具体修改内容

---

## Human Intervention Points

### 1. Version Confirmation

**触发条件：** 执行修改前

**处理：** 向用户展示计算出的新版本号（`current_version` → `new_version`），确认无误后再继续执行文件修改。

### 2. API Overview Description Source

**触发条件：** Change Manifest 中的 `description` 字段为空或不够清晰

**处理：** 暂停并请求用户确认 API 描述内容。可从以下来源获取：
- iOS Native 源码头文件（`.h` 文件中的注释）
- Android Native 源码 JavaDoc
- 用户手动提供

### 3. CHANGELOG Content Completeness

**触发条件：** 用户提供的 `changelog_en` 或 `changelog_zh` 内容不完整或分类不明确

**处理：** 暂停并请求用户补充或确认内容分类（Added / Deprecated / Changed）。

---

## Protected Paths

以下文件/目录在本 Skill 执行过程中**不得修改**：

- `lib/` — 生成产物目录
- `src/version.ts` — 由脚本自动生成
- `modules/cpp/` — C++ 共享代码
- `modules/*/flutter/` — Flutter 相关代码

---

## Notes

- 本 Skill 不执行 `yarn prepare` 或 `yarn build:exports`，版本号的运行时生成由后续流程处理
- `doc:cn:update` 脚本中的版本参数用于中文文档生成流程（Skill 4），需要与 `package.json` 的 version 保持一致
- CHANGELOG 格式遵循 [Keep a Changelog](https://keepachangelog.com/) 规范
- 如果当前版本已包含 prerelease 后缀（如 `-beta.0`），bugfix 类型仅去除 prerelease 而不递增 patch

---

## Reference

- 版本号计算逻辑实现：`.kiro/skills/__utils__/version.ts`
- Manifest 类型定义：`.kiro/skills/__utils__/manifest.ts`
- RN SDK 项目路径：`/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72`
- CHANGELOG 规范：[Keep a Changelog](https://keepachangelog.com/)
