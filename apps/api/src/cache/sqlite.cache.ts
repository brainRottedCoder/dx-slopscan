import type { Tier1ScanResult } from '@slop-scanner/shared-types';

import type { SqliteDatabase } from '../db/client.js';

export interface StoredScan {
  readonly scanId: string;
  readonly repoFullName: string;
  readonly headSha: string;
  readonly result: Tier1ScanResult;
  readonly createdAt: string;
}

export interface CompletedScan {
  readonly scanId: string;
  readonly repoFullName: string;
  readonly headSha: string;
  readonly result: Tier1ScanResult;
}

interface ScanRow {
  readonly id: string;
  readonly repo_full_name: string;
  readonly head_sha: string;
  readonly status: string;
  readonly created_at: string;
  readonly completed_at: string | null;
  readonly summary_json: string | null;
}

/** SQLite-backed scan result cache keyed by repo + HEAD SHA. */
export class ScanCache {
  constructor(private readonly db: SqliteDatabase) {}

  isCachedBySha(repoFullName: string, headSha: string): boolean {
    return this.getScanBySha(repoFullName, headSha) !== null;
  }

  getScanBySha(repoFullName: string, headSha: string): StoredScan | null {
    const row = this.db
      .prepare(
        `SELECT id, repo_full_name, head_sha, status, created_at, completed_at, summary_json
         FROM scans
         WHERE repo_full_name = ? AND head_sha = ? AND status IN ('complete', 'cached')
         ORDER BY datetime(completed_at) DESC
         LIMIT 1`,
      )
      .get(repoFullName, headSha) as ScanRow | undefined;

    if (!row?.summary_json) return null;

    const result = JSON.parse(row.summary_json) as Tier1ScanResult;
    return {
      scanId: row.id,
      repoFullName: row.repo_full_name,
      headSha: row.head_sha,
      result: { ...result, scanId: row.id },
      createdAt: row.created_at,
    };
  }

  storeScan(scan: CompletedScan): void {
    const completedAt = scan.result.completedAt;
    this.db
      .prepare(
        `INSERT INTO scans (id, repo_full_name, head_sha, status, created_at, completed_at, summary_json)
         VALUES (?, ?, ?, 'complete', datetime('now'), ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           status = excluded.status,
           completed_at = excluded.completed_at,
           summary_json = excluded.summary_json`,
      )
      .run(
        scan.scanId,
        scan.repoFullName,
        scan.headSha,
        completedAt,
        JSON.stringify(scan.result),
      );
  }

  upsertPendingScan(scanId: string, repoFullName: string, headSha: string): void {
    this.db
      .prepare(
        `INSERT INTO scans (id, repo_full_name, head_sha, status)
         VALUES (?, ?, ?, 'pending')
         ON CONFLICT(id) DO UPDATE SET status = 'pending'`,
      )
      .run(scanId, repoFullName, headSha);
  }

  updateHeadSha(scanId: string, headSha: string): void {
    this.db.prepare(`UPDATE scans SET head_sha = ? WHERE id = ?`).run(headSha, scanId);
  }

  markRunning(scanId: string): void {
    this.db.prepare(`UPDATE scans SET status = 'running' WHERE id = ?`).run(scanId);
  }

  markCached(scanId: string, result: Tier1ScanResult): void {
    this.db
      .prepare(
        `UPDATE scans
         SET status = 'cached', completed_at = ?, summary_json = ?
         WHERE id = ?`,
      )
      .run(result.completedAt, JSON.stringify(result), scanId);
  }

  markComplete(scanId: string, result: Tier1ScanResult): void {
    this.db
      .prepare(
        `UPDATE scans
         SET status = 'complete', completed_at = ?, summary_json = ?
         WHERE id = ?`,
      )
      .run(result.completedAt, JSON.stringify(result), scanId);
  }

  markError(scanId: string): void {
    this.db.prepare(`UPDATE scans SET status = 'error' WHERE id = ?`).run(scanId);
  }

  getScanById(scanId: string): StoredScan | null {
    const row = this.db
      .prepare(
        `SELECT id, repo_full_name, head_sha, status, created_at, completed_at, summary_json
         FROM scans WHERE id = ?`,
      )
      .get(scanId) as ScanRow | undefined;

    if (!row?.summary_json) return null;

    const result = JSON.parse(row.summary_json) as Tier1ScanResult;
    return {
      scanId: row.id,
      repoFullName: row.repo_full_name,
      headSha: row.head_sha,
      result: { ...result, scanId: row.id },
      createdAt: row.created_at,
    };
  }

  getScanStatus(scanId: string): { status: string; progress: string[] } | null {
    const row = this.db
      .prepare(`SELECT status, summary_json FROM scans WHERE id = ?`)
      .get(scanId) as { status: string; summary_json: string | null } | undefined;

    if (!row) return null;

    const progress: string[] = [];
    if (row.summary_json) {
      try {
        const parsed = JSON.parse(row.summary_json) as { progress?: string[] };
        if (parsed.progress) progress.push(...parsed.progress);
      } catch {
        // ignore malformed cache payload
      }
    }

    return { status: row.status, progress };
  }

  invalidateOlderThan(hours: number): number {
    const result = this.db
      .prepare(
        `DELETE FROM scans
         WHERE completed_at IS NOT NULL
           AND datetime(completed_at) < datetime('now', ?)`,
      )
      .run(`-${String(hours)} hours`);

    return result.changes;
  }
}
