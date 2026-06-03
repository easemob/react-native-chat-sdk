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

# Run gradle build (clean first to force re-compilation so deprecation warnings are emitted)
# Note: || true is intentional - we want to parse the output even if the build fails
# Note: -Xlint:deprecation is a javac flag, not a gradle CLI flag. The Android Gradle
# Plugin's compileJava tasks emit deprecation warnings by default.
(cd "$ANDROID_DIR" && ./gradlew clean assemble 2>&1 | tee "$TEMP_OUTPUT") || true

# Parse warnings and filter for project code
# Build JSON array using jq for proper escaping
# Note: Regex matches absolute paths containing modules/java/ or android/ to filter for project code
while IFS= read -r line; do
    if [[ $line =~ (.*(modules/java/|/android/)[^:]+\.java):([0-9]+):\ warning:\ \[deprecation\]\ (.+)\ in\ (.+)\ has\ been\ deprecated ]]; then
        file="${BASH_REMATCH[1]}"
        line_num="${BASH_REMATCH[3]}"
        api="${BASH_REMATCH[4]}"
        class="${BASH_REMATCH[5]}"
        # Skip example app's java files (node_modules/) - we only want SDK code
        if [[ $file == *"/node_modules/"* ]]; then
            continue
        fi
        jq -n --arg "file" "$file" --argjson "line" "$line_num" --arg "api" "$api" --arg "message" "deprecated in $class" '{"file": $file, "line": $line, "api": $api, "message": $message}' >> "$TEMP_JSON"
    fi
done < "$TEMP_OUTPUT"

if [ ! -s "$TEMP_JSON" ]; then
    echo "[]"
else
    # Deduplicate by file+line+api combination
    jq -s 'unique_by([.file, .line, .api])' "$TEMP_JSON"
fi
