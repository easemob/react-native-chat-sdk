/**
 * Helpers for interacting with the global mock of `src/__specs__`.
 *
 * All helpers are thin wrappers around `ExtSdkApiRN.callMethod` so tests can
 * stage return values, stage rejections, retrieve the underlying jest mock,
 * or read the most recent invocation in a consistent shape.
 */

import { ExtSdkApiRN } from '../../__specs__';

/**
 * Returns the underlying `jest.Mock` for `ExtSdkApiRN.callMethod`.
 *
 * The global mock installed in `setup.ts` always exposes `callMethod` as a
 * jest mock, so this cast is safe in test code.
 */
export function getCallMethodMock(): jest.Mock {
  return ExtSdkApiRN.callMethod as unknown as jest.Mock;
}

/**
 * Queue a one-shot resolved value for the next `callMethod` invocation.
 */
export function mockCallMethodOnce(value: unknown): void {
  getCallMethodMock().mockResolvedValueOnce(value);
}

/**
 * Queue a one-shot rejection for the next `callMethod` invocation.
 */
export function mockCallMethodReject(err: unknown): void {
  getCallMethodMock().mockRejectedValueOnce(err);
}

/**
 * Returns the most recent `callMethod` invocation as `{ method, args }`.
 *
 * The native bridge is called as `callMethod(methodName, payload)`, so the
 * first positional argument is the method name and the second is the args
 * payload (typically an object). Returns `undefined` if the mock has not
 * been called yet.
 */
export function getLastCall(): { method: string; args: unknown } | undefined {
  const calls = getCallMethodMock().mock.calls;
  if (calls.length === 0) {
    return undefined;
  }
  const last = calls[calls.length - 1] as [string, unknown];
  return { method: last[0], args: last[1] };
}
