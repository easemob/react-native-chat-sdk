#!/bin/bash
set -e

# Parse deprecation warnings out of an existing iOS build log.
# Reads  build/reports/deprecated-ios-raw.log   (produced by a full build)
# Writes build/reports/deprecated-ios-warnings.log (deduplicated, SDK code only)
# stdout: JSON array of {file, line, api, message} for SDK code.
#
# Note: an incremental build does not re-emit warnings, so parsing a raw log
# captured from an incremental build yields an empty result. For a reliable
# local scan use scripts/scan-deprecated-ios.sh (clean build + parse).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if ! command -v jq &> /dev/null; then
    echo "Error: jq command not found (required for JSON generation)"
    exit 1
fi

REPORT_DIR="$PROJECT_ROOT/build/reports"
RAW_LOG="$REPORT_DIR/deprecated-ios-raw.log"
WARNINGS_LOG="$REPORT_DIR/deprecated-ios-warnings.log"

if [ ! -s "$RAW_LOG" ]; then
    echo "Error: $RAW_LOG not found or empty. Run a full build first (e.g. yarn scan:deprecated:ios)."
    exit 1
fi

TEMP_JSON=$(mktemp)
trap 'rm -f "$TEMP_JSON"' EXIT

# Export a filtered copy containing only the deprecation warning lines (deduplicated).
# Anchored to ^/ so only real "file:line: warning:" entries are kept; xcodebuild also
# re-prints warnings inside indented note trees ("    | `- warning: ...").
# Third-party warnings (Pods/, node_modules) are dropped: they are not actionable
# from this repo.
grep -E "^/.*warning: '.*' is deprecated" "$RAW_LOG" | grep -v -e "/Pods/" -e "/node_modules/" | sort -u > "$WARNINGS_LOG" || true
echo "Warnings only: $WARNINGS_LOG ($(wc -l < "$WARNINGS_LOG" | tr -d ' ') lines)" >&2

# Parse warnings and filter for project code
# Build JSON array using jq for proper escaping
# Note: Regex matches absolute paths containing modules/objc/ or ios/ to filter for project code
while IFS= read -r line; do
    # The ": message" part after "is deprecated" is optional (e.g. "'foo' is deprecated"
    # with no replacement hint), so make it optional in the regex.
    if [[ $line =~ (.*(modules/objc/|/ios/)[^:]+\.[mh]):([0-9]+):[0-9]+:\ warning:\ \'([^\']+)\'\ is\ deprecated(:\ (.*))?\ \[-Wdeprecated-declarations\] ]]; then
        file="${BASH_REMATCH[1]}"
        line_num="${BASH_REMATCH[3]}"
        api="${BASH_REMATCH[4]}"
        message="${BASH_REMATCH[6]:-}"
        # Skip example app's iOS files (Pods/, node_modules/) - we only want SDK code
        if [[ $file == *"/Pods/"* || $file == *"/node_modules/"* ]]; then
            continue
        fi
        jq -n --arg "file" "$file" --argjson "line" "$line_num" --arg "api" "$api" --arg "message" "$message" '{"file": $file, "line": $line, "api": $api, "message": $message}' >> "$TEMP_JSON"
    fi
done < "$RAW_LOG"

if [ ! -s "$TEMP_JSON" ]; then
    echo "[]"
else
    # Deduplicate by file+line+api combination
    jq -s 'unique_by([.file, .line, .api])' "$TEMP_JSON"
fi
