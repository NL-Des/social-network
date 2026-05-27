'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useOnlineStatus } from '@/lib/useOnlineStatus'
import { useSidebarUsers } from '@/lib/useSidebarUsers'

export interface Group {
  id: string
  name: string
  membersCount: string
}

export interface SidebarUser {
  id: string
  name: string
  initials: string
  online: boolean
}

interface RightSidebarProps {
  groups: Group[]
}

function statusDotColor(userId: string, onlineUsers: Set<string>, unreadFrom: Set<string>) {
  if (unreadFrom.has(userId)) return 'bg-orange-400'
  if (onlineUsers.has(userId)) return 'bg-green-500'
  return 'bg-red-500'
}

export default function RightSidebar({ groups }: RightSidebarProps) {
  const users = useSidebarUsers()
  const { onlineUsers, unreadFrom, clearUnread } = useOnlineStatus()
  const [localUnread, setLocalUnread] = useState<Set<string>>(new Set())

  const mergedUnread = new Set([...unreadFrom, ...localUnread])

  const sortedUsers = [...users].sort((a, b) => {
    const aOnline = onlineUsers.has(a.id) || mergedUnread.has(a.id)
    const bOnline = onlineUsers.has(b.id) || mergedUnread.has(b.id)
    if (aOnline !== bOnline) return aOnline ? -1 : 1
    return a.name.localeCompare(b.name, 'fr')
  })

  function handleClearUnread(id: string) {
    clearUnread(id)
    setLocalUnread((prev) => { const n = new Set(prev); n.delete(id); return n })
  }

  return (
    <aside className="h-full overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-6">
      <section>
        <h2 className="font-bold text-[#49C7FF] text-base mb-5">Mes Groupes</h2>
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 shrink-0" />
              <div>
                <p className="text-white text-lg font-semibold">{group.name}</p>
                <p className="text-brand-text text-base">{group.membersCount} membres</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-[#49C7FF] text-base mb-5">Utilisateurs</h2>
        <div className="flex flex-col gap-3">
          {sortedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2">
              <Link
                href={`/users/${user.id}`}
                onClick={() => handleClearUnread(user.id)}
                className="flex items-center gap-3 flex-1 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="relative shrink-0 flex items-center">
                  <span className={`absolute -left-3 w-2 h-2 rounded-full ${statusDotColor(user.id, onlineUsers, mergedUnread)}`} />
                  <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold">
                    {user.initials}
                  </div>
                </div>
                <p className="text-white text-lg">{user.name}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
