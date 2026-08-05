import RNFS from 'react-native-fs';
import { ChatClient, ChatOptions } from 'react-native-chat-sdk';
import * as envData from '../env';
import { addLog } from '../log/log_store';
import { registerAllListeners } from '../listeners';
import { findApi } from '../registry';
import { errResult, okResult, type ApiResult } from '../result';
import { navigateReplace } from '../navigation';

/**
 * AI 自动化脚本模式。
 *
 * 打包期传入 `API_SCRIPT=<脚本绝对路径>` 即进入自动模式：
 * 跳过初始化页/登录页交互，自动执行 init → login → 串行 steps，
 * 全部结果走 `[APITEST]` 结构化日志通道。未传时人工模式行为完全不变。
 *
 * `process.env.API_SCRIPT` / `process.env.API_CONFIG` 由 example/babel.config.js
 * 中的自定义 babel 插件在打包时内联（@react-native/babel-preset 0.83 不再内置
 * inline-environment-variables）。未传时内联为 `undefined`，即人工模式。
 *
 * 数据源：默认取打包进来的 `src/env.ts`（scripts/generate-env.js 生成，
 * 与人工模式同一份数据）；打包期传入 `API_CONFIG=<json 路径>` 可整体覆盖。
 *
 * 脚本格式：
 * ```json
 * {
 *   "init":  { "appKey": "..." },                  // 可选，缺省由 env.ts 推导
 *   "login": { "userId": "...", "password": "..." }, // 可选，缺省由 env.ts 推导
 *   "steps": [
 *     { "api": "ChatManager.sendMessage", "id": "m1",
 *       "params": { "targetId": "$config.accounts.0.id", "content": "$prev.body.content" },
 *       "timeoutMs": 30000, "delayAfterMs": 1000 }
 *   ]
 * }
 * ```
 * `$config.*` 解析到 env.ts 的导出值，数组用数字路径段（如 `$config.accounts.0.id`）。
 */

const API_SCRIPT: string | undefined = process.env.API_SCRIPT;
const API_CONFIG: string | undefined = process.env.API_CONFIG;

const DEFAULT_TIMEOUT_MS = 30000;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_RETRY_INTERVAL_MS = 1000;

interface ScriptStep {
  api: string;
  id?: string;
  params?: Record<string, unknown>;
  timeoutMs?: number;
  delayAfterMs?: number;
}

interface Script {
  init?: Record<string, unknown>;
  login?: { userId?: string; password?: string; token?: string };
  steps?: ScriptStep[];
}

export interface AutoModeHooks {
  markInitialized: (optionsJson: string) => void;
  markLoggedIn: (userId: string) => void;
}

export function isAutoMode(): boolean {
  return typeof API_SCRIPT === 'string' && API_SCRIPT.length > 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(p: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      // native 在某些状态下可能永不回调，超时记 code -2 并继续
      reject(
        Object.assign(new Error(`timeout after ${timeoutMs}ms`), { code: -2 })
      );
    }, timeoutMs);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

function getPath(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur == null) {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

interface RefContext {
  config: Record<string, unknown>;
  prev: unknown;
  stepData: Map<string, unknown>;
}

/** 数组取首元素（env.ts 中 appKey/appId/accounts 等均为数组形态） */
function first(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * 字符串引用解析（恰好整个字符串匹配才替换，保留原值类型）：
 * - `$config.key` / `$config.key.0.sub`：取 env.ts 导出值（或 API_CONFIG 覆盖值）
 * - `$prev` / `$prev.a.b`：上一步返回的 data
 * - `$step.id` / `$step.id.a.b`：某个带 id 的 step 的 data
 */
function resolveValue(value: unknown, ctx: RefContext): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => resolveValue(v, ctx));
  }
  if (value != null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveValue(v, ctx);
    }
    return out;
  }
  if (typeof value !== 'string' || !value.startsWith('$')) {
    return value;
  }
  if (value === '$prev') {
    return ctx.prev;
  }
  if (value.startsWith('$prev.')) {
    return getPath(ctx.prev, value.slice('$prev.'.length).split('.'));
  }
  if (value.startsWith('$config.')) {
    return getPath(ctx.config, value.slice('$config.'.length).split('.'));
  }
  if (value.startsWith('$step.')) {
    const rest = value.slice('$step.'.length).split('.');
    const id = rest.shift();
    if (id == null) {
      return value;
    }
    const data = ctx.stepData.get(id);
    return rest.length === 0 ? data : getPath(data, rest);
  }
  return value;
}

