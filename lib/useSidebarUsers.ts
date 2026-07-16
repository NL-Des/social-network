'use client'

import { useEffect, useState } from 'react'
import type { SidebarUser } from '@/app/components/home/RightSidebar'

export function useSidebarUsers() {
  const [users, setUsers] = useState<SidebarUser[]>([])

  useEffect(() => {
    fetch('/api/users')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { id: number; name: string; initials: string; avatar?: string; isPrivate: boolean }[]) =>
        setUsers(
          data.map((u) => ({
            id: String(u.id),
            name: u.name,
            initials: u.initials,
            avatar: u.avatar?.startsWith('/') || u.avatar?.startsWith('http') ? u.avatar : undefined,
            online: false,
            isPrivate: u.isPrivate ?? false,
          }))
        )
      )
      .catch(() => {})
  }, [])

  return users
}
