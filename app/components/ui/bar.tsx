import Link from "next/link";
import { ButtonToHome, ButtonToGroups, ButtonToMessages, ButtonToNotifications, ButtonToGoToOneGroupOnTheSideBar, ButtonToOneUserProfilOnTheSideBar } from '@/app/components/ui/button'

// Barre d'affichage haute.
export function UpBar() {
  return(
    /* Arrière fond de la page et sa couleur. */
  <div className="w-full min-h-screen p-6 flex flex-col gap-4">

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
            <span className="text-blue-800 font medium cursor-pointer hover:opacity-80 transition-opacity text-sm">
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

// Barre d'affichage droite des groupes et des utilisateurs connectés.
export function RightBar() {
  // Constante de test pour l'affichage des groupes.
  const userGroups = [
    { id: "1", name: "Groupe Alpha" },
    { id: "2", name: "Groupe Beta" },
    { id: "3", name: "Groupe Gamma" },
    { id: "4", name: "Groupe Delta" },
    { id: "5", name: "Groupe Epsilon" },
    { id: "6", name: "Groupe Zeta" },
  ];
    const userProfils = [
    { id: "1", name: "Super Miaou" },
    { id: "2", name: "Ronron" },
    { id: "3", name: "Chat Pitre" },
    { id: "4", name: "Chat l'Heureux" },
    { id: "5", name: "Chat Tôt" },
    { id: "6", name: "Chat Man" },
  ];
  return(
    /* Si on réduit trop la taille de l'écran, alors la barre de droite va disparaître. */
    <aside className="hidden md:block w-64 bg-blue-100 p-4 border-2 border-blue-400 rounded-lg">
      <h2 className="font-bold text-blue-800 mb-4">Vos Groupes</h2>
        {/* Affichage en liste des groupes où est inscrit l'utilisateur. */}
            <div className="p-4 flex flex-wrap gap-2">
              {userGroups.length > 0 ? (
                userGroups.slice(0, 5).map((group) => (
                  <ButtonToGoToOneGroupOnTheSideBar key={group.id} href={`/groups/${group.id}`}>
                    {group.name}
                  </ButtonToGoToOneGroupOnTheSideBar>
                ))
              ) : (
                <p>Vous êtes seul !</p>
              )}
            </div>
      <h2 className="font-bold text-blue-800 mb-4">Vos Amis Connectés</h2>
        {/* Affichage en liste des groupes où est inscrit l'utilisateur. */}
            <div className="p-4 flex flex-wrap gap-2">
              {userProfils.length > 0 ? (
                userProfils.slice(0, 10).map((profils) => (
                  <ButtonToOneUserProfilOnTheSideBar key={profils.id} href={`/groups/${profils.id}`}>
                    {profils.name}
                  </ButtonToOneUserProfilOnTheSideBar>
                ))
              ) : (
                <p>Vous n'avez aucun Amis !</p>
              )}
            </div>
    </aside>
  )
}