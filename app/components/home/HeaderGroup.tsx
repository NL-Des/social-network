'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import NotificationList from './notification'
import { CurrentUser } from './Header'

const NAV_LINKS = [
  { label: 'Accueil',  href: '/'         },
  { label: 'Groupes',  href: '/groupes'  },
  { label: 'Messages', href: '/messages' },
]

interface HeaderGroupProps {
  user: CurrentUser
  groupName: string
}

export default function HeaderGroup({ user, groupName }: HeaderGroupProps) {
  const pathname = usePathname()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  return (
    <header className="fixed top-4 left-4 right-4 z-50 bg-brand-card border border-brand-border shadow-neon rounded-2xl px-8 h-[88px] flex items-center">
      <div className="w-full flex items-center justify-between">
        <Link href="/profile" className="group flex items-center gap-4 transition-opacity">
          <div className="w-12 h-12 rounded-full border-2 border-brand-border bg-gray-600 flex items-center justify-center text-white font-bold text-lg shrink-0 transition-shadow group-hover:shadow-neon">
            {user.initials}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{user.name}</p>
            <p className="text-brand-text text-base">
              @{user.username} {user.followers} abonnés
            </p>
          </div>
        </Link>

        <span className="absolute left-1/2 -translate-x-1/2 text-white font-bold text-xl">
          {groupName}
        </span>

        <nav className="flex items-center gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-white hover:text-brand-text transition-colors text-lg px-5 py-2 rounded-lg ${
                pathname === link.href
                  ? 'border border-brand-border shadow-[0_0_12px_rgba(73,199,255,0.6)]'
                  : ''
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className={`text-white hover:text-brand-text transition-colors text-lg px-5 py-2 rounded-lg ${
                notifOpen
                  ? 'border border-brand-border shadow-[0_0_12px_rgba(73,199,255,0.6)]'
                  : ''
              }`}
            >
              Notifications
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-[420px] max-h-[70vh] overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5">
                <NotificationList />
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
