import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { generateMockTree } from '../../../utils/tree-data.js';

import { VirtualizedTreeList } from './VirtualizedTreeList.js';

describe('VirtualizedTreeList', () => {
  it('renders without crashing for 500 nodes', () => {
    render(<VirtualizedTreeList data={generateMockTree(500)} height={300} />);
    expect(screen.getByText(/file-0\.ts/)).toBeDefined();
  });

  it('shows score badges on leaf rows', () => {
    render(
      <VirtualizedTreeList
        data={[{ id: 'README.md', name: 'README.md', score: 88 }]}
        height={120}
      />,
    );
    expect(screen.getByText('88')).toBeDefined();
  });
});
