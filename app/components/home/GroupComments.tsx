'use client'

import { useEffect, useState } from 'react'
import ImagePicker from './ImagePicker'

interface GroupComment {
  id: number
  author: { username: string; profilePicture: string }
  content: string
  image: string
  createdAt: string
}

interface LocalComment {
  id: string
  author: { name: string; initials: string }
  text: string
  date: string
  image?: string
}

interface GroupCommentsProps {
  groupId: string
  postId: string
  currentUser: { name: string; username: string; initials: string }
}

function getInitials(name: string): string {
  return name.split(/[._\s-]/).map((w) => w[0]?.toUpperCase() ?? '').join('').slice(0, 2) || '?'
}

export default function GroupComments({ groupId, postId, currentUser }: GroupCommentsProps) {
  const [comments, setComments]     = useState<LocalComment[]>([])
  const [draft, setDraft]           = useState('')
  const [image, setImage]           = useState<File | null>(null)
  const [sending, setSending]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/group-posts/${groupId}/${postId}/comments`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: GroupComment[]) => {
        setComments(
          (data ?? []).map((c) => ({
            id:     String(c.id),
            author: { name: c.author.username, initials: getInitials(c.author.username) },
            text:   c.content,
            date:   new Date(c.createdAt).toLocaleDateString('fr-FR'),
            image:  c.image || undefined,
          }))
        )
      })
      .catch(() => {})
  }, [groupId, postId])

  async function handleSend() {
    const text = draft.trim()
    if (!text || sending) return

    const optimistic: LocalComment = {
      id:     `tmp-${Date.now()}`,
      author: { name: currentUser.username, initials: currentUser.initials },
      text,
      date:   new Date().toLocaleDateString('fr-FR'),
      image:  image ? URL.createObjectURL(image) : undefined,
    }

    setComments((prev) => [...prev, optimistic])
    setDraft('')
    const sentImage = image
    setImage(null)
    setSending(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set('content', text)
      if (sentImage) formData.set('image', sentImage)
      const res = await fetch(`/api/group-posts/${groupId}/${postId}/comments`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
        setError('Erreur lors de l\'envoi.')
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      setError('Erreur réseau.')
    } finally {
      setSending(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    setDeletingId(commentId)
    try {
      const res = await fetch(
        `/api/group-posts/${groupId}/${postId}/comments/${commentId}`,
        { method: 'DELETE' }
      )
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex-1 overflow-hidden bg-brand-card border border-brand-border rounded-2xl flex flex-col">

      {/* Liste des commentaires */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-3">
        {comments.length === 0 && (
          <p className="text-brand-text/50 text-sm text-center py-4">Aucune réponse pour l'instant.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="bg-white/5 border border-brand-border/60 rounded-xl px-4 py-3 flex gap-3 shadow-[0_0_8px_rgba(73,199,255,0.08)]">
            <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {c.author.initials}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm">
                  <span className="font-bold text-white">{c.author.name}</span>
                  <span className="text-brand-text/50 ml-2 font-normal">{c.date}</span>
                </p>
                {c.author.name === currentUser.username && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    disabled={deletingId === c.id}
                    className="text-red-400 hover:text-red-300 border border-red-400/40 hover:border-red-300 rounded-xl px-4 py-2 text-sm transition-all disabled:opacity-50 shrink-0"
                  >
                    {deletingId === c.id ? '…' : 'Supprimer'}
                  </button>
                )}
              </div>
              <p className="text-brand-text text-base leading-relaxed">{c.text}</p>
              {c.image && (
                <img
                  src={c.image}
                  alt=""
                  className="mt-1 max-h-60 w-full object-cover rounded-lg border border-brand-border/40"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Zone de saisie */}
      <div className="px-6 py-4 border-t border-brand-border flex flex-col gap-3 shrink-0">
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <ImagePicker onChange={setImage} />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
          }}
          placeholder="Écrire une réponse..."
          rows={3}
          className="w-full bg-white/5 border border-brand-border/40 rounded-xl px-4 py-3 text-brand-text text-base placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border focus:shadow-[0_0_8px_rgba(73,199,255,0.25)] transition-all resize-none"
        />
        <div className="flex justify-center">
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="px-10 py-2 rounded-xl border border-brand-border text-white text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {sending ? 'Envoi…' : 'Répondre'}
          </button>
        </div>
      </div>

    </div>
  )
}
