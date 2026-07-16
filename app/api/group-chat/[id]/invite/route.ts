import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string }> }

export async function PUT(_req: Request, { params }: Params) {
  const { id } = await params
  return backendProxy(`/group-chat/${id}/invite`, { method: 'PUT', noContent: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  return backendProxy(`/group-chat/${id}/invite`, { method: 'DELETE', noContent: true })
}
