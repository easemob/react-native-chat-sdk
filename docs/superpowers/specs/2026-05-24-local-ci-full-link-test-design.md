# 本地 CI 与 Full Link Test 应用设计文档

- **日期**：2026-05-24
- **项目**：react-native-chat-sdk-rn72
- **状态**：设计完成

## 1. 总体目标

本设计面向**数据全链路测试**，不是普通 Jest 单测、三端关键字对齐测试，也不是 UI 自动化测试。

当前目标是搭建一套可运行、可统计、可发布前裁剪的本地 Full Link Test 闭环：

```text
启动 example 测试应用
→ 读取本地 runMode 配置
→ manual 模式支持用户手动执行
→ auto 模式支持 CI 自动执行
→ 执行统一 FullLinkTestRunner
→ 通过测试 native 调用通道触发 native wrapper
→ native 侧可使用 mock/fake provider
→ TS / Android / iOS 持续打印结构化日志事件
→ CI 监听平台日志并按 runId 聚合事件
→ CI 在宿主机生成 Markdown 报告
→ CI 根据 completed 事件返回 exit code
```

第一阶段验收必须包含代表性 case，不以空 case 集合作为最终闭环。每个 manager 至少选择一个有代表性的 API 示例，验证 bridge → native entry → wrapper/test adapter → provider/facade → mock provider → wrapper 结果转换 → bridge 返回 → TS decode/assertion 链路。具体业务 API 和 fake 数据可以后续细化，但第一阶段跑通时必须能证明每个 manager 的代表链路被执行过。

## 2. 范围

本设计包含：

- `example/src/fulllinktest` 独立测试应用。
- `fullLinkTestConfig.ts` 本地配置。
- `FullLinkTestRunner` 框架。
- manual UI 和 auto 启动行为。
- 结构化日志事件协议。
- CI 监听 Android/iOS 平台日志。
- CI 在宿主机生成 Markdown 报告。
- 本地 CI 脚本入口。
- native full link test 调用通道。
- mock scenario 参数模型。
- provider/facade mock 基础结构。
- 开发态保留测试代码。
- 发布态裁剪纯测试代码。
- release worktree 打包发布流程。
- publish guard。

本设计不包含：

- 具体全链路业务测试 API 选择。
- 具体 fake 数据。
- 每个 manager 的完整测试用例集合。
- suite/group/smoke/full 筛选。
- 远程云 CI。
- 环境变量配置方案。
- `adb` / `xcrun` runtime 参数传递。
- CI 自己拆 build/install/launch。
- CI 参数透传给 `yarn example ios/android`。
- App 内状态文件写入。
- App 内 Markdown 报告生成。
- RNFS 文件同步方案。
- HTML 报告。
- 基于 `example/src/demo2` 改造。

后续应单独设计“全链路测试用例与 native fake provider/facade 细节”，因为完整 case 集合、mock 数据、fake provider 行为强相关。本文档只要求第一阶段每个 manager 有一个代表性示例，避免框架闭环跑通但 native 测试链路没有被实际覆盖。

## 3. 目录结构

不改造现有目录：

```text
example/src/demo2
```

新增独立目录：

```text
example/src/fulllinktest/
```

建议结构：

```text
example/src/fulllinktest/
  App.tsx
  index.tsx
  fullLinkTestConfig.ts
  core/
    FullLinkTestDefinitions.ts
    FullLinkTestRunner.ts
    FullLinkTestResult.ts
    FullLinkTestStatus.ts
    FullLinkTestLogger.ts
    FullLinkTestCancellation.ts
    FullLinkTestNative.ts
    FullLinkMockScenario.ts
  ui/
    FullLinkTestScreen.tsx
    FullLinkTestControls.tsx
    FullLinkTestProgress.tsx
    FullLinkTestResultView.tsx
```

文件职责：

- `App.tsx`：Full Link Test 被测应用入口，直接渲染测试页面。
- `index.tsx`：Full Link Test 子应用导出入口，供 `example/index.js` 切换 import 使用。
- `fullLinkTestConfig.ts`：本地生成配置，保存 `runMode` 和 `runId`，不进入 git。
- `core/FullLinkTestDefinitions.ts`：集中定义第一阶段要执行的 manager 代表性 case。
- `core/FullLinkTestRunner.ts`：唯一执行核心，负责顺序执行 case、处理取消、汇总结果并输出结构化日志。
- `core/FullLinkTestResult.ts`：runner 返回给 UI 和 auto 模式的结构化结果模型。
- `core/FullLinkTestStatus.ts`：运行状态、最终结果、case phase/result 等枚举或联合类型。
- `core/FullLinkTestLogger.ts`：四类 `[fulllinktest]` 日志事件的唯一格式化出口。
- `core/FullLinkTestCancellation.ts`：封装 Stop/cancellation flag，避免 UI 和 runner 直接共享可变状态。
- `core/FullLinkTestNative.ts`：封装 `fullLinkTestCallMethod`，统一 TS 到 native test channel 的调用参数。
- `core/FullLinkMockScenario.ts`：定义 mock scenario 类型，用于表达 success/failure/progress/delay/response 等 native fake 行为。
- `ui/FullLinkTestScreen.tsx`：页面容器，组合 controls/progress/result view。
- `ui/FullLinkTestControls.tsx`：Start/Stop 控件和按钮状态。
- `ui/FullLinkTestProgress.tsx`：执行中状态、当前 case、计数和耗时展示。
- `ui/FullLinkTestResultView.tsx`：执行完成后的统计结果和失败摘要展示。

