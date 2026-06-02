import { describe, expect, it } from 'vitest';

import { buildScanWarnings } from './scan-helpers.js';

describe('buildScanWarnings', () => {
  it('warns on large monorepo file counts', () => {
    const warnings = buildScanWarnings({
      fileCount: 500,
      prCount: 10,
      commitCount: 10,
      sampleText: 'English documentation for the service.',
    });
    expect(warnings.some((line) => line.includes('monorepo'))).toBe(true);
  });

  it('warns for non-English sample text', () => {
    const warnings = buildScanWarnings({
      fileCount: 10,
      prCount: 1,
      commitCount: 1,
      sampleText: 'Este cambio actualiza el middleware de autenticación.',
    });
    expect(warnings.some((line) => line.includes('Non-English'))).toBe(true);
  });

  it('warns when no recent activity exists', () => {
    const warnings = buildScanWarnings({
      fileCount: 0,
      prCount: 0,
      commitCount: 0,
      sampleText: '',
    });
    expect(warnings.some((line) => line.includes('No recent activity'))).toBe(true);
  });

  it('warns on partial GitHub fetch failures', () => {
    const warnings = buildScanWarnings({
      fileCount: 10,
      prCount: 1,
      commitCount: 1,
      sampleText: 'English docs.',
      partialResults: true,
    });
    expect(warnings.some((line) => line.includes('Partial results'))).toBe(true);
  });
});
