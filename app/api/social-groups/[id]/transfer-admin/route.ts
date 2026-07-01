import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:5090'
type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const token = (await cookies()).get('session_token')
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  try {
    const body = await req.json()
    const res = await fetch(`${BACKEND}/social-groups/${id}/transfer-admin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: `session_token=${token.value}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text.trim() }, { status: res.status })
    }
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
