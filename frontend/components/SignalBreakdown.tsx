'use client'
import { motion } from 'framer-motion'
import { Activity, CheckCircle2, XCircle } from 'lucide-react'
import type { SignalScores, WhatsMissing } from '@/lib/api'
import { HUGO_SIGNALS } from '@/lib/signals'
import { COVERAGE_CHECKS } from '@/lib/coverage'

interface Props {
  signals: SignalScores
  missing: WhatsMissing
  falsePositiveWarning: string | null
}

function Bar({ value, invert, isPenalty }: { value: number; invert: boolean; isPenalty: boolean }) {
  const effective = invert ? 1 - value : value
  return (
    <div className="signal-bar w-full">
      <motion.div
        className="signal-bar-fill"
        style={{
          background: isPenalty
            ? 'var(--critical-red)'
            : undefined,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${effective * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

export default function SignalBreakdown({ signals, missing, falsePositiveWarning }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Signal breakdown
          </h3>
        </div>
        {HUGO_SIGNALS.map(sig => {
          const raw = (signals[sig.key] as number) ?? 0
          const effective = sig.invert ? 1 - raw : raw
          return (
            <div key={sig.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)' }}>{sig.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{sig.weight}%</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)' }}>
                  {Math.round(effective * 100)}/100
                </span>
              </div>
              <Bar value={raw} invert={!!sig.invert} isPenalty={!!sig.invert} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sig.description}</p>
            </div>
          )
        })}
      </div>

      <div className="space-y-3">
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          What&apos;s in the description
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {COVERAGE_CHECKS.map(check => {
            const present = missing[check.key]
            return (
              <div key={check.key} className="flex items-center gap-2.5">
                {present
                  ? <CheckCircle2 size={14} style={{ color: 'var(--health-green)', flexShrink: 0 }} />
                  : <XCircle size={14} style={{ color: 'var(--critical-red)', flexShrink: 0 }} />
                }
                <span className={`text-sm ${present ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                  {check.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {missing.questions.length > 0 && (
        <div className="space-y-2">
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Questions the author should answer
          </h3>
          <div className="space-y-2">
            {missing.questions.map((q, i) => (
              <div
                key={i}
                className="text-sm pl-3 py-0.5"
                style={{ color: 'var(--text-secondary)', borderLeft: '1px solid rgba(var(--scan-cyan-rgb), 0.15)' }}
              >
                {q}
              </div>
            ))}
          </div>
        </div>
      )}

      {falsePositiveWarning && (
        <div className="text-xs rounded-lg p-3" style={{ color: 'var(--warning-amber)', background: 'rgba(253,235,158,0.1)', border: '1px solid rgba(253,235,158,0.3)' }}>
          {falsePositiveWarning}
        </div>
      )}
    </div>
  )
}
