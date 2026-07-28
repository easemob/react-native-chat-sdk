# 单元测试 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地 design 文档中的 Layer 1（TS 单元测试）和 Layer 3（契约测试），并接入 Lefthook pre-commit。Layer 2 不在范围。

**Architecture:** Jest + `react-native` preset；`src/__tests__/setup.ts` 全局 `jest.mock('../__specs__')` 桩掉 Native Bridge；Layer 1 测纯 TS 逻辑与 `callMethod` 调用契约；Layer 3 用 Node `fs` + 正则比对 `Consts.ts` 与 native 端常量文件。

**Tech Stack:** Jest 28、TypeScript 5、`react-native` Jest preset、Lefthook、Node `fs` 正则解析。

**Spec：** `docs/superpowers/specs/2026-05-20-unit-testing-design.md`。本计划落地其 §5 全部条目（§5.8 Layer 2 仅做 AGENTS.md 提示）。

**全局约定：**

- 仓库根：`/Users/asterisk/Codes/rn/react-native-chat-sdk-rn72/`。
- **只读且不修改**：`src/__specs__/`、`src/__internal__/Consts.ts`、`modules/**`、`lib/**`、`example/**`、`scripts/**`、`src/common/**`、`src/Chat*.ts`、`src/__internal__/{Native,Base,ErrorHandler,Factory,Utils}.ts`。本计划只新增测试文件 + 改 `package.json` / `lefthook.yml` / `AGENTS.md`。
- **整个实施分支只做一次 commit**：Task 1~12 都只修改/验证，不提交；所有改动在最后 Task 13 一次性提交。中间任务不要发 PR、不要 push、不要 `yarn release`/`publish`。
- 若 Layer 3 暴露真实方法名不一致：**不要修改 Native 常量去凑绿**——保留失败，在该 Task 的 commit message 里列出差异。

---

## File Structure

新建：

```
src/__tests__/
├── setup.ts                              # 全局 mock src/__specs__
├── helpers/
│   ├── nativeMock.ts                     # 控制 callMethod 返回值
│   └── mockChatClient.ts                 # 安装/重置 Factory.client
├── unit/
│   ├── Utils.test.ts
│   ├── ChatError.test.ts
│   ├── Factory.test.ts
│   ├── ErrorHandler.test.ts
│   ├── ChatMessage.test.ts               # 9 个 createXxxMessage + createReceiveMessage
│   ├── ChatClient.test.ts                # init / login / logout 代表方法
│   ├── ChatManager.test.ts
│   ├── ChatContactManager.test.ts
│   ├── ChatGroupManager.test.ts
│   ├── ChatRoomManager.test.ts
│   ├── ChatPresenceManager.test.ts
│   ├── ChatPushManager.test.ts
│   └── ChatUserInfoManager.test.ts
└── contract/
    ├── parsers.ts                        # 常量解析（可独立 import）
    └── methodNames.test.ts               # Layer 3 差集比对
```

修改：

- `package.json` — 加 `jest` 配置 + `test:unit` / `test:contract` / `test:coverage` scripts。
- `lefthook.yml` — pre-commit 增 `test` + `contract` 命令。
- `AGENTS.md` — 增"修改 native wrapper 后需手动验证"说明。

删除：

- `src/__tests__/index.test.tsx`（只有 `it.todo`）。

---

### Task 1：Jest 配置与全局 Native Mock

**Files:**
- Create: `src/__tests__/setup.ts`、`src/__tests__/helpers/nativeMock.ts`、`src/__tests__/helpers/mockChatClient.ts`
- Modify: `package.json`（`jest` 字段 + scripts）
- Delete: `src/__tests__/index.test.tsx`

