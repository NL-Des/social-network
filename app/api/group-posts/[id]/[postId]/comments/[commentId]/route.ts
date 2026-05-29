import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type Context = { params: Promise<{ id: string; postId: string; commentId: string }> }

export async function DELETE(_req: Request, { params }: Context) {
  const { id, postId, commentId } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL ?? 'http://localhost:5090'}/group-chat/${id}/posts/${postId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: { Cookie: `session_token=${sessionToken.value}` },
      }
    )
    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
