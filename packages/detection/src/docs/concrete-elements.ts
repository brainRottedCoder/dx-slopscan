export type ConcreteElementScore = Record<string, number>;

const CONCRETE_PATTERNS = {
  codeBlock: /```[\s\S]*?```/g,
  inlineCode: /`[^`]+`/g,
  semver: /\bv?\d+\.\d+\.\d+\b/g,
  shellCommand: /^\$\s+.+/gm,
  filePath: /(?:^|[\s(])(\.{0,2}\/[\w./-]+\.\w+)/gm,
  namedError: /\b[A-Z][a-zA-Z]+Error\b/g,
} as const;

/** Count concrete documentation elements by pattern type. */
export function countConcreteElements(text: string): ConcreteElementScore {
  return Object.fromEntries(
    Object.entries(CONCRETE_PATTERNS).map(([key, pattern]) => [
      key,
      (text.match(pattern) ?? []).length,
    ]),
  ) as ConcreteElementScore;
}

/** Normalized concrete element density signal value (0–1). */
export function concreteElementScoreValue(text: string): number {
  const counts = countConcreteElements(text);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  return Math.min(total / Math.max(words / 50, 1), 1);
}
