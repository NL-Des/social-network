'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWebSocket } from '@/lib/useWebSocket'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotifKind =
  | 'follow'
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
    actor_id?: number
    actor_name?: string
    group_id?: number
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
    case 'follow':
      return { symbol: '+', color: 'bg-purple-600', message: `${actor} s'est abonné(e) à votre profil.` }
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
  // IDs des notifs non-lues au moment du chargement → gardent le highlight pendant toute la session
  const initialUnreadIds = useRef<Set<number>>(new Set())

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.ok ? res.json() : [])
      .then((data: BackendNotification[]) => {
        const list = Array.isArray(data) ? data : []
        initialUnreadIds.current = new Set(list.filter((n) => !n.read).map((n) => n.id))
        setNotifications(list)
        setLoading(false)
        if (list.some((n) => !n.read)) {
          fetch('/api/notifications/read', { method: 'PUT' }).catch(() => {})
        }
      })
      .catch(() => setLoading(false))
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
      const newId = Date.now()
      initialUnreadIds.current.add(newId)
      const fake: BackendNotification = {
        id:          newId,
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

  function deleteOne(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    fetch(`/api/notifications/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  function deleteAll() {
    setNotifications([])
    fetch('/api/notifications', { method: 'DELETE' }).catch(() => {})
  }

  async function handleAccept(n: BackendNotification) {
    await fetch(`/api/users/${n.payload.actor_id}/follow/accept`, { method: 'PATCH' }).catch(() => {})
    deleteOne(n.id)
  }

  async function handleReject(n: BackendNotification) {
    await fetch(`/api/users/${n.payload.actor_id}/follow/reject`, { method: 'DELETE' }).catch(() => {})
    deleteOne(n.id)
  }

  async function handleAcceptInvite(n: BackendNotification) {
    await fetch(`/api/group-chat/${n.payload.group_id}/invite`, { method: 'PUT' }).catch(() => {})
    deleteOne(n.id)
  }

  async function handleRejectInvite(n: BackendNotification) {
    await fetch(`/api/group-chat/${n.payload.group_id}/invite`, { method: 'DELETE' }).catch(() => {})
    deleteOne(n.id)
  }

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
        {notifications.length > 0 && (
          <button
            onClick={deleteAll}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Tout supprimer
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <p className="text-brand-text/60 text-sm text-center py-4">Aucune notification.</p>
        ) : (
          notifications.slice(0, 30).map((n) => {
            const { symbol, color, message } = formatNotif(n)
            const isNew = initialUnreadIds.current.has(n.id) || !n.read
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border shadow-[0_0_10px_rgba(73,199,255,0.2)] w-full ${
                  isNew
                    ? 'border-[#49C7FF]/50 bg-[#49C7FF]/5 shadow-[0_0_12px_rgba(73,199,255,0.3)]'
                    : 'border-brand-border bg-brand-card'
                }`}
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
                  {n.kind === 'follow_request' && n.payload.actor_id && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAccept(n)}
                        className="px-3 py-1 rounded-lg bg-green-600/20 border border-green-500/40 text-green-400 text-xs hover:bg-green-600/40 transition-colors"
                      >
                        ✓ Accepter
                      </button>
                      <button
                        onClick={() => handleReject(n)}
                        className="px-3 py-1 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 text-xs hover:bg-red-600/40 transition-colors"
                      >
                        ✕ Refuser
                      </button>
                    </div>
                  )}
                  {n.kind === 'group_invite' && n.payload.group_id && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAcceptInvite(n)}
                        className="px-3 py-1 rounded-lg bg-green-600/20 border border-green-500/40 text-green-400 text-xs hover:bg-green-600/40 transition-colors"
                      >
                        ✓ Accepter
                      </button>
                      <button
                        onClick={() => handleRejectInvite(n)}
                        className="px-3 py-1 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 text-xs hover:bg-red-600/40 transition-colors"
                      >
                        ✕ Refuser
                      </button>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-center gap-2 mt-1">
                  {isNew ? (
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                  ) : (
                    <span className="w-2 h-2" />
                  )}
                  <button
                    onClick={() => deleteOne(n.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-brand-text/40 hover:text-red-400 hover:bg-red-400/10 transition-colors text-base leading-none"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
