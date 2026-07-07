import { backendProxy } from '@/lib/backendProxy'

export async function PUT() {
  return backendProxy('/notifications/read', { method: 'PUT', noContent: true })
}
