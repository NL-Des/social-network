'use client'

import { useEffect, useState } from 'react'

export interface Conversation {
  id: string
  name: string
  initials: string
  online: boolean
  unread?: number
}

export interface GroupConversation {
  id: string
  title: string
  initials: string
  memberIds: string[]
}

type GroupStatus = 'online' | 'offline' | 'unread'

function groupDotColor(status: GroupStatus): string {
  if (status === 'unread')  return 'bg-orange-400'
  if (status === 'online')  return 'bg-green-500'
  return 'bg-red-500'
}

interface CreateGroupModalProps {
  onClose: () => void
  onCreated: () => void
}

function CreateGroupModal({ onClose, onCreated }: CreateGroupModalProps) {
  const [title, setTitle]             = useState('')
  const [users, setUsers]             = useState<{ id: number; name: string; initials: string }[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading]         = useState(false)

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.ok ? res.json() : [])
      .then(setUsers)
      .catch(() => {})
  }, [])

  function toggleUser(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleCreate() {
    if (!title.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/group-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          member_ids: [...selectedIds],
        }),
      })
      if (res.ok) {
        onCreated()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 w-80 flex flex-col gap-4 shadow-neon">
        <div className="flex items-center justify-between">
          <h3 className="text-[#49C7FF] font-bold text-base">Nouveau groupe</h3>
          <button
            onClick={onClose}
            className="text-brand-text/50 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom du groupe"
          className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
        />

        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
          <p className="text-brand-text/60 text-xs mb-1">Membres</p>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => toggleUser(u.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
                selectedIds.has(u.id) ? 'border border-brand-border bg-white/5' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {u.initials}
              </div>
              <span className="flex-1 text-white text-sm truncate">{u.name}</span>
              {selectedIds.has(u.id) && (
                <span className="text-[#49C7FF] text-xs">✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleCreate}
          disabled={!title.trim() || loading}
          className="w-full py-2 rounded-xl border border-brand-border text-white text-sm shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? 'Création...' : 'Créer le groupe'}
        </button>
      </div>
    </div>
  )
}

interface MemberInfo {
  id: string
  name: string
  initials: string
}

interface LeftSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  groups: GroupConversation[]
  activeGroupId: string | null
  onSelectGroup: (id: string) => void
  onGroupCreated: () => void
  groupStatuses: Record<string, GroupStatus>
  allUsers?: MemberInfo[]
}

export default function LeftSidebar({
  conversations,
  activeId,
  onSelect,
  groups,
  activeGroupId,
  onSelectGroup,
  onGroupCreated,
  groupStatuses,
  allUsers = [],
}: LeftSidebarProps) {
  const [search, setSearch]               = useState('')
  const [showModal, setShowModal]         = useState(false)
  const [openMembersId, setOpenMembersId] = useState<string | null>(null)

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredGroups = groups.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={onGroupCreated}
        />
      )}

      <aside className="h-full flex flex-col bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 gap-4">

        <div className="flex items-center justify-between flex-shrink-0">
          <h2 className="font-bold text-[#49C7FF] text-base">Conversations</h2>
          <button
            onClick={() => setShowModal(true)}
            title="Nouveau groupe"
            className="w-6 h-6 rounded-full border border-brand-border text-[#49C7FF] text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            +
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="flex-shrink-0 bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
        />

        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          {/* Conversations privées */}
          {filteredConvs.map((c) => (
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

          {/* Séparateur groupes */}
          {filteredGroups.length > 0 && (
            <div className="pt-3 pb-1">
              <p className="text-brand-text/40 text-xs px-3">Groupes</p>
            </div>
          )}

          {/* Groupes de discussion */}
          {filteredGroups.map((g) => {
            const status  = groupStatuses[g.id] ?? 'offline'
            const members = g.memberIds
              .map((id) => allUsers.find((u) => u.id === id))
              .filter(Boolean) as MemberInfo[]
            const membersOpen = openMembersId === g.id

            return (
              <div key={`g-${g.id}`} className="flex flex-col">
                <div
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    activeGroupId === g.id
                      ? 'border border-brand-border shadow-[0_0_10px_rgba(73,199,255,0.35)]'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <button
                    onClick={() => onSelectGroup(g.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="relative shrink-0 flex items-center">
                      <span className={`absolute -left-2.5 w-2 h-2 rounded-full ${groupDotColor(status)}`} />
                      <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm font-bold">
                        {g.initials}
                      </div>
                    </div>
                    <span className="flex-1 text-white text-base truncate">{g.title}</span>
                  </button>
                  <button
                    onClick={() => setOpenMembersId(membersOpen ? null : g.id)}
                    title="Membres"
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-brand-text/50 hover:text-[#49C7FF] hover:bg-white/10 transition-colors text-xs"
                  >
                    {membersOpen ? '▲' : '▼'}
                  </button>
                </div>

                {membersOpen && (
                  <div className="ml-4 mt-1 mb-1 flex flex-col gap-0.5 bg-white/5 rounded-xl px-3 py-2">
                    {members.length === 0 ? (
                      <p className="text-brand-text/40 text-xs py-1">Aucun membre trouvé</p>
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
          })}
        </div>
      </aside>
    </>
  )
}
