#!/usr/bin/env bash
# CI wrapper around run_device_android.sh, called from the android-emulator-runner
# `script:` input of the device-smoke and single-account-nightly workflows.
# That action does not pass multi-line scripts to the shell reliably (observed:
# only the first line reached `sh -c`, which broke `\` continuations and
# `|| { }` blocks), so the workflows invoke this one-liner instead of inlining
# the logic. All configuration arrives via environment variables, which the
# action passes through unchanged.
#
# Tunables (in addition to run_device_android.sh's own):
#   LOGCAT_LOG           where to dump logcat when the driver fails
#                        (default: build/reports/android-logcat.log)
#   DEVICE_CLEANUP_PATHS space-separated device paths to delete after the run
#                        (single-account nightly: the on-device script/config
#                        copies hold credentials and must be removed inside the
#                        emulator session, as must the logcat dump)

# No `set -e`: cleanup and the logcat dump must run even when the driver fails.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOGCAT_LOG="${LOGCAT_LOG:-$REPO_ROOT/build/reports/android-logcat.log}"

rc=0
bash "$REPO_ROOT/scripts/ci/run_device_android.sh" || rc=$?

if [ -n "${DEVICE_CLEANUP_PATHS:-}" ]; then
  read -r -a cleanup_paths <<< "$DEVICE_CLEANUP_PATHS"
  adb shell rm -f "${cleanup_paths[@]}" || true
fi

if [ "$rc" -ne 0 ]; then
  mkdir -p "$(dirname "$LOGCAT_LOG")"
  adb logcat -d > "$LOGCAT_LOG" || true
fi

exit "$rc"
