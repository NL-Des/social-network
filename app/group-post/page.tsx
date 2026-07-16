'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HeaderGroup from '@/app/components/home/HeaderGroup'
import { CurrentUser } from '@/app/components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import { resolveImageUrl } from '@/lib/utils'

interface ApiGroupPost {
  id: number
  author: { username: string; profilePicture: string }
  title: string
  content: string
  image: string
  createdAt: string
}

function getInitials(name: string): string {
  return name.split(/[._\s-]/).map((w) => w[0]?.toUpperCase() ?? '').join('').slice(0, 2) || '?'
}

function GroupPostContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const postId       = searchParams.get('id')   ?? ''
  const groupId      = searchParams.get('groupId') ?? ''

  const [user, setUser]     = useState<CurrentUser | null>(null)
  const [post, setPost]     = useState<ApiGroupPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]   = useState<string | null>(null)

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
    if (!user || !postId || !groupId) return
    fetch(`/api/group-posts/${groupId}/${postId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data: ApiGroupPost | null) => { if (data) setPost(data) })
      .catch(() => {})
  }, [user, postId, groupId])

  async function handleDelete() {
    if (!postId || !groupId) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/group-posts/${groupId}/${postId}`, { method: 'DELETE' })
      if (!res.ok) {
        setError('Impossible de supprimer ce post.')
        return
      }
      router.push(`/inside-groups?id=${groupId}`)
    } catch {
      setError('Erreur réseau.')
    } finally {
      setDeleting(false)
    }
  }

  const isAuthor = user && post && user.username === post.author.username

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
      <HeaderGroup user={user} groupName={post?.title ?? 'Post'} />

      <div className="pt-[104px] flex-1 overflow-y-auto md:overflow-hidden px-4 pb-4 flex justify-center">
        <div className="w-full max-w-2xl pt-4 flex flex-col gap-4">

          <button
            onClick={() => router.push(`/inside-groups?id=${groupId}`)}
            className="text-brand-text text-sm hover:text-white transition-colors text-left"
          >
            ← Retour au groupe
          </button>

          {post ? (
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold shrink-0">
                    {getInitials(post.author.username)}
                  </div>
                  <div>
                    <p className="font-retro text-purple-400 text-base">{post.author.username}</p>
                    <p className="text-brand-text text-xs">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR')}
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

              {post.title && (
                <h2 className="font-bold text-brand-text text-lg">{post.title}</h2>
              )}

              <p className="text-brand-text text-base leading-7 whitespace-pre-line">
                {post.content}
              </p>

              {post.image && (
                <img
                  src={resolveImageUrl(post.image)}
                  alt=""
                  className="max-h-60 max-w-60 object-cover rounded-xl border border-brand-border/40"
                />
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <p className="text-brand-text font-retro text-sm">
                {postId ? 'Chargement du post…' : 'Post introuvable'}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function GroupPostPage() {
  return (
    <Suspense>
      <GroupPostContent />
    </Suspense>
  )
}
