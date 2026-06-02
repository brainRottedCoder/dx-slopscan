import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScanNoticeBanner } from './ScanNoticeBanner.js';

describe('ScanNoticeBanner', () => {
  it('shows monorepo warning copy', () => {
    render(
      <ScanNoticeBanner
        notices={['Scanning top 500 files — large monorepo detected.']}
      />,
    );
    expect(screen.getByText(/large monorepo/i)).toBeDefined();
  });

  it('shows non-English capability notice', () => {
    render(
      <ScanNoticeBanner
        notices={['Non-English detected (ja). Embedding-only scoring active.']}
      />,
    );
    expect(screen.getByText(/Embedding-only scoring active/i)).toBeDefined();
  });
});
