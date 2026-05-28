'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header, { CurrentUser } from '@/app/components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import RightSidebar, { Group } from '@/app/components/home/RightSidebar'
import LeftSidebarGroups, { GroupItem } from '@/app/components/home/LeftSidebarGroups'
import CenterGroup from '@/app/components/home/CenterGroup'

interface ApiGroup {
  id: number
  title: string
  initials: string
  member_ids: number[]
}

export default function GroupesPage() {
  const router = useRouter()
  const [user, setUser]         = useState<CurrentUser | null>(null)
  const [groups, setGroups]   = useState<GroupItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (!data) { router.replace('/auth/login'); return }
        setUser(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const fetchGroups = useCallback(() => {
    fetch('/api/group-chat')
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiGroup[]) => {
        setGroups(
          (data ?? []).map((g) => ({
            id:           String(g.id),
            name:         g.title,
            initials:     g.initials,
            membersCount: String(g.member_ids.length),
          }))
        )
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user) fetchGroups()
  }, [user, fetchGroups])

  const sidebarGroups: Group[] = groups.map(({ id, name, membersCount }) => ({ id, name, membersCount }))

  if (loading) {
    return (
      <div className="bg-background h-screen flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Header user={user} />

      <div className="pt-[104px] flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] gap-4 pt-4">

          <div className="h-full">
            <LeftSidebarGroups
              groups={groups}
              onSelect={(id) => router.push(`/inside-groups?id=${id}`)}
            />
          </div>

          <CenterGroup
            group={null}
            onCreated={fetchGroups}
            onEnter={(id) => router.push(`/inside-groups?id=${id}`)}
          />

          <div className="h-full">
            <RightSidebar groups={sidebarGroups} />
          </div>

        </div>
      </div>
    </div>
  )
}
