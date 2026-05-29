import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5090'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> },
) {
  const { id, eventId } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const res = await fetch(`${BACKEND_URL}/group-chat/${id}/events/${eventId}`, {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> },
) {
  const { id, eventId } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const res = await fetch(`${BACKEND_URL}/group-chat/${id}/events/${eventId}`, {
      method: 'DELETE',
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
