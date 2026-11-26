#!/usr/bin/env bash
# CI wrapper around run_device_android.sh, called from the android-emulator-runner
# `script:` input of the ci-device workflow (via ci_test_local.sh, which
# invokes it once per entry).
# That action does not pass multi-line scripts to the shell reliably (observed:
# only the first line reached `sh -c`, which broke `\` continuations and
# `|| { }` blocks), so the workflows invoke this one-liner instead of inlining
# the logic. All configuration arrives via environment variables, which the
# action passes through unchanged.
#
# Tunables (in addition to run_device_android.sh's own):
#   CI_ENTRY_DIR         artifact directory for this entry; the full logcat is
#                        written to $CI_ENTRY_DIR/logcat.log
#   LOGCAT_LOG           explicit logcat path (default: $CI_ENTRY_DIR/logcat.log,
#                        falling back to artifacts/regression when CI_ENTRY_DIR is
#                        unset)
#   DEVICE_CLEANUP_PATHS space-separated device paths to delete after the run
#                        (ci_test_local.sh: the on-device ci_run.json holds
#                        credentials and must be removed inside the emulator
#                        session, as must the logcat dump)

# No `set -e`: cleanup and the logcat dump must run even when the driver fails.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENTRY_DIR="${CI_ENTRY_DIR:-}"
if [ -z "$ENTRY_DIR" ] && [ -n "${OUT_LOG:-}" ]; then
  ENTRY_DIR="$(dirname "$OUT_LOG")"
fi
ENTRY_DIR="${ENTRY_DIR:-$REPO_ROOT/artifacts/regression}"
LOGCAT_LOG="${LOGCAT_LOG:-$ENTRY_DIR/logcat.log}"
mkdir -p "$(dirname "$LOGCAT_LOG")"

ANDROID_SERIAL="$(bash "$REPO_ROOT/testing/share/select_android_device.sh")" || exit $?
export ANDROID_SERIAL

LOGCAT_PID=""
stop_logcat() {
  if [ -n "$LOGCAT_PID" ]; then
    kill "$LOGCAT_PID" 2>/dev/null || true
    wait "$LOGCAT_PID" 2>/dev/null || true
    LOGCAT_PID=""
  fi
}
# Capture the full device log for the whole entry, including install/launch.
# The app's structured api_test.log is pulled separately by the driver.
adb logcat -c >/dev/null 2>&1 || true
adb logcat -v threadtime > "$LOGCAT_LOG" 2>&1 &
LOGCAT_PID=$!

# Live-render the [APITEST] records from the growing logcat (✅/❌ per case).
# Pure view layer: assert_ci_run.js stays the only judge. The renderer exits
# by itself on script.done; the EXIT trap covers early driver exits.
node "$REPO_ROOT/testing/regression/render_ci_log.js" "$LOGCAT_LOG" &
RENDERER_PID=$!
stop_renderer() {
  if [ -n "$RENDERER_PID" ]; then
    kill "$RENDERER_PID" 2>/dev/null || true
    wait "$RENDERER_PID" 2>/dev/null || true
    RENDERER_PID=""
  fi
}
trap 'stop_renderer; stop_logcat' EXIT

rc=0
bash "$REPO_ROOT/testing/share/run_device_android.sh" || rc=$?

if [ -n "${DEVICE_CLEANUP_PATHS:-}" ]; then
  read -r -a cleanup_paths <<< "$DEVICE_CLEANUP_PATHS"
  adb shell rm -f "${cleanup_paths[@]}" || true
fi

stop_logcat
exit "$rc"
