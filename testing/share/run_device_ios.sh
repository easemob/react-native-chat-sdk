#!/usr/bin/env bash
# Auto-mode device driver for iOS. Shared by the porting runner
# (yarn report:api -> auto_script_local.sh) and by ci_test_local.sh (which drives
# the example app's CI mode through run_ci_ios.sh), locally and in CI.
#
# Preconditions:
#   - a booted simulator (or DEVICE_UDID pointing at one);
#   - a Debug-iphonesimulator .app with the API_SCRIPT (auto mode) or CI_RUN
#     (CI mode) host path inlined at bundle time (the babel plugin in
#     example/babel.config.js), matching HOST_SCRIPT_PATH.
#     The simulator shares the host file system, so the inlined path is a
#     host path.
#
# Flow: copy the script to the host path the app will read -> install the .app
# -> launch -> poll Documents/api_test.log in the app container until
# `script.done` appears -> copy the log out -> assert every step matched its
# expectation.
#
# Tunables (environment variables):
#   DEVICE_UDID        target simulator                (default: booted)
#   APP_PATH           path to the built .app          (default: example build output)
#   SCRIPT_JSON        auto-mode script on the host     (default: testing/single/cases/port_5_0_0_positive.json)
#   HOST_SCRIPT_PATH   where the app reads the script, must match the inlined API_SCRIPT
#                                                       (default: /tmp/rn_auto_script.json)
#   OUT_DIR            where the copied log lands      (default: artifacts/single)
#   OUT_LOG            full path of the copied log      (default: $OUT_DIR/auto-ios-api_test.log)
#   SCRIPT_TIMEOUT_S   max seconds to wait for script.done (default: 180)
#   ASSERT_SCRIPT      assertion script invoked as `node $ASSERT_SCRIPT
#                      "$SCRIPT_JSON" "$OUT_LOG"`      (default: assert_script.js;
#                      the CI harness runners pass assert_ci_run.js)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

BUNDLE_ID="chatsdk.example"
DEVICE_UDID="${DEVICE_UDID:-booted}"
APP_PATH="${APP_PATH:-$REPO_ROOT/example/ios/build/Build/Products/Debug-iphonesimulator/ChatSdkExample.app}"
SCRIPT_JSON="${SCRIPT_JSON:-$REPO_ROOT/testing/single/cases/port_5_0_0_positive.json}"
HOST_SCRIPT_PATH="${HOST_SCRIPT_PATH:-/tmp/rn_auto_script.json}"
OUT_DIR="${OUT_DIR:-$REPO_ROOT/artifacts/single}"
OUT_LOG="${OUT_LOG:-$OUT_DIR/auto-ios-api_test.log}"
TIMEOUT_S="${SCRIPT_TIMEOUT_S:-180}"

mkdir -p "$OUT_DIR"

[ -d "$APP_PATH" ] || { echo "error: .app not found: $APP_PATH" >&2; exit 2; }
[ -f "$SCRIPT_JSON" ] || { echo "error: script not found: $SCRIPT_JSON" >&2; exit 2; }

echo "[1/5] stage script -> $HOST_SCRIPT_PATH"
cp "$SCRIPT_JSON" "$HOST_SCRIPT_PATH"

echo "[2/5] install $APP_PATH"
xcrun simctl install "$DEVICE_UDID" "$APP_PATH"

# Drop any stale log from a previous run, then launch the app.
xcrun simctl terminate "$DEVICE_UDID" "$BUNDLE_ID" 2>/dev/null || true
CONTAINER="$(xcrun simctl get_app_container "$DEVICE_UDID" "$BUNDLE_ID" data)"
DEVICE_LOG="$CONTAINER/Documents/api_test.log"
rm -f "$DEVICE_LOG"

echo "[3/5] launch $BUNDLE_ID"
xcrun simctl launch "$DEVICE_UDID" "$BUNDLE_ID" >/dev/null

echo "[4/5] wait for script.done (timeout ${TIMEOUT_S}s)"
deadline=$(( $(date +%s) + TIMEOUT_S ))
done_seen=0
while :; do
  if [ -f "$DEVICE_LOG" ] && grep -q '"source":"script.done"' "$DEVICE_LOG"; then
    done_seen=1
    break
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    break
  fi
  sleep 3
done

# Always copy whatever log exists for debugging.
rm -f "$OUT_LOG"
[ -f "$DEVICE_LOG" ] && cp "$DEVICE_LOG" "$OUT_LOG" || true

if [ "$done_seen" != "1" ]; then
  echo "error: script.done not seen within ${TIMEOUT_S}s; copied log: $OUT_LOG" >&2
  exit 1
fi

echo "[5/5] assert $OUT_LOG"
node "${ASSERT_SCRIPT:-$REPO_ROOT/testing/single/assert_script.js}" \
  "$SCRIPT_JSON" "$OUT_LOG"
