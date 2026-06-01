'use client'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

const FOLDS = [
  { fold: 1, f1: 0.800 },
  { fold: 2, f1: 1.000 },
  { fold: 3, f1: 0.966 },
  { fold: 4, f1: 1.000 },
  { fold: 5, f1: 0.960 },
]

const ABLATION = [
  { signal: 'Baseline (all signals)', f1: 0.960, delta: null,   color: '#7AE2CF' },
  { signal: 'w/o Coverage',          f1: 0.699, delta: -0.261, color: '#ff5c6a' },
  { signal: 'w/o Mirror',          f1: 0.617, delta: -0.343, color: '#ff5c6a' },
  { signal: 'w/o Reach',                f1: 0.617, delta: -0.343, color: '#ff5c6a' },
  { signal: 'w/o Info Lean',       f1: 0.934, delta: -0.026, color: '#e07000' },
  { signal: 'w/o Anchor',         f1: 0.943, delta: -0.017, color: '#e07000' },
  { signal: 'w/o Reasoning',                f1: 0.952, delta: -0.008, color: '#e07000' },
]

const ECOSYSTEMS = [
  { name: 'React',   quality: 5,  slop: 9  },
  { name: 'Next.js', quality: 4,  slop: 10 },
  { name: 'VSCode',  quality: 6,  slop: 5  },
  { name: 'Rust',    quality: 7,  slop: 5  },
  { name: 'Linux',   quality: 3,  slop: 0  },
  { name: 'Python',  quality: 22, slop: 8  },
  { name: 'DevOps',  quality: 9,  slop: 9  },
  { name: 'Go',      quality: 9,  slop: 10 },
]

