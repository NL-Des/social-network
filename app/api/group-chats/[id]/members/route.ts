import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:5090'
type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const token = (await cookies()).get('session_token')
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  try {
    const res = await fetch(`${BACKEND}/group-chats/${id}/members`, {
      headers: { Cookie: `session_token=${token.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur' }, { status: res.status })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const token = (await cookies()).get('session_token')
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  try {
    const body = await req.json()
    const res = await fetch(`${BACKEND}/group-chats/${id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: `session_token=${token.value}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur' }, { status: res.status })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
