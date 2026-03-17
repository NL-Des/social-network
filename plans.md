# Corrections à faire
- Possibilité de quitter un groupe
- Un utilisateur déjà intégré dans un groupe ne doit pas pouvoir envoyer une demande d'intégration dans le groupe.
- Le créateur du groupe ne peut pas inviter une seconde fois une personne déjà acceptée dans le groupe.
- Faire une page d'accueille avec un feed des posts et groupes à succès.
- Faire une page d'inscription à part.
- Symbôle du projet à reporter dans toutes les pages.
- Si on clic sur l'utilisateur, on va sur son profil ou on lui envoit un message suivant où on clic.
- Mettre le Chat de Groupe dans la Page Groupe.
- Ne pas mettre les posts et commentaires présents dans les groupes, dans la page HUB.
- Mettre la liste des utilisateurs du groupe.
- Gérer la suppression du Post, et des commentaires affiliés.
- Dans le groupe il faut pouvoir bannir un utilisateur. Il pourra mettre un message de justification.
- Mettre en place un historique des bans d'un groupe, que le Créateur puisse savoir si il y a eu un antécédant. 
- Si il y a trop de tentatives de connexions, mettre un blocage de connexion.
- Confirmation que les degrés d'accessibilités ne sont pas à mettre dans les Posts dans les Groupes.

- Faire les normes JS, Go et le reste dans une partie dédiée.

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
    - Voulez-vous un profil Public ou Privé ?
        * Si c'est l'option Public qui est choisit : alors le profil de l'utilisateur doit être Public.
        * Si c'est l'option Privé qui est choisit : alors le profil de l'utilisateur doit être Privé.

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

- **Bouton Section Utilisateur**
    * L'utilisateur est amené sur la page Section Utilisateur

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page du Liste des Groupes.

- **Bouton Création d'un Post**
    *Si l'utilisateur clic dessus : redirection vers la page Post

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
    * Si l'utilisateur est le créateur du post : mise en avant par un indice visuel discret.
    * Si l'utilisateur a déjà participé au post avec au moins un commentaire : mise en avant par un indice visuel discret.
    * Suivant le degré d'accessibilité :
        * Public : aucun indice visuel
        * Diffusion restreinte : indice visuel (un cadenas ouvert)
        * Privé : indice visuel (un cadenas fermé)
    * Si l'utilisateur clic sur un post quelque soit sont degré d'accessibilité : redirection vers le post et ces commentaires. Car si il est autorisé à voir, c'est aussi qu'il est autorisé à y aller et à y participer.
    * Si le post provient d'un groupe, l'utilisateur va-t-il le retrouver ici ? Je serais plutôt pour éviter cela, que l'utilisateur doive aller dans la page groupe. Pour bien distinguer l'espace public/groupe.

## Page Groupe
Une fois que l'utilisateur à cliqué sur un groupe où sa demande d'accès fut accepté par le créateur du groupe, ou qu'il est le créateur du groupe, il accède à tout ce que contient le groupe.

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Section Utilisateur**
    * L'utilisateur est amené sur la page Section Utilisateur

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page Liste des Groupes.

- **Bouton HUB**
    * Si l'utilisateur clic dessus : redirection vers la page HUB.

- **Bouton Administration du Groupe**
    * Si l'utilisateur est le Créateur du Groupe : l'utilisateur peut voir le bouton.
    * Si l'utilisateur clic dessus : ouverture d'une fenêtre d'options.
        * **Bouton Retour**
            * Si l'utilisateur clic dessus : retour sur la page Groupe.
        * **Bouton Suppression du Groupe**
            * Si l'utilisateur clic dessus : demande un message de confirmation pour la suppression du groupe.
                * **Bouton Suppression du Groupe**
                    * Si l'utilisateur clic dessus : suppression du groupe.
                * **Bouton Retour**
                    * Si l'utilisateur clic dessus : retour sur la page Groupe.

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

- Liste des utilisateurs connectés ayant accès au groupe
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
    * Affichage dans l'ordre des posts ou des commentaires dernièrement créés (Du haut vers le bas). Les commentaires font remonter les posts où ils sont créés, mais c'est seulement le post qui est affiché ? Faisons-nous un indice pour dire que le post n'est pas nouveau, mais qu'il y a un nouveau commentaire ?
    * Si l'utilisateur est le créateur du post : mise en avant par un indice visuel.
    * Si l'utilisateur a déjà participé au post avec au moins un commentaire : mise en avant par un indice visuel.
    * Le degré d'accessibilité des posts : très utile pour la partie public, je pense qu'ici ce n'est pas pertinant. Il y a déjà une restriction d'accès à l'entrée dans un groupe. Rajouter des options de limitations d'accès dans les groupes me semble de trop.
    * Si l'utilisateur clic sur un post : redirection vers le post et ces commentaires.

