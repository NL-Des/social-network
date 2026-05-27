'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header, { CurrentUser } from '@/app/components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import RightSidebar, { Group } from '@/app/components/home/RightSidebar'
import LeftSidebar, { Conversation } from '@/app/components/home/LeftSidebar'
import Messages, { Message, ChatConversation } from '@/app/components/home/Messages'

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890'  },
  { id: '2', name: 'Dev Frontend',  membersCount: '3,4k' },
  { id: '3', name: 'Design & UX',   membersCount: '1,2k' },
]

interface ApiMessage {
  id: number
  sender_id: number
  receiver_id: number
  body: string
  sent_at: string
}

interface ApiConversation {
  id: number
  name: string
  initials: string
}

export default function MessagesPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser]                   = useState<CurrentUser | null>(null)
  const [loading, setLoading]             = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [allUsers, setAllUsers]           = useState<Conversation[]>([])
  const [activeId, setActiveId]           = useState<string | null>(searchParams.get('with'))
  const [messages, setMessages]           = useState<Message[]>([])

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (!data) { router.replace('/auth/login'); return }
        setUser(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  // Charge la liste de tous les utilisateurs pour afficher n'importe quelle conversation
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.ok ? res.json() : [])
      .then((data: { id: number; name: string; initials: string }[]) => {
        setAllUsers(data.map((u) => ({
          id:       String(u.id),
          name:     u.name,
          initials: u.initials,
          online:   false,
        })))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/conversations')
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiConversation[]) => {
        const convs: Conversation[] = data.map((c) => ({
          id:       String(c.id),
          name:     c.name,
          initials: c.initials,
          online:   false,
        }))
        setConversations(convs)
        // Sélectionne la première conv uniquement si aucun param ?with dans l'URL
        if (convs.length > 0 && activeId === null) {
          setActiveId(convs[0].id)
        }
      })
      .catch(() => {})
  }, [])

  // Sync l'activeId avec le param URL quand il change (navigation depuis la sidebar)
  useEffect(() => {
    const withParam = searchParams.get('with')
    if (withParam) setActiveId(withParam)
  }, [searchParams])

  const fetchMessages = useCallback((partnerId: string) => {
    const partner = conversations.find((c) => c.id === partnerId)
               ?? allUsers.find((u) => u.id === partnerId)
    fetch(`/api/messages?with=${partnerId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiMessage[]) => {
        const msgs: Message[] = data.map((m) => ({
          id:         String(m.id),
          from:       String(m.sender_id) === partnerId ? 'them' : 'me',
          senderName: String(m.sender_id) === partnerId ? (partner?.name ?? '') : 'Moi',
          text:       m.body,
          date:       new Date(m.sent_at).toLocaleDateString('fr-FR'),
        }))
        setMessages(msgs)
      })
      .catch(() => {})
  }, [conversations, allUsers])

  useEffect(() => {
    if (activeId) fetchMessages(activeId)
  }, [activeId, fetchMessages])

  if (loading) {
    return (
      <div className="bg-background h-screen flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  // Cherche d'abord dans les conversations existantes, sinon dans tous les users
  const activeConversation: ChatConversation | null = activeId
    ? (conversations.find((c) => c.id === activeId) ?? allUsers.find((u) => u.id === activeId) ?? null)
    : null

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Header user={user} />

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] grid-rows-1 gap-4 pt-4">

          <div className="h-full">
            <LeftSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </div>

          <div className="h-full">
            {activeConversation ? (
              <Messages
                key={activeConversation.id}
                conversation={activeConversation}
                initialMessages={messages}
              />
            ) : (
              <div className="h-full bg-brand-card border border-brand-border rounded-2xl flex items-center justify-center">
                <p className="text-brand-text/50 text-sm">Sélectionnez une conversation</p>
              </div>
            )}
          </div>

          <div className="h-full">
            <RightSidebar groups={mockGroups} />
          </div>

        </div>
      </div>
    </div>
  )
}