`App.tsx` 是 Full Link Test 被测应用入口。第一阶段不需要导航，直接渲染测试页面。

第一阶段采用最简单的入口切换方式：直接修改 `example/index.js`，注释掉原 demo2 入口，改为 Full Link Test 入口。

```ts
// import App from './src/demo2/App';
import App from './src/fulllinktest/App';
```

该切换是开发/CI 本地工作区行为，不作为发布包能力，也不需要在第一阶段设计自动入口选择机制。

## 4. 本地配置

第一阶段不使用环境变量，不使用 runtime launch arguments。

不使用：

```text
adb shell am start --es ...
xcrun simctl launch --args ...
```

原因：

- React Native TS runtime 不能可靠直接读取 shell 环境变量。
- runtime launch 参数会导致二次启动，或者要求 CI 自己维护 build/install/launch。
- 本项目已有 `example/src/env.ts` 这种本地 TS 配置文件模式。
- `runMode` 是 TS 测试应用层行为，不需要 native 层参与。

采用本地 TS 配置文件：

```text
example/src/fulllinktest/fullLinkTestConfig.ts
```

该文件不进入 git，规则与现有 `example/src/env.ts` 一致：源码直接 import 本地配置文件，但文件本身由生成脚本创建，并通过 `.gitignore` 忽略。`env.ts` 当前在 `yarn prepare` 阶段由 `scripts/generate-env.js` 生成；`fullLinkTestConfig.ts` 也采用同样模式，新增专用生成脚本在文件不存在时写入默认值。

默认内容：

```ts
export const fullLinkTestConfig = {
  runMode: 'manual' as 'manual' | 'auto',
  runId: 'local-manual-default',
};
```

只保留 `runMode` 和 `runId`。

不包含：

- `platform`
- `suite`
- `group`

原因：

- `platform` 由实际运行环境决定，TS 使用 `Platform.OS` 获取。
- suite/group 第一阶段不需要，默认执行全部测试。
- `runMode` 是需要配置文件控制的启动行为。
- `runId` 是必填字段，测试模式启动前必须可用。默认生成值只服务 manual 本地启动；CI 每次运行前必须生成新的唯一 `runId` 并写入配置文件。

CI 运行前直接检查或替换该文件，将 `runMode` 设置为 `auto`，并写入本次唯一 `runId`。应用启动后读取该 `runId`，后续 TS 调 native test channel、TS/native 打印结构化日志、CI 过滤统计都使用同一个值。CI 结束后不恢复，文件是本地配置，使用者负责当前机器状态。

生成、使用和忽略规则参考现有 `example/src/env.ts`：

- 通过脚本在文件不存在时生成默认配置，脚本行为参考 `scripts/generate-env.js`。
- 接入 `prepare`，方式参考当前 `gen:env_file`，保证普通开发者执行 `yarn prepare` 后可以直接启动 example。
- CI 脚本不能依赖用户手动运行 `prepare`，需要在运行前自行检查或生成配置，并覆盖写入本次 `runMode=auto` 和唯一 `runId`。
- `.gitignore` 需要覆盖该本地配置文件，规则可参考当前 `env.ts` 忽略方式。

## 5. 手动模式

当：

```ts
runMode: 'manual'
```

应用行为：

- 启动后不自动执行测试。
- 用户看到 Full Link Test 页面。
- 用户点击 Start 后执行。
- 用户可在 running 状态点击 Stop。
- 执行完成后展示结果摘要和进度。

按钮状态：

```text
initializing/completed:
  Start enabled
  Stop disabled

running:
  Start disabled
  Stop enabled
```

Stop 语义：

- 不强杀已经发出的 native async call。
- 设置 cancellation flag。
- 当前 case 返回后停止继续执行后续 case。
- 最终状态为 `completed`，`result` 为 `stopped`。
- 已完成 case 保留结果。
- 未执行 case 统一标记为 `skipped`，并在 message 中记录 stopped before execution；日志事件和报告第一阶段不引入 `pending` 统计。

## 6. Auto 模式

当：

```ts
runMode: 'auto'
```

应用行为：

- 应用启动后自动调用 `FullLinkTestRunner`。
- 默认执行全部测试 case。
- 执行过程中持续打印 `[fulllinktest]` 结构化日志事件。
- 执行完成后打印 `status=completed` 的 `[fulllinktest][state]` 事件。

CI 平台脚本在运行前写入：

```ts
runMode: 'auto'
```

然后复用现有 RN CLI 入口：

```sh
yarn example ios
yarn example android
```

不拆分 build/install/launch，降低维护成本。

