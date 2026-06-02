import type { PullRequestPreview } from '@slop-scanner/shared-types';

import { useAnalysisQueueStore } from '../../../stores/analysis-queue.store.js';
import { Card } from '../../ui/Card.js';
import { ScoreBadge } from '../../ui/ScoreBadge.js';
import { PrAnalysisPanel } from '../pr-analysis/PrAnalysisPanel.js';

export interface PrCardListProps {
  readonly prs: readonly PullRequestPreview[];
}

function PrCard({ pr }: { readonly pr: PullRequestPreview }) {
  const analysePr = useAnalysisQueueStore((state) => state.analysePr);
  const getBadgeState = useAnalysisQueueStore((state) => state.getBadgeState);
  const expandedPr = useAnalysisQueueStore((state) => state.expandedPr);
  const job = useAnalysisQueueStore((state) => state.jobs[pr.number]);
  const badgeState = getBadgeState(pr.number);
  const isExpanded = expandedPr === pr.number;
  const isAnalysing = badgeState === 'analysing';

  return (
    <Card variant="module" className={isAnalysing ? 'shimmer-skeleton' : ''}>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => analysePr(pr.number)}
        aria-expanded={isExpanded}
      >
        <div>
          <h3 className="font-semibold text-text-primary">
            #{String(pr.number)} {pr.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-muted">{pr.author}</p>
        </div>
        <ScoreBadge
          state={badgeState}
          {...(job?.result?.score.total != null
            ? { score: job.result.score.total }
            : {})}
        />
      </button>
      {isExpanded && job?.status === 'complete' && job.result && (
        <PrAnalysisPanel signals={job.result.signals} total={job.result.score.total} />
      )}
      {isExpanded && job?.status === 'waiting' && (
        <p className="mt-3 text-sm text-muted">Waiting for analysis slot…</p>
      )}
    </Card>
  );
}

/** Tier 1 pull request preview list with inline Tier 2 analysis. */
export function PrCardList({ prs }: PrCardListProps) {
  if (prs.length === 0) {
    return <p className="text-sm text-muted">No pull requests in preview window.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {prs.map((pr) => (
        <PrCard key={pr.number} pr={pr} />
      ))}
    </div>
  );
}
