import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSse } from './use-sse.js';

vi.mock('../services/scan-api.js', () => ({
  fetchScanResult: vi.fn().mockResolvedValue({
    scanId: 'scan-abc',
    repoFullName: 'octo/hello',
    tree: [],
    heatmap: [],
    prs: [],
    commitResult: null,
    docScan: null,
    healthScore: { total: 0, grade: 'F', signals: [], computedAt: '' },
    contributors: [],
    completedAt: new Date().toISOString(),
  }),
}));

class MockEventSource {
  static instances: MockEventSource[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  readonly close = vi.fn();

  constructor(public readonly url: string) {
    MockEventSource.instances.push(this);
  }
}

vi.stubGlobal('EventSource', MockEventSource);

describe('useSse', () => {
  afterEach(() => {
    MockEventSource.instances = [];
    vi.clearAllMocks();
  });

  it('calls EventSource.close on unmount', () => {
    const { unmount } = renderHook(() => useSse('scan-abc'));
    const instance = MockEventSource.instances[0];
    expect(instance).toBeDefined();

    unmount();
    expect(instance?.close).toHaveBeenCalled();
  });

  it('does not open a stream without scan id', () => {
    renderHook(() => useSse(null));
    expect(MockEventSource.instances).toHaveLength(0);
  });
});
