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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setFormOpen(false)
      }
    }
    if (formOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [formOpen])

  function removeUser(id: string) {
    setMemberList((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div ref={formRef} className="relative pt-3 shrink-0">
      <button
        onClick={() => setFormOpen((o) => !o)}
        className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
          formOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
        }`}
      >
        Administration du Groupe
      </button>

      {formOpen && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="font-bold text-[#49C7FF] text-base text-center">
           <span className="text-[#49C7FF] font-bold">{groupName}</span>
          </h3>

          {/* Supprimer le groupe */}
          <button className="w-full py-2 px-4 rounded-lg border border-red-500 text-red-400 text-base hover:scale-105 hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-200 active:scale-95">
            Supprimer le Groupe
          </button>

          {/* Passage des droits admin */}
          <div className="flex flex-col gap-1">
            <label className="text-brand-border text-sm">
              Passer les droits administrateur à :
            </label>
            <input
              type="text"
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
            />
          </div>
          <button className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95">
            Confirmer le passage des droits administrateurs
          </button>

          {/* Liste des membres */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setMembersOpen((o) => !o)}
              className="flex items-center justify-between w-full text-brand-border text-sm px-1"
            >
              <span>Membres du groupe ({memberList.length})</span>
              <span className="transition-transform duration-200" style={{ display: 'inline-block', transform: membersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▾
              </span>
            </button>

            {membersOpen && (
              <div className="flex flex-col gap-2 mt-1 max-h-40 overflow-y-auto pr-1">
                {memberList.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 bg-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.initials}
                      </div>
                      <p className="text-brand-text text-sm">{user.name}</p>
                    </div>
                    <button
                      onClick={() => removeUser(user.id)}
                      className="text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-150 text-base leading-none px-1"
                      title={`Éjecter ${user.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
  return (
    <aside className="h-full bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col overflow-hidden">
      <section className="flex-1 overflow-y-auto">
        <h2 className="font-bold text-[#49C7FF] text-base mb-5">Utilisateurs du Groupe</h2>
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2 hover:bg-white/5 transition-colors"
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
          ))}
        </div>
      </section>
      <AdminButton users={users} groupName={groupName} />
      <LeaveGroupButton />
    </aside>
  )
}
