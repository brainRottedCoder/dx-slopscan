'use client'
import { useState, useMemo } from 'react'
import type { AnalyzeResponse } from '@/lib/api'
import { Sliders, CheckCircle2 } from 'lucide-react'

interface Props {
  result: AnalyzeResponse
}

const SIGNAL_WEIGHTS = {
  coverage: 0.18,
  novelty: 0.20,
  reasoning: 0.18,
  anchor: 0.10,
  mirror: 0.10,
  reach: 0.08,
  lean: 0.03,
  specificity: 0.06,
  structure: 0.07,
}

const MISSING_WEIGHTS = {
  why: 0.22, tradeoff: 0.15, alternative: 0.15, risk: 0.12, evidence: 0.12,
  scope: 0.10, rollback: 0.08, migration: 0.06,
}
const MISSING_BOOST = {
  why: 10, tradeoff: 7, alternative: 7, risk: 5, evidence: 5,
  scope: 4, rollback: 3, migration: 3,
}

export default function ScoreSimulator({ result }: Props) {
  const m = result.whats_missing
  const s = result.signals

  const [addWhy,         setAddWhy]         = useState(false)
  const [addTradeoff,    setAddTradeoff]     = useState(false)
  const [addAlternative, setAddAlternative] = useState(false)
  const [addRisk,        setAddRisk]         = useState(false)
  const [addEvidence,    setAddEvidence]     = useState(false)
  const [addScope,       setAddScope]        = useState(false)
  const [addRollback,    setAddRollback]     = useState(false)
  const [addMigration,   setAddMigration]    = useState(false)

  const simulatedScore = useMemo(() => {
    const coverage =
      ((m.has_why         || addWhy)         ? MISSING_WEIGHTS.why         : 0) +
      ((m.has_tradeoff    || addTradeoff)    ? MISSING_WEIGHTS.tradeoff    : 0) +
      ((m.has_alternative || addAlternative) ? MISSING_WEIGHTS.alternative : 0) +
      ((m.has_risk        || addRisk)        ? MISSING_WEIGHTS.risk        : 0) +
      ((m.has_evidence    || addEvidence)    ? MISSING_WEIGHTS.evidence    : 0) +
      ((m.has_scope       || addScope)       ? MISSING_WEIGHTS.scope       : 0) +
      ((m.has_rollback    || addRollback)    ? MISSING_WEIGHTS.rollback    : 0) +
      ((m.has_migration   || addMigration)   ? MISSING_WEIGHTS.migration   : 0)
    const ensemble = (
      coverage              * SIGNAL_WEIGHTS.coverage +
      s.novelty             * SIGNAL_WEIGHTS.novelty +
      s.reasoning           * SIGNAL_WEIGHTS.reasoning +
      s.anchor              * SIGNAL_WEIGHTS.anchor +
      (1 - s.mirror_penalty) * SIGNAL_WEIGHTS.mirror +
      (s.reach ?? 0.5)      * SIGNAL_WEIGHTS.reach +
      (s.lean ?? 0.5)       * SIGNAL_WEIGHTS.lean +
      (s.specificity ?? 0)  * SIGNAL_WEIGHTS.specificity +
      (s.structure ?? 0)    * SIGNAL_WEIGHTS.structure
    ) * 100
    return Math.min(100, Math.round(ensemble))
  }, [addWhy, addTradeoff, addAlternative, addRisk, addEvidence, addScope, addRollback, addMigration, m, s])

  const gain = simulatedScore - Math.round(result.hugo_score)
  const color = (v: number) => v >= 76 ? '#7AE2CF' : v >= 51 ? '#FDEB9E' : v >= 26 ? '#e07000' : '#ff5c6a'

  const toggles = [
    { key: 'why',         label: 'Add WHY rationale',         already: m.has_why,         set: setAddWhy,         val: addWhy,         pts: MISSING_BOOST.why },
    { key: 'tradeoff',    label: 'Add Tradeoff',              already: m.has_tradeoff,    set: setAddTradeoff,    val: addTradeoff,    pts: MISSING_BOOST.tradeoff },
    { key: 'alternative', label: 'Add Alternative considered',already: m.has_alternative, set: setAddAlternative, val: addAlternative, pts: MISSING_BOOST.alternative },
    { key: 'risk',        label: 'Add Risk / Reviewer guidance', already: m.has_risk,     set: setAddRisk,        val: addRisk,        pts: MISSING_BOOST.risk },
    { key: 'evidence',    label: 'Add Testing evidence',      already: m.has_evidence,    set: setAddEvidence,    val: addEvidence,    pts: MISSING_BOOST.evidence },
    { key: 'scope',       label: 'Add Scope (in/out)',        already: m.has_scope ?? false,       set: setAddScope,       val: addScope,       pts: MISSING_BOOST.scope },
    { key: 'rollback',    label: 'Add Rollout / rollback',    already: m.has_rollback ?? false,    set: setAddRollback,    val: addRollback,    pts: MISSING_BOOST.rollback },
    { key: 'migration',   label: 'Add Migration notes',       already: m.has_migration ?? false,   set: setAddMigration,   val: addMigration,   pts: MISSING_BOOST.migration },
  ]

  return (
    <div className="panel"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderTop: '2px solid var(--scan-cyan)',
        backdropFilter: 'blur(12px)',
      }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <Sliders size={14} style={{ color: 'var(--scan-cyan)' }} />
        <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--scan-cyan)', fontFamily: 'var(--font-mono)' }}>SCORE SIMULATOR</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-mono text-3xl font-bold" style={{ color: color(result.hugo_score), fontFamily: 'var(--font-mono)' }}>
              {Math.round(result.hugo_score)}
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>current</div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${simulatedScore}%`, background: color(simulatedScore), boxShadow: `0 0 8px ${color(simulatedScore)}50` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-3xl font-bold transition-all duration-300" style={{ color: color(simulatedScore), fontFamily: 'var(--font-mono)' }}>
              {simulatedScore}
            </div>
            <div className="text-xs font-mono" style={{ color: gain > 0 ? '#7AE2CF' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {gain > 0 ? `+${gain}` : 'simulated'}
            </div>
          </div>
        </div>

        {gain !== 0 && (
          <div className="flex justify-center">
            <span className="font-mono text-xs px-2 py-1 border" style={{
              color: gain > 0 ? '#7AE2CF' : '#ff5c6a',
              borderColor: gain > 0 ? 'rgba(122,226,207,0.3)' : 'rgba(255,92,106,0.3)',
              background: gain > 0 ? 'rgba(122,226,207,0.06)' : 'rgba(255,92,106,0.06)',
              fontFamily: 'var(--font-mono)',
            }}>
              {gain > 0 ? `+${gain}` : `${gain}`} pts
            </span>
          </div>
        )}

        <div className="space-y-2">
          {toggles.map(t => (
            <button key={t.key}
              onClick={() => !t.already && t.set((v: boolean) => !v)}
              disabled={t.already}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-left"
              style={{
                border: `1px solid ${t.already ? 'rgba(0,230,118,0.3)' : t.val ? 'rgba(122,226,207,0.4)' : 'var(--card-border)'}`,
                background: t.already ? 'rgba(0,230,118,0.04)' : t.val ? 'rgba(122,226,207,0.06)' : 'transparent',
                cursor: t.already ? 'default' : 'pointer',
                opacity: t.already ? 0.7 : 1,
              }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border flex items-center justify-center text-xs"
                  style={{
                    border: `1px solid ${t.already ? '#7AE2CF' : t.val ? '#7AE2CF' : 'var(--card-border)'}`,
                    background: t.already ? 'rgba(122,226,207,0.2)' : t.val ? 'rgba(122,226,207,0.2)' : 'transparent',
                    color: t.already ? '#7AE2CF' : '#7AE2CF',
                  }}>
                  {(t.already || t.val) ? <CheckCircle2 size={12} /> : ''}
                </div>
                <span className="text-xs" style={{ color: t.already ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {t.label}
                </span>
                {t.already && <span className="text-xs" style={{ color: '#7AE2CF' }}>already present</span>}
              </div>
              <span className="text-xs font-mono" style={{ color: t.already ? 'var(--text-muted)' : '#7AE2CF', fontFamily: 'var(--font-mono)' }}>
                {t.already ? '' : `+~${t.pts} pts`}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Estimates based on signal weights. Actual improvement depends on content quality, not just presence.
        </p>
      </div>
    </div>
  )
}
