'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('dx-slopscan-theme') as Theme | null;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.classList.toggle('light-theme', initial === 'light');
    document.documentElement.classList.toggle('dark-theme', initial === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('dx-slopscan-theme', next);
      document.documentElement.classList.toggle('light-theme', next === 'light');
      document.documentElement.classList.toggle('dark-theme', next === 'dark');
      return next;
    });
  }, []);

  // Prevent flash — render nothing until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─── Theme Toggle Button ─── */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 hover:border-[var(--scan-cyan)] hover:bg-black/5"
      style={{
        background: 'none',
        border: '1px solid var(--border2)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '1.1rem',
      }}
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
