import type { ContributorSummary as ContributorRow } from '@slop-scanner/shared-types';

import { useContributorProfile } from '../../../hooks/use-contributor-profile.js';
import { Button } from '../../ui/Button.js';
import { Card } from '../../ui/Card.js';
import { ContributorProfileDrawer } from '../contributors/ContributorProfileDrawer.js';

export interface ContributorSummaryProps {
  readonly contributors: readonly ContributorRow[];
  readonly scanId: string | null;
}

function sortedContributors(rows: readonly ContributorRow[]): ContributorRow[] {
  return [...rows].sort((a, b) => a.login.localeCompare(b.login));
}

/** Alphabetical contributor summary — never ranked by score. */
export function ContributorSummary({ contributors, scanId }: ContributorSummaryProps) {
  const ordered = sortedContributors(contributors);
  const { profile, loading, error, loadProfile, clearProfile } = useContributorProfile(scanId);

  return (
    <Card variant="module">
      <header className="mb-3">
        <h2 className="section-label">Contributors</h2>
        <p className="text-sm text-muted">
          {String(ordered.length)} contributors · alphabetical listing
        </p>
      </header>
      <ul className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto">
        {ordered.map((contributor) => (
          <li
            key={contributor.login}
            className="flex items-center justify-between gap-2 rounded px-3 py-2 text-sm"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <span className="font-medium text-contributor-accent">{contributor.login}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-contributor-muted">
                {String(contributor.prCount)} PRs · {String(contributor.commitCount)} commits
              </span>
              <Button
                variant="ghost"
                type="button"
                className="!px-2 !py-1 text-xs"
                onClick={() => loadProfile(contributor.login)}
                aria-label={`View profile for ${contributor.login}`}
              >
                Profile
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <ContributorProfileDrawer
        profile={profile}
        loading={loading}
        error={error}
        onClose={clearProfile}
      />
    </Card>
  );
}
