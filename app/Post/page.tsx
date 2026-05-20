'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderPost from '@/app/components/home/HeaderPost'
import { CurrentUser } from '@/app/components/home/Header'
import LeftSidebarPostListOfUsers, { SidebarUser } from '@/app/components/home/LeftSidebarPostListOfUsers'
import RightSidebar, { Group } from '@/app/components/home/RightSidebar'
import Comments, { Post, Comment } from '@/app/components/home/Comments'

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890'  },
  { id: '2', name: 'Dev Frontend',  membersCount: '3,4k' },
  { id: '3', name: 'Design & UX',   membersCount: '1,2k' },
]

const mockPost: Post = {
  id: '1',
  author: { name: 'Audrey D', initials: 'AD' },
  content: `Bienvenue dans le groupe Route de test 🚀\nN'hésitez pas à partager vos avancées et poser vos questions.\nOn est là pour s'entraider !`,
}

const mockComments: Comment[] = [
  { id: '1', author: { name: 'Nathan L',  initials: 'NL' }, text: 'Super initiative, hâte de voir la suite !',               date: '27/03/2026' },
  { id: '2', author: { name: 'Jade C',    initials: 'JC' }, text: 'Merci pour le partage, très utile pour le sprint.',       date: '27/03/2026' },
  { id: '3', author: { name: 'Mathis P',  initials: 'MP' }, text: 'Je serai là vendredi pour la démo, pas de souci.',        date: '28/03/2026' },
  { id: '4', author: { name: 'Audrey D',  initials: 'AD' }, text: 'Parfait, on fait le point ensemble avant la présentation.', date: '28/03/2026' },
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

export default function PostPage() {
  const router = useRouter()
  const [user, setUser]       = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

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
      <HeaderPost user={user} postTitle="Route de test" />

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] gap-4 pt-4">

          {/* Colonne gauche — membres du groupe */}
          <div className="h-full">
            <LeftSidebarPostListOfUsers users={mockSidebarUsers} />
          </div>

          {/* Colonne centre — post & commentaires */}
          <div className="h-full">
            <Comments post={mockPost} comments={mockComments} />
          </div>

          {/* Colonne droite — groupes & utilisateurs */}
          <div className="h-full">
            <RightSidebar groups={mockGroups} users={mockSidebarUsers} />
          </div>

        </div>
      </div>
    </div>
  )
}
