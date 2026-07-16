import { NextRequest, NextResponse } from 'next/server'
import { backendProxy } from '@/lib/backendProxy'

export async function GET(request: NextRequest) {
  const withId = request.nextUrl.searchParams.get('with')
  if (!withId) {
    return NextResponse.json({ error: "paramètre 'with' manquant" }, { status: 400 })
  }
  return backendProxy(`/messages?with=${withId}`)
}
