import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  return backendProxy(`/group-chat/${id}/delete`, { method: 'DELETE', noContent: true })
}
