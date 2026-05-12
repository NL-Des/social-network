'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header, { CurrentUser } from '@/app/components/home/Header'
import RightSidebar, { Group, SidebarUser } from '@/app/components/home/RightSidebar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string
  name: string
  initials: string
  online: boolean
  unread?: number
}

interface Message {
  id: string
  from: 'me' | 'them'
  senderName: string
  text: string
  date: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockConversations: Conversation[] = [
  { id: '1', name: 'Audrey D',    initials: 'AD', online: true,  unread: 1 },
  { id: '2', name: 'Jade C',      initials: 'JC', online: true  },
  { id: '3', name: 'Mathis P',    initials: 'MP', online: false },
  { id: '4', name: 'Nathan L',    initials: 'NL', online: false, unread: 1 },
  { id: '5', name: 'Nathan P',    initials: 'NP', online: false },
  { id: '6', name: 'Valentine L', initials: 'VL', online: false },
]

const mockMessages: Record<string, Message[]> = {
  '4': [
    { id: '1', from: 'me',   senderName: 'Moi',      text: 'Hello, comment tu vas ?',                            date: '27/03/2026' },
    { id: '2', from: 'them', senderName: 'Nathan L',  text: 'Ça va bien, merci, et toi ?',                       date: '27/03/2026' },
    { id: '3', from: 'me',   senderName: 'Moi',      text: 'Super, quand est-ce que tu viens travailler sur le projet ?', date: '27/03/2026' },
  ],
  '1': [
    { id: '1', from: 'them', senderName: 'Audrey D', text: 'On se retrouve à 18h ?',  date: '26/03/2026' },
    { id: '2', from: 'me',   senderName: 'Moi',      text: 'Oui, bonne idée !',       date: '26/03/2026' },
  ],
  '2': [
    { id: '1', from: 'them', senderName: 'Jade C', text: 'Check ce repo !', date: '25/03/2026' },
    { id: '2', from: 'me',   senderName: 'Moi',    text: 'Top, merci !',    date: '25/03/2026' },
  ],
}

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890' },
  { id: '2', name: 'Dev Frontend',  membersCount: '3,4k' },
  { id: '3', name: 'Design & UX',   membersCount: '1,2k' },
]

const mockSidebarUsers: SidebarUser[] = [
  { id: '1', name: 'Audrey D',    initials: 'AD', online: true  },
  { id: '2', name: 'Jade C',      initials: 'JC', online: true  },
  { id: '3', name: 'Mathis P',    initials: 'MP', online: false },
  { id: '4', name: 'Nathan L',    initials: 'NL', online: false },
  { id: '5', name: 'Nathan P',    initials: 'NP', online: false },
  { id: '6', name: 'Valentine L', initials: 'VL', online: false },
]

// ─── WebSocket hook ───────────────────────────────────────────────────────────

type WsStatus = 'connecting' | 'open' | 'closed' | 'error'

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="h-full flex flex-col bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 gap-4">
      <h2 className="font-retro text-brand-text text-base flex-shrink-0">Conversations</h2>

      {/* Barre de recherche */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Taper vôtre recherche"
        className="flex-shrink-0 bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
      />

      {/* Liste */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
              activeId === c.id
                ? 'border border-brand-border shadow-[0_0_10px_rgba(73,199,255,0.35)]'
                : 'hover:bg-white/5'
            }`}
          >
            {/* Point online */}
            <div className="relative flex-shrink-0 flex items-center">
              {c.online && (
                <span className="absolute -left-2.5 w-2 h-2 bg-green-500 rounded-full" />
              )}
              <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                {c.initials}
              </div>
            </div>

            <span className="flex-1 text-white text-base truncate">{c.name}</span>

            {/* Badge notification */}
            {c.unread ? (
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {c.unread}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </aside>
  )
}

function ChatPanel({
  conversation,
  messages,
  wsStatus,
  onSend,
}: {
  conversation: Conversation
  messages: Message[]
  wsStatus: WsStatus
  onSend: (text: string) => void
}) {
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
    open: 'bg-green-500', connecting: 'bg-yellow-500 animate-pulse',
    closed: 'bg-gray-500', error: 'bg-red-500',
  }

  return (
    <div className="h-full bg-brand-card border border-brand-border rounded-2xl flex flex-col overflow-hidden">

      {/* Header du chat */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-brand-border flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {conversation.initials}
        </div>
        <p className="flex-1 text-white font-semibold text-lg">{conversation.name}</p>
        <span className={`w-2 h-2 rounded-full ${wsColors[wsStatus]}`} title={wsStatus} />
      </div>

      {/* Messages — format plat : date + expéditeur, puis texte */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser]     = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string>('4')
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages)

  useEffect(() => {
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) { router.replace('/auth/login'); return null }
        return res.json()
      })
      .then((data) => { if (data) setUser(data) })
      .finally(() => setLoading(false))
  }, [router])

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; data: { from: string; senderName: string; text: string; conversationId: string } }
    if (msg.type !== 'chat_message') return
    const { conversationId, senderName, text } = msg.data
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [
        ...(prev[conversationId] ?? []),
        {
          id:         Date.now().toString(),
          from:       'them',
          senderName,
          text,
          date:       new Date().toLocaleDateString('fr-FR'),
        },
      ],
    }))
  }, [])

  const { send, status } = useWebSocket('ws://localhost:5090/ws', handleWsMessage)

  function handleSend(text: string) {
    const newMsg: Message = {
      id:         Date.now().toString(),
      from:       'me',
      senderName: 'Moi',
      text,
      date:       new Date().toLocaleDateString('fr-FR'),
    }
    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), newMsg],
    }))
    send({ type: 'chat_message', data: { to: activeId, text } })
  }

  if (loading) {
    return (
      <div className="bg-background h-screen flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  const activeConversation = mockConversations.find((c) => c.id === activeId) ?? mockConversations[0]

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Header user={user} />

      <div className="pt-[104px] flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] gap-4 pt-4">

          {/* Colonne gauche — conversations */}
          <div className="h-full">
            <ConversationList
              conversations={mockConversations}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </div>

          {/* Colonne centre — chat */}
          <div className="h-full">
            <ChatPanel
              conversation={activeConversation}
              messages={messages[activeConversation.id] ?? []}
              wsStatus={status}
              onSend={handleSend}
            />
          </div>

          {/* Colonne droite — sidebar */}
          <div className="h-full">
            <RightSidebar groups={mockGroups} users={mockSidebarUsers} />
          </div>

        </div>
      </div>
    </div>
  )
}
