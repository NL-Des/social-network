import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  const url = id
    ? `http://localhost:5090/posts?id=${id}`
    : 'http://localhost:5090/posts'

  try {
    const response = await fetch(url, {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
