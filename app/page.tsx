'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header, { CurrentUser } from './components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import GroupsSidebar from './components/home/GroupsSidebar'
import PostCard, { Post, CreatePostButton } from './components/home/PostCard'
import RightSidebar from './components/home/RightSidebar'
import { useWebSocket } from '@/lib/useWebSocket'

interface ApiPost {
  id: number
  author: { username: string; profilePicture: string }
  title: string
  content: string
  image: string
  tags: string[]
  privacy: string
  createdAt: string
  updatedAt: string
  likes: number
  dislikes: number
  userLike: string
}

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
  const [wsUrl, setWsUrl]     = useState<string | null>(null)

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (!data) { router.replace('/auth/login'); return }
        setUser(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    fetch('/api/ws-token')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.token) setWsUrl(`ws://localhost:5090/ws?token=${data.token}`) })
      .catch(() => {})
  }, [])

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type?: string; data?: { post_id?: number; likes?: number; dislikes?: number } }
    if (msg.type === 'post_like_update' && msg.data) {
      const { post_id, likes, dislikes } = msg.data
      setPosts((prev) => prev.map((p) =>
        p.id === String(post_id) ? { ...p, likes, dislikes } : p
      ))
    }
  }, [])

  useWebSocket(wsUrl, handleWsMessage)

  const fetchPosts = useCallback(() => {
    fetch('/api/posts')
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiPost[]) => {
        setPosts(
          (data ?? []).map((p) => ({
            id:       String(p.id),
            author:   { name: p.author.username, initials: getInitials(p.author.username) },
            title:    p.title,
            content:  p.content,
            image:    p.image || undefined,
            likes:    p.likes,
            dislikes: p.dislikes,
            userLike: p.userLike,
          }))
        )
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    fetchPosts()
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
    <div className="bg-background min-h-screen md:h-screen flex flex-col md:overflow-hidden">
      <Header user={user} />

      <div className="pt-[104px] flex-1 overflow-y-auto md:overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[312px_1fr_264px] grid-rows-1 md:grid-rows-[1fr] gap-4 pt-4 md:h-full">

          <div className="md:h-full md:min-h-0">
            <GroupsSidebar />
          </div>

          <div className="flex flex-col md:h-full md:min-h-0 md:overflow-hidden">
            <div className="overflow-y-auto flex flex-col gap-4 flex-1">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <CreatePostButton onSuccess={fetchPosts} />
          </div>

          <div className="md:h-full md:min-h-0">
            <RightSidebar />
          </div>

        </div>
      </div>
    </div>
  )
}