import Link from "next/link";
import { ButtonToHome, ButtonToGroups, ButtonToMessages, ButtonToNotifications, ButtonToGoToOneGroupOnTheSideBar, ButtonToOneUserProfilOnTheSideBar, ButtonSearch } from '@/app/components/ui/button'

// Barre d'affichage haute.
export function UpBar() {
  return (
    /* Application du fond global défini dans :root (--background) */
    <div className="w-full min-h-screen p-6 flex flex-col gap-4 bg-background text-foreground">

      {/* Barre Haute : Utilisation de la couleur de carte, de la bordure brand et de l'ombre néon */}
      <div className="flex items-center justify-between bg-brand-card p-4 border-2 border-brand-border rounded-lg shadow-neon">
        
        {/* Partie de gauche. */}
        <div className="flex items-center gap-4 px-4">
          {/* Image du profil avec bordure néon. */}
          <Link href="/profil">
            <div className="w-20 h-20 overflow-hidden rounded-full border-2 border-brand-border cursor-pointer hover:opacity-80 transition-opacity">
              <img
                src="une-image.png"
                alt="Image de profil"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          
          {/* Nom du profil avec la police Retro. */}
          <div className="flex flex-col justify-center gap-1">
            <Link href="/profil">
              <span className="text-brand-text font-retro text-xs cursor-pointer hover:underline transition-all ">
                Nom du profil
              </span>
            </Link>
            <Link href="/profil/listoffollowers">
              <span className="text-brand-text opacity-80 cursor-pointer hover:opacity-100 transition-opacity text-[10px] font-retro">
                127 abonnés
              </span>
            </Link>
          </div>
        </div>

        {/* Partie de droite. */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <ButtonToHome>Accueil</ButtonToHome>
          <ButtonToGroups>Groupes</ButtonToGroups>
          <ButtonToMessages>Messages</ButtonToMessages>
          <ButtonToNotifications>Notifications</ButtonToNotifications>
        </div>
      </div>
    </div>
  );
}

// Barre d'affichage droite.
export function RightBar() {
  // Constantes utilisées pour tester l'interface et faire des exemples.
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

  return (
    <aside className="hidden md:block w-72 bg-brand-card p-5 border-2 border-brand-border rounded-lg shadow-neon">
      {/* Titres avec la police Retro */}
      <h2 className="font-retro text-[10px] text-brand-text mb-6 tracking-widest uppercase">
        Vos Groupes
      </h2>
      
      <div className="flex flex-col gap-3 mb-8">
        {userGroups.length > 0 ? (
          userGroups.slice(0, 5).map((group) => (
            <ButtonToGoToOneGroupOnTheSideBar key={group.id} href={`/groups/${group.id}`}>
              {group.name}
            </ButtonToGoToOneGroupOnTheSideBar>
          ))
        ) : (
          <p className="text-xs font-retro opacity-50 text-brand-text">Vous êtes seul !</p>
        )}
      </div>

      <h2 className="font-retro text-[10px] text-brand-text mb-6 tracking-widest uppercase border-t border-brand-border/30 pt-6">
        Amis Connectés
      </h2>

      <div className="flex flex-col gap-3">
        {userProfils.length > 0 ? (
          userProfils.slice(0, 10).map((profil) => (
            <ButtonToOneUserProfilOnTheSideBar key={profil.id} href={`/groups/${profil.id}`}>
              {profil.name}
            </ButtonToOneUserProfilOnTheSideBar>
          ))
        ) : (
          <p className="text-xs font-retro opacity-50 text-brand-text">Aucun ami !</p>
        )}
      </div>
    </aside>
  );
}

export function LeftBarSearchFilter(){
  // Constantes utilisées pour tester l'interface et faire des exemples.
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
const tags = [
  { id: "1", name: "Parce que je ne vaux rien" },
  { id: "2", name: "Chat va !" },
  { id: "3", name: "Gagnagnagna" },
  { id: "4", name: "6 rue du lotissement de la faim. Je veux du chocolat." },
];
  return(
    <aside className="hidden md:block w-72 bg-brand-card p-5 border-2 border-brand-border rounded-lg shadow-neon">
      <h2 className="font-retro text-[8px] text-brand-text mb-6 tracking-widest uppercase">
        Recherchez des groupes, des amis ou des tags !
      </h2>
        <div className="flex flex-row gap-4">
          <ButtonSearch>Rechercher</ButtonSearch>
        </div>
    </aside>
  )
}