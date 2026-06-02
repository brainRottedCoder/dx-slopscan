import { describe, expect, it } from 'vitest';

import { MemoryCache } from './memory.cache.js';

describe('MemoryCache', () => {
  it('stores and retrieves values before ttl', () => {
    const cache = new MemoryCache<string>();
    cache.set('key', 'value', 60_000);
    expect(cache.get('key')).toBe('value');
  });

  it('expires values after ttl', async () => {
    const cache = new MemoryCache<string>();
    cache.set('key', 'value', 1);
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(cache.get('key')).toBeUndefined();
  });
});
