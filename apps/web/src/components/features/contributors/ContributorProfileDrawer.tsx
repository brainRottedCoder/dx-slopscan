import type { ContributorProfile } from '@slop-scanner/shared-types';

import { Button } from '../../ui/Button.js';
import { Card } from '../../ui/Card.js';

import { ContributorTimeline } from './ContributorTimeline.js';

export interface ContributorProfileDrawerProps {
  readonly profile: ContributorProfile | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly onClose: () => void;
}

/** Inline contributor profile with information-density timeline. */
export function ContributorProfileDrawer({
  profile,
  loading,
  error,
  onClose,
}: ContributorProfileDrawerProps) {
  if (!profile && !loading && !error) {
    return null;
  }

  return (
    <Card className="mt-4" aria-live="polite">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="section-label text-contributor-accent">
          {profile ? `${profile.login} profile` : 'Contributor profile'}
        </h3>
        <Button variant="ghost" type="button" className="!px-2 !py-1 text-xs" onClick={onClose}>
          Close
        </Button>
      </div>
      {loading && <p className="text-sm text-muted">Loading profile…</p>}
      {error && <p className="text-sm text-red">{error}</p>}
      {profile && <ContributorTimeline timeline={profile.timeline} />}
    </Card>
  );
}
