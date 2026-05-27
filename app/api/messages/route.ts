import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const withId = request.nextUrl.searchParams.get('with')
  if (!withId) {
    return NextResponse.json({ error: "paramètre 'with' manquant" }, { status: 400 })
  }

  try {
    const response = await fetch(`http://localhost:5090/messages?with=${withId}`, {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
