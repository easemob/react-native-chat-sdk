import {
  AgentCommandError,
  CommandService,
  evaluateExpect,
  type CommandRecord,
  type ExecResult,
} from '../command_service';
import { EvidenceStore } from '../evidence_store';

function makeService(overrides?: {
  executeApi?: (
    api: string,
    params: Record<string, unknown>
  ) => Promise<ExecResult>;
  registeredApis?: string[];
  evidence?: EvidenceStore;
  defaultTimeoutMs?: number;
}): { service: CommandService; evidence: EvidenceStore } {
  const evidence = overrides?.evidence ?? new EvidenceStore();
  const registered = new Set(overrides?.registeredApis ?? ['TestApi.ping']);
  const service = new CommandService({
    executeApi:
      overrides?.executeApi ??
      (() => Promise.resolve({ success: true, data: { pong: 1 } })),
    initHandler: () => Promise.resolve({ success: true }),
    isRegistered: (api) => registered.has(api),
    evidence,
    instanceId: 'test-instance',
    defaultTimeoutMs: overrides?.defaultTimeoutMs,
  });
  return { service, evidence };
}

function submitOk(
  service: CommandService,
  commandId: string,
  api: string = 'TestApi.ping',
  extra?: Record<string, unknown>
): CommandRecord {
  return service.submit({ commandId, api, ...extra });
}

describe('CommandService submission validation (contract §2.2 order)', () => {
  it('rejects a missing/non-string commandId with 400 bad_command', () => {
    const { service } = makeService();
    expect(() => service.submit({ api: 'TestApi.ping' })).toThrow(
      expect.objectContaining({ statusCode: 400, code: 'bad_command' })
    );
    expect(() =>
      service.submit({ commandId: '', api: 'TestApi.ping' })
    ).toThrow(AgentCommandError);
  });

  it('rejects a missing/non-string api with 400 bad_command', () => {
    const { service } = makeService();
    expect(() => service.submit({ commandId: 'c1' })).toThrow(
      expect.objectContaining({ statusCode: 400, code: 'bad_command' })
    );
  });

  it('rejects an unregistered api with 422 unknown_api', () => {
    const { service } = makeService();
    expect(() => submitOk(service, 'c1', 'Nope.missing')).toThrow(
      expect.objectContaining({ statusCode: 422, code: 'unknown_api' })
    );
  });

  it('ChatClient.init bypasses the registry check (single special case)', async () => {
    const { service } = makeService();
    const record = submitOk(service, 'c1', 'ChatClient.init');
    const terminal = await service.awaitTerminal(record);
    expect(terminal.result?.success).toBe(true);
  });

  it('rejects a second in-flight command with 409 busy', () => {
    const { service } = makeService({
      executeApi: () => new Promise(() => {}), // never resolves
      defaultTimeoutMs: 50, // keep the timeout guard timer short-lived
    });
    submitOk(service, 'c1');
    expect(() => submitOk(service, 'c2')).toThrow(
      expect.objectContaining({ statusCode: 409, code: 'busy' })
    );
  });

  it('dedups a repeated commandId with identical resolved content', async () => {
    const { service } = makeService();
    const first = submitOk(service, 'c1', 'TestApi.ping', {
      params: { a: 1 },
      timeoutMs: 5000,
    });
    await service.awaitTerminal(first);
    const again = submitOk(service, 'c1', 'TestApi.ping', {
      params: { a: 1 },
      timeoutMs: 5000,
    });
    expect(again).toBe(first);
  });

  it('rejects a repeated commandId with different content (409 conflict)', async () => {
    const { service } = makeService();
    const first = submitOk(service, 'c1', 'TestApi.ping', {
      params: { a: 1 },
    });
    await service.awaitTerminal(first);
    expect(() =>
      submitOk(service, 'c1', 'TestApi.ping', { params: { a: 2 } })
    ).toThrow(
      expect.objectContaining({ statusCode: 409, code: 'command_conflict' })
    );
  });

  it('rejects everything with 410 closed after finish', async () => {
    const { service } = makeService();
    const record = submitOk(service, 'c1');
    await service.awaitTerminal(record);
    service.finish();
    expect(service.state).toBe('closed');
    expect(() => submitOk(service, 'c2')).toThrow(
      expect.objectContaining({ statusCode: 410, code: 'closed' })
    );
  });

  it('finish is rejected with 409 busy while a command is in flight', () => {
    const { service } = makeService({
      executeApi: () => new Promise(() => {}),
      defaultTimeoutMs: 50,
    });
    submitOk(service, 'c1');
    expect(() => service.finish()).toThrow(
      expect.objectContaining({ statusCode: 409, code: 'busy' })
    );
  });

  it('rejects business commands with 503 evidence_gap once the buffer degraded', () => {
    const evidence = new EvidenceStore({ maxEntries: 1 });
    const { service } = makeService({ evidence });
    evidence.append('x', {});
    evidence.append('y', {}); // overflow -> degraded
    expect(evidence.degraded).toBe(true);
    expect(() => submitOk(service, 'c1')).toThrow(
      expect.objectContaining({ statusCode: 503, code: 'evidence_gap' })
    );
  });
});