- [ ] **Step 1：删除旧占位测试** `rm src/__tests__/index.test.tsx`
- [ ] **Step 2：写 `setup.ts`** — `jest.mock('../__specs__', ...)` 导出 `ExtSdkApiRN.callMethod` 为 `jest.fn().mockResolvedValue({})`、`eventEmitter.addListener` 返回 `{remove: jest.fn()}`、`isTurboModuleEnabled: false`；末尾 `afterEach(() => jest.clearAllMocks())`。
- [ ] **Step 3：写 `helpers/nativeMock.ts`** — 暴露 `mockCallMethodOnce(value)` / `mockCallMethodReject(err)` / `getCallMethodMock()` / `getLastCall(): { method, args }`，全部基于 `ExtSdkApiRN.callMethod as jest.Mock`。
- [ ] **Step 4：写 `helpers/mockChatClient.ts`** — `installFakeChatClient(overrides?)` 调 `Factory.setChatClient(...)`，默认 `currentUserName='u1'`；`resetChatClient()` 将 `Factory.client` 置 `undefined`。
- [ ] **Step 5：改 `package.json`** —
  - `jest` 字段加 `setupFiles: ["<rootDir>/src/__tests__/setup.ts"]`、`testPathIgnorePatterns: ["<rootDir>/src/__tests__/helpers/", "<rootDir>/src/__tests__/setup.ts"]`、`collectCoverageFrom: ["src/**/*.ts", "!src/__specs__/**", "!src/__tests__/**", "!src/version.ts", "!src/index.ts"]`，保留现有 `preset` 与 `modulePathIgnorePatterns`。
  - scripts 新增：`test:unit`、`test:contract`、`test:coverage`（命令分别为 `jest src/__tests__/unit`、`jest src/__tests__/contract`、`jest --coverage`）。
- [ ] **Step 6：验证 Jest 启动** `yarn test --passWithNoTests`，期望 0 失败。
- [ ] **Step 7：临时探针验证 mock 生效** 新建 `src/__tests__/unit/_probe.test.ts`，断言 `jest.isMockFunction(ExtSdkApiRN.callMethod)` 且默认 resolve `{}`；运行通过后**删除该文件**。
- [ ] **Step 8：检查本任务改动** `git status`、`git diff --stat`，确认仅含本任务新增/修改/删除；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 2：Utils 单元测试

**Files:** Create `src/__tests__/unit/Utils.test.ts`

**覆盖场景（每条 1 个用例）：**
- `getNowTimestamp` 返回 `Date.now()`（spyOn `Date.now`）
- `getRandomInt` 在 `Math.random()=0` 时返回 `min`
- `getRandomInt` 在 `Math.random()≈1` 时返回 `max`
- `getRandomInt` 对非整数 min/max 走 `ceil(min)/floor(max)`
- `generateMessageId` 拼接 timestamp + randomInt 为字符串

**代表片段：**
```ts
test('returns min when Math.random() returns 0', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  expect(getRandomInt(1, 10)).toBe(1);
});
```

- [ ] **Step 1** 按上述场景写完。每个 spy 用 `try/finally` 或 `afterEach mockRestore` 清理。
- [ ] **Step 2** `yarn test src/__tests__/unit/Utils.test.ts` 全绿。
- [ ] **Step 3** 记录结果；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 3：ChatError / ChatException 单元测试

**Files:** Create `src/__tests__/unit/ChatError.test.ts`

**覆盖场景：**
- `ChatError` 是 `Error` 子类，`code` / `description` 字段正确
- `ChatError.message` 等于 `description`
- `ChatError.name === 'ChatError'`，原型链 `instanceof ChatError` 成立
- `ChatException` 是 `ChatError` 子类，`name === 'ChatException'`

- [ ] **Step 1** 写测试。
- [ ] **Step 2** `yarn test src/__tests__/unit/ChatError.test.ts` 全绿。
- [ ] **Step 3** 记录结果；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 4：Factory 单元测试

**Files:** Create `src/__tests__/unit/Factory.test.ts`

**覆盖场景：**
- `Factory.create(cls, ...args)` 透传构造参数
- `getChatClient()` 未初始化时抛 `"ChatClient has not been initialized."`
- `setChatClient` 后 `getChatClient` 返回同一实例
- `Factory.set/get` 按 name 存取；未知 name `get` 返回 `null`

> 每个用例后 `resetChatClient()` 避免污染其他文件。

- [ ] **Step 1** 写测试。
- [ ] **Step 2** `yarn test src/__tests__/unit/Factory.test.ts` 全绿。
- [ ] **Step 3** 记录结果；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 5：ErrorHandler 单元测试

**Files:** Create `src/__tests__/unit/ErrorHandler.test.ts`

**覆盖场景：**
- `getInstance` 是单例
- `sendExcept` 通知所有已注册 listener，params 原样转发
- 无 listener 时 `sendExcept` 不抛
- 已删除的 listener 不再被调用

> `beforeEach` 清空 `listeners`。

- [ ] **Step 1** 写测试。
- [ ] **Step 2** `yarn test src/__tests__/unit/ErrorHandler.test.ts` 全绿。
- [ ] **Step 3** 记录结果；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 6：ChatMessage 静态工厂

