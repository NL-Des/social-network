'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useWebSocket, WsStatus } from '@/lib/useWebSocket'

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

interface GroupOption {
  id: string
  title: string
  initials: string
}

interface MessagesProps {
  conversation: ChatConversation
  initialMessages: Message[]
  groups?: GroupOption[]
  isOnline?: boolean
}

const WS_BASE = 'ws://localhost:5090/ws'

const wsColors: Record<WsStatus, string> = {
  open:       'bg-green-500',
  connecting: 'bg-yellow-500 animate-pulse',
  closed:     'bg-gray-500',
  error:      'bg-red-500',
}

export default function Messages({ conversation, initialMessages, groups = [], isOnline = false }: MessagesProps) {
  const [messages, setMessages]   = useState<Message[]>(initialMessages)
  const [wsUrl, setWsUrl]         = useState<string | null>(null)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const [draft, setDraft]         = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviting, setInviting]   = useState(false)

  async function handleInvite(groupId: string) {
    setInviting(true)
    try {
      await fetch(`/api/chat-groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: Number(conversation.id) }),
      })
    } finally {
      setInviting(false)
      setShowInvite(false)
    }
  }

  useEffect(() => {
    fetch('/api/ws-token')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.token) setWsUrl(`${WS_BASE}?token=${data.token}`) })
  }, [])

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; data: { sender_id: number; body: string; sent_at: string } }
    if (msg.type === 'private_message' && String(msg.data.sender_id) === conversation.id) {
      setMessages((prev) => [
        ...prev,
        {
          id:         Date.now().toString(),
          from:       'them',
          senderName: conversation.name,
          text:       msg.data.body,
          date:       new Date(msg.data.sent_at).toLocaleDateString('fr-FR'),
        },
      ])
    }
  }, [conversation.id, conversation.name])

  const { send, status } = useWebSocket(wsUrl, handleWsMessage)

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
    send({ type: 'private_message', data: { receiver_id: Number(conversation.id), body: text } })
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

        {groups.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowInvite((v) => !v)}
              title="Inviter dans un groupe"
              className="w-7 h-7 rounded-full border border-brand-border text-[#49C7FF] text-base flex items-center justify-center hover:bg-white/10 transition-colors font-bold"
            >
              +
            </button>
            {showInvite && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-brand-card border border-brand-border rounded-xl shadow-neon p-2 flex flex-col gap-1 z-20">
                <p className="text-brand-text/50 text-xs px-2 pb-1">Inviter dans...</p>
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleInvite(g.id)}
                    disabled={inviting}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-left disabled:opacity-40"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {g.initials}
                    </div>
                    <span className="text-white text-sm truncate">{g.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} title={isOnline ? 'En ligne' : 'Hors ligne'} />
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
