import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { BackendError } from '@/app/types/api'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
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
    const res = await fetch(`http://localhost:5090/group-chat/${id}/messages`, {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    // 2. Si le serveur Go renvoie un code d'erreur (4xx ou 5xx)
    if (!res.ok) {
      try {
        // On extrait l'erreur structurée générée côté Go
        const backendError: BackendError = await res.json()
        return NextResponse.json(backendError, { status: res.status })
      } catch {
        // Fallback si Go crash de manière brute (sans JSON valide)
        const fallbackError: BackendError = {
          code: 'INTERNAL',
          message: 'Une erreur imprévue est survenue lors de la récupération des messages du groupe.'
        }
        return NextResponse.json(fallbackError, { status: res.status })
      }
    }

    // 3. Cas nominal : succès complet
    return NextResponse.json(await res.json())

  } catch {
    // 4. Le serveur Go est complètement inaccessible (serveur éteint, crash réseau, etc.)
    const networkError: BackendError = {
      code: 'INTERNAL',
      message: 'Le service de messagerie de groupe est temporairement indisponible.'
    }
    return NextResponse.json(networkError, { status: 503 })
  }
}