# Example 应用规格：API 可视化测试台

日期：2026-08-04
状态：待用户确认
参考设计：`zuoyu_flutter/docs/spec/2026-07-29-example-api-tester-spec.md`（Flutter 版，设计思路相同，本文件为 RN 落地版）

## 背景与目标

`react-native-chat-sdk/example` 当前只有脚手架和一个占位 `App.tsx`。需要将它建设为一个能**可视化调用任意 SDK API、验证数据真实正确性**的测试应用。

本仓库 RN SDK 基于 native 4.19.x。第一期范围：必要前置 API（初始化、登录、退出、发消息）+ 群组 1 条 + 联系人 1 条。后续升级到 4.22.0 时，再按 Flutter 版第一期清单补齐新 API。

非目标：

- 不做 API 间的依赖编排（有依赖由测试者手动串行调用、复制上一步输出作为下一步输入；AI 模式下提供最小变量引用，见「AI 可用性」）。
- 不做全量 API 覆盖，后续分期扩充。
- 不做 UI 自动化测试框架（detox / maestro 等），AI 通过脚本模式与 stdout 日志驱动和验证。

## 总体结构

```
example/src/
  App.tsx                  // 入口 + NavigationContainer + 全局状态条 + 悬浮日志挂载
  sdk_state.tsx            // React Context：已初始化 / 已登录 / 当前账号
  pages/
    InitPage.tsx           // 初始化（一次性页面）
    LoginPage.tsx          // 登录 / 退出
    SearchPage.tsx         // API 搜索 + 只读全量清单
    ApiCallPage.tsx        // 单个 API 的调用页
  registry/
    api_entry.ts           // ApiEntry 定义
    apis/                  // 按 manager 分文件注册（chat / group / contact）
  log/
    log_store.ts           // 日志存储（追加、清空、复制）+ stdout/文件双写
    floating_log.tsx       // 悬浮日志组件
  listeners.ts             // init 成功后统一注册全部事件监听
  auto/auto_mode.ts        // AI 自动化脚本模式（见「AI 可用性」）
```

页面导航用 `@react-navigation/native-stack`（example 已有依赖）。

## 页面流

```
初始化页 ──init成功──▶ 登录页 ──login成功──▶ 搜索页 ──点击条目──▶ API 调用页
                         ▲                       │                    │
                         └────────── 返回 ───────┴────── 返回 ────────┘
```

- **单向推进**：初始化成功 `navigation.replace` 到登录页，不可返回、不可重新初始化（原生不支持二次 init）。需要换 ChatOptions 重测时，流程为杀 App 重启。
- 登录成功 push 搜索页；搜索页、API 调用页可正常返回到登录页做退出 / 换号。
- 退出登录后已打开的搜索 / 调用页不强制处理；此时调 API 由 SDK 返回真实错误并展示（这本身用于验证错误路径）。
- 顶部状态条常显：`未初始化` / `已初始化，未登录` / `已登录：<userId>`，不做硬性门控。

## 页面规格

### 1. 初始化页（特殊页面）

- 多行 `TextInput` 作 JSON 编辑器，预填 `ChatOptions` **全部必填字段、不含可选字段**的模板 JSON，测试者改值（appKey 等）后点「初始化」。
- 初始化成功后：统一注册全部事件监听（见「事件监听」）、启用悬浮日志、跳转登录页。
- 初始化页的 JSON 内容快照在跳转后继续可见（显示在登录页顶部或状态条展开区），便于杀 App 重测时对照修改。
- 初始化失败：原地展示错误 JSON（code + description），不跳转。

### 2. 登录页

- 开关（`Switch`）切换 **密码 / token** 两种登录方式，输入 username + 密码/token（对应 `ChatClient.getInstance().login(userId, pwdOrToken, isPassword)`）。
- 「登录」「退出」按钮；显示当前登录账号与登录状态。
- 登录 / 退出结果（含错误）展示在页面结果区并写日志。
- 登录成功 push 搜索页（可返回）。

### 3. 搜索页

- 默认显示提示语，无列表；输入关键字**实时过滤**（不打字不显示结果）。
- 匹配规则：**大小写不敏感的子串包含**（`send` 命中 `sendMessage`），不做拼写容错。
- 匹配范围：方法名 + 分组名（搜 `chat` 列出 ChatManager 全部条目）。
- 提供一个不参与搜索的**只读全量 API 清单**入口，仅用于查名字、可复制名称。
- 点击条目进入 API 调用页。

### 4. API 调用页

