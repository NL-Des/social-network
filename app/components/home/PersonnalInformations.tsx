'use client'

import { useEffect, useRef, useState } from 'react'
import type { UserProfile } from '@/app/profile/actions'

interface PersonnalInformationsProps {
  user: UserProfile
}

export default function PersonnalInformations({ user }: PersonnalInformationsProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
    <div className="relative bg-brand-card border border-brand-border rounded-2xl p-12 flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-[#49C7FF] text-base mb-5 text-center">
          Informations personnelle
        </h2>
        <dl className="space-y-2 text-base">
          {[
            { label: 'Nom', value: user.lastName },
            { label: 'Prénom', value: user.firstName },
            { label: 'Adresse mail', value: user.email },
            { label: 'Date de naissance', value: user.birthDate },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-2">
              <dt className="text-brand-border">{label}:</dt>
              <dd className="text-brand-text">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div ref={formRef} className="relative mt-5">
        <button
          onClick={() => setFormOpen((o) => !o)}
          className={`w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 ${
            formOpen ? 'shadow-[0_0_12px_rgba(73,199,255,0.6)]' : ''
          }`}
        >
          Modifier le mot de passe
        </button>

        {formOpen && (
          <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4">
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