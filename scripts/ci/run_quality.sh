#!/usr/bin/env bash
#
# Quality gates for local development and CI (identical behavior).
# CI (.github/workflows/ci.yml) calls this script; run it locally before
# opening a PR to get the same result as the `quality` job.
#
# Note: `yarn scan:deprecated` is intentionally NOT part of this script.
# It requires native toolchains (gradle on Linux, xcodebuild on macOS) and
# runs in the android-build / ios-build CI jobs instead.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

echo "==> Install dependencies"
yarn install --immutable

echo "==> Generate version / cmake / env files"
yarn gen:version_file
yarn gen:cmake_file
yarn gen:env_file

echo "==> Typecheck"
yarn typecheck

echo "==> Lint"
yarn lint

echo "==> Unit tests (with coverage)"
yarn test:unit --coverage --no-watchman

echo "==> Contract tests (TS <-> native method names)"
yarn test:contract --no-watchman

echo "==> Circular dependency check"
yarn check:circular:dpdm

echo "==> All quality gates passed"
