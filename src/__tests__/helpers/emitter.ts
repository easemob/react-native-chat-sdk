/**
 * Helpers for driving the global mock of `eventEmitter` from
 * `src/__specs__` (installed in `setup.ts`).
 *
 * The mock's `addListener` is a jest.fn returning a fresh subscription object
 * (`{ remove: jest.fn() }`) per call, so both the registered handler and the
 * returned subscription can be recovered from the mock's `calls` / `results`
 * records. This lets tests simulate native events arriving from the bridge
 * and assert how the SDK dispatches them.
 */

import { eventEmitter } from '../../__specs__';

type EmitterHandler = (params?: any) => void;

interface EmitterSubscription {
  remove: jest.Mock;
}

/**
 * Returns the underlying `jest.Mock` for `eventEmitter.addListener`.
 */
export function getAddListenerMock(): jest.Mock {
  return eventEmitter.addListener as unknown as jest.Mock;
}

/**
 * Returns the most recently registered handler for the given native event
 * name, or `undefined` if no handler was registered.
 */
export function getEmitterHandler(
  eventName: string
): EmitterHandler | undefined {
  const calls = getAddListenerMock().mock.calls;
  for (let i = calls.length - 1; i >= 0; --i) {
    const [name, handler] = calls[i] as [string, EmitterHandler];
    if (name === eventName) {
      return handler;
    }
  }
  return undefined;
}

/**
 * Returns the subscription object produced by the most recent `addListener`
 * call for the given native event name, so tests can assert `remove()`.
 */
export function getEmitterSubscription(
  eventName: string
): EmitterSubscription | undefined {
  const mock = getAddListenerMock();
  const calls = mock.mock.calls;
  const results = mock.mock.results;
  for (let i = calls.length - 1; i >= 0; --i) {
    if ((calls[i] as [string])[0] === eventName) {
      return results[i]?.value as EmitterSubscription;
    }
  }
  return undefined;
}

/**
 * Simulates a native event arriving from the bridge: invokes the most
 * recently registered handler for `eventName` with `params`. Throws if no
 * handler is registered, so a missing `addListener` wiring fails loudly.
 */
export function emitNativeEvent(eventName: string, params?: any): void {
  const handler = getEmitterHandler(eventName);
  if (!handler) {
    throw new Error(`No handler registered for native event: ${eventName}`);
  }
  handler(params);
}
