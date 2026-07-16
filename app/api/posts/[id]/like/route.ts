import { NextRequest } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await request.json()
  return backendProxy(`/posts/${id}/like`, { method: 'POST', body, noContent: true })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  return backendProxy(`/posts/${id}/like`, { method: 'DELETE', noContent: true })
}
