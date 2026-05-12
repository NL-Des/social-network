'use client'

import Link from 'next/link'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = 'follow' | 'like' | 'comment' | 'mention' | 'group'

export interface Notification {
  id: string
  type: NotificationType
  from: string
  fromInitials: string
  message: string
  date: string
  read: boolean
  // Cible de la redirection — à alimenter par le back :
  // follow/mention → /users/:id  |  like/comment → /posts/:id  |  group → /groupes/:id
  href: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'follow',
    from: 'Audrey D',
    fromInitials: 'AD',
    message: 'a commencé à vous suivre.',
    date: '27/03/2026',
    read: false,
    href: '/users/1',
  },
  {
    id: '2',
    type: 'like',
    from: 'Jade C',
    fromInitials: 'JC',
    message: 'a aimé votre publication.',
    date: '27/03/2026',
    read: false,
    href: '/posts/1',
  },
  {
    id: '3',
    type: 'comment',
    from: 'Mathis P',
    fromInitials: 'MP',
    message: 'a commenté votre publication : "Super post !"',
    date: '26/03/2026',
    read: true,
    href: '/posts/2',
  },
  {
    id: '4',
    type: 'mention',
    from: 'Nathan L',
    fromInitials: 'NL',
    message: 'vous a mentionné dans une publication.',
    date: '26/03/2026',
    read: true,
    href: '/posts/3',
  },
  {
    id: '5',
    type: 'group',
    from: 'Dev Frontend',
    fromInitials: 'DF',
    message: 'vous invite à rejoindre le groupe.',
    date: '25/03/2026',
    read: true,
    href: '/groupes/2',
  },
  {
    id: '6',
    type: 'follow',
    from: 'Valentine L',
    fromInitials: 'VL',
    message: 'a commencé à vous suivre.',
    date: '25/03/2026',
    read: true,
    href: '/users/6',
  },
]

// ─── Icône par type ───────────────────────────────────────────────────────────

const typeColors: Record<NotificationType, string> = {
  follow:  'bg-purple-600',
  like:    'bg-pink-600',
  comment: 'bg-blue-600',
  mention: 'bg-yellow-600',
  group:   'bg-green-700',
}

const typeSymbols: Record<NotificationType, string> = {
  follow:  '+',
  like:    '♥',
  comment: '💬',
  mention: '@',
  group:   '⊞',
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-retro text-brand-border text-base">Notifications</h2>
          {unreadCount > 0 && (
            <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-brand-text text-sm hover:text-white transition-colors"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Liste — limitée à 5 notifications visibles */}
      <div className="flex flex-col gap-3 max-h-100 overflow-y-auto pr-1">
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            onClick={() => markRead(n.id)}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
              n.read
                ? 'bg-brand-card border-brand-border/30 hover:border-brand-border/60'
                : 'bg-brand-card border-brand-border shadow-[0_0_10px_rgba(73,199,255,0.2)]'
            }`}
          >
            {/* Avatar + badge type */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                {n.fromInitials}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${typeColors[n.type]} flex items-center justify-center text-white text-xs font-bold`}
              >
                {typeSymbols[n.type]}
              </span>
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <p className="text-base leading-snug">
                <span className="text-white font-semibold">{n.from} </span>
                <span className="text-brand-text">{n.message}</span>
              </p>
              <p className="text-brand-text/60 text-xs mt-1">{n.date}</p>
            </div>

            {/* Point non-lu */}
            {!n.read && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-brand-border mt-1" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