## 7. Runner 设计

`FullLinkTestRunner` 是唯一测试执行核心。

UI 手动执行和 CI auto 执行都调用同一个 runner。

职责：

- 读取 `FullLinkTestDefinitions`。
- 计算 `total`。
- 顺序执行全部 case。
- 记录 `startedAt`、`finishedAt`、`duration`。
- 捕获断言失败和运行时错误。
- 支持 cancellation flag。
- 调用 native full link test 通道。
- 打印 `[fulllinktest]` 结构化日志事件。
- 生成 `FullLinkTestResult`。
- 返回结构化结果。

第一阶段默认执行全部 case：

- 无 smoke/full。
- 无 group。
- 无 suite。

第一阶段 case 不允许为空。每个 manager 至少提供一个代表性 case，case 可以先覆盖最关键的 success 或 failure 链路，但必须实际调用 native full link test 通道并完成 TS assertion。

## 8. UI 设计

Full Link Test UI 第一阶段只做工具界面，不做导航。

UI 展示内容：

- Run Mode
- Current Status
- Start
- Stop
- Progress: completed / total
- Passed
- Failed
- Skipped
- Current Case
- Duration
- Error Summary

执行中展示：

- 当前执行状态。
- 已执行用例数量 / 总用例数量。
- 当前 case 名称。
- 已通过/失败/跳过数量。
- 耗时。

执行结束展示：

- 最终状态。
- 统计结果。
- 失败摘要。

Full Link Test 应用不生成报告，也不展示宿主机报告路径。报告路径只由 CI 脚本在宿主机 stdout 中打印。

## 9. 日志事件协议

测试应用通过平台日志向 CI 暴露执行状态、进度、错误和必要堆栈。

第一阶段不写 app 内状态文件，不使用 RNFS 同步状态，不由测试应用生成 Markdown 报告。CI 是唯一的结果聚合方和 Markdown 报告生成方。

统一平台日志 tag：

```text
fulllinktest
```

应用写出的日志 message body 必须采用固定 envelope：

```text
[fulllinktest][<type>] <json>
```

`<type>` 只能是：

- `[fulllinktest][state]`：CI 必须解析，表示整体状态、进度和最终结果。
- `[fulllinktest][case]`：CI 必须解析，表示单个 case 的开始、完成、跳过和耗时。
- `[fulllinktest][error]`：CI 必须解析，表示 TS/native 失败、异常、错误码、错误消息和必要堆栈。
- `[fulllinktest][log]`：CI 可以收集到报告中，但不作为完成判断依据。

平台日志外层格式由 logcat / simctl / ReactNativeJS 决定，不属于协议的一部分。CI 只解析 message body 中的 `[fulllinktest][<type>] <json>`。

所有四类事件的 JSON 都必须包含 `runId`、`timestamp` 和 `source`。CI 只接受本次 `runId` 的事件。

`runId` 是 CI 本次运行的唯一标识。CI 在启动应用前写入 `example/src/fulllinktest/fullLinkTestConfig.ts`，TS 启动后读取该值；TS 调 native test channel 时也必须把 `runId` 传给 native。TS、Android、iOS 打印的所有 `[state]`、`[case]`、`[error]`、`[log]` 事件都必须带同一个 `runId`。

通用字段：

```ts
type FullLinkTestLogSource = 'ts' | 'ios' | 'android';

type FullLinkTestBaseEvent = {
  runId: string;
  timestamp: string;
  source: FullLinkTestLogSource;
};
```

四种事件格式固定如下。

State 事件：

```ts
type FullLinkTestStateEvent = FullLinkTestBaseEvent & {
  status: 'initializing' | 'running' | 'completed';
  result?: 'passed' | 'failed' | 'stopped';
  runMode: 'manual' | 'auto';
  platform: 'ios' | 'android';
  total: number;
  completed: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs?: number;
  currentCaseName?: string;
};
```

示例：

```text
[fulllinktest][state] {"runId":"20260525-153000-ios-abc123","timestamp":"2026-05-25T07:30:00.000Z","source":"ts","status":"running","runMode":"auto","platform":"ios","total":10,"completed":3,"passed":3,"failed":0,"skipped":0,"durationMs":1234,"currentCaseName":"sendMessage.success"}
```

日志事件打印原始测试事件和运行统计，不打印覆盖率指标。`statements`、`branches`、`functions`、`lines` 属于 coverage metrics，Full Link Test 第一阶段不采集、不伪造这些指标。

`result` 只在 `status=completed` 时必填。CI 以 `status=completed` 作为结束信号：

```text
status=initializing/running:
  继续等待

status=completed 且 result=passed:
  exit 0

status=completed 且 result=failed/stopped:
  exit 1

超时:
  exit 1，并用已收集事件生成失败报告
```

Case 事件：

```ts
type FullLinkTestCaseEvent = FullLinkTestBaseEvent & {
  caseName: string;
  managerName: string;
  phase: 'started' | 'completed' | 'skipped';
  result?: 'passed' | 'failed' | 'skipped';
  durationMs?: number;
  message?: string;
};
```

