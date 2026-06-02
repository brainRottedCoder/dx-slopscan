import { describe, expect, it } from 'vitest';

import type { DocAnalysisResult, DocFile, DocSurfaceScan } from './doc.types.js';

describe('DocFile', () => {
  it('allows optional content', () => {
    const file: DocFile = { path: 'README.md', name: 'README.md', content: '# Hi' };
    expect(file.content).toBe('# Hi');
  });
});

describe('DocSurfaceScan', () => {
  it('allows null aggregate when no docs scored', () => {
    const scan: DocSurfaceScan = { entries: [], aggregateScore: null };
    expect(scan.aggregateScore).toBeNull();
  });
});

describe('DocAnalysisResult', () => {
  it('includes per-section breakdown', () => {
    const result: DocAnalysisResult = {
      filePath: 'docs/guide.md',
      sections: [{ heading: 'Setup', content: 'Run pnpm install', score: 80, signals: [] }],
      overallScore: { total: 80, grade: 'B', signals: [], computedAt: '' },
      analyzedAt: '2026-01-01T00:00:00.000Z',
    };
    expect(result.sections).toHaveLength(1);
  });
});
