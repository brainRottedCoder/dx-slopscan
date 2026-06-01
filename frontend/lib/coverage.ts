import type { WhatsMissing } from '@/lib/api'

export const COVERAGE_CHECKS: { key: keyof WhatsMissing; label: string }[] = [
  { key: 'has_why', label: 'Rationale (why)' },
  { key: 'has_tradeoff', label: 'Tradeoff acknowledged' },
  { key: 'has_alternative', label: 'Alternatives considered' },
  { key: 'has_risk', label: 'Risks flagged' },
  { key: 'has_evidence', label: 'Evidence of testing' },
  { key: 'has_scope', label: 'Scope defined' },
  { key: 'has_rollback', label: 'Rollback / rollout noted' },
  { key: 'has_migration', label: 'Migration path documented' },
  { key: 'has_example', label: 'Example provided' },
  { key: 'has_prerequisite', label: 'Prerequisites noted' },
  { key: 'has_step', label: 'Steps described' },
]