**Files:** Create `src/__tests__/unit/ChatMessage.test.ts`

**覆盖范围：9 个 `createXxxMessage` 静态方法 + `createReceiveMessage`** —— `createSendMessage`、`createTextMessage`、`createFileMessage`、`createImageMessage`、`createVideoMessage`、`createVoiceMessage`、`createCombineMessage`、`createLocationMessage`、`createCmdMessage`、`createCustomMessage`、`createReceiveMessage`。

**每个方法的最小用例集：**
- 正常路径：所有"必填"参数走通，断言 body 类型 + 关键字段被搬运到位（`localPath` / `width` / `height` / `duration` / `latitude` / `action` / `event` / `params` 等按 body 类别选取 1~2 个最 telling 的字段）。
- 默认值：`chatType` 省略时为 `PeerChat`（在 `createTextMessage` 中验证一次足够，作为全家共用契约的代表，不每个方法重复）。
- 透传：`opt.isChatThread`、`opt.deliverOnlineOnly`、`opt.receiverList` 各挑一个方法验证透传——**整套只验证一次**，因为 9 个方法都走同一个 `createSendMessage`。

**额外用例（场景驱动，不为凑覆盖率）：**
- `createTextMessage` 空字符串 content 保留为空串（不抛）。
- `createTextMessage` 在群聊 + `isChatThread: true` 时 `chatType=GroupChat && isChatThread===true`。
- `from` 字段来自 `Factory.getChatClient().currentUserName`。
- `createReceiveMessage` 用任意 plain object 重建 `ChatMessage`，`direction='rec'`。

**代表片段：**
```ts
beforeEach(() => installFakeChatClient({ currentUserName: 'me' } as any));
afterEach(resetChatClient);

test('threaded text message in group chat carries isChatThread flag', () => {
  const m = ChatMessage.createTextMessage('g1', 'hi',
    ChatMessageChatType.GroupChat, { isChatThread: true });
  expect(m.chatType).toBe(ChatMessageChatType.GroupChat);
  expect(m.isChatThread).toBe(true);
});
```

> 执行中若某 body 字段实际签名与断言不一致，**改测试贴合实现**，不改 `src/common/ChatMessage.ts`。

- [ ] **Step 1** 按上述清单写。每个 create 方法至少 1 个、最多 3 个用例，全部场景驱动，总数 ≈ 15~20。
- [ ] **Step 2** `yarn test src/__tests__/unit/ChatMessage.test.ts` 全绿。
- [ ] **Step 3** 记录结果；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 7：ChatClient 调用契约

**Files:** Create `src/__tests__/unit/ChatClient.test.ts`

**覆盖：1~2 个代表方法的"方法名 + 参数 shape"契约。**

具体选 4 个代表（实现里 `Native._callMethod(MT...)` 调用模式最典型的）：
- `ChatClient.init` 调 `MTinit`，`args` 含 `appKey` 等 options 字段。
- `ChatClient.login` 调 `MTlogin`，`args` 含 `username` / `pwdOrToken` / `isPassword`。
- `ChatClient.logout` 调 `MTlogout`，`args` 含 `unbindDeviceToken`。
- 任一方法上：native error `{error: {code, description}}` 抛出为 `ChatError`。

> 不测试事件订阅、不验证回调链。

**代表片段：**
```ts
test('login forwards username and pwd under MTlogin', async () => {
  mockCallMethodOnce({});
  await ChatClient.getInstance().login('alice', 'tok', false);
  const { method, args } = getLastCall();
  expect(method).toBe(MTlogin);
  expect(args).toMatchObject({ username: 'alice', pwdOrToken: 'tok', isPassword: false });
});
```

> 实际签名以 `src/ChatClient.ts` 为准，参数键名不符就改测试贴合实现。

- [ ] **Step 1** 写测试。
- [ ] **Step 2** `yarn test src/__tests__/unit/ChatClient.test.ts` 全绿。
- [ ] **Step 3** 记录结果；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 8：7 个 Manager 调用契约

**Files:**
- Create: `src/__tests__/unit/ChatManager.test.ts`
- Create: `src/__tests__/unit/ChatContactManager.test.ts`
- Create: `src/__tests__/unit/ChatGroupManager.test.ts`
- Create: `src/__tests__/unit/ChatRoomManager.test.ts`
- Create: `src/__tests__/unit/ChatPresenceManager.test.ts`
- Create: `src/__tests__/unit/ChatPushManager.test.ts`
- Create: `src/__tests__/unit/ChatUserInfoManager.test.ts`

