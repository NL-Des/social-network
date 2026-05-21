'use client'

import Link from 'next/link'
import { useState } from 'react'

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
  following?: boolean
}

interface RightSidebarProps {
  groups: Group[]
  users: SidebarUser[]
}

export default function RightSidebar({ groups, users }: RightSidebarProps) {
  const [following, setFollowing] = useState<Set<string>>(
    () => new Set(users.filter((u) => u.following).map((u) => u.id))
  )

  function toggleFollow(id: string, e: React.MouseEvent) {
    e.preventDefault()
    setFollowing((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
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
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2">
              <Link
                href={`/users/${user.id}`}
                className="flex items-center gap-3 flex-1 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="relative shrink-0 flex items-center">
                  {user.online && (
                    <span className="absolute -left-3 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold">
                    {user.initials}
                  </div>
                </div>
                <p className="text-white text-lg">{user.name}</p>
              </Link>
              <button
                onClick={(e) => toggleFollow(user.id, e)}
                title={following.has(user.id) ? 'Abonné' : 'S\'abonner'}
                className="shrink-0 w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform duration-150"
              >
                <span className={`text-base leading-none font-bold ${following.has(user.id) ? 'text-gray-500' : 'text-green-400'}`}>
                  ✓
                </span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
