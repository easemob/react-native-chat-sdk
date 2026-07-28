---
name: rn-sdk-cn-typedoc
description: Use when updating the react-native-chat-sdk cn branch for a Chinese TypeDoc release — syncing the cn worktree to a target English tag, restoring Chinese API comments, handing off for human translation, then generating docs and committing/tagging after translation is confirmed.
---

# RN SDK 中文 TypeDoc 发版流程（cn worktree）

设计依据：`react-native-chat-sdk/docs/superpowers/specs/2026-07-14-cn-typedoc-worktree-design.md`（决策版，先读它再动手）。

## 仓库布局

所有命令在子项目内执行（路径相对于工作区根 `/Users/asterisk/Codes/zuoyu_rn`）：

- 仓库：`react-native-chat-sdk/`（独立 git 仓库）
- 英文主 worktree：仓库根，分支 `dev`，工具脚本在 `scripts/docs/`
- 中文 worktree：`react-native-chat-sdk/.worktree/cn`，分支 `cn`（中文注释资产分支）
- 工具脚本：`scripts/docs/restore-cn-api-comments.py`、`scripts/docs/generate-api-overview.js`

分支与 tag 模型：`dev` 是英文开发分支；`cn` 只保存中文注释资产和中文文档生成状态；中文版本 tag 固定为 `vX.Y.Z-cn`。

## 硬性规则

- **绝不代写正式中文注释**。中文注释由人工维护，禁止大模型/自动翻译。agent 只恢复已有中文、定位待翻译项，翻译永远由人完成。
- **人工通读 `git diff` 是硬性关卡**。恢复脚本对 `@param` 增删无告警，未经人工确认不得进入生成阶段。
- `docs/build/`、`docs/api-overview-cache/` 永不提交。
- `cn` 分支可随意删除/reset，但重建时只能 reset 到保存资产的状态（如 `easemob/cn`），**绝不能 reset 到 `dev`**。
- commit/tag 在 `react-native-chat-sdk` 仓库内执行；push 需要用户明确批准。
- 拿到目标版本时，用 `git tag --sort=-creatordate` 确认最新稳定 tag（跳过 `-beta` 等预发布），并与用户确认。

## 阶段 A：同步 + 恢复（做完即停，交人工）

1. 确认 worktree 干净：`cd react-native-chat-sdk/.worktree/cn && git status --short`。不干净则停止，交给用户处理。
2. 同步为目标英文版本（假设 `v1.15.3`）：

   ```sh
   git ls-files -z | xargs -0 rm -f
   git archive v1.15.3 | tar -x
   ```

   用 `git status --short` 确认变化范围（D/M/?? 三类）。不要用 `rm + cp -R`（会毁掉 worktree 的 `.git` 指针文件），不要用 `git restore --source=<tag> --worktree`（不创建新增文件、残留已删文件）。
3. 恢复工具脚本：
   - 若 `scripts/docs/` 已提交到 `cn`：`git checkout HEAD -- scripts/`
   - 否则从英文 worktree 拷贝：`mkdir -p scripts/docs && cp -R ../../scripts/docs/. scripts/docs/`
   - 注意 `cp -R ../../scripts ./scripts` 在目标目录已存在时会嵌套成 `scripts/scripts/`，必须用上面的 `源/.` 写法。
4. `yarn install`：archive 替换 package.json/yarn.lock 后 yarn 安装状态失配，`yarn exec`/`yarn typecheck` 会报 `command not found: tsc`，必须先重装。
5. 恢复中文注释：`python3 scripts/docs/restore-cn-api-comments.py src`。关注输出统计：处理文件数、恢复中文块数、保留英文块数、校验失败文件清单（校验失败的文件已安全保留英文，不阻断，但要列入人工处理清单）。
6. 定位残留英文注释块（脚本只给数量，用下面的片段给出具体位置，见附录）。
7. **停止并交接**：报告统计结果 + 待翻译清单（文件和注释块位置），提醒人工通读 `git diff`（重点查 `@param` 是否过期）。此时不提交、不生成文档。

## 阶段 B：翻译确认后生成 + 提交

用户确认翻译完成后再执行：

1. 复跑附录片段确认残留英文块为 0。
2. 生成 overview：`node scripts/docs/generate-api-overview.js --lang cn`。
   - 发行 tag 的 package.json 里没有 `doc:overview:*` 脚本（只在 dev 上有），必须直接调 node。
3. `yarn typecheck`。
4. `yarn doc:cn`（0 errors 即通过，warnings 是既有基线）。
5. HTML 后处理：`node ./scripts/update_api_docs.js <版本号> undefined easemob cn`。
   - 不要用 `yarn doc:cn:update`，它硬编码旧版本号；版本号参数会写进 HTML 标题。
6. 抽查产物：HTML 标题版本号正确、新翻译条目进入 `docs/build/cn/` 对应页面、核心类页面（如 `classes/ChatManager.html`）中文化正常。
7. 提交前检查 `docs/.gitignore`：发行 tag 里的版本可能缺 `/build/` 和 `/api-overview-cache/`，缺则从英文 worktree 同步过来，否则 `git add -A` 会把缓存目录提交进去。
8. 提交并打 tag：

   ```sh
   git add -A
   git commit --no-verify -m "docs: update cn api comments for X.Y.Z"
   git tag vX.Y.Z-cn
   ```

   - lefthook 的 lint 步骤会对 `.kiro/` 等被 eslint 忽略的 staged 文件报 "File ignored by default" 并以 1 退出，是误伤；先跑全量 `yarn lint` 确认通过，再用 `--no-verify` 提交（types/contract/test 钩子已通过）。
   - **tag 必须在 commit 成功后创建**；若 commit 被钩子拒绝，已建的 tag 会指向旧 HEAD，要 `git tag -d` 后重建。
9. 汇报 commit hash 和 tag，是否 push 由用户决定。

## 附录：定位残留英文注释块

在 cn worktree 根目录执行（把 `v1.15.3` 换成目标 tag）。原理：工作区里与目标英文版本完全一致的 doc 注释块 = 未翻译。

```sh
python3 - <<'EOF'
import re, subprocess
files = subprocess.run(['git','diff','--name-only','HEAD','--','src'],
                       capture_output=True,text=True).stdout.split()
block_re = re.compile(r'/\*\*.*?\*/', re.S)
found = 0
for f in files:
    old = subprocess.run(['git','show','v1.15.3:'+f],
                         capture_output=True,text=True).stdout
    new = open(f,encoding='utf-8').read()
    old_blocks = set(b.strip() for b in block_re.findall(old))
    for b in block_re.findall(new):
        if b.strip() in old_blocks and len(b) > 40:
            found += 1
            first = [l.strip() for l in b.splitlines() if l.strip()][:3]
            print(f'== {f}'); print('\n'.join(first)); print()
print(f'remaining english blocks: {found}')
EOF
```

## 其他环境坑

- `yarn typecheck` 报 `src/version.ts` 或 `example/src/env.ts` 缺失：这两个是 gitignored 生成文件，跑 `yarn gen:version_file` 和 `yarn gen:env_file`；example 生成的 `env.ts` 空数组会导致 demo2 编译错误，需填占位字符串（如 `['']`），该文件不入库。
- overview 脚本警告"小节不在固定顺序列表中已被丢弃"是既有行为（数据类 class 本就不进 overview 表格），只要与既有文档对齐即正常。
