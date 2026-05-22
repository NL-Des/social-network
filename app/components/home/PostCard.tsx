'use client'

export interface Post {
  id: string
  author: {
    name: string
    initials: string
  }
  content: string
}

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function CreatePostButton() {
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
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
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4">
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
          </div>

          <button className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95">
            Créer un nouveau sujet
          </button>
        </div>
      )}
    </div>
  )
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/Post?id=${post.id}`} className="block bg-brand-card border border-brand-border rounded-2xl p-6 hover:border-brand-border/80 hover:shadow-neon transition-all cursor-pointer">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
          {post.author.initials}
        </div>
        <h3 className="font-retro text-purple-400 text-base">
          {post.author.name}
        </h3>
      </div>
      <p className="text-brand-text text-lg leading-7 whitespace-pre-line">
        {post.content}
      </p>
    </Link>
  )
}
