import Link from "next/link";

export default function Home() {
  return(
    /* Arrière fond de la page et sa couleur. */
  <div className="w-full min-h-screen bg-slate-100 p-6 flex flex-col gap-4">

    {/* Barre Haute. */}
    <div className="flex items-center justify-between bg-blue-100 p-2 border-2 border-blue-400 rounded-lg">
      {/* Partie de gauche. */}
      <div className="flex items-center px-4">
        {/* Image du profil. */}
        <Link href="/profil">
          <div className="w-24 h-24 overflow-hidden rounded-full border-2 border-blue-500 cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src="une-image.png"
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
        {/* Nom du profil, cliquable pour être
        redirigé sur la page du profil de l'utilisateur. */}
        <Link href="/profil">
          <span className="text-blue-800 font medium">
            Nom du profil
          </span>
        </Link>
      </div>
      {/* Partie de droite. */}
      <div className="flex flex-row gap-2">
        <div className="bg-blue-500 h-10 w-25 rounded-sm"></div>
        <div className="bg-blue-500 h-10 w-25 rounded-sm"></div>
        <div className="bg-blue-500 h-10 w-25 rounded-sm"></div>
        <div className="bg-blue-500 h-10 w-25 rounded-sm"></div>
      </div>
    </div>
  </div>
  )
}
