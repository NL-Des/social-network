import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  return backendProxy(`/chat-groups/${id}/members`)
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  return backendProxy(`/chat-groups/${id}/members`, { method: 'POST', body, noContent: true })
}
