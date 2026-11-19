#!/usr/bin/env bash
# Unified local/CI entry point for the CI device regression tests
# (example/src/ci/ harness). Local runs and the GitHub device workflow both
# call this script, so both exercise exactly the same build and run path.
#
# Flow: ONE package build with CI_RUN=<device path> inlined (same
# bundle-inline build settings as auto_script_local.sh, so local == CI) -> loop
# over the five stable entries (logged_out first; RN-APP-001 asserts an
# empty login state, so app data is cleared before it) -> per entry: generate
# a temp ci_run.json (0600, trap-deleted) -> invoke run_ci_android.sh /
# run_ci_ios.sh (push + cold start + wait for script.done + pull log +
# assert via assert_ci_run.js) -> aggregate exit code. A failing entry does
# NOT abort the loop.
#
# Output: one artifacts/ci/<UTC timestamp>/ directory per invocation. The
# run-level runner.log and summary.md live under <platform>/, next to the
# suite directories, so Android and iOS invocations that share CI_RUN_ID do
# not overwrite each other:
#   <platform>/runner.log
#   <platform>/summary.md
#   <platform>/run.json
#   <platform>/report.json
#   <platform>/<suite>/api_test.log
#   <platform>/<suite>/(logcat|simulator).log
#   <platform>/<suite>/summary.md
# Suite names shorten the five entries: base/group/contact/user_info, while
# logged_out keeps its name.
#
# Usage:
#   bash scripts/ci/ci_test_local.sh <android|ios> [entries] [testNameRegex]
#     entries       space/comma-separated subset of: logged_out logged_in_base
#                   logged_in_group logged_in_contact logged_in_user_info
#                   (default: all five, logged_out first). The GitHub device
#                   workflow uses this to split lanes: the logged-out lane
#                   passes "logged_out", the logged-in lane passes the other
#                   four.
#     testNameRegex optional runtime case filter written into ci_run.json
#                   (e.g. '^RN-APP-001$' runs exactly one case)
#
# Credential resolution (never echoed; secrets stay host-side):
#   (a) if the five E2E_* variables are set (E2E_APP_KEY, E2E_USER_ID,
#       E2E_REST_API, E2E_CLIENT_ID, E2E_CLIENT_SECRET — same names as the
#       GitHub `rn-single-account` environment), tokens are fetched fresh via
#       scripts/ci/fetch_e2e_user_token.js;
#   (b) otherwise the git-ignored local dev config example/config.local.json
#       supplies the same five values (restApi/appKey/clientId/clientSecret
#       and accounts[0].id as the user id) and tokens are fetched the same
#       way (user tokens expire in ~24h, so stored tokens are never reused).
#   The contact peer is E2E_PEER_ID when set, else "<userId>_ci_peer"; it is
#   provisioned server-side through the token endpoint (autoCreateUser).
#   A logged_out-only run needs no tokens and triggers no token fetch; it
#   only needs E2E_APP_KEY (init target — a public demo key is fine, so the
#   CI logged-out lane runs with no secrets). Without E2E_APP_KEY it falls
#   back to the appKey of example/config.local.json when that file exists.
#
# Tunables:
#   CI_ENTRY_TIMEOUT_S   per-entry script.done watchdog (default: 600; the
#                        drivers' 180s default covers the logged-out lane only —
#                        logged-in entries do init + login + data sync + REST
#                        round-trips)
#   CI_SKIP_BUILD        when "1", skip the dependency/gen/build phase and
#                        only run the entries; the package must have the same
#                        CI_RUN path inlined. The drivers default to the
#                        normal build output; set APK_PATH / APP_PATH only
#                        when the package lives elsewhere (the CI workflow's
#                        test jobs pass the build job's artifact this way).
#   SKIP_POD_INSTALL     when "1", skip the iOS Pods refresh that normally
#                        runs before every iOS build (local builds default to
#                        refreshing; CI test jobs skip the build step entirely)
#   CI_RUN_ID            optional fixed run id (default: UTC timestamp at start)
#                        (the run directory is artifacts/ci/<CI_RUN_ID>)
#
# Device selection: Android goes through select_android_device.sh (requires
# ANDROID_SERIAL when several devices are online); iOS goes through
# select_ios_simulator.sh (validates/boots DEVICE_UDID, rejects several
# booted simulators when DEVICE_UDID is unset).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLATFORM="${1:-}"
ENTRY_ARG="${2:-}"
REGEX_ARG="${3:-}"
case "$PLATFORM" in
  android|ios) ;;
  *)
    echo "usage: bash scripts/ci/ci_test_local.sh <android|ios> [entries] [testNameRegex]" >&2
    exit 2
    ;;
