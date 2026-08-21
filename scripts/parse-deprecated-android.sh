#!/bin/bash
set -e

# Parse deprecation warnings out of an existing Android build log.
# Reads  build/reports/deprecated-android-raw.log   (produced by a full build)
# Writes build/reports/deprecated-android-warnings.log (deduplicated, SDK code only)
# stdout: JSON array of {file, line, api, message} for SDK code.
#
# Note: an incremental build does not re-emit warnings, so parsing a raw log
# captured from an incremental build yields an empty result. For a reliable
# local scan use scripts/scan-deprecated-android.sh (clean build + parse).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if ! command -v jq &> /dev/null; then
    echo "Error: jq command not found (required for JSON generation)"
    exit 1
fi

REPORT_DIR="$PROJECT_ROOT/build/reports"
RAW_LOG="$REPORT_DIR/deprecated-android-raw.log"
WARNINGS_LOG="$REPORT_DIR/deprecated-android-warnings.log"

if [ ! -s "$RAW_LOG" ]; then
    echo "Error: $RAW_LOG not found or empty. Run a full build first (e.g. yarn scan:deprecated:android)."
    exit 1
fi

TEMP_JSON=$(mktemp)
trap 'rm -f "$TEMP_JSON"' EXIT

# Export a filtered copy containing only the deprecation warning lines (deduplicated).
# Matches both javac ("warning: [deprecation]") and Kotlin compiler ("w: file://... is
# deprecated") formats. Third-party warnings (node_modules) are dropped: they are not
# actionable from this repo.
grep -E "warning: \[deprecation\]|^w: .*is deprecated" "$RAW_LOG" | grep -v "/node_modules/" | sort -u > "$WARNINGS_LOG" || true
echo "Warnings only: $WARNINGS_LOG ($(wc -l < "$WARNINGS_LOG" | tr -d ' ') lines)" >&2

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
done < "$RAW_LOG"

if [ ! -s "$TEMP_JSON" ]; then
    echo "[]"
else
    # Deduplicate by file+line+api combination
    jq -s 'unique_by([.file, .line, .api])' "$TEMP_JSON"
fi
