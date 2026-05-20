# Unit Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish Layer 1 (TypeScript unit tests) and Layer 3 (contract tests) as described in the approved design doc, with pre-commit integration via Lefthook.

**Architecture:** Jest with a global native mock in `setup.ts` isolates all TypeScript logic from Native bridge calls. Contract tests use Node `fs` + regex to extract and compare method name constants across `Consts.ts`, `ExtSdkMethodType.java`, and `ExtSdkMethodTypeObjc.h/m/mm`. All tests run via `yarn test`; pre-commit runs only tests related to staged files.

**Tech Stack:** Jest 28, ts-jest 28, react-native preset, Lefthook, TypeScript 5.0 strict.

**Spec:** `docs/superpowers/specs/2026-05-20-unit-testing-design.md`

---

## File Map

**New files:**
- `src/__tests__/setup.ts` — global `jest.mock` for `ExtSdkApiRN`
- `src/__tests__/helpers/mockChatClient.ts` — sets up `Factory.client` singleton for tests that call `createSendMessage`
- `src/__tests__/unit/Utils.test.ts` — tests for `getNowTimestamp`, `getRandomInt`, `generateMessageId`
- `src/__tests__/unit/ChatError.test.ts` — tests for `ChatError` and `ChatException` construction
- `src/__tests__/unit/ChatMessage.test.ts` — tests for all 9 static create methods
- `src/__tests__/contract/methodNames.test.ts` — contract: TS vs Java vs ObjC method name constants

**Modified files:**
- `package.json` — update `jest` config, add `test:unit`, `test:contract`, `test:coverage` scripts
- `lefthook.yml` — add `test` and `contract` commands to `pre-commit`

---

## Task 1: Commit the design doc

**Files:**
- Modify: `docs/superpowers/specs/2026-05-20-unit-testing-design.md` (already staged)

- [ ] **Step 1: Verify staged content**

```bash
git diff --cached --stat
```

Expected: `docs/superpowers/specs/2026-05-20-unit-testing-design.md | 348 +`

- [ ] **Step 2: Commit**

```bash
git commit -m "docs: add unit testing design spec"
```

Expected: commit succeeds, Lefthook pre-commit runs lint + tsc (no test files yet, both pass).

---

## Task 2: Update Jest config and scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update the `jest` block and add scripts**

In `package.json`, replace the existing `jest` block:

```json
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

Also add to `scripts`:
```json
"test:unit": "jest src/__tests__/unit",
"test:contract": "jest src/__tests__/contract",
"test:coverage": "jest --coverage"
```

- [ ] **Step 2: Verify config parses correctly**

```bash
node -e "const p = require('./package.json'); console.log(JSON.stringify(p.jest, null, 2))"
```

Expected: prints the jest config block without errors.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: configure jest for unit and contract tests"
```

---

## Task 3: Create global native mock and client helper

**Files:**
- Create: `src/__tests__/setup.ts`
- Create: `src/__tests__/helpers/mockChatClient.ts`

- [ ] **Step 1: Write the failing placeholder test to confirm setup wiring**

Create `src/__tests__/unit/Utils.test.ts` with just enough to trigger setup:

```ts
describe('setup smoke', () => {
  it('native mock is installed', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ExtSdkApiRN } = require('../../__specs__');
    expect(typeof ExtSdkApiRN.callMethod).toBe('function');
  });
});
```

- [ ] **Step 2: Run to confirm it fails (setup.ts does not exist yet)**

```bash
yarn test src/__tests__/unit/Utils.test.ts
```

Expected: FAIL — `Cannot find module '../../__specs__'` or similar native module error.

- [ ] **Step 3: Create `src/__tests__/setup.ts`**

```ts
jest.mock('../../src/__specs__', () => ({
  ExtSdkApiRN: {
    callMethod: jest.fn().mockResolvedValue({}),
  },
}));
```

> Note: `react-native` jest preset auto-mocks many native modules. We still explicitly mock `__specs__` because it's our own TurboModule spec, not a standard RN module.

- [ ] **Step 4: Run smoke test again**

```bash
yarn test src/__tests__/unit/Utils.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create `src/__tests__/helpers/mockChatClient.ts`**

`createSendMessage` calls `Factory.getChatClient().currentUserName`. Tests that exercise `createSendMessage` need a stub client:

```ts
import { Factory } from '../../__internal__/Factory';

