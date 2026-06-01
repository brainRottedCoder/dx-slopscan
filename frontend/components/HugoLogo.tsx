'use client'

import { useId } from 'react'
import type { CSSProperties } from 'react'

type HugoLogoProps = {
  size?: number
  variant?: 'mark' | 'full'
  className?: string
  style?: CSSProperties
}

type HugoMainLogoProps = {
  /** Total width in px; height scales proportionally (400:96) */
  width?: number
  className?: string
  style?: CSSProperties
}

function MarkGraphic({
  uid,
  className,
  style,
}: {
  uid: string
  className?: string
  style?: CSSProperties
}) {
  const bgId = `hugo-bg-${uid}`
  const ringId = `hugo-ring-${uid}`

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
      aria-hidden
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="96" y2="96">
          <stop offset="0%" stopColor="#0a2d3d" />
          <stop offset="100%" stopColor="#04161f" />
        </linearGradient>
        <linearGradient id={ringId} x1="48" y1="8" x2="48" y2="88">
          <stop offset="0%" stopColor="#7AE2CF" />
          <stop offset="100%" stopColor="#077A7D" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="88" height="88" rx="18" fill={`url(#${bgId})`} stroke="#077A7D" strokeWidth="2" />
      <circle cx="48" cy="48" r="34" stroke={`url(#${ringId})`} strokeWidth="2" strokeDasharray="8 6" opacity="0.85" />
      <path d="M22 30V22h8" stroke="#7AE2CF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M74 30V22h-8" stroke="#7AE2CF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 66v8h8" stroke="#7AE2CF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M74 66v8h-8" stroke="#7AE2CF" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="28" y="30" width="9" height="36" rx="2" fill="#7AE2CF" />
      <rect x="59" y="30" width="9" height="36" rx="2" fill="#7AE2CF" />
      <rect x="28" y="44" width="40" height="8" rx="2" fill="#FDEB9E" />
      <circle cx="68" cy="26" r="4" fill="#7AE2CF" />
      <circle cx="48" cy="48" r="3" fill="#077A7D" stroke="#7AE2CF" strokeWidth="1.5" />
    </svg>
  )
}

/** Compact icon for nav badges, extension, favicon */
export function HugoMark({ size = 32, className, style }: Omit<HugoLogoProps, 'variant'>) {
  const uid = useId().replace(/:/g, '')
  return (
    <span className={className} style={{ display: 'inline-block', width: size, height: size, flexShrink: 0, ...style }}>
      <MarkGraphic uid={uid} />
    </span>
  )
}

/** Primary project lockup — hero, README, marketing */
export function HugoMainLogo({ width = 360, className, style }: HugoMainLogoProps) {
  const uid = useId().replace(/:/g, '')
  const height = Math.round(width * (96 / 400))
  const bgId = `logo-bg-${uid}`
  const ringId = `logo-ring-${uid}`
  const titleId = `logo-title-${uid}`

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label="Hugo DX SlopScan"
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="96" y2="96">
          <stop offset="0%" stopColor="#0a2d3d" />
          <stop offset="100%" stopColor="#04161f" />
        </linearGradient>
        <linearGradient id={ringId} x1="48" y1="8" x2="48" y2="88">
          <stop offset="0%" stopColor="#7AE2CF" />
          <stop offset="100%" stopColor="#077A7D" />
        </linearGradient>
        <linearGradient id={titleId} x1="108" y1="24" x2="380" y2="56">
          <stop offset="0%" stopColor="#FDEB9E" />
          <stop offset="55%" stopColor="#7AE2CF" />
          <stop offset="100%" stopColor="#FDEB9E" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="88" height="88" rx="18" fill={`url(#${bgId})`} stroke="#077A7D" strokeWidth="2" />
      <circle cx="48" cy="48" r="34" stroke={`url(#${ringId})`} strokeWidth="2" strokeDasharray="8 6" opacity="0.85" />
      <path d="M22 30V22h8" stroke="#7AE2CF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M74 30V22h-8" stroke="#7AE2CF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 66v8h8" stroke="#7AE2CF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M74 66v8h-8" stroke="#7AE2CF" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="28" y="30" width="9" height="36" rx="2" fill="#7AE2CF" />
      <rect x="59" y="30" width="9" height="36" rx="2" fill="#7AE2CF" />
      <rect x="28" y="44" width="40" height="8" rx="2" fill="#FDEB9E" />
      <circle cx="68" cy="26" r="4" fill="#7AE2CF" />
      <circle cx="48" cy="48" r="3" fill="#077A7D" stroke="#7AE2CF" strokeWidth="1.5" />
      <text
        x="108"
        y="58"
        fontFamily="var(--font-display), 'DM Mono', monospace"
        fontSize="44"
        fontWeight="500"
        fill={`url(#${titleId})`}
        letterSpacing="-1"
      >
        Hugo
      </text>
      <text
        x="110"
        y="82"
        fontFamily="var(--font-body), 'IBM Plex Sans', system-ui, sans-serif"
        fontSize="13"
        fontWeight="500"
        fill="#5d8a93"
        letterSpacing="0.32em"
      >
        DX SLOPSCAN
      </text>
      <line x1="108" y1="68" x2="392" y2="68" stroke="#077A7D" strokeWidth="1" opacity="0.45" />
    </svg>
  )
}

export default function HugoLogo({ size = 32, variant = 'mark', className, style }: HugoLogoProps) {
  if (variant === 'mark') {
    return <HugoMark size={size} className={className} style={style} />
  }

  const lockupWidth = Math.round(size * 4.2)
  return <HugoMainLogo width={lockupWidth} className={className} style={style} />
}