export default function BenchmarkPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="track-badge">[TRACK·04]</span>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              BENCHMARKS
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 900 }}>Benchmark Results</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            121 labeled PRs · 8 ecosystems · 5-fold cross-validation · 50 adversarial attacks.
            Honest numbers — we publish failure modes too.
          </p>
        </div>

        {/* Top metric strip */}
        <div className="grid grid-cols-2 md:grid-cols-4"
          style={{
            borderTop: '1px solid var(--card-border)',
            borderBottom: '1px solid var(--card-border)',
          }}>
          {[
            { v: '0.961', l: 'F1 Score',      sub: 'optimal threshold 35' },
            { v: '121',   l: 'PRs tested',    sub: '8 ecosystems' },
            { v: '2',     l: 'Tracks',        sub: 'analyzed (A + B)' },
            { v: '0',     l: 'LLM calls',     sub: 'in core detection' },
          ].map((s, i) => (
            <div key={i} className="p-4 text-center"
              style={{
                borderRight: i < 3 ? '1px solid var(--card-border)' : 'none',
              }}>
              <div className="font-mono text-3xl font-bold" style={{ color: '#FDEB9E', fontFamily: 'var(--font-mono)' }}>{s.v}</div>
              <div className="text-xs font-mono mt-1" style={{ color: '#7AE2CF', fontFamily: 'var(--font-mono)' }}>{s.l}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Three panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* F1 Score Detail */}
          <div className="panel"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderTop: '2px solid #077A7D',
              backdropFilter: 'blur(12px)',
            }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>F1 Score Detail</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Precision', value: 100, color: '#7AE2CF' },
                { label: 'Recall', value: 95.4, color: '#FDEB9E' },
                { label: 'F1', value: 96.1, color: '#7AE2CF' },
                { label: 'Accuracy', value: 95.9, color: '#FDEB9E' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                    <span className="font-mono" style={{ color: item.color, fontFamily: 'var(--font-mono)' }}>{item.value}%</span>
                  </div>
                  <div className="h-2" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full transition-all duration-700" style={{ width: `${item.value}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Fold CV */}
          <div className="panel"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderTop: '2px solid #077A7D',
              backdropFilter: 'blur(12px)',
            }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>5-Fold Cross-Validation</span>
            </div>
            <div className="p-4 space-y-3">
              {FOLDS.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-mono text-xs w-12" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Fold {f.fold}</span>
                  <div className="flex-1 h-2" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full transition-all duration-700" style={{ width: `${f.f1 * 100}%`, background: '#7AE2CF' }} />
                  </div>
                  <span className="font-mono text-xs w-12 text-right" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{f.f1.toFixed(3)}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                <span className="font-mono text-xs font-bold w-12" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Mean</span>
                <div className="flex-1 h-2" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="h-full" style={{ width: '94.5%', background: '#7AE2CF' }} />
                </div>
                <span className="font-mono text-xs font-bold w-12 text-right" style={{ color: '#7AE2CF', fontFamily: 'var(--font-mono)' }}>0.945</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Std Dev: 0.074 · Train/Test gap: 0.000 · LOOCV accuracy: 96.0%</p>
            </div>
          </div>

          {/* Ablation Study */}
          <div className="panel"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderTop: '2px solid #077A7D',
              backdropFilter: 'blur(12px)',
            }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Ablation Study</span>
            </div>
            <div className="p-4 space-y-3">
              {ABLATION.map((a, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-primary)' }}>{a.signal}</span>
                    <span className="font-mono" style={{ color: a.color, fontFamily: 'var(--font-mono)' }}>{a.f1.toFixed(3)}</span>
                  </div>
                  <div className="h-1.5" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full" style={{ width: `${a.f1 * 100}%`, background: a.color }} />
                  </div>
                  {a.delta !== null && (
                    <span className="font-mono text-xs" style={{ color: '#ff5c6a', fontFamily: 'var(--font-mono)' }}>{a.delta > 0 ? '+' : ''}{a.delta.toFixed(3)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dataset distribution */}
        <div className="panel"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderTop: '2px solid #077A7D',
            backdropFilter: 'blur(12px)',
          }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Dataset Distribution — 121 PRs · 8 Ecosystems
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-2 h-32">
              {ECOSYSTEMS.map((e, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5" style={{ height: 80 }}>
                    <div className="flex-1" style={{ height: `${e.quality * 2.5}px`, background: '#7AE2CF' }} />
                    <div className="flex-1" style={{ height: `${e.slop * 2.5}px`, background: '#077A7D' }} />
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{e.name}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <span className="text-xs font-mono flex items-center gap-1" style={{ color: '#7AE2CF' }}>
                <span className="w-2 h-2 inline-block" style={{ background: '#7AE2CF' }} /> Quality
              </span>
              <span className="text-xs font-mono flex items-center gap-1" style={{ color: '#077A7D' }}>
                <span className="w-2 h-2 inline-block" style={{ background: '#077A7D' }} /> Slop
              </span>
            </div>
          </div>
        </div>

        {/* Honest failure modes */}
        <div className="panel"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderTop: '2px solid #FDEB9E',
            backdropFilter: 'blur(12px)',
          }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: '#FDEB9E', fontFamily: 'var(--font-mono)' }}>
              Honest Failure Modes
            </span>
          </div>
          <div className="p-4 space-y-3">
            {[
              { t: 'Terse kernel-style PRs',     d: 'Short but excellent PRs (<40 words) score lower than true quality. False-positive warning shown for PRs under 40 words.' },
              { t: 'Entity injection (+8pts)',    d: 'Pasting function names from the diff inflates Reasoning by ~8pts. Anti-gaming dampening mitigates worst cases.' },
              { t: 'Non-English repos',           d: 'Reasoning patterns are English-only. ~15% accuracy drop on non-English descriptions.' },
              { t: 'High-context teams',          d: '~22% false positive rate on solo maintainer repos that use brevity by convention.' },
            ].map((f, i) => (
              <div key={i}>
                <span className="text-xs font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>{f.t}: </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{f.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={ROUTES.scan}
            className="flex-1 py-3 font-mono text-sm font-bold text-center transition-all"
            style={{
              background: '#7AE2CF',
              color: 'var(--bg-void)',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              border: 'none',
            }}>
            Analyze a PR →
          </Link>
          <Link href={ROUTES.taxonomy}
            className="flex-1 py-3 font-mono text-sm font-bold text-center transition-colors"
            style={{
              border: '1px solid var(--card-border)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = '#7AE2CF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}>
            View Species Taxonomy →
          </Link>
        </div>
      </div>
    </div>
  )
}
