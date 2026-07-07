import { backendProxy } from '@/lib/backendProxy'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> },
) {
  const { id, eventId } = await params
  const body = await request.json()
  return backendProxy(`/group-chat/${id}/events/${eventId}/respond`, { method: 'POST', body, noContent: true })
}
