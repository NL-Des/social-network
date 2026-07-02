'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface SidebarUser {
  id: string
  name: string
  initials: string
  online: boolean
}

interface LeftSidebarGroupListOfUsersProps {
  users: SidebarUser[]
  groupName?: string
  groupId: string
  currentUserId: string
  creatorId: string | null
  isMember?: boolean | null
}

interface InvitableUser {
  id: number
  name: string
  initials: string
}

function AdminButton({ users, groupName, groupId }: { users: SidebarUser[]; groupName: string; groupId: string }) {
  const router = useRouter()
  const [formOpen, setFormOpen]       = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<string>('')
  const [membersOpen, setMembersOpen] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [success, setSuccess]         = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormOpen(false)
      }
    }
    if (formOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [formOpen])

  async function handleDeleteGroup() {
    if (!confirm(`Supprimer définitivement le groupe "${groupName}" ?`)) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/group-chat/${groupId}/delete`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/groupes')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erreur lors de la suppression.')
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  async function handleTransferAdmin() {
    if (!selectedAdmin) { setError('Sélectionnez un membre.'); return }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/group-chat/${groupId}/transfer-admin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(selectedAdmin) }),
      })
      if (res.ok) {
        setSuccess('Droits administrateur transférés.')
        setSelectedAdmin('')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erreur lors du transfert.')
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  async function handleKick(userId: string, userName: string) {
    if (!confirm(`Éjecter ${userName} du groupe ?`)) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/group-chat/${groupId}/members/${userId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erreur lors de l\'éjection.')
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  const otherMembers = users.filter((u) => u.id !== '')

  return (
    <div ref={formRef} className="relative pt-3 shrink-0">
      <button
        onClick={() => { setFormOpen((o) => !o); setError(null); setSuccess(null) }}
        className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
          formOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
        }`}
      >
        Administration du Groupe
      </button>

      {formOpen && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4 z-10">
          <h3 className="font-bold text-[#49C7FF] text-base text-center">{groupName}</h3>

          {error   && <p className="text-red-400 text-xs text-center">{error}</p>}
          {success && <p className="text-green-400 text-xs text-center">{success}</p>}

          {/* Transfert des droits admin */}
          <div className="flex flex-col gap-2">
            <label className="text-brand-border text-sm">Passer les droits à :</label>
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-border transition-all"
            >
              <option value="">— Choisir un membre —</option>
              {otherMembers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button
              onClick={handleTransferAdmin}
              disabled={loading || !selectedAdmin}
              className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-sm shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? '...' : 'Confirmer le transfert'}
            </button>
          </div>

          {/* Liste des membres — éjection */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setMembersOpen((o) => !o)}
              className="flex items-center justify-between w-full text-brand-border text-sm px-1"
            >
              <span>Éjecter un membre ({users.length})</span>
              <span style={{ display: 'inline-block', transform: membersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} className="transition-transform duration-200">▾</span>
            </button>
            {membersOpen && (
              <div className="flex flex-col gap-2 mt-1 max-h-40 overflow-y-auto pr-1">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 bg-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.initials}
                      </div>
                      <p className="text-brand-text text-sm">{u.name}</p>
                    </div>
                    <button
                      onClick={() => handleKick(u.id, u.name)}
                      disabled={loading}
                      className="text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-150 text-base leading-none px-1 disabled:opacity-40"
                      title={`Éjecter ${u.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supprimer le groupe */}
          <button
            onClick={handleDeleteGroup}
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg border border-red-500 text-red-400 text-sm hover:scale-105 hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Supprimer le groupe
          </button>
        </div>
      )}
    </div>
  )
}

function InviteUserButton({ groupId, users, currentUserId }: { groupId: string; users: SidebarUser[]; currentUserId: string }) {
  const [formOpen, setFormOpen]             = useState(false)
  const [invitableUsers, setInvitableUsers] = useState<InvitableUser[]>([])
  const [selectedInvite, setSelectedInvite] = useState<string>('')
  const [inviting, setInviting]             = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [success, setSuccess]               = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormOpen(false)
      }
    }
    if (formOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [formOpen])

  useEffect(() => {
    if (!formOpen) return
    fetch('/api/users')
      .then((res) => res.ok ? res.json() : [])
      .then((data: InvitableUser[]) => {
        const memberIds = new Set(users.map((u) => u.id))
        setInvitableUsers((data ?? []).filter((u) => String(u.id) !== currentUserId && !memberIds.has(String(u.id))))
      })
      .catch(() => {})
  }, [formOpen, users, currentUserId])

  async function handleInvite() {
    if (!selectedInvite) { setError('Sélectionnez un utilisateur.'); return }
    setInviting(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/group-chat/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(selectedInvite) }),
      })
      if (res.ok) {
        setSuccess('Invitation envoyée.')
        setInvitableUsers((prev) => prev.filter((u) => String(u.id) !== selectedInvite))
        setSelectedInvite('')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erreur lors de l\'invitation.')
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div ref={formRef} className="relative pt-3 shrink-0">
      <button
        onClick={() => { setFormOpen((o) => !o); setError(null); setSuccess(null) }}
        className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
          formOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
        }`}
      >
        Inviter un membre
      </button>

      {formOpen && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4 z-10">
          <h3 className="font-bold text-[#49C7FF] text-base text-center">Inviter un utilisateur</h3>

          {error   && <p className="text-red-400 text-xs text-center">{error}</p>}
          {success && <p className="text-green-400 text-xs text-center">{success}</p>}

          <div className="flex flex-col gap-2">
            <select
              value={selectedInvite}
              onChange={(e) => setSelectedInvite(e.target.value)}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-brand-border transition-all"
            >
              <option value="">— Choisir un utilisateur —</option>
              {invitableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button
              onClick={handleInvite}
              disabled={inviting || !selectedInvite}
              className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-sm shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {inviting ? '...' : 'Envoyer l\'invitation'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function LeaveGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [leaving, setLeaving]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormOpen(false)
      }
    }
    if (formOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [formOpen])

  async function handleLeave() {
    if (!password.trim()) { setError('Mot de passe requis.'); return }
    setLeaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/group-chat/${groupId}/leave`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/groupes')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error === 'mot de passe incorrect\n' || res.status === 403
          ? 'Mot de passe incorrect.'
          : 'Erreur lors du départ.')
        setLeaving(false)
      }
    } catch {
      setError('Erreur réseau.')
      setLeaving(false)
    }
  }

  return (
    <div ref={formRef} className="relative pt-3 shrink-0">
      <button
        onClick={() => { setFormOpen((o) => !o); setError(null); setPassword('') }}
        className={`w-full py-2 px-4 rounded-lg border border-red-500 text-red-400 text-base hover:scale-105 hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-200 active:scale-95 ${
          formOpen ? 'shadow-[0_0_12px_rgba(239,68,68,0.5)]' : ''
        }`}
      >
        Quitter le Groupe
      </button>

      {formOpen && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="font-bold text-[#49C7FF] text-base text-center">
            Quitter le Groupe
          </h3>
          <div className="flex flex-col gap-1">
            <label className="text-brand-border text-sm">
              Confirmez votre mot de passe :
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLeave() }}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            onClick={handleLeave}
            disabled={leaving || !password.trim()}
            className="w-full py-2 px-4 rounded-lg border border-red-500 text-red-400 text-base hover:scale-105 hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {leaving ? 'Départ en cours…' : 'Confirmer le départ'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function LeftSidebarGroupListOfUsers({ users, groupName = 'Groupe', groupId, currentUserId, creatorId, isMember = true }: LeftSidebarGroupListOfUsersProps) {
  const isCreator = creatorId !== null && currentUserId === creatorId

  if (isMember === false) {
    return (
      <aside className="h-auto md:h-full bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col overflow-hidden">
        <section className="flex-1 overflow-y-auto">
          <h2 className="font-bold text-[#49C7FF] text-base mb-5">Utilisateurs du Groupe</h2>
          <p className="text-brand-text/60 text-sm">
            Vous n&apos;êtes pas membre du groupe, vous ne pouvez pas en connaître les participants.
          </p>
        </section>
      </aside>
    )
  }

  return (
    <aside className="h-auto md:h-full bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col overflow-hidden">
      <section className="flex-1 overflow-y-auto">
        <h2 className="font-bold text-[#49C7FF] text-base mb-5">Utilisateurs du Groupe</h2>
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2">
              <Link
                href={`/users/${user.id}`}
                className="flex items-center gap-3 flex-1 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="relative shrink-0 flex items-center">
                  {user.online && (
                    <span className="absolute -left-3 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold">
                    {user.initials}
                  </div>
                </div>
                <p className="text-white text-lg">{user.name}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
      {isCreator && (
        <AdminButton
          users={users.filter((u) => u.id !== currentUserId)}
          groupName={groupName}
          groupId={groupId}
        />
      )}
      <InviteUserButton
        groupId={groupId}
        users={users.filter((u) => u.id !== currentUserId)}
        currentUserId={currentUserId}
      />
      <LeaveGroupButton groupId={groupId} />
    </aside>
  )
}
