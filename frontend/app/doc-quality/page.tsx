'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FileText, CheckCircle2, XCircle, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react'

import { getApiBase } from '@/lib/api'
import { HUGO_FORMULA, SCORING_SIGNALS } from '@/lib/signals'
import { COVERAGE_CHECKS } from '@/lib/coverage'
import type { SignalScores } from '@/lib/api'

const DEMO_DOCS = [
  {
    label: 'Bad Docs',
    text: `# Authentication API

This guide covers authentication.

## Usage

Call the login endpoint to authenticate.

## Configuration

Update the configuration file.

## Notes

See the code for more details.`
  },
  {
    label: 'Good Docs',
    text: `# Authentication API

## Why this exists

The auth service handles JWT token lifecycle. Tokens expire after 4 hours. The refresh mechanism fires at 80% of TTL to avoid the thundering herd pattern seen in v1 (where 3% of mobile sessions saw 401 errors).

## Prerequisites

- Node.js 18+
- Redis 6+ (for token blacklisting)
- Environment variable: AUTH_SECRET (min 32 chars)

## Quick start

\`\`\`bash
npm install @company/auth-client
export AUTH_SECRET=your-secret-here
\`\`\`

## When to use refresh tokens vs session tokens

Use refresh tokens when: sessions > 1 hour, mobile clients, offline support needed.
Use session tokens when: short-lived web sessions, no offline requirement.

Tradeoff: refresh tokens require Redis storage (O(tokens) memory). Session tokens are stateless but cannot be revoked before expiry.

## Common mistakes

- Setting token TTL < 5 minutes causes excessive refresh calls
- Not handling 401 responses with automatic retry causes poor UX`
  }
]

const SCORE_COLOR = (s: number) =>
  s >= 76 ? '#7AE2CF' : s >= 51 ? '#FDEB9E' : s >= 26 ? '#e07000' : '#ff5c6a'

