'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header, { CurrentUser } from '@/app/components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import RightSidebar, { Group } from '@/app/components/home/RightSidebar'
import LeftSidebar, { Conversation, GroupConversation } from '@/app/components/home/LeftSidebar'
import Messages, { Message, ChatConversation } from '@/app/components/home/Messages'
import GroupMessages, { GroupMessage, GroupChat } from '@/app/components/home/GroupMessages'
import { useGroupStatuses } from '@/lib/useGroupStatuses'
import { useOnlineStatus } from '@/lib/useOnlineStatus'
import { BackendError } from '@/app/types/api'
import ErrorBanner from '@/app/components/ui/errorBanner'

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890'  },
  { id: '2', name: 'Dev Frontend',  membersCount: '3,4k' },
  { id: '3', name: 'Design & UX',   membersCount: '1,2k' },
]

interface ApiMessage {
  id: number
  sender_id: number
  receiver_id: number
  body: string
  sent_at: string
}

interface ApiGroupMessage {
  id: number
  group_id: number
  sender_id: number
  body: string
  sent_at: string
}

interface ApiConversation {
  id: number
  name: string
  initials: string
}

interface ApiGroupInfo {
  id: number
  title: string
  initials: string
  member_ids: number[]
}

export default function MessagesPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser]                       = useState<CurrentUser | null>(null)
  const [userId, setUserId]                   = useState<string | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [conversations, setConversations]     = useState<Conversation[]>([])
  const [allUsers, setAllUsers]               = useState<Conversation[]>([])
  const [groups, setGroups]                   = useState<GroupConversation[]>([])
  const [activeId, setActiveId]               = useState<string | null>(searchParams.get('with'))
  const [activeGroupId, setActiveGroupId]     = useState<string | null>(null)
  const [messages, setMessages]               = useState<Message[]>([])
  const [groupMessages, setGroupMessages]     = useState<GroupMessage[]>([])
  
  // État ajouté pour la gestion centralisée des bannières d'erreur
  const [globalError, setGlobalError]         = useState<BackendError | null>(null)

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (!data) { router.replace('/auth/login'); return }
        setUser(data)
      })
      .catch((err) => {
        if (err?.code === 'UNAUTHORIZED') {
          router.replace('/auth/login')
        } else {
          setGlobalError({
            code: err?.code ?? 'INTERNAL',
            message: err?.message ?? 'Session expirée ou introuvable.'
          })
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  // Tous les utilisateurs (pour afficher n'importe quelle conv)
  useEffect(() => {
    fetch('/api/users')
      .then(async (res) => {
        if (!res.ok) {
          try {
            const err: BackendError = await res.json()
            setGlobalError(err)
          } catch {
            setGlobalError({ code: 'INTERNAL', message: 'Impossible de récupérer les utilisateurs.' })
          }
          return []
        }
        return res.json()
      })
      .then((data: { id: number; name: string; initials: string }[]) => {
        setAllUsers(data.map((u) => ({
          id:       String(u.id),
          name:     u.name,
          initials: u.initials,
          online:   false,
        })))
      })
      .catch(() => {
        setGlobalError({ code: 'INTERNAL', message: 'Le service de gestion des utilisateurs est indisponible.' })
      })
  }, [])

  const loadGroups = useCallback(() => {
    fetch('/api/group-chat')
      .then(async (res) => {
        if (!res.ok) {
          try {
            const err: BackendError = await res.json()
            setGlobalError(err)
          } catch {
            setGlobalError({ code: 'INTERNAL', message: 'Impossible de charger les salons de discussion.' })
          }
          return []
        }
        return res.json()
      })
      .then((data: ApiGroupInfo[]) => {
        setGroups(data.map((g) => ({
          id:        String(g.id),
          title:     g.title,
          initials:  g.initials,
          memberIds: (g.member_ids ?? []).map(String),
        })))
      })
      .catch(() => {
        setGlobalError({ code: 'INTERNAL', message: 'Le service de salons de discussion est indisponible.' })
      })
  }, [])

  useEffect(() => {
    fetch('/api/conversations')
      .then(async (res) => {
        if (!res.ok) {
          try {
            const err: BackendError = await res.json()
            setGlobalError(err)
          } catch {
            setGlobalError({ code: 'INTERNAL', message: 'Impossible de charger la liste des conversations.' })
          }
          return []
        }
        return res.json()
      })
      .then((data: ApiConversation[]) => {
        const convs: Conversation[] = data.map((c) => ({
          id:       String(c.id),
          name:     c.name,
          initials: c.initials,
          online:   false,
        }))
        setConversations(convs)
        if (convs.length > 0 && activeId === null) {
          setActiveId(convs[0].id)
        }
      })
      .catch(() => {
        setGlobalError({ code: 'INTERNAL', message: 'Impossible de joindre le service de messagerie.' })
      })
  }, [activeId])

  useEffect(() => { loadGroups() }, [loadGroups])

  // Sync activeId depuis le param URL (navigation depuis la RightSidebar)
  useEffect(() => {
    const withParam = searchParams.get('with')
    if (withParam) {
      setActiveId(withParam)
      setActiveGroupId(null)
    }
  }, [searchParams])

  const fetchMessages = useCallback((partnerId: string) => {
    const partner = conversations.find((c) => c.id === partnerId)
                 ?? allUsers.find((u) => u.id === partnerId)
    fetch(`/api/messages?with=${partnerId}`)
      .then(async (res) => {
        if (!res.ok) {
          try {
            const err: BackendError = await res.json()
            setGlobalError(err)
          } catch {
            setGlobalError({ code: 'INTERNAL', message: 'Erreur lors du chargement des messages privés.' })
          }
          return []
        }
        return res.json()
      })
      .then((data: ApiMessage[]) => {
        setMessages(data.map((m) => ({
          id:         String(m.id),
          from:       String(m.sender_id) === partnerId ? 'them' : 'me',
          senderName: String(m.sender_id) === partnerId ? (partner?.name ?? '') : 'Moi',
          text:       m.body,
          date:       new Date(m.sent_at).toLocaleDateString('fr-FR'),
        })))
      })
      .catch(() => {
        setGlobalError({ code: 'INTERNAL', message: 'La récupération de vos messages a échoué en raison d’un problème réseau.' })
      })
  }, [conversations, allUsers])

  const fetchGroupMessages = useCallback((groupId: string) => {
    fetch(`/api/group-chat/${groupId}/messages`)
      .then(async (res) => {
        if (!res.ok) {
          try {
            const err: BackendError = await res.json()
            setGlobalError(err)
          } catch {
            setGlobalError({ code: 'INTERNAL', message: 'Erreur lors du chargement des messages du groupe.' })
          }
          return []
        }
        return res.json()
      })
      .then((data: ApiGroupMessage[]) => {
        setGroupMessages(data.map((m) => ({
          id:         String(m.id),
          senderName: String(m.sender_id) === userId
            ? 'Moi'
            : (allUsers.find((u) => u.id === String(m.sender_id))?.name ?? String(m.sender_id)),
          senderId:   String(m.sender_id),
          text:       m.body,
          date:       new Date(m.sent_at).toLocaleDateString('fr-FR'),
        })))
      })
      .catch(() => {
        setGlobalError({ code: 'INTERNAL', message: 'La récupération des messages de groupe a échoué.' })
      })
  }, [userId, allUsers])

  useEffect(() => {
    if (activeId) fetchMessages(activeId)
  }, [activeId, fetchMessages])

  useEffect(() => {
    if (activeGroupId) fetchGroupMessages(activeGroupId)
  }, [activeGroupId, fetchGroupMessages])

  // Récupère l'id numérique de l'utilisateur courant depuis /api/users et /api/me combinés
  useEffect(() => {
    if (!user || allUsers.length === 0) return
    const found = allUsers.find((u) => u.name === user.name)
    if (found) setUserId(found.id)
  }, [user, allUsers])

  const { onlineUsers } = useOnlineStatus()
  const groupStatuses   = useGroupStatuses(groups, activeGroupId, onlineUsers)

  if (loading) {
    return (
      <div className="bg-background h-screen flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  const activeConversation: ChatConversation | null = activeId
    ? (conversations.find((c) => c.id === activeId) ?? allUsers.find((u) => u.id === activeId) ?? null)
    : null

  const activeGroup: GroupChat | null = activeGroupId
    ? (groups.find((g) => g.id === activeGroupId) ?? null)
    : null

  function handleSelectDm(id: string) {
    setActiveId(id)
    setActiveGroupId(null)
  }

  function handleSelectGroup(id: string) {
    setActiveGroupId(id)
    setActiveId(null)
  }

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      {/* Insertion de la bannière d'erreur adaptative */}
      {globalError && (
        <ErrorBanner 
          message={globalError.message}
          type={globalError.code === 'INVALID_INPUT' ? 'warning' : 'critical'}
          onClose={() => setGlobalError(null)}
        />
      )}

      <Header user={user} />

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="h-full grid grid-cols-[280px_1fr_264px] grid-rows-1 gap-4 pt-4">

          <div className="h-full">
            <LeftSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectDm}
              groups={groups}
              activeGroupId={activeGroupId}
              onSelectGroup={handleSelectGroup}
              onGroupCreated={loadGroups}
              onGroupLeft={loadGroups}
              groupStatuses={groupStatuses}
              allUsers={allUsers}
            />
          </div>

          <div className="h-full">
            {activeGroup ? (
              <GroupMessages
                key={activeGroup.id}
                group={activeGroup}
                currentUserId={userId ?? ''}
                initialMessages={groupMessages}
              />
            ) : activeConversation ? (
              <Messages
                key={activeConversation.id}
                conversation={activeConversation}
                initialMessages={messages}
              />
            ) : (
              <div className="h-full bg-brand-card border border-brand-border rounded-2xl flex items-center justify-center">
                <p className="text-brand-text/50 text-sm">Sélectionnez une conversation</p>
              </div>
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