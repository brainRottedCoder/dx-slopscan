import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const BANNED_FIELD_PATTERN = /\b(ai|slop|artificial)[A-Z_]/i;
const BANNED_JSON_KEY = /"(ai|slop|artificial)[^"]*"\s*:/i;

function collectTypeScriptFiles(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...collectTypeScriptFiles(fullPath));
      continue;
    }
    if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function resolveSharedTypesRoot(): string {
  const candidates = [
    join(process.cwd(), '..', '..', 'packages', 'shared-types', 'src'),
    join(process.cwd(), 'packages', 'shared-types', 'src'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error('shared-types src directory not found');
}

describe('API compliance — banned terminology in field names', () => {
  it('shared-types exports contain no banned field identifiers', () => {
    const root = resolveSharedTypesRoot();
    const files = collectTypeScriptFiles(root);
    const violations: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (BANNED_FIELD_PATTERN.test(line)) {
          violations.push(`${file}: ${line.trim()}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('domain error responses expose userMessage not banned keys', () => {
    const sample = {
      code: 'PRIVATE_REPO',
      error: 'Repository is private',
      userMessage: 'This repository is private. Ensure you have authorized access via GitHub OAuth.',
    };
    const serialized = JSON.stringify(sample);
    expect(BANNED_JSON_KEY.test(serialized)).toBe(false);
    expect(serialized).toContain('userMessage');
  });
});
