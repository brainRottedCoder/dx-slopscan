import { describe, expect, it, vi } from 'vitest';

import { createRestClient, fetchFullFileFallback, isDiffTruncated } from './rest-client.js';

describe('isDiffTruncated', () => {
  it('detects ellipsis hunk marker', () => {
    expect(isDiffTruncated('@@ ... @@\n+line')).toBe(true);
  });

  it('detects trailing truncation suffix', () => {
    expect(isDiffTruncated('patch\n\\ No newline at end of file\n...')).toBe(true);
  });

  it('returns false for complete diff', () => {
    expect(isDiffTruncated('@@ -1,3 +1,3 @@\n+hello')).toBe(false);
  });
});

describe('fetchFullFileFallback', () => {
  it('delegates to rest client through pool', async () => {
    const client = createRestClient('token');
    const spy = vi.spyOn(client, 'fetchRawFileContent').mockResolvedValue('file body');

    const content = await fetchFullFileFallback(client, 'octo', 'repo', 'README.md', 'main');
    expect(content).toBe('file body');
    expect(spy).toHaveBeenCalledWith('octo', 'repo', 'README.md', 'main');
  });
});
