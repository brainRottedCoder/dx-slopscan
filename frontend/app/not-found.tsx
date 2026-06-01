import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6">
      <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Page not found
      </h1>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        That route does not exist in Hugo.
      </p>
      <Link
        href={ROUTES.home}
        className="font-mono text-xs px-4 py-2 border"
        style={{ color: 'var(--scan-cyan)', borderColor: 'var(--card-border)' }}
      >
        Back to home
      </Link>
    </div>
  )
}
