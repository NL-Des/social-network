import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const response = await fetch('http://localhost:5090/user/me', {
    headers: {
      Cookie: `session_token=${sessionToken.value}`,
    },
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json(data)
}
