import { describe, expect, it } from 'vitest';

import { githubPool, MAX_CONCURRENT } from './p-limit-pool.js';

describe('githubPool', () => {
  it('never exceeds MAX_CONCURRENT parallel executions', async () => {
    let running = 0;
    let maxObserved = 0;

    const tasks = Array.from({ length: 10 }, () =>
      githubPool(async () => {
        running += 1;
        maxObserved = Math.max(maxObserved, running);
        await new Promise((resolve) => {
          setTimeout(resolve, 20);
        });
        running -= 1;
      }),
    );

    await Promise.all(tasks);

    expect(MAX_CONCURRENT).toBe(5);
    expect(maxObserved).toBeLessThanOrEqual(MAX_CONCURRENT);
  });
});
