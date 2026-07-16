'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRef } from 'react'
import { resolveImageUrl } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiGroupWithStatus {
  id: number
  title: string
  initials: string
  description: string
  member_count: number
  creator_id: number
  user_status: 'member' | 'pending' | 'none'
}

interface JoinRequest {
  user_id: number
  name: string
  initials: string
  avatar?: string
}

type Tab = 'mes-groupes' | 'decouvrir' | 'demandes'

// ─── Palette ──────────────────────────────────────────────────────────────────

const AVATAR_CLASSES = [
  'bg-[#6c63ff]/20 border-[#6c63ff] text-[#6c63ff]',
  'bg-[#4ecdc4]/20 border-[#4ecdc4] text-[#4ecdc4]',
  'bg-[#ff6b6b]/20 border-[#ff6b6b] text-[#ff6b6b]',
  'bg-[#ffd166]/20 border-[#ffd166] text-[#ffd166]',
  'bg-[#06d6a0]/20 border-[#06d6a0] text-[#06d6a0]',
  'bg-[#118ab2]/20 border-[#118ab2] text-[#118ab2]',
]
function avatarClass(id: number) {
  return AVATAR_CLASSES[id % AVATAR_CLASSES.length]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface GroupCardProps {
  group: ApiGroupWithStatus
  userId: number
  onEnter: (id: string) => void
  onStatusChange: (id: number, status: 'member' | 'pending' | 'none') => void
}

function GroupCard({ group, userId, onEnter, onStatusChange }: GroupCardProps) {
  const [loading, setLoading] = useState(false)
  const isCreator = group.creator_id === userId

  async function handleJoin() {
    setLoading(true)
    try {
      const res = await fetch(`/api/group-chat/${group.id}/join`, { method: 'POST' })
      if (res.ok) onStatusChange(group.id, 'pending')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    setLoading(true)
    try {
      const res = await fetch(`/api/group-chat/${group.id}/join`, { method: 'DELETE' })
      if (res.ok) onStatusChange(group.id, 'none')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/3 border border-brand-border/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-brand-border/50 hover:bg-white/5 transition-all duration-200 group">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-brand-border bg-gray-600 flex items-center justify-center text-white font-bold text-lg shrink-0 transition-shadow group-hover:shadow-neon">
          {group.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm truncate">{group.title}</p>
          <p className="text-brand-text/60 text-xs">{group.member_count} membre{group.member_count > 1 ? 's' : ''}</p>
        </div>
        {isCreator && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-transparent text-white border border-[#49c7ff] shadow-[0_0_10px_2px_#49c7ff] shrink-0">
            Admin
          </span>
        )}
      </div>

      {group.description && (
        <p className="text-brand-text/70 text-xs leading-relaxed line-clamp-2">
          {group.description}
        </p>
      )}

      <div className="mt-auto">
        {isCreator ? null : group.user_status === 'member' ? (
          <button
            onClick={() => onEnter(String(group.id))}
            className="w-full py-2 px-10 rounded-xl border border-[#49c7ff] text-white text-base shadow-[0_0_30px_4px_#49c7ff] transition-all duration-200"
          >
            Entrer dans le groupe
          </button>
        ) : group.user_status === 'pending' ? (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full py-2 px-10 rounded-xl text-base bg-transparent border border-[#ffd166]/40 text-white transition-all duration-200 disabled:opacity-50"
          >
            {loading ? '...' : 'En attente · Annuler'}
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-2 px-10 rounded-xl text-base bg-transparent border border-[#49c7ff] text-white shadow-[0_0_30px_4px_#49c7ff] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? '...' : 'Demander à rejoindre'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Demandes tab ─────────────────────────────────────────────────────────────

interface DemandesTabProps {
  allGroups: ApiGroupWithStatus[]
  userId: number
  onStatusChange: (id: number, status: 'member' | 'pending' | 'none') => void
  onApproved: () => void
}

function DemandesTab({ allGroups, userId, onStatusChange, onApproved }: DemandesTabProps) {
  const adminGroups = allGroups.filter((g) => g.creator_id === userId && g.user_status === 'member')
  const myPending   = allGroups.filter((g) => g.user_status === 'pending')
  const [requestsMap, setRequestsMap] = useState<Record<number, JoinRequest[]>>({})
  const [loadingMap, setLoadingMap]   = useState<Record<number, boolean>>({})
  const fetchedRef = useRef<Set<number>>(new Set())

  const fetchRequests = useCallback(async (groupId: number) => {
    if (fetchedRef.current.has(groupId)) return
    fetchedRef.current.add(groupId)
    setLoadingMap((prev) => ({ ...prev, [groupId]: true }))
    try {
      const res = await fetch(`/api/group-chat/${groupId}/join-requests`)
      if (res.ok) {
        const data: JoinRequest[] = await res.json()
        setRequestsMap((prev) => ({ ...prev, [groupId]: data ?? [] }))
      }
    } finally {
      setLoadingMap((prev) => ({ ...prev, [groupId]: false }))
    }
  }, [])

  useEffect(() => {
    adminGroups.forEach((g) => fetchRequests(g.id))
  }, [adminGroups.length]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleApprove(groupId: number, targetUserId: number) {
    const res = await fetch(`/api/group-chat/${groupId}/join-requests/${targetUserId}`, { method: 'PUT' })
    if (res.ok) {
      setRequestsMap((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] ?? []).filter((r) => r.user_id !== targetUserId),
      }))
      onApproved()
    }
  }

  async function handleReject(groupId: number, targetUserId: number) {
    const res = await fetch(`/api/group-chat/${groupId}/join-requests/${targetUserId}`, { method: 'DELETE' })
    if (res.ok) {
      setRequestsMap((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] ?? []).filter((r) => r.user_id !== targetUserId),
      }))
    }
  }

  async function handleCancelOwn(groupId: number) {
    const res = await fetch(`/api/group-chat/${groupId}/join`, { method: 'DELETE' })
    if (res.ok) onStatusChange(groupId, 'none')
  }

  const hasAdminRequests = adminGroups.some((g) => (requestsMap[g.id] ?? []).length > 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Demandes reçues */}
      {adminGroups.length > 0 && (
        <div>
          <h3 className="text-[#49C7FF] text-sm font-semibold mb-3">Demandes reçues</h3>
          {!hasAdminRequests && !Object.values(loadingMap).some(Boolean) && (
            <p className="text-brand-text/50 text-xs text-center py-6">Aucune demande en attente.</p>
          )}
          {adminGroups.map((g) => {
            const reqs = requestsMap[g.id] ?? []
            const isLoading = loadingMap[g.id]
            if (!isLoading && reqs.length === 0) return null
            return (
              <div key={g.id} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${avatarClass(g.id)}`}>
                    {g.initials}
                  </div>
                  <span className="text-brand-text text-xs font-medium">{g.title}</span>
                  {reqs.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/40">
                      {reqs.length}
                    </span>
                  )}
                </div>
                {isLoading ? (
                  <p className="text-brand-text/40 text-xs pl-8">Chargement...</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {reqs.map((req) => (
                      <div key={req.user_id} className="flex items-center gap-3 bg-white/3 border border-brand-border/15 rounded-xl px-3 py-2">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden ${req.avatar?.startsWith('/') || req.avatar?.startsWith('http') ? '' : avatarClass(req.user_id)}`}>
                          {req.avatar?.startsWith('/') || req.avatar?.startsWith('http')
                            ? <img src={resolveImageUrl(req.avatar)} alt={req.initials} className="w-full h-full object-cover" />
                            : req.initials || '?'}
                        </div>
                        <span className="text-white text-xs flex-1 truncate">{req.name}</span>
                        <button
                          onClick={() => handleApprove(g.id, req.user_id)}
                          className="px-3 py-1 rounded-lg text-[10px] font-medium bg-[#4ecdc4]/10 border border-[#4ecdc4]/40 text-[#4ecdc4] hover:bg-[#4ecdc4]/20 transition-all"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleReject(g.id, req.user_id)}
                          className="px-3 py-1 rounded-lg text-[10px] font-medium bg-[#ff6b6b]/10 border border-[#ff6b6b]/40 text-[#ff6b6b] hover:bg-[#ff6b6b]/20 transition-all"
                        >
                          Refuser
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Mes demandes envoyées */}
      <div>
        <h3 className="text-[#49C7FF] text-sm font-semibold mb-3">Mes demandes envoyées</h3>
        {myPending.length === 0 ? (
          <p className="text-brand-text/50 text-xs text-center py-6">Aucune demande en attente.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {myPending.map((g) => (
              <div key={g.id} className="flex items-center gap-3 bg-white/3 border border-brand-border/15 rounded-xl px-3 py-3">
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 ${avatarClass(g.id)}`}>
                  {g.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{g.title}</p>
                  <p className="text-brand-text/50 text-xs">{g.member_count} membres</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-transparent text-white border border-[#ffd166]/30 shadow-[0_0_10px_2px_#ffd166] shrink-0">
                  En attente
                </span>
                <button
                  onClick={() => handleCancelOwn(g.id)}
                  className="text-brand-text/40 hover:text-[#ff6b6b] text-xs transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── GroupsCenter ─────────────────────────────────────────────────────────────

interface GroupsCenterProps {
  allGroups: ApiGroupWithStatus[]
  userId: number
  onEnter: (id: string) => void
  onRefresh: () => void
  onStatusChange: (id: number, status: 'member' | 'pending' | 'none') => void
  pendingCount: number
}

export default function GroupsCenter({
  allGroups,
  userId,
  onEnter,
  onRefresh,
  onStatusChange,
  pendingCount,
}: GroupsCenterProps) {
  const [activeTab, setActiveTab] = useState<Tab>('mes-groupes')
  const [search, setSearch] = useState('')

  const myGroups       = allGroups.filter((g) => g.user_status === 'member' || g.creator_id === userId)
  const discoverable   = allGroups.filter((g) => g.user_status !== 'member' && g.creator_id !== userId)
  const filteredDiscover = discoverable.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  )

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'mes-groupes', label: 'Mes groupes', count: myGroups.length },
    { key: 'decouvrir', label: 'Découvrir', count: discoverable.length },
    { key: 'demandes', label: 'Invitations & Demandes', count: pendingCount || undefined },
  ]

  return (
    <div className="md:h-full bg-brand-card border border-brand-border rounded-2xl flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-brand-border/20 px-4 pt-4 shrink-0 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#49C7FF] text-[#49C7FF]'
                : 'border-transparent text-brand-text/50 hover:text-brand-text/80'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-[#49C7FF]/20 text-[#49C7FF]'
                  : 'bg-white/10 text-brand-text/50'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Mes groupes */}
        {activeTab === 'mes-groupes' && (
          <>
            {myGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-brand-border/20 flex items-center justify-center text-3xl opacity-40">
                  👥
                </div>
                <p className="text-brand-text/50 text-sm">Vous n&apos;appartenez à aucun groupe.</p>
                <button
                  onClick={() => setActiveTab('decouvrir')}
                  className="text-[#49C7FF] text-xs underline underline-offset-2 hover:no-underline"
                >
                  Découvrir des groupes →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myGroups.map((g) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    userId={userId}
                    onEnter={onEnter}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Découvrir */}
        {activeTab === 'decouvrir' && (
          <>
            {/* Barre de recherche désactivée (non obligatoire)
            <div className="mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un groupe..."
                className="w-full bg-white/5 border border-brand-border/30 rounded-xl px-4 py-2.5 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
              />
            </div>
            */}
            {filteredDiscover.length === 0 ? (
              <p className="text-brand-text/50 text-sm text-center py-10">
                {search ? 'Aucun résultat.' : 'Aucun groupe à découvrir.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDiscover.map((g) => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    userId={userId}
                    onEnter={onEnter}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Invitations & Demandes */}
        {activeTab === 'demandes' && (
          <DemandesTab
            allGroups={allGroups}
            userId={userId}
            onStatusChange={onStatusChange}
            onApproved={onRefresh}
          />
        )}
      </div>
    </div>
  )
}
