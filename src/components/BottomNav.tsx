'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Configurator' },
  { href: '/guide', label: 'Architecture' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 bg-surface border border-border rounded-full shadow-lg">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-1.5 rounded-full text-sm font-mono transition-colors ${
                active ? 'bg-accent text-bg' : 'text-muted hover:text-fg'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
