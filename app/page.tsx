'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header, { CurrentUser } from './components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import SearchFilter, { FilterItem } from './components/home/SearchFilter'
import PostCard, { Post, CreatePostButton } from './components/home/PostCard'
import RightSidebar, { Group } from './components/home/RightSidebar'

interface ApiPost {
  id: number
  author: { username: string; profilePicture: string }
  title: string
  content: string
  tags: string[]
  privacy: string
  createdAt: string
  updatedAt: string
}

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

function getInitials(username: string): string {
  const parts = username.split(/[._-]/)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return username.slice(0, 2).toUpperCase()
}

export default function HomePage() {
  const router = useRouter()
  const [user, setUser]       = useState<CurrentUser | null>(null)
  const [posts, setPosts]     = useState<Post[]>([])
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

  const fetchPosts = useCallback(() => {
    fetch('/api/posts')
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiPost[]) => {
        setPosts(
          (data ?? []).map((p) => ({
            id:      String(p.id),
            author:  { name: p.author.username, initials: getInitials(p.author.username) },
            title:   p.title,
            content: p.content,
          }))
        )
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user) fetchPosts()
  }, [user, fetchPosts])

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
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <CreatePostButton onSuccess={fetchPosts} />
          </div>

          <div className="h-full">
            <RightSidebar groups={mockGroups} />
          </div>

        </div>
      </div>
    </div>
  )
}
