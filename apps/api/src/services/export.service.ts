import type { ExportableReport, Tier1ScanResult } from '@slop-scanner/shared-types';

import { SCAN_LIMITS } from '../config/scan-limits.js';

import { exportableReportSchema } from './export.schema.js';

const BANNED_KEY = /(slop|artificial|ai[A-Z_])/i;
const SECRET_PATTERN =
  /(ghp_[a-zA-Z0-9]{20,}|github_pat_[a-zA-Z0-9_]+|Bearer\s+[a-zA-Z0-9._-]+)/;

const EXPORT_NOTE =
  'Scores represent information density and review quality signals, not authorship detection.';

function stripBannedKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => stripBannedKeys(entry));
  }
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (BANNED_KEY.test(key)) continue;
      output[key] = stripBannedKeys(nested);
    }
    return output;
  }
  return value;
}

/** Build a compliance-safe JSON export from a completed Tier 1 scan. */
export function generateJsonReport(
  scanId: string,
  result: Tier1ScanResult,
): ExportableReport {
  const report: ExportableReport = {
    meta: {
      repo: result.repoFullName,
      scanId,
      generatedAt: new Date().toISOString(),
      scopeLimits: { ...SCAN_LIMITS },
      note: EXPORT_NOTE,
    },
    health: result.healthScore,
    prPreviews: result.prs.map((pr) => ({
      number: pr.number,
      title: pr.title,
      author: pr.author,
      state: pr.state,
    })),
    commitScores: result.commitResult,
    docScores: result.docScan,
    contributors: result.contributors.map((contributor) => ({
      login: contributor.login,
      prCount: contributor.prCount,
      commitCount: contributor.commitCount,
    })),
  };

  return report;
}

/** Validate export JSON and ensure no secrets or banned keys appear. */
export function validateExportReport(report: ExportableReport): ExportableReport {
  const sanitized = stripBannedKeys(report) as ExportableReport;
  const parsed = exportableReportSchema.parse(sanitized);
  const serialized = JSON.stringify(parsed);
  if (SECRET_PATTERN.test(serialized)) {
    throw new Error('Export contains sensitive token patterns');
  }
  if (BANNED_KEY.test(serialized)) {
    throw new Error('Export contains banned field names');
  }
  return parsed as ExportableReport;
}