export function setupMockChatClient(currentUserName: string = 'testUser'): void {
  Factory.setChatClient({ currentUserName } as any);
}

export function teardownMockChatClient(): void {
  (Factory as any).client = undefined;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/__tests__/setup.ts src/__tests__/helpers/mockChatClient.ts src/__tests__/unit/Utils.test.ts
git commit -m "test: add jest setup, native mock, and client helper"
```

---

## Task 4: Utils unit tests

**Files:**
- Modify: `src/__tests__/unit/Utils.test.ts`

`Utils.ts` exports three functions: `getNowTimestamp`, `getRandomInt`, `generateMessageId`.

- [ ] **Step 1: Replace placeholder with real tests**

```ts
import { generateMessageId, getNowTimestamp, getRandomInt } from '../../__internal__/Utils';

describe('getNowTimestamp', () => {
  it('returns a number close to Date.now()', () => {
    const before = Date.now();
    const result = getNowTimestamp();
    const after = Date.now();
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });
});

describe('getRandomInt', () => {
  it('returns an integer within [min, max]', () => {
    for (let i = 0; i < 50; i++) {
      const result = getRandomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('returns min when min === max', () => {
    expect(getRandomInt(5, 5)).toBe(5);
  });
});

describe('generateMessageId', () => {
  it('produces a non-empty string', () => {
    expect(generateMessageId().length).toBeGreaterThan(0);
  });

  it('produces unique values on successive calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateMessageId()));
    expect(ids.size).toBe(20);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
yarn test:unit
```

Expected: PASS, 4 tests.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/unit/Utils.test.ts
git commit -m "test: Utils unit tests"
```

---

## Task 5: ChatError unit tests

**Files:**
- Create: `src/__tests__/unit/ChatError.test.ts`

- [ ] **Step 1: Write tests**

```ts
import { ChatError, ChatException } from '../../common/ChatError';

describe('ChatError', () => {
  it('stores code and description', () => {
    const err = new ChatError({ code: 100, description: 'not found' });
    expect(err.code).toBe(100);
    expect(err.description).toBe('not found');
  });

  it('is an instance of Error', () => {
    const err = new ChatError({ code: 1, description: 'test' });
    expect(err).toBeInstanceOf(Error);
  });

  it('has name ChatError', () => {
    const err = new ChatError({ code: 1, description: 'test' });
    expect(err.name).toBe('ChatError');
  });

  it('message equals description', () => {
    const err = new ChatError({ code: 42, description: 'oops' });
    expect(err.message).toBe('oops');
  });
});

describe('ChatException', () => {
  it('extends ChatError', () => {
    const ex = new ChatException({ code: 200, description: 'fail' });
    expect(ex).toBeInstanceOf(ChatError);
  });

  it('has name ChatException', () => {
    const ex = new ChatException({ code: 200, description: 'fail' });
    expect(ex.name).toBe('ChatException');
  });

  it('stores code and description', () => {
    const ex = new ChatException({ code: 500, description: 'internal' });
    expect(ex.code).toBe(500);
    expect(ex.description).toBe('internal');
  });
});
```

- [ ] **Step 2: Run tests**

```bash
yarn test:unit
```

Expected: PASS, all tests green.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/unit/ChatError.test.ts
git commit -m "test: ChatError and ChatException unit tests"
```

---

## Task 6: ChatMessage unit tests

**Files:**
- Create: `src/__tests__/unit/ChatMessage.test.ts`

`createSendMessage` calls `Factory.getChatClient().currentUserName`, so all send-message tests need the mock client from Task 3.

- [ ] **Step 1: Write tests**

```ts
import {
  ChatMessage,
  ChatMessageChatType,
  ChatTextMessageBody,
  ChatFileMessageBody,
  ChatImageMessageBody,
  ChatVideoMessageBody,
  ChatVoiceMessageBody,
  ChatCombineMessageBody,
  ChatLocationMessageBody,
  ChatCmdMessageBody,
  ChatCustomMessageBody,
  ChatMessageDirection,
  ChatMessageStatus,
} from '../../common/ChatMessage';
import { setupMockChatClient, teardownMockChatClient } from '../helpers/mockChatClient';

beforeEach(() => setupMockChatClient('alice'));
afterEach(() => teardownMockChatClient());

describe('createTextMessage', () => {
  it('defaults to PeerChat when chatType omitted', () => {
    const m = ChatMessage.createTextMessage('bob', 'hello');
    expect(m.chatType).toBe(ChatMessageChatType.PeerChat);
  });

  it('stores text content in body', () => {
    const m = ChatMessage.createTextMessage('bob', 'hello');
    expect((m.body as ChatTextMessageBody).content).toBe('hello');
  });

  it('sets direction to SEND', () => {
    const m = ChatMessage.createTextMessage('bob', 'hello');
    expect(m.direction).toBe(ChatMessageDirection.SEND);
  });

  it('sets from to current user', () => {
    const m = ChatMessage.createTextMessage('bob', 'hello');
    expect(m.from).toBe('alice');
  });

  it('group chat message carries GroupChat chatType', () => {
    const m = ChatMessage.createTextMessage('g1', 'hi', ChatMessageChatType.GroupChat);
    expect(m.chatType).toBe(ChatMessageChatType.GroupChat);
  });

  it('threaded message carries isChatThread flag', () => {
    const m = ChatMessage.createTextMessage('g1', 'hi', ChatMessageChatType.GroupChat, {
      isChatThread: true,
    });
    expect(m.isChatThread).toBe(true);
  });

  it('empty content is preserved without throwing', () => {
    const m = ChatMessage.createTextMessage('bob', '');
    expect((m.body as ChatTextMessageBody).content).toBe('');
  });

  it('deliverOnlineOnly false means offline users also receive', () => {
    const m = ChatMessage.createTextMessage('bob', 'hi', ChatMessageChatType.PeerChat, {
      deliverOnlineOnly: false,
    });
    expect(m.deliverOnlineOnly).toBe(false);
  });

  it('targeted message with receiverList carries receivers', () => {
    const m = ChatMessage.createTextMessage('g1', 'hi', ChatMessageChatType.GroupChat, {
      receiverList: ['u1', 'u2'],
    });
    expect(m.receiverList).toEqual(['u1', 'u2']);
  });
});

describe('createFileMessage', () => {
  it('stores filePath as localPath in body', () => {
    const m = ChatMessage.createFileMessage('bob', '/tmp/file.pdf');
    expect((m.body as ChatFileMessageBody).localPath).toBe('/tmp/file.pdf');
  });

  it('uses empty displayName when not provided', () => {
    const m = ChatMessage.createFileMessage('bob', '/tmp/file.pdf');
    expect((m.body as ChatFileMessageBody).displayName).toBe('');
  });

  it('carries provided displayName', () => {
    const m = ChatMessage.createFileMessage('bob', '/tmp/file.pdf', ChatMessageChatType.PeerChat, {
      displayName: 'report.pdf',
    });
    expect((m.body as ChatFileMessageBody).displayName).toBe('report.pdf');
  });
});

describe('createImageMessage', () => {
  it('uses filePath as displayName fallback when displayName not provided', () => {
    const m = ChatMessage.createImageMessage('bob', '/img/photo.jpg');
    expect((m.body as ChatImageMessageBody).displayName).toBe('/img/photo.jpg');
  });

  it('sendOriginalImage defaults to false', () => {
    const m = ChatMessage.createImageMessage('bob', '/img/photo.jpg');
    expect((m.body as ChatImageMessageBody).sendOriginalImage).toBe(false);
  });

  it('carries width and height when provided', () => {
    const m = ChatMessage.createImageMessage('bob', '/img/photo.jpg', ChatMessageChatType.PeerChat, {
      displayName: 'photo.jpg',
      width: 1920,
      height: 1080,
    });
    expect((m.body as ChatImageMessageBody).width).toBe(1920);
    expect((m.body as ChatImageMessageBody).height).toBe(1080);
  });
});

describe('createVideoMessage', () => {
  it('stores filePath as localPath in body', () => {
    const m = ChatMessage.createVideoMessage('bob', '/tmp/clip.mp4');
    expect((m.body as ChatVideoMessageBody).localPath).toBe('/tmp/clip.mp4');
  });

  it('carries duration when provided', () => {
    const m = ChatMessage.createVideoMessage('bob', '/tmp/clip.mp4', ChatMessageChatType.PeerChat, {
      displayName: 'clip.mp4',
      thumbnailLocalPath: '/tmp/thumb.jpg',
      duration: 30,
      width: 1280,
      height: 720,
    });
    expect((m.body as ChatVideoMessageBody).duration).toBe(30);
  });
});

describe('createVoiceMessage', () => {
  it('stores filePath as localPath in body', () => {
    const m = ChatMessage.createVoiceMessage('bob', '/tmp/voice.aac');
    expect((m.body as ChatVoiceMessageBody).localPath).toBe('/tmp/voice.aac');
  });

  it('carries duration when provided', () => {
    const m = ChatMessage.createVoiceMessage('bob', '/tmp/voice.aac', ChatMessageChatType.PeerChat, {
      duration: 15,
    });
    expect((m.body as ChatVoiceMessageBody).duration).toBe(15);
  });
});

describe('createCombineMessage', () => {
  it('stores provided messageIdList in body', () => {
    const m = ChatMessage.createCombineMessage('bob', ['id1', 'id2', 'id3']);
    expect((m.body as ChatCombineMessageBody).messageIdList).toEqual(['id1', 'id2', 'id3']);
  });

  it('empty messageIdList is allowed (caller responsibility)', () => {
    const m = ChatMessage.createCombineMessage('bob', []);
    expect((m.body as ChatCombineMessageBody).messageIdList).toEqual([]);
  });

  it('carries optional title and summary', () => {
    const m = ChatMessage.createCombineMessage('bob', ['id1'], ChatMessageChatType.PeerChat, {
      title: 'Chat History',
      summary: '3 messages',
    });
    expect((m.body as ChatCombineMessageBody).title).toBe('Chat History');
    expect((m.body as ChatCombineMessageBody).summary).toBe('3 messages');
  });
});

describe('createLocationMessage', () => {
  it('stores latitude and longitude in body', () => {
    const m = ChatMessage.createLocationMessage('bob', '31.23', '121.47');
    expect((m.body as ChatLocationMessageBody).latitude).toBe('31.23');
    expect((m.body as ChatLocationMessageBody).longitude).toBe('121.47');
  });

  it('address defaults to empty string when not provided', () => {
    const m = ChatMessage.createLocationMessage('bob', '31.23', '121.47');
    expect((m.body as ChatLocationMessageBody).address).toBe('');
  });

  it('carries address when provided', () => {
    const m = ChatMessage.createLocationMessage('bob', '31.23', '121.47', ChatMessageChatType.PeerChat, {
      address: 'Shanghai, China',
    });
    expect((m.body as ChatLocationMessageBody).address).toBe('Shanghai, China');
  });
});

describe('createCmdMessage', () => {
  it('stores action in body', () => {
    const m = ChatMessage.createCmdMessage('bob', 'typing');
    expect((m.body as ChatCmdMessageBody).action).toBe('typing');
  });

  it('empty action string is preserved', () => {
    const m = ChatMessage.createCmdMessage('bob', '');
    expect((m.body as ChatCmdMessageBody).action).toBe('');
  });
});

describe('createCustomMessage', () => {
  it('stores event in body', () => {
    const m = ChatMessage.createCustomMessage('bob', 'gift');
    expect((m.body as ChatCustomMessageBody).event).toBe('gift');
  });

  it('carries params when provided', () => {
    const m = ChatMessage.createCustomMessage('bob', 'gift', ChatMessageChatType.PeerChat, {
      params: { giftId: '123', count: '2' },
    });
    expect((m.body as ChatCustomMessageBody).params).toEqual({ giftId: '123', count: '2' });
  });

  it('params is undefined when not provided', () => {
    const m = ChatMessage.createCustomMessage('bob', 'gift');
    expect((m.body as ChatCustomMessageBody).params).toBeUndefined();
  });
});

describe('createReceiveMessage', () => {
  it('constructs a message from raw native params', () => {
    const raw = {
      msgId: 'msg-001',
      from: 'server',
      to: 'alice',
      direction: 'rec',
      chatType: 0,
      status: 2,
      body: { type: 'txt', content: 'received' },
    };
    const m = ChatMessage.createReceiveMessage(raw);
    expect(m.msgId).toBe('msg-001');
    expect(m.direction).toBe(ChatMessageDirection.RECEIVE);
    expect(m.status).toBe(ChatMessageStatus.SUCCESS);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
yarn test:unit
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/unit/ChatMessage.test.ts
git commit -m "test: ChatMessage create method unit tests"
```

---

## Task 7: Contract tests — TS vs Java vs ObjC method constants

**Files:**
- Create: `src/__tests__/contract/methodNames.test.ts`

**What this tests:**
1. Every value in `Consts.ts` (`export const MTxxx = 'yyy'`) must also appear as a value in `ExtSdkMethodType.java` (`public static final String xxx = "yyy"`)
2. Every value in `Consts.ts` must also appear as a string constant value in `ExtSdkMethodTypeObjc.h` (`static NSString *... = @"yyy"`)
3. Every string value declared in `ExtSdkMethodTypeObjc.h` must have an entry in the `methodMap` inside `ExtSdkMethodTypeObjc.m`

**Important:** The current codebase has known divergence (TS has ~301 constants, Java ~301, ObjC ~276). This first version is **report-only**: it logs mismatches but does not fail the test. A comment in the file marks where to flip to `strict` mode once divergence is resolved.

- [ ] **Step 1: Write the contract test**

```ts
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '../../..');

function extractTsConstValues(filePath: string): Set<string> {
  const src = fs.readFileSync(filePath, 'utf8');
  const values = new Set<string>();
  // Matches: export const MTfoo = 'bar'; (including multi-line continuations)
  const re = /export const MT\w+\s*=\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    values.add(m[1]!);
  }
  return values;
}

function extractJavaConstValues(filePath: string): Set<string> {
  const src = fs.readFileSync(filePath, 'utf8');
  const values = new Set<string>();
  // Matches: public static final String foo = "bar";
  const re = /public static final String \w+\s*=\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    values.add(m[1]!);
  }
  return values;
}

function extractObjcHeaderStringValues(filePath: string): Set<string> {
  const src = fs.readFileSync(filePath, 'utf8');
  const values = new Set<string>();
  // Matches: static NSString *_Nonnull const ExtSdkMethodKeyFoo = @"bar";
  const re = /static NSString \*\S+ const ExtSdkMethodKey\w+\s*=\s*@"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    values.add(m[1]!);
  }
  return values;
}

function extractObjcMethodMapKeys(filePath: string): Set<string> {
  const src = fs.readFileSync(filePath, 'utf8');
  const values = new Set<string>();
  // Matches macro keys like: ExtSdkMethodKeyFoo : @(ExtSdkMethodKeyFooValue),
  const re = /(ExtSdkMethodKey\w+)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    // We capture the macro key name, resolve to string value via header lookup
    values.add(m[1]!);
  }
  return values;
}

function extractObjcHeaderMacroNames(filePath: string): Set<string> {
  const src = fs.readFileSync(filePath, 'utf8');
  const names = new Set<string>();
  // Matches: static NSString *... const ExtSdkMethodKeyFoo = @"bar";
  const re = /const (ExtSdkMethodKey\w+)\s*=/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const name = m[1]!;
    // Exclude integer value defines like ExtSdkMethodKeyFooValue
    if (!name.endsWith('Value')) {
      names.add(name);
    }
  }
  return names;
}

describe('Contract: method name constants', () => {
  const tsConsts = extractTsConstValues(
    path.join(root, 'src/__internal__/Consts.ts')
  );
  const javaConsts = extractJavaConstValues(
    path.join(root, 'modules/java/com/chatsdk/common/ExtSdkMethodType.java')
  );
  const objcStringValues = extractObjcHeaderStringValues(
    path.join(root, 'modules/objc/common/ExtSdkMethodTypeObjc.h')
  );
  const objcMethodMapMacros = extractObjcMethodMapKeys(
    path.join(root, 'modules/objc/common/ExtSdkMethodTypeObjc.m')
  );
  const objcHeaderMacroNames = extractObjcHeaderMacroNames(
    path.join(root, 'modules/objc/common/ExtSdkMethodTypeObjc.h')
  );

  // REPORT-ONLY MODE: log mismatches without failing.
  // When divergence between TS/Java/ObjC is fully resolved,
  // flip STRICT_MODE to true to enforce the contract.
  const STRICT_MODE = false;

  function reportOrFail(label: string, missing: string[]): void {
    if (missing.length === 0) return;
    const msg = `${label}:\n  ${missing.join('\n  ')}`;
    if (STRICT_MODE) {
      fail(msg);
    } else {
      console.warn(`[contract warning] ${msg}`);
    }
  }

  it('extracts constants from all files (sanity check)', () => {
    expect(tsConsts.size).toBeGreaterThan(50);
    expect(javaConsts.size).toBeGreaterThan(50);
    expect(objcStringValues.size).toBeGreaterThan(50);
    expect(objcMethodMapMacros.size).toBeGreaterThan(50);
  });

  it('TS constants are present in Java constants', () => {
    const missing = [...tsConsts].filter(v => !javaConsts.has(v));
    reportOrFail('TS constants missing from Java', missing);
    // Always passes in report-only mode; in strict mode the fail() above throws.
    expect(true).toBe(true);
  });

  it('TS constants are present in ObjC string constants', () => {
    const missing = [...tsConsts].filter(v => !objcStringValues.has(v));
    reportOrFail('TS constants missing from ObjC header', missing);
    expect(true).toBe(true);
  });

  it('ObjC header macro names are registered in methodMap', () => {
    const missing = [...objcHeaderMacroNames].filter(
      name => !objcMethodMapMacros.has(name)
    );
    reportOrFail('ObjC header macros not in methodMap', missing);
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run contract tests**

```bash
yarn test:contract
```

Expected: PASS with warnings printed to console showing current divergence. No test failures.

- [ ] **Step 3: Confirm sanity check passes (extracted counts are reasonable)**

The console output should show extracted sizes > 50 for all four sets. If any shows 0, the regex needs adjustment.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/contract/methodNames.test.ts
git commit -m "test: contract test for TS/Java/ObjC method name constants (report-only)"
```

---

## Task 8: Update Lefthook to run tests on pre-commit

**Files:**
- Modify: `lefthook.yml`

- [ ] **Step 1: Add test and contract commands**

Replace the existing `lefthook.yml` content with:

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
commit-msg:
  parallel: true
  commands:
    commitlint:
      run: npx commitlint --edit
post-commit:
  parallel: true
  commands:
    gitleaks:
      run: gitleaks detect -c '.gitleaksconfig.toml' -s . -r gitleaks.log
```

- [ ] **Step 2: Smoke-test the hook manually**

Stage a test file and run Lefthook directly:

```bash
git add src/__tests__/unit/Utils.test.ts
npx lefthook run pre-commit
```

Expected: all four commands run (lint, types, test, contract), all pass.

- [ ] **Step 3: Commit**

```bash
git add lefthook.yml
git commit -m "chore: run unit and contract tests on pre-commit"
```

The Lefthook hook itself runs during this commit — expected to pass.

---

## Task 9: Verify acceptance criteria

- [ ] **Step 1: Run full test suite**

```bash
yarn test
```

Expected: all tests pass.

- [ ] **Step 2: Run with coverage**

```bash
yarn test:coverage
```

Expected: coverage report generated, no threshold failures (none are set).

- [ ] **Step 3: Verify pre-commit total time**

```bash
time (git add -A && npx lefthook run pre-commit)
```

Expected: completes in < 30 seconds.

- [ ] **Step 4: Verify test catches a broken assertion**

Temporarily change `Utils.ts`:
```ts
export function getNowTimestamp(): number {
  return 0; // break it
}
```

Then:
```bash
git add src/__internal__/Utils.ts
npx lefthook run pre-commit
```

Expected: `test` command fails, commit is blocked.

Revert the change:
```bash
git checkout src/__internal__/Utils.ts
```

- [ ] **Step 5: Verify contract test catches a divergence**

Temporarily add a fake constant to `Consts.ts`:
```ts
export const MTfakeTestMethod = 'fakeTestMethod';
```

Then:
```bash
git add src/__internal__/Consts.ts
npx lefthook run pre-commit
```

Expected (report-only mode): contract test passes but prints `[contract warning] TS constants missing from Java: fakeTestMethod`.

Revert:
```bash
git checkout src/__internal__/Consts.ts
```

- [ ] **Step 6: Update AGENTS.md with native wrapper guidance**

Add this line to the "Working Rules for Agents" section of `AGENTS.md`:

```
- After modifying any file under `modules/java/com/chatsdk/dispatch/` or `modules/objc/dispatch/`, manually verify the affected functionality in the example app (`example/`).
```

- [ ] **Step 7: Final commit**

```bash
git add AGENTS.md
git commit -m "docs: note manual verification requirement for native wrapper changes"
```

---

## Summary

| Task | Deliverable |
|---|---|
| 1 | Design doc committed |
| 2 | Jest config + scripts |
| 3 | `setup.ts` + client helper |
| 4 | `Utils.test.ts` |
| 5 | `ChatError.test.ts` |
| 6 | `ChatMessage.test.ts` |
| 7 | `contract/methodNames.test.ts` (report-only) |
| 8 | Lefthook updated |
| 9 | Acceptance criteria verified |
