'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Sliders, AlertTriangle } from 'lucide-react'
import { HUGO_FORMULA, SCORING_SIGNALS, signalWeightDecimal } from '@/lib/signals'
import { ROUTES } from '@/lib/routes'
import type { SignalKey } from '@/lib/signals'

const SCORE_COLOR = (s: number) =>
  s >= 76 ? '#7AE2CF' : s >= 51 ? '#FDEB9E' : s >= 26 ? '#e07000' : '#ff5c6a'

const LABEL = (s: number) =>
  s >= 76 ? 'Quality' : s >= 51 ? 'Low Slop' : s >= 26 ? 'Medium Slop' : 'High Slop'

const DEFAULTS: Record<string, number> = Object.fromEntries(
  SCORING_SIGNALS.map(s => [s.key, s.key === 'mirror_penalty' ? 20 : 50])
)

export default function SignalsPage() {
  const [values, setValues] = useState<Record<string, number>>({ ...DEFAULTS })

  const predicted = useMemo(() => {
    const ensemble = SCORING_SIGNALS.reduce((sum, sig) => {
      const raw = (values[sig.key] ?? 0) / 100
      const effective = sig.invert ? 1 - raw : raw
      return sum + effective * signalWeightDecimal(sig.key as SignalKey)
    }, 0)
    return Math.min(100, Math.round(ensemble * 100))
  }, [values])

  const update = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="track-badge">[TRACK·07]</span>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              SIMULATION
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 900 }}>Score Simulator (Educational)</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Explore how each signal impacts the Hugo ensemble score.
            This is an educational approximation — use /scan for authoritative scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="panel p-5 space-y-5"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderTop: '2px solid #077A7D',
              backdropFilter: 'blur(12px)',
            }}>
            <div className="flex items-center gap-2">
              <Sliders size={14} style={{ color: 'var(--scan-cyan)' }} />
              <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--scan-cyan)', fontFamily: 'var(--font-mono)' }}>Signal Controls</span>
            </div>

            {SCORING_SIGNALS.map(sig => (
              <div key={sig.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-xs uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                    {sig.label} <span style={{ color: 'var(--text-dim)' }}>({sig.weight}%)</span>
                  </label>
                  <span className="font-mono text-xs" style={{ color: '#FDEB9E', fontFamily: 'var(--font-mono)' }}>
                    {values[sig.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={values[sig.key]}
                  onChange={e => update(sig.key, Number(e.target.value))}
                  className="w-full"
                  style={{
                    appearance: 'none',
                    height: 3,
                    background: `linear-gradient(90deg, #077A7D ${values[sig.key]}%, var(--bg-tertiary) ${values[sig.key]}%)`,
                    borderRadius: 0,
                    outline: 'none',
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{sig.description}</p>
              </div>
            ))}

            <button onClick={() => setValues({ ...DEFAULTS })}
              className="w-full py-2 font-mono text-xs border transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--card-border)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                borderRadius: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#7AE2CF'; e.currentTarget.style.borderColor = '#7AE2CF' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)' }}>
              RESET TO BASELINE
            </button>
          </div>

          <div className="space-y-5">
            <div className="panel-gold p-8 text-center space-y-4"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderTop: '2px solid #FDEB9E',
                backdropFilter: 'blur(12px)',
              }}>
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Predicted Score</p>
              <div className="font-display text-7xl font-bold" style={{ color: '#FDEB9E', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                {predicted}
              </div>
              <div className="font-mono text-lg" style={{ color: SCORE_COLOR(predicted), fontFamily: 'var(--font-mono)' }}>
                {LABEL(predicted)}
              </div>
              <div className="h-3" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="h-full transition-all duration-500" style={{ width: `${predicted}%`, background: SCORE_COLOR(predicted) }} />
              </div>
              <div className="flex justify-between font-mono text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>0 — High Slop</span>
                <span>50 — Borderline</span>
                <span>76+ — Quality</span>
              </div>
            </div>

            <div className="panel p-5"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderTop: '2px solid #077A7D',
                backdropFilter: 'blur(12px)',
              }}>
              <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Ensemble Formula</p>
              <pre className="text-xs font-mono leading-relaxed" style={{ color: '#FDEB9E', fontFamily: 'var(--font-mono)' }}>
                {HUGO_FORMULA}
              </pre>
            </div>

            <div className="p-3 text-xs flex items-start gap-2"
              style={{
                color: 'var(--text-muted)',
                background: 'rgba(255,171,0,0.05)',
                border: '1px solid rgba(255,171,0,0.2)',
              }}>
              <AlertTriangle size={14} style={{ color: '#FDEB9E', flexShrink: 0, marginTop: 2 }} />
              <span>
                This page is an <strong>educational approximation</strong> for exploring signal impact.
                For authoritative scores, use <Link href={ROUTES.scan} className="underline" style={{ color: '#7AE2CF' }}>/scan</Link>.
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href={ROUTES.scan}
            className="inline-block font-mono text-sm px-6 py-3 font-bold"
            style={{
              background: 'var(--scan-cyan)',
              color: 'var(--bg-void)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
            }}>
            RUN FULL ANALYSIS →
          </Link>
        </div>
      </div>
    </div>
  )
}
