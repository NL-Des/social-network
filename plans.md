# Table des Matières
- Corrections à faire
- Elements à anticiper pour la prochaine partie de planification
- Codification
- Plan de construction de Social Network
    - Page d'accueille
    - Page de connexion
    - Page d'inscription
    - Page HUB
    - Page Chat(s)
    - Page Groupe
    - Page Liste des Groupes
    - Page Section Utilisateur
    - Page Profil
    - Page Post
    - Page Notifications

# Idées générales et interrogations à explorer
- Ajouter une icone "Notifications" dans l'entête.
- Mettre la liste des utilisateurs connectés ou non sur le côté, accessible sur toutes les pages et aux gens non connectés.
- Pour la création de Post : Faire un pop-up de création de post qui nous permettrait de créer un post depuis les différentes pages permettant de le faire sans redirection. Redirection automatique sur le feed des posts après la création d'un post.
Questionnement : Nous avons déjà beaucoup de boutons de présents sur certaines pages, est-ce mieux un bouton pour pouvoir le faire depuis n'importe quelle page, ou d'avoir une page dédiée ?
- La liste actuelle des personnes connectés ou non, fait un tri par ordre alphabétique si il n'y à pas d'historique de messages. Puis par historique des messages quant il y en a.
Questionnement qui fut amené : faisons-nous une liste de contacts d'un côté trié dans l'ordre alphabétique, puis une liste de messagerie avec un tri par historicité des messages ? De mon côté, je ne trouve que sa disperse l'information et que ce n'est pas le plus intuitif. Ne pourrions nous pas mettre cette liste de personnes connectées et non connectées accessible sur toutes les pages ?
- Pour la BDD (notifications, raison de bannissement, etc), il fut suggéré de stocker des json dans la BDD afin d'avoir les data de façon plus malléable et une BDD moins chargée, donc à regarder

# Elements à anticiper pour la prochaine partie de planification
- Faire les normes JS, Go et le reste dans une partie dédiée.
- Faire les étapes de soumissions des fonctionnnalités et pull requests.
- Ecrire la procédure de travail.
- Si il y a trop de tentatives de connexions, mettre un blocage de connexion.

# Codification :
- **un bouton sur lequel cliquer**
- un objet, un lien, un champs de texte,...
    * Si on clic dessus ou que l'on intéragie avec, que ce passe-t-il ?

- Utilisateur : le mot Utilisateur désigne le point de vue de la personne qui est connectée.
- Personne : le mot Personne désigne les autres usagers de la plateforme, et permet de ce distinguer de l'Utilisateur.

# Plan de construction de Social Network

## En-tête de toutes les pages

- Symbole du projet
    * Si non-connecté : le clic ramène sur la page de connexion.
    * Si connecté : le clic amène sur la page du Hub.

- Barre de recherche 
    * Si l'utilisateur l'utilise : il doit pouvoir faire une recherche par tag, créateur de post, nom de poste ou nom de groupes.
        * Si l'utilisateur clic sur une des suggestions, il doit être réorienté sur la page du résultat.

- **Bouton Déconnexion**
    * Si l'utilisateur est connecté : le bouton est visible.
    * Si l'utilisateur connecté clic dessus : l'utilisateur se déconnecte.

- **Bouton Section Utilisateur**
    * L'utilisateur est amené sur la page Section Utilisateur

- **Bouton Liste des Groupes**
    * Si l'utilisateur clic dessus : redirection vers la page Liste des Groupes.

- **Bouton Création d'un Post**
    * Si l'utilisateur clic dessus : redirection vers la page Post

- **Bouton HUB**
    * Si l'utilisateur clic dessus : redirection vers la page HUB.

- Onglet des notifications
    * Si il y a des notifications : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur clic dessus : déploie une liste des trois dernières notifications et contient aussi un bouton notification.
        - **Bouton Page des Notifications**
            * Si l'utilisateur clic sur le bouton : redirection sur la page des notifications.
        * Si l'utilisateur clic sur une des trois notifications : redirection sur la page d'origine de la notification.


## Page d'accueille

- Titre du Projet
- Descriptif du projet

