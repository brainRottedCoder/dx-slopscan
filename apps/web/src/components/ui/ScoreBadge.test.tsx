import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScoreBadge } from './ScoreBadge.js';

describe('ScoreBadge', () => {
  it('renders pending state', () => {
    const { container } = render(<ScoreBadge state="pending" />);
    expect(screen.getByText('—')).toBeDefined();
    expect(container.querySelector('.badge-analysing')).toBeNull();
  });

  it('renders analysing state with pulse', () => {
    const { container } = render(<ScoreBadge state="analysing" />);
    expect(screen.getByText('···')).toBeDefined();
    expect(container.querySelector('.badge-analysing')).not.toBeNull();
  });

  it('renders scored state with numeric value', () => {
    render(<ScoreBadge state="scored" score={72} />);
    expect(screen.getByText('72')).toBeDefined();
  });
});
