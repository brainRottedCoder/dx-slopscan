import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly variant?: 'card' | 'module';
}

/** Glassmorphism card wrapper. */
export function Card({ children, variant = 'card', className = '', ...props }: CardProps) {
  const base = variant === 'module' ? 'module-card' : 'card';
  return (
    <div className={`${base} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
