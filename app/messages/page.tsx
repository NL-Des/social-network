'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header, { CurrentUser } from '@/app/components/home/Header'
import RightSidebar, { Group, SidebarUser } from '@/app/components/home/RightSidebar'
import LeftSidebar, { Conversation } from '@/app/components/home/LeftSidebar'
import Messages, { Message } from '@/app/components/home/Messages'

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockConversations: Conversation[] = [
  { id: '1', name: 'Audrey D',    initials: 'AD', online: true,  unread: 1 },
  { id: '2', name: 'Jade C',      initials: 'JC', online: true             },
  { id: '3', name: 'Mathis P',    initials: 'MP', online: false            },
  { id: '4', name: 'Nathan L',    initials: 'NL', online: false, unread: 1 },
  { id: '5', name: 'Nathan P',    initials: 'NP', online: false            },
  { id: '6', name: 'Valentine L', initials: 'VL', online: false            },
]

const mockMessages: Record<string, Message[]> = {
  '4': [
    { id: '1', from: 'me',   senderName: 'Moi',      text: 'Hello, comment tu vas ?',                                     date: '27/03/2026' },
    { id: '2', from: 'them', senderName: 'Nathan L',  text: 'Ça va bien, merci, et toi ?',                                date: '27/03/2026' },
    { id: '3', from: 'me',   senderName: 'Moi',      text: 'Super, quand est-ce que tu viens travailler sur le projet ?', date: '27/03/2026' },
  ],
  '1': [
    { id: '1', from: 'them', senderName: 'Audrey D', text: 'On se retrouve à 18h ?', date: '26/03/2026' },
    { id: '2', from: 'me',   senderName: 'Moi',      text: 'Oui, bonne idée !',      date: '26/03/2026' },
  ],
  '2': [
    { id: '1', from: 'them', senderName: 'Jade C', text: 'Check ce repo !', date: '25/03/2026' },
    { id: '2', from: 'me',   senderName: 'Moi',    text: 'Top, merci !',    date: '25/03/2026' },
  ],
}

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890'  },
  { id: '2', name: 'Dev Frontend',  membersCount: '3,4k' },
  { id: '3', name: 'Design & UX',   membersCount: '1,2k' },
]

const mockSidebarUsers: SidebarUser[] = [
  { id: '1', name: 'Audrey D',    initials: 'AD', online: true,  following: true  },
  { id: '2', name: 'Jade C',      initials: 'JC', online: true,  following: true  },
  { id: '3', name: 'Mathis P',    initials: 'MP', online: false, following: false },
  { id: '4', name: 'Nathan L',    initials: 'NL', online: false, following: true  },
  { id: '5', name: 'Nathan P',    initials: 'NP', online: false, following: false },
  { id: '6', name: 'Valentine L', initials: 'VL', online: false, following: false },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser]       = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string>('4')

  useEffect(() => {
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) { router.replace('/auth/login'); return null }
        return res.json()
      })
      .then((data) => { if (data) setUser(data) })
      .finally(() => setLoading(false))
  }, [router])

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

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] grid-rows-1 gap-4 pt-4">

          {/* Colonne gauche — conversations */}
          <div className="h-full">
            <LeftSidebar
              conversations={mockConversations}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </div>

          {/* Colonne centre — messages */}
          <div className="h-full">
            <Messages
              key={activeConversation.id}
              conversation={activeConversation}
              initialMessages={mockMessages[activeConversation.id] ?? []}
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