- Des images de l'intérieur du réseau social pour attirer les utilisateurs

- Feed des groupes actifs
    - Nom du Groupe
    - Description du groupe
    - Nombre de membres

- Feed des posts publics les plus actifs, hors groupes
    - Nom du Post
    - Contenu du Post
    - Nombre de commentaires
    - Affichage du commentaire ayant obtenu le plus de likes dans le Post

- Zone de texte invitant à s'inscrire

- **Bouton Inscription**
    * Si l'utilisateur clic dessus : amène l'utilisateur sur la page d'inscription.

## Page de connexion

- Formulaire de connexion :
    - Email ou Pseudo
        * Si moins de 6 caractères : faire apparaître un message d'erreur.
        * Si il y a un @ sans rien après : faire apparaître un message d'erreur.
    - Mot de passe
        * Si moins de 8 caractères : faire apparaître un message d'erreur.

- **Bouton Connexion**
    * Si l'utilisateur est connecté : il ne voit pas le bouton.
    * Si les informations de connexion sont bonnes : amène sur le Hub.
    * Si les informations de connexions sont fausses :
        * Si le nom de compte n'est pas présent dans la BDD : indique que le compte n'existe pas.
        * Si le mot de passe est faux : indique que le mot de passe est faux.
        * Si le nmo de compte et le mot de passe sont faux : indique que le compte n'existe pas.

- **Bouton Inscription**
    * Si l'utilisateur clic dessus : amène l'utilisateur sur la page d'inscription.

- **Bouton Retour à la page d'accueille**
    * Si l'utilisateur clic dessus : amène l'utilisateur sur la page d'accueille.
    
## Page d'inscription

- Titre du Projet

- Forumlaire d'inscription :
    - Email
        * Si il n'y a pas le bon format : message d'erreur
    - Mot de Passe
        * Si moins de 8 caractères : faire apparaître un message d'erreur.
    - Nom
    - Prénom
    - Date de naissance
    - Avatar (optionnel)
        - Zone de texte : Seuls les formats d'images JPEG, PNG et GIF sont autorisés.
        - Zone de texte : La limite de taille pour les images est de 5 Mo.
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
    * Si le Pseudo est égal à un Nom et Prénom : indiquer que le Pseudo est déjà pris.
    * Si le Nom et Prénom égal un Nom et Prénom : indiquer qu'un Pseudo est obligatoire à cause d'un homonyme.
    * Si dans A propos de moi, il n'y a qu'un ou plusieurs espaces ou tabulations : envoyer un message disant que le champs A propos de moi doit être vide ou doté de texte.

- **Bouton Retour à la page d'accueille**
    * Si l'utilisateur clic dessus : amène l'utilisateur sur la page d'accueille.

- **Bouton Se Connecter**
    * Si l'utilisateur clic dessus : amène l'utilisateur à la page de connexion.

## Page HUB
C'est ici qu'arrive l'utilisateur lors de la validation de sa connexion.
C'est ici que l'utilisateur va pouvoir avoir accès à toutes les fonctionnalités du Projet.

- Liste des groupes où l'utilisateur est inscrit.
    * Si l'utilisateur est inscrit à un groupe : affichage du groupe dans la liste.
        - Liste des groupes
            - Nom du Groupe
    * Si il y a un nouveau message : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau post : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau commentaire : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau membre : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouvel événement : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur est le créateur du groupe et qu'il y a une demande d'entrée : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur clic sur un groupe : redirection vers la page du groupe.

