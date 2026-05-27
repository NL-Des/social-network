'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWebSocket } from './useWebSocket'

export type GroupStatus = 'online' | 'offline' | 'unread'

export interface GroupWithMembers {
  id: string
  memberIds: string[]
}

const WS_BASE = 'ws://localhost:5090/ws'

/**
 * Calcule le statut de chaque groupe à partir de :
 *  - onlineUsers  : vient de useOnlineStatus (déjà fonctionnel)
 *  - unreadIds    : messages de groupe reçus pendant que la conv n'est pas active
 *
 * Priorité : unread > online > offline
 */
export function useGroupStatuses(
  groups: GroupWithMembers[],
  activeGroupId: string | null,
  onlineUsers: Set<string>,
): Record<string, GroupStatus> {
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set())
  const [wsUrl, setWsUrl]         = useState<string | null>(null)

  const activeGroupIdRef = useRef(activeGroupId)
  useEffect(() => {
    activeGroupIdRef.current = activeGroupId
    if (activeGroupId) {
      setUnreadIds((prev) => { const n = new Set(prev); n.delete(activeGroupId); return n })
    }
  }, [activeGroupId])

  useEffect(() => {
    fetch('/api/ws-token')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.token) setWsUrl(`${WS_BASE}?token=${data.token}`) })
  }, [])

  // Callback stable — ne se reconnecte pas à chaque changement d'activeGroupId
  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; data: Record<string, unknown> }
    if (msg.type !== 'group_message') return
    const groupId = String(msg.data.group_id)
    if (groupId !== activeGroupIdRef.current) {
      setUnreadIds((prev) => new Set([...prev, groupId]))
    }
  }, [])

  useWebSocket(wsUrl, handleWsMessage)

  const statuses: Record<string, GroupStatus> = {}
  for (const g of groups) {
    if (unreadIds.has(g.id)) {
      statuses[g.id] = 'unread'
    } else if (g.memberIds.some((id) => onlineUsers.has(id))) {
      statuses[g.id] = 'online'
    } else {
      statuses[g.id] = 'offline'
    }
  }
  return statuses
}
