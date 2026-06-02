import { scoreToRepoColorVar } from '../../constants/theme.js';

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 10;
const SIZE = 200;
const CENTER = SIZE / 2;

export interface ScoreGaugeProps {
  readonly score: number;
  readonly label?: string;
}

/** Clean modern SVG circular gauge for repo health. */
export function ScoreGauge({ score, label = 'Health' }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  const stroke = scoreToRepoColorVar(clamped);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: SIZE / 2, height: SIZE / 2 }}>
        <svg width={SIZE / 2} height={SIZE / 2} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          {/* Background track */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--bg-surface)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress arc */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={stroke}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={{ transition: 'stroke-dashoffset 0.7s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none" style={{ color: stroke, fontFamily: 'var(--font-mono)' }}>
            {String(Math.round(clamped))}
          </span>
        </div>
      </div>
      <span className="score-label">{label}</span>
    </div>
  );
}
