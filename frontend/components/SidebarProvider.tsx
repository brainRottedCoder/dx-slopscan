'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'dx-slopscan-sidebar-expanded'

export const SIDEBAR_WIDTH_EXPANDED = '240px'
export const SIDEBAR_WIDTH_COLLAPSED = '56px'

type SidebarContextType = {
  expanded: boolean
  mounted: boolean
  toggleExpanded: () => void
  setExpanded: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  expanded: true,
  mounted: false,
  toggleExpanded: () => {},
  setExpanded: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpandedState] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      setExpandedState(saved === 'true')
    } else if (window.matchMedia('(max-width: 767px)').matches) {
      setExpandedState(false)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const width = expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED
    document.documentElement.style.setProperty('--sidebar-width', width)
    localStorage.setItem(STORAGE_KEY, String(expanded))
  }, [expanded, mounted])

  const setExpanded = useCallback((value: boolean) => {
    setExpandedState(value)
  }, [])

  const toggleExpanded = useCallback(() => {
    setExpandedState((prev) => !prev)
  }, [])

  return (
    <SidebarContext.Provider value={{ expanded, mounted, toggleExpanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}
