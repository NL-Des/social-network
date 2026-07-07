import { backendProxy } from '@/lib/backendProxy'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params
  return backendProxy(`/group-chat/${id}/members/${userId}`, { method: 'DELETE', noContent: true })
}
