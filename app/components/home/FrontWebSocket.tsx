'use client'

import { useEffect, useRef, useState } from 'react'

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
}

interface FrontWebSocketProps {
  conversation: ChatConversation
  messages: Message[]
  wsStatus: WsStatus
  onSend: (text: string) => void
}

export default function FrontWebSocket({ conversation, messages, wsStatus, onSend }: FrontWebSocketProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  const wsColors: Record<WsStatus, string> = {
    open:       'bg-green-500',
    connecting: 'bg-yellow-500 animate-pulse',
    closed:     'bg-gray-500',
    error:      'bg-red-500',
  }

  return (
    <div className="h-full bg-brand-card border border-brand-border rounded-2xl flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-brand-border flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {conversation.initials}
        </div>
        <p className="flex-1 text-white font-semibold text-lg">{conversation.name}</p>
        <span className={`w-2 h-2 rounded-full ${wsColors[wsStatus]}`} title={wsStatus} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
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
      <div className="px-6 py-4 border-t border-brand-border flex flex-col gap-3 flex-shrink-0">
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