export default function DocsPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'sentences' | 'signals' | 'coverage' | 'simulate'>('sentences')

  async function analyze() {
    if (!input.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch(`${getApiBase()}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input, mode: 'docs' }),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const LABEL_MAP: Record<string, { color: string; name: string }> = {
    red:    { color: '#ff5c6a', name: 'Derivable' },
    orange: { color: '#e07000', name: 'Partial' },
    green:  { color: '#7AE2CF', name: 'Novel' },
    purple: { color: '#b388ff', name: 'Epistemic' },
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="track-badge">[TRACK·B]</span>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              DOCUMENTATION QUALITY
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} style={{ color: '#7AE2CF' }} />
            <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 900 }}>
              Docs Quality Analyzer
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Same Hugo engine. Docs mode adds: example detection, prerequisite check, step-by-step verification.
            Paste any documentation, README, or knowledge base article.
          </p>
        </div>

        {/* Demo buttons */}
        <div className="flex gap-2">
          {DEMO_DOCS.map((d, i) => (
            <button key={i} onClick={() => setInput(d.text)}
              className="text-xs font-mono px-3 py-1.5 border transition-colors flex items-center gap-1"
              style={{
                border: '1px solid var(--card-border)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                background: 'transparent',
                borderRadius: 0,
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = '#7AE2CF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}>
              {i === 0 ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
              {d.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="panel overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderTop: '2px solid #077A7D',
            backdropFilter: 'blur(12px)',
          }}>
          <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>README / DOCUMENTATION TEXT</span>
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{input.length} chars</span>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder="Paste your documentation here..."
            rows={10}
            className="w-full p-4 text-sm outline-none resize-none"
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              border: 'none',
            }} />
        </div>

        <button onClick={analyze} disabled={loading || !input.trim()}
          className="w-full py-3 font-mono text-sm font-bold disabled:opacity-40 transition-all"
          style={{
            background: '#7AE2CF',
            color: 'var(--bg-void)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            border: 'none',
            borderRadius: 0,
          }}>
          {loading ? 'Analyzing...' : 'ANALYZE DOCUMENTATION'}
        </button>

        {error && (
          <div className="text-sm rounded-lg p-3"
            style={{
              color: '#ff5c6a',
              background: 'rgba(255,92,106,0.06)',
              border: '1px solid rgba(255,92,106,0.2)',
            }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Score */}
            <div className="panel p-5 flex items-center gap-6"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderTop: '2px solid #077A7D',
                backdropFilter: 'blur(12px)',
              }}>
              <div className="text-center">
                <div className="font-mono text-5xl font-bold" style={{ color: SCORE_COLOR(result.hugo_score), fontFamily: 'var(--font-mono)' }}>
                  {Math.round(result.hugo_score)}
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Hugo / 100</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold" style={{ color: SCORE_COLOR(result.hugo_score), fontFamily: 'var(--font-mono)' }}>
                  {result.slop_label}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Track B — Documentation Mode</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="panel overflow-hidden"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderTop: '2px solid #077A7D',
                backdropFilter: 'blur(12px)',
              }}>
              <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid var(--card-border)' }}>
                {([
                  { id: 'sentences', label: `SENTENCES (${result.sentences?.length || 0})` },
                  { id: 'signals',   label: 'SIGNALS' },
                  { id: 'coverage',  label: 'COVERAGE' },
                  { id: 'simulate',  label: 'SIMULATE' },
                ] as const).map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="py-3 px-4 text-xs font-mono uppercase tracking-widest whitespace-nowrap transition-colors"
                    style={{
                      borderBottom: tab === t.id ? '2px solid #FDEB9E' : '2px solid transparent',
                      color: tab === t.id ? '#FDEB9E' : 'var(--text-muted)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {tab === 'sentences' && result.sentences?.length > 0 && (
                  <div className="space-y-2">
                    {result.sentences.map((s: any, i: number) => {
                      const cfg = LABEL_MAP[s.label] || LABEL_MAP.orange
                      return (
                        <div key={i} className="flex items-start gap-3 p-3"
                          style={{
                            borderLeft: `3px solid ${cfg.color}`,
                            background: 'var(--bg-secondary)',
                          }}>
                          <span className="font-mono text-xs px-1 py-0.5 border"
                            style={{
                              color: cfg.color,
                              borderColor: cfg.color,
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                            }}>
                            {cfg.name}
                          </span>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{s.text}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {tab === 'signals' && (
                  <div className="space-y-4">
                    {SCORING_SIGNALS.map(sig => {
                      const s = result.signals as SignalScores
                      const raw = (s[sig.key] as number) ?? (sig.key === 'reach' || sig.key === 'lean' ? 0.5 : 0)
                      const eff = sig.invert ? 1 - raw : raw
                      return (
                        <div key={sig.key} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs font-mono" style={{ color: 'var(--scan-cyan)', fontFamily: 'var(--font-mono)' }}>{sig.label} <span style={{ color: 'var(--text-muted)' }}>{sig.weight}%</span></span>
                            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{Math.round(eff * 100)}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="h-full rounded-full" style={{ width: `${eff * 100}%`, background: sig.invert ? '#ff5c6a' : '#7AE2CF', boxShadow: `0 0 6px ${sig.invert ? '#ff5c6a' : '#7AE2CF'}50` }} />
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sig.description}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {tab === 'coverage' && result.whats_missing && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {COVERAGE_CHECKS.map(item => {
                        const val = result.whats_missing[item.key]
                        return (
                          <div key={item.key} className="flex items-center gap-2 text-xs">
                            <span style={{ color: val ? '#7AE2CF' : '#ff5c6a' }}>
                              {val ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            </span>
                            <span style={{ color: val ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {item.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    {result.whats_missing.questions?.length > 0 && (
                      <div className="space-y-1 pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Coverage sections:</p>
                        {result.whats_missing.questions.map((q: string, i: number) => (
                          <p key={i} className="text-xs" style={{ color: '#FDEB9E' }}>→ {q}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'simulate' && (
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Score simulation for Track B uses the same 9-signal ensemble as PR mode.
                    <pre className="mt-2 text-xs font-mono p-2" style={{ background: 'var(--bg-secondary)', color: '#7AE2CF', fontFamily: 'var(--font-mono)' }}>
                      {HUGO_FORMULA}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Track B coverage: Documentation, READMEs, Knowledge Base articles, API guides.
          Same 9-signal Hugo engine. Zero LLM calls.
        </p>
      </div>
    </div>
  )
}
