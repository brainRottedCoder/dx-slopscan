import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LandingBoot } from './LandingBoot.js';

describe('LandingBoot', () => {
  it('completes immediately in test environment', async () => {
    const onComplete = vi.fn();
    render(<LandingBoot onComplete={onComplete} />);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
