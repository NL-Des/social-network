'use client'

import { useActionState } from 'react'
import loginAction from './actions'
import Button from '@/app/components/ui/button'
import Link from 'next/link'

export default function LoginForm() {
  // Gestion de l'état de la Server Action et du chargement (isPending)
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <form
      action={formAction}
      className="bg-brand-card w-full max-w-md p-14 rounded-2xl text-center border-1 border-brand-border shadow-neon py-28"
    >
      <div className="space-y-10">
        
        {/* BANDEAU ERREUR UX : S'affiche uniquement en cas de retour négatif du Go */}
        {state?.error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm font-sans animate-fadeIn text-left">
            ⚠ {state.error}
          </div>
        )}

        <div className="border-1 border-brand-border shadow-neon p-5 rounded-2xl">
          <input
            type="email"
            name="email"
            className="bg-black p-3 w-full rounded-full text-brand-text outline-none text-center font-sans"
            placeholder="Email"
            required
            disabled={isPending}
          />
        </div>

        <div className="border-1 border-brand-border shadow-neon p-5 rounded-2xl">
          <input
            type="password"
            name="password"
            className="bg-black p-3 w-full rounded-full text-brand-text outline-none text-center font-sans"
            placeholder="Mot de passe"
            required
            disabled={isPending}
          />
        </div>

        {/* UX INTERACTIVE : Le bouton s'adapte pendant le chargement de l'API */}
        <Button disabled={isPending}>
          {isPending ? 'Connexion en cours...' : 'Connexion'}
        </Button>

        <div>
          <Link
            href="/auth/register"
            className="text-brand-text hover:underline text-sm font-sans block mt-4"
          >
            Pas encore de compte ? S'inscrire
          </Link>
        </div>
      </div>
    </form>
  )
}