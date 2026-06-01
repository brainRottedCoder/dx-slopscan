'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Github, ArrowUp, ArrowDown } from 'lucide-react'
import { HugoMark } from '@/components/HugoLogo'
import { getApiBase } from '@/lib/api'

const SCORE_COLOR = (s: number) =>
  s >= 76 ? '#7AE2CF' : s >= 51 ? '#FDEB9E' : s >= 26 ? '#e07000' : '#ff5c6a'

const SCORE_LABEL = (s: number) =>
  s >= 76 ? 'Quality' : s >= 51 ? 'Low Slop' : s >= 26 ? 'Medium Slop' : 'High Slop'

const SUGGESTED = [
  'microsoft/vscode',
  'django/django',
  'rust-lang/rust',
  'golang/go',
  'kubernetes/kubernetes',
  'prometheus/prometheus',
  'docker/compose',
  'pallets/flask',
  'facebook/react',
  'vercel/next.js',
]

interface RepoResult {
  repo: string
  median_score: number
  prs_analyzed: number
  distribution: {
    quality_pct: number
    low_slop_pct: number
    medium_slop_pct: number
    high_slop_pct: number
  }
  worst_prs: { title: string; url: string; hugo_score: number }[]
  best_prs:  { title: string; url: string; hugo_score: number }[]
  error?: string
}

function SignalBar({ score }: { score: number }) {
  return (
    <div className="signal-bar" style={{ width: 60, background: 'var(--bg-tertiary)' }}>
      <div className="signal-bar-fill" style={{ width: `${score}%` }} />
    </div>
  )
}

export default function LeaderboardPage() {
  const [input, setInput]     = useState('')
  const [results, setResults] = useState<RepoResult[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState('')

  async function scanRepo(repoInput: string) {
    const raw = repoInput.replace('https://github.com/', '').replace(/\/$/, '').trim()
    const parts = raw.split('/')
    if (parts.length < 2) { setError('Format: owner/repo'); return }
    const repo = `${parts[0]}/${parts[1]}`

    if (results.find(r => r.repo === repo)) {
      setError(`${repo} already scanned`); return
    }

    setLoading(repo); setError('')
    try {
      const res = await fetch(`${getApiBase()}/repo/${parts[0]}/${parts[1]}/stats`)
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResults(prev => [...prev, { ...data, repo }].sort((a, b) => b.median_score - a.median_score))
    } catch (e: any) {
      setError(`${repo}: ${e.message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleScan = () => { if (input.trim()) { scanRepo(input); setInput('') } }

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.median_score, 0) / results.length)
    : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="track-badge">[TRACK·02]</span>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              REPO LEADERBOARD
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 900 }}>Repo Leaderboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Scan any public GitHub repo. Compare PR quality across teams and projects.
            All scores are live — computed in real time from recent merged PRs.
          </p>
        </div>

        {/* Input */}
        <div className="panel p-5 space-y-3"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderTop: '2px solid #077A7D',
            backdropFilter: 'blur(12px)',
          }}>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="owner/repo or https://github.com/owner/repo"
              className="flex-1 outline-none transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--card-border)',
                borderRadius: 0,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                padding: '14px 20px',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7AE2CF'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(122,226,207,0.15)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.boxShadow = 'none' }} />
            <button onClick={handleScan}
              disabled={loading !== null || !input.trim()}
              className="px-5 py-2.5 font-mono text-sm font-bold disabled:opacity-40 transition-all"
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
              {loading ? '...' : 'SCAN'}
            </button>
          </div>

          {error && <p className="text-xs" style={{ color: '#ff5c6a' }}>{error}</p>}

          {/* Suggested repos */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.filter(r => !results.find(x => x.repo === r)).map(r => (
                <button key={r} onClick={() => scanRepo(r)}
                  disabled={loading !== null}
                  className="text-xs font-mono px-2.5 py-1 border transition-all disabled:opacity-40"
                  style={{
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    background: 'transparent',
                    borderRadius: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = '#7AE2CF'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-3 px-4 py-3"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderTop: '2px solid #077A7D',
            }}>
            <div className="w-4 h-4 border-2 border-[var(--scan-cyan)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Scanning {loading}...</span>
          </div>
        )}

        {/* Summary bar */}
        {results.length > 1 && avgScore !== null && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: avgScore,                             l: 'Average scanned',   c: SCORE_COLOR(avgScore) },
              { v: Math.max(...results.map(r=>r.median_score)), l: 'Highest repo', c: '#7AE2CF' },
              { v: Math.min(...results.map(r=>r.median_score)), l: 'Lowest repo',  c: '#ff5c6a' },
            ].map((s, i) => (
              <div key={i} className="panel p-3 text-center"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderTop: '2px solid #077A7D',
                }}>
                <div className="font-mono text-2xl font-bold" style={{ color: s.c, fontFamily: 'var(--font-mono)' }}>{s.v}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Results table */}
        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {results.length} repo{results.length > 1 ? 's' : ''} scanned — sorted by median score
              </div>
              <button onClick={() => setResults([])}
                className="text-xs font-mono transition-colors"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ff5c6a')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                <ArrowDown size={12} className="inline mr-1" /> Reset
              </button>
            </div>
            <div className="border-t" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex px-4 py-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex-1 font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}>Repo</div>
                <div className="w-24 font-mono text-xs uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}>Median</div>
                <div className="w-24 font-mono text-xs uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}>PRs</div>
              </div>
              {results.map((r, i) => (
                <div key={r.repo}
                  className="flex px-4 py-3 border-b items-center transition-colors"
                  style={{
                    borderColor: 'var(--card-border)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <Github size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="font-mono text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{r.repo}</span>
                  </div>
                  <div className="w-24 flex items-center justify-end gap-2">
                    <SignalBar score={r.median_score} />
                    <span className="font-mono text-sm font-bold" style={{ color: SCORE_COLOR(r.median_score), fontFamily: 'var(--font-mono)' }}>{r.median_score}</span>
                  </div>
                  <div className="w-24 text-right font-mono text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {r.prs_analyzed} PRs
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-12 space-y-3">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <HugoMark size={56} style={{ filter: 'drop-shadow(0 0 16px rgba(122,226,207,0.3))' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Scan your first repo above, or click a quick-add button.
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Requires GitHub token in backend for best results (5000 req/hr vs 60).
            </p>
          </div>
        )}

        <p className="text-xs text-center pb-4" style={{ color: 'var(--text-muted)' }}>
          Scores use Hugo fast mode — Reasoning + Coverage checklist + Mirror.
          Full model (Novelty + Reach) available via API after backend deployment.
          All scores are live from real recent PRs.
        </p>
      </div>
    </div>
  )
}
