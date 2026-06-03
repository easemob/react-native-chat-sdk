#!/bin/bash
set -e

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

if ! command -v jq &> /dev/null; then
    echo "Error: jq command not found (required for JSON generation)"
    exit 1
fi

echo "iOS deprecated API scan starting..."
TEMP_OUTPUT=$(mktemp)
TEMP_JSON=$(mktemp)
trap 'rm -f "$TEMP_OUTPUT" "$TEMP_JSON"' EXIT

# Run xcodebuild with deprecation warnings
# Note: || true is intentional - we want to parse the output even if the build fails
(cd "$IOS_EXAMPLE_DIR" && xcodebuild -workspace ChatSdkExample.xcworkspace -scheme ChatSdkExample -sdk iphonesimulator -configuration Debug build -Wdeprecated-declarations 2>&1 | tee "$TEMP_OUTPUT") || true

# Parse warnings and filter for project code
# Build JSON array using jq for proper escaping
while IFS= read -r line; do
    if [[ $line =~ ^(modules/objc/|ios/).*\.[mh]:[0-9]+:[0-9]+:\ warning:\ \'(.+)\'\ is\ deprecated:\ (.*)\ \[-Wdeprecated-declarations\] ]]; then
        file="${BASH_REMATCH[0]%%:*}"
        line_num="${BASH_REMATCH[0]#*:}"
        line_num="${line_num%%:*}"
        api="${BASH_REMATCH[2]}"
        message="${BASH_REMATCH[3]}"
        jq -n --arg "file" "$file" --argjson "line" "$line_num" --arg "api" "$api" --arg "message" "$message" '{"file": $file, "line": $line, "api": $api, "message": $message}' >> "$TEMP_JSON"
    fi
done < "$TEMP_OUTPUT"

if [ ! -s "$TEMP_JSON" ]; then
    echo "[]"
else
    jq -s '.' "$TEMP_JSON"
fi
