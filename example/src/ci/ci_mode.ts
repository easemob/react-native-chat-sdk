/**
 * CI device-test mode.
 *
 * Building with `CI_RUN=<device path of ci_run.json>` inlined puts the app
 * into CI mode, fully parallel to auto mode (`API_SCRIPT`): the driver
 * pushes the run file before the cold start, the app reads it at runtime,
 * loads the selected entry module, and runs the registered suites through
 * the harness. All records go to the `[APITEST]` channel via the injected
 * `addLog`, so the existing device drivers work unchanged.
 *
 * The three modes are mutually exclusive: `CI_RUN` inlined -> CI mode,
 * `API_SCRIPT` inlined -> auto mode, neither -> manual mode. `CI_RUN` and
 * `API_SCRIPT` inlined together is a build configuration error: startup
 * reports it and emits `script.done` with a failure immediately, without
 * running anything else (fail-fast, no silent precedence).
 *
 * Entry loading contract: every module in `entries/` exports
 * `registerEntry(ctx: CiCaseContext): void`, which only registers suites
 * and cases with the harness; `runCiSuites` executes them. The five
 * registrars are imported statically (Metro cannot bundle dynamic
 * imports); the `ci_run.json` `entry` field only selects which registrar
 * runs in this cold start.
 */

import { ChatClient } from 'react-native-chat-sdk';
import { addLog } from '../log/log_store';
import { loadCiRun, type CiConfig, type CiEntryName } from './config';
import { runCiSuites, type CiCaseContext, type CiRunSummary } from './harness';
import { CiRestFixture } from './support/rest_fixture';
import { registerEntry as registerLoggedOut } from './entries/logged_out';
import { registerEntry as registerLoggedInBase } from './entries/logged_in_base';
import { registerEntry as registerLoggedInGroup } from './entries/logged_in_group';
import { registerEntry as registerLoggedInContact } from './entries/logged_in_contact';
import { registerEntry as registerLoggedInUserInfo } from './entries/logged_in_user_info';

const CI_RUN: string | undefined = process.env.CI_RUN;
const API_SCRIPT: string | undefined = process.env.API_SCRIPT;

/**
 * Placeholders keep the uniform `CiCaseContext.rest` shape for entries whose
 * run file omits REST credentials (`logged_out` needs none). A case that
 * still calls REST then fails loudly on the network instead of failing
 * fixture construction for the whole entry.
 */
const REST_PLACEHOLDER_URL = 'http://ci-rest-unconfigured.invalid';
const REST_PLACEHOLDER_TOKEN = 'ci-rest-unconfigured';

export function isCiMode(): boolean {
  return typeof CI_RUN === 'string' && CI_RUN.length > 0;
}

function isAutoModeInlined(): boolean {
  return typeof API_SCRIPT === 'string' && API_SCRIPT.length > 0;
}

type CiEntryRegistrar = (ctx: CiCaseContext) => void;

const ENTRY_REGISTRARS: Record<CiEntryName, CiEntryRegistrar> = {
  logged_out: registerLoggedOut,
  logged_in_base: registerLoggedInBase,
  logged_in_group: registerLoggedInGroup,
  logged_in_contact: registerLoggedInContact,
  logged_in_user_info: registerLoggedInUserInfo,
};

function buildContext(config: CiConfig): CiCaseContext {
  return {
    client: ChatClient.getInstance(),
    config,
    rest: new CiRestFixture({
      restApi: config.restApi ?? REST_PLACEHOLDER_URL,
      appKey: config.appKey,
      appToken: config.appToken ?? REST_PLACEHOLDER_TOKEN,
    }),
  };
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Runs the CI entry selected by `ci_run.json`. Never throws: any failure is
 * reported on `[APITEST]` and a final `script.done` with `failed >= 1` is
 * always emitted so drivers terminate instead of waiting for the watchdog.
 */
export async function runCiMode(): Promise<void> {
  if (!isCiMode()) {
    return;
  }

  // Fail-fast on the build configuration conflict; nothing else runs.
  if (isAutoModeInlined()) {
    addLog('ci.run.error', {
      message:
        'build configuration conflict: CI_RUN and API_SCRIPT are both ' +
        'inlined; CI mode and auto mode are mutually exclusive',
    });
    addLog('script.done', { total: 1, failed: 1 });
    return;
  }

  addLog('ci.run.start', { path: CI_RUN });
  let summary: CiRunSummary | null = null;
  try {
    const ciRun = await loadCiRun();
    const ctx = buildContext(ciRun.config);
    ENTRY_REGISTRARS[ciRun.entry](ctx);
    summary = await runCiSuites({
      ctx,
      entry: ciRun.entry,
      testNameRegex: ciRun.testNameRegex,
      log: addLog,
    });
  } catch (e) {
    addLog('ci.run.error', { message: errorMessage(e) });
    addLog('script.done', { total: 1, failed: 1 });
    return;
  }
  addLog('ci.run.finished', summary);
}
