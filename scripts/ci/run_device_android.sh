#!/usr/bin/env bash
# Auto-mode device driver for Android. Shared by the no-login smoke test and
# the single-account nightly test, both locally and in CI.
#
# Preconditions:
#   - a booted emulator/device reachable via adb;
#   - a debug APK with the API_SCRIPT (and, for the nightly, API_CONFIG)
#     device path inlined at bundle time (the babel plugin in
#     example/babel.config.js), matching DEVICE_SCRIPT_PATH/DEVICE_CONFIG_PATH.
#
# Flow: push the script to the device -> install the APK -> launch the app ->
# poll the on-device log file until `script.done` appears -> pull the log ->
# assert every step matched its expectation.
#
# Tunables (environment variables):
#   ADB                 adb binary                       (default: adb)
#   APK_PATH            path to the debug APK            (default: example build output)
#   SCRIPT_JSON         auto-mode script on the host    (default: example/ci/no_login_smoke.json)
#   DEVICE_SCRIPT_PATH  script path on the device, must match the inlined API_SCRIPT.
#                       /data/local/tmp is used instead of /sdcard: it is always
#                       adb-writable, world-traversable, and has no dependency on
#                       the emulated SD card (a broken FUSE mount makes /sdcard
#                       unusable while /data/local/tmp keeps working).
#                                                        (default: /data/local/tmp/rn_smoke_no_login.json)
#   OUT_DIR             where the pulled log lands       (default: build/reports)
#   OUT_LOG             full path of the pulled log      (default: $OUT_DIR/smoke-android-api_test.log)
#   CONFIG_JSON         optional auto-mode config (API_CONFIG) on the host; pushed to
#                       DEVICE_CONFIG_PATH when set (single-account nightly only)
#   DEVICE_CONFIG_PATH  config path on the device, must match the inlined API_CONFIG
#                                                        (default: /data/local/tmp/rn_single_account_config.json)
#   SCRIPT_TIMEOUT_S    max seconds to wait for script.done (default: 180;
#                       SMOKE_TIMEOUT_S is still accepted for compatibility)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

PACKAGE="chatsdk.example"
ADB="${ADB:-adb}"
APK_PATH="${APK_PATH:-$REPO_ROOT/example/android/app/build/outputs/apk/debug/app-debug.apk}"
SCRIPT_JSON="${SCRIPT_JSON:-$REPO_ROOT/example/ci/no_login_smoke.json}"
DEVICE_SCRIPT_PATH="${DEVICE_SCRIPT_PATH:-/data/local/tmp/rn_smoke_no_login.json}"
OUT_DIR="${OUT_DIR:-$REPO_ROOT/build/reports}"
OUT_LOG="${OUT_LOG:-$OUT_DIR/smoke-android-api_test.log}"
CONFIG_JSON="${CONFIG_JSON:-}"
DEVICE_CONFIG_PATH="${DEVICE_CONFIG_PATH:-/data/local/tmp/rn_single_account_config.json}"
TIMEOUT_S="${SCRIPT_TIMEOUT_S:-${SMOKE_TIMEOUT_S:-180}}"

mkdir -p "$OUT_DIR"

[ -f "$APK_PATH" ] || { echo "error: APK not found: $APK_PATH" >&2; exit 2; }
[ -f "$SCRIPT_JSON" ] || { echo "error: script not found: $SCRIPT_JSON" >&2; exit 2; }
"$ADB" get-state >/dev/null 2>&1 || { echo "error: no adb device ready" >&2; exit 2; }

echo "[1/5] push script -> $DEVICE_SCRIPT_PATH"
"$ADB" push "$SCRIPT_JSON" "$DEVICE_SCRIPT_PATH" >/dev/null
if [ -n "$CONFIG_JSON" ]; then
  [ -f "$CONFIG_JSON" ] || { echo "error: config not found: $CONFIG_JSON" >&2; exit 2; }
  echo "      push config -> $DEVICE_CONFIG_PATH"
  "$ADB" push "$CONFIG_JSON" "$DEVICE_CONFIG_PATH" >/dev/null
fi

echo "[2/5] install $APK_PATH"
"$ADB" install -r "$APK_PATH" >/dev/null

# Drop any stale log from a previous run, then launch the app.
"$ADB" shell am force-stop "$PACKAGE" || true
"$ADB" exec-out run-as "$PACKAGE" rm -f files/api_test.log 2>/dev/null || true

echo "[3/5] launch $PACKAGE"
"$ADB" shell am start -n "$PACKAGE/.MainActivity" >/dev/null

echo "[4/5] wait for script.done (timeout ${TIMEOUT_S}s)"
deadline=$(( $(date +%s) + TIMEOUT_S ))
done_seen=0
while :; do
  if "$ADB" exec-out run-as "$PACKAGE" cat files/api_test.log 2>/dev/null \
    | grep -q '"source":"script.done"'; then
    done_seen=1
    break
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    break
  fi
  sleep 3
done

# Always pull whatever log exists for debugging.
rm -f "$OUT_LOG"
"$ADB" exec-out run-as "$PACKAGE" cat files/api_test.log >"$OUT_LOG" 2>/dev/null || true

if [ "$done_seen" != "1" ]; then
  echo "error: script.done not seen within ${TIMEOUT_S}s; pulled log: $OUT_LOG" >&2
  exit 1
fi

echo "[5/5] assert $OUT_LOG"
node "$REPO_ROOT/scripts/ci/assert_script.js" "$SCRIPT_JSON" "$OUT_LOG"
