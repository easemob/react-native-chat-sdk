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

echo "Android deprecated API scan starting..."
TEMP_OUTPUT=$(mktemp)

# Run gradle build with deprecation warnings
cd "$ANDROID_DIR"
./gradlew assemble 2>&1 | tee "$TEMP_OUTPUT" || true

# Parse warnings and filter for project code
echo "["
first=true
while IFS= read -r line; do
    if [[ $line =~ ^(modules/java/|android/).*\.java:[0-9]+:\ warning:\ \[deprecation\]\ (.+)\ in\ (.+)\ has\ been\ deprecated ]]; then
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi
        file="${BASH_REMATCH[0]%%:*}"
        line_num="${BASH_REMATCH[0]#*:}"
        line_num="${line_num%%:*}"
        api="${BASH_REMATCH[2]}"
        class="${BASH_REMATCH[3]}"
        echo -n "{\"file\":\"$file\",\"line\":$line_num,\"api\":\"$api\",\"message\":\"deprecated in $class\"}"
    fi
done < "$TEMP_OUTPUT"
echo "]"

rm -f "$TEMP_OUTPUT"
