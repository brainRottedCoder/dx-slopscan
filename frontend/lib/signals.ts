/** Canonical Hugo detection signals — shared across UI, CLI copy, and docs. */

export const SIGNAL_KEYS = {
  coverage: 'coverage',
  novelty: 'novelty',
  reasoning: 'reasoning',
  anchor: 'anchor',
  mirror_penalty: 'mirror_penalty',
  reach: 'reach',
  lean: 'lean',
  specificity: 'specificity',
  structure: 'structure',
  confidence: 'confidence',
} as const

export type SignalKey = keyof typeof SIGNAL_KEYS

export interface SignalMeta {
  key: SignalKey
  label: string
  abbr: string
  full: string
  weight: number
  description: string
  invert?: boolean
}

export const HUGO_SIGNALS: SignalMeta[] = [
  {
    key: 'coverage',
    label: 'Coverage',
    abbr: 'CV',
    full: 'Epistemic Coverage',
    weight: 18,
    description: 'WHY, tradeoffs, alternatives, risks, evidence, scope, and rollback',
  },
  {
    key: 'novelty',
    label: 'Novelty',
    abbr: 'NV',
    full: 'Diff Novelty',
    weight: 20,
    description: 'Sentences not predictable from the diff alone',
  },
  {
    key: 'reasoning',
    label: 'Reasoning',
    abbr: 'RS',
    full: 'Epistemic Reasoning',
    weight: 18,
    description: 'Causal, contrastive, tradeoff, hypothesis, and constraint acts',
  },
  {
    key: 'anchor',
    label: 'Anchor',
    abbr: 'AN',
    full: 'Entity Anchor',
    weight: 10,
    description: 'Causal connectors tied to specific diff entities',
  },
  {
    key: 'mirror_penalty',
    label: 'Mirror',
    abbr: 'MR',
    full: 'Diff Mirror Penalty',
    weight: 10,
    description: 'Vocabulary overlap with diff (inverted in score)',
    invert: true,
  },
  {
    key: 'reach',
    label: 'Reach',
    abbr: 'RC',
    full: 'Diff Reach',
    weight: 8,
    description: 'Whether the description explains what the diff changed',
  },
  {
    key: 'lean',
    label: 'Lean',
    abbr: 'LN',
    full: 'Information Lean',
    weight: 3,
    description: 'Unique content words vs filler (anti-padding)',
  },
  {
    key: 'specificity',
    label: 'Specificity',
    abbr: 'SP',
    full: 'Technical Specificity',
    weight: 6,
    description: 'Quantitative claims, identifiers, and concrete technical detail',
  },
  {
    key: 'structure',
    label: 'Structure',
    abbr: 'ST',
    full: 'Structural Clarity',
    weight: 7,
    description: 'Sections, substantive bullets, and reviewer-oriented layout',
  },
]

export const HUGO_FORMULA =
  'Hugo = Coverage×0.18 + Novelty×0.20 + Reasoning×0.18 + Anchor×0.10 + (1−Mirror)×0.10 + Reach×0.08 + Lean×0.03 + Specificity×0.06 + Structure×0.07'

/** Scoring signals only (excludes confidence). */
export const SCORING_SIGNALS = HUGO_SIGNALS.filter(s => s.key !== 'confidence')

export function signalWeightDecimal(key: SignalKey): number {
  const meta = HUGO_SIGNALS.find(s => s.key === key)
  return (meta?.weight ?? 0) / 100
}
