import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const res = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5090'}/social-groups/${id}/members`, {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur' }, { status: res.status })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const res = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5090'}/social-groups/${id}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_token=${sessionToken.value}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur' }, { status: res.status })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
