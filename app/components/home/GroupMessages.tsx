'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useWebSocket, WsStatus } from '@/lib/useWebSocket'

export interface GroupMessage {
  id: string
  senderName: string
  senderId: string
  text: string
  date: string
}

export interface GroupChat {
  id: string
  title: string
  initials: string
}

interface GroupMessagesProps {
  group: GroupChat
  currentUserId: string
  initialMessages: GroupMessage[]
  usersMap: Record<string, string>
}

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:5090/ws'

const wsColors: Record<WsStatus, string> = {
  open:       'bg-green-500',
  connecting: 'bg-yellow-500 animate-pulse',
  closed:     'bg-gray-500',
  error:      'bg-red-500',
}

export default function GroupMessages({ group, currentUserId, initialMessages, usersMap }: GroupMessagesProps) {
  const [messages, setMessages] = useState<GroupMessage[]>(initialMessages)
  const [wsUrl, setWsUrl]       = useState<string | null>(null)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const [draft, setDraft]       = useState('')

  useEffect(() => {
    fetch('/api/ws-token')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.token) setWsUrl(`${WS_BASE}?token=${data.token}`) })
  }, [])

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; data: { group_id: number; sender_id: number; body: string; sent_at: string } }
    if (msg.type !== 'group_message') return
    if (String(msg.data.group_id) !== group.id) return
    if (String(msg.data.sender_id) === currentUserId) return // écho ignoré, déjà affiché
    setMessages((prev) => [
      ...prev,
      {
        id:         Date.now().toString(),
        senderName: usersMap[String(msg.data.sender_id)] ?? String(msg.data.sender_id),
        senderId:   String(msg.data.sender_id),
        text:       msg.data.body,
        date:       new Date(msg.data.sent_at).toLocaleDateString('fr-FR'),
      },
    ])
  }, [group.id, currentUserId])

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
        senderName: 'Moi',
        senderId:   currentUserId,
        text,
        date:       new Date().toLocaleDateString('fr-FR'),
      },
    ])
    send({ type: 'group_message', data: { group_id: Number(group.id), body: text } })
    setDraft('')
  }

  return (
    <div className="h-full bg-brand-card border border-brand-border rounded-2xl flex flex-col overflow-hidden">

      <div className="flex items-center gap-4 px-6 py-4 border-b border-brand-border shrink-0">
        <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {group.initials}
        </div>
        <p className="flex-1 text-white font-semibold text-lg">{group.title}</p>
        <span className={`w-2 h-2 rounded-full ${wsColors[status]}`} title={status} />
      </div>

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