**原则：一个源码文件对应一个测试文件。** 每个 Manager 测试文件只取 1 个代表方法（"风险 × 频率"最高那个），每个用例只断言 3 件事：调用的 `MT*` 常量、参数 shape（`toMatchObject`）、返回值解码到位。

建议代表方法（实际签名以源码为准，不符则换该 Manager 中下一个明显的代表方法）：

| Test file | Source file | 代表方法 | 关键 MT 常量 |
|---|---|---|---|
| `ChatManager.test.ts` | `src/ChatManager.ts` | `getUnreadCount` | `MTgetUnreadMessageCount` |
| `ChatContactManager.test.ts` | `src/ChatContactManager.ts` | `addContact` | `MTaddContact` |
| `ChatGroupManager.test.ts` | `src/ChatGroupManager.ts` | `getGroupSpecificationFromServer` 或 `fetchGroupInfoFromServer` | `MT...` 实际名 |
| `ChatRoomManager.test.ts` | `src/ChatRoomManager.ts` | `joinChatRoom` | `MTjoinChatRoom` |
| `ChatPresenceManager.test.ts` | `src/ChatPresenceManager.ts` | `publishPresence` | `MTpublishPresenceWithDescription` |
| `ChatPushManager.test.ts` | `src/ChatPushManager.ts` | `fetchPushOptionFromServer` | `MTgetImPushConfigFromServer` 或实际名 |
| `ChatUserInfoManager.test.ts` | `src/ChatUserInfoManager.ts` | `fetchOwnInfo` | `MT...` 实际名 |

> 额外加 1 个用例：任一 Manager 在 native 返回 `{error: {...}}` 时方法 reject 为 `ChatError`，作为错误透传契约的代表；这个用例放在 `ChatManager.test.ts`，不要 7 个文件重复写。

**代表片段：**
```ts
test('ChatManager.getUnreadCount calls MTgetUnreadMessageCount', async () => {
  mockCallMethodOnce({ [MTgetUnreadMessageCount]: 7 });
  const count = await new ChatManager().getUnreadCount();
  expect(count).toBe(7);
  expect(getLastCall().method).toBe(MTgetUnreadMessageCount);
});
```

- [ ] **Step 1** 按一源一测创建 7 个测试文件。
- [ ] **Step 2** 分别运行 7 个测试文件，或运行 `yarn test src/__tests__/unit/ChatManager.test.ts src/__tests__/unit/ChatContactManager.test.ts src/__tests__/unit/ChatGroupManager.test.ts src/__tests__/unit/ChatRoomManager.test.ts src/__tests__/unit/ChatPresenceManager.test.ts src/__tests__/unit/ChatPushManager.test.ts src/__tests__/unit/ChatUserInfoManager.test.ts`，全部全绿。
- [ ] **Step 3** 记录结果；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 9：契约测试解析器 + methodNames 比对

**Files:** Create `src/__tests__/contract/parsers.ts`、`src/__tests__/contract/methodNames.test.ts`

**parsers.ts 导出：**
- `parseTsConsts()` — 读 `src/__internal__/Consts.ts`，正则 `/^\s*export\s+const\s+MT(\w+)\s*=\s*\n?\s*['"]([^'"]+)['"]/gm` 同时覆盖单行和换行写法。
- `parseJavaConsts()` — 读 `modules/java/com/chatsdk/common/ExtSdkMethodType.java`，正则 `/public\s+static\s+final\s+String\s+(\w+)\s*=\s*"([^"]+)"/g`。
- `parseObjcHeaderKeys()` — 读 `modules/objc/common/ExtSdkMethodTypeObjc.h`，提取 `static NSString *_Nonnull const ExtSdkMethodKeyXxx = @"value"`。
- `parseObjcHeaderValues()` — 同文件，提取 `static const int ExtSdkMethodKeyXxxValue = N`。
- `parseObjcMethodMap()` — 读 `modules/objc/common/ExtSdkMethodTypeObjc.m`，提取 `ExtSdkMethodKeyXxx : @(ExtSdkMethodKeyXxxValue)` 配对。
- `resolveRnSupportedEventValues()` — 读 `modules/objc/rn/ExtSdkApiObjcRN.mm`，截取 `supportedEvents` 到下一个 `return ret` 之间的片段，抽出所有 `ExtSdkMethodKey\w+`（排除 `*Value`），再用 `parseObjcHeaderKeys()` 的 symbol→value 映射解析为字符串值列表。

