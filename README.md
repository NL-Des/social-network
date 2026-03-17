## Les outils suggérés par d'autres
- Prisma ORM
- Demander à faire autre chose que du SQLite auprès des coach
- Next.JS, React et TypeScript
- Tailwind
- ShadeCL
- Pour les tests unitaires : Jest ?
- Package bun, car plus rapide que npm.

## Bons gestes
- Une branche, une fonctionnalité.
- Des codes cours.
- Une nomenclature claire et bien dessinée.
- Du code commenté.

# social-network
 L'objectif de ce projet est de créer un équivalent du réseau social de Facebook.
 Il devra contenir les focntionnalités suivantes :
 - Followers
 - Profils
 - Posts
 - Groupes
 - Notifications
 - Chats

 ## Les Packages autorisé
- [The standard Go packages](https://pkg.go.dev/std)
- [Gorilla websocket](https://pkg.go.dev/github.com/gorilla/websocket)
- [golang-migrate](https://github.com/golang-migrate/migrate/)
- [sql-migration](https://pkg.go.dev/github.com/rubenv/sql-migrate)
- [migration](https://pkg.go.dev/github.com/Boostport/migration)
- [sqlite3](https://github.com/mattn/go-sqlite3)
- [bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt)
- [gofrs/uuid](https://github.com/gofrs/uuid) or [google/uuid](https://github.com/google/uuid)

## Conditions imposées
- Une séparation claire dans l'architecture entre Serveur, Application et Base de Donnée.

 ## Le FrontEnd
 Langages autorisés : Javascript / HTML / CSS

 Framework autorisés, parmis lesquels nous devons en choisir un :
- [Next.js](https://nextjs.org/)
- [Vue.js](https://vuejs.org/)
- [Svelte](https://svelte.dev/)
- [Mithril](https://mithril.js.org/)

Il est attendu que le site soit responsive.

## Le BackEnd
Il est attendu comme dans les exercices précédent qu'il y ait un découpage en trois parties : serveur, application et base de données.

### Serveur
L'exercice nous suggère [le site suivant](https://caddyserver.com/docs/) pour nous aider.

### Application :

- Authentifications : Il est attendu que nous utilisions les cookies et les sessions pour gérer les connexions des utilisateurs. L'utilisateur devra constamment rester connecté, mais pouvoir se déconnecter quant il le voudra sur n'importe quelle page.Nous devrons donc mettre en permanence à disposition un bouton de déconnexion. Les informations d'inscriptions demandées sont les suivantes. Les optionnels seront au choix de l'utilisateur si il désire remplir ou non ces champs d'informations.
    - Email (adresse unique pour éviter la répétition)
    - Mot de Passe
    - Nom
    - Prénom
    - Date de naissance
    - Avatar (optionnel)
    - Pseudo (optionnel) (Pseudo unique pour éviter la répétition)
    - A propos de moi (optionnel)

- Profil : Sur son Profil, l'utilisateur devra disposer d'une option pour pouvoir mettre son profil en public ou en privé. En privé, seul ces abonnés pourront accèder à ces informations de profils. En public, tout le monde pourra accèder à ces informations sans avoir besoin de Follow.
        - Le profil doit rappeler toutes les informations d'inscription, sauf le mot de passe. Et l'email ?
        - L'activité de l'utilisateur : ces posts créés.
        - Ces Followers qui le suivent.
        - Qui il Follow/suit.
    
- Posts : Il faudra être connecté pour pouvoir créer des posts, mais aussi pour les commenter. L'utilisateur doit être capable de régler le degré d'accessibilité à son post :
    - Public : tout le monde peut voir le post de l'utilisateur.
    - Diffusion restreinte : seuls les Follower peuvent voir le post.
    - Privé : seul les Followers choisis par le créateur du post peuvent le voir.

    - Gestion des images : nous devons au minimum pouvoir héberger et gérer les types suivant : 
            - JPEG
            - PNG
            - GIF
    
- Groupes : Les utilisateurs doivent pouvoir trouver une page ou un endroit qui liste les groupes existant. Un utilisateur doit pouvoir créer un groupe. Il doit fournir :
    - Un titre
    - Une description
    Quand le groupe est créé, le créateur doit pouvoir inviter d'autres utilisateurs, qui doivent de leur côté accepter l'invitation. Les invités pourront à leurs tours inviter d'autres utilisateurs. 
    Des non-invités devront pouvoir faire une requête pour demander l'accès au groupe. Seul le créateur du groupe pourra accepter ou refuser.

    Une fois dans le groupe, un utilisateur peut créer des posts et commenter les posts existants. Ces posts et commentaires ne seront accessibles qu'aux membres du groupe. L'utilisateur doit pouvoir quitter le groupe. Un utilisateur déjà intégré dans un groupe ne doit pas pouvoir envoyer une demande d'intégration dans le groupe. Le créateur du groupe ne peut pas inviter une seconde fois une personne déjà acceptée dans le groupe.
    Les chats de groupes seront communs entre les membres du groupe.

    Les utilisateurs du groupe pourront aussi créer des événements accessibles à tous les membres du groupe. Les membres du groupe pourront s'y inscrire ou non suivant leur désir. Ils devront avoir les informations suivantes :
    - Titre
    - Description
    - Jour/heure de l'événement
    - Au moins deux options : S'y inscrit ou ne s'y inscrit pas.

- Chats : pour pouvoir utiliser le chat, l'un des utilisateurs devra au moins suivre l'autre ou être suivit.
    Quand un utilisateur envoit un message, le receveur doit immédiatement obtenir une notification par Websocket, si :
    - le receveur suit l'envoyeur.
    - le receveur à son profil en public.

    Il doit être possible d'envoyer des émojis dans les chats.

- Notifications :
    L'utilisateur doit pouvoir recevoir ces notifications dans toutes les pages du projet. Il y aura plusieurs raisons et types de notifications :
    - Si l'utilisateur à un profil privé, et qu'un utilisateur souhaite le suivre.
    - Si l'utilisateur reçoit une invitation à un groupe.
    - Si il est le créateur d'un groupe, et qu'un utilisateur demande à rejoindre le groupe.
    - Si un membre d'un groupe auquel appartient l'utilisateur créé un événement.

- Base de données :
    L'exercice impose SQLite. 
    - Pour dessiner les diagrammes relationels, il nous est suggéré [ce site](https://www.smartdraw.com/entity-relationship-diagram/)
    - Migrations : à chaque fois que nous lancerons l'application, les migrations devront créer les tables. [Ressource suggérée](https://github.com/golang-migrate/migrate)
        - Toutes les migrations devront êtres stockées dans le même dossier.
        - Un fichier sqlite.go est attendu pour centraliser les connexions à la base de données, les migrations, et toutes les fonctionnalités liées à la BDD.

## Docker
Le projet doit avoir deux images de docker, une pour le BackEnd et une pour le FrontEnd.

- Le contenaire BackEnd : à partir de l'image du BackEnd, le contenaire fera fonctionner le serveur de l'application, les requêtes des clients et les interractions avec la BDD.

- Le contenaire FrontEnd : à partir de l'image du FrontEnd, le contenaire fera le côté client du code (JS, HTML et CSS). Il communiquera avec le BackEnd via des HTTP requests.

Nous devrons faire attentions à exposer les bons ports de communications pour les parties 