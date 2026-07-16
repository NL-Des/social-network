import { backendProxy } from '@/lib/backendProxy'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return backendProxy(`/users/${id}/profile`)
}
