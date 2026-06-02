import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly fullWidth?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
};

/** DevMRI-styled button with shimmer hover. */
export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const widthClass = fullWidth ? 'btn-full' : '';
  return (
    <button
      type={type}
      className={`btn ${VARIANT_CLASS[variant]} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
