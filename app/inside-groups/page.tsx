'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderGroup from '@/app/components/home/HeaderGroup'
import { CurrentUser } from '@/app/components/home/Header'
import LeftSidebarGroupListOfUsers, { SidebarUser } from '@/app/components/home/LeftSidebarGroupListOfUsers'
import RightSidebarGroupListOfConversations, { Conversation, GroupEvent } from '@/app/components/home/RightSidebarGroupListOfConversations'
import PostCard, { Post, CreatePostButton } from '@/app/components/home/PostCard'

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockMembers: Conversation[] = [
  { id: '1', name: 'Audrey D',    initials: 'AD', online: true  },
  { id: '2', name: 'Jade C',      initials: 'JC', online: true  },
  { id: '3', name: 'Mathis P',    initials: 'MP', online: false },
  { id: '4', name: 'Nathan L',    initials: 'NL', online: false },
  { id: '5', name: 'Nathan P',    initials: 'NP', online: false },
  { id: '6', name: 'Valentine L', initials: 'VL', online: false },
]

const mockPosts: Post[] = [
  {
    id: '1',
    author: { name: 'Audrey D', initials: 'AD' },
    content: `Bienvenue dans le groupe Route de test 🚀\nN'hésitez pas à partager vos avancées et poser vos questions.\nOn est là pour s'entraider !`,
  },
  {
    id: '2',
    author: { name: 'Nathan L', initials: 'NL' },
    content: `Petite mise à jour sur le sprint en cours ⚙️\nLes endpoints d'authentification sont finalisés côté back.\nProchain objectif : intégration avec le front d'ici vendredi.`,
  },
  {
    id: '3',
    author: { name: 'Jade C', initials: 'JC' },
    content: `Rappel réunion demain à 10h 📅\nOn fait le point sur les tâches restantes avant la démo.\nPensez à préparer vos questions !`,
  },
]

const mockEvents: GroupEvent[] = [
  {
    id: '1', title: 'Conférence Zone01', description: 'Présentation des projets étudiants',
    date: '2026-06-10', time: '14:00', registered: true,
    attendees: [
      { id: '1', name: 'Audrey D',    initials: 'AD' },
      { id: '2', name: 'Nathan L',    initials: 'NL' },
      { id: '3', name: 'Jade C',      initials: 'JC' },
    ],
  },
  {
    id: '2', title: 'Gaming Night', description: 'Test Deadline Invaders en équipe',
    date: '2026-06-14', time: '20:00', registered: false,
    attendees: [
      { id: '1', name: 'Mathis P',    initials: 'MP' },
      { id: '2', name: 'Valentine L', initials: 'VL' },
    ],
  },
  {
    id: '3', title: 'Forum des métiers', description: 'Rencontres professionnelles au Parc expo',
    date: '2026-06-20', time: '09:00', registered: false,
    attendees: [],
  },
  {
    id: '4', title: 'Codeur en Seine', description: 'Meetup dev au Kindarena',
    date: '2026-07-03', time: '18:30', registered: true,
    attendees: [
      { id: '1', name: 'Audrey D',    initials: 'AD' },
      { id: '2', name: 'Nathan L',    initials: 'NL' },
      { id: '3', name: 'Nathan P',    initials: 'NP' },
      { id: '4', name: 'Jade C',      initials: 'JC' },
    ],
  },
]

const mockSidebarUsers: SidebarUser[] = [
  { id: '1', name: 'Audrey D',    initials: 'AD', online: true  },
  { id: '2', name: 'Jade C',      initials: 'JC', online: true  },
  { id: '3', name: 'Mathis P',    initials: 'MP', online: false },
  { id: '4', name: 'Nathan L',    initials: 'NL', online: false },
  { id: '5', name: 'Nathan P',    initials: 'NP', online: false },
  { id: '6', name: 'Valentine L', initials: 'VL', online: false },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InsideGroupPage() {
  const router = useRouter()
  const [user, setUser]       = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

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

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <HeaderGroup user={user} groupName="Route de test" />

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] gap-4 pt-4">

          {/* Colonne gauche — membres du groupe */}
          <div className="h-full">
            <LeftSidebarGroupListOfUsers users={mockSidebarUsers} groupName="Route de test" />
          </div>

          {/* Colonne centre — fil de posts du groupe */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="overflow-y-auto flex flex-col gap-4 flex-1">
              {mockPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <CreatePostButton />
          </div>

          {/* Colonne droite — conversations */}
          <div className="h-full">
            <RightSidebarGroupListOfConversations
              conversations={mockMembers}
              activeId={activeId}
              onSelect={setActiveId}
              events={mockEvents}
            />
          </div>

        </div>
      </div>
    </div>
  )
}