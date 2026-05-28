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

  try {
    const response = await fetch('http://localhost:5090/users', {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    // 2. Si le serveur Go renvoie un code d'erreur (4xx ou 5xx)
    if (!response.ok) {
      try {
        // On extrait l'erreur structurée générée côté Go (ex: CodeUnauthorized)
        const backendError: BackendError = await response.json()
        return NextResponse.json(backendError, { status: response.status })
      } catch {
        // Fallback si Go a renvoyé un crash brut ou une erreur brute non enveloppée en JSON
        const fallbackError: BackendError = {
          code: 'INTERNAL',
          message: 'Une erreur imprévue est survenue lors de la récupération de la liste des utilisateurs.'
        }
        return NextResponse.json(fallbackError, { status: response.status })
      }
    }

    // 3. Cas nominal : succès complet
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    // 4. Le serveur Go est complètement inaccessible (serveur éteint, crash réseau, etc.)
    const networkError: BackendError = {
      code: 'INTERNAL',
      message: 'Le service de gestion des utilisateurs est temporairement indisponible.'
    }
    return NextResponse.json(networkError, { status: 503 })
  }
}