- Liste des personnes connectée ou non
    - Liste des éléments présents pour chaque personne :
        - Pseudo ou Nom et Prénom
        - Avatar
    * Si l'utilisateur n'a pas d'historiques de messages : tri dans l'ordre alphabétique.
    * Si l'utilisateur a un historique de messages : tri dans l'ordre du message le plus récent en haut, pour descendre vers les moins récents.
    * Si il y a un nouveau message : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur est abonné à une personne, cette personne sera mise en bleu.
    * Si une personne est abonnée à l'utilisateur, cette personne sera mise en vert.
    * Si l'utilisateur et la personne sont abonnées à l'une et l'autre, alors cette personne sera mise en rouge.
    * Si l'utilisateur clic sur une personne :
        * Si l'utilisateur ne suis pas cette personne : 
            * Apparition de deux boutons sur la case de la personne :
                * **Bouton Suivre cette Personne**
                    * Si l'utilisateur clic dessus : l'utilisateur suis maintenant cette personne.
                * **Bouton Voir son Profil**
                    * Si l'utilisateur clic dessus : l'utilisateur est amené sur la page du profil de la personne.
        * Si l'utilisateur suis cette personne :
            * Apparition de deux boutons sur la case de la personne :
                * **Bouton Envoyer un Message**
                    * Si l'utilisateur clic dessus : l'utilisateur est amené sur la Page Chat(s)
                * **Bouton Voir son Profil**
                    * Si l'utilisateur clic dessus : l'utilisateur est amené sur la page du profil de la personne.

- Liste des posts
    * Affichage dans l'ordre des posts dernièrement créés, ou ayant reçus des commentaires (Du haut vers le bas). Du haut vers le bas. Les Posts et commentaires de groupes ne sont pas dans ce flux.
    - Liste des éléments présents pour chaque post :
        - Titre du post
        - Nombre de commentaires
        - Pseudo ou Nom et Prénom du créateur
        - Date et heure de création
        - Date de dernière activité
        - Nombre de Likes
        - Nombre de Dislikes
    * Si l'utilisateur est le créateur du post : mise en avant par un indice visuel discret.
    * Si l'utilisateur a déjà participé au post avec au moins un commentaire : mise en avant par un indice visuel discret.
    * Suivant le degré d'accessibilité :
        * Public : aucun indice visuel
        * Diffusion restreinte : indice visuel (un cadenas ouvert)
        * Privé : indice visuel (un cadenas fermé)
    * Si l'utilisateur clic sur un post quelque soit sont degré d'accessibilité : redirection vers le post et ces commentaires. Car si il est autorisé à voir, c'est aussi qu'il est autorisé à y aller et à y participer.
    * Si le post provient d'un groupe auquel l'utilisateur n'est pas inscrit : il ne le voit pas.
    * Si le post provient d'un groupe auquel l'utilisateur est inscrit : il ne le voit pas ici.

## Page Chat(s)

- Liste des personnes connectée ou non
    - Liste des éléments présents pour chaque personne :
        - Pseudo ou Nom et Prénom
        - Avatar
    * Si l'utilisateur n'a pas d'historiques de messages : tri dans l'ordre alphabétique.
    * Si l'utilisateur a un historique de messages : tri dans l'ordre du message le plus récent en haut, pour descendre vers les moins récents.
    * Si il y a un nouveau message : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur est abonné à une personne, cette personne sera mise en bleu.
    * Si une personne est abonnée à l'utilisateur, cette personne sera mise en vert.
    * Si l'utilisateur et la personne sont abonnées à l'une et l'autre, alors cette personne sera mise en rouge.
    * Si l'utilisateur clic sur une personne :
        * Si l'utilisateur ne suis pas cette personne : 
            * Apparition de deux boutons sur la case de la personne :
                * **Bouton Suivre cette Personne**
                    * Si l'utilisateur clic dessus : l'utilisateur suis maintenant cette personne.
                * **Bouton Voir son Profil**
                    * Si l'utilisateur clic dessus : l'utilisateur est amené sur la page du profil de la personne.
        * Si l'utilisateur suis cette personne :
            * Apparition de deux boutons sur la case de la personne :
                * **Bouton Envoyer un Message**
                    * Si l'utilisateur clic dessus : l'utilisateur ouvre le chat avec cette personne
                * **Bouton Voir son Profil**
                    * Si l'utilisateur clic dessus : l'utilisateur est amené sur la page du profil de la personne.

- Chat
    - Liste des éléments présents dans chaque message :
        - Pseudo ou Nom et Prénom de la personne/utilisateur
        - Avatar de la personne/utilisateur
            * Si la personne est déconnectée, l'avatar est grisé.
        - Corps du message
        - Date et heure de diffusion du message

