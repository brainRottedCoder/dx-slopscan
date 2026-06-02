import { describe, expect, it, vi } from 'vitest';

import { SseManager } from '../sse/sse-manager.js';

import { analyseDocFile, analyseFolder } from './docs.service.js';

describe('analyseDocFile', () => {
  it('returns sections array', async () => {
    const client = {
      parseRepoUrl: () => ({ owner: 'o', repo: 'r' }),
      rest: {
        fetchRawFileContent: async () => '## Intro\n\nConcrete `AuthService` details.\n',
        getPrDiff: async () => '',
        getAuthenticatedUser: async () => ({ login: 'u', scopes: [] }),
      },
      getRecentPrs: async () => [],
      getRecentCommits: async () => [],
      getFileTree: async () => ({ tree: [], headSha: 'sha' }),
      getTopLevelDocs: async () => [],
      getContributors: async () => [],
      getPullRequest: async () => {
        throw new Error('not used');
      },
    };

    const result = await analyseDocFile('README.md', { owner: 'o', repo: 'r' }, 'sha', 't', () => client);
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.filePath).toBe('README.md');
  });
});

describe('analyseFolder', () => {
  it('emits per-file SSE events', async () => {
    const sse = new SseManager();
    const events: string[] = [];
    const originalEmit = sse.emit.bind(sse);
    vi.spyOn(sse, 'emit').mockImplementation((scanId, event) => {
      events.push(event.type);
      originalEmit(scanId, event);
    });

    const client = {
      parseRepoUrl: () => ({ owner: 'o', repo: 'r' }),
      rest: {
        fetchRawFileContent: async () => 'README content with specifics.',
        getPrDiff: async () => '',
        getAuthenticatedUser: async () => ({ login: 'u', scopes: [] }),
      },
      getRecentPrs: async () => [],
      getRecentCommits: async () => [],
      getFileTree: async () => ({ tree: [], headSha: 'sha' }),
      getTopLevelDocs: async () => [],
      getContributors: async () => [],
      getPullRequest: async () => {
        throw new Error('not used');
      },
    };

    await analyseFolder(
      'scan-1',
      '.',
      [{ path: 'README.md', name: 'README.md', type: 'file' }],
      { owner: 'o', repo: 'r' },
      'sha',
      't',
      sse,
      () => client,
    );

    expect(events).toContain('analysis:folder_file_done');
    expect(events).toContain('analysis:folder_complete');
  });
});
