'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type WsStatus = 'connecting' | 'open' | 'closed' | 'error'

export function useWebSocket(url: string | null, onMessage: (data: unknown) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<WsStatus>('connecting')

  const send = useCallback((payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  useEffect(() => {
    if (!url) return

    const ws = new WebSocket(url)
    wsRef.current = ws
    setStatus('connecting')

    ws.onopen    = () => setStatus('open')
    ws.onerror   = () => setStatus('error')
    ws.onclose   = () => setStatus('closed')
    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)) } catch { /* ignore malformed */ }
    }

    return () => ws.close()
  }, [url, onMessage])

  return { send, status }
}
