/**
 * Minimal assertion set for CI cases. No matcher framework: failures are
 * plain `Error`s, which the harness records as body failures.
 */

import { ChatError } from 'react-native-chat-sdk';

function fmt(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

export function assertTrue(value: boolean, message?: string): void {
  if (!value) {
    throw new Error(message ?? `expected true, got ${fmt(value)}`);
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(message ?? `expected ${fmt(expected)}, got ${fmt(actual)}`);
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  }
  if (
    a != null &&
    b != null &&
    typeof a === 'object' &&
    typeof b === 'object' &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return (
      keysA.length === keysB.length &&
      keysA.every((key) =>
        deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
      )
    );
  }
  return false;
}

export function assertDeepEqual(
  actual: unknown,
  expected: unknown,
  message?: string
): void {
  if (!deepEqual(actual, expected)) {
    throw new Error(
      message ?? `expected deep equal ${fmt(expected)}, got ${fmt(actual)}`
    );
  }
}

export function assertNotNull<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value == null) {
    throw new Error(message ?? 'expected a non-null value, got null');
  }
}

export function assertNull(value: unknown, message?: string): void {
  if (value != null) {
    throw new Error(message ?? `expected null, got ${fmt(value)}`);
  }
}

/**
 * Negative-contract assertion: passes only when `op` rejects AND the
 * rejection is a `ChatError` whose `code` equals `code` exactly. Any other
 * outcome — resolution, a non-ChatError rejection, or a different code —
 * is a failure, so an arbitrary exception never counts as a negative pass.
 */
export async function expectCiError(
  op: () => Promise<unknown>,
  code: number
): Promise<void> {
  let caught: unknown = null;
  let rejected = false;
  try {
    await op();
  } catch (e) {
    rejected = true;
    caught = e;
  }
  if (!rejected) {
    throw new Error(
      `expected ChatError ${code}, but the operation resolved successfully`
    );
  }
  if (!(caught instanceof ChatError)) {
    throw new Error(
      `expected ChatError ${code}, got a non-ChatError rejection: ${fmt(
        caught
      )}`
    );
  }
  if (caught.code !== code) {
    throw new Error(
      `expected ChatError ${code}, got ${caught.code} (${caught.description})`
    );
  }
}
