import { NextRequest } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  return backendProxy(id ? `/posts?id=${id}` : '/posts')
}
