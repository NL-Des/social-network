'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export interface SidebarUser {
  id: string
  name: string
  initials: string
  online: boolean
}

interface LeftSidebarGroupListOfUsersProps {
  users: SidebarUser[]
  groupName?: string
}

function AdminButton({ users, groupName }: { users: SidebarUser[]; groupName: string }) {
  const [formOpen, setFormOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState('')
  const [membersOpen, setMembersOpen] = useState(false)
  const [memberList, setMemberList] = useState(users)
  const formRef = useRef<HTMLDivElement>(null)

  // État pour capturer une erreur de soumission
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormOpen(false)
        setActionError(null) // Reset l'erreur à la fermeture
      }
    }
    if (formOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [formOpen])

  function removeUser(id: string) {
    setMemberList((prev) => prev.filter((u) => u.id !== id))
  }

  // Sécurisation de la soumission du formulaire d'ajout d'admin
  async function handleSubmitAdmin(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!newAdmin.trim()) return

    setIsPending(true)
    setActionError(null)

    try {
      // simulation ou appel futur de l'action :
      // const res = await addAdminAction(groupName, newAdmin)
      // if (!res.success) throw new Error(res.message)
      
      setNewAdmin('')
      setFormOpen(false)
    } catch (err: any) {
      // Capture universelle (Réseau KO, ou message du serveur Go)
      setActionError(err.message || "Impossible de désigner cet administrateur.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div ref={formRef} className="relative pt-3 shrink-0">
      <button
        onClick={() => setFormOpen((o) => !o)}
        className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
          formOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
        }`}
      >
        Nommer un Admin
      </button>

      {formOpen && (
        <div className="absolute left-0 bottom-[calc(100%+12px)] w-full bg-brand-card border border-brand-border shadow-neon rounded-2xl p-4 z-50 animate-fadeIn">
          <form onSubmit={handleSubmitAdmin} className="flex flex-col gap-3">
            <input
              type="text"
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              placeholder="Username de l'admin"
              disabled={isPending}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
            />
            
            {/* Affichage de l'erreur si le Back ou le réseau échoue */}
            {actionError && (
              <p className="text-red-400 text-xs px-1 animate-pulse">⚠️ {actionError}</p>
            )}

            <button
              type="submit"
              disabled={isPending || !newAdmin.trim()}
              className="py-1.5 rounded-lg border border-[#49C7FF]/40 text-white text-sm bg-[#49C7FF]/10 hover:bg-[#49C7FF]/20 transition-all disabled:opacity-50"
            >
              {isPending ? 'Ajout...' : 'Confirmer'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

<<<<<<< HEAD
export default function LeftSidebarGroupListOfUsers({ users, groupName }: LeftSidebarGroupListOfUsersProps) {
  const [following, setFollowing] = useState<Set<string>>(
    new Set(users.filter((u) => u.following).map((u) => u.id))
  )

  //Gestion locale d'un échec réseau lors du follow/unfollow
  async function toggleFollow(id: string, e: React.MouseEvent) {
    e.preventDefault()
    
    // Optimistic UI : On change immédiatement l'état visuel
    setFollowing((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

    try {
      // Appeler ici ton action réelle vers Go :
      // await toggleFollowAction(id)
    } catch (err) {
      // En cas de panne réseau ou serveur Go éteint, on rollback discrètement l'UI
      alert("Erreur réseau : Action non enregistrée.")
      setFollowing((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }
  }
=======
function LeaveGroupButton() {
  const [formOpen, setFormOpen] = useState(false)
  const [password, setPassword] = useState('')
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

  return (
    <div ref={formRef} className="relative pt-3 shrink-0">
      <button
        onClick={() => setFormOpen((o) => !o)}
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
              Entrez votre mot de passe pour confirmer votre départ :
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
            />
          </div>

          <button className="w-full py-2 px-4 rounded-lg border border-red-500 text-red-400 text-base hover:scale-105 hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-200 active:scale-95">
            Confirmer le départ
          </button>
        </div>
      )}
    </div>
  )
}

export default function LeftSidebarGroupListOfUsers({ users, groupName = 'Groupe' }: LeftSidebarGroupListOfUsersProps) {
>>>>>>> 814e2d98005ee4a92714a7ba0f6e2ea4f43adab0

  return (
    <aside className="h-full flex flex-col bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 gap-4">
      <h2 className="font-bold text-[#49C7FF] text-base shrink-0">
        {groupName ? `Membres de ${groupName}` : 'Utilisateurs'}
      </h2>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
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
<<<<<<< HEAD
              </div>
              <p className="text-white text-lg">{user.name}</p>
            </Link>
            <button
              onClick={(e) => toggleFollow(user.id, e)}
              title={following.has(user.id) ? 'Abonné' : 'S\'abonner'}
              className="shrink-0 w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform duration-150"
            >
              <span className={`text-base leading-none font-bold ${following.has(user.id) ? 'text-gray-500' : 'text-green-400'}`}>
                {following.has(user.id) ? '✓' : '+'}
              </span>
            </button>
          </div>
        ))}
      </div>

      {groupName && <AdminButton users={users} groupName={groupName} />}
=======
                <p className="text-white text-lg">{user.name}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>
      <AdminButton users={users} groupName={groupName} />
      <LeaveGroupButton />
>>>>>>> 814e2d98005ee4a92714a7ba0f6e2ea4f43adab0
    </aside>
  )
}