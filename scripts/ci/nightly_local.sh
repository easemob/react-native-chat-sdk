#!/usr/bin/env bash
# One-command local run of the single-account nightly test. Mirrors the build
# and run steps of .github/workflows/single-account-nightly.yml so a local run
# exercises exactly what CI runs.
#
# Required environment (same names as the GitHub secrets):
#   E2E_APP_KEY  E2E_USER_ID  E2E_USER_PASSWORD
#
# Usage:
#   E2E_APP_KEY=... E2E_USER_ID=... E2E_USER_PASSWORD=... \
#     bash scripts/ci/nightly_local.sh android   # needs a booted emulator/device
#     ... ios                                    # boots a simulator if none is booted
#
# The generated config contains real credentials; it is written with mode 0600
# under build/reports/ and deleted on exit (trap), and the device-side copy is
# removed as well.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLATFORM="${1:-}"
case "$PLATFORM" in
  android|ios) ;;
  *)
    echo "usage: bash scripts/ci/nightly_local.sh <android|ios>" >&2
    exit 2
    ;;
esac

for var in E2E_APP_KEY E2E_USER_ID E2E_USER_PASSWORD; do
  if [ -z "${!var:-}" ]; then
    echo "error: environment variable $var is not set" >&2
    exit 2
  fi
done

cd "$REPO_ROOT"

mkdir -p build/reports
CONFIG="$REPO_ROOT/build/reports/rn_single_account_config.json"
bash scripts/ci/write_single_account_config.sh "$CONFIG"
cleanup() {
  rm -f "$CONFIG"
  if [ "$PLATFORM" = "android" ]; then
    adb shell rm -f /data/local/tmp/rn_single_account.json \
      /data/local/tmp/rn_single_account_config.json 2>/dev/null || true
  else
    rm -f /tmp/rn_single_account.json /tmp/rn_single_account_config.json
  fi
}
trap cleanup EXIT

[ -d node_modules ] || yarn install
yarn gen:version_file && yarn gen:cmake_file && yarn gen:env_file

if [ "$PLATFORM" = "android" ]; then
  adb get-state >/dev/null 2>&1 || {
    echo "error: no booted Android emulator/device reachable via adb" >&2
    exit 2
  }
  # Build for the ABI of the attached device (arm64 on Apple Silicon,
  # x86_64 on CI), not a hardcoded one.
  ABI="$(adb shell getprop ro.product.cpu.abi | tr -d '\r')"
  echo ">> build nightly APK (ABI=$ABI, bundle embedded, API_SCRIPT/API_CONFIG inlined)"
  (
    cd example/android
    API_SCRIPT=/data/local/tmp/rn_single_account.json \
    API_CONFIG=/data/local/tmp/rn_single_account_config.json \
      ./gradlew app:assembleDebug --no-daemon --console=plain \
      "-PreactNativeArchitectures=$ABI" -PbundleInDebug=true
  )
  # No `exec` here: the EXIT trap above must run afterwards to delete the
  # credential-bearing config. `exit 0` instead: without it the script would
  # fall through into the iOS section below.
  env \
    SCRIPT_JSON="$REPO_ROOT/example/ci/single_account.json" \
    CONFIG_JSON="$CONFIG" \
    DEVICE_SCRIPT_PATH=/data/local/tmp/rn_single_account.json \
    DEVICE_CONFIG_PATH=/data/local/tmp/rn_single_account_config.json \
    OUT_LOG="$REPO_ROOT/build/reports/nightly-android-api_test.log" \
    bash scripts/ci/run_device_android.sh
  exit 0
fi

# ios
if [ ! -d example/ios/Pods ]; then
  echo ">> first run: install CocoaPods dependencies"
  (
    cd example
    bundle config set --local path vendor/bundle
    bundle install
    bundle exec pod install --project-directory=ios
  )
fi

if ! xcrun simctl list devices booted | grep -q Booted; then
  echo ">> no booted simulator, booting one"
  DEVICE_UDID="$(bash scripts/ci/boot_ios_simulator.sh)"
  export DEVICE_UDID
fi

echo ">> build nightly app (bundle embedded, API_SCRIPT/API_CONFIG inlined)"
(
  cd example
  xcodebuild -workspace ios/ChatSdkExample.xcworkspace \
    -scheme ChatSdkExample \
    -configuration Debug \
    -sdk iphonesimulator \
    -derivedDataPath ios/build \
    FORCE_BUNDLING=1 \
    API_SCRIPT=/tmp/rn_single_account.json \
    API_CONFIG=/tmp/rn_single_account_config.json \
    build
)
# No `exec` here: the EXIT trap above must run afterwards to delete the
# credential-bearing config.
env \
  SCRIPT_JSON="$REPO_ROOT/example/ci/single_account.json" \
  CONFIG_JSON="$CONFIG" \
  HOST_SCRIPT_PATH=/tmp/rn_single_account.json \
  HOST_CONFIG_PATH=/tmp/rn_single_account_config.json \
  OUT_LOG="$REPO_ROOT/build/reports/nightly-ios-api_test.log" \
  bash scripts/ci/run_device_ios.sh
