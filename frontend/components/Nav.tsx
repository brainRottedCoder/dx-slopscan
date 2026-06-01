'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { useSidebar } from '@/components/SidebarProvider'
import { HugoMark } from '@/components/HugoLogo'
import { NAV_LINKS, ROUTES } from '@/lib/routes'
import {
  Home,
  BarChart3,
  Trophy,
  Layers,
  FlaskConical,
  Plug,
  Calculator,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NavIconKey } from '@/lib/routes'

const ICONS: Record<NavIconKey, LucideIcon> = {
  home: Home,
  scan: BarChart3,
  rankings: Trophy,
  taxonomy: Layers,
  evaluation: FlaskConical,
  setup: Plug,
  signals: Calculator,
  docQuality: BookOpen,
}

export default function Nav() {
  const path = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { expanded, toggleExpanded, setExpanded } = useSidebar()

  const isActive = (href: string) =>
    href === '/' ? path === '/' : path === href || path.startsWith(href + '/')

  return (
    <>
      {expanded && (
        <button
          type="button"
          className="app-sidebar-backdrop md:hidden"
          aria-label="Close navigation"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside
        className={`app-sidebar ${expanded ? 'app-sidebar--expanded' : 'app-sidebar--collapsed'}`}
        aria-label="Main navigation"
      >
        <div className="app-sidebar__header">
          <button
            type="button"
            className="app-sidebar__logo-btn"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
          >
            <HugoMark size={expanded ? 36 : 32} />
            {expanded && (
              <span className="app-sidebar__brand">Hugo</span>
            )}
          </button>
        </div>

        <nav className="app-sidebar__nav">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = isActive(href)
            const Icon = ICONS[icon]
            return (
              <Link
                key={href}
                href={href}
                title={expanded ? undefined : label}
                className={`app-sidebar__link ${active ? 'app-sidebar__link--active' : ''}`}
              >
                <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
                {expanded && <span className="app-sidebar__link-label">{label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="app-sidebar__footer">
          {expanded ? (
            <>
              <Link href={ROUTES.scan} className="app-sidebar__cta">
                RUN ANALYSIS →
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="app-sidebar__theme-btn"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Theme</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleTheme}
              className="app-sidebar__theme-btn app-sidebar__theme-btn--icon-only"
              title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
