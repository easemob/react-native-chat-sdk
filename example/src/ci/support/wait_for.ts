/**
 * Polling wait for CI cases: re-reads a value every 200ms until it matches
 * or the timeout (default 30s) elapses. The timeout error always carries
 * the last observed value so failures keep their evidence.
 */

export const CI_POLL_INTERVAL_MS = 200;
export const CI_DEFAULT_TIMEOUT_MS = 30 * 1000;

function formatObservation(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Rejects with a timeout error when `p` does not settle within `timeoutMs`. */
export function withCiTimeout<T>(
  p: Promise<T>,
  timeoutMs: number,
  what: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${what} timed out after ${timeoutMs}ms`));
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

export async function waitForCi<T>(
  description: string,
  read: () => Promise<T>,
  matches: (value: T) => boolean,
  timeoutMs: number = CI_DEFAULT_TIMEOUT_MS
): Promise<T> {
  const start = Date.now();
  const timedOut = (last: unknown): Error =>
    new Error(
      `waitForCi timed out after ${timeoutMs}ms: ${description}; ` +
        `last observed value: ${formatObservation(last)}`
    );
  let last: unknown;
  for (;;) {
    const remaining = timeoutMs - (Date.now() - start);
    if (remaining <= 0) {
      throw timedOut(last);
    }
    const observed = await withCiTimeout(read(), remaining, description);
    last = observed;
    if (matches(observed)) {
      return observed;
    }
    if (Date.now() - start >= timeoutMs) {
      throw timedOut(last);
    }
    await sleep(Math.min(CI_POLL_INTERVAL_MS, remaining));
  }
}
