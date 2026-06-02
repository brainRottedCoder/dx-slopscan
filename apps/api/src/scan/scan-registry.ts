import { ScanCache } from '../cache/sqlite.cache.js';
import { env } from '../config/env.js';
import { openDatabase, type SqliteDatabase } from '../db/client.js';
import { SseManager } from '../sse/sse-manager.js';

let database: SqliteDatabase | null = null;
let cache: ScanCache | null = null;
let sseManager: SseManager | null = null;

export function getScanDatabase(): SqliteDatabase {
  if (!database) {
    database = openDatabase(env.DB_PATH);
  }
  return database;
}

export function getScanCache(): ScanCache {
  if (!cache) {
    cache = new ScanCache(getScanDatabase());
    cache.invalidateOlderThan(env.SCAN_CACHE_TTL_HOURS);
  }
  return cache;
}

export function getSseManager(): SseManager {
  if (!sseManager) {
    sseManager = new SseManager();
  }
  return sseManager;
}

/** Reset singletons between tests. */
export function resetScanRegistry(): void {
  database?.close();
  database = null;
  cache = null;
  sseManager = null;
}

export function configureScanRegistryForTests(options: {
  readonly dbPath?: string;
  readonly cache?: ScanCache;
  readonly sse?: SseManager;
}): void {
  resetScanRegistry();
  if (options.dbPath) {
    database = openDatabase(options.dbPath);
    cache = options.cache ?? new ScanCache(database);
  } else if (options.cache) {
    cache = options.cache;
  }
  if (options.sse) {
    sseManager = options.sse;
  }
}