/** ChatOptions 构造参数键（config 推导 init 用） */
const CHAT_OPTIONS_KEYS = [
  'appKey',
  'appId',
  'autoLogin',
  'debugModel',
  'acceptInvitationAlways',
  'autoAcceptGroupInvitation',
  'requireAck',
  'requireDeliveryAck',
  'deleteMessagesAsExitGroup',
  'deleteMessagesAsExitChatRoom',
  'isChatRoomOwnerLeaveAllowed',
  'sortMessageByServerTime',
  'usingHttpsOnly',
  'serverTransfer',
  'isAutoDownload',
  'pushConfig',
  'areaCode',
  'logTag',
  'logTimestamp',
  'enableEmptyConversation',
  'customDeviceName',
  'customOSType',
  'enableDNSConfig',
  'dnsUrl',
  'restServer',
  'imServer',
  'imPort',
  'enableTLS',
  'messagesReceiveCallbackIncludeSend',
  'regardImportMessagesAsRead',
  'useReplacedMessageContents',
  'loginExtraInfo',
  'workPathCopiable',
  'uikitVersion',
  'webSocketServer',
  'webSocketPort',
  'dohVendor',
];

function deriveInitParams(
  script: Script,
  config: Record<string, unknown>
): Record<string, unknown> | null {
  if (script.init != null) {
    return script.init;
  }
  const picked: Record<string, unknown> = {};
  for (const key of CHAT_OPTIONS_KEYS) {
    if (config[key] !== undefined) {
      picked[key] = config[key];
    }
  }
  // env.ts 中 appKey/appId 是数组形态，取首元素；空串视为未配置
  for (const key of ['appKey', 'appId'] as const) {
    const v = first(picked[key]);
    if (typeof v === 'string' && v.length > 0) {
      picked[key] = v;
    } else {
      delete picked[key];
    }
  }
  return picked.appKey != null || picked.appId != null ? picked : null;
}

function deriveLoginParams(
  script: Script,
  config: Record<string, unknown>
): { userId: string; password?: string; token?: string } | null {
  if (script.login != null && script.login.userId != null) {
    return {
      userId: String(script.login.userId),
      password: script.login.password,
      token: script.login.token,
    };
  }
  const account = first(config.accounts) as { id?: unknown; mm?: unknown };
  const userId = config.loginUser ?? account?.id;
  if (typeof userId !== 'string' || userId.length === 0) {
    return null;
  }
  const password = config.loginPassword ?? account?.mm;
  const token = config.loginToken;
  return {
    userId,
    password:
      typeof password === 'string' && password.length > 0
        ? password
        : undefined,
    token: typeof token === 'string' && token.length > 0 ? token : undefined,
  };
}

async function runInit(
  initParams: Record<string, unknown>,
  hooks: AutoModeHooks
): Promise<void> {
  const optionsJson = JSON.stringify(initParams, null, 2);
  const options = new ChatOptions(
    initParams as { appKey: string; appId: string }
  );
  await ChatClient.getInstance().init(options);
  addLog('api.ChatClient.init', okResult());
  registerAllListeners();
  hooks.markInitialized(optionsJson);
  navigateReplace('Login');
}

