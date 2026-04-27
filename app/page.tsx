import Link from "next/link";
import { ButtonToHome, ButtonToGroups, ButtonToMessages, ButtonToNotifications } from '@/app/components/ui/button'

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
              alt="Image de profil" /* C'est ce que verra l'utilisateur si il y a une erreur d'affichage de l'image du profil */
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
        {/* Nom du profil, cliquable pour être
        redirigé sur la page du profil de l'utilisateur. */}
        <div className="flex flex-col justify-center">
        <Link href="/profil">
            <span className="text-blue-800 font medium cursor-pointer hover:opacity-80 transition-opacity">
              Nom du profil
            </span>
          </Link>
          <Link href="/profil/listoffollowers">
            <span className="text-blue-800 font medium cursor-pointer hover:opacity-80 transition-opacity">
              127 abonnés
            </span>
          </Link>
        </div>
      </div>
      {/* Partie de droite. */}
      <div className="flex flex-row gap-2">
        <div>
          <ButtonToHome>Accueil</ButtonToHome>
        </div>
        <div>
          <ButtonToGroups>Groupes</ButtonToGroups>
        </div>
        <div>
          <ButtonToMessages>Messages</ButtonToMessages>
        </div>
        <div>
          <ButtonToNotifications>Notifications</ButtonToNotifications>
        </div>
       </div>
    </div>
  </div>
  )
}
