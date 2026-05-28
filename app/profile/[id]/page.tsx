'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header, { CurrentUser } from '@/app/components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import RightSidebar, { Group } from '@/app/components/home/RightSidebar'

interface UserProfile {
  id: number
  name: string
  initials: string
}

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890'  },
  { id: '2', name: 'Dev Frontend',  membersCount: '3,4k' },
  { id: '3', name: 'Design & UX',   membersCount: '1,2k' },
]

export default function UserProfilePage() {
  const router   = useRouter()
  const { id }   = useParams<{ id: string }>()

  const [me, setMe]           = useState<CurrentUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (!data) { router.replace('/auth/login'); return }
        setMe(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    if (!id) return
    fetch('/api/users')
      .then((res) => res.ok ? res.json() : [])
      .then((data: UserProfile[]) => {
        const found = data.find((u) => String(u.id) === id)
        if (found) setProfile(found)
      })
      .catch(() => {})
  }, [id])

  if (loading) {
    return (
      <div className="bg-background h-screen flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm">Chargement...</p>
      </div>
    )
  }

  if (!me) return null

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Header user={me} />

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[1fr_264px] gap-4 pt-4">

          <div className="h-full bg-brand-card border border-brand-border rounded-2xl p-8 flex flex-col items-center gap-6">
            {profile ? (
              <>
                <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center shadow-neon ring-4 ring-brand-border/30">
                  <span className="text-3xl font-extrabold text-white">{profile.initials}</span>
                </div>

                <h1 className="text-white text-2xl font-bold">{profile.name}</h1>

                <Link
                  href={`/messages?with=${id}`}
                  className="px-8 py-2 rounded-xl border border-brand-border text-white text-base shadow-neon hover:scale-105 transition-all duration-200"
                >
                  Envoyer un message
                </Link>
              </>
            ) : (
              <p className="text-brand-text/50 text-sm">Utilisateur introuvable</p>
            )}
          </div>

          <div className="h-full">
            <RightSidebar groups={mockGroups} />
          </div>

        </div>
      </div>
    </div>
  )
}
