import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { BackendError } from '@/app/types/api' // Ajuste le chemin d'import selon ton projet

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  // 1. Gestion de l'erreur d'authentification locale au BFF Next.js
  if (!sessionToken) {
    const authError: BackendError = {
      code: 'UNAUTHORIZED',
      message: 'Accès refusé : session expirée ou introuvable'
    }
    return NextResponse.json(authError, { status: 401 })
  }

  try {
    const response = await fetch('http://localhost:5090/conversations', {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    // 2. Si le serveur Go renvoie un code d'erreur (4xx ou 5xx)
    if (!response.ok) {
      try {
        // On récupère l'erreur structurée (AppError) directement du Back
        const backendError: BackendError = await response.json()
        return NextResponse.json(backendError, { status: response.status })
      } catch {
        // Fallback si Go a crashé de manière brute (sans JSON valide, ex: panic ou log brut)
        const fallbackError: BackendError = {
          code: 'INTERNAL',
          message: 'Une erreur imprévue est survenue lors de la récupération des conversations.'
        }
        return NextResponse.json(fallbackError, { status: response.status })
      }
    }

    // 3. Cas nominal : succès complet
    const data = await response.json()
    return NextResponse.json(data)

  } catch {
    // 4. Le serveur Go est complètement injoignable (éteint, crash réseau, etc.)
    const networkError: BackendError = {
      code: 'INTERNAL',
      message: 'Le service de messagerie est temporairement indisponible.'
    }
    return NextResponse.json(networkError, { status: 503 })
  }
}