import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  return backendProxy(`/group-chat/${id}/transfer-admin`, { method: 'PUT', body, noContent: true })
}
