#!/usr/bin/env bash
# Generate the single-account auto-mode config (API_CONFIG) from the E2E_*
# environment variables. The config carries the appKey and the account that
# example/ci/single_account.json references via `$config.*`; the output
# contains real credentials, so it is written with mode 0600 and must be
# deleted after the run (the workflow and nightly_local.sh both do this).
# Never commit the generated file.
#
# Required environment:
#   E2E_APP_KEY       app key used for ChatClient.init
#   E2E_USER_ID       account user id used for login
#   E2E_USER_PASSWORD account password used for login
#
# Usage:
#   E2E_APP_KEY=... E2E_USER_ID=... E2E_USER_PASSWORD=... \
#     bash scripts/ci/write_single_account_config.sh <output-path>
set -euo pipefail

OUT="${1:-}"

[ -n "$OUT" ] || {
  echo "usage: write_single_account_config.sh <output-path>" >&2
  exit 2
}

for var in E2E_APP_KEY E2E_USER_ID E2E_USER_PASSWORD; do
  if [ -z "${!var:-}" ]; then
    echo "error: environment variable $var is not set" >&2
    exit 2
  fi
done

# Shape mirrors example/src/env.ts (appKey as array, accounts as [{id, mm}]),
# which auto_mode.ts derives the init/login params from when the script has no
# explicit init/login sections.
OUT="$OUT" node -e '
const fs = require("fs");
const config = {
  appKey: [process.env.E2E_APP_KEY],
  accounts: [{ id: process.env.E2E_USER_ID, mm: process.env.E2E_USER_PASSWORD }],
};
fs.writeFileSync(process.env.OUT, JSON.stringify(config, null, 2) + "\n", {
  mode: 0o600,
});
'
chmod 600 "$OUT"
echo "write_single_account_config: wrote $OUT (mode 0600)"
