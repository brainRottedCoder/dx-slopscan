import { describe, expect, it } from 'vitest';

import { extractChangedFunctions, extractSymbolsFromDiff } from './diff-parser.js';

describe('extractSymbolsFromDiff', () => {
  it('collects symbols from added lines', () => {
    const diff = [
      '--- a/file.ts',
      '+++ b/file.ts',
      '-function OldService() {}',
      '+class NewService {}',
    ].join('\n');

    const symbols = extractSymbolsFromDiff(diff);
    expect(symbols).toContain('NewService');
    expect(symbols).not.toContain('OldService');
  });

  it('ignores deleted line content', () => {
    const diff = '-const RemovedSymbol = 1\n+const AddedSymbol = 2';
    const symbols = extractSymbolsFromDiff(diff);
    expect(symbols).not.toContain('RemovedSymbol');
    expect(symbols).toContain('AddedSymbol');
  });

  it('returns empty for empty diff', () => {
    expect(extractSymbolsFromDiff('')).toEqual([]);
  });
});

describe('extractChangedFunctions', () => {
  it('extracts function names from additions', () => {
    const diff = '+function handleAuth() {}\n-function handleAuth() {}';
    expect(extractChangedFunctions(diff)).toEqual(['handleAuth']);
  });
});
