import { backendProxy } from '@/lib/backendProxy'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> },
) {
  const { id, eventId } = await params
  return backendProxy(`/group-chat/${id}/events/${eventId}`)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> },
) {
  const { id, eventId } = await params
  return backendProxy(`/group-chat/${id}/events/${eventId}`, { method: 'DELETE', noContent: true })
}