- 标题：API 全限定名（如 `ChatManager.sendMessage`）+ 简短描述。
- 参数区：多行 `TextInput` JSON 编辑器，预填该 API **必填字段**模板（不含可选参数）。
- 「调用」按钮：JSON → TS 对象 → 调真实 API → 结果序列化。
- 结果区：JSON 格式展示，**可滚动、可一键复制全文**（`Clipboard`）；成功为 `{"success": true, "data": ...}`（void 返回的 API 无 `data`），失败为 `{"success": false, "error": {"code": ..., "message": ...}}`。
- 同一份结果同时写入悬浮日志（来源标记为 API 名）。

### 5. 悬浮日志

- 在 `App.tsx` 根节点（NavigationContainer 之外）渲染一个绝对定位的可拖动视图实现，**init 成功后挂载**，生命周期独立于任何页面，页面切换 / 返回不销毁、不重置。拖动用 `PanResponder`（不引入额外依赖）。
- 常态为可拖动的悬浮小球；点开为全屏日志面板（`Modal`）；可收起回小球。
- 日志条目：`时间戳 | 来源 | 内容`。来源区分监听器名（如 `[ChatMessageEventListener.onMessagesReceived]`）与 API 调用返回。
- 操作：清空、复制全部、关闭面板。
- 超长内容（如批量消息）面板内折叠显示首尾，复制仍复制全文。

## 事件监听

init 成功后统一注册第一期相关的全部 event listener：`ChatClient.getInstance().addConnectionListener`（ChatConnectEventListener）、`chatManager.addMessageListener`（ChatMessageEventListener）、`groupManager.addGroupListener`（ChatGroupEventListener）、`contactManager.addContactListener`（ChatContactEventListener），所有回调打印到悬浮日志。这是验证异步回调数据正确性的主要手段（如 `onMessagesReceived`、`onContactAdded`、`onMemberJoined` 等）。

## AI 可用性

应用同时面向人工测试者与 AI agent。AI 无法操作 UI，因此提供三条机器通道（人工使用不受影响）：

### 1. 结构化 stdout 日志

每一条日志（监听器回调、API 调用返回、生命周期事件）在写入悬浮日志的同时，以**单行 JSON** 通过 `console.log` 输出，固定前缀便于 grep：

```
[APITEST] {"ts": 1722240000000, "seq": 12, "source": "ChatMessageEventListener.onMessagesReceived", "payload": {...}}
[APITEST] {"ts": 1722240001000, "seq": 13, "source": "api.ChatManager.sendMessage", "payload": {"success": true, "data": {...}}}
```

- `seq` 全局递增，AI 可据此判断日志顺序与完整性。
- AI 的典型用法：`react-native start` / `run-ios` / `run-android` 挂后台，按前缀过滤读取输出（iOS 模拟器走 metro/xcode 控制台，Android 走 `adb logcat`）。

### 2. 日志落盘

日志同时追加写入应用文档目录下的 `api_test.log`（同格式单行 JSON，用 `react-native-fs`，example 已有依赖），App 启动时把文件绝对路径打印到 stdout（`[APITEST] {"source": "log.path", ...}`）。用于真机/模拟器脱离控制台后的追溯。

### 3. 自动化脚本模式

通过打包期环境变量 `API_SCRIPT=<脚本文件绝对路径>` 启动即进入自动模式（`API_SCRIPT=... npx react-native start` 后打包运行；babel preset 的 inline-environment-variables 会在打包时内联 `process.env.API_SCRIPT`）。iOS 模拟器与宿主机共享文件系统，`react-native-fs` 可直接读宿主机绝对路径：

```json
{
  "steps": [
    { "api": "ChatManager.sendMessage", "id": "m1", "params": { "to": "$config.accounts.0.id", ... }, "delayAfterMs": 1000 }
  ]
}
```

测试数据统一来自 `example/src/env.ts`（由 `scripts/generate-env.js` 生成，已被 gitignore，不入库），人工模式与脚本模式共用同一份数据：人工模式的初始化页/登录页从 env.ts 预填 appKey/账号，脚本模式的 `$config.*` 引用也解析到 env.ts 的导出值。env.ts 中 appKey/appId/accounts/groups 等为数组形态，取首元素作为默认值（空串视为未配置）；`init` 由 env.ts 的 ChatOptions 键（appKey、appId、autoLogin、debugModel 等）推导，`login` 由 `accounts[0].id` + `accounts[0].mm` 推导；脚本显式给出 `init`/`login` 则覆盖。需要整套替换数据源时，可用打包期环境变量 `API_CONFIG=<json 绝对路径>` 指定外部 JSON 覆盖 env.ts（Android 真机/模拟器场景）。

行为：

