import { backendProxy } from '@/lib/backendProxy'

type Context = { params: Promise<{ id: string; postId: string }> }

export async function GET(_req: Request, { params }: Context) {
  const { id, postId } = await params
  return backendProxy(`/group-chat/${id}/posts/${postId}`)
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id, postId } = await params
  return backendProxy(`/group-chat/${id}/posts/${postId}`, { method: 'DELETE', noContent: true })
}
