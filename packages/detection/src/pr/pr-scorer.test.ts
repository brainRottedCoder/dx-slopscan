import type { PrScoringInput } from '@slop-scanner/shared-types';
import { beforeEach, describe, expect, it } from 'vitest';


import { scorePullRequest } from './pr-scorer.js';

const SAMPLE_INPUT: PrScoringInput = {
  description:
    'This change typically updates UserService because it generally improves behavior. ' +
    'It is worth noting that fixes #42 may help.',
  diffSymbols: ['UserService', 'AuthController', 'TokenStore'],
  changedFunctions: ['login', 'refreshToken'],
  diffLineCount: 120,
};

describe('scorePullRequest', () => {
  beforeEach(() => {
    process.env.DETECTION_EMBEDDING_MODE = 'hash';
  });

  it('is deterministic for identical input', async () => {
    const first = await scorePullRequest(SAMPLE_INPUT);
    const second = await scorePullRequest(SAMPLE_INPUT);

    expect(second.total).toBe(first.total);
    expect(second.grade).toBe(first.grade);
    expect(second.signals.map((signal) => signal.value)).toEqual(
      first.signals.map((signal) => signal.value),
    );
  });

  it('returns five PR signals for English', async () => {
    const score = await scorePullRequest(SAMPLE_INPUT);
    expect(score.signals).toHaveLength(5);
  });

  it('skips hedging signal for non-English descriptions', async () => {
    const score = await scorePullRequest({
      ...SAMPLE_INPUT,
      description: 'Este cambio actualiza el servicio de autenticación para la API.',
    });
    expect(score.signals).toHaveLength(4);
    expect(score.signals.some((signal) => signal.signal === 'hedging_density')).toBe(false);
  });

  it('handles empty description without throwing', async () => {
    const score = await scorePullRequest({
      ...SAMPLE_INPUT,
      description: '',
      diffSymbols: [],
    });
    expect(score.total).toBeGreaterThanOrEqual(0);
  });
});
