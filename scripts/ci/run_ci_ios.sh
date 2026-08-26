#!/usr/bin/env bash
# CI wrapper around run_device_ios.sh, called from the iOS test jobs of the
# device-smoke and single-account-nightly workflows. Boots a simulator (unless
# DEVICE_UDID is preset) and hands off to the driver. Symmetric counterpart of
# run_ci_android.sh; all other configuration arrives via the driver's own
# environment variables.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [ -z "${DEVICE_UDID:-}" ]; then
  DEVICE_UDID="$(bash "$REPO_ROOT/scripts/ci/boot_ios_simulator.sh")"
  export DEVICE_UDID
fi
echo "Using iOS simulator $DEVICE_UDID"

exec bash "$REPO_ROOT/scripts/ci/run_device_ios.sh"
