import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(
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
    const response = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5090'}/users/${id}/posts`, {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch user posts' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
