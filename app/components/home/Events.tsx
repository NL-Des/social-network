'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface GroupEvent {
  id: number
  groupId: number
  creatorId: number
  creatorName: string
  title: string
  description: string
  eventDatetime: string
  createdAt: string
  coming: number
  unsure: number
  uninterested: number
  userResponse: string
}

interface EventsProps {
  groupId: string
}

export default function Events({ groupId }: EventsProps) {
  const [events, setEvents]               = useState<GroupEvent[]>([])
  const [selected, setSelected]           = useState<GroupEvent | null>(null)
  const [formOpen, setFormOpen]           = useState(false)
  const [listOpen, setListOpen]           = useState(false)
  const [title, setTitle]                 = useState('')
  const [description, setDescription]     = useState('')
  const [date, setDate]                   = useState('')
  const [time, setTime]                   = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const fetchEvents = useCallback(() => {
    if (!groupId) return
    fetch(`/api/group-chat/${groupId}/events`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: GroupEvent[]) => setEvents(data ?? []))
      .catch(() => {})
  }, [groupId])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormOpen(false)
        setSelected(null)
      }
    }
    if (formOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [formOpen])

  async function handleRespond(eventId: number, response: 'coming' | 'unsure' | 'uninterested') {
    try {
      const res = await fetch(`/api/group-chat/${groupId}/events/${eventId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      })
      if (res.ok) {
        fetchEvents()
        if (selected?.id === eventId) {
          setSelected((prev) => prev ? { ...prev, userResponse: response } : prev)
        }
      }
    } catch {
      // ignore
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !date || !time) return
    setSubmitting(true)
    setError(null)
    try {
      const eventDatetime = new Date(`${date}T${time}`).toISOString()
      const res = await fetch(`/api/group-chat/${groupId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), eventDatetime }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erreur serveur' }))
        setError(data.error ?? 'Erreur serveur')
        return
      }
      setTitle('')
      setDescription('')
      setDate('')
      setTime('')
      fetchEvents()
    } catch {
      setError('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    } catch {
      return iso
    }
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const RESPONSE_LABELS: Record<string, string> = {
    coming: 'Je viens',
    unsure: 'Peut-être',
    uninterested: 'Je ne viens pas',
  }

  return (
    <div ref={formRef} className="relative pt-3 shrink-0">
      <button
        onClick={() => { setFormOpen((o) => !o); setSelected(null) }}
        className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
          formOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
        }`}
      >
        Évènements
      </button>

      {formOpen && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4">

          {selected ? (
            <>
              <button
                onClick={() => setSelected(null)}
                className="text-brand-border hover:text-brand-text transition-colors text-sm text-left"
              >
                ← Retour
              </button>

              <h3 className="font-bold text-[#49C7FF] text-base text-center">{selected.title}</h3>
              <p className="text-brand-text text-sm leading-relaxed">{selected.description}</p>

              <div className="flex flex-col gap-1">
                <p className="text-brand-border text-xs">
                  Date : <span className="text-brand-text">{formatDate(selected.eventDatetime)}</span>
                </p>
                <p className="text-brand-border text-xs">
                  Heure : <span className="text-brand-text">{formatTime(selected.eventDatetime)}</span>
                </p>
                <p className="text-brand-border text-xs">
                  Participants : <span className="text-brand-text">{selected.coming}</span>
                  {' · '}Peut-être : <span className="text-brand-text">{selected.unsure}</span>
                  {' · '}Absent : <span className="text-brand-text">{selected.uninterested}</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {(['coming', 'unsure', 'uninterested'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRespond(selected.id, r)}
                    className={`w-full py-2 px-4 rounded-lg border text-sm transition-all ${
                      selected.userResponse === r
                        ? 'border-[#49C7FF] text-[#49C7FF] shadow-[0_0_8px_rgba(73,199,255,0.5)]'
                        : 'border-brand-border text-brand-text hover:border-[#49C7FF]/60'
                    }`}
                  >
                    {RESPONSE_LABELS[r]}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="font-bold text-[#49C7FF] text-base text-center">Évènements</h3>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setListOpen((o) => !o)}
                  className="flex items-center justify-between w-full text-brand-border text-sm px-1"
                >
                  <span>Liste ({events.length})</span>
                  <span
                    style={{ display: 'inline-block', transform: listOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    className="transition-transform duration-200"
                  >
                    ▾
                  </span>
                </button>

                {listOpen && (
                  <div className="flex flex-col gap-2 mt-1 max-h-48 overflow-y-auto pr-1">
                    {events.length === 0 ? (
                      <p className="text-brand-text/40 text-xs px-1">Aucun événement pour le moment.</p>
                    ) : (
                      events.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelected(ev)}
                          className="flex items-start justify-between gap-2 rounded-xl px-3 py-2 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <p className="text-brand-text text-sm font-semibold truncate">{ev.title}</p>
                            <p className="text-brand-border text-xs truncate">{ev.description}</p>
                            <p className="text-brand-border text-xs">
                              {formatDate(ev.eventDatetime)} · {formatTime(ev.eventDatetime)}
                            </p>
                            <p className="text-brand-border text-xs">
                              ✓ {ev.coming} · ? {ev.unsure} · ✗ {ev.uninterested}
                            </p>
                          </div>
                          {ev.userResponse && (
                            <span className="shrink-0 text-xs text-[#49C7FF] mt-1">
                              {RESPONSE_LABELS[ev.userResponse] ?? ev.userResponse}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <p className="font-bold text-[#49C7FF] text-sm text-center border-t border-brand-border/30 pt-3">
                Créer un évènement
              </p>

              <form onSubmit={handleCreate} className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-brand-border text-sm">Titre :</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-brand-border text-sm">Description :</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-brand-border text-sm">Date :</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="bg-white/5 border border-brand-border/40 rounded-xl px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-border transition-all w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-brand-border text-sm">Heure :</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="bg-white/5 border border-brand-border/40 rounded-xl px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-border transition-all w-full"
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-sm shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Création…' : "Créer l'évènement"}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  )
}