## Page Groupe
Une fois que l'utilisateur à cliqué sur un groupe où sa demande d'accès fut accepté par le créateur du groupe, ou qu'il est le créateur du groupe, il accède à tout ce que contient le groupe.

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

- **Bouton Administration du Groupe**
    * Si l'utilisateur n'est pas le Créateur du Groupe : l'utilisateur peut voir le bouton.
    * Si l'utilisateur clic dessus : ouverture d'une fenêtre d'option.
        - **Bouton Donner la direction du groupe à un autre utilisateur**
            * Si l'utilisateur clic dessus : ouverture d'une fenêtre.
                - Zone de texte : A qui souhaitez-vous transmettre définitivement la responsabilité et les droits du groupe ?
                - Zone d'écriture : Indiquez le Pseudonyme ou le Nom et Prénom de l'utilisateur.
                - **Bouton Confirmer la passation des droits à un autre utilisateur**
                    * Si l'utilisateur clic dessus : vérification que la personne indiquée existe dans la base de données.
                        * Si la personne n'existe pas dans la BDD : envoit d'un message d'erreur :
                            - Zone de Texte: Veuilliez vérifier l'orthographe de la personne indiquée.
                            - **Bouton Retour**
                        * Si la personne existe dans la BDD : les droits de créateur du groupe de l'utilisateur sont donnés à la personne. L'utilisateur qui est l'ancien créateur reste membre du groupe.
        - **Bouton Supprimer le Groupe**
            * Si l'utilisateur clic dessus : affichage d'une fenêtre.
                - Zone de texte :  Êtes-vous sûr de vouloir supprimer définitivement le groupe ?
                - **Bouton Supprimer le Groupe**
                    * Si l'utilisateur clic dessus : suppression du groupe, de ces posts et de ces commentaires. L'utilisateur créateur du groupe et les autres personnes membres du groupe ne sont plus affiliées au groupe.
                - **Bouton Retour**
                    * Si l'utilisateur clic dessus : retour à la page de groupe.
        - **Bouton Retour**
            * Si l'utilisateur clic dessus : retour sur la page Groupe.

- **Bouton Gestion des demandes d'accès au Groupe**
    * Si il y a des demandes d'accès par des personnes : changement d'état visuel pour le notifier au créateur du groupe.
    * Si l'utilisateur clic dessus : ouverture d'une fenêtre d'options.
        - Liste des demandes d'accès par les personnes :
            - Pseudo ou Nom et Prénom
            - Avatar
            - A propos de moi
            - Date d'inscription
            * Si la personne fut déjà membre du groupe dans le passé :
                * Si la personne s'est désinscrit par elle-même :
                    - Texte avertissant que le candidat à quitté le groupe par lui-même dans le passé.
                * Si la personne fut bannie par le créateur du groupe :
                    * Si l'utilisateur créateur avait remplit la zone de texte pour expliquer la raison du banissement :
                        - Raison du banissement
                    * Si l'utilisateur créateur du groupe n'avait pas remplit la zone de texte pour expliquer la raison du banissement :
                        - Texte : Aucune raison indiquée pour son précédent banissement.

- Liste des groupes où l'utilisateur est inscrit.
    * Si l'utilisateur est inscrit à un groupe : affichage du groupe dans la liste.
        - Liste des groupes
            - Nom du Groupe
    * Si il y a un nouveau message : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau post : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau commentaire : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau membre : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouvel événement : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur est le créateur du groupe et qu'il y a une demande d'entrée : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur clic sur un groupe : redirection vers la page du groupe.

