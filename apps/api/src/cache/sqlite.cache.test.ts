import { describe, expect, it } from 'vitest';

import { openDatabase } from '../db/client.js';

import { ScanCache } from './sqlite.cache.js';

describe('ScanCache', () => {
  it('stores and retrieves scans by sha', () => {
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);
    const result = {
      scanId: 'scan-a',
      repoFullName: 'octo/repo',
      headSha: 'sha123',
      tree: [],
      heatmap: [],
      prs: [],
      commitResult: null,
      docScan: null,
      healthScore: {
        total: 50,
        grade: 'D' as const,
        signals: [],
        computedAt: new Date().toISOString(),
      },
      contributors: [],
      completedAt: new Date().toISOString(),
    };

    cache.storeScan({
      scanId: 'scan-a',
      repoFullName: 'octo/repo',
      headSha: 'sha123',
      result,
    });

    expect(cache.isCachedBySha('octo/repo', 'sha123')).toBe(true);
    const stored = cache.getScanBySha('octo/repo', 'sha123');
    expect(stored?.result.repoFullName).toBe('octo/repo');
    db.close();
  });

  it('invalidates entries older than ttl window', () => {
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);

    db.prepare(
      `INSERT INTO scans (id, repo_full_name, head_sha, status, created_at, completed_at, summary_json)
       VALUES ('old', 'octo/repo', 'old-sha', 'complete', datetime('now', '-48 hours'), datetime('now', '-48 hours'), '{}')`,
    ).run();

    const removed = cache.invalidateOlderThan(24);
    expect(removed).toBe(1);
    db.close();
  });

  it('returns null for unknown sha', () => {
    const db = openDatabase(':memory:');
    const cache = new ScanCache(db);
    expect(cache.getScanBySha('octo/repo', 'missing')).toBeNull();
    db.close();
  });
});
