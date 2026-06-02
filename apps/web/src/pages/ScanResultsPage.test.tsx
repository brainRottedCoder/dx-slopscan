import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useScanStore } from '../stores/scan.store.js';

import { ScanResultsPage } from './ScanResultsPage.js';

describe('ScanResultsPage', () => {
  it('shows empty activity notice when scan has no PRs or commits', () => {
    useScanStore.setState({
      status: 'complete',
      scanId: 'scan-empty',
      result: {
        scanId: 'scan-empty',
        repoFullName: 'octo/empty',
        tree: [],
        heatmap: [],
        prs: [],
        commitResult: null,
        docScan: null,
        healthScore: { total: 0, grade: 'F', signals: [], computedAt: '' },
        contributors: [],
        completedAt: new Date().toISOString(),
        scanWarnings: ['No recent activity to analyse in the preview window.'],
      },
      progress: [],
      errorMessage: null,
    });

    render(<ScanResultsPage />);
    expect(screen.getByText(/No recent activity/i)).toBeDefined();
  });
});
