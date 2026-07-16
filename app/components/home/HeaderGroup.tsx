'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import NotificationList from './notification'
import { CurrentUser } from './Header'
import { logoutAction } from '@/app/auth/logout/actions'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  return (
    <header className="fixed top-4 left-4 right-4 z-50 bg-brand-card border border-brand-border shadow-neon rounded-2xl px-4 md:px-8 h-[88px] flex items-center">
      <div className="w-full flex items-center justify-between gap-3 min-w-0">
        <Link href="/profile" className="group flex items-center gap-2 md:gap-4 transition-opacity shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-brand-border bg-gray-600 flex items-center justify-center text-white font-bold text-lg shrink-0 transition-shadow group-hover:shadow-neon">
            {user.initials}
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-brand-text text-base truncate">
              @{user.username} {user.followers} abonnés
            </p>
            <p className="text-white font-semibold text-lg truncate">@{user.name}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-auto">
          <nav className="hidden md:flex items-center gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-white hover:text-brand-text transition-colors text-lg px-5 py-2 rounded-lg whitespace-nowrap ${
                  pathname === link.href || (link.href === '/groupes' && pathname.startsWith('/inside-groups'))
                    ? 'border border-brand-border shadow-[0_0_12px_rgba(73,199,255,0.6)]'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div ref={notifRef} className="relative shrink-0">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className={`text-white hover:text-brand-text transition-colors text-sm md:text-lg px-2.5 md:px-5 py-2 rounded-lg whitespace-nowrap ${
                notifOpen
                  ? 'border border-brand-border shadow-[0_0_12px_rgba(73,199,255,0.6)]'
                  : ''
              }`}
            >
              Notifications
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-[min(90vw,420px)] max-h-[70vh] overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5">
                <NotificationList />
              </div>
            )}
          </div>

          <button
            onClick={logoutAction}
            className="hidden md:inline-block text-red-400 hover:text-red-300 transition-colors text-lg px-5 py-2 rounded-lg whitespace-nowrap"
          >
            Déconnexion
          </button>

          {/* Menu burger mobile */}
          <div ref={mobileMenuRef} className="relative md:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Menu"
              className={`text-white text-xl px-3 py-2 rounded-lg ${
                mobileMenuOpen ? 'border border-brand-border shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
              }`}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-48 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-3 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-white hover:text-brand-text transition-colors text-base px-3 py-2 rounded-lg ${
                      pathname === link.href || (link.href === '/groupes' && pathname.startsWith('/inside-groups'))
                        ? 'border border-brand-border shadow-[0_0_12px_rgba(73,199,255,0.6)]'
                        : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => { setMobileMenuOpen(false); logoutAction() }}
                  className="text-red-400 hover:text-red-300 transition-colors text-base px-3 py-2 rounded-lg text-left"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