esac

ALL_ENTRIES=(logged_out logged_in_base logged_in_group logged_in_contact logged_in_user_info)
is_entry() {
  local candidate
  for candidate in "${ALL_ENTRIES[@]}"; do
    [ "$candidate" = "$1" ] && return 0
  done
  return 1
}

if [ -n "$ENTRY_ARG" ]; then
  # Accept a space/comma-separated entry list so CI lanes can pass a subset
  # in a single argument (android-emulator-runner's `script:` input is one
  # line, so the list must survive as one shell word).
  ENTRIES=()
  for entry in ${ENTRY_ARG//,/ }; do
    if ! is_entry "$entry"; then
      echo "error: unknown entry '$entry' (expected a subset of: ${ALL_ENTRIES[*]})" >&2
      exit 2
    fi
    ENTRIES+=("$entry")
  done
  if [ "${#ENTRIES[@]}" -eq 0 ]; then
    echo "error: empty entry list (expected a subset of: ${ALL_ENTRIES[*]})" >&2
    exit 2
  fi
else
  ENTRIES=("${ALL_ENTRIES[@]}")
fi

# Device path of the run file, inlined at bundle time; the drivers push the
# generated ci_run.json there before every cold start (same contract as
# API_SCRIPT for auto mode).
if [ "$PLATFORM" = "android" ]; then
  DEVICE_CI_RUN_PATH="/data/local/tmp/rn_ci_run.json"
else
  DEVICE_CI_RUN_PATH="/tmp/rn_ci_run.json"
fi

CI_ENTRY_TIMEOUT_S="${CI_ENTRY_TIMEOUT_S:-600}"
REPORT_DIR="$REPO_ROOT/artifacts/ci"
RUN_ID="${CI_RUN_ID:-$(date -u +%Y%m%d%H%M%S)}"
RUN_DIR="$REPORT_DIR/$RUN_ID"
PLATFORM_DIR="$RUN_DIR/$PLATFORM"
RUN_STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
CI_RUN_JSON=""
mkdir -p "$PLATFORM_DIR"

# Keep the complete terminal output (including gradle/xcodebuild) next to the
# machine-readable artifacts. It is platform-scoped so a later iOS run with the
# same CI_RUN_ID cannot overwrite the Android runner log.
exec > >(tee "$PLATFORM_DIR/runner.log") 2>&1

# Helper node scripts live in a 0700 temp work dir (heredoc bodies inside
# command substitution confuse the macOS bash 3.2 parser, so they are
# written as files first).
WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/rn_ci_local.XXXXXX")"
chmod 700 "$WORK_DIR"

cat > "$WORK_DIR/write_run_json.js" <<'NODE'
const fs = require('fs');
const path = require('path');
const entries = (process.env.CI_ENTRY_ROWS || '')
  .split('\n')
  .filter(Boolean)
  .map((row) => {
    const [entry, status, suite] = row.split('|');
    return { entry, status, suite, report: `${suite}/summary.md` };
  });
const common = {
  schemaVersion: 1,
  runId: process.env.CI_RUN_ID,
  platform: process.env.CI_PLATFORM,
  result: process.env.CI_RESULT,
  startedAt: process.env.CI_STARTED_AT,
  finishedAt: process.env.CI_FINISHED_AT,
  entries,
};
const run = {
  ...common,
  command: process.env.CI_COMMAND,
  device: process.env.CI_DEVICE,
  gitCommit: process.env.CI_GIT_COMMIT,
  entries: entries.map(({ entry, status, suite }) => ({ entry, status, suite })),
};
const report = {
  ...common,
  counts: {
    pass: entries.filter((row) => row.status === 'PASS').length,
    fail: entries.filter((row) => row.status !== 'PASS').length,
    total: entries.length,
  },
};
const dir = process.env.CI_PLATFORM_DIR;
fs.writeFileSync(path.join(dir, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);
fs.writeFileSync(path.join(dir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
NODE

cleanup() {
  [ -n "$CI_RUN_JSON" ] && rm -f "$CI_RUN_JSON"
  rm -rf "$WORK_DIR"
  if [ "$PLATFORM" = "ios" ]; then
    # The staged iOS copy lives on the host file system and carries tokens.
    rm -f "$DEVICE_CI_RUN_PATH"
  fi
}
trap cleanup EXIT

# Derives the five E2E_* exports (single-quote-escaped) from the git-ignored
# local dev config; values are never printed.
cat > "$WORK_DIR/derive_env.js" <<'NODE'
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const quote = (v) => "'" + String(v).replace(/'/g, "'\\''") + "'";
const out = {
  E2E_APP_KEY: cfg.appKey,
  E2E_REST_API: cfg.restApi,
  E2E_CLIENT_ID: cfg.clientId,
  E2E_CLIENT_SECRET: cfg.clientSecret,
  E2E_USER_ID: cfg.accounts?.[0]?.id,
};
for (const [key, value] of Object.entries(out)) {
  if (typeof value !== 'string' || value.length === 0) {
    console.error('error: example/config.local.json missing a value for ' + key);
    process.exit(1);
  }
  console.log(key + '=' + quote(value));
}
NODE

# Writes one ci_run.json (0600) from environment variables (never argv).
cat > "$WORK_DIR/write_ci_run.js" <<'NODE'
const fs = require('fs');
const entry = process.env.CI_ENTRY;
const config = { appKey: process.env.E2E_APP_KEY };
if (entry !== 'logged_out') {
  config.accounts = [
    { id: process.env.E2E_USER_ID, token: process.env.CI_USER_TOKEN },
  ];
  config.loginToken = process.env.CI_USER_TOKEN;
  config.peerId = process.env.CI_PEER_ID;
  config.restApi = process.env.E2E_REST_API;
  config.appToken = process.env.CI_APP_TOKEN;
}
const run = { entry, config };
if (process.env.CI_REGEX.length > 0) {
  run.testNameRegex = process.env.CI_REGEX;
}
fs.writeFileSync(process.env.CI_OUT, JSON.stringify(run, null, 2) + '\n', {
  mode: 0o600,
});
NODE

cd "$REPO_ROOT"

# --- credentials ------------------------------------------------------------

# Only logged-in entries need tokens; a lone logged_out run skips the fetches.
NEED_TOKENS=0
for entry in "${ENTRIES[@]}"; do
  [ "$entry" != "logged_out" ] && NEED_TOKENS=1
done

LOCAL_CONFIG="$REPO_ROOT/example/config.local.json"

if [ "$NEED_TOKENS" = "1" ]; then
  # Export the five E2E_* values from the local dev config when they are not
  # already in the environment. Values are single-quote-escaped by node; they
  # are never printed.
  if [ -z "${E2E_APP_KEY:-}" ] || [ -z "${E2E_USER_ID:-}" ] || \
     [ -z "${E2E_REST_API:-}" ] || [ -z "${E2E_CLIENT_ID:-}" ] || \
     [ -z "${E2E_CLIENT_SECRET:-}" ]; then
    if [ ! -f "$LOCAL_CONFIG" ]; then
      echo "error: no credentials: set the five E2E_* variables or provide" >&2
      echo "       example/config.local.json (git-ignored local dev config)" >&2
      exit 2
    fi
    echo ">> credentials: deriving E2E_* from example/config.local.json"
    ENV_EXPORTS="$(node "$WORK_DIR/derive_env.js" "$LOCAL_CONFIG")"
    eval "$ENV_EXPORTS"
    export E2E_APP_KEY E2E_USER_ID E2E_REST_API E2E_CLIENT_ID E2E_CLIENT_SECRET
  fi
elif [ -z "${E2E_APP_KEY:-}" ]; then
  # logged_out only: init still needs an appKey, but no account is used, so
  # any valid key works — the CI logged-out lane passes a public demo key and
  # runs with no secrets. Locally the dev config supplies it when present.
  if [ -f "$LOCAL_CONFIG" ]; then
    echo ">> credentials: deriving E2E_APP_KEY from example/config.local.json"
    E2E_APP_KEY="$(node -e 'const c=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(typeof c.appKey==="string"?c.appKey:"")' "$LOCAL_CONFIG")"
    export E2E_APP_KEY
  fi
  if [ -z "${E2E_APP_KEY:-}" ]; then
    echo "error: the logged_out entry needs E2E_APP_KEY (the init target — a" >&2
    echo "       public demo key is fine) or example/config.local.json" >&2
    exit 2
  fi
fi

APP_TOKEN=""
USER_TOKEN=""
PEER_ID=""
if [ "$NEED_TOKENS" = "1" ]; then
  echo ">> credentials: fetching fresh app/user tokens (host-side only)"
  APP_TOKEN="$(node scripts/ci/fetch_e2e_user_token.js --app)"
  USER_TOKEN="$(node scripts/ci/fetch_e2e_user_token.js)"
  PEER_ID="${E2E_PEER_ID:-${E2E_USER_ID}_ci_peer}"
  # Provision the contact peer server-side (autoCreateUser on the token
  # endpoint); the returned peer token is not needed and discarded.
  node scripts/ci/fetch_e2e_user_token.js --user-id "$PEER_ID" >/dev/null
fi

# --- device selection --------------------------------------------------------
# Resolve once before building or clearing app data. This makes every later
# adb/simctl command explicit, including the CI_SKIP_BUILD path where no build
# step would otherwise have selected a device.

if [ "$PLATFORM" = "android" ]; then
  ANDROID_SERIAL="$(bash scripts/ci/select_android_device.sh)"
  export ANDROID_SERIAL
else
  DEVICE_UDID="$(bash scripts/ci/select_ios_simulator.sh)"
  export DEVICE_UDID
fi

# --- one build for all entries ----------------------------------------------

# CI test jobs set CI_SKIP_BUILD=1 and point the drivers at the build job's
# artifact (APK_PATH / APP_PATH), so the platform is built exactly once per
# workflow run even though two lanes execute entries.
if [ "${CI_SKIP_BUILD:-0}" != "1" ]; then

[ -d node_modules ] || yarn install
yarn gen:version_file && yarn gen:cmake_file && yarn gen:env_file

# CI_RUN reaches the bundler via an environment variable, which neither
# gradle's up-to-date checks nor metro's transform cache track (their keys
# are file contents + transformer options only). Without this clear, a
# previous auto-mode/CI-mode build's inlined paths would be reused silently.
rm -rf "${TMPDIR:-/tmp}/metro-cache"

# CI mode and auto mode are mutually exclusive (ci_mode.ts fails fast when
# both are inlined); make sure no API_SCRIPT/API_CONFIG leaks into the build.
if [ "$PLATFORM" = "android" ]; then
  # Build for the ABI of the attached device (arm64 on Apple Silicon,
  # x86_64 on CI), not a hardcoded one.
  ABI="$(adb shell getprop ro.product.cpu.abi | tr -d '\r')"
  echo ">> build CI test APK (ABI=$ABI, bundle embedded, CI_RUN inlined)"
  (
    cd example/android
    env -u API_SCRIPT -u API_CONFIG CI_RUN="$DEVICE_CI_RUN_PATH" \
      ./gradlew app:cleanCreateBundleDebugJsAndAssets app:assembleDebug \
      --no-daemon --console=plain \
      "-PreactNativeArchitectures=$ABI" -PbundleInDebug=true
  )
else
  if [ "${SKIP_POD_INSTALL:-0}" != "1" ]; then
    echo ">> refresh CocoaPods dependencies (SKIP_POD_INSTALL=1 to skip)"
    (
      cd example
      bundle check >/dev/null 2>&1 || {
        bundle config set --local path vendor/bundle
        bundle install
      }
      bundle exec pod install --project-directory=ios
    )
  fi
  echo ">> build CI test app (bundle embedded, CI_RUN inlined)"
  (
    cd example
    env -u API_SCRIPT -u API_CONFIG \
      xcodebuild -workspace ios/ChatSdkExample.xcworkspace \
      -scheme ChatSdkExample \
      -configuration Debug \
      -sdk iphonesimulator \
      -derivedDataPath ios/build \
      FORCE_BUNDLING=1 \
      CI_RUN="$DEVICE_CI_RUN_PATH" \
      build
  )
fi

else
  echo ">> CI_SKIP_BUILD=1: reusing the prebuilt package (APK_PATH/APP_PATH)"
fi

# --- per-entry loop -----------------------------------------------------------

# RN-APP-001 asserts an empty login state; a persisted last-login user from
# an earlier install breaks it, so the logged_out entry starts from a clean
# slate (fresh app data, exactly like a clean install).
clear_app_data() {
  if [ "$PLATFORM" = "android" ]; then
    adb shell pm clear chatsdk.example >/dev/null 2>&1 || true
  else
    xcrun simctl terminate "${DEVICE_UDID:-booted}" chatsdk.example >/dev/null 2>&1 || true
    xcrun simctl uninstall "${DEVICE_UDID:-booted}" chatsdk.example >/dev/null 2>&1 || true
  fi
}

# Write the per-entry run file (0600). Credential values arrive via the
# environment (never argv, never echoed).
write_ci_run_json() {
  local entry="$1" out="$2"
  CI_ENTRY="$entry" CI_REGEX="$REGEX_ARG" CI_OUT="$out" \
  CI_APP_TOKEN="$APP_TOKEN" CI_USER_TOKEN="$USER_TOKEN" CI_PEER_ID="$PEER_ID" \
    node "$WORK_DIR/write_ci_run.js"
  chmod 600 "$out"
}

entry_dir_name() {
  case "$1" in
    logged_in_base) echo base ;;
    logged_in_group) echo group ;;
    logged_in_contact) echo contact ;;
    logged_in_user_info) echo user_info ;;
    *) echo "$1" ;;
  esac
}

