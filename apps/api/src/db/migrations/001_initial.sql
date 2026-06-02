-- Initial schema (mirrors apps/api/src/db/schema.ts)

CREATE TABLE IF NOT EXISTS scans (
  id             TEXT PRIMARY KEY,
  repo_full_name TEXT NOT NULL,
  head_sha       TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at   TEXT,
  summary_json   TEXT,
  result_path    TEXT
);

CREATE INDEX IF NOT EXISTS idx_scans_repo ON scans(repo_full_name);
CREATE INDEX IF NOT EXISTS idx_scans_sha  ON scans(head_sha);
CREATE INDEX IF NOT EXISTS idx_scans_repo_sha ON scans(repo_full_name, head_sha);

CREATE TABLE IF NOT EXISTS contributor_baselines (
  login          TEXT NOT NULL,
  repo_full_name TEXT NOT NULL,
  stats_json     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  PRIMARY KEY (login, repo_full_name)
);
