#!/usr/bin/env bash
# CI wrapper around run_device_ios.sh, called from the iOS test jobs of the
# ci-device workflow (via ci_test_local.sh, which invokes it once per entry).
# Resolves a booted simulator through select_ios_simulator.sh (validates and,
# when needed, boots DEVICE_UDID; refuses to guess when several are booted),
# captures the simulator's app log, and hands off to the driver. Symmetric
# counterpart of run_ci_android.sh.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENTRY_DIR="${CI_ENTRY_DIR:-}"
if [ -z "$ENTRY_DIR" ] && [ -n "${OUT_LOG:-}" ]; then
  ENTRY_DIR="$(dirname "$OUT_LOG")"
fi
ENTRY_DIR="${ENTRY_DIR:-$REPO_ROOT/artifacts/regression}"
SIM_LOG="${SIM_LOG:-$ENTRY_DIR/simulator.log}"
mkdir -p "$(dirname "$SIM_LOG")"

DEVICE_UDID="$(bash "$REPO_ROOT/testing/share/select_ios_simulator.sh")"
export DEVICE_UDID
echo "Using iOS simulator $DEVICE_UDID"

SIM_LOG_PID=""
stop_sim_log() {
  if [ -n "$SIM_LOG_PID" ]; then
    kill "$SIM_LOG_PID" 2>/dev/null || true
    wait "$SIM_LOG_PID" 2>/dev/null || true
    SIM_LOG_PID=""
  fi
}
# Capture the app process's os_log output for the whole entry. The app's
# structured api_test.log is copied separately by the driver.
xcrun simctl spawn "$DEVICE_UDID" log stream --style compact --level debug \
  --predicate 'process == "ChatSdkExample"' > "$SIM_LOG" 2>&1 &
SIM_LOG_PID=$!
sleep 1
if ! kill -0 "$SIM_LOG_PID" 2>/dev/null; then
  echo "warning: could not start simulator log stream; see $SIM_LOG" >&2
  SIM_LOG_PID=""
fi

# Live-render the [APITEST] records from the growing simulator log (✅/❌ per
# case). Pure view layer: assert_ci_run.js stays the only judge. The renderer
# exits by itself on script.done; the EXIT trap covers early driver exits.
node "$REPO_ROOT/testing/regression/render_ci_log.js" "$SIM_LOG" &
RENDERER_PID=$!
stop_renderer() {
  if [ -n "$RENDERER_PID" ]; then
    kill "$RENDERER_PID" 2>/dev/null || true
    wait "$RENDERER_PID" 2>/dev/null || true
    RENDERER_PID=""
  fi
}
trap 'stop_renderer; stop_sim_log' EXIT

bash "$REPO_ROOT/testing/share/run_device_ios.sh"
