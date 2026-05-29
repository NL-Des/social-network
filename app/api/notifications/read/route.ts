import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const res = await fetch('http://localhost:5090/notifications/read', {
      method: 'PATCH',
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
