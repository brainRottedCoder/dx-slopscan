'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import { Copy, Ghost, Layers, RefreshCw, Circle, Files, Timer, Search, Wrench } from 'lucide-react'
import { SPECIES_DATA, type SpeciesItem } from '@/lib/species'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Copy,
  Ghost,
  Layers,
  RefreshCw,
  Circle,
  Files,
  Timer,
}

function SpeciesIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] || Circle
  return <Icon size={size} />
}

export default function SpeciesPage() {
  const [selected, setSelected] = useState<number>(0)
  const species = SPECIES_DATA[selected]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="track-badge">[TRACK·03]</span>
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              TAXONOMY
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 900 }}>
            7-Species Slop Taxonomy
          </h1>
          <p className="text-sm max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Every low-scoring PR is classified into one of seven slop species.
            Rule-based detection. Zero LLM calls. Click any species to see evidence, counterfactual, and fix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-4">
            <div className="sticky top-20 space-y-1">
              {SPECIES_DATA.map((s, i) => (
                <button
                  key={s.type}
                  onClick={() => setSelected(i)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors"
                  style={{
                    borderLeft: selected === i ? '3px solid #FDEB9E' : '3px solid transparent',
                    color: selected === i ? '#FDEB9E' : 'var(--text-muted)',
                    background: selected === i ? 'rgba(253,235,158,0.04)' : 'transparent',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                  onMouseEnter={e => {
                    if (selected !== i) {
                      e.currentTarget.style.color = '#7AE2CF'
                    }
                  }}
                  onMouseLeave={e => {
                    if (selected !== i) {
                      e.currentTarget.style.color = 'var(--text-muted)'
                    }
                  }}
                >
                  <SpeciesIcon name={s.lucideIcon} size={16} />
                  <span>{s.name.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="md:col-span-8 space-y-5">
            <div>
              <h2 className="font-display text-5xl font-bold mb-2" style={{ color: '#FDEB9E', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                {species.name.toUpperCase()}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{species.desc}</p>
            </div>

            {/* Detection signal */}
            <div className="panel"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderTop: '2px solid #077A7D',
                backdropFilter: 'blur(12px)',
              }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <Search size={14} style={{ color: 'var(--scan-cyan)' }} />
                <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--scan-cyan)', fontFamily: 'var(--font-mono)' }}>Detection Signal</span>
              </div>
              <div className="p-4">
                <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{species.signal}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{species.desc}</p>
              </div>
            </div>

            {/* Example snippet */}
            <div className="panel-gold"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderTop: '2px solid #FDEB9E',
                backdropFilter: 'blur(12px)',
              }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: '#FDEB9E', fontFamily: 'var(--font-mono)' }}>Example (Slop)</span>
              </div>
              <div className="p-4">
                <pre className="text-xs font-mono whitespace-pre-wrap italic" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {species.example}
                </pre>
              </div>
            </div>

            {/* Counterfactual */}
            <div className="panel"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderTop: '2px solid #7AE2CF',
                backdropFilter: 'blur(12px)',
              }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: '#7AE2CF', fontFamily: 'var(--font-mono)' }}>Counterfactual (Quality)</span>
              </div>
              <div className="p-4">
                <pre className="text-xs font-mono whitespace-pre-wrap italic" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {species.counterfactual}
                </pre>
              </div>
            </div>

            {/* Fix */}
            <div className="panel"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderTop: '2px solid #077A7D',
                backdropFilter: 'blur(12px)',
              }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <Wrench size={14} style={{ color: 'var(--scan-cyan)' }} />
                <span className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--scan-cyan)', fontFamily: 'var(--font-mono)' }}>How To Fix</span>
              </div>
              <div className="p-4">
                <p className="text-sm" style={{ color: 'var(--text-body)' }}>{species.fix}</p>
              </div>
            </div>

            <Link href={ROUTES.scan}
              className="inline-block font-mono text-xs px-4 py-2 border transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--scan-cyan)',
                border: '1px solid var(--scan-cyan)',
                fontFamily: 'var(--font-mono)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#7AE2CF'; e.currentTarget.style.color = 'var(--bg-void)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--scan-cyan)' }}>
              Analyze a PR → Detect Species
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
