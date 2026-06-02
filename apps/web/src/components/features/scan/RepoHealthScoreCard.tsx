import type { CompositeScore } from '@slop-scanner/shared-types';
import { useEffect, useState } from 'react';

import { gradeToClassName } from '../../../constants/theme.js';
import { Badge } from '../../ui/Badge.js';
import { Card } from '../../ui/Card.js';
import { ScoreGauge } from '../../ui/ScoreGauge.js';

export interface RepoHealthScoreCardProps {
  readonly healthScore: CompositeScore;
}

const CHIP_LABELS = ['PR quality', 'Commit patterns', 'Documentation'] as const;

function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setValue(target);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

/** Overall repository health score with SVG gauge. */
export function RepoHealthScoreCard({ healthScore }: RepoHealthScoreCardProps) {
  const animatedTotal = useCountUp(healthScore.total);
  const gradeClass = gradeToClassName(healthScore.grade);

  return (
    <Card variant="module">
      <p className="section-label">Repository health</p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <ScoreGauge score={animatedTotal} />
        <span className={`grade-badge ${gradeClass}`}>{healthScore.grade}</span>
      </div>
      {healthScore.relativeLabel && (
        <p className="mt-3 text-sm text-secondary">
          Compared to OSS median: {healthScore.relativeLabel}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {CHIP_LABELS.map((label) => (
          <Badge key={label} variant="info">
            {label}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
