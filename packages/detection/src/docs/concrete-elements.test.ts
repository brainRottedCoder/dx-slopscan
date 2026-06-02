import { describe, expect, it } from 'vitest';

import { countConcreteElements } from './concrete-elements.js';

describe('countConcreteElements', () => {
  it('counts a fenced code block', () => {
    const counts = countConcreteElements('```ts\nconst x = 1;\n```');
    expect(counts.codeBlock).toBe(1);
  });

  it('returns zeros for empty text', () => {
    const counts = countConcreteElements('');
    expect(Object.values(counts).every((count) => count === 0)).toBe(true);
  });

  it('counts inline code and semver', () => {
    const counts = countConcreteElements('Use `npm install` for version 1.2.3');
    expect(counts.inlineCode).toBeGreaterThanOrEqual(1);
    expect(counts.semver).toBeGreaterThanOrEqual(1);
  });
});
