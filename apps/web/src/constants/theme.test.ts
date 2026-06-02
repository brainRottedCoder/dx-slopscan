import { describe, expect, it } from 'vitest';

import {
  CONTRIBUTOR_CHART_STROKES,
  REPO_SCORE_THRESHOLDS,
  SCORE_COLOR_TOKENS,
  scoreToGrade,
  scoreToRepoColorVar,
  THEME_STORAGE_KEY,
} from './theme.js';

describe('SCORE_COLOR_TOKENS', () => {
  it('defines heatmap severity tokens including extended tiers', () => {
    expect(SCORE_COLOR_TOKENS.DANGER).toBe('score-danger');
    expect(SCORE_COLOR_TOKENS.CYAN).toBe('score-cyan');
    expect(SCORE_COLOR_TOKENS.ORANGE).toBe('score-orange');
  });
});

describe('scoreToRepoColorVar', () => {
  it('maps five tiers to CSS variables', () => {
    expect(scoreToRepoColorVar(95)).toBe('var(--color-score-high)');
    expect(scoreToRepoColorVar(80)).toBe('var(--color-score-cyan)');
    expect(scoreToRepoColorVar(65)).toBe('var(--color-score-medium)');
    expect(scoreToRepoColorVar(45)).toBe('var(--color-score-orange)');
    expect(scoreToRepoColorVar(10)).toBe('var(--color-score-danger)');
  });

  it('never returns raw hex', () => {
    expect(scoreToRepoColorVar(10)).not.toMatch(/^#/);
  });
});

describe('scoreToGrade', () => {
  it('assigns letter grades at DevMRI thresholds', () => {
    expect(scoreToGrade(REPO_SCORE_THRESHOLDS.EXCELLENT)).toBe('A');
    expect(scoreToGrade(REPO_SCORE_THRESHOLDS.GOOD)).toBe('B');
    expect(scoreToGrade(REPO_SCORE_THRESHOLDS.FAIR)).toBe('C');
    expect(scoreToGrade(REPO_SCORE_THRESHOLDS.POOR)).toBe('D');
    expect(scoreToGrade(0)).toBe('F');
  });
});

describe('contributor palette', () => {
  it('uses neutral CSS vars only', () => {
    expect(CONTRIBUTOR_CHART_STROKES.accent).toBe('var(--contributor-accent)');
    expect(CONTRIBUTOR_CHART_STROKES.line).not.toContain('danger');
  });
});

describe('THEME_STORAGE_KEY', () => {
  it('uses slop-scanner namespace', () => {
    expect(THEME_STORAGE_KEY).toBe('slop-scanner-theme');
  });
});
