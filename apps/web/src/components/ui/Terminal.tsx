import type { ReactNode } from 'react';

export interface TerminalLineProps {
  readonly children: ReactNode;
  readonly tone?: 'default' | 'success' | 'error';
}

export function TerminalLine({ children, tone = 'default' }: TerminalLineProps) {
  const toneClass =
    tone === 'success' ? 'terminal-success' : tone === 'error' ? 'terminal-error' : '';
  return (
    <div className={`flex gap-2 ${toneClass}`.trim()}>
      <span className="terminal-prefix">&gt;</span>
      <span>{children}</span>
    </div>
  );
}

export interface TerminalProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/** Diagnostic console log panel. */
export function Terminal({ children, className = '' }: TerminalProps) {
  return (
    <div className={`terminal custom-scrollbar ${className}`.trim()} role="log" aria-live="polite">
      {children}
    </div>
  );
}
