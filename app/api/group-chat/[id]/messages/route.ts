import { backendProxy } from '@/lib/backendProxy'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return backendProxy(`/group-chat/${id}/messages`)
}
