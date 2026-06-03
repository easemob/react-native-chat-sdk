# Native Deprecated API Scanner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create shell scripts to scan native wrapper code for deprecated HyphenateChat SDK API calls and generate a Markdown report.

**Architecture:** Three shell scripts - one for Android (gradlew + deprecation lint), one for iOS (xcodebuild + deprecation warnings), and a main script that calls both and aggregates results into a Markdown report.

**Tech Stack:** Shell scripts (bash), Gradle, xcodebuild, JSON parsing (jq), regular expressions

---

### Task 1: Create Android scan script skeleton

**Files:**
- Create: `scripts/scan-deprecated-android.sh`

- [ ] **Step 1: Create the Android scan script with dependency checks**

```bash
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
```

- [ ] **Step 2: Make script executable**

```bash
chmod +x scripts/scan-deprecated-android.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/scan-deprecated-android.sh
git commit -m "feat: add android deprecated api scan script skeleton"
```

---

### Task 2: Implement Android build and parsing

**Files:**
- Modify: `scripts/scan-deprecated-android.sh`

- [ ] **Step 1: Add build command and JSON output generation**

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/example/android"
TEMP_OUTPUT=$(mktemp)

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

# Run gradle build with deprecation warnings
cd "$ANDROID_DIR"
./gradlew assemble -Xlint:deprecation 2>&1 | tee "$TEMP_OUTPUT" || true

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
```

- [ ] **Step 2: Test the script manually**

```bash
bash scripts/scan-deprecated-android.sh
```

Expected: JSON array output with any deprecation warnings found in Android code

- [ ] **Step 3: Commit**

```bash
git add scripts/scan-deprecated-android.sh
git commit -m "feat: implement android build and parsing logic"
```

---

### Task 3: Create iOS scan script skeleton

**Files:**
- Create: `scripts/scan-deprecated-ios.sh`

- [ ] **Step 1: Create the iOS scan script with dependency checks**

```bash
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
```

- [ ] **Step 2: Make script executable**

```bash
chmod +x scripts/scan-deprecated-ios.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/scan-deprecated-ios.sh
git commit -m "feat: add ios deprecated api scan script skeleton"
```

---

### Task 4: Implement iOS build and parsing

**Files:**
- Modify: `scripts/scan-deprecated-ios.sh`

- [ ] **Step 1: Add build command and JSON output generation**

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IOS_EXAMPLE_DIR="$PROJECT_ROOT/example/ios"
TEMP_OUTPUT=$(mktemp)

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

# Run xcodebuild with deprecation warnings
cd "$IOS_EXAMPLE_DIR"
xcodebuild -workspace ChatSdkExample.xcworkspace -scheme ChatSdkExample -sdk iphonesimulator -configuration Debug build -Wdeprecated-declarations 2>&1 | tee "$TEMP_OUTPUT" || true

# Parse warnings and filter for project code
echo "["
first=true
while IFS= read -r line; do
    if [[ $line =~ ^(modules/objc/|ios/).*\.[mh]:[0-9]+:[0-9]+:\ warning:\ \'(.+)\'\ is\ deprecated:\ (.*)\ \[-Wdeprecated-declarations\] ]]; then
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi
        file="${BASH_REMATCH[0]%%:*}"
        line_num="${BASH_REMATCH[0]#*:}"
        line_num="${line_num%%:*}"
        api="${BASH_REMATCH[2]}"
        message="${BASH_REMATCH[3]}"
        echo -n "{\"file\":\"$file\",\"line\":$line_num,\"api\":\"$api\",\"message\":\"$message\"}"
    fi
done < "$TEMP_OUTPUT"
echo "]"

rm -f "$TEMP_OUTPUT"
```

- [ ] **Step 2: Test the script manually**

```bash
bash scripts/scan-deprecated-ios.sh
```

Expected: JSON array output with any deprecation warnings found in iOS code

- [ ] **Step 3: Commit**

```bash
git add scripts/scan-deprecated-ios.sh
git commit -m "feat: implement ios build and parsing logic"
```

---

### Task 5: Create main scan script

**Files:**
- Create: `scripts/scan-deprecated.sh`

- [ ] **Step 1: Create main script that calls both sub-scripts**

```bash
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
```

- [ ] **Step 2: Make script executable**

```bash
chmod +x scripts/scan-deprecated.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/scan-deprecated.sh
git commit -m "feat: add main deprecated api scan script"
```

---

### Task 6: Add yarn scripts to package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add scan scripts to package.json scripts section**

```json
{
  "scripts": {
    "scan:deprecated": "bash scripts/scan-deprecated.sh",
    "scan:deprecated:android": "bash scripts/scan-deprecated-android.sh",
    "scan:deprecated:ios": "bash scripts/scan-deprecated-ios.sh"
  }
}
```

- [ ] **Step 2: Test yarn scripts**

```bash
yarn scan:deprecated:android
```

Expected: JSON output from Android scan

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add yarn scripts for deprecated api scanning"
```

---

### Task 7: Add report file to .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add report file to .gitignore**

```gitignore
# Deprecated API scan reports
build/reports/native-deprecated-api.md
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add deprecated api scan report to gitignore"
```

---

### Task 8: End-to-end test

**Files:**
- Test: `scripts/scan-deprecated.sh`

- [ ] **Step 1: Run full scan**

```bash
yarn scan:deprecated
```

Expected: Report generated at `build/reports/native-deprecated-api.md` with summary and any warnings found

- [ ] **Step 2: Verify report content**

```bash
cat build/reports/native-deprecated-api.md
```

Expected: Markdown report with proper structure (header, summary, sections for Android/iOS if warnings exist)

- [ ] **Step 3: Test individual platform scans**

```bash
yarn scan:deprecated:android
yarn scan:deprecated:ios
```

Expected: JSON output from each platform scan

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: adjust regex or script logic based on testing"
```
