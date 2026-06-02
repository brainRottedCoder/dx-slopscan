import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PrAnalysisPanel } from './PrAnalysisPanel.js';

const SIGNALS = [
  { signal: 'lexical_overlap', value: 0.4, weight: 0.25, explanation: 'Overlap noted' },
  { signal: 'concrete_claims', value: 0.3, weight: 0.3, explanation: 'Few claims' },
  { signal: 'embedding_similarity', value: 0.5, weight: 0.3, explanation: 'Similar' },
  { signal: 'hedging_density', value: 0.6, weight: 0.15, explanation: 'Hedging' },
] as const;

describe('PrAnalysisPanel', () => {
  it('renders four signal rows', () => {
    render(<PrAnalysisPanel signals={SIGNALS} total={62} />);
    expect(screen.getByText(/lexical overlap/i)).toBeDefined();
    expect(screen.getByText(/concrete claims/i)).toBeDefined();
    expect(screen.getByText(/embedding similarity/i)).toBeDefined();
    expect(screen.getByText(/hedging density/i)).toBeDefined();
  });

  it('avoids banned terminology', () => {
    const { container } = render(<PrAnalysisPanel signals={SIGNALS} total={62} />);
    expect(container.textContent?.toLowerCase()).not.toContain('slop');
    expect(container.textContent?.toLowerCase()).not.toContain('artificial');
  });
});
