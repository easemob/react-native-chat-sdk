# react-native-chat-sdk Development Guidelines

## Active Technologies

- TypeScript 5.9 (strict mode) for the SDK library
- React Native 0.83 (new architecture only; `newArchEnabled=true` in example)
- C++17 for shared native bridge code (`modules/cpp/`)
- Java for the Android native bridge (`modules/java/`, `android/`)
- Objective-C / Objective-C++ for the iOS native bridge (`modules/objc/`, `ios/`)
- CMake for Android C++ compilation
- CocoaPods for iOS dependency management
- Yarn 4 workspaces (monorepo: root SDK + `example/`); Yarn 4.14.1 is pinned via `.yarnrc.yml` `yarnPath`
- React Native Builder Bob for library builds (module, typescript)
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
yarn prepare            # full init: gen version, cmake, env files; bob build (lib/)
yarn typecheck          # TypeScript type checking
yarn lint               # ESLint (+ Prettier) over js/ts/tsx
yarn test               # run all Jest tests (unit + contract)
yarn test:unit          # unit tests only
yarn test:contract      # TS <-> native method-name contract tests
yarn check:circular:dpdm  # circular dependency check
yarn scan:deprecated    # native deprecated API scan (needs gradle / xcodebuild):
                        # clean build + parse; stdout is JSON, full build log and a
                        # warnings-only copy (SDK code only) land in build/reports/.
                        # scripts/parse-deprecated-{android,ios}.sh re-parse an
                        # existing build/reports/*-raw.log without rebuilding.
yarn example start      # start Metro dev server
yarn example android    # run on Android
yarn example ios        # run on iOS
```

- CI quality gates are consolidated in `scripts/ci/run_quality.sh` — running it locally gives the same result as the `quality` job in `.github/workflows/ci.yml`. Run it before opening a PR.
- `yarn test`, `yarn typecheck`, `yarn lint`, and similar local validation commands should be run directly without asking for extra permission when they operate inside the workspace and do not need network access or other elevated privileges.
- In this Codex workspace, run `yarn test --no-watchman` by default when executing tests. Jest may try to use `watchman`, and the sandbox can block its socket access.

## CI

- GitHub Actions workflow: `.github/workflows/ci.yml`, triggered by pull requests (any base branch) and manual dispatch — not by push.
- Jobs: `quality` (runs `scripts/ci/run_quality.sh`, uploads coverage), `android-build` (JDK 17 + Gradle cache + deprecated API scan), `ios-build` (bundler-managed CocoaPods + Pods cache + deprecated API scan).
- Keep CI logic in scripts rather than inline YAML so local runs match CI (`scripts/ci/run_quality.sh`).
- Toolchain versions are pinned by the repo itself: Node via `.nvmrc`, Yarn via `.yarnrc.yml` `yarnPath`, CocoaPods via `example/Gemfile.lock` (always `bundle exec`).

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
- Do not modify files under `lib/` directly — they are generated by `yarn prepare` (`bob build`).
- Do not modify `src/version.ts` directly — it is generated by `scripts/generate-version.js`.
- The `modules/*/flutter/` directories are for the Flutter SDK variant and should not be modified for React Native work.
- Keep the example app (`example/`) functional when making SDK changes. Test screens in `example/src/demo2/Test/` cover specific manager operations. The example app uses bare React Native (no Expo).
- Prefer running `yarn typecheck` and `yarn lint` to validate changes before committing.
- This project uses Yarn 4 (Berry) with PnP disabled (node-modules linker). Do not use `npm`.

## Testing Discipline

- TS-side unit tests and the TS↔Native method-name contract test run on every commit via Lefthook pre-commit.
- Native wrapper code in `modules/java/` and `modules/objc/` is **not** covered by automated tests. After modifying any wrapper there, manually exercise the affected feature in `example/` before pushing.