## Page Liste des Groupes

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Section Utilisateur**
    * L'utilisateur est amené sur la page Section Utilisateur

- **Bouton HUB**
    * Si l'utilisateur clic dessus : redirection vers la page HUB.

- **Bouton Création de Groupe**
    * Si l'utilisateur clic dessus : ouverture d'un formulaire où l'utilisateur doit remplir les champs suivant :
        - Titre du Groupe
        - Description du Groupe
        * **Bouton Créer le Groupe**

- Onglet des notifications
    * Si il y a des notifications : changement d'état pour en avertir l'utilisateur.

- Liste des groupes existants
    * Chaque groupe existant doit être listé pour que chaque utilisateur puisse faire une demande d'accès.
        - Nom du Groupe
        - Description du groupe
        - Nom du Créateur du Groupe
        - Date de création
        - Date de dernière activité
        - Nombre de Membres dans le groupe

## Page Section Utilisateur

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page Liste des Groupes.

- **Bouton HUB**
    * Si l'utilisateur clic dessus : redirection vers la page HUB.

- **Bouton Suppression de Compte**
    * Si l'utilisateur clic dessus : ouverture d'un formulaire où l'utilisateur doit remplir le champs suivant :
        * l'utilisateur doit écrire en toute lettre : Je veux supprimer mon compte.
        * **Bouton Supprimer mon Compte**
            * Si l'utilisateur clic dessus et qu'il n'a pas bien rédigé la phrase précédente : message d'erreur comme quoi la phrase est mal rédigée.
            * Si l'utilisateur clic dessus et qu'il à bien rédigé la phrase précédente : suppresion du compte.

- Onglet des notifications
    * Si il y a des notifications : changement d'état pour en avertir l'utilisateur.

- Liste des informations personnelles
    - Email
    - Mot de Passe
    - Nom
    - Prénom
    - Date de naissance
    - Date d'inscription
    - Avatar (optionnel)
    - Pseudo (optionnel)
    - A propos de moi (optionnel)

- Liste des personnes suivies par l'utilisateur
    - Pseudo ou Nom et Prénom
        * Si l'utilisateur clic dessus : redirection vers le Profil de la personne.
    - Date d'abonnement ?
    - Avatar
    - A propos de la personne
    * **Bouton Se Désabonner**
        * Si l'utilisateur clic dessus : désabonnement de l'utilisateur avec la personne.

- Réglage Public/Privé
    * Si l'utilisateur à mis son profil en Public :
        - **Bouton Passer le Profil en Privé**
            * Si l'utilisateur clic dessus : passage du profil en Public.
    * Si l'utilisateur à mis son profil en Privé :
        - **Bouton Passer le Profil en Public**
            *Si l'utilisateur clic dessus : passage du profil en Privé.

## Page Profil

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Section Utilisateur**
    * L'utilisateur est amené sur la page Section Utilisateur

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page du groupe.

- **Bouton HUB**
    * Si l'utilisateur clic dessus : redirection vers la page HUB.

- Onglet des notifications
    * Si il y a des notifications : changement d'état pour en avertir l'utilisateur.

* Si la personne a réglé son Profil en mode Privé :
    * Si l'utilisateur a un Pseudo : affichage du Pseudo
    * Si l'utilisateur n'a pas de Pseudo : affichage du Nom et du Prénom
    - Date d'inscription
    * Si la personne à mis une image en Avatar : affichage de l'Avatar

* Si la personne a réglé son Profil en mode Public :
    * Si l'utilisateur a un Pseudo : affichage du Pseudo
    * Si l'utilisateur n'a pas de Pseudo : affichage du Nom et du Prénom
    - Date de naissance
    - Date d'inscription
    * Si la personne a mis une image en Avatar : affichage de l'Avatar
    * Si l'utilisateur à remplis le champs de texte à propos moi : afficher à propos de moi

## Page Post
Un utilisateur ne peut voir que les Post où il a le droit d'aller et d'intervenir.

- **Bouton Déconnexion**
    * L'utilisateur est déconnecté
    * L'utilisateur est ramené sur la page d'accueil

- **Bouton Section Utilisateur**
    * L'utilisateur est amené sur la page Section Utilisateur

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page du groupe.

- **Bouton HUB**
    * Si l'utilisateur clic dessus : redirection vers la page HUB.

- Onglet des notifications
    * Si il y a des notifications : changement d'état pour en avertir l'utilisateur.

- **Bouton Création d'un Commentaire**

- Affichage du Post
    * Si le Post à des Commentaires : Affichage des Commentaires.
- Zone d'écriture d'un commentaire.
    - Titre.
    - Corps de Texte.
    - **Bouton Importer une Image**
        * Si l'utilisateur clic dessus : ouverture d'une fenêtre pour aller chercher l'image depuis l'ordinateur de l'utilisateur.
    - Degré d'accessibilité (menu déroulant) :
        - Public
        - Diffusion Restreinte
        - Privé