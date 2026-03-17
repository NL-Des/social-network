# Codification :
- **un bouton sur lequel cliquer**
- un objet, un lien, un champs de texte,...
    * Si on clic dessus ou que l'on intéragie avec, que ce passe-t-il ?

- Utilisateur : le mot Utilisateur désigne le point de vue de la personne qui est connectée.
- Personne : le mot Personne désigne les autres usagers de la plateforme, et permet de ce distinguer de l'Utilisateur.

# Plan de construction de Social Network

## Page de connexion

- Symbole du projet
    * Si non-connecté : le clic ramène sur la page de connexion.
    * Si connecté : le clic amène sur la page du Hub.

- Titre du Projet
- Descriptif du projet

- Des images de l'intérieur du réseau social pour attirer les utilisateurs

- Formulaire de connexion :
    - Email ou Pseudo
        * Si moins de 6 caractères : faire apparaître un message d'erreur.
        * Si il y a un @ sans rien après : faire apparaître un message d'erreur.
    - Mot de passe
        * Si moins de 8 caractères : faire apparaître un message d'erreur.

- **Bouton de connexion**
    * Si les informations de connexion sont bonnes : amène sur le Hub
    * Si les informations de connexions sont fausses :
        * Si le nom de compte n'est pas présent dans la BDD : indique que le compte n'existe pas.
        * Si le mot de passe est faux : indique que le mot de passe est faux.
        * Si le nmo de compte et le mot de passe sont faux : indique que le compte n'existe pas.

- **Bouton d'inscription**
    * Amène l'utilisateur sur la page d'inscription.
    
## Page d'inscription

- Titre du Projet

- Symbole du projet
    * Si non-connecté : le clic ramène sur la page de connexion.
    * Si connecté : le clic amène sur la page du Hub.

- Forumlaire d'inscription :
    - Email
        * Si il n'y a pas le bon format : message d'erreur
    - Mot de Passe
        * Si moins de 8 caractères : faire apparaître un message d'erreur.
    - Nom
    - Prénom
    - Date de naissance
    - Avatar (optionnel)
        * Si ce n'est pas dans les formats autorisés : indiquer la liste des formats autorisés.
        * Si le poids de l'image dépasse le poids limite : indiquer le poids limite autorisé des images pour les avatars.
        * Si le format n'est pas autorisé et que le poids dépasse la limite : indiquer les formats autorisés et le poids maximum. 
    - Pseudo (optionnel)
    - A propos de moi (optionnel)

- **Bouton de validation d'inscription**
    * Si l'email existe déjà dans la base de donnée : indiquer que l'adresse mail existe déjà dans la BDD.
    * Si le Pseudo est déjà pris : indiquer que le Pseudo est déjà pris et qu'il faut en sélectionner un autre.
    * Si dans A propos de moi, il n'y a qu'un ou plusieurs espaces ou tabulations : envoyer un message disant que le champs A propos de moi doit être vide ou doté de texte.

- **Bouton de retour à la page d'accueil**
    * Ramène l'utilisateur sur la page d'accueil.

## Page HUB
C'est ici qu'arrive l'utilisateur lors de la validation de sa connexion.
C'est ici que l'utilisateur va pouvoir avoir accès à toutes les fonctionnalités du Projet.

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Profil**
    * L'utilisateur est amené sur la page Profil

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page du groupe.

- Onglet des notifications
    * Si il y a des notifications : changement d'état pour en avertir l'utilisateur.

- Liste des groupes où l'utilisateur est inscrit.
    * Si il y a un nouveau message : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau post : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau commentaire : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau membre : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouvel événement : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur est le créateur du groupe et qu'il y a une demande d'entrée : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur clic sur un groupe : redirection vers la page du groupe. Il est considéré qu'ici, que l'utilisateur ne peut voir que les groupes où il est inscrit.

- Liste des utilisateurs connectés
    * Si l'utilisateur n'a pas d'historiques de messages : tri dans l'ordre alphabétique.
    * Si l'utilisateur a un historique de messages : tri dans l'ordre du message le plus récent en haut, pour descendre vers les moins récents.
    * Si il y a un nouveau message : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur est abonné à une personne, cette personne sera mise en bleu.
    * Si une personne est abonnée à l'utilisateur, cette personne sera mise en vert.
    * Si l'utilisateur et la personne sont abonnées à l'une et l'autre, alors cette personne sera mise en rouge.
    * Si l'utilisateur clic sur une personne dont il n'est pas abonné et que cette personne n'est pas abonné à lui en retour : un message indique qu'il doit s'abonner à la personne, ou être suivit par cette personne, pour pouvoir parler avec elle.
    * Si l'utilisateur clic sur une personne qui le suit : ouverture du chat de communication avec cette personne.
    * Si l'utilisateur clic sur une personne dont il est abonné : ouverture du chat de communication avec cette personne.

- Liste des posts
    * Affichage dans l'ordre des posts ou des commentaires dernièrement créés (Du haut vers le bas). Les commentaires font remonter les posts où ils sont créés, mais c'est seulement le post qui est affiché ? Faisons-nous un indice pour dire que le post n'est pas nouveau mais qu'il y a un nouveau commentaire ?
    * Si l'utilisateur est le créateur du post : mise en avant par un indice visuel.
    * Si l'utilisateur participe au post avec au moins un commentaire : mise en avant par un indice visuel.
    * Suivant le degré d'accessibilité :
        * Public : aucun indice visuel
        * Diffusion restreinte : indice visuel (un cadenas ouvert)
        * Privé : indice visuel (un cadenas fermé)
    * Si l'utilisateur clic sur un post quelque soit sont degré d'accessibilité : redirection vers le post et ces commentaires.

## Page Groupe

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Profil**
    * L'utilisateur est amené sur la page Profil

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page Liste des Groupes.

- **Page HUB**
    * Si l'utilisateur clic dessus : redirection vers la page HUB.

## Page Liste des Groupes

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Profil**
    * L'utilisateur est amené sur la page Profil

- **Page HUB**
    * Si l'utilisateur clic dessus : redirection vers la page HUB.

## Page Profil

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page Liste des Groupes.

## Page Post

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Profil**
    * L'utilisateur est amené sur la page Profil

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page du groupe.

- **Page HUB**
    * Si l'utilisateur clic dessus : redirection vers la page HUB.
