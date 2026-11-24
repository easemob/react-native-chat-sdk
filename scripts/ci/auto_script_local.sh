#!/usr/bin/env bash
# One-command local build+run of an auto-mode script on a device: builds the
# example app with the JS bundle embedded and API_SCRIPT inlined, then runs
# the platform driver script. This is the entry point of the porting runner
# (yarn report:api -> scripts/ci/auto_report.js spawns this script with
# SCRIPT_JSON/OUT_LOG overrides). The CI device regression harness uses
# ci_test_local.sh instead (CI mode, CI_RUN inlined).
#
# Usage:
#   bash scripts/ci/auto_script_local.sh android   # needs one online emulator/device
#   bash scripts/ci/auto_script_local.sh ios       # uses DEVICE_UDID/one booted sim
#
# Android device selection goes through select_android_device.sh (set
# ANDROID_SERIAL when several devices are online). iOS goes through
# select_ios_simulator.sh: it validates/boots DEVICE_UDID, and refuses to guess
# when several simulators are booted. Set SKIP_POD_INSTALL=1 to skip the Pods
# refresh that otherwise runs before every iOS build.
#
# Re-running is incremental for dependencies and native objects; the JS bundle
# is regenerated, and iOS Pods are refreshed unless SKIP_POD_INSTALL=1.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLATFORM="${1:-}"
case "$PLATFORM" in
  android|ios) ;;
  *)
    echo "usage: bash scripts/ci/auto_script_local.sh <android|ios>" >&2
    exit 2
    ;;
esac

cd "$REPO_ROOT"

# Direct invocation (without auto_report.js) still gets a timestamped artifact
# directory. auto_report.js always overrides OUT_LOG with its own run dir.
if [ -z "${OUT_LOG:-}" ]; then
  AUTO_RUN_STAMP="$(date +%Y%m%d%H%M%S)"
  OUT_DIR="$REPO_ROOT/artifacts/single/$AUTO_RUN_STAMP/$PLATFORM"
  OUT_LOG="$OUT_DIR/api_test.log"
  mkdir -p "$OUT_DIR"
  export OUT_DIR OUT_LOG
fi

[ -d node_modules ] || yarn install
yarn gen:version_file && yarn gen:cmake_file && yarn gen:env_file

# API_SCRIPT reaches the bundler via an environment variable, which neither
# gradle's up-to-date checks nor metro's transform cache track (their keys
# are file contents + transformer options only). Without this clear, a
# previous auto-mode/CI-mode build's inlined paths would be reused silently.
rm -rf "${TMPDIR:-/tmp}/metro-cache"

if [ "$PLATFORM" = "android" ]; then
  ANDROID_SERIAL="$(bash scripts/ci/select_android_device.sh)"
  export ANDROID_SERIAL
  # Build for the ABI of the attached device (arm64 on Apple Silicon,
  # x86_64 on CI), not a hardcoded one.
  ABI="$(adb shell getprop ro.product.cpu.abi | tr -d '\r')"
  echo ">> build auto-mode APK (ABI=$ABI, bundle embedded, API_SCRIPT inlined)"
  (
    cd example/android
    API_SCRIPT=/data/local/tmp/rn_auto_script.json \
      ./gradlew app:cleanCreateBundleDebugJsAndAssets app:assembleDebug \
      --no-daemon --console=plain \
      "-PreactNativeArchitectures=$ABI" -PbundleInDebug=true
  )
  exec bash scripts/ci/run_device_android.sh
fi

# ios
DEVICE_UDID="$(bash scripts/ci/select_ios_simulator.sh)"
export DEVICE_UDID

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

echo ">> build auto-mode app (bundle embedded, API_SCRIPT inlined)"
(
  cd example
  xcodebuild -workspace ios/ChatSdkExample.xcworkspace \
    -scheme ChatSdkExample \
    -configuration Debug \
    -sdk iphonesimulator \
    -derivedDataPath ios/build \
    FORCE_BUNDLING=1 \
    API_SCRIPT=/tmp/rn_auto_script.json \
    build
)
exec bash scripts/ci/run_device_ios.sh
