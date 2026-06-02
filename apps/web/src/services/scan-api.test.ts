import { describe, expect, it, vi } from 'vitest';

import { startScan } from './scan-api.js';

describe('startScan', () => {
  it('surfaces API userMessage for private repositories', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 403,
        ok: false,
        json: async () => ({
          userMessage:
            'This repository is private. Ensure you have authorized access via GitHub OAuth.',
        }),
      }),
    );

    await expect(startScan('https://github.com/acme/private')).rejects.toThrow(
      /authorized access via GitHub OAuth/i,
    );

    vi.unstubAllGlobals();
  });
});
