import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LiveProgressTimeline } from './LiveProgressTimeline.js';

describe('LiveProgressTimeline', () => {
  it('renders human-readable event labels', () => {
    render(
      <LiveProgressTimeline
        events={[
          {
            type: 'scan:tree_done',
            scanId: 's1',
            payload: {},
            timestamp: '2026-01-01T00:00:00.000Z',
          },
          {
            type: 'scan:complete',
            scanId: 's1',
            payload: {},
            timestamp: '2026-01-01T00:00:01.000Z',
          },
        ]}
      />,
    );

    expect(screen.getByText(/Tree/)).toBeDefined();
    expect(screen.getByText(/Complete/)).toBeDefined();
  });
});
