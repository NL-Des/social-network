'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HeaderGroup from '@/app/components/home/HeaderGroup'
import { fetchMe } from '@/lib/fetchMe'
import { CurrentUser } from '@/app/components/home/Header'
import LeftSidebarGroupListOfUsers, { SidebarUser } from '@/app/components/home/LeftSidebarGroupListOfUsers'
import RightSidebarGroupListOfConversations, { Conversation } from '@/app/components/home/RightSidebarGroupListOfConversations'
import PostCard, { Post, CreatePostButton } from '@/app/components/home/PostCard'
import GroupComments from '@/app/components/home/GroupComments'
import { useWebSocket } from '@/lib/useWebSocket'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiGroupPost {
  id: number
  author: { username: string; profilePicture: string }
  title: string
  content: string
  image: string
  createdAt: string
  likes: number
  dislikes: number
  userLike: string
}

interface ApiGroupMember {
  id: number
  name: string
  initials: string
  isCreator: boolean
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]?.toUpperCase() ?? '').join('').slice(0, 2) || '?'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function InsideGroupContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const groupId      = searchParams.get('id') ?? ''

  const [user, setUser]             = useState<CurrentUser | null>(null)
  const [posts, setPosts]           = useState<Post[]>([])
  const [members, setMembers]       = useState<Conversation[]>([])
  const [sidebarUsers, setSidebarUsers] = useState<SidebarUser[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeId, setActiveId]     = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<ApiGroupPost | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [wsUrl, setWsUrl]           = useState<string | null>(null)

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
    if (msg.type === 'group_post_like_update' && msg.data) {
      const { post_id, likes, dislikes } = msg.data
      setPosts((prev) => prev.map((p) =>
        p.id === String(post_id) ? { ...p, likes, dislikes } : p
      ))
    }
  }, [])

  useWebSocket(wsUrl, handleWsMessage)

  useEffect(() => {
    if (!groupId) return
    fetch(`/api/group-chat/${groupId}/members`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiGroupMember[]) => {
        const convs: Conversation[] = (data ?? []).map((m) => ({
          id: String(m.id),
          name: m.name,
          initials: m.initials,
          online: false,
        }))
        const sidebar: SidebarUser[] = (data ?? []).map((m) => ({
          id: String(m.id),
          name: m.name,
          initials: m.initials,
          online: false,
        }))
        setMembers(convs)
        setSidebarUsers(sidebar)
      })
      .catch(() => {})
  }, [groupId])

  const fetchPosts = useCallback(() => {
    if (!groupId) return
    fetch(`/api/group-posts/${groupId}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiGroupPost[]) => {
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
            groupId:  groupId,
          }))
        )
      })
      .catch(() => {})
  }, [groupId])

  useEffect(() => {
    if (!user) return
    fetchPosts()
  }, [user, fetchPosts])

  function handleSelectPost(postId: string) {
    if (!groupId) return
    fetch(`/api/group-posts/${groupId}/${postId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data: ApiGroupPost | null) => { if (data) setSelectedPost(data) })
      .catch(() => {})
  }

  async function handleDelete() {
    if (!selectedPost || !groupId) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/group-posts/${groupId}/${selectedPost.id}`, { method: 'DELETE' })
      if (!res.ok) { setDeleteError('Impossible de supprimer ce post.'); return }
      setSelectedPost(null)
      fetchPosts()
    } catch {
      setDeleteError('Erreur réseau.')
    } finally {
      setDeleting(false)
    }
  }

  const isAuthor = user && selectedPost && user.username === selectedPost.author.username

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
      <HeaderGroup user={user} groupName="Groupe" />

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] gap-4 pt-4">

          <div className="h-full">
            <LeftSidebarGroupListOfUsers users={sidebarUsers} groupName="Groupe" groupId={groupId} />
          </div>

          {/* Colonne centrale */}
          <div className="flex flex-col h-full overflow-hidden">
            {selectedPost ? (
              /* ── Détail du post + commentaires ── */
              <div className="flex flex-col gap-4 h-full overflow-hidden">
                <button
                  onClick={() => { setSelectedPost(null); setDeleteError(null) }}
                  className="text-brand-text text-sm hover:text-white transition-colors text-left shrink-0"
                >
                  ← Retour aux posts
                </button>

                {/* Post */}
                <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold shrink-0">
                        {getInitials(selectedPost.author.username)}
                      </div>
                      <div>
                        <p className="font-retro text-purple-400 text-base">{selectedPost.author.username}</p>
                        <p className="text-brand-text text-xs">
                          {new Date(selectedPost.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {isAuthor && (
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-red-400 hover:text-red-300 border border-red-400/40 hover:border-red-300 rounded-xl px-4 py-2 text-sm transition-all disabled:opacity-50"
                      >
                        {deleting ? 'Suppression…' : 'Supprimer'}
                      </button>
                    )}
                  </div>

                  {selectedPost.title && (
                    <h2 className="font-bold text-brand-text text-lg">{selectedPost.title}</h2>
                  )}

                  <p className="text-brand-text text-base leading-7 whitespace-pre-line">
                    {selectedPost.content}
                  </p>

                  {selectedPost.image && (
                    <img
                      src={selectedPost.image}
                      alt=""
                      className="max-h-60 max-w-60 object-cover rounded-xl border border-brand-border/40"
                    />
                  )}

                  {deleteError && <p className="text-red-400 text-sm">{deleteError}</p>}
                </div>

                {/* Commentaires */}
                <GroupComments
                  groupId={groupId}
                  postId={String(selectedPost.id)}
                  currentUser={{ name: user.name, username: user.username, initials: user.initials }}
                />
              </div>
            ) : (
              /* ── Liste des posts ── */
              <>
                <div className="overflow-y-auto flex flex-col gap-4 flex-1">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => handleSelectPost(post.id)}
                    />
                  ))}
                </div>
                <CreatePostButton groupId={groupId} onSuccess={fetchPosts} />
              </>
            )}
          </div>

          <div className="h-full">
            <RightSidebarGroupListOfConversations
              conversations={members}
              activeId={activeId}
              onSelect={setActiveId}
              groupId={groupId}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

export default function InsideGroupPage() {
  return <Suspense><InsideGroupContent /></Suspense>
}
