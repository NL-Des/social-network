'use client'

import { useState } from 'react'

export interface GroupItem {
  id: string
  name: string
  initials: string
  membersCount: string
  description: string
}

interface LeftSidebarGroupsProps {
  groups: GroupItem[]
  activeId: string | null
  onSelect: (id: string) => void
}

export default function LeftSidebarGroups({ groups, activeId, onSelect }: LeftSidebarGroupsProps) {
  const [search, setSearch] = useState('')

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="h-full flex flex-col bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 gap-4">
      <h2 className="font-bold text-[#49C7FF] text-base shrink-0">Groupes</h2>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Taper vôtre recherche"
        className="shrink-0 bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
      />

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {filtered.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
              activeId === g.id
                ? 'border border-brand-border shadow-[0_0_10px_rgba(73,199,255,0.35)]'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {g.initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white text-base truncate">{g.name}</p>
              <p className="text-brand-text text-xs">{g.membersCount} membres</p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}
