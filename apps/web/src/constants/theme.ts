/** Tailwind score token names — mirror tailwind.config.ts score.* keys. */
export const SCORE_COLOR_TOKENS = {
  HIGH: 'score-high',
  MEDIUM: 'score-medium',
  LOW: 'score-low',
  DANGER: 'score-danger',
  CYAN: 'score-cyan',
  ORANGE: 'score-orange',
} as const;

export const REPO_SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 60,
  POOR: 40,
} as const;

const REPO_COLOR_VARS = [
  { min: REPO_SCORE_THRESHOLDS.EXCELLENT, varName: '--color-score-high' },
  { min: REPO_SCORE_THRESHOLDS.GOOD, varName: '--color-score-cyan' },
  { min: REPO_SCORE_THRESHOLDS.FAIR, varName: '--color-score-medium' },
  { min: REPO_SCORE_THRESHOLDS.POOR, varName: '--color-score-orange' },
  { min: 0, varName: '--color-score-danger' },
] as const;

/** Repo-level heatmap / PR score color (5-tier DevMRI scale). */
export function scoreToRepoColorVar(score: number): string {
  for (const tier of REPO_COLOR_VARS) {
    if (score >= tier.min) return `var(${tier.varName})`;
  }
  return 'var(--color-score-danger)';
}

/** Letter grade for display badges. */
export function scoreToGrade(score: number): string {
  if (score >= REPO_SCORE_THRESHOLDS.EXCELLENT) return 'A';
  if (score >= REPO_SCORE_THRESHOLDS.GOOD) return 'B';
  if (score >= REPO_SCORE_THRESHOLDS.FAIR) return 'C';
  if (score >= REPO_SCORE_THRESHOLDS.POOR) return 'D';
  return 'F';
}

export function gradeToClassName(grade: string): string {
  const map: Record<string, string> = {
    A: 'grade-a',
    B: 'grade-b',
    C: 'grade-c',
    D: 'grade-d',
    F: 'grade-f',
  };
  return map[grade] ?? 'grade-c';
}

/** Contributor charts — neutral blue/cyan only (COMPLIANCE). */
export const CONTRIBUTOR_CHART_STROKES = {
  line: 'var(--contributor-line)',
  grid: 'var(--contributor-muted)',
  accent: 'var(--contributor-accent)',
  dot: 'var(--contributor-accent)',
} as const;

export const THEME_STORAGE_KEY = 'slop-scanner-theme';

export type AppTheme = 'light' | 'dark';
