import Link from 'next/link'
export default function SignInPage() {
  return (
    /* AJOUT de bg-background pour avoir le noir pur en fond */
    <div className="w-full min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-16 ">
      <h1 className="font-retro text-brand-text text-center text-2xl md:text-4xl max-w-3xl">
        Welcome to our Social Network
      </h1>

      {/* CORRECTION : bg-brand-card au lieu de bg-color-brand-card 
          CORRECTION : border-brand-border (ou la variable que tu as liée) */}
      <form className="bg-brand-card w-full max-w-md p-14 rounded-2xl text-center border-1 border-brand-border shadow-neon py-28">
        <div className="space-y-10">
          <div className="border-1 border-brand-border shadow-neon p-3 rounded-2xl">
            <input
              type="email"
              className="bg-black p-3 w-full rounded-full text-brand-text outline-none text-center"
              placeholder="Email"
            />
          </div>
          <div className="border-1 border-brand-border shadow-neon p-3 rounded-2xl">
            <input
              type="password"
              className="bg-black  p-3 w-full rounded-full text-brand-text outline-none  text-center"
              placeholder="Mot de passe"
            />
          </div>
          <button className="bg-brand-card text-brand-text font-bold p-3 w-2/3 border-1 border-brand-border shadow-neon rounded-2xl hover:text-white transition-transform duration-200 hover:scale-102 active:scale-95">
            Connexion
          </button>
          <div>
            <Link
              href="/register"
              className="text-brand-text hover:text-white "
            >
              Vous n'avez pas de compte ?
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
