import { NextRequest } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string; postId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id, postId } = await params
  const body = await request.json()
  return backendProxy(`/group-chat/${id}/posts/${postId}/like`, { method: 'POST', body, noContent: true })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id, postId } = await params
  return backendProxy(`/group-chat/${id}/posts/${postId}/like`, { method: 'DELETE', noContent: true })
}
