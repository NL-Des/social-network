import { backendProxy } from '@/lib/backendProxy'

export async function GET() {
  return backendProxy('/me/follow/requests')
}
