'use client'

interface TrackBadgeProps {
  id: string
  label: string
}

export default function TrackBadge({ id, label }: TrackBadgeProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <span className="track-badge">[{id}]</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        {label.toUpperCase()}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
    </div>
  )
}
