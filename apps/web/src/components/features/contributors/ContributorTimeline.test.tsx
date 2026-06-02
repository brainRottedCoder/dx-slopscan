import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContributorTimeline } from './ContributorTimeline.js';

describe('ContributorTimeline', () => {
  it('renders without red colors in output', () => {
    const { container } = render(
      <ContributorTimeline
        timeline={[
          { prNumber: 1, date: '2026-01-01T00:00:00.000Z', informationDensity: 40 },
          { prNumber: 2, date: '2026-01-02T00:00:00.000Z', informationDensity: 55 },
        ]}
      />,
    );

    expect(container.innerHTML).not.toContain('#ef4444');
    expect(container.innerHTML).not.toContain('score-danger');
    expect(container.textContent).toContain('Information Density (0–100)');
  });
});
