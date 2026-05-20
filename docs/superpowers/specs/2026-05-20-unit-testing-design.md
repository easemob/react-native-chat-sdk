# 单元测试设计文档

- **日期**：2026-05-20
- **项目**：react-native-chat-sdk-rn72
- **作者**：asteriskzuo（与 Claude 协作）
- **状态**：设计中

## 文档约定

本文档分为两类内容：

- **【长期原则】**：方法论与架构判断，不随实施阶段变化，未来查阅时仍然适用。
- **【当前阶段】**：基于当前项目状态（无 CI、单人维护）的具体落地方案，未来引入 CI 或团队扩大时需要重新评估。

未来更新时请明确改动属于哪一类。

---

## 1. 背景

当前项目是 React Native 即时通讯客户端 SDK，通过 Native Bridge 调用底层 HyphenateChat SDK。项目现状：

- 没有任何有效的单元测试（`src/__tests__/index.test.tsx` 只有 `it.todo`）
- 没有 CI
- 已有 Lefthook pre-commit hook，执行 lint 和 typecheck
- 单人开发与维护

目标：建立一套既能防止回归、又能作为 SDK 用法文档的单元测试体系，且不阻塞日常开发节奏。

---

## 2. 三层测试架构【长期原则】

项目跨越 TypeScript 和 Native（Java/Objective-C）两个世界，单一测试策略无法覆盖所有风险点。我们采用三层测试架构：

### Layer 1：TypeScript 单元测试

- **职责**：测试 `src/` 下所有纯 TypeScript 逻辑。
- **范围**：
  - `__internal__/Utils.ts`、`Factory.ts`、`ErrorHandler.ts`
  - `common/ChatError.ts`、`ChatMessage.ts` 等数据类的构造与静态工厂方法
  - 各 Manager 类的参数构建、参数校验、对 `callMethod` 的调用契约
- **隔离方式**：mock `src/__specs__/`（即 `ExtSdkApiRN.callMethod`），不发起任何真实 Native 调用。
- **不测试**：真实 Native 调用、真实网络、真实服务器交互。

### Layer 2：Native Wrapper 单元测试

- **职责**：测试 `modules/java/com/chatsdk/dispatch/` 和 `modules/objc/dispatch/` 中 wrapper 的逻辑。
- **范围**：
  - 从 `args` map 解析参数（字段名、类型转换）
  - 将 SDK 返回对象序列化为可被 JS 端理解的 map
  - 错误码映射
  - 异步回调到 Promise resolve/reject 的转换
- **隔离方式**：mock 底层 HyphenateChat SDK。
  - Android：JUnit + Mockito
  - iOS：XCTest（可配合 OCMock）
- **不测试**：真实 HyphenateChat SDK 行为、真实网络。

### Layer 3：契约测试（Contract Test）

- **职责**：保证 TS 与 Native 之间的"契约"对齐。
- **范围**：方法名常量同步检查
  - `src/__internal__/Consts.ts` 中定义的 `MTxxx` 常量
  - `modules/java/com/chatsdk/common/ExtSdkMethodType.java` 中定义的 Java 方法常量
  - `modules/objc/common/ExtSdkMethodTypeObjc.h` 中定义的 ObjC 方法字符串常量与枚举值
  - `modules/objc/common/ExtSdkMethodTypeObjc.m` 中的 ObjC 方法字符串到枚举值映射
  - `modules/objc/rn/ExtSdkApiObjcRN.mm` 中 `supportedEvents` 暴露的 RN 事件方法名
  - 两边必须完全一致，否则会出现方法调用对不上的运行时错误
- **实现方式**：脚本读取两端文件，提取常量值，做差集比对。
- **不测试**：行为逻辑（这是 Layer 1/2 的职责）。

### 关键判断标准

- Layer 1 和 Layer 2 都通过 mock 各自的下游依赖来保证速度和无外部依赖。
- Layer 3 是静态检查，不执行代码，只比对常量。
- 三层都不依赖网络、不依赖服务器、不依赖真实设备。

---

## 3. 测试时机【长期原则】

不同层级的测试速度差异巨大，触发时机也必须分层。

