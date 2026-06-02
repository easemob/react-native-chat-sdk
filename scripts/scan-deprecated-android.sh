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
