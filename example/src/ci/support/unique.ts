/**
 * Unique resource naming for CI cases: `ci_<module>_<ts>_<seq>_<label>`.
 *
 * Each module keeps an independent sequence counter, so names stay unique
 * per run even when cases create resources concurrently with leftover
 * resources from earlier runs (`ts` disambiguates across runs, `seq`
 * within one millisecond of one module).
 */

const sequences = new Map<string, number>();

export function uniqueCiName(module: string, label: string): string {
  const seq = sequences.get(module) ?? 0;
  sequences.set(module, seq + 1);
  return `ci_${module}_${Date.now()}_${seq}_${label}`;
}
