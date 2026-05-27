'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderPost from '@/app/components/home/HeaderPost'
import { CurrentUser } from '@/app/components/home/Header'
import LeftSidebarPostListOfUsers from '@/app/components/home/LeftSidebarPostListOfUsers'
import RightSidebar, { Group } from '@/app/components/home/RightSidebar'
import Comments, { Post, Comment } from '@/app/components/home/Comments'
import { useSidebarUsers } from '@/lib/useSidebarUsers'

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
  { id: '1', author: { name: 'Nathan L',  initials: 'NL' }, text: 'Super initiative, hâte de voir la suite !',                 date: '27/03/2026' },
  { id: '2', author: { name: 'Jade C',    initials: 'JC' }, text: 'Merci pour le partage, très utile pour le sprint.',         date: '27/03/2026' },
  { id: '3', author: { name: 'Mathis P',  initials: 'MP' }, text: 'Je serai là vendredi pour la démo, pas de souci.',          date: '28/03/2026' },
  { id: '4', author: { name: 'Audrey D',  initials: 'AD' }, text: 'Parfait, on fait le point ensemble avant la présentation.',  date: '28/03/2026' },
]

export default function PostPage() {
  const router = useRouter()
  const [user, setUser]       = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const sidebarUsers          = useSidebarUsers()

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
      <HeaderPost user={user} postTitle="Titre à lier aux données à importer pour le post" />

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] grid-rows-1 gap-4 pt-4">

          <div className="h-full">
            <LeftSidebarPostListOfUsers users={sidebarUsers} />
          </div>

          <div className="h-full">
            <Comments post={mockPost} comments={mockComments} />
          </div>

          <div className="h-full">
            <RightSidebar groups={mockGroups} />
          </div>

        </div>
      </div>
    </div>
  )
}
