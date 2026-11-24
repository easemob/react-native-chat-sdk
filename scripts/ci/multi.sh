#!/usr/bin/env bash
# Thin wrapper around the im-test-orchestrator multi CLI.
#
# Tool resolution order (D13):
#   1. $IMTO_PATH: path to an im-test-orchestrator checkout
#   2. Local checkout at /Users/asterisk/Codes/zuoyu/im-test-orchestrator
#   3. Clone pinned by example/multi-tool.json into example/.im-test-orchestrator
#      (gitignored; inactive until the pin file carries a real URL and ref)
#
# Usage:
#   scripts/ci/multi.sh generate --platform ios [--case <name>] [--instance <id>] ...
#       Runs scripts/generate_cases.dart; defaults --cases-dir to
#       example/multi_cases.
#   scripts/ci/multi.sh prepare|devices|build|launch|run|report|clean|all ...
#       Runs bin/cli.dart; defaults --app-dir to example/.
# Example:
#   scripts/ci/multi.sh all --cases /path/to/im-test-orchestrator/multi/config/cases.json
# `generate` writes cases.json under <IMTO>/multi/config/, not under this
# repository; pass that absolute path to --cases.
# Relative path arguments are resolved against this repository root.
#
# all/run/report additionally collect their generated artifacts into
# artifacts/multi/<local timestamp>/<platform>/:
#   <reports/<runId>>/*   summary, statistics, process, flow reports, device logs
#   tmp/                  orchestrator run.log, issue notes and raw evidence
# The orchestrator APK/build cache (build/<runId>/, often >100 MB) is not
# copied; it remains in the orchestrator checkout and is regenerable.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PIN_FILE="$REPO_ROOT/example/multi-tool.json"
LOCAL_CHECKOUT="/Users/asterisk/Codes/zuoyu/im-test-orchestrator"
CLONE_DIR="$REPO_ROOT/example/.im-test-orchestrator"

resolve_tool() {
  if [[ -n "${IMTO_PATH:-}" && -d "$IMTO_PATH/multi" ]]; then
    echo "$IMTO_PATH"
    return
  fi
  if [[ -d "$LOCAL_CHECKOUT/multi" ]]; then
    echo "$LOCAL_CHECKOUT"
    return
  fi
  if [[ -f "$PIN_FILE" ]]; then
    local url ref
    url="$(sed -n 's/.*"repo"[^"]*"\([^"]*\)".*/\1/p' "$PIN_FILE" | head -1)"
    ref="$(sed -n 's/.*"ref"[^"]*"\([^"]*\)".*/\1/p' "$PIN_FILE" | head -1)"
    if [[ "$url" == http* && -n "$ref" ]]; then
      git clone --depth 1 --branch "$ref" "$url" "$CLONE_DIR" >&2
      echo "$CLONE_DIR"
      return
    fi
  fi
  echo "error: im-test-orchestrator not found; set IMTO_PATH or fill in $PIN_FILE" >&2
  return 1
}

IMTO="$(resolve_tool)"
MULTI="$IMTO/multi"

command="${1:-}"
if [[ -z "$command" || "$command" == "-h" || "$command" == "--help" ]]; then
  sed -n '2,20p' "${BASH_SOURCE[0]}"
  exit 0
fi
shift

entry="bin/cli.dart"
args=()
if [[ "$command" == "generate" ]]; then
  entry="scripts/generate_cases.dart"
else
  args+=("$command")
fi

