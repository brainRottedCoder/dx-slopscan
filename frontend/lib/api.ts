import { DEFAULT_API_URL } from '@/lib/brand'

/** Resolve API base at runtime so Vercel works even if NEXT_PUBLIC_API_URL was missing at build. */
export function getApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return DEFAULT_API_URL
    }
  }

  return 'http://localhost:8000'
}

export interface SentenceResult {
  text: string
  label: 'red' | 'orange' | 'green' | 'purple'
  derivability: number
  epistemic_acts: string[]
  score_contribution: number
  counterfactual?: string
}

export interface SignalScores {
  coverage: number
  novelty: number
  reasoning: number
  anchor: number
  mirror_penalty: number
  confidence: number
  reach?: number
  lean?: number
  specificity?: number
  structure?: number
}

export interface Species {
  type: string
  glyph: string
  name: string
  confidence: number
  evidence?: string
  counterfactual: string
  fix: string
}

export interface WhatsMissing {
  has_why: boolean
  has_tradeoff: boolean
  has_alternative: boolean
  has_risk: boolean
  has_evidence: boolean
  has_scope?: boolean
  has_rollback?: boolean
  has_migration?: boolean
  has_example: boolean
  has_prerequisite: boolean
  has_step: boolean
  questions: string[]
}

export interface UncoveredChunk {
  chunk: string
  coverage: number
}

export interface AnalyzeRequest {
  pr_url?: string
  description?: string
  diff?: string
  mode?: 'pr' | 'docs'
}

export interface AnalyzeResponse {
  hugo_score: number
  slop_label: string
  sentences: SentenceResult[]
  signals: SignalScores
  whats_missing: WhatsMissing
  species: Species[]
  uncovered_chunks?: UncoveredChunk[]
  pr_title?: string
  pr_url?: string
  diff_summary?: string
  false_positive_warning?: string
  processing_ms: number
}

export async function analyze(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const base = getApiBase()
  let res: Response
  try {
    res = await fetch(`${base}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
  } catch {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'your Vercel URL'
    throw new Error(
      `Cannot reach Hugo API at ${base}. If NEXT_PUBLIC_API_URL is set on Vercel, fix Render CORS: ALLOWED_ORIGINS=* or include ${origin}, then redeploy the API.`
    )
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'API error' }))
    throw new Error(err.detail || `API error ${res.status}`)
  }
  return res.json()
}

export async function getRepoStats(owner: string, repo: string): Promise<any> {
  const base = getApiBase()
  let res: Response
  try {
    res = await fetch(`${base}/repo/${owner}/${repo}/stats`)
  } catch {
    throw new Error(`Cannot reach Hugo API at ${base}`)
  }
  if (!res.ok) throw new Error(`Repo stats error ${res.status}`)
  return res.json()
}
