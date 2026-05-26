'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import NotificationList from './notification'
import { logoutAction } from '@/app/auth/logout/actions'
import ErrorBanner from '@/app/components/ui/errorBanner'

export interface CurrentUser {
  name: string
  username: string
  followers: number
  initials: string
}

const NAV_LINKS = [
  { label: 'Accueil',  href: '/'         },
  { label: 'Groupes',  href: '/groupes'  },
  { label: 'Messages', href: '/messages' },
]

export default function Header({ user }: { user: CurrentUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Etats UX pour la gestion d'erreur et de déconnexion
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showForceLogout, setShowForceLogout] = useState(false)

  // Ferme le panneau si on clique en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  // Gestion intelligente de la déconnexion
  async function handleLogout() {
    setIsPending(true)
    setErrorMsg(null)

    try {
      const res = await logoutAction()
      
      if (res && !res.success) {
        setErrorMsg(res.message || "Impossible de fermer la session proprement.")
        setShowForceLogout(true)
      }
    } catch (err) {
      setErrorMsg("Le serveur Go est injoignable. Vous pouvez forcer la déconnexion.")
      setShowForceLogout(true)
    } finally {
      setIsPending(false)
    }
  }

  // Secours local si le serveur Go ne répond pas
  function handleForceLocalLogout() {
    document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <>
      {/*On affiche l'ErrorBanner en z-50 */}
      {errorMsg && (
        <ErrorBanner 
          message={errorMsg} 
          type="critical"
          position="fixed"
          onClose={() => setErrorMsg(null)} 
        />
      )}

      {/* 💡 CORRECTION DU Z-INDEX : Le header est descendu à z-40 pour que l'ErrorBanner (z-50) passe devant sans bloquer les clics en dessous lorsqu'il disparaît */}
      <header className="fixed top-4 left-4 right-4 z-40 bg-brand-card border border-brand-border shadow-neon rounded-2xl px-8 h-[88px] flex items-center">
        <div className="w-full flex items-center justify-between">
          
          {/* Le profil est de nouveau parfaitement cliquable */}
          <Link href="/profile" className="group flex items-center gap-4 transition-opacity cursor-pointer">
            <div className="w-12 h-12 rounded-full border-2 border-brand-border bg-gray-600 flex items-center justify-center text-white font-bold text-lg shrink-0 transition-shadow group-hover:shadow-neon">
              {user.initials}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{user.name}</p>
              <p className="text-brand-text text-base">
                @{user.username} • {user.followers} abonnés
              </p>
            </div>
          </Link>

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

            {/* Bouton Notifications + panneau déroulant */}
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
                <div className="absolute right-0 top-[calc(100%+12px)] w-[420px] max-h-[70vh] overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 z-50">
                  <NotificationList />
                </div>
              )}
            </div>

            {/* Bouton de déconnexion dynamique */}
            {showForceLogout ? (
              <button
                onClick={handleForceLocalLogout}
                className="text-amber-400 hover:text-amber-300 border border-amber-500/30 bg-amber-950/20 shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all text-lg px-5 py-2 rounded-lg font-semibold animate-pulse"
              >
                Forcer la déconnexion
              </button>
            ) : (
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="text-red-400 hover:text-red-300 transition-colors text-lg px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isPending && (
                  <svg className="animate-spin h-4 w-4 text-red-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                )}
                {isPending ? 'Déconnexion...' : 'Déconnexion'}
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}