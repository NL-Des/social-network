import { backendProxy } from '@/lib/backendProxy'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return backendProxy(`/notifications/${id}`, { method: 'DELETE', noContent: true })
}
