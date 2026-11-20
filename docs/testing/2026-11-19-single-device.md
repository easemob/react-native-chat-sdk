# 单设备 API 脚本（example/ci）

## 定位

单设备脚本层用 `example` 应用的 auto mode 执行一份 JSON：一次启动、一个客户端、按顺序调用真实 native API，宿主根据 `[APITEST]` 日志逐步骤判定。它适合：

- 某版本平版后的逐 API 验收（参数、返回字段、错误码）；
- Jira 工单的最小复现与回归；
- 需要精确控制 `init`/`login` 前置的一次性验证。

它不追求长期可重复的 CI 口径（没有 mapping、entry、清理纪律），也不验证需要第二个客户端的行为。公开契约的长期回归用 [CI 设备回归](2026-11-19-ci.md)；多客户端行为用[多设备协同](2026-11-19-multi-device.md)。

仓库初始化（Node/Yarn/JDK/SDK/Xcode/CocoaPods）、账号配置和设备启动步骤见[测试指南的“开始之前”](README.md#开始之前环境与项目初始化)以及 [CI 文档的“从零开始”](2026-11-19-ci.md#从零开始初始化设备与数据)。本节只列单设备层额外的要求。

## 运行机制

1. `auto_script_local.sh` 构建应用，把 `API_SCRIPT`（设备上的脚本路径）和 JS bundle 内联进包；启动后 auto mode 读取脚本。
2. `init` 以 `example/src/env.ts` 的 ChatOptions 为基座，脚本里的 `init` 覆盖同名字段；`login` 默认取 `accounts[0]`，也可在脚本中显式指定或关闭。
3. 步骤串行执行，单步失败不会中断后续步骤；成功步骤的结果写入 `$prev` 和 `$step.<id>`，失败步骤清空 `$prev`。
4. 宿主侧 `scripts/ci/script_results.js` 按日志逐个检查 `expect`：失败、依赖被阻断、崩溃、未执行分别标记；`auto_report.js` 汇总成报告。
5. `auto_report.js` 有三种模式：跑设备、从已有日志重建报告、对比 Android/iOS 两份报告。

一次构建只内联一份脚本，切换脚本必须重新构建。`auto_script_local.sh` 每次会清理 Metro 缓存，因为 `API_SCRIPT` 不被 Gradle/Metro 的缓存键跟踪。

## 脚本格式

顶层字段：

| 字段    | 必填 | 含义                                                                                          |
| ------- | ---- | --------------------------------------------------------------------------------------------- |
| `init`  | 否   | 覆盖 env 推导出的 ChatOptions；缺省时完全使用 env。                                           |
| `login` | 否   | `false` 表示保持未登录；`{ userId?, token? }` 显式指定登录账号；缺省用 env 的 `accounts[0]`。 |
| `steps` | 是   | 顺序执行的步骤数组。                                                                          |

步骤字段：

| 字段           | 必填 | 含义                                                                                                                                                |
| -------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api`          | 是   | API registry 名称，如 `ChatManager.sendMessage`。                                                                                                   |
| `id`           | 否   | 步骤标识，供后续步骤的 `$step.<id>` 引用，也出现在报告里。                                                                                          |
| `params`       | 否   | 调用参数，可含下表的引用表达式。                                                                                                                    |
| `timeoutMs`    | 否   | 单步超时，默认 30000ms。                                                                                                                            |
| `delayAfterMs` | 否   | 步骤执行后的节流等待；不能代替事件等待或断言。                                                                                                      |
| `expect`       | 是   | 宿主判定条件：`{ "success": true }`，或 `{ "success": false, "errorCode": <number> }`。`errorCode` 会与 `error.code` 精确比较，不是范围或前缀匹配。 |

参数引用：

| 表达式                | 来源                                                          |
| --------------------- | ------------------------------------------------------------- |
| `$config.<path>`      | `example/src/env.ts` 的配置（appKey、accounts、restApi 等）。 |
| `$prev[.<path>]`      | 上一个成功步骤的返回值。                                      |
| `$step.<id>[.<path>]` | 指定 id 的成功步骤返回值。                                    |

引用只在整个字符串完全匹配时替换，并保留原类型；数组和对象会递归处理。步骤失败后 `$prev` 清空，依赖它的后续步骤会被判为 `blocked`，而不是 `fail`。

判定结果：

- `passed`：有结果且 `expect` 满足；
- `failed`：有结果但 `expect` 不满足；
- `blocked`：参数引用的步骤未通过，依赖结果不可用；
- `crashed`：有崩溃证据时，第一个没有结果的步骤；
- `not-run`：日志里没有该步骤的结果，也没有崩溃证据。

另外会校验 `init`/`login` 成功，以及 `script.done.total` 与步骤数一致；任何一项不满足都算本次运行失败。`auto_report.js` 在有失败或崩溃时以非 0 退出。

脚本里可以用 `_comment` 字段记录环境前提和已知限制；执行引擎会忽略未知顶层字段。示例可参考 `example/ci/port_5_0_0_positive.json`。

## 现有脚本

| 文件                                 | 步骤 | 用途与注意事项                                                                                                                  |
| ------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| `port_5_0_0_positive.json`           | 18   | 5.0.0 平版正向基线；显式 `init.debugModel=true`；辅助的 `sendMessage`/`destroyGroup` 只做前置与清理，报告解读时不计入被测 API。 |
| `port_5_0_0_negative.json`           | 10   | 5.0.0 反向：非法参数、缺失资源、无效 token。`_comment` 记录了不执行的场景与集群限制。                                           |
| `port_5_1_0_positive.json`           | 15   | 5.1.0 正向；省略 `init`，依赖 env 推导；要求 `chatOptions.autoLoadConversations=false`。                                        |
| `port_5_1_0_negative.json`           | 2    | 5.1.0 反向：非法 cursor 期望 `INVALID`；同样要求 `autoLoadConversations=false`。                                                |
| `port_4_24_1.json`                   | 6    | 4.24.1 基线回归，保留用于老版本对比。                                                                                           |
| `him_delete_conversations_edge.json` | 1    | 删除会话边界场景的工单复现。                                                                                                    |
| `him_delete_conversations.json`      | 5    | 删除会话相关工单回归。                                                                                                          |
| `him_unread_count.json`              | 1    | 未读数相关工单回归。                                                                                                            |
| `him23707_keyword_senders.json`      | 6    | HIM-23707：按发送者关键词搜索消息。                                                                                             |

`him_*` 是历史工单资产，仍然可直接运行；它们断言的是工单场景，不要当作全量 API 覆盖。

## 前置与凭据

1. `example/config.local.json`（gitignored）提供 `appKey`、`restApi`、`clientId`、`clientSecret`、`accounts[].id`，以及 `chatOptions`。账号建议固定为测试账号；取 token 时带 `autoCreateUser=true`，集群允许时会自动创建，关闭该能力时需先在控制台创建。字段模板与获取方式见 [CI 文档的“准备账号与凭据”](2026-11-19-ci.md#3-准备账号与凭据)。
2. `yarn env:gettoken` 用 client 凭据取 App Token，再逐账号取 User Token（`autoCreateUser=true`），全量重写 `example/src/env.ts`。`env.ts` 是生成文件，不要手改；token 过期后重新执行。
3. `yarn gen:env_file` 只在 `env.ts` 不存在时生成占位，不会刷新 token；`yarn report:api` 会自动执行它。
4. 5.1.0 的两个脚本要求先把 `config.local.json` 的 `chatOptions.autoLoadConversations` 设为 `false`，再执行 `yarn env:gettoken`；否则 init 与脚本预期不一致。
5. iOS 构建前默认会刷新 CocoaPods 依赖（`bundle check`/必要时 `bundle install`，再 `pod install`）；设置 `SKIP_POD_INSTALL=1` 可跳过。若 Pods 已损坏或想手动修复，可执行：

   ```bash
   cd example
   bundle exec pod install --project-directory=ios
   cd ..
   ```

6. 设备必须显式选中：通过 `yarn report:api` 跑时用 `--device <serial|UDID>`（Android 会设置 `ANDROID_SERIAL`，iOS 会设置 `DEVICE_UDID`），也可以直接导出这两个变量。Android 不传时要求恰好一台在线设备，多台会直接报错；iOS 设置 `DEVICE_UDID` 时会校验并启动该模拟器，不传时 0 台 booted 自动启动一台、恰好 1 台直接用、多台则报错。仍建议每次显式指定。

## 执行

```bash
# 刷新 token（改过 config.local.json 后必须执行）
yarn env:gettoken

# 默认跑 5.0.0 正向脚本
yarn report:api --platform android
yarn report:api --platform ios

# 指定脚本/设备
yarn report:api --platform android --script example/ci/port_5_0_0_negative.json
yarn report:api --platform ios --device <UDID> --script example/ci/port_5_1_0_positive.json

# 不跑设备，只从已有日志重建报告
yarn report:api --platform android --from-log artifacts/single/<timestamp>/android/events.sanitized.jsonl

# 对比两端已完成运行的报告
yarn report:api \
  --android-report artifacts/single/<安卓 timestamp>/android \
  --ios-report artifacts/single/<iOS timestamp>/ios
```

`--device` 对 Android 设置 `ANDROID_SERIAL`，对 iOS 设置模拟器 UDID；也可以直接导出这两个变量，效果相同。不传时 Android 要求恰好一台在线设备（多台报错）；iOS 0 台 booted 自动启动一台、恰好 1 台直接使用、多台报错。iOS 指定了 `DEVICE_UDID` 但尚未启动时，脚本会先启动并等待它。

底层入口是 `bash scripts/ci/auto_script_local.sh <android|ios>`，它只跑默认脚本、不写 `auto_report` 报告，通常不需要直接调用。

## 报告

报告目录为 `artifacts/single/<local timestamp>/<platform>/`：目录名使用运行机器本地时间，格式为 `YYYYMMDDHHMMSS`，报告中的 ISO 时间字段仍保留 UTC。平台是下一级子目录；Android 和 iOS 即使同时运行也不会互相覆盖。SDK 版本记录在 `run.json`/`report.json` 的 `sdkVersion` 字段，不再作为目录层级；当前 SDK 版本不等于脚本文件名里的版本。设备、脚本和 commit 也记录在 `run.json` 里。

| 文件                     | 内容                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| `report.md`              | 运行摘要、步骤状态统计、失败步骤与错误信息。                           |
| `report.json`            | 机器可读的 runId、平台、计数、失败数。                                 |
| `run.json`               | commit、工作区是否 dirty、脚本哈希、实际 native/SDK 版本、平台与设备。 |
| `steps.json`             | 每个步骤的 api、id、status、耗时与结果摘要。                           |
| `events.sanitized.jsonl` | 已脱敏的 `[APITEST]` 结构化日志；对外分享前仍建议人工复核。            |
| `issues.md`              | 从失败/崩溃中提取的问题候选，便于转工单。                              |
| `crash.log`              | 采集到的崩溃证据（如有）。                                             |

对比模式输出 `artifacts/single/<local timestamp>/comparison.md`，整个对比也只占一个时间戳目录；按步骤 id 对齐两端的 status、参数语义和返回结构，并统计不匹配项。报告在 `artifacts/` 下，默认不进 Git；对外分享前仍要确认脱敏结果不含账号、token 或设备 ID。

## 已知限制

- `fetchGroupMessageReadReceipts` 的“缺失消息”场景会触发 Android native 崩溃，已从负向脚本中排除；在 native 修复前不要重新加入。
- `modifyMsgBody` 在未开通消息编辑能力的集群上返回 305，属于环境限制；脚本仍按契约期待成功，需要在报告与工单中标注为环境限制，不能据此判定 SDK 回归。
- 负向脚本中个别错误码可能与当前实现不同（例如缺失消息回执）；这类差异应作为待确认的契约问题保留为失败，不要通过放宽断言转绿。
- 步骤失败不会中断后续步骤，因此一次运行可以看到多个问题；但依赖失败步骤的后续步骤只会记为 `blocked`，解读时要区分。

## 新增与维护

1. 按场景写 JSON：正向与负向分开，按版本命名 `port_<版本>_*` 或按工单命名 `him<编号>_*`。
2. 每一步都写 `id`（需要被引用时）和 `expect`；引用返回值用 `$step.<id>`，不要复制硬编码 ID。
3. 账号、appKey 等一律通过 `$config` 引用；脚本中不得出现 token。
4. 先在本地跑一次，确认 `report.md` 的步骤数与预期一致；有环境限制时写进 `_comment`，不要靠放宽断言。
5. 修改 `init` 语义或脚本引擎时，同时更新本节和 `example/src/auto/auto_mode.ts` 的说明。
