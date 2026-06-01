'use client'
import { useState } from 'react'
import type { AnalyzeResponse } from '@/lib/api'
import { Wand2, Copy } from 'lucide-react'

interface Props {
  result: AnalyzeResponse
  originalDescription: string
}

async function generateRewrite(description: string, signals: AnalyzeResponse): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_KEY || ''
  if (!apiKey) throw new Error('Set NEXT_PUBLIC_GROQ_KEY to enable rewrite suggestions.')

  const missing = signals.whats_missing
  const missingList = [
    !missing.has_why         && '- Root cause / WHY this was needed',
    !missing.has_tradeoff    && '- Tradeoffs acknowledged',
    !missing.has_alternative && '- Alternatives considered',
    !missing.has_risk        && '- Risks and reviewer guidance',
    !missing.has_evidence    && '- Testing / verification evidence',
  ].filter(Boolean).join('\n')

  const species = signals.species.map(s => `${s.name}`).join(', ')

  const prompt = `You are a senior engineer helping improve a PR description.

CURRENT DESCRIPTION (Hugo score: ${signals.hugo_score}/100 — ${signals.slop_label}):
${description}

DETECTED PROBLEMS:
${species ? `Species: ${species}` : ''}
Coverage sections:
${missingList || 'None — description is fairly complete'}

TASK: Rewrite this PR description to score higher. Keep the same technical content but:
1. Add a "Root cause" or "Why" section explaining motivation
2. Acknowledge any tradeoffs made
3. Mention alternatives considered if relevant
4. Add reviewer guidance (what to check, edge cases)
5. Include testing evidence

Write ONLY the improved description. No preamble. No explanation. Just the better PR description.
Keep it concise — 150-250 words max.`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`Groq API ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? 'Could not generate rewrite.'
}

export default function RewriteCoach({ result, originalDescription }: Props) {
  const [rewrite, setRewrite]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)
  const [view, setView]         = useState<'before' | 'after'>('before')

  if (result.hugo_score >= 70) return null // Already good

  const generate = async () => {
    setLoading(true); setError(null)
    try {
      const text = await generateRewrite(originalDescription, result)
      setRewrite(text)
      setView('after')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const copy = () => {
    if (!rewrite) return
    navigator.clipboard.writeText(rewrite).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="panel"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderTop: '2px solid var(--scan-cyan)',
        backdropFilter: 'blur(12px)',
      }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <Wand2 size={14} style={{ color: 'var(--scan-cyan)' }} />
          <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--scan-cyan)', fontFamily: 'var(--font-mono)' }}>Rewrite Coach</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>AI-suggested improved description (LLM optional)</span>
        </div>
        {rewrite && (
          <div className="flex gap-1">
            {(['before', 'after'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-2.5 py-1 text-xs font-mono uppercase tracking-widest transition-colors"
                style={{
                  background: view === v ? 'rgba(122,226,207,0.1)' : 'transparent',
                  color: view === v ? 'var(--scan-cyan)' : 'var(--text-muted)',
                  border: 'none',
                  borderBottom: view === v ? '2px solid var(--scan-cyan)' : '2px solid transparent',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}>
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {!rewrite && !loading && (
          <>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Hugo detected your score is {Math.round(result.hugo_score)}/100.
              Generate an improved version based on the missing signals.
            </p>
            <button onClick={generate}
              className="w-full py-2.5 font-mono text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: 'transparent',
                color: 'var(--scan-cyan)',
                border: '1px solid var(--scan-cyan)',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--scan-cyan)'; e.currentTarget.style.color = 'var(--bg-void)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--scan-cyan)' }}>
              <Wand2 size={14} />
              GENERATE IMPROVED VERSION
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Uses Groq API (free tier) — optional LLM call</p>
          </>
        )}

        {loading && (
          <div className="flex items-center gap-3 py-4 justify-center">
            <div className="w-4 h-4 border-2 border-[var(--scan-cyan)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Rewriting...</span>
          </div>
        )}

        {error && (
          <div className="text-sm rounded-lg p-3"
            style={{
              color: 'var(--critical-red)',
              background: 'rgba(255,23,68,0.06)',
              border: '1px solid rgba(255,23,68,0.2)',
            }}>
            {error}
          </div>
        )}

        {rewrite && (
          <>
            <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}>
              <pre className="text-xs whitespace-pre-wrap leading-relaxed" style={{ color: view === 'before' ? 'var(--text-muted)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {view === 'before' ? originalDescription : rewrite}
              </pre>
            </div>
            {view === 'after' && (
              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 py-2 rounded-lg font-mono text-xs border transition-all flex items-center justify-center gap-2"
                  style={{
                    border: `1px solid ${copied ? 'rgba(0,230,118,0.4)' : 'var(--card-border)'}`,
                    color: copied ? 'var(--health-green)' : 'var(--text-muted)',
                    background: 'transparent',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}>
                  <Copy size={14} />
                  {copied ? 'COPIED' : 'COPY REWRITE'}
                </button>
                <button onClick={generate}
                  className="px-4 py-2 rounded-lg font-mono text-xs border transition-colors"
                  style={{
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-muted)',
                    background: 'transparent',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  Regenerate
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
