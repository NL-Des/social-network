'use client'

import { useEffect, useRef, useState } from 'react'
import { GroupItem } from '@/app/components/home/LeftSidebarGroups'
import Button from '@/app/components/ui/button'

interface CreateGroupButtonProps {
  onCreated?: () => void
  onEnter?: (id: string) => void
}

function CreateGroupButton({ onCreated, onEnter }: CreateGroupButtonProps) {
  const [formOpen, setFormOpen]       = useState(false)
  const [groupName, setGroupName]     = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
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

  async function handleSubmit() {
    if (!groupName.trim() || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/group-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: groupName.trim(), description: description.trim(), member_ids: [] }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? `Erreur ${res.status}`)
        return
      }

      const data = await res.json()
      setGroupName('')
      setDescription('')
      setFormOpen(false)
      onEnter?.(String(data.id))
    } catch {
      setError('Service indisponible')
    } finally {
      setLoading(false)
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
        Créer un Groupe
      </button>

      {formOpen && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="font-bold text-[#49C7FF] text-base text-center">
            Création du nouveau Groupe
          </h3>

          <div className="flex flex-col gap-1">
            <label className="text-brand-border text-sm">Nom du Groupe :</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-brand-border text-sm">Description du Groupe :</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="bg-white/5 border border-brand-border/40 rounded-xl px-4 py-2 text-brand-text text-sm placeholder:text-brand-text/40 focus:outline-none focus:border-brand-border transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !groupName.trim()}
            className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Création...' : 'Créer le nouveau Groupe'}
          </button>
        </div>
      )}
    </div>
  )
}

interface CenterGroupProps {
  group: GroupItem | null
  isMember?: boolean
  onCreated?: () => void
  onEnter?: (id: string) => void
}

export default function CenterGroup({ group, isMember = false, onCreated, onEnter }: CenterGroupProps) {
  if (!group) {
    return (
      <div className="h-full bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-brand-text font-retro text-sm">Aucun groupe sélectionné.</p>
        </div>
        <CreateGroupButton onCreated={onCreated} onEnter={onEnter} />
      </div>
    )
  }

  return (
    <div className="h-full bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold shrink-0">
            {group.initials}
          </div>
          <div>
            <h3 className="font-retro text-purple-400 text-base">{group.name}</h3>
            <p className="text-brand-text text-xs">{group.membersCount} membres</p>
          </div>
        </div>
        {group.description && (
          <p className="text-brand-text text-lg leading-7 whitespace-pre-line mb-8">
            {group.description}
          </p>
        )}
        <div className="flex flex-col items-center gap-3">
          {isMember ? (
            <Button onClick={() => onEnter?.(group.id)}>Entrer dans le Groupe</Button>
          ) : (
            <Button>Demander l'Accès au Groupe</Button>
          )}
        </div>
      </div>
      <CreateGroupButton onCreated={onCreated} onEnter={onEnter} />
    </div>
  )
}
