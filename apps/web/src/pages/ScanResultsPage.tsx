import { useEffect } from 'react';

import { RepoTreemap } from '../components/features/heatmap/RepoTreemap.js';
import { ContributorSummary } from '../components/features/scan/ContributorSummary.js';
import { LiveProgressTimeline } from '../components/features/scan/LiveProgressTimeline.js';
import { PrCardList } from '../components/features/scan/PrCardList.js';
import { RepoHealthScoreCard } from '../components/features/scan/RepoHealthScoreCard.js';
import { ScanNoticeBanner } from '../components/features/scan/ScanNoticeBanner.js';
import { VirtualizedTreeList } from '../components/features/scan/VirtualizedTreeList.js';
import { Button } from '../components/ui/Button.js';
import { useAnalysisQueueStore } from '../stores/analysis-queue.store.js';
import { useScanStore } from '../stores/scan.store.js';
import { toArboristNodes } from '../utils/tree-data.js';

/** Clean Tier 1 scan results dashboard. */
export function ScanResultsPage() {
  const status = useScanStore((state) => state.status);
  const result = useScanStore((state) => state.result);
  const progress = useScanStore((state) => state.progress);
  const reset = useScanStore((state) => state.reset);
  const errorMessage = useScanStore((state) => state.errorMessage);
  const scanId = useScanStore((state) => state.scanId);
  const setAnalysisScanId = useAnalysisQueueStore((state) => state.setScanId);

  useEffect(() => {
    setAnalysisScanId(scanId);
  }, [scanId, setAnalysisScanId]);

  const isScanning = status === 'scanning';

  return (
    <main className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label">Scan report</p>
          <h1 className="text-xl font-bold text-text-primary">
            {result?.repoFullName ?? 'Scan in progress'}
          </h1>
          <p className="text-sm text-muted">Tier 1 overview</p>
        </div>
        <Button variant="ghost" type="button" onClick={reset}>
          New scan
        </Button>
      </header>

      <LiveProgressTimeline events={progress} />

      {result?.scanWarnings && <ScanNoticeBanner notices={result.scanWarnings} />}

      {status === 'error' && (
        <div className="rounded-lg border border-red/30 bg-red/5 p-4">
          <p className="text-sm text-red">{errorMessage ?? 'Scan failed'}</p>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className="grid-2">
            <RepoHealthScoreCard healthScore={result.healthScore} />
            <ContributorSummary contributors={result.contributors} scanId={scanId} />
          </div>
          <section>
            <h2 className="section-label mb-2">Folder heatmap</h2>
            <RepoTreemap heatmap={result.heatmap} scanning={isScanning} />
          </section>
          <section>
            <h2 className="section-label mb-2">File tree</h2>
            <VirtualizedTreeList data={toArboristNodes(result.tree)} />
          </section>
          <section>
            <h2 className="section-label mb-2">Pull requests</h2>
            <PrCardList prs={result.prs} />
          </section>
        </div>
      )}
    </main>
  );
}
