import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  try {
    const response = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5090'}/posts/${id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_token=${sessionToken.value}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: errText }, { status: response.status })
    }

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params

  try {
    const response = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5090'}/posts/${id}/like`, {
      method: 'DELETE',
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to unlike post' }, { status: response.status })
    }

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
