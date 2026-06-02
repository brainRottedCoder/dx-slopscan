import { useTheme } from './ThemeProvider.js';

/** Toggles between light and dark clinical themes. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
