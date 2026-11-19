# CI Device Regression Tests — Case-Writing Guide

This guide is for anyone adding cases to the CI device regression layer
(`example/src/ci/`). It is normative: the static gate
(`scripts/ci/check_case_mapping.js`, wired into `scripts/ci/run_quality.sh`)
and the run assertion (`scripts/ci/assert_ci_run.js`) both enforce parts of
it, and the rest is enforced by review.

Other device-test layers (single-device API scripts and multi-device
orchestration) are compared in
[`docs/testing/README.md`](../testing/README.md).

## Architecture in one paragraph

The example app carries a minimal in-app test runner (`harness.ts`) that is
mounted next to auto mode in `App.tsx`. When the bundle has `CI_RUN` inlined
(a device path, e.g. `/data/local/tmp/rn_ci_run.json`), the app starts in CI
mode, reads the `ci_run.json` the driver pushed to that path (entry name,
optional `testNameRegex`, credentials), registers the selected entry's cases,
runs them serially against the real native SDK on a real device/emulator, and
emits structured `[APITEST]` log records ending in `script.done`.
`scripts/ci/ci_test_local.sh` orchestrates one build plus a cold start per
entry; `scripts/ci/assert_ci_run.js` judges the pulled log against
`docs/ci/native-case-mapping.json`. The full design and its rationale are in
`docs/superpowers/specs/2026-11-18-ci-device-test-architecture-design.md`
(§5.5 is the source of the governance rules below).

## The five fixed entries

Entries are fixed preconditions. Each runs as its own cold start (changing
init requires an app restart, so entries share no state) with an explicit
init configuration — SDK defaults are never relied upon. All entries set
`autoLoadConversations: true` and `enableChatroomConversation: false`;
they differ in `dataSyncType` and `enableUserInfo`:

| Entry                 | `dataSyncType`                  | `enableUserInfo` | Scope                                                         |
| --------------------- | ------------------------------- | ---------------- | ------------------------------------------------------------- |
| `logged_out`          | `Conversations`                 | `false`          | init, no-login negatives (no account needed)                  |
| `logged_in_base`      | `Conversations`                 | `false`          | auth, messages, conversations, chat rooms, presence, local DB |
| `logged_in_group`     | `Conversations \| JoinedGroups` | `false`          | group APIs                                                    |
| `logged_in_contact`   | `Conversations \| Contacts`     | `false`          | contact APIs                                                  |
| `logged_in_user_info` | `Conversations`                 | `true`           | user-info APIs                                                |

**Entry files must not be modified to add cases.** Do not add, rename, or
remove entries, change the shared init configuration, or touch the
workflow/runner to make a case fit (governance rule, spec §5.5). If a case
genuinely needs an init configuration no entry provides (e.g.
`autoLoadConversations: false`), record the conflict and get it confirmed
before doing anything — do not extend an entry on your own. The login
classification describes a precondition, not a restriction: a case may log
out and back in (see `RN-CONTACT-001`, which re-logs in to refresh the
contact sync).

## Where new cases go

Cases live in `example/src/ci/modules/<module>_cases.ts` as registrations
inside the module's registrar functions:

- `register*Cases(ctx)` — logged-in cases, wired into exactly one
  `logged_in_*` entry.
- `register*LoggedOutCases(ctx)` — no-login negative cases, wired into the
  `logged_out` entry.

Registrars only collect `ciTest` registrations when the entry module loads;
nothing executes at registration time. A registrar must be wired into exactly
one entry — the static check flags a registrar imported by zero or more than
one entry as a violation. Module-internal helpers shared by several cases of
one module (e.g. a `sendAndAwait` for the message module) live inside the
module file; only cross-module helpers are promoted to `support/`.

A minimal case:

```ts
ciTest(
  'RN-PRESENCE-002',
  'publishPresence while logged out throws 201',
  async () => {
    await expectCiError(
      () => ctx.client.presenceManager.publishPresence('away'),
      201
    );
  }
);
```

Available context (`CiCaseContext`): `ctx.client` (the `ChatClient`
singleton), `ctx.config` (the `ci_run.json` config: `appKey`, `accounts`,
`loginToken`, `peerId`, `restApi`, `appToken`), `ctx.rest` (the
`CiRestFixture`). Harness/support API:

- `ciTest(caseId, description, body)` — default per-case timeout 2 minutes;
  a timeout is a failure. Cases run strictly serially.
- `addTearDown(fn)` — case-level cleanup; runs after the body whether it
  passed or failed, and all tearDowns run even when one fails. A tearDown
  failure is recorded as a cleanup failure and fails the case.
- `expectCiError(op, code)` — the only way to assert a negative contract:
  the operation must reject with `ChatError.code === code` exactly.
- `waitForCi(description, read, matches, timeout?)` — 200ms polling, 30s
  default; the timeout error includes the last observed value.
- `loginForCi(client, userId, token)` — login that waits for the data-sync
  bitmask of the entry's `dataSyncType` and `isConnected` (45s budget).
- `uniqueCiName(module, label)` (`support/unique.ts`) — unique resource
  names `ci_<module>_<ts>_<seq>_<label>` so repeated runs never collide.
