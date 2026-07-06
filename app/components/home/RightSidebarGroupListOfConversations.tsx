'use client'

import { useEffect, useRef, useState } from 'react'
import Events from '@/app/components/home/Events'

export interface Conversation {
  id: string
  name: string
  initials: string
  online: boolean
  unread?: number
}

export interface GroupEventAttendee {
  id: string
  name: string
  initials: string
}

export interface GroupEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  registered: boolean
  attendees: GroupEventAttendee[]
}

function EventButton({ initialEvents }: { initialEvents: GroupEvent[] }) {
  const [formOpen, setFormOpen]           = useState(false)
  const [eventsOpen, setEventsOpen]       = useState(false)
  const [events, setEvents]               = useState<GroupEvent[]>(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<GroupEvent | null>(null)
  const [eventName, setEventName]         = useState('')
  const [description, setDescription]     = useState('')
  const [date, setDate]                   = useState('')
  const [time, setTime]                   = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormOpen(false)
        setSelectedEvent(null)
      }
    }
    if (formOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [formOpen])

  function toggleRegistration(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setEvents((prev) =>
      prev.map((ev) => ev.id === id ? { ...ev, registered: !ev.registered } : ev)
    )
  }

  return (
    <div ref={formRef} className="relative pt-3 shrink-0">
      <button
        onClick={() => { setFormOpen((o) => !o); setSelectedEvent(null) }}
        className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
          formOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
        }`}
      >
        Évènements
      </button>

      {formOpen && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4">

          {/* ── Vue détail d'un événement ── */}
          {selectedEvent ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-brand-border hover:text-brand-text transition-colors text-sm"
                >
                  ← Retour
                </button>
              </div>

              <h3 className="font-bold text-[#49C7FF] text-base text-center">{selectedEvent.title}</h3>

              <p className="text-brand-text text-sm leading-relaxed">{selectedEvent.description}</p>

              <div className="flex flex-col gap-1">
                <p className="text-brand-border text-xs">Date : <span className="text-brand-text">{selectedEvent.date}</span></p>
                <p className="text-brand-border text-xs">Heure : <span className="text-brand-text">{selectedEvent.time}</span></p>
                <p className="text-brand-border text-xs">Inscrits : <span className="text-brand-text">{selectedEvent.attendees.length}</span></p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-brand-border text-sm">Liste des inscrits :</p>
                <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                  {selectedEvent.attendees.length === 0 ? (
                    <p className="text-brand-text/40 text-xs px-1">Aucun inscrit pour le moment.</p>
                  ) : (
                    selectedEvent.attendees.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 rounded-xl px-2 py-1 bg-white/5">
                        <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {a.initials}
                        </div>
                        <p className="text-brand-text text-sm">{a.name}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-bold text-[#49C7FF] text-base text-center">Évènements</h3>

              {/* Liste déroulante des événements */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setEventsOpen((o) => !o)}
                  className="flex items-center justify-between w-full text-brand-border text-sm px-1"
                >
                  <span>Liste des évènements ({events.length})</span>
                  <span
                    style={{ display: 'inline-block', transform: eventsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    className="transition-transform duration-200"
                  >
                    ▾
                  </span>
                </button>

                {eventsOpen && (
                  <div className="flex flex-col gap-2 mt-1 max-h-48 overflow-y-auto pr-1">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="flex items-start justify-between gap-2 rounded-xl px-3 py-2 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-brand-text text-sm font-semibold truncate">{ev.title}</p>
                          <p className="text-brand-border text-xs truncate">{ev.description}</p>
                          <p className="text-brand-border text-xs">{ev.date} · {ev.time}</p>
                        </div>
                        <button
                          onClick={(e) => toggleRegistration(ev.id, e)}
                          title={ev.registered ? 'Se désinscrire' : 'S\'inscrire'}
                          className="shrink-0 text-lg leading-none hover:scale-110 transition-transform duration-150 mt-0.5"
                        >
                          {ev.registered ? (
                            <span className="text-red-400">✕</span>
                          ) : (
                            <span className="text-green-400">✓</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Création d'un événement */}
              <p className="font-bold text-[#49C7FF] text-sm text-center border-t border-brand-border/30 pt-3">
                Création d&apos;un évènement
              </p>

              <div className="flex flex-col gap-1">
                <label className="text-brand-border text-sm">Nom de l&apos;évènement :</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-brand-border text-sm">Description :</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-brand-border text-sm">Date :</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/5 border border-brand-border/40 rounded-xl px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-border transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-brand-border text-sm">Heure :</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-white/5 border border-brand-border/40 rounded-xl px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-border transition-all"
                />
              </div>

              <button className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95">
                Créer l&apos;évènement
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface RightSidebarGroupListOfConversationsProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  events?: GroupEvent[]
  groupId?: string
}

export default function RightSidebarGroupListOfConversations({
  conversations,
  activeId,
  onSelect,
  events = [],
  groupId,
}: RightSidebarGroupListOfConversationsProps) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="h-auto md:h-full flex flex-col bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 gap-4 md:overflow-hidden">
      <h2 className="font-bold text-[#49C7FF] text-base shrink-0">Conversations avec les membres du Groupe</h2>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tapez votre texte"
        className="shrink-0 bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
      />

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
              activeId === c.id
                ? 'border border-brand-border shadow-[0_0_10px_rgba(73,199,255,0.35)]'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="relative shrink-0 flex items-center">
              {c.online && (
                <span className="absolute -left-2.5 w-2 h-2 bg-green-500 rounded-full" />
              )}
              <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                {c.initials}
              </div>
            </div>

            <span className="flex-1 text-white text-base truncate">{c.name}</span>

            {c.unread ? (
              <span className="shrink-0 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {c.unread}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {groupId ? (
        <Events groupId={groupId} />
      ) : (
        <EventButton initialEvents={events} />
      )}
    </aside>
  )
}
