import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const RETRIES = 4
const RETRY_DELAY_MS = 400

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const response = await fetch('http://localhost:5090/user/me', {
        headers: { Cookie: `session_token=${sessionToken.value}` },
      })
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: response.status })
      }
      return NextResponse.json(await response.json())
    } catch {
      if (attempt < RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
      }
    }
  }

  return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
}