- 跳过初始化页 / 登录页交互，自动执行 init → login → 逐步串行执行 `steps`，全部结果走同一条结构化日志通道。
- 字符串引用（恰好整个字符串匹配才替换，保留原值类型）：
  - `"$config.key"` / `"$config.key.0.sub"`：取 env.ts 导出值（或 `API_CONFIG` 覆盖值），数组用数字路径段；
  - `"$prev"` / `"$prev.a.b"`：上一步返回的 `data`，点路径可深入（列表用数字下标）；
  - `"$step.id"` / `"$step.id.a.b"`：某个带 `"id"` 的 step 的 `data`，跨步引用。
- `login` 支持 `password` 或 `token` 字段二选一。login 失败自动重试至多 5 次（间隔 1s，逐次记录）——native init 的返回后 SDK 内部可能尚未就绪（Flutter 版实测 init 成功 2ms 后 login 报 "SDK has not initialize"）。
- 每步有超时保护（默认 30s，可用 `"timeoutMs"` 按步覆盖）：超时记 `{"code": -2}` 并继续——native 在某些状态下可能永不回调，不能让脚本整体卡死。
- 全部步骤完成后输出 `[APITEST] {"source": "script.done", "payload": {"total": N, "failed": M}}`，App 保持运行（监听器持续打日志），AI 读取日志自行断言。
- 脚本任一步失败不中断后续步骤，失败计入 `failed`。
- 未传 `API_SCRIPT` 时应用行为与人工模式完全一致。
- Android 注意：模拟器/真机是独立文件系统，宿主机路径不存在（iOS 模拟器共享宿主机文件系统，Android 不是）。需先 `adb push` 脚本到应用专属外部目录（`/sdcard/Android/data/<包名>/files/`，免权限），`API_SCRIPT` 传设备路径；同理 `API_CONFIG` 覆盖文件也需 push。
- 注：第一期不实现 base64 落文件伪 API（Flutter 版的 `TestUtil.writeBase64File` 用于构造图片/语音消息，第一期没有附件类 API 用不到）。

## API 注册表

RN 无运行时反射（JS 侧按名字动态调用 manager 方法理论上可行，但参数/结果需要逐条适配），API 名称 → 调用必须人工注册：

```ts
interface ApiEntry {
  name: string;            // 'ChatManager.sendMessage'
  group: string;           // 'ChatManager'
  description: string;
  paramsTemplate: string;  // 必填字段 JSON 模板
  invoke: (params: Record<string, any>) => Promise<any>;
}
```

- 每条适配约 15~30 行：JSON → TS（模型类优先用 SDK 既有导出，基本类型手动取）→ 调用 → 结果序列化。
- **round-trip 验证**：输出 JSON 应能作为下一条 API 的输入直接复用（如 `sendMessage` 的输出粘贴为后续下载/转换类 API 的输入）。实现时逐条验证，个别不兼容字段在条目 `description` 中标注。

## 第一期 API 清单

前置（4 条）：

| API | 说明 |
|---|---|
| `ChatClient.init` | 初始化页专用，不进搜索 |
| `ChatClient.login` | 登录页专用（密码 / token） |
| `ChatClient.logout` | 登录页专用 |
| `ChatManager.sendMessage` | 进搜索，接收完整消息 JSON（构造测试数据 + 串联输出） |

验证目标（2 条，对应 native 4.19.x 现有能力）：

| API | 分组 |
|---|---|
| `ChatGroupManager.fetchJoinedGroupsFromServer` | GroupManager |
| `ChatContactManager.fetchAllContacts` | ContactManager |

后续升级到 4.22.0 时，按 Flutter 版第一期清单补齐 4.22 新增 API（`downloadBigImage`、`voiceMessageToText`、`updateGroupNamecard`、`subscribeUsersInfo` 等）。

## 验收标准

1. 占位 `App.tsx` 移除，`tsc --noEmit`（example）0 error。
2. 四个页面按上述流转：初始化 → 登录 → 搜索 → 调用；初始化不可返回重做。
3. 搜索：实时、大小写不敏感子串、命中方法名与分组名；有只读全量清单。
4. 悬浮日志：init 后存在、跨页面存活、可拖动/收起/清空/复制；全部监听器回调有输出。
5. 第一期 6 条 API 全部可调用，结果双写（页面 + 日志）、JSON 可复制。
6. `sendMessage` 输出 JSON 可直接粘贴复用（round-trip 成立）。
7. iOS / Android example 均能编译运行（`build:ios` / `build:android` 双端通过）。
8. 每条日志 stdout 可见，格式为 `[APITEST]` 前缀单行 JSON，`seq` 递增无跳号；日志文件路径在启动时打印。
9. 脚本模式：`API_SCRIPT=...` 启动后无人工干预跑完 init → login → steps，`script.done` 汇总正确，`"$prev"` / `"$config.*"` 替换生效；不传该参数时人工模式行为不变。
