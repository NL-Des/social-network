import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { BackendError } from '@/app/types/api'

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  // 1. Erreur d'authentification locale au BFF Next.js (Cookie absent)
  if (!sessionToken) {
    const authError: BackendError = {
      code: 'UNAUTHORIZED',
      message: 'Accès refusé : session expirée ou introuvable'
    }
    return NextResponse.json(authError, { status: 401 })
  }

  // 2. Cas nominal : succès
  return NextResponse.json({ token: sessionToken.value })
}