run_entry() {
  local entry="$1"
  local entry_dir="$RUN_DIR/$PLATFORM/$(entry_dir_name "$entry")"
  mkdir -p "$entry_dir"
  # macOS mktemp only substitutes X's at the END of the template.
  CI_RUN_JSON="$(mktemp "${TMPDIR:-/tmp}/rn_ci_run.XXXXXX")"
  chmod 600 "$CI_RUN_JSON"
  # The run file must exist and be non-empty before anything is pushed;
  # run_entry is called from an `if` condition, which disables errexit in
  # the function body, so check explicitly.
  write_ci_run_json "$entry" "$CI_RUN_JSON" || return 1
  [ -s "$CI_RUN_JSON" ] || {
    echo "error: ci_run.json was not written for entry $entry" >&2
    return 1
  }

  if [ "$entry" = "logged_out" ]; then
    echo ">> clearing app data before logged_out (clean-install precondition)"
    clear_app_data
  fi

  local rc=0
  if [ "$PLATFORM" = "android" ]; then
    env \
      CI_PLATFORM=android \
      SCRIPT_JSON="$CI_RUN_JSON" \
      DEVICE_SCRIPT_PATH="$DEVICE_CI_RUN_PATH" \
      DEVICE_CLEANUP_PATHS="$DEVICE_CI_RUN_PATH" \
      OUT_DIR="$entry_dir" \
      OUT_LOG="$entry_dir/api_test.log" \
      CI_ENTRY_DIR="$entry_dir" \
      CI_REPORT_DIR="$entry_dir" \
      ASSERT_SCRIPT="$REPO_ROOT/scripts/ci/assert_ci_run.js" \
      SCRIPT_TIMEOUT_S="$CI_ENTRY_TIMEOUT_S" \
      bash scripts/ci/run_ci_android.sh || rc=$?
  else
    env \
      CI_PLATFORM=ios \
      SCRIPT_JSON="$CI_RUN_JSON" \
      HOST_SCRIPT_PATH="$DEVICE_CI_RUN_PATH" \
      OUT_DIR="$entry_dir" \
      OUT_LOG="$entry_dir/api_test.log" \
      CI_ENTRY_DIR="$entry_dir" \
      CI_REPORT_DIR="$entry_dir" \
      ASSERT_SCRIPT="$REPO_ROOT/scripts/ci/assert_ci_run.js" \
      SCRIPT_TIMEOUT_S="$CI_ENTRY_TIMEOUT_S" \
      bash scripts/ci/run_ci_ios.sh || rc=$?
    rm -f "$DEVICE_CI_RUN_PATH"
  fi

  rm -f "$CI_RUN_JSON"
  CI_RUN_JSON=""
  return "$rc"
}

