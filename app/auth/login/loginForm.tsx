'use client'

import { useActionState } from 'react'
import loginAction from './actions'
import Button from '@/app/components/ui/button'
import Link from 'next/link'
import ErrorBanner from '@/app/components/ui/errorBanner'

export default function LoginForm() {
  // Gestion de l'état de la Server Action et du chargement (isPending)
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <form
      action={formAction}
      className="bg-brand-card w-full max-w-md p-14 rounded-2xl text-center border-1 border-brand-border shadow-neon py-28"
    >
      <div className="space-y-10">
        
        {/* 💡 ÉTAPE 2 : Intégration de l'ErrorBanner unifié en cas d'erreur de connexion */}
        {state?.error && (
          <div className="animate-fadeIn text-left">
            <ErrorBanner 
              message={state.error} 
              type="critical" 
              position="relative" 
            />
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
            className="text-xs text-brand-text/60 hover:text-brand-text transition-colors mt-2 block"
          >
            Pas encore de compte ? S'inscrire
          </Link>
        </div>
      </div>
    </form>
  )
}