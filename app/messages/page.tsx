'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header, { CurrentUser } from '@/app/components/home/Header'
import { fetchMe } from '@/lib/fetchMe'
import RightSidebar from '@/app/components/home/RightSidebar'
import LeftSidebar, { Conversation, GroupConversation } from '@/app/components/home/LeftSidebar'
import Messages, { Message, ChatConversation } from '@/app/components/home/Messages'
import GroupMessages, { GroupMessage, GroupChat } from '@/app/components/home/GroupMessages'
import { useGroupStatuses } from '@/lib/useGroupStatuses'
import { useOnlineStatus } from '@/lib/useOnlineStatus'
import { useWebSocket } from '@/lib/useWebSocket'

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
  creator_id?: number
}

function MessagesContent() {
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
  const [wsUrl, setWsUrl]                     = useState<string | null>(null)
  const [membersRevision, setMembersRevision] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/ws-token')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.token) setWsUrl(`${process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:5090/ws'}?token=${data.token}`) })
      .catch(() => {})
  }, [])

  const loadGroups = useCallback(() => {
    fetch('/api/chat-groups')
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiGroupInfo[]) => {
        setGroups(data.map((g) => ({
          id:        String(g.id),
          title:     g.title,
          initials:  g.initials,
          memberIds: [],
          creatorId: '',
        })))
      })
      .catch(() => {})
  }, [])

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type?: string; data?: { group_id?: number } }
    if (msg.type === 'group_member_added') {
      loadGroups()
      const groupId = String(msg.data?.group_id ?? '')
      if (groupId) {
        setMembersRevision((prev) => ({ ...prev, [groupId]: (prev[groupId] ?? 0) + 1 }))
      }
    }
  }, [loadGroups])

  useWebSocket(wsUrl, handleWsMessage)

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (!data) { router.replace('/auth/login'); return }
        setUser(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  // Tous les utilisateurs (pour afficher n'importe quelle conv)
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.ok ? res.json() : [])
      .then((data: { id: number; name: string; initials: string }[]) => {
        setAllUsers(data.map((u) => ({
          id:       String(u.id),
          name:     u.name,
          initials: u.initials,
          online:   false,
        })))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/conversations')
      .then((res) => res.ok ? res.json() : [])
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
      .catch(() => {})
  }, [])

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
      .then((res) => res.ok ? res.json() : [])
      .then((data: ApiMessage[]) => {
        setMessages(data.map((m) => ({
          id:         String(m.id),
          from:       String(m.sender_id) === partnerId ? 'them' : 'me',
          senderName: String(m.sender_id) === partnerId ? (partner?.name ?? '') : 'Moi',
          text:       m.body,
          date:       new Date(m.sent_at).toLocaleDateString('fr-FR'),
        })))
      })
      .catch(() => {})
  }, [conversations, allUsers])

  const fetchGroupMessages = useCallback((groupId: string) => {
    fetch(`/api/chat-groups/${groupId}/messages`)
      .then((res) => res.ok ? res.json() : [])
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
      .catch(() => {})
  }, [userId, allUsers])

  useEffect(() => {
    if (activeId) fetchMessages(activeId)
  }, [activeId, fetchMessages])

  useEffect(() => {
    if (activeGroupId) fetchGroupMessages(activeGroupId)
  }, [activeGroupId, fetchGroupMessages])

  useEffect(() => {
    if (!user) return
    setUserId(user.id)
  }, [user])

  const { onlineUsers } = useOnlineStatus()
  const groupStatuses   = useGroupStatuses(groups, activeGroupId, onlineUsers)

  const usersMap = Object.fromEntries(allUsers.map((u) => [u.id, u.name]))

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
              currentUserId={userId ?? undefined}
              membersRevision={membersRevision}
            />
          </div>

          <div className="h-full">
            {activeGroup ? (
              <GroupMessages
                key={activeGroup.id}
                group={activeGroup}
                currentUserId={userId ?? ''}
                initialMessages={groupMessages}
                usersMap={usersMap}
              />
            ) : activeConversation ? (
              <Messages
                key={activeConversation.id}
                conversation={activeConversation}
                initialMessages={messages}
                groups={groups}
                isOnline={onlineUsers.has(activeConversation.id)}
              />
            ) : (
              <div className="h-full bg-brand-card border border-brand-border rounded-2xl flex items-center justify-center">
                <p className="text-brand-text/50 text-sm">Sélectionnez une conversation</p>
              </div>
            )}
          </div>

          <div className="h-full">
            <RightSidebar />
          </div>

        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return <Suspense><MessagesContent /></Suspense>
}
