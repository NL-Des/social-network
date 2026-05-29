'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWebSocket } from '@/lib/useWebSocket'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotifKind =
  | 'follow_request'
  | 'group_invite'
  | 'notif_new_post_in_group'
  | 'notif_new_comment'
  | 'notif_group_join_request'
  | 'notif_group_request_accepted'
  | 'notif_banned_from_group'
  | 'post_like'
  | 'unfollow'

export interface BackendNotification {
  id: number
  receiver_id: number
  kind: NotifKind
  payload: {
    actor_name?: string
    group_name?: string
    post_title?: string
    created_at?: string
  }
  read: boolean
  created_at: string
}

// ─── Libellés lisibles ────────────────────────────────────────────────────────

function formatNotif(n: BackendNotification): { symbol: string; color: string; message: string } {
  const actor = n.payload.actor_name || 'Quelqu\'un'
  const group = n.payload.group_name || 'un groupe'
  const post  = n.payload.post_title  || 'une publication'

  switch (n.kind) {
    case 'follow_request':
      return { symbol: '+', color: 'bg-purple-600', message: `${actor} souhaite vous suivre.` }
    case 'group_invite':
      return { symbol: '⊞', color: 'bg-green-700', message: `Vous avez été invité(e) dans « ${group} ».` }
    case 'notif_new_post_in_group':
      return { symbol: '📝', color: 'bg-blue-600', message: `${actor} a publié « ${post} ».` }
    case 'notif_new_comment':
      return { symbol: '💬', color: 'bg-blue-500', message: `${actor} a commenté une publication.` }
    case 'notif_group_join_request':
      return { symbol: '?', color: 'bg-yellow-600', message: `${actor} demande à rejoindre votre groupe.` }
    case 'notif_group_request_accepted':
      return { symbol: '✓', color: 'bg-green-500', message: `Votre demande d'accès à « ${group} » a été acceptée.` }
    case 'notif_banned_from_group':
      return { symbol: '✕', color: 'bg-red-600', message: `Vous avez été retiré(e) du groupe « ${group} ».` }
    case 'post_like':
      return { symbol: '👍', color: 'bg-blue-500', message: `${actor} a aimé votre publication.` }
    case 'unfollow':
      return { symbol: '−', color: 'bg-orange-500', message: `${actor} s'est désabonné(e) de votre profil.` }
    default:
      return { symbol: '•', color: 'bg-gray-600', message: 'Nouvelle notification.' }
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR')
  } catch {
    return iso
  }
}

// ─── Composant ────────────────────────────────────────────────────────────────

interface NotificationListProps {
  wsUrl?: string | null
  onUnreadCountChange?: (count: number) => void
}

export default function NotificationList({ wsUrl, onUnreadCountChange }: NotificationListProps) {
  const [notifications, setNotifications] = useState<BackendNotification[]>([])
  const [loading, setLoading] = useState(true)

  // Chargement initial + mark-all-read à l'unmount (seulement si les notifs ont été chargées)
  useEffect(() => {
    let cancelled = false
    let loaded = false

    fetch('/api/notifications')
      .then((res) => res.ok ? res.json() : [])
      .then((data: BackendNotification[]) => {
        if (cancelled) return
        loaded = true
        setNotifications(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => { if (!cancelled) setLoading(false) })

    return () => {
      cancelled = true
      // Ne marque comme lu que si on a vraiment affiché les notifs
      if (loaded) fetch('/api/notifications/read', { method: 'PATCH' }).catch(() => {})
    }
  }, [])

  // Remontée du badge au parent
  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length
    onUnreadCountChange?.(count)
  }, [notifications, onUnreadCountChange])

  // Push WS : nouvelle notification entrante
  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type?: string; data?: { kind?: string; payload?: BackendNotification['payload'] } }
    if (msg.type === 'notification') {
      const fake: BackendNotification = {
        id:          Date.now(),
        receiver_id: 0,
        kind:        (msg.data?.kind ?? 'follow_request') as NotifKind,
        payload:     msg.data?.payload ?? {},
        read:        false,
        created_at:  new Date().toISOString(),
      }
      setNotifications((prev) => [fake, ...prev])
    }
  }, [])

  useWebSocket(wsUrl ?? null, handleWsMessage)

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return <p className="text-brand-text text-sm text-center py-4">Chargement…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-[#49C7FF] text-base">Notifications</h2>
          {unreadCount > 0 && (
            <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
        {notifications.filter((n) => !n.read).length === 0 ? (
          <p className="text-brand-text/60 text-sm text-center py-4">Aucune notification.</p>
        ) : (
          notifications.filter((n) => !n.read).slice(0, 10).map((n) => {
            const { symbol, color, message } = formatNotif(n)
            return (
              <div
                key={n.id}
                className="flex items-start gap-4 p-4 rounded-2xl border border-brand-border shadow-[0_0_10px_rgba(73,199,255,0.2)] bg-brand-card w-full"
              >
                {/* Badge type */}
                <span
                  className={`shrink-0 w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {symbol}
                </span>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <p className="text-brand-text text-sm leading-snug">{message}</p>
                  <p className="text-brand-text/50 text-xs mt-1">{formatDate(n.created_at)}</p>
                </div>

                <span className="shrink-0 w-2 h-2 rounded-full bg-brand-border mt-1" />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
