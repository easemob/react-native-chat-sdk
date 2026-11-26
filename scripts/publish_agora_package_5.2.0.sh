#!/usr/bin/env bash
###############################################################################
# Prepare a react-native-chat-sdk 5.2.0 tree for the Agora npm package and pack it.
#
# Usage:
#   bash scripts/publish_agora_package_5.2.0.sh <target_project_dir> [agora_npm_version]
#
# Example:
#   bash scripts/publish_agora_package_5.2.0.sh .worktree/agora
#   bash scripts/publish_agora_package_5.2.0.sh .worktree/agora 1.4.0
#
# The script name tracks the EaseMob SDK line (5.2.0). The Agora npm version
# is independent and defaults to 1.4.0.
#
# The target tree is modified in place. Relative paths resolve from this
# repository root. The tarball is written to build/agora/.
#
# Native coordinates stay on the 5.2.0 SDK: Android io.hyphenate:hyphenate-chat
# 5.2.1 and iOS HyphenateChat ~> 5.2.0. Shengwang renaming is not handled.
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
ANDROID_NATIVE_DEP="io.hyphenate:hyphenate-chat:5.2.1"
IOS_NATIVE_DEP="HyphenateChat', '~> 5.2.0"

function now() {
  date +"%Y-%m-%d %H:%M:%S"
}

function log() {
  printf '[%s] %s\n' "$(now)" "$*"
}

function fail() {
  printf '[%s] ERROR: %s\n' "$(now)" "$*" >&2
  exit 1
}

