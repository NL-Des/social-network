'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import loginAction from './actions'
import Button from '@/app/components/ui/button'

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="w-full min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-16">
      <div className="animate-[pulseZoom_3s_ease-in-out_infinite]">
        <h1 className="font-retro text-brand-text text-center text-2xl md:text-4xl mb-8">
          Welcome to our Social Network
        </h1>
      </div>
      <form
        action={formAction}
        className="bg-brand-card w-full max-w-md p-14 rounded-2xl text-center border-1 border-brand-border shadow-neon py-28"
      >
        <div className="space-y-10">
          {state?.error && (
            <p className="text-red-400 text-sm">{state.error}</p>
          )}

          <div className="border-1 border-brand-border shadow-neon p-5 rounded-2xl">
            <input
              type="email"
              name="email"
              className="bg-black p-3 w-full rounded-full text-brand-text outline-none text-center"
              placeholder="Email"
              required
            />
          </div>
          <div className="border-1 border-brand-border shadow-neon p-5 rounded-2xl">
            <input
              type="password"
              name="password"
              className="bg-black p-3 w-full rounded-full text-brand-text outline-none text-center"
              placeholder="Mot de passe"
              required
            />
          </div>

          <Button disabled={pending}>
            {pending ? 'Connexion...' : 'Connexion'}
          </Button>
          <div>
            <Link href="/auth/register" className="text-brand-text hover:text-white">
              Vous n&apos;avez pas de compte ?
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
