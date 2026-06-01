'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { OWNER_NAME, GITHUB_REPO } from '@/lib/brand'
import { ROUTES } from '@/lib/routes'
import { HUGO_SIGNALS } from '@/lib/signals'
import { HugoMainLogo } from '@/components/HugoLogo'

/* ─── scroll reveal ─────────────────────────────────────────────────── */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, revealed }
}

/* ─── count up ──────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return val
}

/* ─── SVG icons ─────────────────────────────────────────────────────── */
function IconScan({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="3" /><path d="M12 5v2" /><path d="M12 17v2" />
      <path d="M5 12H7" /><path d="M17 12h2" />
    </svg>
  )
}

function IconPR({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="8" r="2" />
      <path d="M6 8v8" />
      <path d="M18 10c0 4-4 6-6 8" />
      <path d="M16 7l2-1 2 1" />
    </svg>
  )
}

function IconDiff({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="8" height="18" rx="1" />
      <rect x="13" y="3" width="8" height="18" rx="1" />
      <path d="M7 8h0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7 12h0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 8h0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 12h0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 16h0" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function IconBrain({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 5C9 5 7 7 7 9c0 1.5.8 2.8 2 3.5V18h6v-5.5c1.2-.7 2-2 2-3.5 0-2-2-4-5-4z" />
      <path d="M9 13c-1-.2-2-.8-2.5-1.8C5.5 9.5 6 7 8 6" />
      <path d="M15 13c1-.2 2-.8 2.5-1.8C18.5 9.5 18 7 16 6" />
      <path d="M10 18h4" /><path d="M10 21h4" />
    </svg>
  )
}

function IconChain({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function IconAlert({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconZap({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconLean({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="4" height="4" rx=".5" /><rect x="10" y="3" width="4" height="4" rx=".5" />
      <rect x="17" y="3" width="4" height="4" rx=".5" />
      <rect x="3" y="10" width="4" height="4" rx=".5" /><rect x="10" y="10" width="4" height="4" rx=".5" />
      <rect x="3" y="17" width="4" height="4" rx=".5" />
    </svg>
  )
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconCopy({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function IconArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

/* ─── score arc SVG ─────────────────────────────────────────────────── */
function ScoreArc({ score, size = 120 }: { score: number; size?: number }) {
  const r = 46
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  // arc goes from 210° to 330° (240° sweep)
  const sweep = 240
  const pct = Math.min(score / 100, 1)
  const dashLen = (pct * sweep / 360) * circ
  // rotate so arc starts at bottom-left
  const startAngle = 150 // degrees, 0 = right
  const color = score < 40 ? '#ff5c6a' : score < 65 ? '#FDEB9E' : '#7AE2CF'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke="var(--bg-tertiary)" strokeWidth="6"
        strokeDasharray={`${(sweep / 360) * circ} ${circ}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform={`rotate(${startAngle} ${cx} ${cy})`}
      />
      {/* fill */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dashLen} ${circ}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform={`rotate(${startAngle} ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.4s' }}
      />
      {/* glow */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth="1" opacity="0.25"
        strokeDasharray={`${dashLen} ${circ}`}
        strokeDashoffset={0}
        transform={`rotate(${startAngle} ${cx} ${cy})`}
        style={{ filter: 'blur(3px)', transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

/* ─── hero analysis card ─────────────────────────────────────────────── */
const DEMO_SIGNALS = [
  { label: 'Novelty', abbr: 'NOV', value: 8, max: 22, color: '#FDEB9E' },
  { label: 'Reasoning', abbr: 'RSN', value: 3, max: 20, color: '#7AE2CF' },
  { label: 'Coverage', abbr: 'COV', value: 11, max: 20, color: '#7AE2CF' },
  { label: 'Mirror ↑', abbr: 'MIR', value: 87, max: 100, color: '#ff5c6a', inverse: true },
  { label: 'Reach', abbr: 'RCH', value: 4, max: 10, color: '#ff5c6a' },
]

const DEMO_SENTENCES = [
  { text: 'Updated the authentication middleware.', tag: 'DERIVABLE', color: '#ff5c6a' },
  { text: 'Switched to token rotation to prevent thundering herd on concurrent logouts.', tag: 'EPISTEMIC', color: '#7AE2CF' },
  { text: 'Modified logout endpoint response.', tag: 'PARTIAL', color: '#FDEB9E' },
]

function AnalysisPreview() {
  const [phase, setPhase] = useState(0)
  const rawScore = phase >= 3 ? 22 : 0
  const displayScore = useCountUp(rawScore, 1000)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setPhase(3), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const scoreColor = '#ff5c6a'

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--card-border)',
      overflow: 'hidden',
      fontFamily: 'var(--font-mono)',
      position: 'relative',
    }}>
      {/* header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--card-border)',
        background: 'rgba(4,22,31,0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.75 }} />
            ))}
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>hugo · pr scan</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--scan-cyan)', animation: 'dataPulse 1.8s infinite' }} />
          <span style={{ fontSize: 10, color: 'var(--scan-cyan)', letterSpacing: '0.1em' }}>SCANNING</span>
        </div>
      </div>

      {/* score + species row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid var(--card-border)',
      }}>
        {/* score gauge */}
        <div style={{
          padding: '20px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          borderRight: '1px solid var(--card-border)',
          position: 'relative',
        }}>
          <div style={{ position: 'relative', width: 110, height: 110 }}>
            <ScoreArc score={phase >= 3 ? displayScore : 0} size={110} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: phase >= 3 ? 36 : 22,
                fontWeight: 500,
                color: scoreColor,
                lineHeight: 1,
                transition: 'font-size 0.3s',
              }}>
                {phase >= 3 ? displayScore : (phase >= 1 ? '…' : '—')}
              </span>
              <span style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 3, letterSpacing: '0.1em' }}>/100</span>
            </div>
          </div>
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: scoreColor, letterSpacing: '0.12em' }}>HIGH SLOP</div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>quality score</div>
          </div>
        </div>

        {/* species badge */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>detected species</div>
          <div style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.5s, transform 0.5s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22, color: 'var(--scan-cyan)', lineHeight: 1 }}>◈</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-ui)' }}>The Echo</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Mirror ↑ · Novelty ↓<br />
              <span style={{ color: 'var(--text-secondary)' }}>Restates the diff</span>
            </div>
          </div>
          {phase < 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--scan-cyan)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>classifying…</span>
            </div>
          )}
        </div>
      </div>

      {/* signal bars */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
          signal breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {DEMO_SIGNALS.map((sig, i) => {
            const fillPct = sig.inverse
              ? ((100 - sig.value) / 100) * 100
              : (sig.value / sig.max) * 100
            const shown = phase >= 1
            return (
              <div key={sig.abbr} style={{
                opacity: shown ? 1 : 0,
                transform: shown ? 'translateX(0)' : 'translateX(-8px)',
                transition: `opacity 0.35s ${i * 60}ms, transform 0.35s ${i * 60}ms`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>{sig.label}</span>
                  <span style={{ fontSize: 9, color: sig.color, letterSpacing: '0.06em' }}>
                    {sig.inverse ? `${sig.value}%` : `${sig.value}/${sig.max}`}
                  </span>
                </div>
                <div style={{ height: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: phase >= 1 ? `${fillPct}%` : '0%',
                    background: sig.inverse
                      ? `linear-gradient(90deg, ${sig.color}40, ${sig.color})`
                      : `linear-gradient(90deg, var(--teal-deep), ${sig.color})`,
                    transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 80 + 200}ms`,
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* sentence tags */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
          sentence classification
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {DEMO_SENTENCES.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateX(0)' : 'translateX(-6px)',
              transition: `opacity 0.35s ${i * 80}ms, transform 0.35s ${i * 80}ms`,
            }}>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: s.color, marginTop: 5, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', flex: 1, lineHeight: 1.45 }}>{s.text}</span>
              <span style={{
                fontSize: 8, letterSpacing: '0.1em', color: s.color,
                border: `1px solid ${s.color}35`, padding: '2px 6px', flexShrink: 0,
              }}>{s.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── hero ──────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>

        {/* logo + label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 52 }}>
          <div style={{ flexShrink: 0 }}>
            <HugoMainLogo
              width={220}
              style={{ display: 'block', filter: 'drop-shadow(0 6px 24px rgba(7,122,125,0.35))' }}
            />
          </div>
          <div style={{ width: 1, height: 36, background: 'var(--card-border)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--scan-cyan)',
              animation: 'dataPulse 2s infinite', flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em',
              color: 'var(--scan-cyan)', textTransform: 'uppercase',
            }}>
              Pull Request Intelligence Layer
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 56, alignItems: 'start' }}>
          {/* left */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: 28,
            }}>
              Your PR says{' '}
              <span style={{ color: 'var(--scan-cyan)' }}>what changed.</span>
              <br />
              Hugo checks if you{' '}
              <span style={{ color: 'var(--gold)' }}>explained why.</span>
            </h1>

            <p style={{
              fontSize: 14, lineHeight: 1.8,
              color: 'var(--text-secondary)',
              maxWidth: 420, marginBottom: 36,
              fontFamily: 'var(--font-body)',
            }}>
              Every sentence in your PR description is either <em>written by a thinking engineer</em> or
              {' '}could have been <em>generated from the diff alone.</em> Hugo scores each one,
              detects epistemic acts, and names the failure pattern — zero LLM in the detection path.
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
              <Link href={ROUTES.scan} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--scan-cyan)', color: 'var(--bg-void)',
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.08em', padding: '10px 22px',
                transition: 'opacity 0.2s', flexShrink: 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
                ANALYZE A PR <IconArrow size={14} />
              </Link>
              <a href="#how-it-works" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                border: '1px solid var(--card-border)', color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em',
                padding: '10px 20px', transition: 'color 0.2s, border-color 0.2s', flexShrink: 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--scan-cyan)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)' }}>
                HOW IT WORKS
              </a>
            </div>

            {/* proof pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                '0 LLM calls in detection',
                'F1 0.961 · 193 labeled PRs',
                '7 orthogonal signals',
                '50/50 attacks blocked',
              ].map(t => (
                <span key={t} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em',
                  color: 'var(--text-dim)', border: '1px solid var(--card-border)',
                  padding: '3px 10px',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* right — fixed-width preview */}
          <div style={{ paddingTop: 4 }}>
            <AnalysisPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── how it works ───────────────────────────────────────────────────── */
function HowItWorks() {
  const { ref, revealed } = useScrollReveal()

  const steps = [
    {
      n: '01', color: '#7AE2CF',
      icon: <IconPR size={28} />,
      title: 'Submit a PR or paste a description',
      body: 'Point Hugo at any public GitHub pull request, or paste the description text directly. Optionally attach the diff for the full 9-signal analysis.',
      tag: 'INPUT',
    },
    {
      n: '02', color: '#FDEB9E',
      icon: <IconScan size={28} />,
      title: 'Nine signals parse every sentence',
      body: 'Each sentence is labeled — derivable from diff, novel, or an epistemic act (tradeoff, causality, alternative, risk). No model call in the detection path.',
      tag: 'ANALYSIS',
    },
    {
      n: '03', color: '#c8a8ff',
      icon: <IconBrain size={28} />,
      title: 'Score, species, and reviewer questions',
      body: 'Hugo returns a 0–100 score, the detected slop species, a what\'s-missing checklist, and the exact questions a reviewer will ask.',
      tag: 'OUTPUT',
    },
  ]

  return (
    <section id="how-it-works" ref={ref} style={{
      padding: '96px 0', position: 'relative', overflow: 'hidden',
      borderTop: '1px solid var(--card-border)',
      transition: 'opacity 0.7s, transform 0.7s',
      opacity: revealed ? 1 : 0,
      transform: revealed ? 'translateY(0)' : 'translateY(24px)',
    }}>
      {/* scan line sweep */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--scan-cyan), transparent)',
        animation: 'scanSweep 4s ease-in-out infinite',
        opacity: 0.5,
      }} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>
        {/* section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 18, height: 1, background: 'var(--scan-cyan)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--scan-cyan)', textTransform: 'uppercase' }}>
                HOW IT WORKS
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.12, letterSpacing: '-0.02em',
            }}>
              From PR to diagnosis<br />
              <span style={{ color: 'var(--scan-cyan)' }}>in under 400ms.</span>
            </h2>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)',
            letterSpacing: '0.1em', padding: '6px 12px',
            border: '1px solid var(--card-border)', animation: 'dataPulse 2s infinite',
          }}>
            ● ZERO LLM CALLS
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {steps.map((step, i) => (
            <div key={step.n} style={{ position: 'relative' }}>
              {/* step card */}
              <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderBottom: `2px solid ${step.color}`,
                padding: '32px 24px',
                height: '100%',
                position: 'relative', overflow: 'hidden',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = step.color }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)' }}
              >
                {/* ghost step number */}
                <div style={{
                  position: 'absolute', top: -8, right: 16,
                  fontFamily: 'var(--font-display)', fontSize: 80,
                  color: `${step.color}08`, lineHeight: 1, userSelect: 'none',
                  fontWeight: 700,
                }}>
                  {step.n}
                </div>

                {/* tag pill */}
                <div style={{ marginBottom: 24 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em',
                    color: step.color, border: `1px solid ${step.color}40`, padding: '2px 8px',
                  }}>{step.tag}</span>
                </div>

                {/* icon in circle */}
                <div style={{
                  width: 52, height: 52,
                  background: `${step.color}10`,
                  border: `1px solid ${step.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, color: step.color,
                }}>
                  {step.icon}
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.35,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                }}>
                  {step.body}
                </p>

                {/* step number badge bottom */}
                <div style={{
                  marginTop: 24,
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: 'var(--text-dim)', letterSpacing: '0.12em',
                }}>
                  STEP {step.n}
                </div>
              </div>

              {/* arrow connector */}
              {i < 2 && (
                <div style={{
                  position: 'absolute', top: '50%', right: -14, zIndex: 10,
                  transform: 'translateY(-50%)',
                  display: 'flex', alignItems: 'center',
                }}>
                  <div style={{ width: 6, height: 6, background: 'var(--scan-cyan)', opacity: 0.5 }} />
                  <div style={{ width: 22, height: 1, background: `linear-gradient(90deg, var(--scan-cyan)60, var(--scan-cyan)20)` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── signal grid ───────────────────────────────────────────────────── */
const SIGNAL_UI: Record<string, { color: string; icon: React.ReactNode }> = {
  coverage: { color: '#7AE2CF', icon: <IconScan size={16} /> },
  novelty: { color: '#FDEB9E', icon: <IconDiff size={16} /> },
  reasoning: { color: '#7AE2CF', icon: <IconBrain size={16} /> },
  anchor: { color: '#a8c8d0', icon: <IconChain size={16} /> },
  mirror_penalty: { color: '#FDEB9E', icon: <IconAlert size={16} /> },
  reach: { color: '#ff5c6a', icon: <IconZap size={16} /> },
  lean: { color: '#5d8a93', icon: <IconLean size={16} /> },
  specificity: { color: '#9ed4ff', icon: <IconBrain size={16} /> },
  structure: { color: '#c8a8ff', icon: <IconLean size={16} /> },
}

const SIGNALS = HUGO_SIGNALS.map(sig => ({
  name: sig.label,
  abbr: sig.abbr,
  full: sig.full,
  weight: sig.weight,
  desc: sig.description,
  color: SIGNAL_UI[sig.key]?.color ?? '#7AE2CF',
  icon: SIGNAL_UI[sig.key]?.icon ?? <IconScan size={16} />,
}))

function SignalGrid() {
  const { ref, revealed } = useScrollReveal()

  return (
    <section id="signals" ref={ref} style={{
      padding: '96px 0', position: 'relative', overflow: 'hidden',
      borderTop: '1px solid var(--card-border)',
      transition: 'opacity 0.8s, transform 0.8s',
      opacity: revealed ? 1 : 0,
      transform: revealed ? 'translateY(0)' : 'translateY(24px)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>

        {/* header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 56, alignItems: 'end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 18, height: 1, background: 'var(--scan-cyan)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--scan-cyan)', textTransform: 'uppercase' }}>
                DETECTION ENGINE
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.12, letterSpacing: '-0.02em',
            }}>
              Nine orthogonal signals.<br />
              <span style={{ color: 'var(--scan-cyan)' }}>Zero LLM calls.</span>
            </h2>
          </div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)',
            lineHeight: 1.75,
          }}>
            Each signal probes a distinct epistemic dimension. They cannot be gamed together — padding
            fixes Lean but kills Novelty. Jargon raises surface complexity but Reasoning
            demands actual causal structure.
          </p>
        </div>

        {/* signal row — horizontal bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
          {SIGNALS.map((sig, idx) => (
            <div key={sig.name} style={{
              display: 'grid',
              gridTemplateColumns: '140px 40px 1fr 120px',
              alignItems: 'center', gap: 16,
              padding: '14px 20px',
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              transition: 'background 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${sig.color}06`; (e.currentTarget as HTMLElement).style.borderColor = `${sig.color}40` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--card-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)' }}
            >
              {/* name + icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: sig.color, flexShrink: 0 }}>{sig.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{sig.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.06em', marginTop: 1 }}>{sig.abbr}</div>
                </div>
              </div>
              {/* weight */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: sig.color, textAlign: 'right' }}>
                {sig.weight}<span style={{ fontSize: 9, color: 'var(--text-dim)' }}>%</span>
              </div>
              {/* animated bar */}
              <div style={{ height: 4, background: 'var(--bg-tertiary)', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: revealed ? `${sig.weight * 4.5}%` : '0%',
                  background: `linear-gradient(90deg, var(--teal-deep), ${sig.color})`,
                  transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${idx * 60}ms`,
                  boxShadow: `0 0 8px ${sig.color}40`,
                }} />
              </div>
              {/* desc */}
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, textAlign: 'right' }}>
                {sig.desc.split('.')[0]}.
              </div>
            </div>
          ))}
        </div>

        {/* formula card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderLeft: '3px solid var(--scan-cyan)',
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em',
            color: 'var(--text-dim)', textTransform: 'uppercase',
          }}>
            <span style={{ color: 'var(--scan-cyan)' }}>▶</span>
            ENSEMBLE FORMULA
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, overflowX: 'auto', whiteSpace: 'nowrap', color: 'var(--text-body)', lineHeight: 2 }}>
            <span style={{ color: 'var(--scan-cyan)' }}>Hugo</span>{' = '}
            <span style={{ color: '#7AE2CF' }}>Coverage×0.20</span>{' + '}
            <span style={{ color: '#FDEB9E' }}>Novelty×0.22</span>{' + '}
            <span style={{ color: '#7AE2CF' }}>Reasoning×0.20</span>{' + '}
            <span style={{ color: '#a8c8d0' }}>Anchor×0.12</span>{' + '}
            <span style={{ color: '#FDEB9E' }}>(1−Mirror)×0.12</span>{' + '}
            <span style={{ color: '#ff5c6a' }}>Reach×0.10</span>{' + '}
            <span style={{ color: '#5d8a93' }}>Lean×0.04</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── species section ────────────────────────────────────────────────── */
function SpeciesSection() {
  const { ref, revealed } = useScrollReveal()
  const [active, setActive] = useState<number | null>(null)
  const SPECIES = [
    { glyph: '◈', code: 'ECHO', name: 'The Echo', sig: 'Mirror ↑ · Novelty ↓', color: '#ff5c6a', fix: 'Explain why the approach was chosen — not what the diff does.' },
    { glyph: '◎', code: 'HOLLOW', name: 'The Hollow', sig: 'Reasoning = 0 · no WHY', color: '#ff8c6a', fix: 'Write one sentence a reviewer could not guess from the diff.' },
    { glyph: '◇', code: 'HAZE', name: 'The Haze', sig: 'Jargon ↑ · causality = 0', color: '#FDEB9E', fix: 'Strip domain vocabulary and state the actual reasoning chain.' },
    { glyph: '⊙', code: 'SPIRAL', name: 'The Spiral', sig: 'Circular structure', color: '#c8a8ff', fix: 'Each sentence must introduce one concept absent from the previous.' },
    { glyph: '◐', code: 'SURFACE', name: 'The Surface', sig: 'WHY missing · Novelty ↓', color: '#9ed4ff', fix: 'Add a root cause — the one sentence that explains the change.' },
    { glyph: '◉', code: 'STENCIL', name: 'The Stencil', sig: 'Generic openers · RSN ↓', color: '#7AE2CF', fix: 'Answer: what is unique to this PR that would not apply to any other?' },
    { glyph: '◫', code: 'FUSE', name: 'The Fuse', sig: 'No evidence · no risk', color: '#5db88a', fix: 'Name the edge cases explicitly. A reviewer will find them anyway.' },
  ]

  return (
    <section ref={ref} style={{
      padding: '96px 0', position: 'relative', overflow: 'hidden',
      borderTop: '1px solid var(--card-border)',
      transition: 'opacity 0.7s, transform 0.7s',
      opacity: revealed ? 1 : 0,
      transform: revealed ? 'translateY(0)' : 'translateY(24px)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 18, height: 1, background: 'var(--scan-cyan)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--scan-cyan)', textTransform: 'uppercase' }}>
                SLOP TAXONOMY
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.12, letterSpacing: '-0.02em',
            }}>
              Every slop pattern has a name.<br />
              <span style={{ color: 'var(--gold)' }}>And a fix.</span>
            </h2>
          </div>
          <Link href={ROUTES.taxonomy} style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
            color: 'var(--scan-cyan)', border: '1px solid var(--teal-deep)',
            padding: '8px 16px', display: 'inline-block',
            transition: 'border-color 0.2s, background 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--scan-cyan)'; (e.currentTarget as HTMLElement).style.background = 'rgba(122,226,207,0.05)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal-deep)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            VIEW FULL TAXONOMY →
          </Link>
        </div>

        {/* species cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
          {SPECIES.map((sp, i) => (
            <div key={sp.code}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              style={{
                padding: '20px 14px',
                background: active === i ? `${sp.color}10` : 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderTop: `2px solid ${active === i ? sp.color : 'var(--card-border)'}`,
                cursor: 'default',
                transition: 'background 0.2s, border-color 0.2s',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 24,
                color: active === i ? sp.color : 'var(--text-dim)',
                transition: 'color 0.2s',
              }}>{sp.glyph}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: sp.color, marginBottom: 4 }}>{sp.code}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{sp.name}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.4 }}>{sp.sig}</div>
            </div>
          ))}
        </div>

        {/* active species fix panel */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderLeft: `3px solid ${active !== null ? SPECIES[active].color : 'var(--teal-deep)'}`,
          padding: '20px 24px', minHeight: 72,
          transition: 'border-color 0.3s',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          {active !== null ? (
            <>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: SPECIES[active].color, flexShrink: 0 }}>{SPECIES[active].glyph}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {SPECIES[active].name} — Fix
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {SPECIES[active].fix}
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.12em' }}>
              ↑ HOVER A SPECIES TO SEE THE FIX
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── benchmark strip ────────────────────────────────────────────────── */
function BenchmarkStrip() {
  const { ref, revealed } = useScrollReveal()
  const stats = [
    { target: 0.961, suffix: '', label: 'F1 score', sub: 'at optimal threshold', color: '#7AE2CF', icon: '◎' },
    { target: 193, suffix: '', label: 'Labeled PRs', sub: '10 ecosystems', color: '#FDEB9E', icon: '◈' },
    { target: 9, suffix: '', label: 'Detection signals', sub: 'orthogonal dimensions', color: '#c8a8ff', icon: '⊙' },
    { target: 0, suffix: '', label: 'LLM calls', sub: 'in detection path', color: '#7AE2CF', icon: '◇' },
  ]

  return (
    <section ref={ref} style={{
      position: 'relative', overflow: 'hidden',
      borderTop: '1px solid var(--card-border)',
      transition: 'opacity 0.7s',
      opacity: revealed ? 1 : 0,
    }}>
      {/* background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--card-border) 1px, transparent 1px), linear-gradient(90deg, var(--card-border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.3,
      }} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {stats.map((s, i) => {
            const isDecimal = s.target > 0 && s.target < 1
            const countTarget = isDecimal ? Math.round(s.target * 1000) : s.target
            const val = useCountUp(countTarget, 1200)
            const display = isDecimal ? (val / 1000).toFixed(3) : val.toString()
            return (
              <div key={s.label} style={{
                padding: '40px 24px',
                borderLeft: i > 0 ? '1px solid var(--card-border)' : 'none',
                position: 'relative',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
                  color: s.color, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <span>{s.label.toUpperCase()}</span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                  color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6,
                  textShadow: `0 0 32px ${s.color}30`,
                }}>
                  {display}{s.suffix}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                  color: 'var(--text-dim)',
                }}>{s.sub}</div>
                {/* bottom accent */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 24, right: 24, height: 1,
                  background: `linear-gradient(90deg, ${s.color}50, transparent)`,
                }} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── sentence labels legend ─────────────────────────────────────────── */
function SentenceLegend() {
  const { ref, revealed } = useScrollReveal()
  const labels = [
    { dot: '#ff5c6a', name: 'DERIVABLE', pct: 65, desc: 'Reconstructable from the diff. A reviewer already knows this.' },
    { dot: '#FDEB9E', name: 'PARTIAL', pct: 15, desc: 'Some independent content, but not enough to score green.' },
    { dot: '#7AE2CF', name: 'NOVEL', pct: 12, desc: 'Cannot be derived from the diff. Adds real context or intent.' },
    { dot: '#9d7de8', name: 'EPISTEMIC', pct: 8, desc: 'A reasoning act — tradeoff, causality, alternative, or risk.' },
  ]
  return (
    <section ref={ref} style={{
      transition: 'opacity 0.6s, transform 0.6s',
      opacity: revealed ? 1 : 0,
      transform: revealed ? 'translateY(0)' : 'translateY(16px)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {labels.map((l, i) => (
            <div key={l.name} style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderTop: `2px solid ${l.dot}`,
              padding: '20px 18px',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, background: l.dot, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: l.dot }}>{l.name}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>{l.pct}%</span>
              </div>
              {/* frequency bar */}
              <div style={{ height: 2, background: 'var(--bg-tertiary)', marginBottom: 12, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: revealed ? `${l.pct}%` : '0%',
                  background: l.dot,
                  transition: `width 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`,
                }} />
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {l.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CI integration section ────────────────────────────────────────── */
const ACTION_YAML = `# .github/workflows/hugo-check.yml
name: Hugo PR Quality Check
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  hugo-check:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4

      - uses: brainRottedCoder/dx-slopscan/.github/actions/hugo@v1
        with:
          api-url: \${{ secrets.HUGO_API_URL }}
          threshold: 20   # score below this adds a warning`

function CISection() {
  const { ref, revealed } = useScrollReveal()
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(ACTION_YAML)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const features = [
    'Posts a rich comment on every PR open and edit',
    'Score, sentence highlights, and species glyphs',
    'What\'s-missing checklist with reviewer questions',
    'Updates the comment in-place on every re-push',
    'Configurable quality threshold per repository',
    'Outputs score and label for downstream steps',
  ]

  return (
    <section ref={ref} style={{
      padding: '96px 0', position: 'relative', overflow: 'hidden',
      borderTop: '1px solid var(--card-border)',
      transition: 'opacity 0.7s, transform 0.7s',
      opacity: revealed ? 1 : 0,
      transform: revealed ? 'translateY(0)' : 'translateY(24px)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>

        {/* header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 18, height: 1, background: 'var(--scan-cyan)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--scan-cyan)', textTransform: 'uppercase' }}>
              CI INTEGRATION
            </span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.12, letterSpacing: '-0.02em',
          }}>
            One YAML block.<br />
            <span style={{ color: 'var(--scan-cyan)' }}>Every PR scored.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 48, alignItems: 'start' }}>
          {/* left */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 28 }}>
              The GitHub Action runs on every PR open, edit, and synchronize event.
              It posts a detailed comment — not just a number — with per-sentence breakdown,
              detected species, and the exact questions a reviewer would ask.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 32 }}>
              {features.map((f, i) => (
                <div key={f} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < features.length - 1 ? '1px solid var(--card-border)' : 'none',
                }}>
                  <span style={{
                    width: 18, height: 18, background: 'rgba(122,226,207,0.12)',
                    border: '1px solid rgba(122,226,207,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                    color: 'var(--scan-cyan)',
                  }}>
                    <IconCheck size={10} />
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href={ROUTES.setup} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
                background: 'var(--scan-cyan)', color: 'var(--bg-void)',
                padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                ALL INTEGRATIONS <IconArrow size={12} />
              </Link>
              <Link href={ROUTES.docQuality} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
                color: 'var(--text-muted)', border: '1px solid var(--card-border)',
                padding: '9px 18px', display: 'inline-block',
                transition: 'color 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--scan-cyan)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)' }}
              >
                READ DOCS
              </Link>
            </div>
          </div>

          {/* right — terminal code block */}
          <div style={{ background: 'var(--bg-void)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
            {/* terminal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: '1px solid var(--card-border)',
              background: 'rgba(122,226,207,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c => (
                    <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                  .github/workflows/hugo-check.yml
                </span>
              </div>
              <button onClick={copy} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: copied ? 'rgba(122,226,207,0.1)' : 'none',
                border: `1px solid ${copied ? 'var(--scan-cyan)' : 'var(--card-border)'}`,
                cursor: 'pointer', padding: '3px 10px',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: copied ? 'var(--scan-cyan)' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!copied) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { if (!copied) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
              >
                <IconCopy size={10} />
                {copied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
            {/* line numbers + code */}
            <div style={{ display: 'flex', overflow: 'auto' }}>
              <div style={{
                padding: '16px 12px', background: 'rgba(0,0,0,0.2)',
                borderRight: '1px solid var(--card-border)',
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--text-dim)', lineHeight: 1.65,
                userSelect: 'none', textAlign: 'right', minWidth: 32,
              }}>
                {ACTION_YAML.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <pre style={{
                padding: '16px 20px', margin: 0, flex: 1,
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--text-body)', lineHeight: 1.65,
                overflow: 'visible',
              }}>
                <code>{ACTION_YAML}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── final CTA ──────────────────────────────────────────────────────── */
function FinalCTA() {
  const { ref, revealed } = useScrollReveal()
  return (
    <section ref={ref} style={{
      padding: '96px 0', position: 'relative', overflow: 'hidden',
      borderTop: '1px solid var(--card-border)',
      transition: 'opacity 0.7s, transform 0.7s',
      opacity: revealed ? 1 : 0,
      transform: revealed ? 'translateY(0)' : 'translateY(24px)',
    }}>
      {/* background scan grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--card-border) 1px, transparent 1px), linear-gradient(90deg, var(--card-border) 1px, transparent 1px)',
        backgroundSize: '60px 60px', opacity: 0.2,
      }} />
      {/* animated horizontal scan */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 0%, var(--scan-cyan) 50%, transparent 100%)',
        animation: 'scanSweep 5s ease-in-out infinite', opacity: 0.4,
      }} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px', textAlign: 'center', position: 'relative' }}>

        {/* scan indicator */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36,
          padding: '6px 16px', border: '1px solid var(--card-border)',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--scan-cyan)', animation: 'dataPulse 1.8s infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.16em' }}>
            READY TO SCAN
          </span>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
          fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.12,
          marginBottom: 20, letterSpacing: '-0.025em',
        }}>
          Stop submitting PRs that describe the diff.<br />
          <span style={{ color: 'var(--scan-cyan)' }}>Start explaining your decisions.</span>
        </h2>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.8,
          color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 40px',
        }}>
          The first PR you analyze will show exactly which sentences a reviewer
          already knows from the diff — and which ones actually earned your team&apos;s attention.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link href={ROUTES.scan} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--gold)', color: 'var(--bg-void)',
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.1em', padding: '12px 26px',
            transition: 'opacity 0.2s, transform 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
            ANALYZE YOUR FIRST PR <IconArrow size={13} />
          </Link>
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--card-border)', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em',
            padding: '12px 22px', transition: 'color 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--scan-cyan)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)' }}>
            VIEW ON GITHUB ↗
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── footer ────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--card-border)', padding: '28px 0' }}>
      <div style={{
        maxWidth: 960, margin: '0 auto', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--text-muted)', letterSpacing: '0.06em',
        }}>
          Hugo · DX-SLOPSCAN · {OWNER_NAME}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'GitHub', href: GITHUB_REPO, ext: true },
            { label: 'Doc quality', href: ROUTES.docQuality, ext: false },
            { label: 'Evaluation', href: ROUTES.evaluation, ext: false },
            { label: 'Taxonomy', href: ROUTES.taxonomy, ext: false },
          ].map(l => (
            <a key={l.label} href={l.href}
              {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
                transition: 'color 0.2s', textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
              {l.label}{l.ext ? ' ↗' : ''}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

/* ─── global keyframes (inline) ─────────────────────────────────────── */
const spinStyle = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes scanSweep {
    0%   { transform: translateX(-100%); opacity: 0; }
    20%  { opacity: 0.6; }
    80%  { opacity: 0.6; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  @keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
`

/* ─── page ──────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <style>{spinStyle}</style>
      <Hero />
      <HowItWorks />
      <BenchmarkStrip />
      <SignalGrid />
      <SentenceLegend />
      <SpeciesSection />
      <CISection />
      <FinalCTA />
      <Footer />
    </>
  )
}
