import { backendProxy } from '@/lib/backendProxy'

type Context = { params: Promise<{ id: string; postId: string; commentId: string }> }

export async function DELETE(_req: Request, { params }: Context) {
  const { id, postId, commentId } = await params
  return backendProxy(`/group-chat/${id}/posts/${postId}/comments/${commentId}`, { method: 'DELETE', noContent: true })
}
