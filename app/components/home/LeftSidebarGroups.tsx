'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface GroupItem {
  id: string
  name: string
  initials: string
  membersCount: string
  description?: string
}

interface MemberInfo {
  id: string
  name: string
  initials: string
}

interface CreateModalProps {
  onClose: () => void
  onCreated: (id: string) => void
}

function CreateModal({ onClose, onCreated }: CreateModalProps) {
  const [name, setName]       = useState('')
  const [desc, setDesc]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit() {
    if (!name.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/group-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: name.trim(), description: desc.trim(), member_ids: [] }),
      })
      if (!res.ok) { setError(`Erreur ${res.status}`); return }
      const data = await res.json()
      onCreated(String(data.id))
    } catch {
      setError('Service indisponible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-brand-card border border-brand-border shadow-neon rounded-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#49C7FF] text-base">Créer un groupe</h3>
          <button onClick={onClose} className="text-brand-text/40 hover:text-brand-text transition-colors text-lg">✕</button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-brand-text/70 text-xs">Nom du groupe *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            placeholder="Ex: Foot du dimanche"
            className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2.5 text-brand-text text-sm placeholder:text-brand-text/30 focus:outline-none focus:border-brand-border transition-all"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-brand-text/70 text-xs">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="À quoi sert ce groupe ?"
            className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2.5 text-brand-text text-sm placeholder:text-brand-text/30 focus:outline-none focus:border-brand-border transition-all resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-brand-border/30 text-brand-text/60 text-sm hover:border-brand-border/60 hover:text-brand-text transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#6c63ff]/20 border border-[#6c63ff]/60 text-[#6c63ff] text-sm font-medium hover:bg-[#6c63ff]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface LeftSidebarGroupsProps {
  groups: GroupItem[]
  onSelect: (id: string) => void
  onCreated?: () => void
}

export default function LeftSidebarGroups({ groups, onSelect, onCreated }: LeftSidebarGroupsProps) {
  const router = useRouter()
  const [search, setSearch]               = useState('')
  const [showCreate, setShowCreate]       = useState(false)
  const [openMembersId, setOpenMembersId] = useState<string | null>(null)
  const [fetchedMembers, setFetchedMembers] = useState<Record<string, MemberInfo[]>>({})

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  function fetchGroupMembers(groupId: string) {
    fetch(`/api/group-chat/${groupId}/members`)
      .then((res) => res.ok ? res.json() : [])
      .then((data: { id: number; name: string; initials: string }[]) => {
        setFetchedMembers((prev) => ({
          ...prev,
          [groupId]: (data ?? []).map((m) => ({
            id:       String(m.id),
            name:     m.name,
            initials: m.initials,
          })),
        }))
      })
      .catch(() => {})
  }

  function handleCreated(id: string) {
    setShowCreate(false)
    onCreated?.()
    router.push(`/inside-groups?id=${id}`)
  }

  return (
    <>
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      <aside className="h-full flex flex-col bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 gap-4">
        <h2 className="font-bold text-[#49C7FF] text-sm shrink-0">Liste des groupes</h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="shrink-0 bg-white/5 border border-brand-border/30 rounded-xl px-4 py-2 text-brand-text text-xs placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
        />

        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          {filtered.length === 0 ? (
            <p className="text-brand-text/30 text-xs text-center py-4">
              {search ? 'Aucun résultat' : 'Aucun groupe'}
            </p>
          ) : (
            filtered.map((g) => {
              const membersOpen = openMembersId === g.id
              const members = fetchedMembers[g.id] ?? []

              return (
                <div key={g.id} className="flex flex-col">
                  <div className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-white/5 group">
                    <button
                      onClick={() => onSelect(g.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-brand-border bg-gray-600 flex items-center justify-center text-white font-bold text-lg shrink-0 transition-shadow group-hover:shadow-neon">
                        {g.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs truncate group-hover:text-[#49C7FF] transition-colors">{g.name}</p>
                        <p className="text-brand-text/50 text-[10px]">{g.membersCount} membres</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        const next = membersOpen ? null : g.id
                        setOpenMembersId(next)
                        if (next) fetchGroupMembers(next)
                      }}
                      title="Membres du groupe"
                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-white/70 hover:text-[#49C7FF] hover:bg-white/10 transition-colors text-sm font-bold"
                    >
                      {membersOpen ? '▲' : '▼'}
                    </button>
                  </div>

                  {membersOpen && (
                    <div className="ml-4 mt-1 mb-1 flex flex-col gap-0.5 bg-white/5 rounded-xl px-3 py-2">
                      {members.length === 0 ? (
                        <p className="text-brand-text/40 text-xs py-1">Vous n’êtes pas membre du groupe, vous ne pouvez pas en connaître les participants.</p>
                      ) : (
                        members.map((m) => (
                          <div key={m.id} className="flex items-center gap-2 py-1">
                            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {m.initials}
                            </div>
                            <span className="text-brand-text text-sm truncate">{m.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="shrink-0 w-full py-2 px-10 rounded-xl border border-[#49c7ff] text-white text-base shadow-[0_0_30px_4px_#49c7ff] transition-all duration-200"
        >
          + Créer un groupe
        </button>
      </aside>
    </>
  )
}
