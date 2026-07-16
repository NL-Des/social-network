'use client'

import { resolveImageUrl } from '@/lib/utils'

export interface Post {
  id: string
  author: {
    name: string
    initials: string
  }
  title?: string
  content: string
  image?: string
  likes?: number
  dislikes?: number
  userLike?: string
  groupId?: string
}

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPost } from '@/app/Post/actions'
import ImagePicker from './ImagePicker'
import EmojiPicker from './EmojiPicker'

interface CreatePostButtonProps {
  onSuccess?: () => void
  groupId?: string
}

interface FollowerOption {
  id: number
  username: string
}

export function CreatePostButton({ onSuccess, groupId }: CreatePostButtonProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'almost-private'>('public')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [followers, setFollowers] = useState<FollowerOption[]>([])
  const [selectedViewers, setSelectedViewers] = useState<number[]>([])
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormOpen(false)
      }
    }
    if (formOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [formOpen])

  useEffect(() => {
    if (privacy !== 'private') return
    fetch('/api/me/profile')
      .then((res) => res.ok ? res.json() : null)
      .then((data: { followers?: FollowerOption[] } | null) => setFollowers(data?.followers ?? []))
      .catch(() => {})
  }, [privacy])

  function toggleViewer(id: number) {
    setSelectedViewers((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id])
  }

  async function handleSubmit() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      let result: { error?: string }
      if (groupId) {
        const formData = new FormData()
        formData.set('title', title.trim())
        formData.set('content', text.trim())
        if (image) formData.set('image', image)
        const res = await fetch(`/api/group-posts/${groupId}`, {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          result = { error: data.error ?? `Erreur ${res.status}` }
        } else {
          result = {}
        }
      } else {
        result = await createPost({ title, content: text, privacy, image: image ?? undefined, allowedViewerIds: selectedViewers })
      }
      if (result.error) {
        setError(result.error)
        return
      }
      setTitle('')
      setText('')
      setPrivacy('public')
      setSelectedViewers([])
      setImage(null)
      setFormOpen(false)
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={formRef} className="relative pt-3 shrink-0">
      <button
        onClick={() => setFormOpen((o) => !o)}
        className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
          formOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
        }`}
      >
        Créer un nouveau Post
      </button>

      {formOpen && (
        <div className="absolute z-30 bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="font-bold text-[#49C7FF] text-base text-center">
            Créer un nouveau Post
          </h3>

          <div className="flex flex-col gap-1">
            <label className="text-brand-border text-sm">Titre :</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-brand-border text-sm">Corps de Texte :</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all resize-none"
            />
            <EmojiPicker onSelect={(emoji) => setText((prev) => prev + emoji)} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-brand-border text-sm">Visibilité :</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as typeof privacy)}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-border transition-all"
            >
              <option value="public">Public</option>
              <option value="almost-private">Amis</option>
              <option value="private">Privé</option>
            </select>
          </div>

          {privacy === 'private' && (
            <div className="flex flex-col gap-1">
              <label className="text-brand-border text-sm">Visible par :</label>
              {followers.length === 0 ? (
                <p className="text-brand-text/40 text-xs">Aucun follower à sélectionner.</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                  {followers.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 text-brand-text text-sm">
                      <input
                        type="checkbox"
                        checked={selectedViewers.includes(f.id)}
                        onChange={() => toggleViewer(f.id)}
                      />
                      {f.username}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <ImagePicker onChange={setImage} />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Création...' : 'Créer un nouveau sujet'}
          </button>
        </div>
      )}
    </div>
  )
}

function LikeButtons({ postId, initialLikes, initialDislikes, initialUserLike, apiBase }: {
  postId: string
  initialLikes: number
  initialDislikes: number
  initialUserLike: string
  apiBase: string
}) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [userLike, setUserLike] = useState(initialUserLike)
  const [pending, setPending] = useState(false)

  // Sync les compteurs depuis le parent (mise à jour WS) — userLike exclu (géré localement)
  useEffect(() => {
    setLikes(initialLikes)
    setDislikes(initialDislikes)
  }, [initialLikes, initialDislikes])

  async function handleVote(type: 'like' | 'dislike') {
    if (pending) return
    setPending(true)

    const prevLikes = likes
    const prevDislikes = dislikes
    const prevUserLike = userLike

    if (userLike === type) {
      // toggle off
      setUserLike('')
      setLikes(type === 'like' ? likes - 1 : likes)
      setDislikes(type === 'dislike' ? dislikes - 1 : dislikes)
      try {
        await fetch(`${apiBase}/${postId}/like`, { method: 'DELETE' })
      } catch {
        setLikes(prevLikes)
        setDislikes(prevDislikes)
        setUserLike(prevUserLike)
      }
    } else {
      // switch or new vote
      const wasOther = userLike !== ''
      setUserLike(type)
      setLikes(type === 'like' ? likes + 1 : (wasOther && prevUserLike === 'like' ? likes - 1 : likes))
      setDislikes(type === 'dislike' ? dislikes + 1 : (wasOther && prevUserLike === 'dislike' ? dislikes - 1 : dislikes))
      try {
        await fetch(`${apiBase}/${postId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        })
      } catch {
        setLikes(prevLikes)
        setDislikes(prevDislikes)
        setUserLike(prevUserLike)
      }
    }

    setPending(false)
  }

  return (
    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-brand-border/20">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('like') }}
        disabled={pending}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm transition-all ${
          userLike === 'like'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
            : 'text-brand-text/60 hover:text-brand-text border border-transparent hover:border-brand-border/40'
        } disabled:opacity-50`}
      >
        <span>👍</span>
        <span>{likes}</span>
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('dislike') }}
        disabled={pending}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm transition-all ${
          userLike === 'dislike'
            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
            : 'text-brand-text/60 hover:text-brand-text border border-transparent hover:border-brand-border/40'
        } disabled:opacity-50`}
      >
        <span>👎</span>
        <span>{dislikes}</span>
      </button>
    </div>
  )
}

const postCardBody = (post: Post) => (
  <>
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
        {post.author.initials}
      </div>
      <h3 className="font-retro text-purple-400 text-base">{post.author.name}</h3>
    </div>
    {post.title && (
      <p className="font-bold text-brand-text text-base mb-2">{post.title}</p>
    )}
    <p className="text-brand-text text-lg leading-7 whitespace-pre-line">{post.content}</p>
    {post.image && (
      <img
        src={resolveImageUrl(post.image)}
        alt=""
        className="mt-3 max-h-60 max-w-60 object-cover rounded-xl border border-brand-border/40"
      />
    )}
    {post.likes !== undefined && (
      <LikeButtons
        postId={post.id}
        initialLikes={post.likes ?? 0}
        initialDislikes={post.dislikes ?? 0}
        initialUserLike={post.userLike ?? ''}
        apiBase={post.groupId ? `/api/group-posts/${post.groupId}` : '/api/posts'}
      />
    )}
  </>
)

const cardClass = 'block bg-brand-card border border-brand-border rounded-2xl p-6 hover:border-brand-border/80 hover:shadow-neon transition-all cursor-pointer'

export default function PostCard({ post, href, onClick }: { post: Post; href?: string; onClick?: () => void }) {
  if (onClick) {
    return (
      <div className={cardClass} onClick={onClick}>
        {postCardBody(post)}
      </div>
    )
  }
  return (
    <Link href={href ?? `/Post?id=${post.id}`} className={cardClass}>
      {postCardBody(post)}
    </Link>
  )
}
