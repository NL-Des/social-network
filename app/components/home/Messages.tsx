'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export type WsStatus = 'connecting' | 'open' | 'closed' | 'error'

export interface Message {
  id: string
  from: 'me' | 'them'
  senderName: string
  text: string
  date: string
}

export interface ChatConversation {
  id: string
  name: string
  initials: string
  online?: boolean
  unread?: number
}

interface MessagesProps {
  conversation: ChatConversation
  initialMessages: Message[]
}

function useWebSocket(url: string, onMessage: (data: unknown) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<WsStatus>('connecting')

  const send = useCallback((payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  useEffect(() => {
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

const wsColors: Record<WsStatus, string> = {
  open:       'bg-green-500',
  connecting: 'bg-yellow-500 animate-pulse',
  closed:     'bg-gray-500',
  error:      'bg-red-500',
}

export default function Messages({ conversation, initialMessages }: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; data: { senderName: string; text: string } }
    if (msg.type !== 'chat_message') return
    setMessages((prev) => [
      ...prev,
      {
        id:         Date.now().toString(),
        from:       'them',
        senderName: msg.data.senderName,
        text:       msg.data.text,
        date:       new Date().toLocaleDateString('fr-FR'),
      },
    ])
  }, [])

  const { send, status } = useWebSocket('ws://localhost:5090/ws', handleWsMessage)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      {
        id:         Date.now().toString(),
        from:       'me',
        senderName: 'Moi',
        text,
        date:       new Date().toLocaleDateString('fr-FR'),
      },
    ])
    send({ type: 'chat_message', data: { to: conversation.id, text } })
    setDraft('')
  }

  return (
    <div className="h-full bg-brand-card border border-brand-border rounded-2xl flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-brand-border shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {conversation.initials}
        </div>
        <p className="flex-1 text-white font-semibold text-lg">{conversation.name}</p>
        <span className={`w-2 h-2 rounded-full ${wsColors[status]}`} title={status} />
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-0.5">
            <p className="text-brand-text text-sm">
              <span className="text-brand-border/80">{msg.date}</span>
              {' '}
              <span className="font-semibold text-brand-border">{msg.senderName} :</span>
            </p>
            <p className="text-brand-text text-base leading-relaxed pl-1">{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="px-6 py-4 border-t border-brand-border flex flex-col gap-3 shrink-0">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
          }}
          placeholder="Taper vôtre texte"
          rows={4}
          className="w-full bg-white/5 border border-brand-border/40 rounded-xl px-4 py-3 text-brand-text text-base placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border focus:shadow-[0_0_8px_rgba(73,199,255,0.25)] transition-all resize-none"
        />
        <div className="flex justify-center">
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="px-10 py-2 rounded-xl border border-brand-border text-white text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}
