# 测试与质量保障策略设计文档

- **日期**：2026-05-22
- **项目**：react-native-chat-sdk-rn72
- **状态**：设计完成

## 1. 总体定位

当前测试体系不以“覆盖率最大化”为目标，而是以**代表性样本验证关键风险**为目标。

本项目的核心风险不是 TypeScript manager 架构本身。manager 架构相对稳定，单纯围绕它写大量 mock 测试，收益有限。更关键的风险来自两个方向：

- 数据跨 TypeScript、React Native bridge、Java/Objective-C、Native SDK 再回到 TypeScript 的流转过程。
- HyphenateChat Native SDK 升级后，接口、废弃 API、字段语义或返回结构变化带来的质量风险。

因此，测试与质量工具分为五类：

1. 纯 TypeScript 测试
2. 纯 Native Wrapper 测试
3. 三端关键字对齐测试
4. 数据全链路测试
5. Native Deprecated API 扫描脚本

这五类手段各自解决不同问题，不要求互相替代，也不追求每类都覆盖全部 API。当前阶段的重点是通过代表性样本验证策略是否有效。

## 2. 纯 TypeScript 测试

纯 TypeScript 测试是快速测试，适合放在 pre-commit。

它的重点不是验证数据全链路是否精确，而是验证 TypeScript 层自己的行为是否正确：

- 调用了正确的 native method key。
- native success/failure 后，TypeScript 层处理符合预期。
- 纯 TypeScript model、error、enum、helper 的逻辑转换正确。
- 只写代表性样本，不追求每个 manager、每个 API 全覆盖。
- 含 `deprecated` 标记、作废注释或明确不推荐继续使用的 API，不作为新增测试目标。

这类测试可以继续使用 Jest，并 mock native bridge。它能快速发现 TypeScript 层回归，但不能证明真实 native bridge 或 native wrapper 数据转换正确。

## 3. 纯 Native Wrapper 测试

纯 Native Wrapper 测试是 native 侧专项测试，不经过 TypeScript，也不经过真实 React Native bridge。

它的重点是验证 Java/Objective-C wrapper 自己的行为：

- wrapper 对 native 参数的解析是否正确。
- wrapper 调用 HyphenateChat SDK 后 success/failure 是否符合预期。
- native SDK 返回对象转换为 map/json 的行为是否符合预期。
- Java 侧 `ExtSdkMapHelperRN` 放在这一类中测试。
- 每个 manager 先选代表性 API，不追求每个 API 全覆盖。
- 复杂字段映射、复杂返回值转换、历史易错点优先。
- deprecated API 不作为新增测试目标。

这类测试的下游依赖应 mock 到 HyphenateChat SDK 或等价 facade/provider 层。它不负责验证 TypeScript 到 native bridge 的真实链路，但负责验证 native wrapper 本身的参数解析、成功返回、失败返回和工具类转换。

## 4. 三端关键字对齐测试

原来的 contract test 命名偏抽象。后续统一称为**三端关键字对齐测试**，更直观地表达其职责。

它只负责关键字、方法名、事件名是否对齐：

- TypeScript `MTxxx`
- Java method constants
- ObjC method key / value / methodMap
- RN supportedEvents

它不测试行为逻辑，不测试数据字段，不测试 C++。当前 RN 测试范围中，`modules/cpp/common/ExtSdkMethodType.*` 不纳入三端关键字对齐测试。

这类测试成本低、反馈快，适合放在 pre-commit。它的价值是防止三端方法名、事件名漂移导致运行时无法调用或事件无法分发。

## 5. 数据全链路测试

数据全链路测试是可信度最高、成本最高的 integration 测试，只做代表性样本。

目标链路如下：

```text
TypeScript API
→ Native._callMethod
→ RN bridge
→ Android Java / iOS ObjC RN adapter
→ native dispatch / wrapper
→ SDK facade/provider
→ fake HyphenateChat SDK result
→ native wrapper result map/json
→ RN bridge 返回 JS
→ TS decode/model
→ JS 断言
```

关键设计选择：

- 采用 Native SDK facade/provider，让 wrapper 不直接依赖 `EMClient.getInstance()` 或 ObjC singleton，而是通过可替换 provider 访问底层 SDK，测试时注入 fake provider。
- 采用自建 Test Harness screen，放在 example app 中，用于触发 SDK API、展示或记录测试结果。
- 第一阶段只测 success/failure 两条最小链路，不立即测 timeout。
- 第一阶段只跑当前 example 默认架构，不同时覆盖 old/new architecture。
- Android/iOS 分阶段实施属于实施计划问题，不影响总体设计。
- 不放 pre-commit，适合手动、pre-push、CI 或 release 前质量检查。
- deprecated API 不作为新增全链路测试目标。

一个合适的数据全链路样本可以是：

```text
ChatGroupManager.fetchGroupInfoFromServer('g1', true)
```

它同时覆盖 TypeScript 入参、native 参数解析、fake SDK 返回、native map 返回、TypeScript `ChatGroup` decode，能较好验证跨 bridge 数据链路的核心风险。

## 6. Native Deprecated API 扫描脚本

Native Deprecated API 扫描脚本是质量工具，不是单元测试。

它的目标是一键分析 native wrapper 是否调用了 HyphenateChat SDK 中已废弃的方法，避免只能通过 Android Studio 或 Xcode UI 查看 warning。

设计方向：

- Android：通过 Gradle/Javac 开启 `-Xlint:deprecation`，解析 warning。
- iOS：通过 `xcodebuild` / Clang 的 `-Wdeprecated-declarations`，解析 warning。
- 输出文件、行号、调用 API、warning 信息。
- 不进 pre-commit，适合手动、CI 或 release 前执行。
- 这类工具和测试体系并列，都是软件质量保障手段。

## 7. 阶段策略

当前阶段是**测试策略验证期**，不是覆盖率建设期。

阶段目标：

- 每类测试或质量工具至少有代表性样本。
- 明确每类能发现什么问题、不能发现什么问题。
- 记录执行命令和耗时。
- 根据样本结果决定是否扩大覆盖。
- 避免一开始铺满所有 API，减少试错成本。

样本选择原则：

- 优先选择当前有效 API，排除 deprecated/作废 API。
- 优先选择高频 API。
- 优先选择字段映射复杂的 API。
- 优先选择返回值 decode 复杂的 API。
- 优先选择 success/failure 分支明显的 API。
- 优先选择历史上容易出错或 SDK 升级容易影响的 API。

## 8. 后续补充事项

- CI 设计：本文档暂不展开 CI 流水线设计。后续需要单独明确各类测试和质量工具在 PR、nightly、release 前的触发策略。
- 测试用例完善：当前阶段只实现代表性样本。待测试框架、耗时和维护成本稳定后，再逐步补充更多 manager/API 的测试用例。
