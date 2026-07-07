import { backendProxy } from '@/lib/backendProxy'

export async function GET() {
  return backendProxy('/users')
}
