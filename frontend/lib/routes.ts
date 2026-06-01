/**
 * Canonical frontend routes — single source of truth for nav and links.
 * Backend API path POST /analyze is unchanged (see lib/api.ts).
 */
export const ROUTES = {
  home: '/',
  scan: '/scan',
  signals: '/signals',
  taxonomy: '/taxonomy',
  rankings: '/rankings',
  evaluation: '/evaluation',
  setup: '/setup',
  docQuality: '/doc-quality',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

/** Old path → new path (bookmarks, extension, external links). */
export const LEGACY_REDIRECTS: Record<string, AppRoute> = {
  '/analyze': ROUTES.scan,
  '/simulator': ROUTES.signals,
  '/species': ROUTES.taxonomy,
  '/leaderboard': ROUTES.rankings,
  '/benchmark': ROUTES.evaluation,
  '/integrations': ROUTES.setup,
  '/docs': ROUTES.docQuality,
}

export type NavIconKey =
  | 'home'
  | 'scan'
  | 'rankings'
  | 'taxonomy'
  | 'evaluation'
  | 'setup'
  | 'signals'
  | 'docQuality'

export interface NavLinkDef {
  href: AppRoute
  label: string
  icon: NavIconKey
}

export const NAV_LINKS: NavLinkDef[] = [
  { href: ROUTES.home, label: 'home', icon: 'home' },
  { href: ROUTES.scan, label: 'scan', icon: 'scan' },
  { href: ROUTES.rankings, label: 'rankings', icon: 'rankings' },
  { href: ROUTES.taxonomy, label: 'taxonomy', icon: 'taxonomy' },
  { href: ROUTES.evaluation, label: 'evaluation', icon: 'evaluation' },
  { href: ROUTES.setup, label: 'setup', icon: 'setup' },
  { href: ROUTES.signals, label: 'signals', icon: 'signals' },
  { href: ROUTES.docQuality, label: 'doc-quality', icon: 'docQuality' },
]
