import { describe, expect, it } from 'vitest';

import type { SseEvent } from './sse.types.js';

describe('SseEvent', () => {
  it('accepts typed payloads', () => {
    const event: SseEvent<{ files: number }> = {
      type: 'scan:tree_done',
      scanId: 'scan-1',
      payload: { files: 42 },
      timestamp: '2026-05-29T00:00:00.000Z',
    };

    expect(event.payload.files).toBe(42);
    expect(event.type).toBe('scan:tree_done');
  });
});
