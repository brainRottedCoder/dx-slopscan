import type { ContributorProfile } from '@slop-scanner/shared-types';
import { useCallback, useState } from 'react';

import { fetchContributorProfile } from '../services/analysis-api.js';

export interface UseContributorProfileResult {
  readonly profile: ContributorProfile | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly loadProfile: (login: string) => void;
  readonly clearProfile: () => void;
}

/** Loads contributor Tier 2 profile via analysis API. */
export function useContributorProfile(scanId: string | null): UseContributorProfileResult {
  const [profile, setProfile] = useState<ContributorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
    setLoading(false);
  }, []);

  const loadProfile = useCallback(
    (login: string) => {
      if (!scanId) {
        setError('Scan not ready');
        return;
      }

      setLoading(true);
      setError(null);

      void fetchContributorProfile(scanId, login)
        .then((result) => {
          setProfile(result);
          setLoading(false);
        })
        .catch(() => {
          setError('Could not load contributor profile');
          setLoading(false);
        });
    },
    [scanId],
  );

  return { profile, loading, error, loadProfile, clearProfile };
}
