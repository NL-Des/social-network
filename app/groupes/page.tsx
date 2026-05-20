'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header, { CurrentUser } from '@/app/components/home/Header'
import RightSidebar, { Group, SidebarUser } from '@/app/components/home/RightSidebar'
import LeftSidebarGroups, { GroupItem } from '@/app/components/home/LeftSidebarGroups'
import CenterGroup from '@/app/components/home/CenterGroup'

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockGroupList: GroupItem[] = [
  { id: '1', name: 'Photo Urbaine', initials: 'PU', membersCount: '890',  description: 'Passionnés de photographie urbaine. Partagez vos clichés de rues, d\'architecture et de vie citadine.' },
  { id: '2', name: 'Dev Frontend',  initials: 'DF', membersCount: '3,4k', description: 'Communauté dédiée au développement frontend : React, Next.js, CSS, performance et accessibilité.' },
  { id: '3', name: 'Design & UX',   initials: 'DU', membersCount: '1,2k', description: 'Échanges autour du design d\'interface, de l\'expérience utilisateur et des outils créatifs.' },
  { id: '4', name: 'Backend Go',    initials: 'BG', membersCount: '214',  description: 'Groupe dédié au langage Go : patterns, performances, APIs et bonnes pratiques.' },
  { id: '5', name: 'Route de test',   initials: 'OS', membersCount: '5,1k', description: 'Contributeurs et défenseurs de l\'open source. Projets, discussions et entraide.' },
]

const mockGroups: Group[] = mockGroupList.map(({ id, name, membersCount }) => ({ id, name, membersCount }))

const mockSidebarUsers: SidebarUser[] = [
  { id: '1', name: 'Audrey D',    initials: 'AD', online: true  },
  { id: '2', name: 'Jade C',      initials: 'JC', online: true  },
  { id: '3', name: 'Mathis P',    initials: 'MP', online: false },
  { id: '4', name: 'Nathan L',    initials: 'NL', online: false },
  { id: '5', name: 'Nathan P',    initials: 'NP', online: false },
  { id: '6', name: 'Valentine L', initials: 'VL', online: false },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GroupesPage() {
  const router = useRouter()
  const [user, setUser]         = useState<CurrentUser | null>(null)
  const [loading, setLoading]   = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeGroup = mockGroupList.find((g) => g.id === activeId) ?? null

  useEffect(() => {
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) { router.replace('/auth/login'); return null }
        return res.json()
      })
      .then((data) => { if (data) setUser(data) })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="bg-background h-screen flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Header user={user} />

      <div className="pt-[104px] flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] gap-4 pt-4">

          {/* Colonne gauche — liste des groupes */}
          <div className="h-full">
            <LeftSidebarGroups
              groups={mockGroupList}
              activeId={activeId}
              // Déviation pour accéder et tester la page inside-groups
              onSelect={(id) => {
                if (id === '5') { router.push('/inside-groups'); return }
                setActiveId(id)
              }}
            />
          </div>

          {/* Colonne centre — contenu du groupe sélectionné */}
          <CenterGroup group={activeGroup} />

          {/* Colonne droite — sidebar */}
          <div className="h-full">
            <RightSidebar groups={mockGroups} users={mockSidebarUsers} />
          </div>

        </div>
      </div>
    </div>
  )
}
