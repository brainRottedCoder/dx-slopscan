'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AppRoute } from '@/lib/routes'

/** Client redirect for static export (Vercel also has permanent redirects in vercel.json). */
export default function LegacyRedirect({ to }: { to: AppRoute }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(to)
  }, [router, to])

  return (
    <div className="min-h-[40vh] flex items-center justify-center font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
      Redirecting…
    </div>
  )
}