示例：

```text
[fulllinktest][case] {"runId":"20260525-153000-ios-abc123","timestamp":"2026-05-25T07:30:01.000Z","source":"ts","caseName":"sendMessage.success","managerName":"ChatManager","phase":"completed","result":"passed","durationMs":123}
```

Error 事件：

```ts
type FullLinkTestErrorEvent = FullLinkTestBaseEvent & {
  caseName?: string;
  managerName?: string;
  message: string;
  code?: string | number;
  nativeMethod?: string;
  stack?: string;
  details?: unknown;
};
```

示例：

```text
[fulllinktest][error] {"runId":"20260525-153000-ios-abc123","timestamp":"2026-05-25T07:30:02.000Z","source":"android","caseName":"sendMessage.failure","managerName":"ChatManager","message":"mock send message failed","code":500,"nativeMethod":"sendMessage"}
```

Log 事件：

```ts
type FullLinkTestLogEvent = FullLinkTestBaseEvent & {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  caseName?: string;
  managerName?: string;
  details?: unknown;
};
```

示例：

```text
[fulllinktest][log] {"runId":"20260525-153000-ios-abc123","timestamp":"2026-05-25T07:30:02.100Z","source":"android","level":"error","caseName":"sendMessage.failure","managerName":"ChatManager","message":"native stack captured","details":{"stack":"..."}}
```

堆栈可以保留换行，但必须作为 JSON 字符串字段输出，或拆成多条 `[fulllinktest][log]` 事件。CI 完成判断不依赖堆栈格式，只依赖带本次 `runId` 的 `[state] completed` 事件。

日志输出代码只能负责拼接固定 envelope，不允许各处手写不同格式。推荐统一通过 `FullLinkTestLogger` 输出：

```ts
FullLinkTestLogger.state(event);
FullLinkTestLogger.case(event);
FullLinkTestLogger.error(errorEvent);
FullLinkTestLogger.log(logEvent);
```

```java
FullLinkTestLogger.state(event);
FullLinkTestLogger.case(event);
FullLinkTestLogger.error(errorEvent);
FullLinkTestLogger.log(logEvent);
```

```objc
[FullLinkTestLogger state:event];
[FullLinkTestLogger case:event];
[FullLinkTestLogger error:errorEvent];
[FullLinkTestLogger log:logEvent];
```

CI 监听：

```sh
adb logcat -v time -s fulllinktest ReactNativeJS
```

```sh
xcrun simctl spawn booted log stream --style compact --predicate 'eventMessage CONTAINS "[fulllinktest]"'
```

CI 监听到平台日志后，按前缀识别事件：对 state/case/error 提取 JSON payload 并按 `runId` 过滤统计；对 log 事件按 `runId` 或同一执行上下文收集到报告的 Logs 部分。CI 最终根据 state completed 事件生成 Markdown 报告并返回 exit code。

## 10. Markdown 报告

报告使用 Markdown，不使用 HTML。

建议文件名：

```text
full-link-test-report.md
```

报告由 CI 在宿主机生成，不由测试应用生成。报告每次执行覆盖前一次，不保留历史。

CI 需要打印实际报告路径：

```text
Report Path: <path>
```

Markdown 报告建议内容：

```md
# Full Link Test Report

## Summary
status
platform
runMode
startedAt
finishedAt
duration
total
passed
failed
skipped

## Coverage Metrics
statements: N/A
branches: N/A
functions: N/A
lines: N/A

## Cases
case name
status
duration
message

## Failures
失败详情
expected / received
stack
native error

## Logs
TypeScript logs
ObjC logs
Java logs
```

报告字段来源：

- `runId`：CI 每次运行时生成并写入 `fullLinkTestConfig.ts`。
- `runMode`：来自 `fullLinkTestConfig.ts`。
- `platform`：来自 CI 平台入口命令参数，并与 state event 中的 `platform` 交叉校验；若二者不一致，CI 应按失败处理并在报告中说明。
- `startedAt` / `finishedAt` / `duration`：来自 state/case 事件时间戳和 runner 统计。
- case 统计、失败摘要、日志内容：来自带本次 `runId` 的 `[fulllinktest]` 事件。

Coverage Metrics 参考 Jest 字段：

```text
statements
branches
functions
lines
```

第一阶段固定为：

```text
N/A
```

原因是日志只打印原始测试事件和运行统计，不打印 coverage metrics。CI 生成报告时保留该章节，方便后续如果接入覆盖率数据时扩展。

## 11. 运行日志边界

第 9 节定义了日志事件协议。本节只补充边界：错误时 TS、ObjC、Java 应尽量通过 `[fulllinktest][error]` 输出结构化摘要，包括：

- case 名称。
- source：`ts` / `ios` / `android`。
- 断言错误或 native error。
- native 方法名。
- 参数摘要。
- wrapper 返回摘要。
- 必要堆栈。

第一阶段报告边界：