path_flags=(--cases-dir --app-dir --cases --data-input --build-result --target)
expect_path=0
has_cases_dir=0
has_app_dir=0
for arg in "$@"; do
  if [[ $expect_path -eq 1 && "$arg" != /* ]]; then
    arg="$REPO_ROOT/$arg"
  fi
  expect_path=0
  for flag in "${path_flags[@]}"; do
    if [[ "$arg" == "$flag" ]]; then
      expect_path=1
    fi
  done
  [[ "$arg" == "--cases-dir" ]] && has_cases_dir=1
  [[ "$arg" == "--app-dir" ]] && has_app_dir=1
  if [[ "$arg" == *.yaml && "$arg" != /* ]]; then
    arg="$REPO_ROOT/$arg"
  fi
  args+=("$arg")
done

if [[ "$command" == "generate" && $has_cases_dir -eq 0 ]]; then
  args+=(--cases-dir "$REPO_ROOT/example/multi_cases")
fi
# Only commands whose CLI accepts --app-dir get the default (build/all).
if [[ "$command" == "build" || "$command" == "all" ]] && [[ $has_app_dir -eq 0 ]]; then
  args+=(--app-dir "$REPO_ROOT/example")
fi

RUN_STAMP="${MULTI_RUN_STAMP:-$(date +%Y%m%d%H%M%S)}"

# Print the platform recorded in the run's process.json. A run normally uses
# one platform; mixed-platform runs are archived under "mixed".
run_platform() {
  local report_dir="$1"
  python3 - "$report_dir/process.json" <<'PY'
import json, sys
try:
    data = json.load(open(sys.argv[1], encoding='utf-8'))
except Exception:
    print('android'); raise SystemExit
platforms = set()
def walk(value):
    if isinstance(value, dict):
        platform = value.get('platform')
        if isinstance(platform, str) and platform:
            platforms.add(platform)
        for child in value.values():
            walk(child)
    elif isinstance(value, list):
        for child in value:
            walk(child)
walk(data.get('selection'))
if len(platforms) == 1:
    print(next(iter(platforms)))
elif len(platforms) > 1:
    print('mixed')
else:
    print('android')
PY
}

# Copy one finished run into the RN repository. Collection failures are
# warnings: they must not turn a passing test run into a failure.
collect_run() {
  local run_id="$1"
  local console_log="$2"
  [[ -n "$run_id" ]] || return 0
  local source_reports="$MULTI/reports/$run_id"
  [[ -d "$source_reports" ]] || {
    echo "multi collect: no reports for run $run_id" >&2
    return 0
  }
  local platform
  platform="$(run_platform "$source_reports")"
  local dest="$REPO_ROOT/artifacts/multi/$RUN_STAMP/$platform"
  mkdir -p "$dest/tmp"
  cp -R "$source_reports/." "$dest/"
  if [[ -d "$MULTI/tmp/$run_id" ]]; then
    cp -R "$MULTI/tmp/$run_id/." "$dest/tmp/"
  fi
  if [[ -n "$console_log" && -f "$console_log" ]]; then
    cp "$console_log" "$dest/console.log"
  fi
  printf '{"runId":"%s","platform":"%s","sourceReports":"%s","sourceTmp":"%s","collectedAt":"%s"}\n' \
    "$run_id" "$platform" "$source_reports" "$MULTI/tmp/$run_id" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    > "$dest/run-meta.json"
  echo "multi reports: $dest" >&2
}

run_and_collect() {
  local console_log status run_id=""
  console_log="$(mktemp "${TMPDIR:-/tmp}/rn-multi-console.XXXXXX")"
  set +e
  ( cd "$MULTI" && dart run "$entry" "${args[@]}" ) 2>&1 | tee "$console_log"
  status=${PIPESTATUS[0]}
  set -e
  run_id="$(sed -n 's/^runId=//p' "$console_log" | tail -1)"
  if [[ -z "$run_id" ]]; then
    for ((index = 0; index < ${#args[@]}; index++)); do
      if [[ "${args[$index]}" == "--run-id" && $((index + 1)) -lt ${#args[@]} ]]; then
        run_id="${args[$((index + 1))]}"
      fi
    done
  fi
  collect_run "$run_id" "$console_log"
  rm -f "$console_log"
  return "$status"
}

if [[ "$command" == "all" || "$command" == "run" || "$command" == "report" ]]; then
  run_and_collect
  exit $?
fi

cd "$MULTI"
exec dart run "$entry" "${args[@]}"
