#!/usr/bin/env bash
# Resolve exactly one online Android device and print its serial on stdout.
#
# - ANDROID_SERIAL set: validate it is online, then use it.
# - unset: require exactly one online device; fail with the device list
#   instead of letting `adb get-state` report a misleading "no device".
set -euo pipefail

ADB="${ADB:-adb}"
if ! command -v "$ADB" >/dev/null 2>&1; then
  echo "error: adb not found (add Android SDK platform-tools to PATH)" >&2
  exit 2
fi

if [ -n "${ANDROID_SERIAL:-}" ]; then
  if ! "$ADB" -s "$ANDROID_SERIAL" get-state >/dev/null 2>&1; then
    echo "error: ANDROID_SERIAL=$ANDROID_SERIAL is not an online device" >&2
    "$ADB" devices >&2 || true
    exit 2
  fi
  printf '%s\n' "$ANDROID_SERIAL"
  exit 0
fi

devices="$("$ADB" devices | awk 'NR > 1 && $2 == "device" { print $1 }')"
count="$(printf '%s\n' "$devices" | sed '/^$/d' | wc -l | tr -d ' ')"

if [ "$count" -eq 0 ]; then
  echo "error: no online Android device/emulator (adb devices)" >&2
  "$ADB" devices >&2 || true
  exit 2
fi

if [ "$count" -gt 1 ]; then
  echo "error: multiple online Android devices; set ANDROID_SERIAL to one of:" >&2
  printf '%s\n' "$devices" | sed '/^$/d; s/^/  /' >&2
  exit 2
fi

printf '%s\n' "$devices"