- Liste des utilisateurs connectées ou non ayant accès au groupe
    * Si l'utilisateur n'a pas d'historiques de messages : tri dans l'ordre alphabétique.
    * Si l'utilisateur a un historique de messages : tri dans l'ordre du message le plus récent en haut, pour descendre vers les moins récents.
    * Si il y a un nouveau message : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur est abonné à une personne, cette personne sera mise en bleu.
    * Si une personne est abonnée à l'utilisateur, cette personne sera mise en vert.
    * Si l'utilisateur et la personne sont abonnées à l'une et l'autre, alors cette personne sera mise en rouge.
    * Si l'utilisateur clic sur une personne :
        * Si l'utilisateur ne suis pas cette personne : 
            * Apparition de deux boutons sur la case de la personne :
                - **Bouton Suivre cette Personne**
                    * Si l'utilisateur clic dessus : l'utilisateur suis maintenant cette personne.
                - **Bouton Voir son Profil**
                    * Si l'utilisateur clic dessus : l'utilisateur est amené sur la page du profil de la personne.
                * Si l'utilisateur est le créateur du groupe :
                    - **Bouton Bannir du Groupe**
                        * Si l'utilisateur clic dessus :
                            - Affichage d'un message de confirmation :
                                - Texte : Voulez-vous bannir cette personne ?
                                - Zone d'écriture de texte, Raison du Bannissement : Veuillez justifier le bannissement.
                                - **Bouton Bannir du Groupe**
                                    * Si l'utilisateur clic dessus : la personne est éjectée du groupe.
                                    * Si l'utilisateur a remplit la zone de texte Raison du Bannissement : envoit dans la BDD de la raison.
                                    * Si l'utilisateur ne remplit pas la zone de texte Raison du Bannissement : envoit du message "Aucune raison indiquée pour son précédent banissement."
                                - **Bouton Retour**
                                    * Si l'utilisateur clic dessus : retour sur la page groupe.
        * Si l'utilisateur suis cette personne :
            * Apparition de deux boutons sur la case de la personne :
                - **Bouton Envoyer un Message**
                    * Si l'utilisateur clic dessus : l'utilisateur est amené sur la Page Chat(s)
                - **Bouton Voir son Profil**
                    * Si l'utilisateur clic dessus : l'utilisateur est amené sur la page du profil de la personne.
                * Si l'utilisateur est le créateur du groupe :
                    - **Bouton Bannir du Groupe**
                        * Si l'utilisateur clic dessus :
                            - Affichage d'un message de confirmation :
                                - **Bouton Bannir du Groupe**
                                    * Si l'utilisateur clic dessus : la personne est éjectée du groupe.
                                - **Bouton Retour**
                                    * Si l'utilisateur clic dessus : retour sur la page groupe.

- Liste des posts du groupe
    * Affichage dans l'ordre des posts dernièrement créés, ou ayant reçus des commentaires (Du haut vers le bas). Du haut vers le bas. Les Posts et commentaires de groupes ne sont pas dans ce flux.
    - Liste des éléments présents pour chaque post :
        - Titre du post
        - Nombre de commentaires
        - Pseudo ou Nom et Prénom du créateur
        - Date et heure de création
        - Date de dernière activité
        - Nombre de Likes
        - Nombre de Dislikes
    * Si l'utilisateur est le créateur du post : mise en avant par un indice visuel.
    * Si l'utilisateur a déjà participé au post avec au moins un commentaire : mise en avant par un indice visuel.
    * Le degré d'accessibilité des posts : à ne pas mettre et utiliser dans les posts dans les groupes.
    * Si l'utilisateur clic sur un post : redirection vers le post et ces commentaires.

- Chat du Groupe
    - Liste des membres du groupe
        * Si une personne est connectée : mise en évidence visuelle de sa connection sur le Projet.
        * Si une personne n'est pas connectée : mise en évidence visuelle de son absence sur le Projet.

## Page Liste des Groupes

- **Bouton Création de Groupe**
    * Si l'utilisateur clic dessus : ouverture d'un formulaire où l'utilisateur doit remplir les champs suivant :
        - Titre du Groupe
        - Description du Groupe
        * **Bouton Créer le Groupe**

- Liste des groupes existants
    * Chaque groupe existant doit être listé pour que chaque utilisateur puisse faire une demande d'accès.
        - Nom du Groupe
        - Description du groupe
        - Nom du Créateur du Groupe
        - Date de création
        - Date de dernière activité
        - Nombre de Membres dans le groupe
        - **Bouton Demander à rejoindre le Groupe**
            * Si l'utilisateur est déjà membre du groupe : l'utilisateur ne peut pas voir le bouton.
            * Si l'utilisateur est le créateur du groupe : l'utilisateur ne peut pas voir le bouton.
            * Si l'utilisateur clic dessus : envoit d'une demande d'accès au créateur du groupe.

