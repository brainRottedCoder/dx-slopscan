import { describe, expect, it } from 'vitest';

import { detectCircularReferences } from './circularity.js';

describe('detectCircularReferences', () => {
  it('flags self-referential section openings', () => {
    const flags = detectCircularReferences([
      {
        heading: 'Configuration',
        body: 'Configuration controls how settings are loaded.',
      },
    ]);
    expect(flags.length).toBe(1);
    expect(flags[0]?.overlappingTerms).toContain('configuration');
  });

  it('returns empty for distinct heading and body', () => {
    const flags = detectCircularReferences([
      {
        heading: 'Installation',
        body: 'Run npm install to begin.',
      },
    ]);
    expect(flags.length).toBe(0);
  });

  it('handles empty sections list', () => {
    expect(detectCircularReferences([])).toEqual([]);
  });
});