echo ">> running ${#ENTRIES[@]} entr$( [ ${#ENTRIES[@]} -eq 1 ] && echo y || echo ies ): ${ENTRIES[*]}"
FAILED_ENTRIES=()
for entry in "${ENTRIES[@]}"; do
  echo ""
  echo "================ entry: $entry ================"
  if run_entry "$entry"; then
    echo ">> entry $entry: PASS"
  else
    echo ">> entry $entry: FAIL" >&2
    FAILED_ENTRIES+=("$entry")
  fi
done

echo ""
echo "================ summary ($PLATFORM) ================"
for entry in "${ENTRIES[@]}"; do
  if printf '%s\n' "${FAILED_ENTRIES[@]:-}" | grep -qx "$entry"; then
    echo "  FAIL  $entry"
  else
    echo "  PASS  $entry"
  fi
done

# Run-level index. Per-entry summaries stay next to their logs; this file
# points at them and records the command/device used for this invocation.
write_run_summary() {
  local result="PASS"
  local device=""
  local command="bash scripts/ci/ci_test_local.sh $PLATFORM"
  local entry status
  [ "${#FAILED_ENTRIES[@]}" -gt 0 ] && result="FAIL"
  if [ "$PLATFORM" = "android" ]; then
    device="$ANDROID_SERIAL"
  else
    device="$DEVICE_UDID"
  fi
  [ -n "${ENTRY_ARG:-}" ] && command="$command $ENTRY_ARG"
  [ -n "${REGEX_ARG:-}" ] && command="$command '$REGEX_ARG'"

  {
    printf '# CI device regression run %s (%s)\n\n' "$RUN_ID" "$PLATFORM"
    printf -- '- Result: **%s**\n' "$result"
    printf -- '- Platform: `%s`\n' "$PLATFORM"
    printf -- '- Device: `%s`\n' "$device"
    printf -- '- Command: `%s`\n' "$command"
    printf -- '- Git commit: `%s`\n' "$(git rev-parse --short HEAD 2>/dev/null || true)"
    printf '\n| Entry | Result | Report |\n| --- | --- | --- |\n'
    for entry in "${ENTRIES[@]}"; do
      if printf '%s\n' "${FAILED_ENTRIES[@]:-}" | grep -qx "$entry"; then
        status="FAIL"
      else
        status="PASS"
      fi
      printf '| `%s` | %s | `%s/summary.md` |\n' \
        "$entry" "$status" "$(entry_dir_name "$entry")"
    done
    printf '\n## Artifacts\n\n'
    printf -- '- Per-suite app log: `<suite>/api_test.log`\n'
    printf -- '- Per-suite native log: `<suite>/%s`\n' \
      "$( [ "$PLATFORM" = "android" ] && echo logcat.log || echo simulator.log )"
    printf -- '- Per-suite report: `<suite>/summary.md`\n'
    printf -- '- Full terminal output: `runner.log`\n'
  } > "$PLATFORM_DIR/summary.md"
}

