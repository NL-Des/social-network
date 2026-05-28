'use client'

import { useCallback, useEffect, useState } from 'react'
import { useWebSocket } from './useWebSocket'

const WS_BASE = 'ws://localhost:5090/ws'

export function useOnlineStatus() {
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [unreadFrom, setUnreadFrom] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/ws-token')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.token) setWsUrl(`${WS_BASE}?token=${data.token}`)
      })
  }, [])

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; data: Record<string, unknown> }

    if (msg.type === 'users_online') {
      const ids = (msg.data.user_ids as number[] | null) ?? []
      setOnlineUsers(new Set(ids.map(String)))
    } else if (msg.type === 'user_online') {
      const id = String(msg.data.user_id)
      setOnlineUsers((prev) => new Set([...prev, id]))
    } else if (msg.type === 'user_offline') {
      const id = String(msg.data.user_id)
      setOnlineUsers((prev) => { const n = new Set(prev); n.delete(id); return n })
    } else if (msg.type === 'private_message') {
      const senderId = String(msg.data.sender_id)
      setUnreadFrom((prev) => new Set([...prev, senderId]))
    }
  }, [])

  useWebSocket(wsUrl, handleWsMessage)

  const clearUnread = useCallback((id: string) => {
    setUnreadFrom((prev) => { const n = new Set(prev); n.delete(id); return n })
  }, [])

  return { onlineUsers, unreadFrom, clearUnread }
}
