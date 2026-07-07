import { backendProxy } from '@/lib/backendProxy'

export async function GET() {
  return backendProxy('/notifications')
}

export async function DELETE() {
  return backendProxy('/notifications', { method: 'DELETE', noContent: true })
}
