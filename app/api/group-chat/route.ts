import { NextRequest } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

export async function GET() {
  return backendProxy('/group-chat')
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return backendProxy('/group-chat', { method: 'POST', body, successStatus: 201 })
}
