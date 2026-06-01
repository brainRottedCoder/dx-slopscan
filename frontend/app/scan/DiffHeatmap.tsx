'use client'
import type { UncoveredChunk } from '@/lib/api'
import { Map, FileQuestion } from 'lucide-react'

interface Props {
  uncovered_chunks: UncoveredChunk[]
  diff_summary?: string
  reach_score: number
}

export default function DiffHeatmap({ uncovered_chunks, diff_summary, reach_score }: Props) {
  const covered_pct = Math.round(reach_score * 100)

  if (!diff_summary && uncovered_chunks.length === 0) return null

  const dssColor = reach_score >= 0.65 ? '#7AE2CF' : reach_score >= 0.40 ? '#FDEB9E' : '#ff5c6a'

  return (
    <div className="panel"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderTop: '2px solid var(--scan-cyan)',
        backdropFilter: 'blur(12px)',
      }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <Map size={14} style={{ color: 'var(--scan-cyan)' }} />
        <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--scan-cyan)', fontFamily: 'var(--font-mono)' }}>DIFF COVERAGE HEATMAP</span>
        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>How well does your description cover what changed?</span>
      </div>
      <div className="p-4 space-y-4">
        {/* Reach bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Diff Sync Score (Reach)</span>
            <span style={{ color: '#FDEB9E', fontFamily: 'var(--font-mono)' }}>Reach: {reach_score.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Diff Coverage</span>
            <span style={{ color: dssColor, fontFamily: 'var(--font-mono)' }}>{covered_pct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-full transition-all duration-700"
              style={{ width: `${covered_pct}%`, background: dssColor, boxShadow: `0 0 8px ${dssColor}60` }} />
            <div className="h-full flex-1" style={{ background: 'var(--bg-void)' }} />
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: dssColor, fontFamily: 'var(--font-mono)' }}>Explained by description</span>
            <span style={{ color: '#ff5c6a', fontFamily: 'var(--font-mono)' }}>Not mentioned</span>
          </div>
        </div>

        {/* Uncovered chunks */}
        {uncovered_chunks.length > 0 && (
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Diff areas your description never explains:
            </div>
            {uncovered_chunks.map((chunk, i) => {
              const chunkColor = chunk.coverage >= 0.65 ? '#7AE2CF' : chunk.coverage >= 0.40 ? '#FDEB9E' : '#ff5c6a'
              return (
                <div key={i} className="p-3"
                  style={{
                    background: 'rgba(255,92,106,0.04)',
                    border: '1px solid rgba(255,92,106,0.15)',
                    borderLeft: `3px solid ${chunkColor}`,
                  }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 flex-1" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="h-full"
                        style={{ width: `${Math.round(chunk.coverage * 100)}%`, background: chunkColor }} />
                    </div>
                    <span className="font-mono text-xs" style={{ color: chunkColor, fontFamily: 'var(--font-mono)' }}>{Math.round(chunk.coverage * 100)}%</span>
                  </div>
                  <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{chunk.chunk}</p>
                </div>
              )
            })}
          </div>
        )}

        {uncovered_chunks.length === 0 && reach_score >= 0.6 && (
          <div className="text-center py-3 text-xs flex items-center justify-center gap-2" style={{ color: '#7AE2CF' }}>
            <FileQuestion size={14} />
            Description covers the diff well. Reach is high.
          </div>
        )}

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Reach measures whether the diff contains things your description never mentions.
          Low Reach = code changed but description never explains what or why.
        </p>
      </div>
    </div>
  )
}