- CI 负责生成一份偏统计的 Markdown 报告。
- 报告必须体现最终预期结果、实际结果、case 统计、失败摘要和 report/log 文件路径。
- Android/iOS native 侧通过平台日志输出的 `[fulllinktest][error]` 可以被 CI 收集进报告。
- 不要求 Android/iOS/TypeScript 分别生成自己的报告文件。

## 12. Native Test Channel

推荐采用独立测试调用入口，而不是在现有 `callMethod` 的 args 里加 `enableTest`。

该通道语义与 RN old/new architecture 无关；不需要因为新老架构差异设计两套测试语义。实现时只需保证当前 example app 能调用到该测试入口。

暂定命名：

```ts
fullLinkTestCallMethod(method: string, args: FullLinkTestCallArgs): Promise<unknown>;
```

最终命名后续可以调整，但语义应明确：

- 这是 Full Link Test 专用 native 调用入口。
- 不是公开 SDK API。
- 不是普通 mock 工具。
- 调用 `fullLinkTestCallMethod` 表示进入 Full Link Test 专用测试链路。
- 调用现有 `callMethod` 表示真实 SDK 使用链路。

不推荐第一阶段采用：

```text
callMethod + enableTest
```

原因：

- 会污染现有生产调用入口。
- 测试标记和业务参数混在一起。
- 正式包中更容易残留测试分支。

推荐链路：

```text
TS FullLinkTestRunner
→ FullLinkTestNative.fullLinkTestCallMethod(method, { payload, mockScenario })
→ RN bridge
→ Android/iOS full link test native entry
→ dispatch 到测试 wrapper/test adapter
→ wrapper 使用 provider/facade
→ mock provider 返回 fake success/failure/progress
→ wrapper 原有转换逻辑生成 map/json
→ bridge 返回 TS
→ TS decode/model
→ assertion
```

必须尽量保留：

- RN bridge。
- native dispatch。
- wrapper 参数解析。
- wrapper callback/onReceive 逻辑。
- wrapper result map/json 转换。
- TS decode/model。

这里的边界是：`fullLinkTestCallMethod` 是测试入口，`callMethod` 是真实使用入口。测试入口可以走测试 wrapper/test adapter，但应尽量复用真实 wrapper 的参数解析、callback/onReceive/onResult 逻辑、result map/json 转换，避免把测试写成完全绕过 SDK wrapper 的假链路。

只替换外部依赖：

```text
HyphenateChat SDK 真实网络/数据库/状态行为
```

## 13. Mock Scenario 参数

每个测试调用都需要携带 mock 参数。

调用参数采用统一 envelope，避免函数签名和 bridge 参数模型分裂：

```ts
type FullLinkTestCallArgs = {
  runId: string;
  payload?: unknown;
  mockScenario: FullLinkMockScenario;
};
```

`runId` 来自 `fullLinkTestConfig.runId`。TS runner 调用 native test channel 时必须携带 `runId`，native test entry、wrapper/test adapter、mock provider 打印 `[fulllinktest]` 日志时必须继续使用该 `runId`。

不建议长期只用：

```text
shouldFail: boolean
```

应设计为 scenario：

```ts
type FullLinkMockScenario = {
  outcome: 'success' | 'failure';
  errorCode?: number;
  errorMessage?: string;
  progress?: number;
  response?: unknown;
  delayMs?: number;
};
```

发送消息成功示例：

```ts
await fullLinkTestCallMethod('sendMessage', {
  runId: fullLinkTestConfig.runId,
  payload: messagePayload,
  mockScenario: {
    outcome: 'success',
    progress: 50,
  },
});
```

发送消息失败示例：

```ts
await fullLinkTestCallMethod('sendMessage', {
  runId: fullLinkTestConfig.runId,
  payload: messagePayload,
  mockScenario: {
    outcome: 'failure',
    errorCode: 500,
    errorMessage: 'mock send message failed',
  },
});
```

后续每个 case 都能明确表达：

- 本次 mock 哪个 native SDK 行为。
- 期望 success 还是 failure。
- 错误码是什么。
- 返回数据是什么。
- 是否需要 progress/delay。

## 14. Provider/Facade Mock 机制

native mock 的核心不是 mock 整个 wrapper 方法，而是 mock wrapper 调用 HyphenateChat SDK 的边界。

以发送消息为例，当前 Android 真实调用是：

```java
EMClient.getInstance().chatManager().sendMessage(msg);
```

当前 iOS 真实调用是：

```objc
[EMClient.sharedClient.chatManager sendMessage:msg ...]
```

建议改为 provider/facade。

生产保留：

- `ExtSdkChatManagerProvider` interface/protocol。
- `ExtSdkRealChatManagerProvider`。
- wrapper 持有 provider，默认使用 real provider。

测试提供：

- `ExtSdkMockChatManagerProvider`。

本节使用发送消息作为代表性示例。完整设计方向是后续所有需要全链路验证的 manager 都应具备类似 provider/facade 边界。第一阶段跑通时，每个 manager 至少要有一个代表性示例；示例必须能证明该 manager 的 native test channel、wrapper/test adapter、provider/facade、mock provider、结果转换和 TS assertion 都被执行过。每个 manager 的完整 case 集合可以后续扩展。

