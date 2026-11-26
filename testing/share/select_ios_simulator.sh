#!/usr/bin/env bash
# Resolve one booted iOS simulator and print its UDID on stdout.
#
# - DEVICE_UDID set: validate it exists, boot it if needed, wait for boot.
# - unset: use the only booted simulator; boot one if none; fail if several
#   are booted so callers never silently target the wrong device.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v xcrun >/dev/null 2>&1; then
  echo "error: xcrun not found (install Xcode command line tools)" >&2
  exit 2
fi

booted_udids() {
  xcrun simctl list devices booted |
    sed -n 's/.*(\([0-9A-Fa-f-]\{36\}\)) (Booted).*/\1/p'
}

if [ -n "${DEVICE_UDID:-}" ]; then
  udid="$DEVICE_UDID"
  if ! xcrun simctl list devices available | grep -q "($udid)"; then
    echo "error: DEVICE_UDID=$udid is not an available simulator" >&2
    echo "       run: xcrun simctl list devices available" >&2
    exit 2
  fi
  if ! xcrun simctl list devices booted | grep -q "($udid)"; then
    echo ">> booting iOS simulator $udid" >&2
    if ! xcrun simctl boot "$udid" 2>/dev/null; then
      if ! xcrun simctl list devices booted | grep -q "($udid)"; then
        echo "error: failed to boot iOS simulator $udid" >&2
        exit 2
      fi
    fi
    xcrun simctl bootstatus "$udid" -b >&2
  fi
  printf '%s\n' "$udid"
  exit 0
fi

booted="$(booted_udids)"
count="$(printf '%s\n' "$booted" | sed '/^$/d' | wc -l | tr -d ' ')"

if [ "$count" -eq 0 ]; then
  bash "$SCRIPT_DIR/boot_ios_simulator.sh"
  exit 0
fi

if [ "$count" -gt 1 ]; then
  echo "error: multiple booted iOS simulators; set DEVICE_UDID to one of:" >&2
  xcrun simctl list devices booted |
    sed -n 's/^ *\(.*\) (\([0-9A-Fa-f-]\{36\}\)) (Booted).*/  \1 (\2)/p' >&2
  exit 2
fi

printf '%s\n' "$booted"
