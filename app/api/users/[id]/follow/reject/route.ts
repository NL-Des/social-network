import { backendProxy } from '@/lib/backendProxy'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return backendProxy(`/users/${id}/follow/reject`, { method: 'DELETE', noContent: true })
}
