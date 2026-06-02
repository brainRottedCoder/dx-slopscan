import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly large?: boolean;
}

/** Mono-styled clinical input. */
export function Input({ large = false, className = '', ...props }: InputProps) {
  const sizeClass = large ? 'input-lg' : '';
  return <input className={`input ${sizeClass} ${className}`.trim()} {...props} />;
}
