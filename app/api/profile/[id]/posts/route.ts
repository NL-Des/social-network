import { NextRequest } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return backendProxy(`/users/${id}/posts`)
}
