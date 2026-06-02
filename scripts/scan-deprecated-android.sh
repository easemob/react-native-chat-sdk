#!/bin/bash
set -e

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

if ! command -v jq &> /dev/null; then
    echo "Error: jq command not found (required for JSON generation)"
    exit 1
fi

echo "Android deprecated API scan starting..."
TEMP_OUTPUT=$(mktemp)
TEMP_JSON=$(mktemp)
trap 'rm -f "$TEMP_OUTPUT" "$TEMP_JSON"' EXIT

# Run gradle build with deprecation warnings
# Note: || true is intentional - we want to parse the output even if the build fails
(cd "$ANDROID_DIR" && ./gradlew assemble -Xlint:deprecation 2>&1 | tee "$TEMP_OUTPUT") || true

# Parse warnings and filter for project code
# Build JSON array using jq for proper escaping
while IFS= read -r line; do
    if [[ $line =~ ^(modules/java/|android/).*\.java:[0-9]+:\ warning:\ \[deprecation\]\ (.+)\ in\ (.+)\ has\ been\ deprecated ]]; then
        file="${BASH_REMATCH[0]%%:*}"
        line_num="${BASH_REMATCH[0]#*:}"
        line_num="${line_num%%:*}"
        api="${BASH_REMATCH[2]}"
        class="${BASH_REMATCH[3]}"
        jq -n --arg "file" "$file" --argjson "line" "$line_num" --arg "api" "$api" --arg "message" "deprecated in $class" '{"file": $file, "line": $line, "api": $api, "message": $message}' >> "$TEMP_JSON"
    fi
done < "$TEMP_OUTPUT"

if [ ! -s "$TEMP_JSON" ]; then
    echo "[]"
else
    jq -s '.' "$TEMP_JSON"
fi
