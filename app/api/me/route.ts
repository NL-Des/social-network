import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const response = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5090'}/me/profile`, {
    headers: { Cookie: `session_token=${sessionToken.value}` },
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: response.status })
  }

  const data = await response.json()

  return NextResponse.json({
    id: String(data.id ?? ''),
    name: `${data.firstName ?? ''} ${data.lastName?.[0] ?? ''}.`.trim(),
    username: data.pseudo ?? '',
    followers: data.followers?.length ?? 0,
    initials: `${data.firstName?.[0] ?? ''}${data.lastName?.[0] ?? ''}`.toUpperCase(),
    avatar: data.avatar?.startsWith('/') || data.avatar?.startsWith('http') ? data.avatar : undefined,
  })
}
