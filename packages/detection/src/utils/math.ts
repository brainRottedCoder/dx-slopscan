/** Arithmetic mean. */
export function avg(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Mean squared deviation from mean. */
export function avgSquaredDiff(values: readonly number[], mean: number): number {
  if (values.length === 0) return 0;
  return avg(values.map((value) => (value - mean) ** 2));
}

/** Clamp value to 0–1 inclusive. */
export function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
