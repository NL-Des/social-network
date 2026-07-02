'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useGroups } from '@/lib/useGroups'

export default function GroupsSidebar() {
  const groups = useGroups()
  const [groupsOpen, setGroupsOpen] = useState(true)

  return (
    <aside className="h-auto md:h-full overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#49C7FF] text-base">Mes Groupes</h2>
        <button
          onClick={() => setGroupsOpen((v) => !v)}
          className="w-6 h-6 flex items-center justify-center rounded-full text-white/70 hover:text-[#49C7FF] hover:bg-white/10 transition-colors text-sm font-bold"
        >
          {groupsOpen ? '▲' : '▼'}
        </button>
      </div>

      {groupsOpen && (
        <>
          {groups.length === 0 ? (
            <p className="text-brand-text/40 text-xs">Aucun groupe rejoint.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/inside-groups?id=${group.id}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2 hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-600 shrink-0 flex items-center justify-center text-white text-sm font-bold">
                    {group.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-base font-semibold">{group.name}</p>
                    <p className="text-brand-text text-sm">{group.membersCount} membres</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </aside>
  )
}