Android 概念：

```java
interface ExtSdkChatManagerProvider {
    void sendMessage(EMMessage msg);
}

final class ExtSdkRealChatManagerProvider implements ExtSdkChatManagerProvider {
    public void sendMessage(EMMessage msg) {
        EMClient.getInstance().chatManager().sendMessage(msg);
    }
}

final class ExtSdkMockChatManagerProvider implements ExtSdkChatManagerProvider {
    private final FullLinkMockScenario scenario;

    public void sendMessage(EMMessage msg) {
        EMCallBack callback = msg.getMessageStatusCallback();

        if (callback != null && scenario.progress != null) {
            callback.onProgress(scenario.progress, "mock progress");
        }

        if (callback != null && scenario.outcome == FAILURE) {
            callback.onError(scenario.errorCode, scenario.errorMessage);
        } else if (callback != null) {
            callback.onSuccess();
        }
    }
}
```

Wrapper 保留原 callback/onReceive/onResult 逻辑，只替换：

```java
chatManagerProvider.sendMessage(msg);
```

iOS 概念：

```objc
@protocol ExtSdkChatManagerProvider <NSObject>

- (void)sendMessage:(EMChatMessage *)message
           progress:(void (^)(int progress))progressBlock
         completion:(void (^)(EMChatMessage *message, EMError *error))completionBlock;

@end
```

生产 provider 调真实 SDK：

```objc
[EMClient.sharedClient.chatManager sendMessage:message
                                      progress:progressBlock
                                    completion:completionBlock];
```

mock provider 根据 scenario 调：

```objc
progressBlock(50);
completionBlock(message, nil);
```

或：

```objc
completionBlock(message, error);
```

这样可以验证：

- 参数解析。
- callback 设置。
- onReceive 事件结构。
- onResult 返回结构。
- map/json 转换。
- TS decode/model。

同时不依赖真实 HyphenateChat SDK 网络行为。

## 15. 开发态与发布态测试代码策略

采用：

```text
开发态完整，发布态裁剪
```

开发态：

- TS 测试代码、native 测试代码都在 SDK repo 中。
- Full Link Test 本地 CI 可以直接使用。
- 调试简单。

发布态：

- npm package 不包含纯测试代码。
- 只保留必要抽象层和生产实现。

正式包允许保留：

- provider/facade interface/protocol。
- real provider implementation。
- wrapper provider 字段。
- 必要注入点或 no-op entry。

正式包不应包含：

- mock provider。
- mock scenario parser。
- fullLinkTest test bridge 实现。
- 测试用例。
- 测试数据。
- 状态/报告测试 helper。
- 可触发 mock 行为的真实测试入口。

## 16. 为什么不优先用条件编译

不优先采用 Gradle sourceSet / productFlavor / BuildConfig / ObjC 宏作为第一方案。

原因：

- Java 没有真正条件编译。
- 如果生产代码静态引用被裁剪的测试类，发布包会编译失败。
- ObjC 虽支持宏，但 Android/iOS 两套条件会增加维护复杂度。
- RN old/new architecture、podspec、Gradle、example、本地 CI 都要同步考虑。
- 配置错容易导致开发态或发布态失败。

设计原则：

```text
生产代码不能静态依赖纯测试类。
```

允许保留的稳定 entry 必须被视为生产安全 shim，而不是纯测试类。生产代码最多静态依赖这个 shim；shim 在开发态再委托到测试实现，在发布态替换为 no-op。生产代码不得静态 import mock provider、mock scenario parser、测试用例或测试数据。

测试能力通过稳定 entry 和发布裁剪控制。

## 17. Release Packaging 与 Publish Guard 策略

发布设计由两部分组成：

- release packaging：在 release-safe worktree 中裁剪、校验、pack/publish。
- publish guard：阻断默认 publish 路径，避免误发布和 publish 生命周期递归。

不使用这些命令作为真实发布入口：

```text
yarn publish
npm publish
yarn release
```

原因：

- `yarn publish` 和 `npm publish` 名称与包管理器生命周期耦合，不能重写成真正发布入口，否则容易再次触发 publish 相关生命周期并产生递归风险。
- 默认 publish 命令是用户最容易误操作的高风险命令，应只负责阻断并给出明确提示。
- 当前项目已有 `yarn release` / `release-it` 配置，但它无法覆盖本设计需要的 release worktree 裁剪、no-op entry 替换和 tgz 内容校验，应废弃、删除或改成明确提示，不再作为真实发布入口。
- 真正发布入口使用不与包管理器 publish 生命周期重名的命令。

正确发布入口：

```sh
yarn release:publish
```

推荐使用 git worktree 创建 release-safe 工作区：

```text
开发主工作区:
  保留完整测试代码

release worktree:
  自动裁剪纯测试代码
  替换固定测试 entry 为 no-op
  生成可 review 的 diff
  从该 worktree pack/publish
```

发布流程：

```text
yarn release:publish
  生成或确认 release worktree
  裁剪纯测试代码
  替换测试 entry 为 no-op
  运行 release-safe 校验
  输出 diff 供 review 或按脚本策略确认
  在 release worktree 中 pack/publish
  清理或保留 release worktree
```

