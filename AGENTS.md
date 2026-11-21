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
- HyphenateChat 4.25.x (Android 4.25.1; iOS CocoaPods ~> 4.25.0)

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
example/                        # Example app (API tester; API registry in src/registry/)
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
- Device regression workflow: `.github/workflows/ci-device.yml`, triggered by a daily schedule (19:37 UTC; the cron lives in the shared workflow file but fires only from the default branch `dev`, covering the 1 line — the 5.x line's daily run is dispatched by the dev-only `.github/workflows/ci-dispatch.yml`, see "Git Branch Management (Iron Rules)" rule 8) and by manual dispatch. It builds the CI bundle once per platform, then runs the fixed `logged_out` and logged-in entries through `scripts/ci/ci_test_local.sh`.
- Logged-in device lanes set `E2E_USER_SUFFIX` to `_rn_android` / `_rn_ios`, deriving separate login users and default peers (`<effectiveUserId>_ci_peer`) to isolate server-side state while running in parallel. Locally the suffix defaults to empty and applies after credential fallback; explicit `E2E_PEER_ID` and token-helper `--user-id` values are complete ids used unchanged.
- Device cases live in `example/src/ci/modules/` and are checked against `docs/ci/native-case-mapping.json`. Local runs match CI: `bash scripts/ci/ci_test_local.sh <android|ios> [entries]`. The old `device-smoke.yml` and `single-account-nightly.yml` workflows and their replacement scripts were removed during the 1.21.0 backport.
- CI test jobs do not call the drivers directly: they go through `scripts/ci/run_ci_android.sh` / `run_ci_ios.sh` (thin wrappers around the drivers; the Android one exists because android-emulator-runner's `script:` input mangles multi-line scripts — only the first line reaches the shell — and it also handles on-device cleanup plus the logcat dump). Both wrappers also start `scripts/ci/render_ci_log.js` next to the log capture: it live-renders the `[APITEST]` records to stdout as ✅/❌/🚫 per-case lines (`compact` reporter, the CI default) or passes every `[APITEST]` line through (`expanded`, the local default; override with `CI_LOG_REPORTER`). It is a pure view layer — assertions stay with `assert_ci_run.js`. The iOS build jobs zip the `.app` with `ditto` before upload-artifact: uploading a directory path strips the `ChatSdkExample.app` wrapper and download drops the executable bit. Android test jobs must keep the "Enable KVM group perms" udev step before android-emulator-runner: the ubuntu-24.04 image has /dev/kvm but the runner user is not in the kvm group (actions/runner-images#8542), and without it the emulator silently falls back to ~10x slower software emulation and the driver's `script.done` watchdog (default 180s) times out during app startup.
- Device regression builds differ from dev builds because they must embed the CI JS bundle: Android uses `CI_RUN=/data/local/tmp/rn_ci_run.json` with `-PbundleInDebug=true -PreactNativeArchitectures=x86_64`; iOS uses `FORCE_BUNDLING=1 CI_RUN=/tmp/rn_ci_run.json`. Debug builds normally skip bundling and load JS from Metro.
- Single-device API scripts live in `example/ci/` and run locally with `yarn report:api --platform <android|ios> [--script <json>]`; they are not scheduled by GitHub Actions.

## Git Branch Management (Iron Rules)

Branch roles:

| Branch | Role |
|---|---|
| `dev` | Default branch, pointer to the current release line; always kept in sync with the current release line |
| `1.x` | 1 long-term line: integration target for 1.x version branches |
| `5.x` | 5 long-term line: integration target for 5.x version branches |
| `cn-1.x`, `cn-5.x` | Chinese API docs lines, one per long-term line (the legacy single `cn` branch predates this split); evolved independently |
| `1.21.0`, `5.1.0`, etc. | Version branches, created from their long-term line, carrying only that version's API porting and fixes |

Iron rules (one-directional flow, non-negotiable):

1. **Commit only to a working branch; merge forward, never backward**: fixes and changes are committed to the current version branch (or long-term line), verified, then merged in the order version branch → long-term line → `dev`. Never commit code, test, or doc changes directly to `dev`; never cherry-pick backward into an already-merged upstream branch (when a backport is explicitly needed, recommit on the target version branch and merge forward).
2. **1-line flow**: `1.21.0` → `1.x` → `dev`. `dev` follows the 1 line by default; every update to `1.x` is merged into `dev`.
3. **5-line flow**: `5.1.0` → `5.x`. Do not merge `5.x` into `dev` until the 5 line becomes the release line; switch the default branch semantics to the 5 line at that time.
4. **cn lines are independent**: `cn-1.x` / `cn-5.x` carry the Chinese API docs for their line — each is overwritten from its line's English release tag, the existing Chinese comments are restored, and the result is tagged `vX.Y.Z-cn`; merging between the cn lines and `dev`/`1.x`/`5.x` is forbidden.
5. **Test framework and SDK architecture changes land on the long-term lines** (`1.x`/`5.x`); version branches carry only API porting and fixes. A new version branch inherits the latest architecture from its long-term line at creation time. Cross-line architecture porting uses "cover + adapt", not blind cherry-picks.
6. **Tags pair with same-numbered branches, with different roles**: the version branch (`1.21.0`) is the development vehicle; a tag is placed on the release commit only when publishing to npm, named with a `v` prefix (`v1.21.0`, with a `-cn` suffix for Chinese docs tags) to pin the exact published version. Always use full namespaces (`refs/heads/1.21.0` / `refs/tags/v1.21.0`) and push branches as `git push <remote> refs/heads/<branch>`.
7. **Confirm a clean working tree before switching or deleting branches** (`git status` shows no uncommitted changes); if it is not clean, stop and inform the user. **Always create worktrees under `.worktree/` in the repository root** (e.g. `git worktree add .worktree/1.21.0 1.21.0`), not outside the repository.
8. **ci-dispatch.yml exists only on `dev`**: the cross-line dispatcher for the daily device regression (see `.github/workflows/ci-dispatch.yml`). Never copy or merge it to other branches and never delete it. It is the deliberate, documented exception to rule 1 (no direct commits to `dev`) and is maintained directly on `dev` — once it enters another branch's merge flow, that branch's merges would silently overwrite it (git merges always take the source branch's file content), losing the dispatch capability without any visible failure.

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
- Keep the example app (`example/`) functional when making SDK changes. It is an API tester app (Init/Login/Search/ApiCall pages); API entries are registered in `example/src/registry/`. The example app uses bare React Native (no Expo).
- Prefer running `yarn typecheck` and `yarn lint` to validate changes before committing.
- This project uses Yarn 4 (Berry) with PnP disabled (node-modules linker). Do not use `npm`.

## Work Log

- After completing a task, making an important decision, or receiving a correction from the user, append an entry to `dailylog/YYYY-MM-DD.md` using the local date. Create the file if it does not exist.
- Append only; do not modify existing content. Format each entry as: `- HH:MM <what was done or decided>, reason: <...>`.
- The log may record progress and process.
- Work logs under `dailylog/` are tracked by Git and must not be added to `.gitignore`. When performing a user-authorized Git commit, include the current task's log changes in the same commit. Writing a log entry does not by itself authorize or trigger a commit or push.

## Testing Discipline

- TS-side unit tests and the TS↔Native contract tests run on every commit via Lefthook pre-commit.
- Contract tests (`src/__tests__/contract/`) check method-name parity across TS / Java / ObjC, TS-side event wiring (every non-deprecated `MTon*` const must be referenced in `src/` or explicitly allowlisted), and duplicate const values.
- Unit tests (`src/__tests__/unit/`) focus on logic-bearing points: event dispatch (native event → listener fan-out), send-callback routing (`BaseManager`), model decoding, and error mapping — not per-API pass-through coverage.
- Coverage policy: line coverage is a reference metric, not a gate. Most uncovered lines are thin per-API wrappers in the manager classes (`ChatManager`, `ChatGroupManager`, etc.) whose bodies just forward to `Native._callMethod`. Mocking the native layer to assert "the mock was called with these params" only restates the implementation: it cannot see real native behavior, it breaks on every internal refactor, and the bugs it could catch (wrong method const, wrong param shape) are already covered statically by the contract tests. The real bug-prone seams are TS↔native contract drift (contract tests), event decoding/dispatch, and model encode/decode — tests target those. Do not add blanket pass-through tests to raise the coverage number, and do not set a coverage threshold.
- Test code and comments are written in English.
- Native wrapper code in `modules/java/` and `modules/objc/` is **not** covered by automated tests. After modifying any wrapper there, manually exercise the affected feature in `example/` before pushing.
