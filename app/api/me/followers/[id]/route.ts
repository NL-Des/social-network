import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  return backendProxy(`/me/followers/${id}`, { method: 'DELETE', noContent: true })
}
