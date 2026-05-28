'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header, { CurrentUser } from './components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import SearchFilter, { FilterItem } from './components/home/SearchFilter'
import PostCard, { Post, CreatePostButton } from './components/home/PostCard'
import RightSidebar, { Group } from './components/home/RightSidebar'

const mockPosts: Post[] = [
  {
    id: '1',
    author: { name: 'John Doe', initials: 'JD' },
    content: `Le design front, c'est l'art de rendre le web vivant 🍪\nChaque pixel raconte une intention, chaque interaction crée une émotion\nMinimalisme ou audace, l'important reste l'expérience utilisateur\nCréer, tester, ajuster... et recommencer jusqu'à l'équilibre parfait`,
  },
  {
    id: '2',
    author: { name: 'Bernard Doe', initials: 'BD' },
    content: `Le back-end, c'est le moteur invisible du web ⚙️\nLà où les données circulent, se transforment et prennent vie\nSécurité, performance et logique guident chaque ligne de code\nSans lui, aucune expérience front ne pourrait vraiment exister`,
  },
  {
    id: '3',
    author: { name: 'Bulle Doe', initials: 'BD' },
    content: `Les WebSockets, c'est le temps réel au cœur du web ⚡\nUne connexion continue pour des échanges instantanés\nChats, notifications, jeux... tout devient fluide et vivant\nMoins d'attente, plus d'interaction : le web respire en direct`,
  },
  {
    id: '4',
    author: { name: 'Bulle Doe', initials: 'BD' },
    content: `Les WebSockets, c'est le temps réel au cœur du web ⚡\nUne connexion continue pour des échanges instantanés\nChats, notifications, jeux... tout devient fluide et vivant\nMoins d'attente, plus d'interaction : le web respire en direct`,
  },
]

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890' },
  { id: '2', name: 'Dev Frontend', membersCount: '3,4k' },
  { id: '3', name: 'Design & UX', membersCount: '1,2k' },
]

const mockFilters: FilterItem[] = [
  { label: 'Groupe', count: 3 },
  { label: 'Notifications', count: 5 },
  { label: 'Tag', count: 12 },
]

export default function HomePage() {
  const router = useRouter()
  const [user, setUser]       = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (!data) { router.replace('/auth/login'); return }
        setUser(data)
      })
      .catch(() => {})
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
      <Header user={user} />

      <div className="pt-[104px] flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[312px_1fr_264px] gap-4 pt-4">

          <div className="h-full">
            <SearchFilter filters={mockFilters} />
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="overflow-y-auto flex flex-col gap-4 flex-1">
              {mockPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <CreatePostButton />
          </div>

          <div className="h-full">
            <RightSidebar groups={mockGroups} />
          </div>

        </div>
      </div>
    </div>
  )
}
