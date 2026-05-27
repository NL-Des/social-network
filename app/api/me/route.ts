import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'Accès refusé : session expirée ou introuvable' }, { status: 401 })
  }

  try {
    const response = await fetch('http://localhost:5090/user/me', {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

<<<<<<< HEAD
  if (response.status === 401) {
      return NextResponse.json({ error: 'Session expirée, veuillez vous reconnecter' }, { status: 401 })
    }

  if (response.status === 500) {
    return NextResponse.json({ error: 'Le serveur ne fonctionne pas correctement. Réessayez plus tard.' }, { status: 500 })
  }

  if (!response.ok) {
    return NextResponse.json({ error: 'Impossible de charger le profil' }, { status: response.status })
=======
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
>>>>>>> 814e2d98005ee4a92714a7ba0f6e2ea4f43adab0
  }
}
