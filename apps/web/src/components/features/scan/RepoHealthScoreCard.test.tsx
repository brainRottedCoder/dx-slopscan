import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RepoHealthScoreCard } from './RepoHealthScoreCard.js';

describe('RepoHealthScoreCard', () => {
  it('shows health score and grade', () => {
    render(
      <RepoHealthScoreCard
        healthScore={{
          total: 82,
          grade: 'B',
          signals: [],
          computedAt: new Date().toISOString(),
        }}
      />,
    );

    expect(screen.getByText('B')).toBeDefined();
    expect(screen.getByText(/Repository health/i)).toBeDefined();
  });

  it('shows OSS median relative label when calibrated', () => {
    render(
      <RepoHealthScoreCard
        healthScore={{
          total: 82,
          grade: 'B',
          signals: [],
          computedAt: new Date().toISOString(),
          relativePercentile: 72,
          relativeLabel: 'Above OSS median',
        }}
      />,
    );

    expect(screen.getByText(/OSS median/i)).toBeDefined();
    expect(screen.getByText(/Above OSS median/i)).toBeDefined();
  });
});
