'use client'
import { motion } from 'framer-motion'

interface Props {
  score: number
  label: string
  processingMs: number
}

function scoreColor(score: number): string {
  if (score >= 76) return '#00e676'
  if (score >= 51) return '#9AE030'
  if (score >= 26) return '#ff6d00'
  return '#ff1744'
}

function scoreGrade(score: number): string {
  if (score >= 76) return 'A'
  if (score >= 51) return 'B'
  if (score >= 26) return 'C'
  return 'F'
}

export default function ScoreGauge({ score, label, processingMs }: Props) {
  const color = scoreColor(score)
  const grade = scoreGrade(score)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth="8"
          />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="var(--scan-cyan)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 12px rgba(122,226,207,0.4))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold"
            style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>/100</span>
        </div>
      </div>

      <div className="text-center">
        <div
          className="font-mono uppercase px-2 py-0.5"
          style={{ fontSize: 10, color, border: '1px solid var(--card-border)' }}
        >
          {label}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
          {processingMs}ms
        </div>
      </div>
    </div>
  )
}
