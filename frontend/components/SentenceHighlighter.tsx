'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SentenceResult } from '@/lib/api'

const LABEL_CONFIG = {
  red: {
    border: '#ff5c6a',
    text: '#ff6b7a',
    tooltip: 'Derivable from diff — adds nothing new',
  },
  orange: {
    border: '#FDEB9E',
    text: '#ff9e66',
    tooltip: 'Partial overlap with diff',
  },
  green: {
    border: '#7AE2CF',
    text: '#5ee0a0',
    tooltip: 'Novel — genuinely adds information',
  },
  purple: {
    border: '#9d7de8',
    text: '#c4a8ff',
    tooltip: 'Epistemic act — evidence of human thought',
  },
}

const ACT_LABELS: Record<string, string> = {
  contrastive: 'contrasts alternatives',
  alternative: 'considers alternatives',
  causal:      'explains causality',
  tradeoff:    'acknowledges tradeoff',
  uncertainty: 'expresses uncertainty',
}

interface Props {
  sentences: SentenceResult[]
}

export default function SentenceHighlighter({ sentences }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  const counts = {
    red:    sentences.filter(s => s.label === 'red').length,
    orange: sentences.filter(s => s.label === 'orange').length,
    green:  sentences.filter(s => s.label === 'green').length,
    purple: sentences.filter(s => s.label === 'purple').length,
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(Object.entries(LABEL_CONFIG) as [keyof typeof LABEL_CONFIG, typeof LABEL_CONFIG['red']][]).map(([label, cfg]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, backgroundColor: cfg.border, borderRadius: 1 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: cfg.text }}>
              {label === 'red' ? 'Derivable' : label === 'orange' ? 'Partial' : label === 'green' ? 'Novel' : 'Epistemic'}
              <span className="ml-1" style={{ color: 'var(--text-muted)' }}>({counts[label]})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Sentences */}
      <div className="space-y-2">
        {sentences.map((s, i) => {
          const cfg = LABEL_CONFIG[s.label]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="relative cursor-default transition-all py-2"
              style={{
                borderLeft: `2px solid ${cfg.border}`,
                paddingLeft: 8,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-start gap-3">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{s.text}</p>
              </div>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {hovered === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-3 top-2 flex items-center gap-2"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--card-border)',
                      borderTop: '2px solid var(--scan-cyan)',
                      padding: '4px 8px',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {s.epistemic_acts.length > 0 && (
                      <span
                        className="font-mono px-1.5 py-0.5"
                        style={{ background: 'rgba(122, 226, 207, 0.1)', color: 'var(--scan-cyan)', fontSize: 10 }}
                      >
                        {ACT_LABELS[s.epistemic_acts[0]] || s.epistemic_acts[0]}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: cfg.text }}>
                      {cfg.tooltip}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {Math.round(s.derivability * 100)}% match
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
