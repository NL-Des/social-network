import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:5090'

async function getSession() {
  const cookieStore = await cookies()
  return cookieStore.get('session_token')
}

export async function GET() {
  const sessionToken = await getSession()
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const res = await fetch(`${BACKEND}/notifications`, {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function DELETE() {
  const sessionToken = await getSession()
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const res = await fetch(`${BACKEND}/notifications`, {
      method: 'DELETE',
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
