import type { Metadata } from 'next'
import { IBM_Plex_Mono, Pixelify_Sans } from 'next/font/google'
import './globals.css'
import AsciiBackground from '@/components/AsciiBackground'
import { BottomNav } from '@/components/BottomNav'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-pixelify-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Claude Code Statusline Configurator',
  description: 'Generate a customized Claude Code statusline script — no manual editing required.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${ibmPlexMono.variable} ${pixelifySans.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-fg font-mono min-h-screen antialiased">
        <AsciiBackground />
        <div className="relative" style={{ zIndex: 1 }}>
          {children}
          <BottomNav />
        </div>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </body>
    </html>
  )
}
