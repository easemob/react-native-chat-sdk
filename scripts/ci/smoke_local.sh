#!/usr/bin/env bash
# One-command local verification of the device smoke test. Mirrors the build
# steps of .github/workflows/device-smoke.yml (JS bundle embedded, API_SCRIPT
# inlined) and then runs the platform driver script, so a local run exercises
# exactly what CI runs.
#
# Usage:
#   bash scripts/ci/smoke_local.sh android   # needs a booted emulator/device
#   bash scripts/ci/smoke_local.sh ios       # boots a simulator if none is booted
#
# Re-running is incremental: dependencies, pods and native objects are reused,
# only the JS bundle is regenerated.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLATFORM="${1:-}"
case "$PLATFORM" in
  android|ios) ;;
  *)
    echo "usage: bash scripts/ci/smoke_local.sh <android|ios>" >&2
    exit 2
    ;;
esac

cd "$REPO_ROOT"

[ -d node_modules ] || yarn install
yarn gen:version_file && yarn gen:cmake_file && yarn gen:env_file

# API_SCRIPT / API_CONFIG reach the bundler via environment variables, which
# neither gradle's up-to-date checks nor metro's transform cache track (their
# keys are file contents + transformer options only). Without these clears,
# alternating smoke/nightly runs silently reuse the previously inlined paths.
rm -rf "${TMPDIR:-/tmp}/metro-cache"

if [ "$PLATFORM" = "android" ]; then
  adb get-state >/dev/null 2>&1 || {
    echo "error: no booted Android emulator/device reachable via adb" >&2
    exit 2
  }
  # Build for the ABI of the attached device (arm64 on Apple Silicon,
  # x86_64 on CI), not a hardcoded one.
  ABI="$(adb shell getprop ro.product.cpu.abi | tr -d '\r')"
  echo ">> build smoke APK (ABI=$ABI, bundle embedded, API_SCRIPT inlined)"
  (
    cd example/android
    API_SCRIPT=/data/local/tmp/rn_smoke_no_login.json \
      ./gradlew app:cleanCreateBundleDebugJsAndAssets app:assembleDebug \
      --no-daemon --console=plain \
      "-PreactNativeArchitectures=$ABI" -PbundleInDebug=true
  )
  exec bash scripts/ci/run_device_android.sh
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

echo ">> build smoke app (bundle embedded, API_SCRIPT inlined)"
(
  cd example
  xcodebuild -workspace ios/ChatSdkExample.xcworkspace \
    -scheme ChatSdkExample \
    -configuration Debug \
    -sdk iphonesimulator \
    -derivedDataPath ios/build \
    FORCE_BUNDLING=1 \
    API_SCRIPT=/tmp/rn_smoke_no_login.json \
    build
)
exec bash scripts/ci/run_device_ios.sh
