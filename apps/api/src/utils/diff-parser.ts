const ADDED_LINE_PREFIX = '+';
const DIFF_HEADER_PREFIX = '+++';
const IDENTIFIER_PATTERN = /\b[A-Z][A-Za-z0-9_]*\b|\b[a-z][A-Za-z0-9_]*\b/g;
const FUNCTION_PATTERN = /\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)/;

function isAddedDiffLine(line: string): boolean {
  return line.startsWith(ADDED_LINE_PREFIX) && !line.startsWith(DIFF_HEADER_PREFIX);
}

/** Extract symbol-like tokens from added diff lines only (ignores deletions). */
export function extractSymbolsFromDiff(diff: string): string[] {
  const symbols = new Set<string>();

  for (const line of diff.split('\n')) {
    if (!isAddedDiffLine(line)) continue;
    const content = line.slice(1);
    const matches = content.match(IDENTIFIER_PATTERN) ?? [];
    for (const match of matches) {
      if (match.length > 2) symbols.add(match);
    }
  }

  return [...symbols];
}

/** Extract function names introduced on added diff lines. */
export function extractChangedFunctions(diff: string): string[] {
  const names = new Set<string>();

  for (const line of diff.split('\n')) {
    if (!isAddedDiffLine(line)) continue;
    const content = line.slice(1);
    const match = FUNCTION_PATTERN.exec(content);
    if (match?.[1]) names.add(match[1]);
  }

  return [...names];
}
