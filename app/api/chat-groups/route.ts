import { NextRequest } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

export async function GET() {
  return backendProxy('/chat-groups')
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return backendProxy('/chat-groups', { method: 'POST', body, successStatus: 201 })
}
