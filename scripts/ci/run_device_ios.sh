#!/usr/bin/env bash
# Auto-mode device driver for iOS. Shared by the no-login smoke test and the
# single-account nightly test, both locally and in CI.
#
# Preconditions:
#   - a booted simulator (or DEVICE_UDID pointing at one);
#   - a Debug-iphonesimulator .app with the API_SCRIPT (and, for the nightly,
#     API_CONFIG) host path inlined at bundle time (the babel plugin in
#     example/babel.config.js), matching HOST_SCRIPT_PATH/HOST_CONFIG_PATH.
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
#   SCRIPT_JSON        auto-mode script on the host     (default: example/ci/no_login_smoke.json)
#   HOST_SCRIPT_PATH   where the app reads the script, must match the inlined API_SCRIPT
#                                                       (default: /tmp/rn_smoke_no_login.json)
#   OUT_DIR            where the copied log lands      (default: build/reports)
#   OUT_LOG            full path of the copied log      (default: $OUT_DIR/smoke-ios-api_test.log)
#   CONFIG_JSON        optional auto-mode config (API_CONFIG) on the host; copied to
#                      HOST_CONFIG_PATH when set (single-account nightly only)
#   HOST_CONFIG_PATH   where the app reads the config, must match the inlined API_CONFIG
#                                                       (default: /tmp/rn_single_account_config.json)
#   SCRIPT_TIMEOUT_S   max seconds to wait for script.done (default: 180;
#                      SMOKE_TIMEOUT_S is still accepted for compatibility)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

BUNDLE_ID="chatsdk.example"
DEVICE_UDID="${DEVICE_UDID:-booted}"
APP_PATH="${APP_PATH:-$REPO_ROOT/example/ios/build/Build/Products/Debug-iphonesimulator/ChatSdkExample.app}"
SCRIPT_JSON="${SCRIPT_JSON:-$REPO_ROOT/example/ci/no_login_smoke.json}"
HOST_SCRIPT_PATH="${HOST_SCRIPT_PATH:-/tmp/rn_smoke_no_login.json}"
OUT_DIR="${OUT_DIR:-$REPO_ROOT/build/reports}"
OUT_LOG="${OUT_LOG:-$OUT_DIR/smoke-ios-api_test.log}"
CONFIG_JSON="${CONFIG_JSON:-}"
HOST_CONFIG_PATH="${HOST_CONFIG_PATH:-/tmp/rn_single_account_config.json}"
TIMEOUT_S="${SCRIPT_TIMEOUT_S:-${SMOKE_TIMEOUT_S:-180}}"

mkdir -p "$OUT_DIR"

[ -d "$APP_PATH" ] || { echo "error: .app not found: $APP_PATH" >&2; exit 2; }
[ -f "$SCRIPT_JSON" ] || { echo "error: script not found: $SCRIPT_JSON" >&2; exit 2; }

echo "[1/5] stage script -> $HOST_SCRIPT_PATH"
cp "$SCRIPT_JSON" "$HOST_SCRIPT_PATH"
if [ -n "$CONFIG_JSON" ]; then
  [ -f "$CONFIG_JSON" ] || { echo "error: config not found: $CONFIG_JSON" >&2; exit 2; }
  echo "      stage config -> $HOST_CONFIG_PATH"
  cp "$CONFIG_JSON" "$HOST_CONFIG_PATH"
fi

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
node "$REPO_ROOT/scripts/ci/assert_script.js" "$SCRIPT_JSON" "$OUT_LOG"
