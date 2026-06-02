import type { SignalScore } from '@slop-scanner/shared-types';

import { Card } from '../../ui/Card.js';

export interface PrAnalysisPanelProps {
  readonly signals: readonly SignalScore[];
  readonly total: number;
}

function SignalRow({ signal }: { readonly signal: SignalScore }) {
  const width = Math.round(signal.value * 100);
  return (
    <div className="rec-card space-y-2">
      <div className="flex justify-between font-mono text-xs text-muted">
        <span>{signal.signal.replace(/_/g, ' ')}</span>
        <span>{String(width)}%</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${String(width)}%` }} role="meter" />
      </div>
      <p className="text-xs text-secondary">{signal.explanation}</p>
    </div>
  );
}

/** Inline PR deep-analysis breakdown with four signal rows. */
export function PrAnalysisPanel({ signals, total }: PrAnalysisPanelProps) {
  const rows = signals.slice(0, 4);

  return (
    <Card className="mt-4" aria-label="Pull request analysis breakdown">
      <p className="text-sm font-semibold text-cyan">
        Information density score: {String(total)}
      </p>
      <div className="mt-4 space-y-3">
        {rows.map((signal) => (
          <SignalRow key={signal.signal} signal={signal} />
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        What this means: lower overlap between the description and visible diff changes,
        plus more specific claims, usually indicates stronger review quality signals.
      </p>
    </Card>
  );
}
