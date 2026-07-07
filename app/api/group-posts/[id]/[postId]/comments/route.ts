import { backendProxy } from '@/lib/backendProxy'

type Context = { params: Promise<{ id: string; postId: string }> }

export async function GET(_req: Request, { params }: Context) {
  const { id, postId } = await params
  return backendProxy(`/group-chat/${id}/posts/${postId}/comments`)
}

export async function POST(request: Request, { params }: Context) {
  const { id, postId } = await params
  const formData = await request.formData()
  return backendProxy(`/group-chat/${id}/posts/${postId}/comments`, { method: 'POST', formData, noContent: true, successStatus: 201 })
}
