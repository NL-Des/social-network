import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type Context = { params: Promise<{ id: string; postId: string }> }

export async function GET(_req: Request, { params }: Context) {
  const { id, postId } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const res = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5090'}/group-chat/${id}/posts/${postId}/comments`, {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function POST(request: Request, { params }: Context) {
  const { id, postId } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const body = await request.json()
    const res = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5090'}/group-chat/${id}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_token=${sessionToken.value}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })
    return new NextResponse(null, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
