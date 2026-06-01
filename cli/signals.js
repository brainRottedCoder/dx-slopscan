/** Mirror of frontend/lib/signals.ts + frontend/lib/coverage.ts (keep in sync). */

const SCORING_SIGNALS = [
  { key: 'coverage', label: 'Coverage', weight: 18, invert: false, description: 'Epistemic coverage' },
  { key: 'novelty', label: 'Novelty', weight: 20, invert: false, description: 'Novelty vs diff' },
  { key: 'reasoning', label: 'Reasoning', weight: 18, invert: false, description: 'Epistemic acts' },
  { key: 'anchor', label: 'Anchor', weight: 10, invert: false, description: 'Causal + entity' },
  { key: 'mirror_penalty', label: 'Mirror', weight: 10, invert: true, description: 'Diff mirroring (inverted)' },
  { key: 'reach', label: 'Reach', weight: 8, invert: false, description: 'Diff reach' },
  { key: 'lean', label: 'Lean', weight: 3, invert: false, description: 'Info density' },
  { key: 'specificity', label: 'Specificity', weight: 6, invert: false, description: 'Technical depth' },
  { key: 'structure', label: 'Structure', weight: 7, invert: false, description: 'Structural clarity' },
]

const COVERAGE_CHECKS = [
  { key: 'has_why', label: 'Rationale (WHY)' },
  { key: 'has_tradeoff', label: 'Tradeoff acknowledged' },
  { key: 'has_alternative', label: 'Alternatives considered' },
  { key: 'has_risk', label: 'Risks flagged' },
  { key: 'has_evidence', label: 'Testing evidence' },
  { key: 'has_scope', label: 'Scope defined' },
  { key: 'has_rollback', label: 'Rollback / rollout noted' },
  { key: 'has_migration', label: 'Migration path documented' },
  { key: 'has_example', label: 'Example provided' },
  { key: 'has_prerequisite', label: 'Prerequisites noted' },
  { key: 'has_step', label: 'Steps described' },
]

function signalRaw(signals, key) {
  const val = signals[key]
  if (typeof val === 'number') return val
  if (key === 'reach' || key === 'lean') return 0.5
  return 0
}

function effectiveSignal(signals, sig) {
  const raw = signalRaw(signals, sig.key)
  return sig.invert ? 1 - raw : raw
}

module.exports = { SCORING_SIGNALS, COVERAGE_CHECKS, signalRaw, effectiveSignal }
