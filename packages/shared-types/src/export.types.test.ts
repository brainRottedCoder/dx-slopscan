import { describe, expect, it } from 'vitest';

import type { ExportableReport } from './export.types.js';

describe('ExportableReport', () => {
  it('requires compliance disclaimer in meta', () => {
    const report: ExportableReport = {
      meta: {
        repo: 'octo/demo',
        scanId: 'scan-1',
        generatedAt: '2026-01-01T00:00:00.000Z',
        scopeLimits: { MAX_PRS: 50 },
        note: 'Scores represent information density and review quality signals, not authorship detection.',
      },
      health: { total: 70, grade: 'C', signals: [], computedAt: '' },
      prPreviews: [],
      commitScores: null,
      docScores: null,
      contributors: [],
    };
    expect(report.meta.note).toContain('information density');
  });
});