async function runLogin(
  loginParams: { userId: string; password?: string; token?: string },
  hooks: AutoModeHooks
): Promise<void> {
  // login 失败自动重试至多 5 次（间隔 1s）：native init 返回后 SDK 内部可能尚未就绪
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= LOGIN_MAX_ATTEMPTS; attempt++) {
    try {
      const isPassword = loginParams.password != null;
      const pwdOrToken = isPassword
        ? String(loginParams.password)
        : String(loginParams.token ?? '');
      await ChatClient.getInstance().login(
        loginParams.userId,
        pwdOrToken,
        isPassword
      );
      addLog(
        'api.ChatClient.login',
        okResult({ userId: loginParams.userId, attempt })
      );
      hooks.markLoggedIn(loginParams.userId);
      navigateReplace('Search');
      return;
    } catch (e) {
      lastError = e;
      addLog('api.ChatClient.login', {
        ...errResult(e),
        attempt,
        maxAttempts: LOGIN_MAX_ATTEMPTS,
      });
      if (attempt < LOGIN_MAX_ATTEMPTS) {
        await sleep(LOGIN_RETRY_INTERVAL_MS);
      }
    }
  }
  throw lastError;
}

async function runStep(step: ScriptStep, ctx: RefContext): Promise<ApiResult> {
  const entry = findApi(step.api);
  if (entry == null) {
    return {
      success: false,
      error: { code: -1, message: `unknown api: ${step.api}` },
    };
  }
  try {
    const params = (resolveValue(step.params ?? {}, ctx) ?? {}) as Record<
      string,
      any
    >;
    const data = await withTimeout(
      entry.invoke(params),
      step.timeoutMs ?? DEFAULT_TIMEOUT_MS
    );
    return okResult(data ?? undefined);
  } catch (e) {
    return errResult(e);
  }
}

async function loadJsonFile(path: string): Promise<Record<string, unknown>> {
  const text = await RNFS.readFile(path, 'utf8');
  return JSON.parse(text) as Record<string, unknown>;
}

/**
 * 执行自动化脚本。任何失败只记日志不抛出，保证 App 保持运行、监听器持续打日志。
 */
export async function runAutoMode(hooks: AutoModeHooks): Promise<void> {
  if (!isAutoMode() || API_SCRIPT == null) {
    return;
  }
  addLog('script.start', { script: API_SCRIPT, config: API_CONFIG ?? null });
  try {
    const script = (await loadJsonFile(API_SCRIPT)) as Script;

    // 数据源：默认打包进来的 env.ts；API_CONFIG 传入外部 JSON 时整体覆盖
    let config: Record<string, unknown>;
    if (typeof API_CONFIG === 'string' && API_CONFIG.length > 0) {
      config = await loadJsonFile(API_CONFIG);
      addLog('script.config', { path: API_CONFIG });
    } else {
      config = envData as unknown as Record<string, unknown>;
      addLog('script.config', { source: 'env.ts' });
    }

    const initParams = deriveInitParams(script, config);
    if (initParams != null) {
      await runInit(initParams, hooks);
    } else {
      addLog('script.init.skipped', { reason: 'no init params' });
    }

    const loginParams = deriveLoginParams(script, config);
    if (loginParams != null) {
      try {
        await runLogin(loginParams, hooks);
      } catch {
        // 重试耗尽：错误已逐次记录，继续执行 steps（失败由真实错误路径验证）
      }
    } else {
      addLog('script.login.skipped', { reason: 'no login params' });
    }

    // 逐步串行执行；单步失败不中断
    const ctx: RefContext = { config, prev: undefined, stepData: new Map() };
    const steps = script.steps ?? [];
    let failed = 0;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!;
      const result = await runStep(step, ctx);
      addLog(`script.step[${i}]`, {
        api: step.api,
        id: step.id ?? null,
        result,
      });
      if (result.success) {
        ctx.prev = result.data;
        if (step.id != null) {
          ctx.stepData.set(step.id, result.data);
        }
      } else {
        failed++;
        ctx.prev = undefined;
      }
      if (step.delayAfterMs != null && step.delayAfterMs > 0) {
        await sleep(step.delayAfterMs);
      }
    }

    addLog('script.done', { total: steps.length, failed });
  } catch (e) {
    addLog('script.aborted', errResult(e));
  }
}