| 测试层级 | 触发时机 | 理由 |
|---|---|---|
| Layer 1 TS 单元测试 | pre-commit | 纯内存，秒级执行，可承担每次提交 |
| Layer 3 契约测试 | pre-commit | 静态扫描，毫秒级，且方法名漂移是高危 bug |
| Layer 2 Native 单测 | 视环境而定（见下） | JUnit/XCTest 启动慢，跨平台，不能阻塞每次提交 |

### Layer 2 触发时机的分阶段演进

| 阶段 | 触发方式 | 说明 |
|---|---|---|
| 当前（无 CI） | 手动 + `modules/` 有变更时触发 | 改 Native 才跑，平时手动 |
| 中期 | pre-push hook + glob 过滤 | 自动化，仅 `modules/` 变更时触发 |
| 引入 CI 后 | CI 流水线 | PR 时强制跑，本地 hook 可选保留 |

### 整体性能预算【长期原则】

- pre-commit 总耗时目标：**< 30 秒**（lint + typecheck + test + contract 合计）
- 单独 Layer 1 测试套件目标：**< 10 秒**
- 如果某层测试明显超出预算，需要拆分（例如分快慢两套），而不是降低预算或跳过测试

---

## 4. 测试用例设计原则【长期原则】

这一节固化测试用例的设计标准，所有新增测试都应遵守。

### 4.1 场景驱动，不是参数驱动

- ❌ 错误：`test('createTextMessage with all params')` —— 为了覆盖参数排列组合
- ✅ 正确：`test('threaded text message in group chat carries isChatThread flag')` —— 描述真实场景

### 4.2 测试名是规范文档

- 推荐格式：`should <expected behavior> when <condition>` 或 `<condition> <expected behavior>`
- 别人读测试名就知道这是 SDK 在描述什么使用场景

### 4.3 覆盖度因接口而异

- 简单接口（如 `getNowTimestamp`）：1 个用例足够
- 复杂接口（如 `createSendMessage`）：覆盖典型场景 + 关键边界，不穷举
- 判断标准：每个用例都要回答"这个用例如果挂了，意味着什么真实问题？"

### 4.4 必须覆盖的几类用例

- **正常路径**：典型用法、常见参数组合
- **边界值**：空字符串、空数组、`undefined`、0、负数（按接口语义选取）
- **非法输入**：错误类型、超出枚举范围（如果代码会校验或转换）
- **关键分支**：每个 `if/else` 分支都应有用例触达

### 4.5 不要测的内容

- 不测试 TypeScript 编译器已经保证的（类型正确性）
- 不测试第三方库的行为（如 `Date.now()` 本身）
- 不为了凑覆盖率而写无意义的用例（例如纯 getter 测试，除非内部有逻辑）

### 4.6 Arrange-Act-Assert 结构

- 每个用例三段清晰：准备数据 → 执行操作 → 验证结果
- 避免一个用例里多个不相关的 assert

### 4.7 反例与正例

```ts
// ❌ 反例（为写而写）
test('createTextMessage returns ChatMessage', () => {
  const m = ChatMessage.createTextMessage('u1', 'hi');
  expect(m).toBeInstanceOf(ChatMessage);
});

// ✅ 正例（场景驱动）
test('text message defaults to PeerChat when chatType omitted', () => {
  const m = ChatMessage.createTextMessage('u1', 'hi');
  expect(m.chatType).toBe(ChatMessageChatType.PeerChat);
});

test('text message in chat thread carries isChatThread flag', () => {
  const m = ChatMessage.createTextMessage(
    'u1', 'hi',
    ChatMessageChatType.GroupChat,
    { isChatThread: true },
  );
  expect(m.isChatThread).toBe(true);
});

test('empty content is preserved (does not throw)', () => {
  const m = ChatMessage.createTextMessage('u1', '');
  expect((m.body as ChatTextMessageBody).content).toBe('');
});
```

---

## 5. 当前阶段实施方案【当前阶段】

本节描述当前要落地的具体动作。**Layer 1 和 Layer 3 立即实施，Layer 2 暂不实施**。