**methodNames.test.ts 用例（共 6 个）：**
1. **sanity floor** — 每个 parser 返回数量 > 100，防止正则失效静默归零。
2. 每个 TS `MT*` 值都在 Java 常量值集合中。
3. 每个 TS `MT*` 值都在 ObjC header key 值集合中。
4. 每个 ObjC header key 在 `.m` 的 `methodMap` 里有映射。
5. `.m` 中每条映射的 `*Value` symbol 在 header 中有 `static const int` 定义。
6. 每个 TS `MTon*` 事件常量值都在 `supportedEvents` 解析出的字符串列表中。

> 如果跑出真实差异：保留失败，把 missing 列表完整复制到本任务 commit message 中作为审计记录；不要为了凑绿改动任何 native 文件。

- [ ] **Step 1** 写 `parsers.ts`。
- [ ] **Step 2** `yarn typecheck` 通过。
- [ ] **Step 3** 写 `methodNames.test.ts`。
- [ ] **Step 4** `yarn test:contract`，记录结果。
- [ ] **Step 5** 记录结果；若有差异，记录 missing 列表，留到 Task 13 的单次 commit message body 中。**不要 commit**，最终统一在 Task 13 提交。

---

### Task 10：故障注入演练（不留改动）

**目的：** 证明 Layer 1 / Layer 3 能拦截真实回归。**本任务不 commit。**

- [ ] **Step 1** 临时改 `src/__internal__/Utils.ts`：`return Date.now() + 1`。运行 `yarn test src/__tests__/unit/Utils.test.ts`，期望失败。
- [ ] **Step 2** 还原 `src/__internal__/Utils.ts`，再次运行同测试，期望绿。
- [ ] **Step 3**（仅当 Task 9 全绿时）：在 `Consts.ts` 末尾临时追加 `export const MTcontractDriftProbe = '__drift_probe__';`；运行 `yarn test:contract`，期望"TS↔Java" 用例失败且 missing 含该常量；**移除该行**，重跑确认回到基线。
- [ ] **Step 4** `git diff -- src/__internal__/Utils.ts src/__internal__/Consts.ts` 必须为空。

> 本任务无 commit——是机制验证步骤，不是代码改动。

---

### Task 11：Lefthook pre-commit 集成

**Files:** Modify `lefthook.yml`

**改动：** `pre-commit` 块下 `commands` 增 2 条：

```yaml
test:
  glob: "*.{ts,tsx,js,jsx}"
  run: yarn test --bail --findRelatedTests {staged_files} --passWithNoTests
contract:
  glob: "{src/__internal__/Consts.ts,modules/java/com/chatsdk/common/ExtSdkMethodType.java,modules/objc/common/ExtSdkMethodTypeObjc.h,modules/objc/common/ExtSdkMethodTypeObjc.m,modules/objc/rn/ExtSdkApiObjcRN.mm}"
  run: yarn test:contract
```

同时修正现有 `types` 的 glob：`"*.{js,ts, jsx, tsx}"` → `"*.{js,ts,jsx,tsx}"`（去掉空格）。

- [ ] **Step 1** 改 `lefthook.yml`。
- [ ] **Step 2** 模拟 pre-commit：`yarn test --bail --findRelatedTests src/__internal__/Utils.ts --passWithNoTests` 与 `yarn test:contract`，均符合预期。
- [ ] **Step 3** 性能预算：`time (yarn lint:sdk && yarn typecheck && yarn test:unit && yarn test:contract)`，目标墙钟 < 30 s，记录实际值（不卡阈值）。
- [ ] **Step 4** 记录结果；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 12：AGENTS.md 增补 native 手动验证提示

**Files:** Modify `AGENTS.md`

**改动：** 文件末尾追加：

```markdown
## Testing Discipline

- TS-side unit tests and the TS↔Native method-name contract test run on every commit via Lefthook pre-commit.
- Native wrapper code in `modules/java/` and `modules/objc/` is **not** covered by automated tests. After modifying any wrapper there, manually exercise the affected feature in `example/` before pushing.
```

- [ ] **Step 1** 追加段落。
- [ ] **Step 2** `git diff --stat AGENTS.md` 仅新增数行。
- [ ] **Step 3** 记录结果；**不要 commit**，最终统一在 Task 13 提交。

---

### Task 13：最终一次性提交

**目的：** 把 Task 1~12 的全部改动合并为本分支唯一的 commit。