## Page Section Utilisateur

- **Bouton Suppression de Compte**
    * Si l'utilisateur clic dessus : ouverture d'un formulaire où l'utilisateur doit remplir le champs suivant :
        * l'utilisateur doit écrire en toute lettre : Je veux supprimer mon compte.
        * **Bouton Supprimer mon Compte**
            * Si l'utilisateur clic dessus et qu'il n'a pas bien rédigé la phrase précédente : message d'erreur comme quoi la phrase est mal rédigée.
            * Si l'utilisateur clic dessus et qu'il à bien rédigé la phrase précédente : suppresion du compte.

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

- **Bouton Modifier les informations personnelles**
    - Si l'utilisateur clic dessus : affichage de la liste des informations modifiables
        - Email
            - Zone d'écriture du nouvel email
        - Mot de Passe
            - Zone d'écriture du nouveau mot de passe
        - Nom
            - Zone d'écriture du nouveau nom
        - Prénom
            - Zone d'écriture du nouveau prénom*
        - Avatar (optionnel)
            - Zone de texte : Seuls les formats d'images JPEG, PNG et GIF sont autorisés.
            - Zone d'apport de la nouvelle image
        - Pseudo (optionnel)
            - Zone d'écriture du nouveau Pseudo
        - A propos de moi (optionnel)
            - Zone d'écriture A propos de moi
        - **Bouton Mettre à jour mes informations personnelles**
            * Si l'utilisateur clic dessus : les anciennes informations sont écrasées par les nouvelles.

- Liste des personnes suivies par l'utilisateur
    - Pseudo ou Nom et Prénom
        * Si l'utilisateur clic dessus : redirection vers le Profil de la personne.
    - Avatar
    - A propos de la personne
    - **Bouton Se Désabonner**
        * Si l'utilisateur clic dessus : désabonnement de l'utilisateur avec la personne.

- Liste des personnes qui suivent l'utilisateur
    - Pseudo ou Nom et Prénom
        * Si l'utilisateur clic dessus : redirection vers le Profil de la personne.
    - Avatar
    - A propos de la personne
    - **Bouton Bloquer ce Follower**
        * Si l'utilisateur clic dessus : la personne sera désabonnée de l'utilisateur et ne pourra plus s'abonner à l'utilisateur.

- Réglage Public/Privé
    * Si l'utilisateur à mis son profil en Public :
        - **Bouton Passer le Profil en Privé**
            * Si l'utilisateur clic dessus : passage du profil en Public.
    * Si l'utilisateur à mis son profil en Privé :
        - **Bouton Passer le Profil en Public**
            *Si l'utilisateur clic dessus : passage du profil en Privé.

## Page Profil

* Si la personne a réglé son Profil en mode Privé :
    - Date d'inscription
    * Si l'utilisateur a un Pseudo : affichage du Pseudo.
        - Pseudo
    * Si l'utilisateur n'a pas de Pseudo : affichage du Nom et du Prénom.
        - Nom et Prénom
    * Si la personne à mis une image en Avatar : affichage de l'Avatar.
        - Avatar

* Si la personne a réglé son Profil en mode Public :
    - Date de naissance
    - Date d'inscription
    * Si l'utilisateur a un Pseudo : affichage du Pseudo.
        - Pseudo
    * Si l'utilisateur n'a pas de Pseudo : affichage du Nom et du Prénom.
        - Nom et Prénom
    * Si la personne à mis une image en Avatar : affichage de l'Avatar.
        - Avatar
    * Si l'utilisateur à remplis le champs de texte à propos moi : afficher à propos de moi
        - A propos de moi

* **Bouton Se Désabonner**
    * Si l'utilisateur clic dessus : désabonnement de l'utilisateur avec la personne.

## Page Post
Un utilisateur ne peut voir que les Post où il a le droit d'aller et d'intervenir.

