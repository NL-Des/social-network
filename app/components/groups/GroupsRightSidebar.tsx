'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSidebarUsers } from '@/lib/useSidebarUsers'
import { useOnlineStatus } from '@/lib/useOnlineStatus'
import { useGroups } from '@/lib/useGroups'
import type { ApiGroupWithStatus } from './GroupsCenter'

interface GroupsRightSidebarProps {
  suggestedGroups: ApiGroupWithStatus[]
  onJoin: (id: number, newStatus: 'pending' | 'none') => void
  onEnter: (id: string) => void
}

function GroupsRightSidebarInner(_props: GroupsRightSidebarProps) {
  const groups = useGroups()
  const users = useSidebarUsers()
  const { onlineUsers } = useOnlineStatus()
  const router = useRouter()
  const [groupsOpen, setGroupsOpen] = useState(true)
  const [usersOpen, setUsersOpen]   = useState(true)

  return (
    <aside className="h-full overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-6">
      {/* Mes Groupes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#49C7FF] text-base">Mes Groupes</h2>
          <button
            onClick={() => setGroupsOpen((v) => !v)}
            className="w-6 h-6 flex items-center justify-center rounded-full text-white/70 hover:text-[#49C7FF] hover:bg-white/10 transition-colors text-sm font-bold"
          >
            {groupsOpen ? '▲' : '▼'}
          </button>
        </div>
        {groupsOpen && (
          <div className="flex flex-col gap-4">
            {groups.length === 0 ? (
              <p className="text-brand-text/40 text-xs">Aucun groupe rejoint.</p>
            ) : groups.map((group) => (
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
      </section>

      {/* Utilisateurs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#49C7FF] text-base">Utilisateurs</h2>
          <button
            onClick={() => setUsersOpen((v) => !v)}
            className="w-6 h-6 flex items-center justify-center rounded-full text-white/70 hover:text-[#49C7FF] hover:bg-white/10 transition-colors text-sm font-bold"
          >
            {usersOpen ? '▲' : '▼'}
          </button>
        </div>
        {usersOpen && (
          <div className="flex flex-col gap-2">
            {users.slice(0, 10).map((user) => (
              <button
                key={user.id}
                onClick={() => router.push(`/profile/${user.id}`)}
                className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2 hover:bg-white/5 transition-colors text-left w-full"
              >
                <div className="relative shrink-0">
                  <span className={`absolute -left-1 top-0 w-2 h-2 rounded-full ${onlineUsers.has(user.id) ? 'bg-green-500' : 'bg-red-500/60'}`} />
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold ml-1">
                    {user.initials}
                  </div>
                </div>
                <p className="text-white text-xs truncate">{user.name}</p>
              </button>
            ))}
          </div>
        )}
      </section>
    </aside>
  )
}

export default function GroupsRightSidebar(props: GroupsRightSidebarProps) {
  return <Suspense><GroupsRightSidebarInner {...props} /></Suspense>
}
