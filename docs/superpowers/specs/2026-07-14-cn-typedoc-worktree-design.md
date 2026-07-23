# 中文 TypeDoc Worktree 流程设计

## 背景

React Native SDK 当前源码中的 API 注释以英文为主，`doc:en` 和 `doc:cn` 都直接从 `src/index.ts` 入口运行 TypeDoc。中文 API 文档现在依赖把 `src/` 切换成中文注释版本后再生成文档。

公司要求中文注释必须由专门人员维护，不使用大模型或自动翻译。Flutter SDK 使用源码内双语标记，再通过脚本在发版时保留目标语言；RN SDK 更希望日常开发源码保持单语英文，避免双语注释影响阅读和调试。

本设计目标是：只为中文 TypeDoc 文档维护中文注释资产，不改变英文 API 源码和发包产物。

## 决策

采用长期 `cn` 分支和独立 worktree 维护中文 TypeDoc 生成状态。

- `dev` 或 release/tag 是英文源码和完整工程环境的来源。
- `cn` 是中文注释资产分支，保存最近一次中文文档生成后的状态。
- 每次中文文档发版时，在 `cn` worktree 中全量覆盖为目标英文版本内容，但保留 `.git`。
- 覆盖后运行标准化后的中文注释恢复脚本，从 git diff 中恢复已有中文注释，让新增或变化的英文 API 注释暴露出来。
- 人工翻译剩余英文 API 注释后，在 `cn` worktree 中运行 TypeDoc。
- TypeDoc 前运行 overview 生成脚本，从当前 `src/` 注释生成 `docs/rn_api_overview.zh.md` 或 `docs/rn_api_overview.md` 的 API 表格部分。
- 每个完成版本在 `cn` 分支上打 `vX.Y.Z-cn` tag。

不采用 TypeDoc 插件替换注释。虽然 TypeDoc 0.28.x 的插件 API 可以在 reflection 阶段修改 comment，但该方案依赖 TypeDoc 内部模型和插件稳定性；本流程优先选择文件级、可观察、可重复的物理替换。

## 分支与 Tag 模型

长期分支：

- `dev`：英文开发分支。
- `cn`：中文注释资产分支。

版本 tag：

- `v1.6.0`：英文版本基线。
- `v1.6.0-cn`：基于 `v1.6.0` 生成并确认后的中文 TypeDoc 版本。

`cn` 分支不是独立代码开发分支。它的职责是保存中文注释资产和中文文档生成状态。每个版本完成后，`cn` 与对应英文版本除 API 注释语言和中文文档产物外，应保持工程内容一致。

## 核心流程

假设目标英文版本为 `v1.6.0`，`cn` 分支当前在上一中文版本 `v1.5.0-cn` 之后。

1. 准备英文版本工作区。

   可以使用当前英文 release worktree，也可以从 tag 创建只读/临时 worktree：

   ```sh
   git worktree add ../react-native-chat-sdk-rn72-v1.6.0 v1.6.0
   ```

2. 准备中文 worktree。

   ```sh
   git worktree add ../react-native-chat-sdk-rn72-cn cn
   cd ../react-native-chat-sdk-rn72-cn
   git status --short
   ```

   覆盖前必须确认 worktree 干净，避免丢失未提交的中文注释。

3. 全量覆盖中文 worktree。

   在 `cn` worktree 中删除除 `.git` 以外的全部内容，然后复制目标英文版本的全部内容。

   ```sh
   find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
   cp -p -R ../react-native-chat-sdk-rn72-v1.6.0/. .
   ```

   这个步骤的语义是：`cn` 工作区先变成目标英文版本的完整工程环境，但 `.git` 仍然保留在 `cn` 分支上。因此 git diff 能表达“上一中文版本 -> 当前英文版本”的变化。

4. 恢复已有中文注释。

   ```sh
   node scripts/docs/restore-cn-api-comments.js src
   ```

   中文注释恢复脚本依赖覆盖后的 git diff：

   - 对已有 API，diff 中通常表现为旧中文注释被删除、新英文注释被添加。脚本保留中文注释并移除对应英文注释。
   - 对新增 API，因为没有旧中文注释，脚本保留英文注释，作为待人工翻译项。
   - 对代码结构变化，脚本按 diff 结果保留目标英文版本代码。

5. 人工翻译剩余英文 API 注释。

   翻译人员只处理仍为英文的 API 注释。不得使用自动翻译或大模型直接生成正式中文注释。

6. 生成中文 TypeDoc。

   先运行 overview 生成脚本，更新 `docs/rn_api_overview.zh.md` 的 API 表格部分。该步骤必须在中文注释恢复和人工翻译完成后执行，因为脚本直接从当前 `src/` 注释抽取方法/事件描述。

   ```sh
   node scripts/docs/generate-api-overview.js --lang cn
   ```

   然后运行 TypeScript 与 TypeDoc 验证：

   ```sh
   yarn typecheck
   yarn doc:cn
   ```

   中文 TypeDoc 只在 `cn` worktree 中生成。主英文 worktree 不做注释语言切换。

7. 提交并打 tag。

   ```sh
   git add .
   git commit -m "docs: update cn api comments for 1.6.0"
   git tag v1.6.0-cn
   ```

## 工具职责

### 中文注释恢复脚本

现有外部脚本 `/Users/asterisk/Codes/zuoyu/react-native-chat-sdk-cn/smart_merge_v5.py` 应迁入当前项目，但不应原样保留历史名称。迁入时需要做必要的命名和内容标准化。

建议放置路径：

```text
scripts/docs/restore-cn-api-comments.js
```

如果继续使用 Python 实现，也可以命名为：

```text
scripts/docs/restore-cn-api-comments.py
```

脚本职责是基于 git diff 恢复中文注释，不负责翻译。

