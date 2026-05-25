'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { BackendError } from '@/app/types/api'

export default async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const response = await fetch('http://localhost:5090/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData: BackendError = await response.json()
      return { success: false, error: errorData.message }
    }

    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      const match = setCookieHeader.match(/session_token=([^;]+)/)
      if (match) {
        const cookieStore = await cookies()
        cookieStore.set('session_token', match[1], {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24,
        })
      }
    }
  } catch (err) {
    // Cas où le serveur Go est complètement éteint (Erreur réseau réseau brute)
    return { success: false, error: "Impossible de joindre le serveur. Veuillez réessayer plus tard." }
  }

  redirect('/')
}
