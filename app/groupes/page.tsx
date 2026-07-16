'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header, { CurrentUser } from '@/app/components/home/Header'
import LeftSidebarGroups, { GroupItem } from '@/app/components/home/LeftSidebarGroups'
import GroupsCenter, { ApiGroupWithStatus } from '@/app/components/groups/GroupsCenter'
import GroupsRightSidebar from '@/app/components/groups/GroupsRightSidebar'
import { fetchMe } from '@/lib/fetchMe'
import { useWebSocket } from '@/lib/useWebSocket'

export default function GroupesPage() {
  const router = useRouter()
  const [user, setUser]         = useState<CurrentUser | null>(null)
  const [allGroups, setAllGroups] = useState<ApiGroupWithStatus[]>([])
  const [loading, setLoading]   = useState(true)
  const [wsUrl, setWsUrl]       = useState<string | null>(null)

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (!data) { router.replace('/auth/login'); return }
        setUser(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    fetch('/api/ws-token')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.token) setWsUrl(`ws://localhost:5090/ws?token=${data.token}`) })
      .catch(() => {})
  }, [])

  const fetchAllGroups = useCallback(() => {
    fetch('/api/groups')
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiGroupWithStatus[]) => setAllGroups(data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user) fetchAllGroups()
  }, [user, fetchAllGroups])

  const myGroups: GroupItem[] = allGroups
    .filter((g) => g.user_status === 'member' || g.creator_id === parseInt(user?.id ?? '0'))
    .map((g) => ({
      id:           String(g.id),
      name:         g.title,
      initials:     g.initials,
      membersCount: String(g.member_count),
      description:  g.description,
    }))

  const allGroupItems: GroupItem[] = allGroups.map((g) => ({
    id:           String(g.id),
    name:         g.title,
    initials:     g.initials,
    membersCount: String(g.member_count),
    description:  g.description,
  }))

  const suggestedGroups = allGroups
    .filter((g) => g.user_status !== 'member' && g.creator_id !== parseInt(user?.id ?? '0'))
    .sort((a, b) => b.member_count - a.member_count)

  const pendingCount = allGroups.filter((g) => g.user_status === 'pending').length

  useWebSocket(wsUrl, useCallback((data: unknown) => {
    const msg = data as { type?: string }
    if (msg.type === 'group_member_added') fetchAllGroups()
  }, [fetchAllGroups]))

  function handleStatusChange(id: number, status: 'member' | 'pending' | 'none') {
    setAllGroups((prev) =>
      prev.map((g) => g.id === id ? { ...g, user_status: status } : g)
    )
  }

  if (loading) {
    return (
      <div className="bg-background h-screen flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="bg-background min-h-screen md:h-screen flex flex-col md:overflow-hidden">
      <Header user={user} />

      <div className="pt-[104px] flex-1 overflow-y-auto md:overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_264px] gap-4 pt-4 md:h-full">

          <div className="md:h-full">
            <LeftSidebarGroups
              groups={allGroupItems}
              onSelect={(id) => {
                const g = allGroups.find((g) => String(g.id) === id)
                if (g && (g.user_status === 'member' || g.creator_id === parseInt(user?.id ?? '0'))) {
                  router.push(`/inside-groups?id=${id}`)
                }
              }}
              onCreated={fetchAllGroups}
            />
          </div>

          <GroupsCenter
            allGroups={allGroups}
            userId={parseInt(user.id)}
            onEnter={(id) => router.push(`/inside-groups?id=${id}`)}
            onRefresh={fetchAllGroups}
            onStatusChange={handleStatusChange}
            pendingCount={pendingCount}
          />

          <div className="md:h-full">
            <GroupsRightSidebar
              suggestedGroups={suggestedGroups}
              onJoin={(id, status) => handleStatusChange(id, status)}
              onEnter={(id) => router.push(`/inside-groups?id=${id}`)}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
