import { backendProxy } from '@/lib/backendProxy'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return backendProxy(`/notifications/${id}/read`, { method: 'PATCH', noContent: true })
}
