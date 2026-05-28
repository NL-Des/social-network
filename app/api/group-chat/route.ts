import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import { BackendError } from '@/app/types/api' // Ajuste le chemin d'import selon ton projet

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
    const res = await fetch('http://localhost:5090/group-chat', {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    // 2. Si le serveur Go renvoie un code d'erreur (4xx ou 5xx)
    if (!res.ok) {
      try {
        const backendError: BackendError = await res.json()
        return NextResponse.json(backendError, { status: res.status })
      } catch {
        // Fallback si Go crash de manière brute (sans JSON valide)
        const fallbackError: BackendError = {
          code: 'INTERNAL',
          message: 'Une erreur imprévue est survenue lors de la récupération du chat de groupe.'
        }
        return NextResponse.json(fallbackError, { status: res.status })
      }
    }

    // 3. Cas nominal : succès complet
    return NextResponse.json(await res.json())

  } catch {
    // 4. Le serveur Go est complètement inaccessible (panne réseau ou serveur éteint)
    const networkError: BackendError = {
      code: 'INTERNAL',
      message: 'Le service de messagerie de groupe est temporairement indisponible.'
    }
    return NextResponse.json(networkError, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json()
    const res = await fetch('http://localhost:5090/group-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_token=${sessionToken.value}`,
      },
      body: JSON.stringify(body),
    })

    // 2. Si le serveur Go renvoie un code d'erreur lors de l'envoi/création
    if (!res.ok) {
      try {
        const backendError: BackendError = await res.json()
        return NextResponse.json(backendError, { status: res.status })
      } catch {
        // Fallback si Go crash de manière brute lors du POST
        const fallbackError: BackendError = {
          code: 'INTERNAL',
          message: "Impossible d'enregistrer le message dans le chat de groupe."
        }
        return NextResponse.json(fallbackError, { status: res.status })
      }
    }

    // 3. Cas nominal : création réussie (201)
    const data = await res.json()
    return NextResponse.json(data, { status: 201 })

  } catch {
    // 4. Le serveur Go est complètement inaccessible
    const networkError: BackendError = {
      code: 'INTERNAL',
      message: "Le service d'envoi est temporairement indisponible."
    }
    return NextResponse.json(networkError, { status: 503 })
  }
}