#!/usr/bin/env bash
# Boot the first available iPhone simulator and print its UDID on stdout.
# Mirrors the Flutter SDK CI script of the same name.
set -euo pipefail

udid="$({
  xcrun simctl list devices available --json | ruby -rjson -e '
    devices = JSON.parse(STDIN.read).fetch("devices").values.flatten
    iphone = devices.find { |device| device.fetch("name", "").start_with?("iPhone") }
    abort "No available iPhone simulator was found" unless iphone
    puts iphone.fetch("udid")
  '
})"

xcrun simctl boot "$udid" 2>/dev/null || true
xcrun simctl bootstatus "$udid" -b >&2
printf '%s\n' "$udid"
