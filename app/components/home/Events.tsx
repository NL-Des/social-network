import type { Event } from '@/app/profile/actions'

interface EventsProps {
  events: Event[]
}

export default function Events({ events }: EventsProps) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
      <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center">
        Évènements
      </h2>
      <div className="flex flex-col gap-2">
        {events.map((e) => (
          <div key={e.id} className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {e.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-retro text-brand-border text-xs truncate">{e.title}</p>
              <p className="text-brand-text text-sm truncate">{e.subtitle}</p>
            </div>
            <button className="text-red-500 hover:text-red-400 transition-colors text-lg leading-none">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