**Files:** 不新增/修改源文件，只做最终验证 + 一次 commit。

- [ ] **Step 1** 跑完整 Layer 1 单测：`yarn test:unit`，全绿。
- [ ] **Step 2** 跑契约测试：`yarn test:contract`；全绿，或仅遗留 Task 9 中已记录的真实不一致。
- [ ] **Step 3** `yarn typecheck && yarn lint:sdk`，0 errors。
- [ ] **Step 4** 用 `git status` 与 `git diff --stat` 复核改动：
  - 删除：`src/__tests__/index.test.tsx`
  - 新建：`src/__tests__/setup.ts`、`src/__tests__/helpers/*.ts`、`src/__tests__/unit/*.test.ts`（11 个）、`src/__tests__/contract/parsers.ts`、`src/__tests__/contract/methodNames.test.ts`
  - 修改：`package.json`、`lefthook.yml`、`AGENTS.md`
  - **不应**出现：`src/__specs__/**`、`modules/**`、`lib/**`、`example/**`、`scripts/**`、`src/__internal__/**`（除被读取外）、`src/common/**`、`src/Chat*.ts`（业务源码）。若出现异常路径，定位并还原。
- [ ] **Step 5** 一次性 commit：
  ```bash
  git add \
    src/__tests__/setup.ts \
    src/__tests__/helpers \
    src/__tests__/unit \
    src/__tests__/contract \
    package.json \
    lefthook.yml \
    AGENTS.md
  git add -u src/__tests__/index.test.tsx
  git commit -m "$(cat <<'EOF'
  test: introduce Layer 1 unit tests and Layer 3 method-name contract

  Establish the testing baseline described in
  docs/superpowers/specs/2026-05-20-unit-testing-design.md:

  - Jest global setup mocks src/__specs__ so no native bridge is required.
  - Layer 1 unit tests (one source file ↔ one test file): Utils, ChatError,
    Factory, ErrorHandler, ChatMessage static factories, ChatClient, and
    each of the 7 managers (Chat/Contact/Group/Room/Presence/Push/UserInfo).
  - Layer 3 contract test parses Consts.ts together with
    ExtSdkMethodType.java, ExtSdkMethodTypeObjc.{h,m}, and
    ExtSdkApiObjcRN.mm to detect method-name drift across TS/Java/ObjC.
  - Lefthook pre-commit wires `test --findRelatedTests` and the contract
    test so regressions and drift are caught before code lands.
  - AGENTS.md notes that native wrapper changes still require manual
    validation in example/ (Layer 2 is intentionally out of scope).
  EOF
  )"
  ```
- [ ] **Step 6** `git log -1 --stat`，确认只新增 1 个 commit，文件清单与 Step 4 一致；`git status` working tree clean。

---

## Self-Review

- **Spec 覆盖** — design §5.1 目录（Task 1 + 各测试任务），§5.2 jest 配置（Task 1），§5.3 全局 mock（Task 1），§5.4 契约解析（Task 9），§5.5 scripts（Task 1），§5.6 lefthook（Task 11），§5.7 优先级（P0=Task 9 + Task 6；P1=Task 2 + 3；P2=Task 4 + 5；P3=Task 7 + 8），§5.8 Layer 2 不实施（Task 12）。§8 验收标准：setup（Task 1）、unit 含 P0~P3（Task 2~8）、契约（Task 9）、scripts（Task 1）、lefthook（Task 11）、故障注入（Task 10）、性能预算（Task 11 Step 3）、AGENTS.md（Task 12）、最终验收 + 单次提交（Task 13）。
- **一源一测** — Task 8 拆为 7 个 Manager 各自的 `*.test.ts`，与 source 一一对应；Task 6 / 7 同样独立文件。
- **整个分支一次 commit** — Task 1~12 全程不 commit；Task 10 本就无改动；Task 13 是唯一允许 `git commit` 的位置。
- **文档精简** — 每任务只列覆盖场景清单 + 1 个代表片段；解析器仅文字描述 + 一行 regex；契约测试用例改为编号场景。
- **类型一致性** — helpers (`installFakeChatClient` / `resetChatClient` / `mockCallMethodOnce` / `getLastCall` / `getCallMethodMock`) 与 parsers (`parseTsConsts` / `parseJavaConsts` / `parseObjcHeaderKeys` / `parseObjcHeaderValues` / `parseObjcMethodMap` / `resolveRnSupportedEventValues`) 命名前后一致。