脚本可以拆成内部步骤：

```text
yarn release:prepare
  创建 release worktree
  删除纯测试目录
  替换测试 entry 为 no-op
  运行 release-safe 校验
  输出 diff 供 review

yarn release:pack
  在 release worktree 中 yarn pack

yarn release:publish
  在 release worktree 中发布

yarn release:clean
  清理 release worktree
```

worktree 可以位于：

```text
.worktree/release-package-<version>
```

或：

```text
.worktree/release-package-<commit>
```

阻断命令行为：

`npm publish` 可使用 `prepublishOnly` guard：

```json
{
  "scripts": {
    "prepublishOnly": "node scripts/release/prepublish-guard.js"
  }
}
```

行为：

- 打印提示并失败。
- 提示使用 `yarn release:publish`。
- 不执行真实发布，避免绕过 release worktree 裁剪和校验。

`yarn publish` 不应被重写成真实发布入口。若项目中需要处理该误操作，可以使用不会触发递归发布的 guard 方案或文档/脚本检查阻断；核心原则是默认 publish 路径不能完成发布。

`yarn release` / `release-it` 应删除、废弃或改为 guard 提示，避免它绕过新的 release-safe worktree 流程。

## 18. Entry 替换策略

推荐发布态不是到处删除 import，而是：

```text
开发态 entry = 真实测试注册/测试入口
发布态 entry = no-op 空实现
```

好处：

- 调用点稳定。
- 脚本只处理固定入口。
- 发布包仍能编译。
- 不需要到处改 manager/wrapper。
- diff 可 review。

示例：

开发态：

```java
ExtSdkFullLinkTestEntry.install();
```

`ExtSdkFullLinkTestEntry` 是稳定 shim。开发态 shim 可以注册真实测试入口，但 mock provider、scenario parser、测试用例等仍属于纯测试代码。

发布态替换为：

```java
public final class ExtSdkFullLinkTestEntry {
    public static void install() {
        // no-op in published package
    }
}
```

ObjC / TS 同理。

如果要求连 no-op 名称都不出现，则脚本复杂度会显著升高。第一阶段不建议追求这一点。

## 19. 发布产物校验

发布流程必须校验 tgz 内容。

至少检查不能包含：

- `__tests__`
- `__mocks__`
- `__fixtures__`
- Full Link Test mock provider
- mock scenario
- `fullLinkTestCallMethod` 的真实测试实现
- 测试用例
- 测试数据

可以通过：

```sh
tar -tf build/react-native-chat-sdk.tgz
```

做内容扫描。

后续更强校验：

```text
用打出的 tgz 安装到临时 RN app
Android assemble
iOS pod install / build smoke
```

这是防止裁剪脚本漏删、no-op 替换不完整、发布包编译失败的关键保障。

发布裁剪清单需要在 native/TS 测试架构落地后补充。当前阶段只定义原则，不在本文档硬编码完整文件名单：

- 已明确目录或入口可以直接列入裁剪清单，例如 `example/src/fulllinktest`。
- mock provider、mock scenario parser、native test bridge 实现、no-op entry 的具体文件路径，需要随实施架构确定后再形成机械化名单。
- release 脚本最终应使用路径清单和必要的关键词扫描共同校验；不能只靠模糊关键词决定删除范围。

## 20. 本地 CI 设计

CI 第一阶段是本地 CI，目标环境：

- 开发者本机。
- Mac mini 构建机。

入口：

```sh
yarn ci:local:run:ios
yarn ci:local:run:android
```

可保留通用入口：

```sh
yarn ci:local:run
```

但第一阶段主要使用平台入口。

iOS 脚本职责：

1. 检查或生成 `example/src/fulllinktest/fullLinkTestConfig.ts`。
2. 生成本次唯一 `runId`，将 `runMode` 设置为 `auto`，并写入 `runId`。
3. 启动 `xcrun simctl spawn booted log stream` 监听包含 `[fulllinktest]` 的平台日志，或确保日志监听与 app 启动并行且不会晚于 runner completed 事件。
4. 调用 `yarn example ios`，由该命令负责启动模拟器、编译应用、安装并运行应用、启动控制台调试服务。
5. 只接受本次 `runId` 对应的结构化事件。
6. 聚合事件并在宿主机生成 Markdown 报告。
7. 根据状态返回 exit code。

Android 脚本职责：

1. 检查或生成 `example/src/fulllinktest/fullLinkTestConfig.ts`。
2. 生成本次唯一 `runId`，将 `runMode` 设置为 `auto`，并写入 `runId`。
3. 启动 `adb logcat` 监听 `fulllinktest` 和 `ReactNativeJS` 日志，或确保日志监听与 app 启动并行且不会晚于 runner completed 事件。
4. 调用 `yarn example android`，由该命令负责启动模拟器或连接设备、编译应用、安装并运行应用、启动控制台调试服务。
5. 只接受本次 `runId` 对应的结构化事件。
6. 聚合事件并在宿主机生成 Markdown 报告。
7. 根据状态返回 exit code。

