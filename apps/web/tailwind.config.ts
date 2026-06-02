import type { Config } from 'tailwindcss';

/**
 * Slop Scanner theme tokens — DevMRI clinical design system.
 * score.* maps to CSS variables in index.css (repo-level heatmap).
 * Contributor views use contributor-accent / info-blue only.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        scan: {
          cyan: 'var(--scan-cyan)',
          'cyan-dim': 'var(--scan-cyan-dim)',
        },
        health: {
          green: 'var(--health-green)',
        },
        score: {
          high: 'var(--health-green)',
          cyan: 'var(--scan-cyan)',
          medium: 'var(--warning-amber)',
          orange: 'var(--warning-orange)',
          low: 'var(--text-muted)',
          danger: 'var(--critical-red)',
        },
        void: 'var(--bg-void)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          hover: 'var(--bg-surface-hover)',
        },
        contributor: {
          accent: 'var(--contributor-accent)',
          muted: 'var(--contributor-muted)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
};

export default config;
