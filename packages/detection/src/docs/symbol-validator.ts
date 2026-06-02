export interface CodebaseIndex {
  readonly symbols: ReadonlySet<string>;
}

export interface SymbolValidationResult {
  readonly claimed: readonly string[];
  readonly verified: readonly string[];
  readonly missing: readonly string[];
  readonly accuracy: number;
}

const SYMBOL_PATTERN = /\b([A-Z][A-Za-z0-9_]+)\b/g;

/** Extract PascalCase identifiers claimed in documentation. */
export function extractClaimedSymbols(docText: string): string[] {
  const matches = docText.match(SYMBOL_PATTERN) ?? [];
  return [...new Set(matches)];
}

/** Validate claimed symbols against a codebase index. */
export function validateSymbolClaims(
  docText: string,
  codebaseIndex: CodebaseIndex,
): SymbolValidationResult {
  const claimed = extractClaimedSymbols(docText);
  const verified = claimed.filter((symbol) => codebaseIndex.symbols.has(symbol));
  const missing = claimed.filter((symbol) => !codebaseIndex.symbols.has(symbol));
  const accuracy = claimed.length === 0 ? 1 : verified.length / claimed.length;

  return { claimed, verified, missing, accuracy };
}
