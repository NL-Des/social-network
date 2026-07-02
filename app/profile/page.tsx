'use client'

import { useState, useEffect } from 'react'
import Header, { CurrentUser } from '@/app/components/home/Header'
import RightSidebar from '@/app/components/home/RightSidebar'
import PersonnalInformations from '@/app/components/home/PersonnalInformations'
import VisibilityAccount from '@/app/components/home/VisibilityAccount'
import Followers from '@/app/components/home/Followers'
import Subscribers from '@/app/components/home/Subscribers'
import PostCard, { Post } from '@/app/components/home/PostCard'
import profileAction from './actions'
import type { ProfilePageProps } from './actions'

function ProfileContent({ data, headerUser }: { data: ProfilePageProps; headerUser: CurrentUser }) {
  const [visibility, setVisibility] = useState<'private' | 'public'>(data.visibility ?? 'public')
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    if (!data.user.id) return
    fetch(`/api/profile/${data.user.id}/posts`)
      .then((r) => r.ok ? r.json() : [])
      .then((raw: Array<{ id: number; title: string; content: string; image: string }>) => {
        setPosts(
          raw.map((p) => ({
            id: String(p.id),
            author: {
              name: data.user.username,
              initials: data.user.initials,
            },
            title: p.title,
            content: p.content,
            image: p.image || undefined,
          }))
        )
      })
      .catch(() => {})
  }, [data.user.id, data.user.username, data.user.initials])

  async function handleVisibilityChange(value: 'private' | 'public') {
    setVisibility(value)
    try {
      const response = await fetch('/api/profile/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrivate: value === 'private' }),
      })
      if (!response.ok) setVisibility(visibility)
    } catch {
      setVisibility(visibility)
    }
  }

  return (
    <div className="bg-background min-h-screen md:h-screen flex flex-col md:overflow-hidden">
      <Header user={headerUser} />

      <div className="pt-[104px] flex-1 overflow-y-auto md:overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_264px] gap-5 md:h-full pt-4">

          <div className="flex flex-col gap-5 md:h-full md:overflow-hidden">
            <div className="shrink-0 grid grid-cols-1 sm:grid-cols-[auto_1fr] md:grid-cols-[auto_2fr_1fr] gap-5 items-stretch">
              <div className="flex items-center justify-center px-2">
                <div className="w-44 h-44 rounded-full bg-gray-600 flex items-center justify-center shadow-neon ring-4 ring-brand-border/30 overflow-hidden">
                  {data.user.avatar
                    ? <img src={data.user.avatar} alt={data.user.initials} className="w-full h-full object-cover" />
                    : <span className="text-5xl font-extrabold text-white tracking-tight">{data.user.initials}</span>
                  }
                </div>
              </div>

              <PersonnalInformations user={data.user} />
              <VisibilityAccount visibility={visibility} onChange={handleVisibilityChange} />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 md:min-h-0">
              <Followers following={data.following} />
              <Subscribers followers={data.followers} />
              <div className="bg-brand-card border border-brand-border rounded-2xl p-5 overflow-hidden flex flex-col">
                <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center shrink-0">
                  Posts
                </h2>
                <div className="overflow-y-auto flex flex-col gap-4 flex-1">
                  {posts.length === 0 ? (
                    <p className="text-brand-text/40 text-sm text-center mt-4">Aucun post</p>
                  ) : (
                    posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:h-full">
            <RightSidebar />
          </div>

        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [data, setData] = useState<ProfilePageProps | null>(null)

  useEffect(() => {
    profileAction()
      .then((result) => setData(result))
      .catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm animate-pulse">
          Chargement...
        </p>
      </div>
    )
  }

  const headerUser: CurrentUser = {
    id: String(data.user.id ?? ''),
    name: `${data.user.firstName} ${data.user.lastName?.[0] ?? ''}.`,
    username: data.user.username,
    followers: data.user.followersCount,
    initials: data.user.initials,
    avatar: data.user.avatar || undefined,
  }

  return <ProfileContent data={data} headerUser={headerUser} />
}
