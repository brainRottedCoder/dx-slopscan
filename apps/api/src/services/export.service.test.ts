import { describe, expect, it } from 'vitest';

import { generateJsonReport, validateExportReport } from './export.service.js';

const SAMPLE_RESULT = {
  scanId: '550e8400-e29b-41d4-a716-446655440000',
  repoFullName: 'octo/hello',
  tree: [],
  heatmap: [],
  prs: [
    {
      number: 1,
      title: 'Improve auth',
      body: 'Adds middleware',
      state: 'OPEN' as const,
      author: 'dev',
      avatarUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      additions: 1,
      deletions: 0,
      changedFiles: 1,
      analysisStatus: 'pending' as const,
    },
  ],
  commitResult: null,
  docScan: null,
  healthScore: {
    total: 70,
    grade: 'C' as const,
    signals: [],
    computedAt: new Date().toISOString(),
  },
  contributors: [
    {
      login: 'dev',
      avatarUrl: null,
      prCount: 1,
      commitCount: 2,
      recentActivity: 'active',
    },
  ],
  completedAt: new Date().toISOString(),
};

describe('generateJsonReport', () => {
  it('passes Zod schema validation', () => {
    const report = generateJsonReport(SAMPLE_RESULT.scanId, SAMPLE_RESULT);
    expect(() => validateExportReport(report)).not.toThrow();
  });

  it('contains compliance disclaimer note', () => {
    const report = generateJsonReport(SAMPLE_RESULT.scanId, SAMPLE_RESULT);
    expect(report.meta.note).toContain('information density');
  });

  it('rejects exports containing token patterns', () => {
    const report = generateJsonReport(SAMPLE_RESULT.scanId, SAMPLE_RESULT);
    const poisoned = {
      ...report,
      meta: { ...report.meta, repo: 'ghp_abcdefghijklmnopqrstuvwxyz1234567890' },
    };
    expect(() => validateExportReport(poisoned)).toThrow();
  });
});
