'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderGroup from '@/app/components/home/HeaderGroup'
import { CurrentUser } from '@/app/components/home/Header'
import LeftSidebarGroupListOfUsers, { SidebarUser } from '@/app/components/home/LeftSidebarGroupListOfUsers'
import RightSidebarGroupListOfConversations, { Conversation } from '@/app/components/home/RightSidebarGroupListOfConversations'
import PostCard, { Post } from '@/app/components/home/PostCard'

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
            <LeftSidebarGroupListOfUsers users={mockSidebarUsers} />
          </div>

          {/* Colonne centre — fil de posts du groupe */}
          <div className="overflow-y-auto flex flex-col gap-4">
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Colonne droite — conversations */}
          <div className="h-full">
            <RightSidebarGroupListOfConversations
              conversations={mockMembers}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </div>

        </div>
      </div>
    </div>
  )
}