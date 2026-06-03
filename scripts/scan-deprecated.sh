#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORT_DIR="$PROJECT_ROOT/build/reports"
REPORT_FILE="$REPORT_DIR/native-deprecated-api.md"

# Create report directory
mkdir -p "$REPORT_DIR"

echo "Running native deprecated API scan..."

# Run Android scan
echo "Scanning Android..."
ANDROID_OUTPUT=$(bash "$SCRIPT_DIR/scan-deprecated-android.sh")
ANDROID_EXIT_CODE=$?

if [ $ANDROID_EXIT_CODE -ne 0 ]; then
    echo "Error: Android scan failed"
    exit 1
fi

# Run iOS scan
echo "Scanning iOS..."
IOS_OUTPUT=$(bash "$SCRIPT_DIR/scan-deprecated-ios.sh")
IOS_EXIT_CODE=$?

if [ $IOS_EXIT_CODE -ne 0 ]; then
    echo "Error: iOS scan failed"
    exit 1
fi

# Generate report
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
ANDROID_COUNT=$(echo "$ANDROID_OUTPUT" | jq 'length')
IOS_COUNT=$(echo "$IOS_OUTPUT" | jq 'length')
TOTAL_COUNT=$((ANDROID_COUNT + IOS_COUNT))

cat > "$REPORT_FILE" << EOF
# Native Deprecated API Scan Report

Generated: $TIMESTAMP

## Summary
- Android: $ANDROID_COUNT warnings
- iOS: $IOS_COUNT warnings
- Total: $TOTAL_COUNT warnings

EOF

if [ $ANDROID_COUNT -gt 0 ]; then
    echo "## Android" >> "$REPORT_FILE"
    echo "$ANDROID_OUTPUT" | jq -r '.[] | "### \(.file):\(.line)\n- API: `\(.api)`\n- Message: \(.message)\n"' >> "$REPORT_FILE"
fi

if [ $IOS_COUNT -gt 0 ]; then
    echo "## iOS" >> "$REPORT_FILE"
    echo "$IOS_OUTPUT" | jq -r '.[] | "### \(.file):\(.line)\n- API: `\(.api)`\n- Message: \(.message)\n"' >> "$REPORT_FILE"
fi

if [ $TOTAL_COUNT -eq 0 ]; then
    echo "No deprecated API warnings found." >> "$REPORT_FILE"
fi

echo "Report generated at $REPORT_FILE"
