'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Event } from '@/app/profile/actions'

interface EventsProps {
  events: Event[]
}

export default function Events({ events }: EventsProps) {
  const [list, setList] = useState<Event[]>(events)

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
      <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center">
        Évènements
      </h2>
      <div className="flex flex-col gap-2">
        {list.map((e) => (
          <div key={e.id} className="flex items-center gap-3 py-1">
            <Link
              href={`/events/${e.id}`}
              className="flex items-center gap-3 flex-1 min-w-0 rounded-xl px-1 -mx-1 hover:bg-white/5 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {e.initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#49C7FF] text-base truncate">{e.title}</p>
                <p className="text-brand-text text-sm truncate">{e.subtitle}</p>
              </div>
            </Link>
            <button
              onClick={() => setList((prev) => prev.filter((x) => x.id !== e.id))}
              className="text-red-500 hover:text-red-400 transition-colors text-lg leading-none cursor-pointer"
              aria-label={`Se désinscrire de ${e.title}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
