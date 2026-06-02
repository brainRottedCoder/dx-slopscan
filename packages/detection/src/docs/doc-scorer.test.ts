import { describe, expect, it } from 'vitest';

import { scoreDocumentation } from './doc-scorer.js';

describe('scoreDocumentation', () => {
  it('returns composite score with signals', () => {
    const score = scoreDocumentation({
      text: 'Use `AuthController` — fixes #12 because of timeout.',
      sections: [{ heading: 'Auth', body: 'Login flow details.' }],
      codebaseIndex: { symbols: new Set(['AuthController']) },
    });

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.signals.length).toBe(5);
  });

  it('handles empty documentation', () => {
    const score = scoreDocumentation({
      text: '',
      sections: [],
      codebaseIndex: { symbols: new Set() },
    });
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  it('flags circular sections in composite score', () => {
    const score = scoreDocumentation({
      text: 'plain overview',
      sections: [
        {
          heading: 'Authentication',
          body: 'Authentication handles user login and session tokens.',
        },
      ],
      codebaseIndex: { symbols: new Set() },
    });
    const circularity = score.signals.find((signal) => signal.signal === 'circularity');
    expect(circularity?.value).toBeGreaterThan(0);
  });
});
