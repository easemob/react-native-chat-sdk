import {
  ReverseTransport,
  type FetchLike,
  type FetchResponseLike,
} from '../transport';

function fakeResponse(status: number, body: unknown): FetchResponseLike {
  return { status, json: () => Promise.resolve(body) };
}

function makeTransport(fetchImpl: FetchLike): ReverseTransport {
  return new ReverseTransport({
    baseUrl: 'http://127.0.0.1:51337/',
    token: 'tok',
    instanceId: 'inst1',
    platform: 'android',
    queueWaitMs: 1000,
    fetchImpl,
  });
}

describe('ReverseTransport.pollQueue (contract §8)', () => {
  it('sends the bearer token and the handshake query fields', async () => {
    const seen: { url?: string; headers?: Record<string, string> } = {};
    const t = makeTransport((url, init) => {
      seen.url = url;
      seen.headers = init.headers;
      return Promise.resolve(fakeResponse(200, { command: null }));
    });
    const poll = await t.pollQueue('accepting');
    expect(poll).toEqual({ kind: 'empty' });
    expect(seen.url).toContain(
      'http://127.0.0.1:51337/v1/queue?instanceId=inst1&version=2&platform=android&state=accepting&waitMs=1000'
    );
    expect(seen.headers?.Authorization).toBe('Bearer tok');
  });

  it('parses a command response', async () => {
    const command = { commandId: 'c1', api: 'ChatClient.isConnected' };
    const t = makeTransport(() =>
      Promise.resolve(fakeResponse(200, { command }))
    );
    expect(await t.pollQueue('accepting')).toEqual({
      kind: 'command',
      command,
    });
  });

  it('parses the finish directive', async () => {
    const t = makeTransport(() =>
      Promise.resolve(fakeResponse(200, { finish: true }))
    );
    expect(await t.pollQueue('accepting')).toEqual({ kind: 'finish' });
  });

  it('410/401 mean the host closed the run', async () => {
    for (const status of [410, 401]) {
      const t = makeTransport(() => Promise.resolve(fakeResponse(status, {})));
      expect(await t.pollQueue('accepting')).toEqual({ kind: 'closed' });
    }
  });

  it('5xx and network errors are transient retries', async () => {
    const t500 = makeTransport(() => Promise.resolve(fakeResponse(500, {})));
    expect(await t500.pollQueue('accepting')).toEqual({ kind: 'retry' });
    const tNet = makeTransport(() => Promise.reject(new Error('ECONNREFUSED')));
    expect(await tNet.pollQueue('accepting')).toEqual({ kind: 'retry' });
  });

  it('a malformed 200 body is treated as a retry', async () => {
    const t = makeTransport(() =>
      Promise.resolve(fakeResponse(200, 'not-an-object'))
    );
    expect(await t.pollQueue('accepting')).toEqual({ kind: 'retry' });
  });
});

describe('ReverseTransport.postResult / postEvents', () => {
  it('postResult wraps the envelope with instanceId', async () => {
    const seen: { url?: string; body?: unknown } = {};
    const t = makeTransport((url, init) => {
      seen.url = url;
      seen.body = JSON.parse(init.body ?? '{}');
      return Promise.resolve(fakeResponse(200, { ok: true }));
    });
    const outcome = await t.postResult({
      commandId: 'c1',
      status: 'done',
      success: true,
    });
    expect(outcome).toBe('ok');
    expect(seen.url).toBe('http://127.0.0.1:51337/v1/results');
    expect(seen.body).toMatchObject({
      instanceId: 'inst1',
      commandId: 'c1',
      status: 'done',
      success: true,
    });
  });

  it('postEvents sends the batch shape (contract §8)', async () => {
    const seen: { body?: unknown } = {};
    const t = makeTransport((_url, init) => {
      seen.body = JSON.parse(init.body ?? '{}');
      return Promise.resolve(fakeResponse(200, {}));
    });
    const outcome = await t.postEvents({
      firstAvailableSeq: 1,
      lastSeq: 2,
      degraded: false,
      events: [
        { seq: 1, source: 'onConnected', payload: {} },
        { seq: 2, source: 'api.ChatClient.init', payload: { success: true } },
      ],
    });
    expect(outcome).toBe('ok');
    expect(seen.body).toEqual({
      instanceId: 'inst1',
      firstAvailableSeq: 1,
      lastSeq: 2,
      degraded: false,
      events: [
        { seq: 1, source: 'onConnected', payload: {} },
        { seq: 2, source: 'api.ChatClient.init', payload: { success: true } },
      ],
    });
  });

  it('410 on POST means closed, network error means retry', async () => {
    const closed = makeTransport(() => Promise.resolve(fakeResponse(410, {})));
    expect(
      await closed.postResult({ commandId: 'c', status: 'done', success: true })
    ).toBe('closed');
    const net = makeTransport(() => Promise.reject(new Error('down')));
    expect(
      await net.postResult({ commandId: 'c', status: 'done', success: true })
    ).toBe('retry');
  });
});
