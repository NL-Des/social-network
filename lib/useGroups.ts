'use client'
import { useEffect, useState } from 'react'
import type { Group } from '@/app/components/home/RightSidebar'

export function useGroups(): Group[] {
  const [groups, setGroups] = useState<Group[]>([])
  useEffect(() => {
    fetch('/api/group-chat')
      .then(r => r.ok ? r.json() : [])
      .then(data => setGroups(
        (data ?? []).map((g: { id: number; title: string; member_ids?: number[] }) => ({
          id: String(g.id),
          name: g.title,
          membersCount: String(g.member_ids?.length ?? 0),
        }))
      ))
      .catch(() => {})
  }, [])
  return groups
}
