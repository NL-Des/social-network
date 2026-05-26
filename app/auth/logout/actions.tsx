'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')

  // Si pas de cookie, on redirige direct comme avant
  if (!sessionToken) {
    redirect('/auth/login')
  }

  try {
    const response = await fetch('http://localhost:5090/auth/logout', {
      method: 'POST',
      headers: { Cookie: `session_token=${sessionToken.value}` },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      // Au lieu de crash, on retourne gentiment l'erreur
      return {
        success: false,
        message: errorData.message || "Le serveur n'a pas pu valider la déconnexion.",
      }
    }
  } catch (err) {
    // Si le Go est éteint, on ne bloque pas l'application
    return {
      success: false,
      message: "Impossible de joindre le serveur visuel.",
    }
  }

  // LE FLUX NORMAL : Si tout va bien, rien ne change
  cookieStore.delete('session_token')
  redirect('/auth/login')
}

// On ajoute ça à côté, ça ne touche pas au reste de ton code
export async function forceLocalLogoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('session_token')
  redirect('/auth/login')
}