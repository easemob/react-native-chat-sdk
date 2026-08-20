#!/bin/bash
set -e

# Reliable local entry point: clean build (so all deprecation warnings are
# emitted) into build/reports/deprecated-android-raw.log, then parse it via
# scripts/parse-deprecated-android.sh. stdout only contains the final JSON.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/example/android"

# Check dependencies
if [ ! -f "$ANDROID_DIR/gradlew" ]; then
    echo "Error: gradlew not found at $ANDROID_DIR/gradlew"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "Error: java command not found"
    exit 1
fi

echo "Android deprecated API scan starting..." >&2
REPORT_DIR="$PROJECT_ROOT/build/reports"
RAW_LOG="$REPORT_DIR/deprecated-android-raw.log"
mkdir -p "$REPORT_DIR"

# Run gradle build (clean first to force re-compilation so deprecation warnings are emitted)
# Note: || true is intentional - we want to parse the output even if the build fails
# Note: -Xlint:deprecation is a javac flag; it is injected via the init script
# scripts/ci/enable-deprecation-lint.gradle because AGP compile tasks do not enable
# it by default.
# assembleDebug is enough: the SDK module has a single sourceset, and skipping the
# release variant halves build time and downloads. --no-daemon/--console=plain match
# `yarn example build:android`. The http timeouts make a stalled proxy/VPN connection
# fail fast (retry) instead of blocking the read forever.
# Full build output goes to RAW_LOG; stdout only contains the final JSON.
echo "Building (full log: $RAW_LOG)..." >&2
(cd "$ANDROID_DIR" && ./gradlew clean assembleDebug --no-daemon --console=plain \
  -I "$PROJECT_ROOT/scripts/ci/enable-deprecation-lint.gradle" \
  -Dorg.gradle.internal.http.socketTimeout=60000 \
  -Dorg.gradle.internal.http.connectionTimeout=60000 \
  > "$RAW_LOG" 2>&1) || true

exec bash "$SCRIPT_DIR/parse-deprecated-android.sh"
