'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (sessionToken) {
    await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:5090'}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })
    cookieStore.delete('session_token')
  }

  redirect('/auth/login')
}
