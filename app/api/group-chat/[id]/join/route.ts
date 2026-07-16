import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params
  return backendProxy(`/group-chat/${id}/join`, { method: 'POST', noContent: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  return backendProxy(`/group-chat/${id}/join`, { method: 'DELETE', noContent: true })
}
