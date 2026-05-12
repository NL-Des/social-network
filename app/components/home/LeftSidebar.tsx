'use client'

import { useState } from 'react'

export interface Conversation {
  id: string
  name: string
  initials: string
  online: boolean
  unread?: number
}

interface LeftSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
}

export default function LeftSidebar({ conversations, activeId, onSelect }: LeftSidebarProps) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="h-full flex flex-col bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 gap-4">
      <h2 className="font-retro text-brand-text text-base flex-shrink-0">Conversations</h2>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Taper vôtre recherche"
        className="flex-shrink-0 bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
      />

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
              activeId === c.id
                ? 'border border-brand-border shadow-[0_0_10px_rgba(73,199,255,0.35)]'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="relative flex-shrink-0 flex items-center">
              {c.online && (
                <span className="absolute -left-2.5 w-2 h-2 bg-green-500 rounded-full" />
              )}
              <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                {c.initials}
              </div>
            </div>

            <span className="flex-1 text-white text-base truncate">{c.name}</span>

            {c.unread ? (
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {c.unread}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </aside>
  )
}
