import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContributorSummary } from './ContributorSummary.js';

describe('ContributorSummary', () => {
  it('lists contributors alphabetically', () => {
    render(
      <ContributorSummary
        contributors={[
          {
            login: 'zebra',
            avatarUrl: null,
            prCount: 1,
            commitCount: 2,
            recentActivity: 'active',
          },
          {
            login: 'alpha',
            avatarUrl: null,
            prCount: 3,
            commitCount: 4,
            recentActivity: 'active',
          },
        ]}
        scanId={null}
      />,
    );

    const names = screen.getAllByText(/alpha|zebra/).map((node) => node.textContent);
    expect(names[0]).toContain('alpha');
  });

  it('does not use danger score styling', () => {
    const { container } = render(
      <ContributorSummary
        contributors={[
          {
            login: 'dev',
            avatarUrl: null,
            prCount: 1,
            commitCount: 1,
            recentActivity: 'active',
          },
        ]}
        scanId={null}
      />,
    );
    expect(container.innerHTML).not.toContain('score-danger');
    expect(container.innerHTML).not.toContain('#ef4444');
  });
});