输入条件：

- 当前目录是 `cn` worktree。
- HEAD 是上一版本中文注释状态。
- 工作区已被目标英文版本全量覆盖。
- `src/` 中产生了可供脚本分析的 diff。

输出结果：

- 已有 API 的中文注释被恢复。
- 新增 API 或无法匹配的注释仍保留英文。
- 代码实现跟随目标英文版本。

标准化要求：

- 去掉版本号式脚本名，例如 `smart_merge_v5.py`，改成表达职责的稳定名称。
- 参数化源码目录，默认处理 `src/`，允许显式传入目录。
- 不依赖本机绝对路径。
- 输出清晰的统计结果，包括处理文件数、恢复注释块数、保留英文注释块数。
- 遇到不可解析 diff 或写入失败时返回非 0 退出码。
- 文案和日志可以是中文，但命令名和文件名保持英文，便于 CI 和跨环境使用。

### 全量覆盖脚本

可以后续封装成脚本，例如：

```sh
scripts/docs/sync-cn-typedoc-worktree.sh <english-worktree>
```

第一版可以保持手工命令，避免在流程尚未实战前过早固化。

### API Overview 生成脚本

现有外部脚本 `/Users/asterisk/Codes/zuoyu/api_docs_parser/index.js` 应迁入当前项目，不再作为独立外部项目依赖。迁入时需要做必要的命名和内容标准化，不应继续保留 `api_docs_parser/index.js` 这种外部项目形态。

建议放置路径：

```text
scripts/docs/generate-api-overview.js
```

该脚本是 TypeDoc 中文文档生成链路的一环。它扫描当前工作区的 `src/`，从 `Chat*` 文件中抽取 class/interface 以及 public 方法/事件的 API 注释，生成 overview 文档中的表格内容。

现有脚本输出两类缓存文件：

- `output.md`：原始扫描结果。
- `output2.md`：按固定 Manager/Listener 顺序整理后的结果。

迁入当前项目后，应保留缓存输出，但输出目录应在仓库内，例如：

```text
docs/api-overview-cache/
  output.md
  output2.md
```

最终发布文档不直接读取外部缓存，而是将整理后的 `output2.md` 写入对应 overview 文档：

- 中文流程写入 `docs/rn_api_overview.zh.md` 的固定头部之后。
- 英文流程写入 `docs/rn_api_overview.md` 的固定头部之后。

脚本应支持目标语言参数，例如：

```sh
node scripts/docs/generate-api-overview.js --lang cn
node scripts/docs/generate-api-overview.js --lang en
```

脚本运行位置决定输入注释语言：

- 在英文 worktree 运行时，抽取英文注释并更新 `docs/rn_api_overview.md`。
- 在 `cn` worktree 运行时，抽取中文注释并更新 `docs/rn_api_overview.zh.md`。

该脚本不负责翻译，只负责从当前源码注释抽取、排序、缓存和回填 overview 正文。

标准化要求：

- 去掉本机绝对路径，输入目录默认使用当前项目 `src/`。
- 支持 `--lang cn|en`，决定回填 `docs/rn_api_overview.zh.md` 还是 `docs/rn_api_overview.md`。
- 支持显式参数覆盖输入和输出路径，例如 `--src`, `--cache-dir`, `--overview`。
- 保留固定头部，只替换 overview 文档中的 API 表格正文。
- 缓存输出写入仓库内约定目录，不能写入外部项目目录。
- 扫描顺序和最终排序规则要显式固化，避免 Node 异步遍历导致输出顺序不稳定。
- 脚本失败时返回非 0 退出码，避免 TypeDoc 继续使用过期 overview。
- 可以在 `package.json` 中增加标准命令，例如 `doc:overview:cn` 和 `doc:overview:en`。

## 验证要求

每次中文 TypeDoc 生成前至少运行：

```sh
node scripts/docs/generate-api-overview.js --lang cn
yarn typecheck
yarn doc:cn
```

推荐增加一个后续检查脚本，用于验证 `cn` 与目标英文版本除注释和中文文档产物外没有代码差异。该检查可以在流程稳定后实现，避免翻译或冲突处理时误改 SDK 逻辑。

## 失败处理

- 覆盖前 `cn` worktree 不干净：停止流程，先提交或丢弃明确不需要的改动。
- 覆盖后脚本缺失或无法运行：说明目标英文版本中的脚本迁移不完整，应先修复脚本。
- 中文注释恢复脚本运行后仍有大量英文注释：这是预期的待翻译输入，不视为脚本失败。
- overview 生成脚本失败：停止 TypeDoc 生成，先修复脚本或输入源码注释结构。
- `yarn typecheck` 失败：说明 `cn` 工作区不是可编译的目标版本状态，必须先修复。
- `yarn doc:cn` 失败：按 TypeDoc 或项目配置问题处理，不回退到插件替换方案。

## 非目标

- 不在 RN 源码中引入 Flutter 风格的 `~english` / `~chinese` 双语注释块。
- 不使用 TypeDoc 插件在 reflection 阶段替换注释。
- 不维护独立中文源码仓库作为主流程依赖。
- 不维护独立 `api_docs_parser` 项目作为主流程依赖。
- 不让主英文 worktree 发生中文注释覆盖。
- 不使用自动翻译生成正式中文 API 注释。

## 待确认

- 中文 tag 命名是否固定为 `vX.Y.Z-cn`。
- `docs/build/cn` 是否提交到 `cn` 分支，还是只作为发布产物。
- 是否需要封装全量覆盖和恢复注释的脚本。
- overview 缓存目录是否固定为 `docs/api-overview-cache/`。
- overview 脚本是否需要同时支持英文和中文更新，或先只迁移中文流程。
- 是否需要实现“去注释后代码一致性检查”脚本。
