import type { InformationDensityPoint } from '@slop-scanner/shared-types';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CONTRIBUTOR_CHART_STROKES } from '../../../constants/theme.js';

export interface ContributorTimelineProps {
  readonly timeline: readonly InformationDensityPoint[];
}

/** Contributor information-density timeline (neutral palette only). */
export function ContributorTimeline({ timeline }: ContributorTimelineProps) {
  const data = timeline.map((point) => ({
    pr: `#${String(point.prNumber)}`,
    informationDensity: point.informationDensity,
  }));

  return (
    <section className="rounded-lg border p-4" style={{ borderColor: 'var(--contributor-line)' }}>
      <h3 className="section-label text-contributor-accent">Recent pull request density</h3>
      <p className="sr-only">Information Density (0–100)</p>
      <div className="mt-4 h-64 w-full min-h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke={CONTRIBUTOR_CHART_STROKES.grid} strokeOpacity={0.3} />
            <XAxis dataKey="pr" tick={{ fill: CONTRIBUTOR_CHART_STROKES.grid }} />
            <YAxis
              domain={[0, 100]}
              label={{
                value: 'Information Density (0–100)',
                angle: -90,
                position: 'insideLeft',
                fill: CONTRIBUTOR_CHART_STROKES.grid,
              }}
              tick={{ fill: CONTRIBUTOR_CHART_STROKES.grid }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="informationDensity"
              stroke={CONTRIBUTOR_CHART_STROKES.line}
              strokeWidth={2}
              dot={{ fill: CONTRIBUTOR_CHART_STROKES.dot }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
