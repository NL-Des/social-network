# Stacks Techniques :

- GORM ORM pour le back
- Postgre
- Next.JS, React et TypeScript
- Nature ou [Tailwind](https://tailwindcss.com/)
- [Shadcn](https://ui.shadcn.com/)
- A tester, les test unitaires sur JS : Jest
- A tester, les test unitaires sur GO : natif dans le langage
- Package bun, car plus rapide que npm. Tester pnpm ?
- Docker

## Nomenclature d'écriture :

    - Les commentaires, les branches et les commits seront en Français.
    - Les noms seront en anglais
    - Un nom explicite sur son utilité
    - un format camelCase
    - le mot id sera toujours écrit : "ID"
    - Struct, Classes et Objets seront toujours avec la première lettre en Majuscule.
    - En JS, export est en fin de fichier.
    - En JSON, tout en minuscule avec comme séparateur un "_".
    - BDD, tout en minuscule avec comme séparateur un "_".
    - Les commentaires doivent en JS doivent être faits avec /**(appuyer sur entré)
    - Les commentaires et commits doivent être explicits et organisés.
    - Les commits doivent avoir des catégories en début de description (Ajout, modification, correctif,...)
    - Le nom des branches doit respecter la convention "Conventionnal Commits" :
        - feature/ — une nouvelle fonctionnalité (ce que vous faites déjà)
        - fix/ — correction de bug (idem)
        - refactor/ — réécriture de code sans changer le comportement
        - docs/ — documentation uniquement
        - test/ — ajout ou modification de tests
        - perf/ — amélioration de performance
        - chore/ —  tout ce qui est mise en place technique, configuration, scaffolding, outillage — sans être une fonctionnalité visible pour l'utilisateur ni un correctif de bug.

## Architecture :

- Front : Dicté par Next.JS
- Back : Redemander ce qui fut conseillé.

## Pages :

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

## Tâches :

- BDD :
  - Création des tables
  - Vérification de l'intégrité des tables
  - Migration des tables
  - Jeu de données de démonstration

- Serveur :
  - Serveur
  - Middlewares
  - Routes

- Création de compte :
  - Règles de création de compte
  - Vérification des informations
  - Création du compte

- Connexion :
  - Procédure de connexion
  - Création du cookie de connexion
  - Maintient de la connexion par le cookie

- Déconnexion :
  - Procédure de déconnexion
  - Suppression du cookie de connexion

- Post :
  - Création d'un post
  - Règles de diffusions des posts
  - Création d'un commentaire pour répondre à un post
  - Affichage d'un post et de ces commentaires

- Barre de recherche

- Notifications

- Liste des groupes où l'utilisateur est inscrit

- Liste des personnes connectées et non-connectées

- Liste des posts

- Liste des groupes existants

- Chat entre deux utilisateurs

- Chat entre plusieurs utilisateurs

- Groupe :
  - Création d'un groupe :
    - Création d'un groupe
    - Attribution des droits au créateur du groupe

  - Suppression d'un groupe :
    - Suppression d'un groupe
    - Suppression des droits du créateur sur l'ancien groupe
  - Transimission de la gestion d'un groupe :
    - Passassion des droits du créateur de groupe au nouvel utilisateur
    - Suppression des droits de créateur du groupe à l'ancien utilisateur
  - Candidature à rentrer dans un groupe :
    - Soumission de la demande
    - Acceptation ou rejet de la demande
  - Gestion des demandes d'accès au groupe :
    - Acceptation de la demande d'accès au groupe
    - Refus de la demande d'accès au groupe

  - Bannir un utilisateur :
    - L'utilisateur créateur du groupe doit décider si il motive d'un commentaire le bannissement.

  - Post :
    - Création d'un post
    - ~~Règles de diffusions des posts~~ (Car dans un groupe)
    - Création d'un commentaire pour répondre à un post
    - Affichage d'un post et de ces commentaires

  - Chat de Groupe