* Si le post n'existe pas, affichage des outils de création du post.
    - Titre du post
    - Corps de Texte du post
    - **Bouton Importer une Image**
        * Si l'utilisateur clic dessus : ouverture d'une fenêtre pour aller chercher l'image depuis l'ordinateur de l'utilisateur.
    - Degré d'accessibilité (menu déroulant) :
        - Public
        - Diffusion Restreinte
        - Privé
    - Catégories ou Tag du post :
        - Zone d'écriture pour y mettre la ou les Catégories ou Tag

* Si le post existe, affichage du post :
    - Titre du post
    - Corps de Texte du post
    - Degré d'accessibilité
    - Image, si présente
    - Pseudo ou Nom et Prénom du Créateur
    - Avatar du Créateur
    - Date et heure de création
    - Nombre de Likes
    - Nombre de Dislikes
    - Like
    - Dislike
    - **Bouton Suppression du Post**
        * Si l'utilisateur est le créateur du post : l'utilisateur peut voir le bouton.
        * Si l'utilisateur est le créateur du post et clic dessus : demande d'une confirmation.
            - Fenêter de contexte avec ce texte : Voulez-vous supprimer ce post et tous ces commentaires ?
                - **Bouton Supprimer le Commentaire**
                    * Si l'utilisateur clic dessus : supression du post et de ces commentaires.
                - **Bouton Retour**
                    * Si l'utilisateur clic dessus : sortie de la fenêtre de contexte et retour au post.
    * Affichage des outils de création du commentaire.
        - Titre du commentaire
        - Corps de Texte du commentaire
        - **Bouton Importer une Image**
            * Si l'utilisateur clic dessus : ouverture d'une fenêtre pour aller chercher l'image depuis l'ordinateur de l'utilisateur.
    * Si il y a des commentaires existants sur le post, affichage des commentaires.
        - Titre du commentaire
        - Corps de Texte du commentaire
        - Image, si présente
        - Pseudo ou Nom et Prénom du Créateur
        - Avatar du Créateur
        - Date et heure de création
        - Nombre de Likes
        - Nombre de Dislikes
        - Like
        - Dislike
        - **Bouton Suppression d'un commentaire**
            * Si l'utilisateur est le créateur du commentaire : l'utilisateur peut voir le bouton.
            * Si l'utilisateur est le créateur du commentaire et clic dessus : demande d'une confirmation.
                - Fenêter de contexte avec ce texte : Voulez-vous supprimer ce commentaire ?
                    - **Bouton Supprimer le Commentaire**
                        * Si l'utilisateur clic dessus : supression du commentaire.
                    - **Bouton Retour**
                        * Si l'utilisateur clic dessus : sortie de la fenêtre de contexte et retour au post.

## Page Notifications

* Si il n'y a pas de notifications : affichage d'une zone de texte.
    - Zone de texte : Pensez à suivre des personnes et à participer à des groupes pour vous garnir votre fil de notifications !
* Si il y a des notifications : affichage de la liste des notifications de l'utilisateur.
    - Liste des notifications
        * Si c'est un post qui vient d'être créé dans un groupe où l'utilisateur est inscrit :
            - Nom du post
            - Pseudo ou Nom et Prénom du créateur du post
            - Date de création du post
        * Si c'est un nouveau commentaire dans un post créé par l'utilisateur dans un groupe :
            - Nom du post
            - Pseudo ou Nom et Prénom du créateur du nouveau commentaire
            - Date de création du commentaire
        * Si c'est un nouveau commentaire, dans un post où l'utilisateur a participé mais il n'est pas le créateur, dans un groupe :
            - Nom du post
            - Pseudo ou Nom et Prénom du créateur du nouveau commentaire
            - Date de création du commentaire
        * Si c'est un nouveau commentaire dans un post créé par l'utilisateur endehors d'un groupe :
            - Nom du post
            - Pseudo ou Nom et Prénom du créateur du nouveau commentaire
            - Date de création du commentaire
        * Si c'est un nouveau commentaire dans un post où l'utilisateur a participé mais il n'est pas le créateur, en dehors d'un groupe :
            - Nom du post
            - Pseudo ou Nom et Prénom du créateur du nouveau commentaire
            - Date de création du commentaire