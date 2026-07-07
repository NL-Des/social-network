import { backendProxy } from '@/lib/backendProxy'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  return backendProxy(`/group-chat/${id}/leave`, { method: 'DELETE', body, noContent: true })
}
