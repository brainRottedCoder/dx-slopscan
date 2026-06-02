import { describe, expect, it } from 'vitest';

import type {
  ContributorProfile,
  ContributorSummary,
  InformationDensityPoint,
} from './contributor.types.js';

describe('ContributorSummary', () => {
  it('uses neutral summary fields only', () => {
    const row: ContributorSummary = {
      login: 'dev',
      avatarUrl: null,
      prCount: 3,
      commitCount: 10,
      recentActivity: '2026-01-01',
    };
    expect(row.login).toBe('dev');
  });
});

describe('InformationDensityPoint', () => {
  it('stores informationDensity not banned labels', () => {
    const point: InformationDensityPoint = {
      prNumber: 12,
      date: '2026-01-01T00:00:00.000Z',
      informationDensity: 72,
    };
    expect(point.informationDensity).toBe(72);
  });
});

describe('ContributorProfile', () => {
  it('combines deviation and timeline', () => {
    const profile: ContributorProfile = {
      login: 'dev',
      deviation: {
        lengthDeviation: 0.5,
        vocabularyDrift: 0.1,
        isSignificant: false,
        explanation: 'Consistent with baseline.',
      },
      timeline: [],
    };
    expect(profile.deviation.isSignificant).toBe(false);
  });
});
