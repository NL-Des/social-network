import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string; userId: string }> }

export async function PUT(_req: Request, { params }: Params) {
  const { id, userId } = await params
  return backendProxy(`/group-chat/${id}/join-requests/${userId}`, { method: 'PUT', noContent: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id, userId } = await params
  return backendProxy(`/group-chat/${id}/join-requests/${userId}`, { method: 'DELETE', noContent: true })
}
