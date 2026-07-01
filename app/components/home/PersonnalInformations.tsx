'use client'

import { useEffect, useRef, useState } from 'react'
import type { UserProfile } from '@/app/profile/actions'

interface PersonnalInformationsProps {
  user: UserProfile
}

export default function PersonnalInformations({ user }: PersonnalInformationsProps) {
  const [pwFormOpen, setPwFormOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const pwFormRef = useRef<HTMLDivElement>(null)

  const [editFormOpen, setEditFormOpen] = useState(false)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [pseudo, setPseudo] = useState(user.username ?? '')
  const [aboutMe, setAboutMe] = useState(user.description ?? '')
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState(false)
  const editFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pwFormRef.current && !pwFormRef.current.contains(e.target as Node)) {
        setPwFormOpen(false)
      }
    }
    if (pwFormOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pwFormOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (editFormRef.current && !editFormRef.current.contains(e.target as Node)) {
        setEditFormOpen(false)
      }
    }
    if (editFormOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editFormOpen])

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEditError(null)
    setEditSuccess(false)
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, pseudo, aboutMe }),
      })
      if (!res.ok) {
        setEditError('Erreur lors de la mise à jour.')
        return
      }
      setEditSuccess(true)
      setTimeout(() => { setEditFormOpen(false); setEditSuccess(false) }, 1500)
    } catch {
      setEditError('Erreur réseau.')
    }
  }

  return (
    <div className="relative bg-brand-card border border-brand-border rounded-2xl p-12 flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-[#49C7FF] text-base mb-5 text-center">
          Informations personnelle
        </h2>
        <dl className="space-y-2 text-base">
          {[
            { label: 'Nom', value: user.lastName },
            { label: 'Prénom', value: user.firstName },
            { label: 'Pseudo', value: user.username },
            { label: 'Adresse mail', value: user.email },
            { label: 'Date de naissance', value: (() => { const d = user.birthDate?.split('T')[0]?.split('-'); return d?.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : '' })() },
            { label: 'Description', value: user.description }
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-2">
              <dt className="text-brand-border">{label}:</dt>
              <dd className="text-brand-text">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Modifier le profil */}
      <div ref={editFormRef} className="relative mt-3">
        <button
          onClick={() => setEditFormOpen((o) => !o)}
          className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
            editFormOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
          }`}
        >
          Modifier le profil
        </button>

        {editFormOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4 z-10">
            <h3 className="font-bold text-[#49C7FF] text-base text-center">
              Modifier le profil
            </h3>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              {[
                { label: 'Nom', value: lastName, setter: setLastName },
                { label: 'Prénom', value: firstName, setter: setFirstName },
                { label: 'Pseudo', value: pseudo, setter: setPseudo },
              ].map(({ label, value, setter }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-brand-border text-sm">{label} :</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <label className="text-brand-border text-sm">À propos :</label>
                <textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  rows={3}
                  className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all resize-none"
                />
              </div>

              {editError && <p className="text-red-400 text-sm">{editError}</p>}
              {editSuccess && <p className="text-green-400 text-sm">Profil mis à jour !</p>}

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95"
              >
                Enregistrer
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modifier le mot de passe */}
      <div ref={pwFormRef} className="relative mt-3">
        <button
          onClick={() => setPwFormOpen((o) => !o)}
          className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
            pwFormOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
          }`}
        >
          Modifier le mot de passe
        </button>

        {pwFormOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4 z-10">
            <h3 className="font-bold text-[#49C7FF] text-base text-center">
              Modifier le mot de passe
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-brand-border text-sm">Ancien mot de passe :</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-brand-border text-sm">Nouveau mot de passe :</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-brand-border text-sm">Confirmez nouveau mot de passe :</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
              />
            </div>

            <button className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95">
              Changer le mot de passe
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