### 5.1 目录结构

```text
src/__tests__/
├── setup.ts                    # 全局 mock（mock __specs__/ExtSdkApiRN）
├── helpers/                    # 测试辅助工具
│   ├── mockChatClient.ts       # 初始化 Factory.client 的辅助函数
│   └── nativeMock.ts           # 控制 callMethod 返回值的辅助
├── unit/                       # Layer 1: TS 单元测试
│   ├── Utils.test.ts
│   ├── ChatError.test.ts
│   ├── Factory.test.ts
│   ├── ErrorHandler.test.ts
│   ├── ChatMessage.test.ts
│   ├── ChatManager.test.ts
│   ├── ChatGroupManager.test.ts
│   └── ...
└── contract/                   # Layer 3: 契约测试
    └── methodNames.test.ts     # 扫描 Consts.ts 与 Java/ObjC 常量文件做 diff
```

### 5.2 Jest 配置（package.json）

```jsonc
"jest": {
  "preset": "react-native",
  "setupFiles": ["<rootDir>/src/__tests__/setup.ts"],
  "modulePathIgnorePatterns": [
    "<rootDir>/example/node_modules",
    "<rootDir>/lib/"
  ],
  "testPathIgnorePatterns": [
    "<rootDir>/src/__tests__/helpers/",
    "<rootDir>/src/__tests__/setup.ts"
  ],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/__specs__/**",
    "!src/__tests__/**",
    "!src/version.ts",
    "!src/index.ts"
  ]
}
```

按用户选择，**不设 `coverageThreshold`**，覆盖率仅作参考。

### 5.3 全局 Native Mock

`src/__tests__/setup.ts` 思路：

```ts
jest.mock('../__specs__', () => ({
  ExtSdkApiRN: {
    callMethod: jest.fn().mockResolvedValue({}),
  },
}));
```

每个用例通过 helper 覆写 `callMethod` 返回值，实现按需 mock。

### 5.4 契约测试实现思路

```text
contract/methodNames.test.ts:
  1. 读取 src/__internal__/Consts.ts，正则提取所有 MTxxx 常量值
  2. 读取 modules/java/com/chatsdk/common/ExtSdkMethodType.java，提取 public static final String 常量值
  3. 读取 modules/objc/common/ExtSdkMethodTypeObjc.h，提取 ExtSdkMethodKey 字符串常量值和 ExtSdkMethodKey*Value 枚举值
  4. 读取 modules/objc/common/ExtSdkMethodTypeObjc.m，提取 methodMap 中已注册的 ExtSdkMethodKey → ExtSdkMethodKey*Value 映射
  5. 读取 modules/objc/rn/ExtSdkApiObjcRN.mm，提取 supportedEvents 中暴露给 RN 的事件方法名
  6. 分层比对：
     - TS 方法常量必须存在于 Java 方法常量中
     - TS 方法常量必须存在于 ObjC 方法字符串常量中
     - ObjC 方法字符串常量必须能在 ExtSdkMethodTypeObjc.m 的 methodMap 中找到映射
     - TS 中的事件常量（如 onXxx）必须存在于 ExtSdkApiObjcRN.mm 的 supportedEvents 中
  7. 不匹配 → 测试失败，输出差异列表
```

实现方式：Node `fs` 读文件 + 正则提取，不依赖 babel-parser。

### 5.5 package.json 新增 scripts

```jsonc
"scripts": {
  "test": "jest",
  "test:unit": "jest src/__tests__/unit",
  "test:contract": "jest src/__tests__/contract",
  "test:coverage": "jest --coverage"
}
```

### 5.6 Lefthook 调整

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,jsx,tsx}"
      run: npx eslint {staged_files}
    types:
      glob: "*.{js,ts,jsx,tsx}"
      run: npx tsc --noEmit
    test:
      glob: "*.{ts,tsx,js,jsx}"
      run: yarn test --bail --findRelatedTests {staged_files} --passWithNoTests
    contract:
      glob: "{src/__internal__/Consts.ts,modules/java/com/chatsdk/common/ExtSdkMethodType.java,modules/objc/common/ExtSdkMethodTypeObjc.h,modules/objc/common/ExtSdkMethodTypeObjc.m,modules/objc/rn/ExtSdkApiObjcRN.mm}"
      run: yarn test:contract