describe('CommandService result envelopes (contract §3)', () => {
  it('success envelope: status done, data, evidence range', async () => {
    const { service } = makeService({
      executeApi: () => Promise.resolve({ success: true, data: { ok: 1 } }),
    });
    const record = submitOk(service, 'alice-3', 'TestApi.ping');
    const terminal = (await service.awaitTerminal(record)).result;
    expect(terminal).toMatchObject({
      commandId: 'alice-3',
      status: 'done',
      success: true,
      data: { ok: 1 },
    });
    expect(terminal?.evidence?.fromSeq).toBeLessThanOrEqual(
      terminal?.evidence?.toSeq ?? -1
    );
    expect(terminal?.expectMatched).toBeUndefined();
  });

  it('sdk failure envelope keeps the SDK error code and failureKind sdk', async () => {
    const { service } = makeService({
      executeApi: () =>
        Promise.resolve({
          success: false,
          failureKind: 'sdk',
          error: { code: 303, message: 'server error' },
        }),
    });
    const terminal = (await service.awaitTerminal(submitOk(service, 'c1')))
      .result;
    expect(terminal).toMatchObject({
      status: 'done',
      success: false,
      failureKind: 'sdk',
      error: { code: 303, message: 'server error' },
    });
  });

  it('an executor throw is classified as a tool error with code -1', async () => {
    const { service } = makeService({
      executeApi: () => Promise.reject(new Error('adapter blew up')),
    });
    const terminal = (await service.awaitTerminal(submitOk(service, 'c1')))
      .result;
    expect(terminal).toMatchObject({
      status: 'done',
      success: false,
      failureKind: 'tool',
      error: { code: -1, message: 'adapter blew up' },
    });
  });

  it('void success omits the data field', async () => {
    const { service } = makeService({
      executeApi: () => Promise.resolve({ success: true }),
    });
    const terminal = (await service.awaitTerminal(submitOk(service, 'c1')))
      .result;
    expect(terminal?.success).toBe(true);
    expect('data' in (terminal ?? {})).toBe(false);
  });

  it('expect evaluation: success/errorCode, only when carried (§2.1)', async () => {
    const { service } = makeService();
    const matched = (
      await service.awaitTerminal(
        submitOk(service, 'c1', 'TestApi.ping', { expect: { success: true } })
      )
    ).result;
    expect(matched?.expectMatched).toBe(true);

    const mismatched = (
      await service.awaitTerminal(
        submitOk(service, 'c2', 'TestApi.ping', { expect: { success: false } })
      )
    ).result;
    expect(mismatched?.expectMatched).toBe(false);
  });

  it('writes agent.command accepted/finished events into the evidence stream', async () => {
    const { service, evidence } = makeService();
    const record = submitOk(service, 'c1');
    await service.awaitTerminal(record);
    const lifecycle = evidence
      .query(0)
      .filter((e) => e.source === 'agent.command')
      .map((e) => (e.payload as Record<string, unknown>).event);
    expect(lifecycle).toEqual(['accepted', 'finished']);
    // The api.* mirror event sits between them.
    expect(evidence.query(0).some((e) => e.source === 'api.TestApi.ping')).toBe(
      true
    );
  });
});

describe('CommandService timeout (contract §2.3/§2.4)', () => {
  it('times out with code -2, enters uncertain, later commands get 503', async () => {
    let resolveLate: ((r: ExecResult) => void) | undefined;
    const { service, evidence } = makeService({
      executeApi: () =>
        new Promise<ExecResult>((resolve) => {
          resolveLate = resolve;
        }),
      defaultTimeoutMs: 30,
    });
    const record = submitOk(service, 'c1');
    const terminal = (await service.awaitTerminal(record)).result;
    expect(terminal).toMatchObject({
      status: 'timeout',
      success: false,
      failureKind: 'timeout',
      error: { code: -2, message: 'timeout after 30ms' },
    });
    expect(service.state).toBe('uncertain');
    expect(() => submitOk(service, 'c2')).toThrow(
      expect.objectContaining({ statusCode: 503, code: 'uncertain' })
    );

    // Late completion lands in the evidence stream with late: true and never
    // overwrites the recorded terminal state.
    resolveLate?.({ success: true, data: { late: 'value' } });
    await new Promise((r) => setTimeout(r, 0));
    const lateEvents = evidence
      .query(0)
      .filter(
        (e) =>
          e.source === 'api.TestApi.ping' &&
          (e.payload as Record<string, unknown>).late === true
      );
    expect(lateEvents.length).toBe(1);
    expect(record.result?.status).toBe('timeout');
  });
});

describe('evaluateExpect', () => {
  const ok: ExecResult = { success: true, data: {} };
  const fail: ExecResult = {
    success: false,
    failureKind: 'sdk',
    error: { code: 204, message: 'not found' },
  };

  it('evaluates success and errorCode; tolerates unknown fields', () => {
    expect(evaluateExpect(ok, { success: true })).toBe(true);
    expect(evaluateExpect(ok, { success: false })).toBe(false);
    expect(evaluateExpect(fail, { success: false, errorCode: 204 })).toBe(true);
    expect(evaluateExpect(fail, { success: false, errorCode: 500 })).toBe(
      false
    );
    expect(evaluateExpect(fail, { success: true })).toBe(false);
    expect(evaluateExpect(ok, { unknownField: 1 })).toBe(true);
    expect(evaluateExpect(ok, null)).toBe(true);
  });
});

describe('CommandService.rejectionEnvelope (reverse channel, §8)', () => {
  it('carries the rejection as a tool error with the reject code', () => {
    const envelope = CommandService.rejectionEnvelope(
      { commandId: 'c9' },
      new AgentCommandError(409, 'busy', 'one in flight only')
    );
    expect(envelope).toEqual({
      commandId: 'c9',
      status: 'done',
      success: false,
      failureKind: 'tool',
      error: { code: -1, message: 'rejected: busy (409): one in flight only' },
      rejectCode: 'busy',
    });
  });
});
