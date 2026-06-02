import type { AnalysisBadgeState } from '@slop-scanner/shared-types';

import { scoreToRepoColorVar } from '../../constants/theme.js';

import { Badge } from './Badge.js';

export interface ScoreBadgeProps {
  readonly state: AnalysisBadgeState;
  readonly score?: number;
}

/** Three-state analysis badge for PR cards and tree rows. */
export function ScoreBadge({ state, score }: ScoreBadgeProps) {
  if (state === 'pending') {
    return (
      <Badge variant="pending" aria-label="Analysis pending">
        —
      </Badge>
    );
  }

  if (state === 'analysing') {
    return (
      <Badge variant="analysing" aria-label="Analysis in progress">
        ···
      </Badge>
    );
  }

  if (state === 'scored' && score != null) {
    return (
      <span
        className="badge font-mono font-semibold"
        style={{
          color: scoreToRepoColorVar(score),
          borderColor: scoreToRepoColorVar(score),
          background: 'rgba(var(--scan-cyan-rgb), 0.08)',
        }}
        aria-label={`Score ${String(score)}`}
      >
        {String(score)}
      </span>
    );
  }

  return (
    <Badge variant="pending" aria-label={`Analysis ${state}`}>
      —
    </Badge>
  );
}
