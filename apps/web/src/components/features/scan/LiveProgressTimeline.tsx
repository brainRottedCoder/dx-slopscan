import type { SseEvent } from '@slop-scanner/shared-types';

export interface LiveProgressTimelineProps {
  readonly events: readonly SseEvent[];
}

const STEP_ORDER = [
  { type: 'scan:started', label: 'Scan started' },
  { type: 'scan:tree_done', label: 'Tree' },
  { type: 'scan:prs_done', label: 'PRs' },
  { type: 'scan:commits_done', label: 'Commits' },
  { type: 'scan:docs_done', label: 'Docs' },
  { type: 'scan:complete', label: 'Complete' },
] as const;

function getStepStatus(
  stepType: string,
  events: readonly SseEvent[],
): 'pending' | 'active' | 'completed' {
  const eventIndex = events.findIndex((e) => e.type === stepType);
  if (eventIndex === -1) return 'pending';
  const isLast = eventIndex === events.length - 1;
  return isLast && stepType !== 'scan:complete' ? 'active' : 'completed';
}

/** Modern step progress bar for scan status. */
export function LiveProgressTimeline({ events }: LiveProgressTimelineProps) {
  if (events.length === 0) return null;

  const hasError = events.some((e) => e.type === 'scan:error');

  return (
    <section className="animate-fade-in-up">
      <div className="step-progress">
        {STEP_ORDER.map((step, index) => {
          const status = hasError && step.type !== 'scan:started' ? 'pending' : getStepStatus(step.type, events);
          const isLast = index === STEP_ORDER.length - 1;

          return (
            <div key={step.type} className="flex items-center">
              <div className={`step-item ${status}`}>
                <span className="step-dot" />
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {!isLast && <div className="step-connector" />}
            </div>
          );
        })}
      </div>
      {hasError && (
        <p className="mt-2 text-sm text-red" role="alert">
          Scan encountered an error. Partial results may be available below.
        </p>
      )}
    </section>
  );
}
