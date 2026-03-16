# Codification :
- **un bouton sur lequel cliquer**
- un objet, un lien, un champs de texte,...
    * Si on clic dessus ou que l'on intéragie avec, que ce passe-t-il ?

# Plan de construction de Social Network

## Page de connexion

- Symbole du projet
    * Si non-connecté : le clic ramène sur la page d'acceuil.
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
    * Si non-connecté : le clic ramène sur la page d'acceuil.
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

- Onglet des notifications
    * Si il y a des notifications : changement d'état pour en avertir l'utilisateur.

- Liste des groupes
    * Si il y a un nouveau message : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau post : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau commentaire : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouveau membre : changement d'état pour en avertir l'utilisateur.
    * Si il y a un nouvel événement : changement d'état pour en avertir l'utilisateur.
    * Si l'utilisateur est le créateur du groupe et qu'il y a une demande d'entrée : changement d'état pour en avertir l'utilisateur.

- Liste des utilisateurs connectés