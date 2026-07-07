import { backendProxy } from '@/lib/backendProxy'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return backendProxy(`/group-chat/${id}/events`)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()
  return backendProxy(`/group-chat/${id}/events`, { method: 'POST', body, successStatus: 201 })
}
