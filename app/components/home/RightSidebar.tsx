'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useOnlineStatus } from '@/lib/useOnlineStatus'
import { useSidebarUsers } from '@/lib/useSidebarUsers'
import { useGroups } from '@/lib/useGroups'
import { resolveImageUrl } from '@/lib/utils'

export interface Group {
  id: string
  name: string
  membersCount: string
}

export interface SidebarUser {
  id: string
  name: string
  initials: string
  avatar?: string
  online: boolean
  isPrivate: boolean
}

interface RightSidebarProps {
  groups?: Group[]
}

function statusDotColor(
  userId: string,
  onlineUsers: Set<string>,
  unreadFrom: Set<string>,
  activeConvId: string | null,
) {
  if (activeConvId !== userId && unreadFrom.has(userId)) return 'bg-orange-400'
  if (onlineUsers.has(userId)) return 'bg-green-500'
  return 'bg-red-500'
}

function RightSidebarInner({ groups: groupsProp }: RightSidebarProps) {
  const fetchedGroups = useGroups()
  const groups = groupsProp ?? fetchedGroups
  const users = useSidebarUsers()
  const { onlineUsers, unreadFrom, clearUnread } = useOnlineStatus()
  const [localUnread, setLocalUnread]     = useState<Set<string>>(new Set())
  const [privateOpenId, setPrivateOpenId] = useState<string | null>(null)
  const [groupsOpen, setGroupsOpen]       = useState(true)
  const [usersOpen, setUsersOpen]         = useState(true)
  const pathname      = usePathname()
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const onMessagesPage = pathname === '/messages'
  const activeConvId   = onMessagesPage ? searchParams.get('with') : null

  // Efface le badge unread dès que l'utilisateur est dans la conversation
  useEffect(() => {
    if (!activeConvId) return
    clearUnread(activeConvId)
    setLocalUnread((prev) => { const n = new Set(prev); n.delete(activeConvId); return n })
  }, [activeConvId, clearUnread])

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
    <aside className="h-auto md:h-full overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-6">

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
        {usersOpen && <div className="flex flex-col gap-3">
          {sortedUsers.map((user) => {
            const avatar = (
              <div className="relative shrink-0 flex items-center">
                <span className={`absolute -left-3 w-2 h-2 rounded-full ${statusDotColor(user.id, onlineUsers, mergedUnread, activeConvId)}`} />
                <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold overflow-hidden">
                  {user.avatar
                    ? <img src={resolveImageUrl(user.avatar)} alt={user.initials} className="w-full h-full object-cover" />
                    : user.initials}
                </div>
              </div>
            )
            const isDropdownOpen = privateOpenId === user.id

            if (user.isPrivate && !onMessagesPage) {
  return (
    <div key={user.id} className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2">
      <Link
        href={`/profile/${user.id}`}
        onClick={() => handleClearUnread(user.id)}
        className="flex items-center gap-3 flex-1 hover:bg-white/5 rounded-xl transition-colors"
      >
        {avatar}
        <p className="text-white text-lg">{user.name}</p>
      </Link>
    </div>
  )
}

            const inner = (
              <>
                {avatar}
                <p className="text-white text-lg">{user.name}</p>
              </>
            )
            return (
              <div key={user.id} className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2">
                {onMessagesPage ? (
                  <button
                    onClick={() => {
                      handleClearUnread(user.id)
                      router.push(`/messages?with=${user.id}`)
                    }}
                    className="flex items-center gap-3 flex-1 hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                    {inner}
                  </button>
                ) : (
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => handleClearUnread(user.id)}
                    className="flex items-center gap-3 flex-1 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    {inner}
                  </Link>
                )}
              </div>
            )
          })}
        </div>}
      </section>
    </aside>
  )
}
export default function RightSidebar(props: RightSidebarProps) {
  return <Suspense><RightSidebarInner {...props} /></Suspense>
}
