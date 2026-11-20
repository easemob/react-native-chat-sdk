/**
 * CI run configuration: types and loading of `ci_run.json`.
 *
 * The babel plugin (`example/babel-plugin-inline-api-env.js`) inlines
 * `process.env.CI_RUN` at bundle time with the *device path* of the run
 * file; the driver pushes the actual `ci_run.json` to that path before the
 * cold start, exactly like `API_SCRIPT` for auto mode. The app reads the
 * file at runtime via RNFS.
 *
 * Run file shape:
 * ```json
 * {
 *   "entry": "logged_in_base",
 *   "testNameRegex": "RN-AUTH-.*",
 *   "config": {
 *     "appKey": "org#app",
 *     "accounts": [{ "id": "ci_user", "token": "..." }],
 *     "loginToken": "...",
 *     "peerId": "ci_peer",
 *     "restApi": "https://...",
 *     "appToken": "..."
 *   }
 * }
 * ```
 *
 * `entry` selects one of the five stable entries; `testNameRegex` is the
 * optional runtime case filter. Credential fields (`accounts`,
 * `loginToken`) may be omitted for the `logged_out` entry, which needs no
 * account; `restApi` / `appToken` are only required by entries that use
 * the REST fixture.
 */

import RNFS from 'react-native-fs';

const CI_RUN: string | undefined = process.env.CI_RUN;

export type CiEntryName =
  | 'logged_out'
  | 'logged_in_base'
  | 'logged_in_group'
  | 'logged_in_contact'
  | 'logged_in_user_info';

export const CI_ENTRY_NAMES: readonly CiEntryName[] = [
  'logged_out',
  'logged_in_base',
  'logged_in_group',
  'logged_in_contact',
  'logged_in_user_info',
];

export interface CiAccount {
  id: string;
  token?: string;
}

export interface CiConfig {
  appKey: string;
  accounts?: CiAccount[];
  loginToken?: string;
  peerId?: string;
  restApi?: string;
  appToken?: string;
}

export interface CiRun {
  entry: CiEntryName;
  testNameRegex?: string;
  config: CiConfig;
}

/**
 * Returns the inlined device path of the run file, or `undefined` when the
 * bundle was not built for CI mode.
 */
export function getCiRunPath(): string | undefined {
  return typeof CI_RUN === 'string' && CI_RUN.length > 0 ? CI_RUN : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function validateAccount(raw: unknown, index: number): CiAccount {
  if (!isRecord(raw) || typeof raw.id !== 'string' || raw.id.length === 0) {
    throw new Error(`ci_run.json: config.accounts[${index}] needs an id`);
  }
  return { id: raw.id, token: optionalString(raw.token) };
}

function validateConfig(raw: unknown): CiConfig {
  if (!isRecord(raw)) {
    throw new Error('ci_run.json: config must be an object');
  }
  const appKey = optionalString(raw.appKey);
  if (appKey == null) {
    throw new Error('ci_run.json: config.appKey is required');
  }
  let accounts: CiAccount[] | undefined;
  if (raw.accounts != null) {
    if (!Array.isArray(raw.accounts)) {
      throw new Error('ci_run.json: config.accounts must be an array');
    }
    accounts = raw.accounts.map(validateAccount);
  }
  return {
    appKey,
    accounts,
    loginToken: optionalString(raw.loginToken),
    peerId: optionalString(raw.peerId),
    restApi: optionalString(raw.restApi),
    appToken: optionalString(raw.appToken),
  };
}

function validateCiRun(raw: unknown): CiRun {
  if (!isRecord(raw)) {
    throw new Error('ci_run.json: root must be an object');
  }
  const entry = optionalString(raw.entry);
  if (entry == null || !CI_ENTRY_NAMES.includes(entry as CiEntryName)) {
    throw new Error(
      `ci_run.json: entry must be one of ${CI_ENTRY_NAMES.join(', ')}`
    );
  }
  return {
    entry: entry as CiEntryName,
    testNameRegex: optionalString(raw.testNameRegex),
    config: validateConfig(raw.config),
  };
}

/**
 * Reads and validates `ci_run.json` from the device. `path` defaults to the
 * inlined `CI_RUN` path; callers pass an explicit path only in tests.
 */
export async function loadCiRun(path?: string): Promise<CiRun> {
  const target = path ?? getCiRunPath();
  if (target == null) {
    throw new Error('CI_RUN is not inlined; the app was not built for CI mode');
  }
  const text = await RNFS.readFile(target, 'utf8');
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new Error(
      `ci_run.json at ${target} is not valid JSON: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }
  return validateCiRun(raw);
}