function usage() {
  cat <<EOF
Usage:
  bash scripts/publish_agora_package_5.2.0.sh <target_project_dir> [agora_npm_version]

Example:
  bash scripts/publish_agora_package_5.2.0.sh .worktree/agora
  bash scripts/publish_agora_package_5.2.0.sh .worktree/agora 1.4.0
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
    --arg old_condition "react-native-chat-sdk-source" \
    --arg new_condition "react-native-agora-chat-source" \
    '
    .name = $name
    | .version = $version
    | .repository = $url
    | .bugs.url = $url
    | .homepage = $url
    | del(.scripts.prepare, .scripts.example, .workspaces)
    | if .exports["."][$old_condition] != null then
        .exports["."] = (
          .exports["."]
          | to_entries
          | map(if .key == $old_condition then .key = $new_condition else . end)
          | from_entries
        )
      else
        .
      end
    | .files = (
        (.files // [])
        | map(select(
            . != "scripts/generate-cmake.js"
            and . != "scripts/generate-version.js"
            and . != "scripts/generate-env.js"
          ))
        | . as $current
        | . + ([
            "!modules/java/com/chatsdk/flutter/**",
            "!modules/objc/flutter/**",
            "!**/ExtSdkTest.*",
            "!modules/cpp/CMakeLists.txt.flutter",
            "!modules/cpp/generate.sh",
            "!modules/cpp/generate.ps1"
          ] | map(select(. as $item | $current | index($item) | not)))
      )
    ' \
    "${file}" >"${tmp_file}"
  mv "${tmp_file}" "${file}"
}

function replace_required() {
  local file=$1
  local search=$2
  local replacement=$3

  if [ ! -f "${file}" ]; then
    fail "required file missing: ${file}"
  fi
  if [ "${search}" = "${replacement}" ]; then
    return
  fi
  if ! grep -F -q -- "${search}" "${file}"; then
    fail "required text not found in ${file}: ${search}"
  fi
  SEARCH="${search}" REPLACEMENT="${replacement}" perl -0pi -e 's/\Q$ENV{SEARCH}\E/$ENV{REPLACEMENT}/g' "${file}"
  if grep -F -q -- "${search}" "${file}"; then
    fail "required text still present in ${file}: ${search}"
  fi
}

function replace_if_exists() {
  local file=$1
  local search=$2
  local replacement=$3

  if [ ! -f "${file}" ]; then
    log "skip missing file: ${file}"
    return
  fi
  replace_required "${file}" "${search}" "${replacement}"
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

function verify_package_json() {
  local file=$1
  jq -e \
    --arg name "${TARGET_PACKAGE_NAME}" \
    --arg version "${target_version}" \
    '
    .name == $name
    and .version == $version
    and .scripts.prepare == null
    and .workspaces == null
    and (.files | index("scripts/generate-env.js") | not)
    and (.files | index("!modules/java/com/chatsdk/flutter/**"))
    and (.files | index("!modules/objc/flutter/**"))
    and .exports["."]["react-native-chat-sdk-source"] == null
    and .exports["."]["react-native-agora-chat-source"] != null
    ' "${file}" >/dev/null || fail "package.json verification failed: ${file}"
}

function verify_native_pins() {
  local target_dir=$1
  local gradle="${target_dir}/android/build.gradle"
  local podspec="${target_dir}/ChatSdk.podspec"

  if ! grep -F -q -- "${ANDROID_NATIVE_DEP}" "${gradle}"; then
    fail "Android native dependency changed: ${gradle}"
  fi
  if ! grep -F -q -- "${IOS_NATIVE_DEP}" "${podspec}"; then
    fail "iOS native dependency changed: ${podspec}"
  fi
}

function pack_and_verify() {
  local target_dir=$1
  local output_dir="${repo_dir}/build/agora"
  local archive="${output_dir}/${TARGET_PACKAGE_NAME}-${target_version}.tgz"

  mkdir -p "${output_dir}"
  rm -f "${archive}"
  (
    cd "${target_dir}"
    npm pack --ignore-scripts --pack-destination "${output_dir}"
  )

  if [ ! -f "${archive}" ]; then
    fail "package archive was not created: ${archive}"
  fi

  python3 - "${archive}" "${target_version}" <<'PY'
import json
import sys
import tarfile

archive, version = sys.argv[1], sys.argv[2]
prefix = "package/"
with tarfile.open(archive) as tar:
    names = tar.getnames()

    def text(path):
        member = tar.extractfile(prefix + path)
        if member is None:
            sys.exit(f"missing archive member: {path}")
        return member.read().decode("utf-8")

    banned = (
        "/flutter/",
        "ExtSdkTest",
        "scripts/generate-",
        "__tests__",
        "/testing/",
        "/example/",
        "CMakeLists.txt.flutter",
        "modules/cpp/generate.sh",
        "modules/cpp/generate.ps1",
    )
    leaked = [name for name in names if any(token in name for token in banned)]
    if leaked:
        sys.exit("archive contains excluded content:\n" + "\n".join(leaked[:20]))

    required = (
        "lib/module/index.js",
        "lib/typescript/src/index.d.ts",
        "src/index.ts",
        "src/__specs__/index.ts",
        "android/build.gradle",
        "ChatSdk.podspec",
        "modules/cpp/java/ExtSdkApiJava.cpp",
        "modules/java/com/chatsdk/rn/ExtSdkApiRN.java",
        "modules/objc/rn/ExtSdkApiObjcRN.h",
    )
    missing = [path for path in required if prefix + path not in names]
    if missing:
        sys.exit("archive is missing required content:\n" + "\n".join(missing))

    for path in ("src/common/ChatOptions.ts", "lib/module/common/ChatOptions.js"):
        body = text(path)
        if "params.dohVendor ?? 2" not in body or "params.dohVendor ?? 1" in body:
            sys.exit(f"dohVendor default was not updated: {path}")

    for path in ("src/__specs__/index.ts", "lib/module/__specs__/index.js"):
        body = text(path)
        if "react-native-agora-chat" not in body or "react-native-chat-sdk" in body:
            sys.exit(f"linking error still names the EaseMob package: {path}")

    package_json = json.loads(text("package.json"))
    if package_json.get("name") != "react-native-agora-chat" or package_json.get("version") != version:
        sys.exit("packed package.json name or version is wrong")
    export_keys = list(package_json["exports"]["."].keys())
    if export_keys.index("react-native-agora-chat-source") > export_keys.index("default"):
        sys.exit("source export condition is after default and will not be selected")
    if "io.hyphenate:hyphenate-chat:5.2.1" not in text("android/build.gradle"):
        sys.exit("packed Android native dependency changed")
    if "HyphenateChat', '~> 5.2.0" not in text("ChatSdk.podspec"):
        sys.exit("packed iOS native dependency changed")
PY

  log "archive: ${archive}"
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
require_command npm
require_command python3

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
verify_package_json "${package_json}"

log "modify README and LICENSE"
replace_if_exists "${target_project_dir}/README.md" "react-native-chat-sdk" "${TARGET_PACKAGE_NAME}"
replace_if_exists "${target_project_dir}/README.zh.md" "react-native-chat-sdk" "${TARGET_PACKAGE_NAME}"
replace_if_exists "${target_project_dir}/LICENSE" "easemob" "agora"

log "modify tsconfig and example imports"
replace_if_exists "${target_project_dir}/tsconfig.json" "react-native-chat-sdk" "${TARGET_PACKAGE_NAME}"
replace_example_src_imports_if_exists "${target_project_dir}"

log "modify version files"
replace_required "${target_project_dir}/src/version.ts" "${original_version}" "${target_version}"
replace_required "${target_project_dir}/lib/module/version.js" "${original_version}" "${target_version}"
replace_required "${target_project_dir}/lib/typescript/src/version.d.ts" "${original_version}" "${target_version}"
if [ -f "${target_project_dir}/lib/commonjs/version.js" ]; then
  replace_required "${target_project_dir}/lib/commonjs/version.js" "${original_version}" "${target_version}"
fi

log "modify Agora doh vendor default"
replace_required \
  "${target_project_dir}/src/common/ChatOptions.ts" \
  "params.dohVendor ?? 1" \
  "params.dohVendor ?? 2"
replace_required \
  "${target_project_dir}/lib/module/common/ChatOptions.js" \
  "params.dohVendor ?? 1" \
  "params.dohVendor ?? 2"

log "modify linking error package name"
replace_required \
  "${target_project_dir}/src/__specs__/index.ts" \
  "react-native-chat-sdk" \
  "${TARGET_PACKAGE_NAME}"
replace_required \
  "${target_project_dir}/lib/module/__specs__/index.js" \
  "react-native-chat-sdk" \
  "${TARGET_PACKAGE_NAME}"

verify_native_pins "${target_project_dir}"

log "pack"
pack_and_verify "${target_project_dir}"
log "done"
