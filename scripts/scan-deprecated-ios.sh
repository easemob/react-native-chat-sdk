#!/bin/bash
set -e

# Reliable local entry point: clean build (so all deprecation warnings are
# emitted) into build/reports/deprecated-ios-raw.log, then parse it via
# scripts/parse-deprecated-ios.sh. stdout only contains the final JSON.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IOS_EXAMPLE_DIR="$PROJECT_ROOT/example/ios"

# Check dependencies
if ! command -v xcodebuild &> /dev/null; then
    echo "Error: xcodebuild command not found"
    exit 1
fi

if [ ! -d "$IOS_EXAMPLE_DIR/ChatSdkExample.xcworkspace" ]; then
    echo "Error: ChatSdkExample.xcworkspace not found at $IOS_EXAMPLE_DIR"
    exit 1
fi

echo "iOS deprecated API scan starting..." >&2
REPORT_DIR="$PROJECT_ROOT/build/reports"
RAW_LOG="$REPORT_DIR/deprecated-ios-raw.log"
mkdir -p "$REPORT_DIR"

# Run xcodebuild (clean first to force re-compilation so deprecation warnings are emitted)
# Note: || true is intentional - we want to parse the output even if the build fails
# Note: -Wdeprecated-declarations is a clang flag, not an xcodebuild option. It must be
# passed via OTHER_CFLAGS build setting. Clang emits deprecation warnings by default.
# Full build output goes to RAW_LOG; stdout only contains the final JSON.
echo "Building (full log: $RAW_LOG)..." >&2
(cd "$IOS_EXAMPLE_DIR" && xcodebuild -workspace ChatSdkExample.xcworkspace -scheme ChatSdkExample -sdk iphonesimulator -configuration Debug clean build OTHER_CFLAGS='$(inherited) -Wdeprecated-declarations' > "$RAW_LOG" 2>&1) || true

exec bash "$SCRIPT_DIR/parse-deprecated-ios.sh"
