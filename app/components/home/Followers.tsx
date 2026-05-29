'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Contact } from '@/app/profile/actions'

export function ContactRow({
  contact,
  onRemove,
}: {
  contact: Contact
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Link
        href={`/users/${contact.id}`}
        className="flex items-center gap-3 flex-1 min-w-0 rounded-xl px-1 -mx-1 hover:bg-white/5 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {contact.initials}
        </div>
        <span className="text-brand-text text-base flex-1">{contact.name}</span>
      </Link>
      <button
        onClick={onRemove}
        className="text-red-500 hover:text-red-400 transition-colors text-lg leading-none cursor-pointer"
        aria-label={`Se désabonner de ${contact.name}`}
      >
        ×
      </button>
    </div>
  )
}

interface FollowersProps {
  following: Contact[]
}

export default function Followers({ following }: FollowersProps) {
  const [list, setList] = useState<Contact[]>(following)

  useEffect(() => {
    setList(following)
  }, [following])

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5 h-full overflow-hidden flex flex-col">
      <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center shrink-0">
        Suivi(e)s
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