ENTRY_ROWS=""
for entry in "${ENTRIES[@]}"; do
  if printf '%s\n' "${FAILED_ENTRIES[@]:-}" | grep -qx "$entry"; then
    status="FAIL"
  else
    status="PASS"
  fi
  ENTRY_ROWS="${ENTRY_ROWS}${entry}|${status}|$(entry_dir_name "$entry")"$'\n'
done
export CI_RUN_ID CI_PLATFORM="$PLATFORM" CI_STARTED_AT="$RUN_STARTED_AT" \
  CI_FINISHED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)" CI_PLATFORM_DIR="$PLATFORM_DIR" \
  CI_ENTRY_ROWS="$ENTRY_ROWS"
CI_COMMAND="bash scripts/ci/ci_test_local.sh $PLATFORM"
[ -n "${ENTRY_ARG:-}" ] && CI_COMMAND="$CI_COMMAND $ENTRY_ARG"
[ -n "${REGEX_ARG:-}" ] && CI_COMMAND="$CI_COMMAND '$REGEX_ARG'"
export CI_COMMAND
export CI_DEVICE="$([ "$PLATFORM" = "android" ] && echo "$ANDROID_SERIAL" || echo "$DEVICE_UDID")"
export CI_GIT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || true)"
CI_RESULT="PASS"; [ "${#FAILED_ENTRIES[@]}" -gt 0 ] && CI_RESULT="FAIL"
export CI_RESULT
node "$WORK_DIR/write_run_json.js"

write_run_summary
echo "reports: $PLATFORM_DIR"

if [ "${#FAILED_ENTRIES[@]}" -gt 0 ]; then
  echo "error: ${#FAILED_ENTRIES[@]} entry run(s) failed: ${FAILED_ENTRIES[*]}" >&2
  exit 1
fi
echo ">> all entries passed"