- `CiRestFixture` — REST-side preparation/verification/restoration
  (independent of the SDK under test): contact snapshot/set/verify/restore,
  blocklist, create/delete group and chat room, `verifyGroupAbsent` /
  `verifyChatRoomAbsent` (404 proves cleanup), sending an offline peer text.

## Case IDs and the mapping

- ID format: `RN-<PREFIX>-<seq>`, e.g. `RN-GROUP-001`. Prefixes per module
  file: `app` → `APP`, `auth` → `AUTH`, `conversation` → `CONV`,
  `message` → `MSG`, `group` → `GROUP`, `contact` → `CONTACT`,
  `presence` → `PRESENCE`, `room` → `ROOM`, `user_info` → `USERINFO`.
- Sequence numbers start at 001 per module prefix, run across entries within
  the module (a module's logged-in and logged-out cases share one sequence),
  and are never reused after a case is removed.
- Every case must be registered in `docs/ci/native-case-mapping.json` with
  `caseId`, `entry`, `module`, `platforms` (subset of `android`/`ios`), and
  `nativeRef` (the native-side case or behavior it corresponds to).
- `node scripts/ci/check_case_mapping.js` enforces code↔mapping consistency
  in both directions (every registered id in the mapping, every mapping id in
  the code, entry/module attribution, no duplicates) and runs as part of
  `bash scripts/ci/run_quality.sh` — run it before pushing. At run time,
  `assert_ci_run.js` fails the run when a mapping-registered case for the
  current platform is missing from the output or when an unregistered `RN-*`
  id shows up.

## Cleanup discipline

Each case prepares, executes, asserts, and cleans up independently — the
server state after a case must equal the state before it.

- Register `addTearDown` for everything the case creates or modifies, at the
  point of creation. TearDowns are fail-safe: they all run even when the body
  or an earlier tearDown failed.
- For state you did not create but must change (contact lists, blocklist),
  snapshot first and restore after: `ctx.rest.snapshotContacts(...)` /
  `ctx.rest.restoreContacts(...)`.
- For resources you create (groups, chat rooms), delete them in tearDown and
  prove the deletion with `verifyGroupAbsent` / `verifyChatRoomAbsent` — only
  a 404 counts as cleaned up.
- Never delete or overwrite account history data that predates the run.
- REST arranges preconditions and proves cleanup; it never replaces SDK
  assertions.

## Forbidden

- **No fixed sleeps.** Listeners must be registered before the action that
  triggers them; wait for outcomes with `waitForCi` (with a timeout) — never
  prove success by `setTimeout` or by an event that may have fired earlier.
- **No order dependence between cases.** Cases run serially, but each must
  pass on its own and leave no state the next case could accidentally rely on.
- **No entry edits** (see above), and no new entries or init-mask changes.
- **No credentials in code or logs.** Credentials only ever arrive through
  `ci_run.json`; never hardcode app keys/tokens/user ids (except the public
  demo key used by the no-secret logged-out lane) and never log them. Reports
  are sanitized before being written, but do not rely on that.
- **No weakened assertions.** Do not relax a correct assertion to route
  around an SDK defect; keep the failure and its evidence instead.

## Running your new case locally

```sh
# One entry, one case (testNameRegex is a runtime filter; quote it):
bash scripts/ci/ci_test_local.sh android logged_in_contact '^RN-CONTACT-001$'

# All five entries, both platforms need a booted emulator/simulator:
bash scripts/ci/ci_test_local.sh android
bash scripts/ci/ci_test_local.sh ios
```

Credentials: logged-in entries need the five `E2E_*` variables
(`E2E_APP_KEY`, `E2E_USER_ID`, `E2E_REST_API`, `E2E_CLIENT_ID`,
`E2E_CLIENT_SECRET`) in the environment, or the git-ignored
`example/config.local.json` with the same values
(`appKey`/`restApi`/`clientId`/`clientSecret`/`accounts[0].id`); fresh
app/user tokens are fetched host-side on every run. A `logged_out`-only run
needs just `E2E_APP_KEY` (any valid key; a public demo key works). Make sure
your `testNameRegex` actually matches at least one case — a run with
`total: 0` is judged a failure, not a skip.

## Reading results

- The script prints a per-entry PASS/FAIL summary and exits non-zero if any
  entry failed (a failing entry does not abort the remaining ones).
- Each invocation writes one timestamped run directory:
  `artifacts/ci/<UTC timestamp>/`. The run summary and console log are
  scoped to the platform: `<platform>/summary.md`, `<platform>/report.json`, `<platform>/run.json` and `<platform>/runner.log`.
- Per-entry artifacts live under `<platform>/<suite>/`: `api_test.log` (the app's
  structured log), `logcat.log` on Android or `simulator.log` on iOS (the raw
  native log), and `summary.md` (each case classified as
  pass/fail/blocked/missing/unregistered). `blocked` means the case never ran
  because preparation or infrastructure failed (e.g. `beforeAll` failed) and
  counts as failure; `missing` means the mapping expected a result the run
  never produced.
- Everything under `artifacts/` is Git-ignored. The assertion reports are
  sanitized; `api_test.log`, `logcat.log`, and `simulator.log` are raw logs, so
  review them before sharing.
