# react-native-chat-sdk Development Guidelines

## Active Technologies

- TypeScript 5.0 (strict mode) for the SDK library
- React Native 0.72 (supports 0.66+, both old and new architecture)
- C++17 for shared native bridge code (`modules/cpp/`)
- Java for the Android native bridge (`modules/java/`, `android/`)
- Objective-C / Objective-C++ for the iOS native bridge (`modules/objc/`, `ios/`)
- CMake for Android C++ compilation
- CocoaPods for iOS dependency management
- Yarn 3.6 workspaces (monorepo: root SDK + `example/`)
- React Native Builder Bob for library builds (commonjs, module, typescript)
- Turbo for monorepo task orchestration and CI caching
- TypeDoc for API documentation generation
- Jest for unit testing
- ESLint + Prettier for linting and formatting
- Lefthook for git hooks (pre-commit, commit-msg, post-commit)
- Commitlint enforcing conventional commits
- Gitleaks for secret scanning (post-commit hook)
- HyphenateChat 4.18.1 (underlying native IM SDK for iOS and Android)

## Project Structure

```text
src/                            # TypeScript SDK source
├── Chat*.ts                    # Manager classes (Client, Manager, Group, Contact, Room, Push, Presence, UserInfo)
├── ChatEvents.ts               # Event listener interfaces
├── common/                     # Shared types and models (ChatMessage, ChatConversation, ChatGroup, etc.)
├── __internal__/               # Native bridge base, method constants (Consts.ts), Factory, Utils
├── __specs__/                  # TurboModule spec (codegen)
└── __tests__/                  # Jest unit tests

modules/                        # Shared native code (RN and Flutter)
├── cpp/common/                 # Method name constants (ExtSdkMethodType.*), must sync with Consts.ts
├── java/com/chatsdk/           # Java: dispatch/ (wrappers), rn/ (RN adapter), flutter/ (unused)
└── objc/                       # ObjC: dispatch/ (wrappers), rn/ (RN adapter), flutter/ (unused)

android/                        # Android native module
ios/                            # iOS native module (delegates to modules/objc)
lib/                            # Generated output (do not edit)
example/                        # Example app (src/demo2/Test/ has test screens)
```

## Commands

```sh
yarn                    # install dependencies
yarn prepare            # full init: gen version, cmake, env files; build exports; check circular deps
yarn typecheck          # TypeScript type checking
yarn lint:sdk           # lint SDK only
yarn test               # run Jest unit tests
yarn build:exports      # compile TS via bob build
yarn example start      # start Metro dev server
yarn example android    # run on Android
yarn example ios        # run on iOS
```

## Architecture

### Native Bridge Pattern

All native calls flow through a single entry point:

```
TypeScript Manager → Native._callMethod(methodName, args) → NativeModule.callMethod(method, args)
                                                                    ↓
                                                     ┌──────────────┴──────────────┐
                                                     │                             │
                                            Android (Java)                   iOS (ObjC)
                                         ExtSdkApiRN.java             ExtSdkApiObjcRN.mm
                                               ↓                             ↓
                                        ExtSdkDispatch                 ExtSdkDispatch
                                               ↓                             ↓
                                      Manager Wrappers               Manager Wrappers
                                     (ExtSdk*Wrapper.java)          (ExtSdk*Wrapper.m)
                                               ↓                             ↓
                                        HyphenateChat SDK            HyphenateChat SDK
```

- **TurboModule** (new arch) with `NativeModules` fallback (old arch)
- Single native method: `callMethod(method: string, args?: Object)` dispatches to the correct wrapper
- Events flow back via `NativeEventEmitter` → listener callbacks

### Manager Pattern

- Singleton managers for each domain: `ChatClient`, `ChatManager`, `ChatGroupManager`, `ChatContactManager`, `ChatRoomManager`, `ChatPushManager`, `ChatPresenceManager`, `ChatUserInfoManager`
- All extend `BaseManager` → `Native` (the native bridge base)
- Promise-based async operations
- Event subscription via `add*Listener()` / `remove*Listener()` methods defined in `ChatEvents.ts`

### Type System

- Strict TypeScript with all strict checks enabled
- Enum-based constants (`ChatMessageType`, `ChatConversationType`, etc.)
- Factory pattern in `__internal__/Factory.ts` for converting native responses to TypeScript objects
- Method name constants centralized in `__internal__/Consts.ts`

### Shared Native Code

The `modules/` directory contains native code shared between React Native and Flutter SDKs:
- `modules/cpp/common/ExtSdkMethodType.*` defines all method name constants (must stay in sync with `src/__internal__/Consts.ts`)
- `modules/java/com/chatsdk/dispatch/` and `modules/objc/dispatch/` contain the actual SDK wrapper implementations
- `modules/*/rn/` contains React Native-specific adapters
- `modules/*/flutter/` contains Flutter-specific adapters (not used in this project)

## Working Rules for Agents

- Default to searching under `src/` first for TypeScript changes and `modules/` for native changes.
- When modifying a manager's TypeScript API, check whether the corresponding native wrappers in both `modules/java/com/chatsdk/dispatch/` and `modules/objc/dispatch/` need updates.
- When adding a new method, ensure the method name constant is added to all three locations: `src/__internal__/Consts.ts`, `modules/cpp/common/ExtSdkMethodType.*`, and the platform-specific method type files.
- Do not modify files under `lib/` directly — they are generated by `yarn build:exports`.
- Do not modify `src/version.ts` directly — it is generated by `scripts/generate-version.js`.
- The `modules/*/flutter/` directories are for the Flutter SDK variant and should not be modified for React Native work.
- Keep the example app (`example/`) functional when making SDK changes. Test screens in `example/src/demo2/Test/` cover specific manager operations. The example app uses bare React Native (no Expo).
- Prefer running `yarn typecheck` and `yarn lint:sdk` to validate changes before committing.
- This project uses Yarn 3 (Berry) with PnP disabled (node-modules linker). Do not use `npm`.

## Testing Discipline

- TS-side unit tests and the TS↔Native method-name contract test run on every commit via Lefthook pre-commit.
- Native wrapper code in `modules/java/` and `modules/objc/` is **not** covered by automated tests. After modifying any wrapper there, manually exercise the affected feature in `example/` before pushing.
