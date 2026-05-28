'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HeaderPost from '@/app/components/home/HeaderPost'
import { CurrentUser } from '@/app/components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import LeftSidebarPostListOfUsers from '@/app/components/home/LeftSidebarPostListOfUsers'
import RightSidebar, { Group } from '@/app/components/home/RightSidebar'
import Comments, { Post, Comment } from '@/app/components/home/Comments'
import { useSidebarUsers } from '@/lib/useSidebarUsers'

interface ApiComment {
  id: number
  content: string
  author: { username: string; profilePicture: string }
  createdAt: string
}

interface ApiPost {
  id: number
  author: { username: string; profilePicture: string }
  title: string
  content: string
  createdAt: string
  comments: ApiComment[] | null
}

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890'  },
  { id: '2', name: 'Dev Frontend',  membersCount: '3,4k' },
  { id: '3', name: 'Design & UX',   membersCount: '1,2k' },
]

function getInitials(username: string): string {
  const parts = username.split(/[._-]/)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return username.slice(0, 2).toUpperCase()
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR')
  } catch {
    return iso
  }
}

export default function PostPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const postId       = searchParams.get('id')

  const [user, setUser]         = useState<CurrentUser | null>(null)
  const [post, setPost]         = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [postTitle, setPostTitle] = useState('')
  const [loading, setLoading]   = useState(true)
  const sidebarUsers            = useSidebarUsers()

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
    if (!user || !postId) return

    fetch(`/api/posts?id=${postId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data: ApiPost | null) => {
        if (!data) return
        setPostTitle(data.title)
        setPost({
          id:      String(data.id),
          author:  { name: data.author.username, initials: getInitials(data.author.username) },
          content: data.content,
        })
        setComments(
          (data.comments ?? []).map((c) => ({
            id:     String(c.id),
            author: { name: c.author.username, initials: getInitials(c.author.username) },
            text:   c.content,
            date:   formatDate(c.createdAt),
          }))
        )
      })
      .catch(() => {})
  }, [user, postId])

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
      <HeaderPost user={user} postTitle={postTitle} />

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] grid-rows-1 gap-4 pt-4">

          <div className="h-full">
            <LeftSidebarPostListOfUsers users={sidebarUsers} />
          </div>

          <div className="h-full">
            {post ? (
              <Comments
                post={post}
                comments={comments}
                currentUser={{ name: user.name, initials: user.initials }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-brand-text font-retro text-sm">
                  {postId ? 'Chargement du post...' : 'Post introuvable'}
                </p>
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
