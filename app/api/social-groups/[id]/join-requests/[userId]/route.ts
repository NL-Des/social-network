import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:5090'

type Params = { params: Promise<{ id: string; userId: string }> }

export async function PUT(_req: Request, { params }: Params) {
  const { id, userId } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const res = await fetch(`${BACKEND}/social-groups/${id}/join-requests/${userId}`, {
      method: 'PUT',
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur' }, { status: res.status })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id, userId } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const res = await fetch(`${BACKEND}/social-groups/${id}/join-requests/${userId}`, {
      method: 'DELETE',
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur' }, { status: res.status })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
