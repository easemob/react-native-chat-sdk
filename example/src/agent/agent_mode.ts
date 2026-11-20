/**
 * Agent (listening) mode entry — the RN reverse-channel agent for
 * im-test-orchestrator, the third mutually exclusive run mode next to auto
 * mode (`API_SCRIPT`) and CI mode (`CI_RUN`).
 *
 * Build flag: `EASEMOB_AGENT=<device path of agent_control.json>` inlined at
 * bundle time (same babel inline mechanism as `CI_RUN`; non-empty enables,
 * default off) and Debug builds only (`__DEV__`). Before the cold start the
 * host pushes `{"port": <int>, "token": <string>}` to that path (Android:
 * `/data/local/tmp/rn_agent_control.json`) and runs
 * `adb reverse tcp:<port> tcp:<port>`; iOS simulators reach the host over
 * loopback directly.
 *
 * On startup the agent reads the config, generates its own instanceId, and
 * prints the pairing line `[AGENT_CONTROL] {"port":...,"token":...,
 * "instanceId":...}` via plain console.log (ReactNativeJS -> logcat/os_log) —
 * never through `[APITEST]` or the evidence stream (contract §6.1).
 *
 * Mounting note: App.tsx wiring (`if (isAgentMode()) runAgentMode()` next to
 * CiModeRunner) and adding EASEMOB_AGENT to babel-plugin-inline-api-env.js
 * are part of the target-config follow-up (plan Task 10/11); this directory
 * is intentionally self-contained.
 */

import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import {
  ChatClient,
  ChatGroupOptions,
  ChatMessage,
  ChatOptions,
  ChatTextMessageBody,
  type ChatMessageChatType,
} from 'react-native-chat-sdk';
import { addLog } from '../log/log_store';
import { EvidenceStore } from './evidence_store';
import {
  AgentCommandError,
  CommandService,
  type CommandRecord,
} from './command_service';
import { createApiRegistry, createInitHandler } from './registry';
import { createAgentListenerRegistrar } from './listeners';
import { ReverseTransport, sleep } from './transport';
import type { ResultEnvelope } from './types';

const AGENT_FLAG: string | undefined = process.env.EASEMOB_AGENT;
const CI_RUN: string | undefined = process.env.CI_RUN;
const API_SCRIPT: string | undefined = process.env.API_SCRIPT;

/**
 * Agent mode is enabled solely by the build-time inlined control-flag path:
 * the flag is injected only into orchestrator-driven debug builds, never into
 * release/CI bundles, so its presence is the gate. (`__DEV__` is not required:
 * headless device bundles built with `-PbundleInDebug=true` run with
 * `__DEV__ === false`.)
 */
export function isAgentMode(): boolean {
  return typeof AGENT_FLAG === 'string' && AGENT_FLAG.length > 0;
}

interface AgentControlConfig {
  port: number;
  token: string;
}

async function loadControlConfig(path: string): Promise<AgentControlConfig> {
  const raw = await RNFS.readFile(path, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('agent_control.json must be a JSON object');
  }
  const p = parsed as Record<string, unknown>;
  if (typeof p.port !== 'number' || typeof p.token !== 'string') {
    throw new Error('agent_control.json needs numeric port and string token');
  }
  return { port: p.port, token: p.token };
}

function generateInstanceId(): string {
  // 16 hex chars: launch timestamp + random suffix (no crypto dependency).
  const ts = Date.now().toString(16).padStart(12, '0');
  const rand = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, '0');
  return (ts + rand).slice(-16);
}

/** Exponential-ish backoff for transport retries: 500ms doubling to 5s. */
function backoffDelay(attempt: number): number {
  return Math.min(500 * 2 ** attempt, 5000);
}

/**
 * Runs the agent: command poll loop + evidence flush loop. Never resolves on
 * its own before finish/close; never throws (diagnostics go to addLog).
 */
