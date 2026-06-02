import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info'
  | 'pending'
  | 'analysing';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;
  readonly variant?: BadgeVariant;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
  info: 'badge-info',
  pending: 'badge-pending',
  analysing: 'badge-analysing',
};

/** Pill badge for severity or status. */
export function Badge({ children, variant = 'info', className = '', ...props }: BadgeProps) {
  return (
    <span className={`badge ${VARIANT_CLASS[variant]} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
