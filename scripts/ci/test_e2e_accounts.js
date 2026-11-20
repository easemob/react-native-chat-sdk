#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const vm = require('node:vm');
const { AbortSignal } = global;

const TOKEN_SOURCE = fs.readFileSync(
  path.join(__dirname, 'fetch_e2e_user_token.js'),
  'utf8'
);
const CREDENTIALS = {
  E2E_APP_KEY: 'test-org#test-app',
  E2E_REST_API: 'https://unused.invalid',
  E2E_CLIENT_ID: 'fixture-client',
  E2E_CLIENT_SECRET: 'fixture-secret',
  E2E_USER_ID: 'ci_user',
};
const LOCAL_CONFIG = {
  appKey: 'local-org#local-app',
  restApi: 'https://local.invalid',
  clientId: 'local-client',
  clientSecret: 'local-secret',
  accounts: [{ id: 'local_user' }],
};

async function runToken(args, env) {
  const requests = [];
  let stdout = '';
  const processStub = {
    argv: ['node', 'fetch_e2e_user_token.js', ...args],
    env: { ...CREDENTIALS, ...env },
    stdout: { write: (value) => (stdout += value) },
  };
  await vm.runInNewContext(TOKEN_SOURCE, {
    process: processStub,
    console: { error() {} },
    AbortSignal,
    setTimeout,
    fetch: async (_url, options) => {
      requests.push(JSON.parse(options.body));
      return {
        status: 200,
        text: async () => JSON.stringify({ access_token: 'fixture-token' }),
      };
    },
  });
  assert.equal(processStub.exitCode, undefined);
  assert.equal(stdout, 'fixture-token\n', 'stdout must contain only the token');
  return requests;
}

test('token helper derives the default user and preserves explicit complete IDs', async () => {
  for (const suffix of [undefined, '', '_rn_android', '_rn_ios']) {
    const requests = await runToken([], { E2E_USER_SUFFIX: suffix });
    assert.equal(requests[1].username, `ci_user${suffix ?? ''}`);
    assert.equal(requests[1].autoCreateUser, true);
  }
  const requests = await runToken(['--user-id', 'ci_user_rn_ios_ci_peer'], {
    E2E_USER_ID: undefined,
    E2E_USER_SUFFIX: '_rn_ios',
  });
  assert.equal(requests[1].username, 'ci_user_rn_ios_ci_peer');
});

test('app-token mode needs no user ID even when a suffix is configured', async () => {
  const requests = await runToken(['--app'], {
    E2E_USER_ID: undefined,
    E2E_USER_SUFFIX: '_rn_android',
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].grant_type, 'client_credentials');
});

test('workflow assigns an SDK/platform suffix to each logged-in lane', () => {
  const workflow = fs.readFileSync(
    path.join(__dirname, '../../.github/workflows/ci-device.yml'),
    'utf8'
  );
  const jobs = workflow.split(/^ {2}(?=[a-z][\w-]*:)/m);
  for (const platform of ['android', 'ios']) {
    const job = jobs.find((section) =>
      section.startsWith(`${platform}-test-logged-in:\n`)
    );
    assert.ok(job, `expected ${platform} logged-in job`);
    assert.match(
      job,
      new RegExp(`^\\s+E2E_USER_SUFFIX: _rn_${platform}$`, 'm')
    );
  }
});

const FETCH_PRELOAD = `
const fs = require('node:fs');
globalThis.fetch = async (url, options) => {
  const body = JSON.parse(options.body);
  const request = { url, body, headers: options.headers };
  fs.appendFileSync(process.env.ACCOUNT_TEST_REQUESTS, JSON.stringify(request) + '\\n');
  const token = body.username ? 'token:' + body.username : 'app-token';
  return { status: 200, text: async () => JSON.stringify({ access_token: token }) };
};
`;
const DEVICE_DRIVER = `#!/usr/bin/env bash
set -euo pipefail
node -e '
  const fs = require("node:fs");
  const run = JSON.parse(fs.readFileSync(process.env.SCRIPT_JSON, "utf8"));
  fs.appendFileSync(process.env.ACCOUNT_TEST_RUNS, JSON.stringify(run) + "\\n");
'
`;

function readJsonLines(file) {
  return fs.existsSync(file)
    ? fs.readFileSync(file, 'utf8').trim().split('\n').map(JSON.parse)
    : [];
}

