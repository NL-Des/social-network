import { NextRequest } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

export async function PUT(request: NextRequest) {
  const formData = await request.formData()
  return backendProxy('/me/profile/avatar', { method: 'PUT', formData })
}
