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

echo "iOS deprecated API scan starting..."
