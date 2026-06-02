import type { CommitMessage } from '@slop-scanner/shared-types';
import { describe, expect, it } from 'vitest';

import { SCAN_LIMITS } from '../config/scan-limits.js';

import { capCommits } from './scan-helpers.js';

describe('capCommits', () => {
  it('limits commits to MAX_COMMITS', () => {
    const commits: CommitMessage[] = Array.from({ length: 101 }, (_, index) => ({
      sha: String(index),
      message: `commit ${String(index)}`,
      author: 'dev',
      committedAt: '2026-01-01T00:00:00.000Z',
    }));

    const capped = capCommits(commits);
    expect(capped).toHaveLength(SCAN_LIMITS.MAX_COMMITS);
  });

  it('returns empty array for empty input', () => {
    expect(capCommits([])).toEqual([]);
  });

  it('keeps order for small batches', () => {
    const commits: CommitMessage[] = [
      {
        sha: 'a',
        message: 'first',
        author: 'dev',
        committedAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    expect(capCommits(commits)[0]?.sha).toBe('a');
  });
});
