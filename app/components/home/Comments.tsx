'use client'

import { useState } from 'react'

export interface Post {
  id: string
  author: { name: string; initials: string }
  content: string
}

export interface Comment {
  id: string
  author: { name: string; initials: string }
  text: string
  date: string
}

interface CommentsProps {
  post: Post
  comments: Comment[]
}

export default function Comments({ post, comments }: CommentsProps) {
  const [draft, setDraft] = useState('')
  const [localComments, setLocalComments] = useState<Comment[]>(comments)

  function handleSend() {
    const text = draft.trim()
    if (!text) return
    setLocalComments((prev) => [
      ...prev,
      {
        id:     Date.now().toString(),
        author: { name: 'Moi', initials: 'ME' },
        text,
        date:   new Date().toLocaleDateString('fr-FR'),
      },
    ])
    setDraft('')
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">

      {/* Post */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shrink-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold shrink-0">
            {post.author.initials}
          </div>
          <h3 className="font-retro text-purple-400 text-base">{post.author.name}</h3>
        </div>
        <p className="text-brand-text text-lg leading-7 whitespace-pre-line">{post.content}</p>
      </div>

      {/* Commentaires + zone de saisie */}
      <div className="flex-1 overflow-hidden bg-brand-card border border-brand-border rounded-2xl flex flex-col">

        {/* Liste des commentaires */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {localComments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {c.author.initials}
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm">
                  <span className="font-semibold text-brand-border">{c.author.name}</span>
                  <span className="text-brand-text/60 ml-2">{c.date}</span>
                </p>
                <p className="text-brand-text text-base leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Zone de saisie */}
        <div className="px-6 py-4 border-t border-brand-border flex flex-col gap-3 shrink-0">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            placeholder="Écrire un commentaire..."
            rows={3}
            className="w-full bg-white/5 border border-brand-border/40 rounded-xl px-4 py-3 text-brand-text text-base placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border focus:shadow-[0_0_8px_rgba(73,199,255,0.25)] transition-all resize-none"
          />
          <div className="flex justify-center">
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              className="px-10 py-2 rounded-xl border border-brand-border text-white text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Commenter
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
