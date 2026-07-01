import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5090'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> },
) {
  const { id, eventId } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const body = await request.json()
    const res = await fetch(`${BACKEND_URL}/social-groups/${id}/events/${eventId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_token=${sessionToken.value}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
