'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import { Copy, ExternalLink } from 'lucide-react'

const CLI_OUTPUT = `  Hugo — dx-slopscan
  ─────────────────────────────────────────
  PR: Fix authentication bug

  ██████░░░░░░░░░░░░░░░░░░░░░░░░  23/100  High Slop

  Signals:
  Novelty        18/100  novelty vs diff
  Reasoning          8/100  epistemic acts
  Confidence: 84%  |  LLM calls: 0  |  312ms

  The Echo (89% confidence)
    evidence: "Updated the authentication service."
    fix: Replace diff restatements with reasoning.

  Derivable sentences:
    "Updated the authentication middleware."
    → Explain WHY not WHAT

  Coverage: Rationale  Tradeoffs  Risks
  ─────────────────────────────────────────`

const ACTION_YAML = `name: Hugo Quality Check
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  hugo-check:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - name: Analyze PR with Hugo
        run: |
          RESPONSE=$(curl -sf -X POST "$\{{ secrets.HUGO_API_URL }}/analyze" \\\\n            -H "Content-Type: application/json" \\\\n            -d '{"pr_url":"$\{{ github.event.pull_request.html_url }}"}')
          echo "$RESPONSE"`

const ACTION_COMMENT = `## Hugo Score: 23/100 — High Slop

\`██████░░░░░░░░░░░░░░\` 23/100

**Detected:** The Echo (89%)

**Derivable sentences:**
  "Updated the authentication service."
  → Explain WHY not WHAT

**Coverage:**
- Rationale (WHY)
- Tradeoffs
- Risks

[View full breakdown →](https://dx-slopscan.vercel.app/scan)`

const HOOK_OUTPUT = `Hugo: analyzing commit message...
Hugo score: 19/100 — High Slop

Score 19 is below threshold 20
Consider explaining WHY this change was needed.
(Set HUGO_THRESHOLD=0 to disable)`

