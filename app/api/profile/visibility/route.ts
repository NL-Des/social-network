import { backendProxy } from '@/lib/backendProxy'

export async function PATCH(request: Request) {
  const body = await request.json()
  return backendProxy('/me/profile/visibility', { method: 'PATCH', body, noContent: true })
}
