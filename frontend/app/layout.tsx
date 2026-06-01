import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SidebarProvider } from '@/components/SidebarProvider'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dx-slopscan.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Hugo — dx-slopscan | PR Intelligence Engine',
  description: 'Hugo scores epistemic contribution in PR descriptions. Not AI detection — human-thought detection. By Shubh Varshney.',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'Hugo — DX SlopScan',
    description: 'Detect low-effort PR prose by measuring human thought, not AI authorship.',
    type: 'website',
    images: [{ url: '/logo.svg', width: 400, height: 96, alt: 'Hugo · DX SlopScan' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark-theme" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#077A7D" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Hugo" />
        <meta name="robots" content="index, follow" />
      </head>
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <div className="grid-bg" aria-hidden="true" />
            <Nav />
            <main className="app-main">
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