export default function IntegrationsPage() {
  const [tab, setTab] = useState<'cli'|'action'|'hook'|'badge'>('cli')
  const [copied, setCopied] = useState<string | null>(null)

  const tabs = [
    { id: 'cli'    as const, label: 'CLI',            sub: 'Terminal' },
    { id: 'action' as const, label: 'GitHub Action',  sub: 'CI/CD' },
    { id: 'hook'   as const, label: 'Pre-commit Hook',sub: 'Git' },
    { id: 'badge'  as const, label: 'Badge',          sub: 'README' },
  ]

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="track-badge">[TRACK·05]</span>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              INTEGRATIONS
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 900 }}>Integrations</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Use Hugo in your terminal, CI pipeline, git workflow, or README.
            Zero LLM calls. Fast. Auditable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left nav */}
          <div className="md:col-span-3">
            <div className="sticky top-20 space-y-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="w-full text-left px-3 py-2 font-mono text-xs transition-colors"
                  style={{
                    borderLeft: tab === t.id ? '2px solid #FDEB9E' : '2px solid transparent',
                    color: tab === t.id ? '#FDEB9E' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    background: 'transparent',
                    border: 'none',
                    borderLeftWidth: 2,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (tab !== t.id) e.currentTarget.style.color = '#7AE2CF'
                  }}
                  onMouseLeave={e => {
                    if (tab !== t.id) e.currentTarget.style.color = 'var(--text-muted)'
                  }}>
                  {t.label}
                  <span className="block" style={{ color: 'var(--text-dim)', fontSize: 10 }}>{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right content */}
          <div className="md:col-span-9 space-y-5">
            {/* CLI */}
            {tab === 'cli' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  {[
                    { label: 'Install globally:', code: 'npm install -g dx-slopscan', color: '#7AE2CF' },
                    { label: 'Analyze a GitHub PR:', code: 'npx dx-slopscan check https://github.com/owner/repo/pull/123', color: '#7AE2CF' },
                    { label: 'Paste description from stdin:', code: 'npx dx-slopscan check --paste\n# Paste text → Ctrl+Z (Windows) / Ctrl+D (Mac)', color: '#7AE2CF' },
                    { label: 'Set backend URL (Windows):', code: '$env:HUGO_API_URL = "https://dx-slopscan.onrender.com"\nnpx dx-slopscan check <pr-url>', color: '#FDEB9E' },
                  ].map((s, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                      <div className="relative">
                        <pre className="text-xs font-mono p-3 overflow-x-auto"
                          style={{
                            background: 'var(--bg-secondary)',
                            borderLeft: '3px solid var(--scan-cyan)',
                            color: 'var(--scan-cyan)',
                            fontFamily: 'var(--font-mono)',
                            borderRadius: 0,
                          }}>
                          {s.code}
                        </pre>
                        <button
                          onClick={() => copyText(s.code, `cli-${i}`)}
                          className="absolute top-2 right-2 p-1 transition-colors"
                          style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#7AE2CF'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="panel"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderTop: '2px solid #077A7D',
                    backdropFilter: 'blur(12px)',
                  }}>
                  <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <div className="w-3 h-3" style={{ background: '#ff5c6a' }} />
                    <div className="w-3 h-3" style={{ background: '#e07000' }} />
                    <div className="w-3 h-3" style={{ background: '#7AE2CF' }} />
                    <span className="ml-3 text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>terminal output</span>
                  </div>
                  <pre className="text-xs font-mono p-4 leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{CLI_OUTPUT}</pre>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    { title: '0 LLM calls', desc: 'Pure signal analysis. No API key needed for detection.' },
                    { title: '~300ms', desc: 'Typical response time on cached model.' },
                    { title: 'CI-safe', desc: 'No secrets exposed in logs or build output.' },
                    { title: 'Pipeable', desc: 'Compose with grep, jq, or any Unix tool.' },
                  ].map((s, i) => (
                    <div key={i} className="px-3 py-2"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--card-border)',
                      }}>
                      <div className="font-mono text-xs font-bold" style={{ color: '#7AE2CF', fontFamily: 'var(--font-mono)' }}>{s.title}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GITHUB ACTION */}
            {tab === 'action' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  {[
                    { n:'1', t:'Add secret', d:'GitHub repo → Settings → Secrets → Actions', code:'HUGO_API_URL = https://dx-slopscan.onrender.com' },
                    { n:'2', t:'Copy workflow file', d:'Create .github/workflows/hugo-check.yml in your repo', code:null },
                    { n:'3', t:'Open a PR', d:'Hugo comments automatically on every PR open or edit', code:null },
                  ].map(s => (
                    <div key={s.n} className="flex gap-3">
                      <div className="w-6 h-6 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                        style={{ background: 'rgba(122,226,207,0.15)', color: '#7AE2CF', fontFamily: 'var(--font-mono)' }}>{s.n}</div>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{s.t}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.d}</p>
                        {s.code && (
                          <pre className="text-xs font-mono p-2 mt-1"
                            style={{
                              background: 'var(--bg-secondary)',
                              borderLeft: '3px solid var(--scan-cyan)',
                              color: '#7AE2CF',
                              fontFamily: 'var(--font-mono)',
                              borderRadius: 0,
                            }}>
                            {s.code}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="panel"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderTop: '2px solid #077A7D',
                    backdropFilter: 'blur(12px)',
                  }}>
                  <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>.github/workflows/hugo-check.yml</span>
                    <button
                      onClick={() => copyText(ACTION_YAML, 'action-yaml')}
                      className="p-1 transition-colors"
                      style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#7AE2CF'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="text-xs font-mono p-4 overflow-x-auto leading-relaxed" style={{ color: '#FDEB9E', fontFamily: 'var(--font-mono)' }}>
                    {ACTION_YAML}
                  </pre>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PR comment preview:</p>
                  <div className="panel"
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      borderTop: '2px solid #077A7D',
                      backdropFilter: 'blur(12px)',
                    }}>
                    <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <div className="w-5 h-5 rounded-full" style={{ background: 'var(--bg-secondary)' }} />
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>github-actions[bot] commented</span>
                    </div>
                    <pre className="text-xs font-mono p-4 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {ACTION_COMMENT}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* PRE-COMMIT */}
            {tab === 'hook' && (
              <div className="space-y-5">
                <div className="panel p-5 space-y-4"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderTop: '2px solid #077A7D',
                    backdropFilter: 'blur(12px)',
                  }}>
                  <h2 className="font-mono text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Install hook</h2>
                  <pre className="text-xs font-mono p-3"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderLeft: '3px solid var(--scan-cyan)',
                      color: '#7AE2CF',
                      fontFamily: 'var(--font-mono)',
                      borderRadius: 0,
                    }}>
{`# From your repo root (Windows)
copy hooks\\pre-commit .git\\hooks\\pre-commit

# Set backend + threshold
$env:HUGO_API_URL = "https://dx-slopscan.onrender.com"
$env:HUGO_THRESHOLD = "20"

# Now every commit checks message quality
git commit -m "Fix auth bug"`}
                  </pre>
                </div>

                <div className="panel"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderTop: '2px solid #077A7D',
                    backdropFilter: 'blur(12px)',
                  }}>
                  <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <div className="w-3 h-3" style={{ background: '#ff5c6a' }} />
                    <div className="w-3 h-3" style={{ background: '#e07000' }} />
                    <div className="w-3 h-3" style={{ background: '#7AE2CF' }} />
                    <span className="ml-3 text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>git commit -m "Fix auth bug"</span>
                  </div>
                  <pre className="text-xs font-mono p-4 leading-relaxed" style={{ color: '#e07000', fontFamily: 'var(--font-mono)' }}>{HOOK_OUTPUT}</pre>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    { title: 'Non-blocking option', desc: 'Set HUGO_THRESHOLD=0 to warn only, never block commits.' },
                    { title: 'Safe fallback', desc: 'Skips silently if backend is unreachable.' },
                    { title: 'Instant feedback', desc: 'Catch slop before it reaches reviewers.' },
                    { title: 'Team adoption', desc: 'Each developer installs once. Gradual culture change.' },
                  ].map((s, i) => (
                    <div key={i} className="px-3 py-2"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--card-border)',
                      }}>
                      <div className="font-mono text-xs font-bold" style={{ color: '#7AE2CF', fontFamily: 'var(--font-mono)' }}>{s.title}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BADGE */}
            {tab === 'badge' && (
              <div className="space-y-5">
                <div className="panel p-5 space-y-4"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderTop: '2px solid #077A7D',
                    backdropFilter: 'blur(12px)',
                  }}>
                  <h2 className="font-mono text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Add to README</h2>
                  <div className="relative">
                    <pre className="text-xs font-mono p-3 overflow-x-auto"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderLeft: '3px solid var(--scan-cyan)',
                        color: '#7AE2CF',
                        fontFamily: 'var(--font-mono)',
                        borderRadius: 0,
                      }}>
{`[![Hugo Score](https://dx-slopscan.onrender.com/badge/owner/repo.svg)](https://dx-slopscan.onrender.com)`}
                    </pre>
                    <button
                      onClick={() => copyText(`[![Hugo Score](https://dx-slopscan.onrender.com/badge/owner/repo.svg)](https://dx-slopscan.onrender.com)`, 'badge-md')}
                      className="absolute top-2 right-2 p-1 transition-colors"
                      style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#7AE2CF'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Badge styles by score:</p>
                    <div className="flex gap-3 flex-wrap items-center">
                      {[
                        { score: 82, label: 'Quality',     color: '#7AE2CF' },
                        { score: 58, label: 'Low Slop',    color: '#FDEB9E' },
                        { score: 34, label: 'Medium Slop', color: '#e07000' },
                        { score: 19, label: 'High Slop',   color: '#ff5c6a' },
                      ].map(b => (
                        <svg key={b.score} xmlns="http://www.w3.org/2000/svg" width="160" height="20" style={{ display: 'block' }}>
                          <clipPath id={`rr${b.score}`}><rect width="160" height="20" rx="3" fill="#fff"/></clipPath>
                          <g clipPath={`url(#rr${b.score})`}>
                            <rect width="90" height="20" fill="#555"/>
                            <rect x="90" width="70" height="20" fill={b.color}/>
                          </g>
                          <g fill="#fff" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="11">
                            <text x="45" y="14">Hugo {b.score}</text>
                            <text x="125" y="14">{b.label}</text>
                          </g>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="panel p-5 space-y-3"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderTop: '2px solid #077A7D',
                    backdropFilter: 'blur(12px)',
                  }}>
                  <h2 className="font-mono text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    API endpoints <ExternalLink size={14} style={{ color: 'var(--scan-cyan)' }} />
                  </h2>
                  <pre className="text-xs font-mono p-3 overflow-x-auto"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderLeft: '3px solid var(--scan-cyan)',
                      color: '#FDEB9E',
                      fontFamily: 'var(--font-mono)',
                      borderRadius: 0,
                    }}>
{`# Repo stats JSON
GET /repo/{owner}/{repo}/stats

# Badge SVG (auto-updates)
GET /badge/{owner}/{repo}.svg

# Single PR analysis
POST /analyze  { "pr_url": "..." }`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
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
          <Link href={ROUTES.rankings}
            className="flex-1 py-3 font-mono text-sm font-bold text-center transition-colors"
            style={{
              border: '1px solid var(--card-border)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = '#7AE2CF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}>
            View Leaderboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
