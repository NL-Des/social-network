import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  return backendProxy(`/users/${id}/follow`, { method: 'POST', noContent: true })
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  return backendProxy(`/users/${id}/follow`, { method: 'DELETE', noContent: true })
}