export async function runAgentMode(): Promise<void> {
  if (!isAgentMode()) {
    return;
  }
  if (
    (typeof CI_RUN === 'string' && CI_RUN.length > 0) ||
    (typeof API_SCRIPT === 'string' && API_SCRIPT.length > 0)
  ) {
    addLog('agent.run.error', {
      message:
        'build configuration conflict: EASEMOB_AGENT is inlined together ' +
        'with CI_RUN or API_SCRIPT; the automation modes are mutually exclusive',
    });
    return;
  }

  let config: AgentControlConfig;
  try {
    config = await loadControlConfig(AGENT_FLAG as string);
  } catch (e) {
    addLog('agent.run.error', {
      message: `failed to load agent_control.json: ${e instanceof Error ? e.message : String(e)}`,
    });
    return;
  }

  const instanceId = generateInstanceId();
  // Pairing line: plain console.log only, never [APITEST]/evidence (§6.1).
  console.log(
    `[AGENT_CONTROL] ${JSON.stringify({
      port: config.port,
      token: config.token,
      instanceId,
    })}`
  );

  const evidence = new EvidenceStore();
  const emit = (source: string, payload: unknown): void => {
    evidence.append(source, payload);
  };
  const client = ChatClient.getInstance();
  const registerListeners = createAgentListenerRegistrar(emit);
  const sdkDeps = {
    client,
    optionsWithAppKey: (p: Record<string, unknown>) =>
      ChatOptions.withAppKey(p as Parameters<typeof ChatOptions.withAppKey>[0]),
    optionsWithAppId: (p: Record<string, unknown>) =>
      ChatOptions.withAppId(p as Parameters<typeof ChatOptions.withAppId>[0]),
    createGroupOptions: (p: Record<string, unknown>) =>
      new ChatGroupOptions(
        p as ConstructorParameters<typeof ChatGroupOptions>[0]
      ),
    createTextMessage: (
      targetId: string,
      content: string,
      chatType: number,
      opt?: Record<string, unknown>
    ) =>
      ChatMessage.createTextMessage(
        targetId,
        content,
        chatType as ChatMessageChatType,
        opt as Parameters<typeof ChatMessage.createTextMessage>[3]
      ),
    createTextBody: (content: string) => new ChatTextMessageBody({ content }),
  };
  const registry = createApiRegistry(sdkDeps);
  const service = new CommandService({
    executeApi: (api, params) => {
      const handler = registry.get(api);
      if (handler === undefined) {
        return Promise.resolve({
          success: false as const,
          failureKind: 'tool' as const,
          error: { code: -1, message: `unregistered api: ${api}` },
        });
      }
      return handler(params);
    },
    initHandler: createInitHandler(sdkDeps, registerListeners),
    isRegistered: (api) => registry.has(api),
    evidence,
    instanceId,
  });

  const transport = new ReverseTransport({
    baseUrl: `http://127.0.0.1:${config.port}`,
    token: config.token,
    instanceId,
    platform: Platform.OS,
  });

  let stopped = false;
  let lastReportedSeq = 0;
  let attempt = 0;

  /** POST with retry; returns false when the host closed the run. */
  const postWithRetry = async (
    post: () => Promise<'ok' | 'closed' | 'retry'>
  ): Promise<boolean> => {
    for (;;) {
      if (stopped) {
        return false;
      }
      const outcome = await post();
      if (outcome === 'ok') {
        attempt = 0;
        return true;
      }
      if (outcome === 'closed') {
        stopped = true;
        return false;
      }
      await sleep(backoffDelay(attempt++));
    }
  };

  const flushEvents = async (): Promise<void> => {
    const batch = evidence.queryBatch(lastReportedSeq);
    if (batch.length === 0) {
      return;
    }
    const last = batch[batch.length - 1];
    if (last === undefined) {
      return;
    }
    const ok = await postWithRetry(() =>
      transport.postEvents({
        firstAvailableSeq: evidence.firstAvailableSeq,
        lastSeq: evidence.lastSeq,
        degraded: evidence.degraded,
        events: batch.map(({ seq, source, payload }) => ({
          seq,
          source,
          payload,
        })),
      })
    );
    if (ok) {
      lastReportedSeq = last.seq;
    }
  };

  // Evidence flush loop: coalesce into batches every 100ms.
  const flushLoop = (async () => {
    while (!stopped) {
      await flushEvents();
      await sleep(100);
    }
  })();

  const postResult = async (envelope: ResultEnvelope): Promise<void> => {
    await postWithRetry(() => transport.postResult(envelope));
  };

  const handleCommand = async (
    command: Record<string, unknown>
  ): Promise<void> => {
    let record: CommandRecord;
    try {
      record = service.submit(command);
    } catch (e) {
      if (e instanceof AgentCommandError) {
        // Rejections keep inbound semantics but travel as result envelopes
        // on the reverse channel (contract §8).
        await postResult(CommandService.rejectionEnvelope(command, e));
      } else {
        await postResult({
          commandId:
            typeof command.commandId === 'string' ? command.commandId : '',
          status: 'done',
          success: false,
          failureKind: 'tool',
          error: {
            code: -1,
            message: e instanceof Error ? e.message : String(e),
          },
        });
      }
      return;
    }
    const terminal = await service.awaitTerminal(record);
    if (terminal.result !== undefined && !terminal.posted) {
      await postResult(terminal.result);
      terminal.posted = true;
    }
  };

  // Command poll loop: only poll while idle; the host sends one command per
  // agent at a time and the single-in-flight rule is enforced in the service.
  while (!stopped && service.state !== 'closed') {
    if (service.busy) {
      await sleep(100);
      continue;
    }
    const poll = await transport.pollQueue(service.state);
    switch (poll.kind) {
      case 'command':
        await handleCommand(poll.command);
        break;
      case 'finish':
        // Contract §7: finish while busy is a 409; the poll loop is idle-only
        // here, so close, push out the remaining evidence, then stop.
        service.finish();
        break;
      case 'closed':
        stopped = true;
        break;
      case 'empty':
        attempt = 0;
        break;
      case 'retry':
        await sleep(backoffDelay(attempt++));
        break;
    }
    if (poll.kind === 'finish') {
      break;
    }
  }

  // Final evidence drain after finish (best effort, bounded).
  for (let i = 0; i < 50 && !stopped; i++) {
    if (lastReportedSeq >= evidence.lastSeq) {
      break;
    }
    await flushEvents();
    await sleep(100);
  }
  stopped = true;
  await flushLoop;
  addLog('agent.run.closed', { instanceId, state: service.state });
}
