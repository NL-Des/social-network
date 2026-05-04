'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface CurrentUser {
  name: string
  username: string
  followers: number
  initials: string
}

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Groupes', href: '/groups' },
  { label: 'Messages', href: '/messages' },
  { label: 'Notifications', href: '/notifications' },
]

export default function Header({ user }: { user: CurrentUser }) {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-card border-b border-brand-border shadow-neon px-8 h-[72px] flex items-center">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand-border bg-gray-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.initials}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{user.name}</p>
            <p className="text-brand-text text-xs">
              @{user.username} {user.followers} abonnés
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-white hover:text-brand-text transition-colors text-sm px-5 py-2 rounded-lg ${
                pathname === link.href
                  ? 'border border-brand-border shadow-[0_0_12px_rgba(73,199,255,0.6)]'
                  : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
