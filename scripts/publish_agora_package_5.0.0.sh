#!/usr/bin/env bash
###############################################################################
# Modify an existing react-native-chat-sdk worktree for Agora npm publishing.
#
# Usage:
#   bash scripts/publish_agora_package_5.0.0.sh <target_project_dir> [target_version]
#
# Example:
#   bash scripts/publish_agora_package_5.0.0.sh .worktree/agora
#   bash scripts/publish_agora_package_5.0.0.sh .worktree/agora 1.4.0
#
# Notes:
# - This script modifies the specified target directory directly.
# - Relative target directories are resolved from the repository root.
# - Shengwang package renaming is intentionally not handled in this version.
###############################################################################

set -euo pipefail

script_dir=$(
  cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1
  pwd -P
)
repo_dir=$(
  cd "${script_dir}/.." >/dev/null 2>&1
  pwd -P
)
cd "${repo_dir}" >/dev/null 2>&1

TARGET_PACKAGE_NAME="react-native-agora-chat"
DEFAULT_TARGET_VERSION="1.4.0"
PACKAGE_URL="https://www.npmjs.com/package/${TARGET_PACKAGE_NAME}"

function now() {
  date +"%Y-%m-%d %H:%M:%S"
}

function log() {
  printf '[%s] \033[32;5m%s\033[0m\n' "$(now)" "$*"
}

function fail() {
  printf '[%s] ERROR: %s\n' "$(now)" "$*" >&2
  exit 1
}

function usage() {
  cat <<EOF
Usage:
  bash scripts/publish_agora_package_5.0.0.sh <target_project_dir> [target_version]

Example:
  bash scripts/publish_agora_package_5.0.0.sh .worktree/agora
  bash scripts/publish_agora_package_5.0.0.sh .worktree/agora 1.4.0
EOF
}

function require_command() {
  local command_name=$1
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    fail "${command_name} could not be found"
  fi
}

function abs_dir() {
  local dir=$1
  cd "${dir}" >/dev/null 2>&1 || fail "target directory does not exist: ${dir}"
  pwd -P
}

function update_package_json() {
  local file=$1
  local tmp_file
  tmp_file=$(mktemp "${file}.tmp.XXXXXX")
  jq \
    --arg name "${TARGET_PACKAGE_NAME}" \
    --arg version "${target_version}" \
    --arg url "${PACKAGE_URL}" \
    '.name = $name
      | .version = $version
      | .repository = $url
      | .bugs.url = $url
      | .homepage = $url' \
    "${file}" >"${tmp_file}"
  mv "${tmp_file}" "${file}"
}

function replace_literal_if_exists() {
  local file=$1
  local search=$2
  local replacement=$3

  if [ ! -f "${file}" ]; then
    log "skip missing file: ${file}"
    return
  fi

  SEARCH="${search}" REPLACEMENT="${replacement}" perl -0pi -e 's/\Q$ENV{SEARCH}\E/$ENV{REPLACEMENT}/g' "${file}"
}

function update_doh_vendor_if_exists() {
  local file=$1

  if [ ! -f "${file}" ]; then
    log "skip missing file: ${file}"
    return
  fi

  perl -0pi -e 's/this\.dohVendor\s*=\s*params\.dohVendor\s*\?\?\s*1;/this.dohVendor = params.dohVendor ?? 2;/g' "${file}"
}

function replace_example_src_imports_if_exists() {
  local target_dir=$1
  local example_src_dir="${target_dir}/example/src"

  if [ ! -d "${example_src_dir}" ]; then
    log "skip missing directory: ${example_src_dir}"
    return
  fi

  find "${example_src_dir}" -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print0 |
    while IFS= read -r -d '' file; do
      perl -0pi -e "s/from\s+(['\"])react-native-chat-sdk\\1/from 'react-native-agora-chat'/g" "${file}"
    done
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  usage
  exit 1
fi

require_command jq
require_command perl

target_project_dir=$(abs_dir "$1")
target_version=${2:-${DEFAULT_TARGET_VERSION}}
package_json="${target_project_dir}/package.json"

if [ ! -f "${package_json}" ]; then
  fail "package.json was not found in target directory: ${target_project_dir}"
fi

original_package_name=$(jq -r '.name // empty' "${package_json}")
original_version=$(jq -r '.version // empty' "${package_json}")

if [ -z "${original_version}" ]; then
  fail "package.json version is empty: ${package_json}"
fi

log "target project directory: ${target_project_dir}"
log "package original name: ${original_package_name}"
log "package original version: ${original_version}"
log "package target name: ${TARGET_PACKAGE_NAME}"
log "package target version: ${target_version}"

log "modify package.json"
update_package_json "${package_json}"
replace_literal_if_exists "${package_json}" "react-native-chat-sdk" "${TARGET_PACKAGE_NAME}"

log "modify README files"
replace_literal_if_exists "${target_project_dir}/README.md" "react-native-chat-sdk" "${TARGET_PACKAGE_NAME}"
replace_literal_if_exists "${target_project_dir}/README.zh.md" "react-native-chat-sdk" "${TARGET_PACKAGE_NAME}"

log "modify example/src imports"
replace_example_src_imports_if_exists "${target_project_dir}"

log "modify LICENSE"
replace_literal_if_exists "${target_project_dir}/LICENSE" "easemob" "agora"

log "modify version files"
replace_literal_if_exists "${target_project_dir}/src/version.ts" "${original_version}" "${target_version}"
replace_literal_if_exists "${target_project_dir}/lib/typescript/src/version.d.ts" "${original_version}" "${target_version}"
replace_literal_if_exists "${target_project_dir}/lib/module/version.js" "${original_version}" "${target_version}"
replace_literal_if_exists "${target_project_dir}/lib/commonjs/version.js" "${original_version}" "${target_version}"

log "modify Agora doh vendor default"
update_doh_vendor_if_exists "${target_project_dir}/src/common/ChatOptions.ts"

actual_package_name=$(jq -r '.name' "${package_json}")
actual_version=$(jq -r '.version' "${package_json}")
if [ "${actual_package_name}" != "${TARGET_PACKAGE_NAME}" ]; then
  fail "package name verification failed: ${actual_package_name}"
fi
if [ "${actual_version}" != "${target_version}" ]; then
  fail "package version verification failed: ${actual_version}"
fi

log "done"
