import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:5090'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  try {
    const res = await fetch(`${BACKEND}/group-chats`, {
      headers: { Cookie: `session_token=${token.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur' }, { status: res.status })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  try {
    const body = await request.json()
    const res = await fetch(`${BACKEND}/group-chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: `session_token=${token.value}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur' }, { status: res.status })
    return NextResponse.json(await res.json(), { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
