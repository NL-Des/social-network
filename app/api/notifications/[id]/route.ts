import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL ?? 'http://localhost:5090'}/notifications/${id}`,
      {
        method: 'DELETE',
        headers: { Cookie: `session_token=${sessionToken.value}` },
      },
    )
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