```

- `test`：用 `--findRelatedTests` 仅跑与改动文件相关的测试，速度更快
- `contract`：仅在 `Consts.ts` 或相关 Java/ObjC native contract 文件改动时触发

### 5.7 首批测试用例的优先级

按"风险 × 使用频率"排序：

| 优先级 | 文件 | 理由 |
|---|---|---|
| P0 | `contract/methodNames.test.ts` | 立刻能发现常量漂移，价值最高 |
| P0 | `unit/ChatMessage.test.ts` | 9 种 create 方法，逻辑复杂，使用频率最高 |
| P1 | `unit/Utils.test.ts` | 纯函数，作为模板 |
| P1 | `unit/ChatError.test.ts` | 异常构造，作为模板 |
| P2 | `unit/Factory.test.ts` | 单例 + 全局状态，需小心测 |
| P2 | `unit/ErrorHandler.test.ts` | 单例 + 监听器模式 |
| P3 | 各 Manager 类 | 每个 manager 测代表性方法的 `callMethod` 契约 |

### 5.8 Layer 2 当前阶段的处理

- **不创建测试目录，不写测试**
- 设计文档中记录 Java/iOS 测试工具的选型（JUnit / XCTest）和未来触发方案
- 在 `AGENTS.md` 增加一句："修改 `modules/java/` 或 `modules/objc/` 中的 wrapper 后，请手动在 example 应用中验证相关功能"
- 等引入 CI 或 Layer 2 测试被纳入计划时，再回头实施

---

## 6. 未来演进路径

| 阶段 | 触发条件 | 动作 |
|---|---|---|
| 阶段 1（本设计） | 现在 | 实施 Layer 1 + Layer 3，pre-commit 集成 |
| 阶段 2 | 测试套件稳定运行 1~2 个版本 | 评估覆盖率，补齐高风险接口的测试 |
| 阶段 3 | Native wrapper 出现回归 bug，或团队扩大 | 实施 Layer 2（pre-push + glob 触发） |
| 阶段 4 | 接受外部贡献 / 团队 ≥ 2 人 | 引入 CI（GitHub Actions），三层测试均迁移到 CI |

---

## 7. 风险与权衡

- **Layer 2 暂不实施的风险**：Native wrapper 改动可能引入 bug，需依赖手动测试。**缓解措施**：在 AGENTS.md 中明确提示，改动 native 后手动验证。
- **pre-commit 测试拖慢提交**：如果未来测试套件膨胀超过 30 秒，提交体验下降。**缓解措施**：通过 `--findRelatedTests` 只跑相关测试；如果仍慢，拆分快慢套件，慢的迁移到 pre-push。
- **契约测试的实现脆弱性**：基于正则提取常量，如果 `Consts.ts`、`ExtSdkMethodType.java`、`ExtSdkMethodTypeObjc.*` 或 `ExtSdkApiObjcRN.mm` 的写法发生大幅变化，正则可能失效。**缓解措施**：在实现时编写充分的脚本自测，并在文档中说明常量定义需保持的格式约束。

---

## 8. 验收标准

实施完成的标志：

- [ ] `src/__tests__/setup.ts` 全局 mock 工作正常
- [ ] `src/__tests__/unit/` 下至少包含 P0、P1 优先级的测试文件
- [ ] `src/__tests__/contract/methodNames.test.ts` 能检测出常量不一致
- [ ] `yarn test`、`yarn test:unit`、`yarn test:contract`、`yarn test:coverage` 全部能正常运行
- [ ] `lefthook.yml` 的 pre-commit 包含 test 与 contract 任务
- [ ] 故意制造一次常量不一致，能被 pre-commit 拦截
- [ ] 故意改坏一个测试覆盖的逻辑，能被 pre-commit 拦截
- [ ] pre-commit 总耗时 < 30 秒
- [ ] `AGENTS.md` 增加 Native 修改后手动验证的说明
