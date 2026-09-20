#!/usr/bin/env node
// Fetch a fresh user token for the single-account nightly CI run. User tokens
// expire (server default ~24h), so they cannot be stored as GitHub secrets;
// each test job calls this script right before generating the API_CONFIG.
//
// Flow (same as scripts/env-gettoken.js): exchange clientId/clientSecret for
// an app token, then exchange it for a user token via grant_type=inherit
// (autoCreateUser=true, so the account is created on first use).
//
// Required environment:
//   E2E_REST_API      REST base URL of the cluster, e.g. http://host
//   E2E_APP_KEY       app key in orgName#appName form
//   E2E_CLIENT_ID     app client id
//   E2E_CLIENT_SECRET app client secret
//   E2E_USER_ID       account user id to fetch a token for
//
// Output contract: the user token is the ONLY stdout line (callers capture it
// with $(...)); diagnostics go to stderr. Exit code is non-zero on failure.
//
// Usage:
//   E2E_USER_TOKEN="$(node scripts/ci/fetch_e2e_user_token.js)"

const MAX_ATTEMPTS = 3;
const RETRY_INTERVAL_MS = 1000;
const REQUEST_TIMEOUT_MS = 15000;

function requireEnv(name) {
  const value = process.env[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`environment variable ${name} is not set`);
  }
  return value;
}

function parseAppKey(appKey) {
  const parts = appKey.split('#');
  if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
    throw new Error(`invalid E2E_APP_KEY (expect orgName#appName): ${appKey}`);
  }
  return { orgName: parts[0], appName: parts[1] };
}

async function postJson(url, body, bearerToken) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (bearerToken != null) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  if (res.status !== 200) {
    throw new Error(
      `HTTP ${res.status}: ${json.error ?? ''} ${json.error_description ?? ''}`.trim()
    );
  }
  if (typeof json.access_token !== 'string') {
    throw new Error('token response missing access_token');
  }
  return json.access_token;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUserTokenOnce(env) {
  const { orgName, appName } = parseAppKey(env.E2E_APP_KEY);
  const url = `${env.E2E_REST_API}/${orgName}/${appName}/token`;
  const appToken = await postJson(url, {
    grant_type: 'client_credentials',
    client_id: env.E2E_CLIENT_ID,
    client_secret: env.E2E_CLIENT_SECRET,
  });
  return postJson(
    url,
    {
      username: env.E2E_USER_ID,
      grant_type: 'inherit',
      autoCreateUser: true,
    },
    appToken
  );
}

async function main() {
  const env = {
    E2E_REST_API: requireEnv('E2E_REST_API'),
    E2E_APP_KEY: requireEnv('E2E_APP_KEY'),
    E2E_CLIENT_ID: requireEnv('E2E_CLIENT_ID'),
    E2E_CLIENT_SECRET: requireEnv('E2E_CLIENT_SECRET'),
    E2E_USER_ID: requireEnv('E2E_USER_ID'),
  };
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const token = await fetchUserTokenOnce(env);
      console.error(
        `fetch_e2e_user_token: got token for ${env.E2E_USER_ID} (attempt ${attempt})`
      );
      process.stdout.write(token + '\n');
      return;
    } catch (e) {
      lastError = e;
      console.error(
        `fetch_e2e_user_token: attempt ${attempt}/${MAX_ATTEMPTS} failed: ${e.message}`
      );
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_INTERVAL_MS);
      }
    }
  }
  throw lastError;
}

main().catch((e) => {
  console.error(`fetch_e2e_user_token: giving up: ${e.message}`);
  process.exitCode = 1;
});
