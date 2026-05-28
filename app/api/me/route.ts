import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { BackendError } from '@/app/types/api'

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    const authError: BackendError = {
      code: 'UNAUTHORIZED',
      message: 'Accès refusé : session expirée ou introuvable'
    }
    return NextResponse.json(authError, { status: 401 })
  }

  try {
    const response = await fetch('http://localhost:5090/user/me', {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    // Si le statut n'est pas OK (4xx ou 5xx), on extrait directement l'erreur formatée du Back
    if (!response.ok) {
      try {
        const backendError: BackendError = await response.json()
        return NextResponse.json(backendError, { status: response.status })
      } catch {
        // Fallback au cas où le serveur a renvoyé un crash brut (ex: panic HTML ou texte brut)
        const fallbackError: BackendError = {
          code: 'INTERNAL',
          message: 'Une erreur imprévue est survenue sur le serveur.'
        }
        return NextResponse.json(fallbackError, { status: response.status })
      }
    } 
    
    // Si tout va bien, on renvoie les données
    const data = await response.json()
    return NextResponse.json(data)

  } catch (err) {
    // Le serveur Go est complètement éteint ou inaccessible
    const networkError: BackendError = {
      code: 'INTERNAL',
      message: 'Le service de réseau social est temporairement indisponible.'
    }
    return NextResponse.json(networkError, { status: 503 })
  }
}