CI 执行时序：

```text
yarn ci:local:run:ios/android
→ 生成 runId 并写入 fullLinkTestConfig.ts
→ 启动或并行启动平台日志监听
→ 运行 yarn example ios/android
→ app 启动后读取 runMode=auto 和 runId
→ app 执行测试并持续打印 [fulllinktest] 结构化日志
→ CI 过滤本次 runId 并聚合事件
→ CI 收到 status=completed 后读取 result
→ CI 在宿主机生成并打印 Markdown 报告路径
→ CI 完成并返回 exit code
```

CI 不负责：

- 恢复 `runMode=manual`。
- 选择具体测试 case。
- 写 app 内状态文件。
- 读取 app 沙盒文件作为主要结果来源。
- 生成 HTML 报告。
- 拆 build/install/launch。

CI 判断依据是 `[fulllinktest][state]` 的结构化日志事件。

CI 生成报告时字段来源：

- `runId`：CI 命令每次自动生成，并写入 `fullLinkTestConfig.ts`。
- `runMode`：来自 `fullLinkTestConfig.ts`，CI 运行时应为 `auto`。
- `platform`：来自平台入口命令参数，必要时与 state event 中的 `platform` 校验。
- case 统计、失败摘要、日志内容：来自带本次 `runId` 的 `[fulllinktest]` 事件。

## 21. 平台日志监听

CI 通过平台日志监听测试应用输出的 `[fulllinktest]` 事件：

```text
Android:
  adb logcat 监听 fulllinktest / ReactNativeJS。

iOS Simulator:
  xcrun simctl spawn booted log stream 监听包含 [fulllinktest] 的日志。

iOS 真机:
  真机日志监听链路更复杂，第一阶段不作为本地 CI 主路径。
```

第一阶段 CI 目标：

- iOS Simulator。
- Android Emulator 或已连接 Android Device。

## 22. 当前明确不做

第一阶段不做：

- 远程云 CI。
- 环境变量配置。
- runtime launch arguments。
- CI 自己拆 build/install/launch。
- suite/group 筛选。
- App 内状态文件写入。
- App 内 Markdown 报告生成。
- RNFS 文件同步状态。
- HTML 报告。
- 历史报告归档。
- 基于 `demo2` 改造。
- 绕过 `yarn release:publish` 的发布。
- 复杂条件编译。
- 具体业务 API 用例设计。
- 具体 fake 数据设计。

## 23. 第一阶段闭环

开发者手动：

```text
runMode=manual
→ yarn example ios/android
→ 打开 Full Link Test 页面
→ 点击 Start
→ runner 执行
→ 每个 manager 的代表性 case 调用 native test channel
→ 看到进度
→ TS/native 打印 [fulllinktest] 日志
```

本地 CI：

```text
yarn ci:local:run:ios
或 yarn ci:local:run:android
→ 脚本设置 runMode=auto
→ 先启动或并行启动平台日志监听
→ app 自动执行 runner
→ runner 执行每个 manager 的代表性 case
→ case 调用 native fullLinkTestCallMethod
→ native mock provider 可返回 success/failure
→ TS/native 持续打印 [fulllinktest] 结构化日志
→ CI 监听日志直到 status=completed
→ CI 在宿主机生成 Markdown 报告
→ 根据结果 exit 0/1
```

发布：

```text
开发态测试代码保留
→ yarn release:publish
→ 创建 release worktree
→ 裁剪纯测试代码
→ 测试 entry 替换为 no-op
→ review diff
→ 生成 tgz
→ 校验 tgz 不含纯测试代码
→ 在 release worktree 中发布
→ yarn publish / npm publish / yarn release 不作为真实发布入口
```

## 24. 当前推荐决策

当前推荐的关键决策：

1. Full Link Test 独立放 `example/src/fulllinktest`。
2. 第一阶段每个 manager 至少有一个代表性 case，不以空 case 集合作为最终闭环。
3. `runMode` 和 `runId` 使用本地 TS 配置文件，不用环境变量；`runId` 是必填字段，CI 每次运行前写入新值。
4. CI 复用 `yarn example ios/android`，不拆 RN CLI。
5. CI 先启动或并行启动 `adb logcat` / `xcrun simctl log stream`，监听 `[fulllinktest]` 事件。
6. CI 过滤本次 `runId`，聚合事件，并在宿主机生成 Markdown 报告；应用不生成报告。
7. native 测试通道采用独立 `fullLinkTestCallMethod` 方向。
8. native mock 使用 provider/facade，只替换 HyphenateChat SDK 边界。
9. mock 参数使用 scenario，不只用 `shouldFail`。
10. 开发态保留完整测试代码。
11. 发布态通过 worktree 裁剪纯测试代码并替换 no-op entry。
12. 不优先使用条件编译。
13. `yarn publish` / `npm publish` / `yarn release` 不作为真实发布入口；真实发布入口使用 `yarn release:publish`，避免 publish 生命周期递归并满足裁剪校验需求。