function runEntry(t, options = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-e2e-accounts-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const scripts = path.join(dir, 'scripts/ci');
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(scripts, { recursive: true });
  fs.mkdirSync(bin);
  let source = fs.readFileSync(
    path.join(__dirname, 'ci_test_local.sh'),
    'utf8'
  );
  const stagingPath = 'DEVICE_CI_RUN_PATH="/tmp/rn_ci_run.json"';
  assert.ok(source.includes(stagingPath), 'expected the iOS host staging path');
  source = source.replace(
    stagingPath,
    `DEVICE_CI_RUN_PATH="${dir}/device_ci_run.json"`
  );
  fs.writeFileSync(path.join(scripts, 'ci_test_local.sh'), source);
  fs.writeFileSync(path.join(scripts, 'fetch_e2e_user_token.js'), TOKEN_SOURCE);
  for (const platform of ['android', 'ios']) {
    const selector =
      platform === 'android'
        ? 'select_android_device.sh'
        : 'select_ios_simulator.sh';
    fs.writeFileSync(
      path.join(scripts, selector),
      "printf 'fixture-device\\n'\n"
    );
    fs.writeFileSync(
      path.join(scripts, `run_ci_${platform}.sh`),
      DEVICE_DRIVER
    );
  }
  for (const command of ['adb', 'xcrun']) {
    fs.writeFileSync(path.join(bin, command), '#!/bin/sh\nexit 0\n', {
      mode: 0o755,
    });
  }
  const preload = path.join(dir, 'fetch-preload.js');
  fs.writeFileSync(preload, FETCH_PRELOAD);
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith('E2E_') ||
      key.startsWith('CI_') ||
      key === 'NODE_OPTIONS'
    ) {
      delete env[key];
    }
  }
  Object.assign(env, CREDENTIALS, {
    PATH: `${bin}${path.delimiter}${path.dirname(process.execPath)}${path.delimiter}/usr/bin${path.delimiter}/bin`,
    TMPDIR: dir,
    NODE_OPTIONS: `--require=${preload}`,
    CI_SKIP_BUILD: '1',
    CI_RUN_ID: 'fixture-run',
    ACCOUNT_TEST_REQUESTS: path.join(dir, 'requests.jsonl'),
    ACCOUNT_TEST_RUNS: path.join(dir, 'runs.jsonl'),
    ...options.env,
  });
  if (options.localConfig) {
    fs.mkdirSync(path.join(dir, 'example'));
    fs.writeFileSync(
      path.join(dir, 'example/config.local.json'),
      JSON.stringify(LOCAL_CONFIG)
    );
    delete env.E2E_CLIENT_SECRET;
  }
  const result = spawnSync(
    'bash',
    [
      path.join(scripts, 'ci_test_local.sh'),
      options.platform ?? 'android',
      options.entries ?? 'logged_in_contact',
    ],
    { cwd: dir, env, encoding: 'utf8', timeout: 30000 }
  );
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return {
    requests: readJsonLines(env.ACCOUNT_TEST_REQUESTS),
    runs: readJsonLines(env.ACCOUNT_TEST_RUNS),
  };
}

for (const platform of ['android', 'ios']) {
  test(`${platform} entry uses matching derived account, token and peer across all suites`, (t) => {
    const userId = `ci_user_rn_${platform}`;
    const { requests, runs } = runEntry(t, {
      platform,
      entries:
        'logged_in_base,logged_in_group,logged_in_contact,logged_in_user_info',
      env: { E2E_USER_SUFFIX: `_rn_${platform}` },
    });
    assert.deepEqual(
      requests
        .filter((request) => request.body.username)
        .map((request) => request.body.username),
      [userId, `${userId}_ci_peer`]
    );
    assert.equal(runs.length, 4);
    for (const { config } of runs) {
      assert.deepEqual(config.accounts, [
        { id: userId, token: `token:${userId}` },
      ]);
      assert.equal(config.loginToken, `token:${userId}`);
      assert.equal(config.peerId, `${userId}_ci_peer`);
    }
  });
}

test('entry without a suffix retains the original account and peer', (t) => {
  const { runs } = runEntry(t);
  assert.equal(runs[0].config.accounts[0].id, 'ci_user');
  assert.equal(runs[0].config.loginToken, 'token:ci_user');
  assert.equal(runs[0].config.peerId, 'ci_user_ci_peer');
});

test('explicit peer is provisioned and configured without an extra suffix', (t) => {
  const { requests, runs } = runEntry(t, {
    env: { E2E_USER_SUFFIX: '_rn_android', E2E_PEER_ID: 'custom_peer' },
  });
  assert.equal(requests.at(-1).body.username, 'custom_peer');
  assert.equal(runs[0].config.peerId, 'custom_peer');
  assert.equal(runs[0].config.accounts[0].id, 'ci_user_rn_android');
});

test('local config fallback derives from its account and keeps the configured suffix', (t) => {
  const { requests, runs } = runEntry(t, {
    localConfig: true,
    env: { E2E_USER_SUFFIX: '_rn_ios' },
  });
  assert.equal(requests[2].body.username, 'local_user_rn_ios');
  for (const { url, body, headers } of requests) {
    assert.equal(url, 'https://local.invalid/local-org/local-app/token');
    if (body.grant_type === 'client_credentials') {
      assert.equal(body.client_id, LOCAL_CONFIG.clientId);
      assert.equal(body.client_secret, LOCAL_CONFIG.clientSecret);
      assert.equal(headers.Authorization, undefined);
    } else {
      assert.equal(headers.Authorization, 'Bearer app-token');
    }
  }
  assert.equal(runs[0].config.appKey, LOCAL_CONFIG.appKey);
  assert.equal(runs[0].config.restApi, LOCAL_CONFIG.restApi);
  assert.equal(runs[0].config.accounts[0].id, 'local_user_rn_ios');
  assert.equal(runs[0].config.loginToken, 'token:local_user_rn_ios');
  assert.equal(runs[0].config.peerId, 'local_user_rn_ios_ci_peer');
});

test('logged_out entry fetches no tokens even when a suffix is present', (t) => {
  const { requests, runs } = runEntry(t, {
    entries: 'logged_out',
    env: { E2E_USER_SUFFIX: '_rn_android', E2E_USER_ID: '' },
  });
  assert.deepEqual(requests, []);
  assert.deepEqual(runs[0].config, { appKey: CREDENTIALS.E2E_APP_KEY });
});
