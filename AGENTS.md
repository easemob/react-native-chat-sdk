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
└── __tests__/                  # Jest tests (unit/, contract/, helpers/)

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
- CI does not use corepack (it ignores `yarnPath` and downloads Yarn from repo.yarnpkg.com, a network failure point); `.github/actions/setup` puts a shim for the checked-in `.yarn/releases/yarn-*.cjs` on PATH instead.
- Device smoke workflow: `.github/workflows/device-smoke.yml`, triggered daily (UTC 18:43) and by manual dispatch — not on PR/push. It is fully independent from `ci.yml` (no shared artifacts, no `workflow_run`): the smoke app must inline `API_SCRIPT` at bundle time and Android targets the emulator ABI (x86_64), so it builds its own packages. Per platform a `build` job uploads the APK/.app as a 1-day workflow artifact and a `test` job boots an emulator/simulator and runs the orchestration script.
- Smoke cases live in `example/ci/no_login_smoke.json` (one no-login API call per manager, each with an `expect.errorCode`). The example app's auto mode (`example/src/auto/auto_mode.ts`) executes the script on launch; `scripts/ci/assert_script.js` compares the pulled device log against the expected error codes. Local runs match CI: `bash scripts/ci/smoke_local.sh <android|ios>` builds the smoke package and runs the driver (`scripts/ci/run_device_android.sh` / `run_device_ios.sh`) in one step.
- CI test jobs do not call the drivers directly: they go through `scripts/ci/run_ci_android.sh` / `run_ci_ios.sh` (thin wrappers around the drivers; the Android one exists because android-emulator-runner's `script:` input mangles multi-line scripts — only the first line reaches the shell — and it also handles on-device cleanup plus the logcat dump). The iOS build jobs zip the `.app` with `ditto` before upload-artifact: uploading a directory path strips the `ChatSdkExample.app` wrapper and download drops the executable bit.
- Smoke builds differ from dev builds because they must embed the JS bundle: Android `./gradlew app:assembleDebug -PbundleInDebug=true -PreactNativeArchitectures=x86_64` with `API_SCRIPT=/data/local/tmp/rn_smoke_no_login.json` in the environment; iOS `xcodebuild ... FORCE_BUNDLING=1 API_SCRIPT=/tmp/rn_smoke_no_login.json` (both are user-defined build settings so the RN bundle phase sees them). Debug builds normally skip bundling and load JS from Metro.
- Single-account nightly workflow: `.github/workflows/single-account-nightly.yml`, triggered daily (UTC 19:37) and by manual dispatch. It logs in with a real account and calls one read-only fetch API per manager, expecting success. Cases live in `example/ci/single_account.json` (a pure case file like `no_login_smoke.json`; the presence case references the account via `$config.accounts.0.id`). `scripts/ci/write_single_account_config.sh` generates the API_CONFIG (appKey + account, mirroring `example/src/env.ts`'s shape) from the `E2E_APP_KEY` / `E2E_USER_ID` / `E2E_USER_PASSWORD` secrets (stored in the GitHub environment `rn-single-account`) as a 0600 file that is deleted after the run; auto-mode derives init/login from it. The four jobs (build/test per platform) run in two parallel lanes; the console has multi-device login enabled for the account, so Android and iOS may log in at the same time. The driver scripts are the smoke ones with `SCRIPT_JSON` / `CONFIG_JSON` / `DEVICE_SCRIPT_PATH` / `DEVICE_CONFIG_PATH` / `HOST_SCRIPT_PATH` / `HOST_CONFIG_PATH` / `OUT_LOG` overrides; the nightly build inlines `API_SCRIPT` + `API_CONFIG` (`/data/local/tmp/rn_single_account{,_config}.json` on Android, `/tmp/rn_single_account{,_config}.json` on iOS). Local runs match CI: export the three `E2E_*` variables, then `bash scripts/ci/nightly_local.sh <android|ios>`.

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

- TS-side unit tests and the TS↔Native contract tests run on every commit via Lefthook pre-commit.
- Contract tests (`src/__tests__/contract/`) check method-name parity across TS / Java / ObjC, TS-side event wiring (every non-deprecated `MTon*` const must be referenced in `src/` or explicitly allowlisted), and duplicate const values.
- Unit tests (`src/__tests__/unit/`) focus on logic-bearing points: event dispatch (native event → listener fan-out), send-callback routing (`BaseManager`), model decoding, and error mapping — not per-API pass-through coverage.
- Coverage policy: line coverage is a reference metric, not a gate. Most uncovered lines are thin per-API wrappers in the manager classes (`ChatManager`, `ChatGroupManager`, etc.) whose bodies just forward to `Native._callMethod`. Mocking the native layer to assert "the mock was called with these params" only restates the implementation: it cannot see real native behavior, it breaks on every internal refactor, and the bugs it could catch (wrong method const, wrong param shape) are already covered statically by the contract tests. The real bug-prone seams are TS↔native contract drift (contract tests), event decoding/dispatch, and model encode/decode — tests target those. Do not add blanket pass-through tests to raise the coverage number, and do not set a coverage threshold.
- Test code and comments are written in English.
- Native wrapper code in `modules/java/` and `modules/objc/` is **not** covered by automated tests. After modifying any wrapper there, manually exercise the affected feature in `example/` before pushing.
