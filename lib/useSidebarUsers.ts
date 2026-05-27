'use client'

import { useEffect, useState } from 'react'
import type { SidebarUser } from '@/app/components/home/RightSidebar'

export function useSidebarUsers() {
  const [users, setUsers] = useState<SidebarUser[]>([])

  useEffect(() => {
    fetch('/api/users')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { id: number; name: string; initials: string }[]) =>
        setUsers(
          data.map((u) => ({
            id: String(u.id),
            name: u.name,
            initials: u.initials,
            online: false,
          }))
        )
      )
      .catch(() => {})
  }, [])

  return users
}
