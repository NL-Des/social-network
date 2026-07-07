import { NextRequest } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return backendProxy(`/group-chat/${id}/posts`)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const formData = await request.formData()
  return backendProxy(`/group-chat/${id}/posts`, { method: 'POST', formData, noContent: true, successStatus: 201 })
}
