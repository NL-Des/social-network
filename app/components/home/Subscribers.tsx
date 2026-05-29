'use client'

import { useState, useEffect } from 'react'
import type { Contact } from '@/app/profile/actions'
import { ContactRow } from './Followers'

interface SubscribersProps {
  followers: Contact[]
}

export default function Subscribers({ followers }: SubscribersProps) {
  const [list, setList] = useState<Contact[]>(followers)

  useEffect(() => {
    setList(followers)
  }, [followers])

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5 h-full overflow-hidden flex flex-col">
      <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center shrink-0">
        Abonnés
      </h2>
      <div className="flex flex-col gap-1 overflow-y-auto flex-1">
        {list.map((c) => (
          <ContactRow
            key={c.id}
            contact={c}
            onRemove={() => setList((prev) => prev.filter((x) => x.id !== c.id))}
          />
        ))}
      </div>
    </div>
  )
}
