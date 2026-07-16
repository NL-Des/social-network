import { NextRequest } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

export async function GET() {
  return backendProxy('/me/profile')
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  return backendProxy('/me/profile', { method: 'PUT', body, noContent: true })
}
