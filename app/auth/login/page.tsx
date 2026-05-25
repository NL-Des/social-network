import LoginForm from './loginForm'

export default function SignInPage() {
  return (
    <div className="w-full min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-16">
      
      {/* Animation d'introduction gérée côté serveur */}
      <div className="animate-[pulseZoom_3s_ease-in-out_infinite]">
        <h1 className="font-retro text-brand-text text-center text-2xl md:text-4xl mb-8">
          Welcome to our Social Network
        </h1>
      </div>

      {/* Insertion du formulaire client interactif */}
      <LoginForm />

    </div>
  )
}