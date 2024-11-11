#!/bin/bash

pwd

echo "current platform: $EAS_BUILD_PLATFORM"

# https://docs.expo.dev/build-reference/variables/
if [ "$EAS_BUILD_PLATFORM" = "ios" ]; then
  echo "ios platform op"
elif [ "$EAS_BUILD_PLATFORM" = "android" ]; then
  echo "android platform op"
fi
