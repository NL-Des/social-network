import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import { BackendError } from '@/app/types/api'

export async function GET(request: NextRequest) {
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

  // 2. Erreur locale de validation du paramètre de requête 'with' manquant
  const withId = request.nextUrl.searchParams.get('with')
  if (!withId) {
    const inputError: BackendError = {
      code: 'INVALID_INPUT',
      message: "Paramètre 'with' manquant"
    }
    return NextResponse.json(inputError, { status: 400 })
  }

  try {
    const response = await fetch(`http://localhost:5090/messages?with=${withId}`, {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    // 3. Si le serveur Go renvoie un code d'erreur (4xx ou 5xx)
    if (!response.ok) {
      try {
        // On extrait l'erreur structurée générée côté Go (ex: CodeInvalidInput pour un ID non numérique)
        const backendError: BackendError = await response.json()
        return NextResponse.json(backendError, { status: response.status })
      } catch {
        // Fallback si Go crash de manière brute (sans JSON valide)
        const fallbackError: BackendError = {
          code: 'INTERNAL',
          message: 'Une erreur imprévue est survenue lors de la récupération de la conversation.'
        }
        return NextResponse.json(fallbackError, { status: response.status })
      }
    }

    // 4. Cas nominal : succès complet
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    // 5. Le serveur Go est complètement inaccessible (serveur éteint, crash réseau, etc.)
    const networkError: BackendError = {
      code: 'INTERNAL',
      message: 'Le service de messagerie est temporairement indisponible.'
    }
    return NextResponse.json(networkError, { status: 503 })
  }
}