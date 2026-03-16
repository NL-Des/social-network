# social-network
 L'objectif de ce projet est de créer un équivalent du réseau social de Facebook.
 Il devra contenir les focntionnalités suivantes :
 - Followers
 - Profils
 - Posts
 - Groupes
 - Notifications
 - Chats

 ## Le FrontEnd
 Langages autorisés : Javascript / HTML / CSS

 Framework autorisés, parmis lesquels nous devons en choisir un :
- Next.js
- Vue.js
- Svelte
- Mithril

    Attendus :
    - Responsive
    - Performance

## Le BackEnd
Il est attendu comme dans les exercices précédent les trois parties suivantes :

- Serveur : L'exercice nous suggère le site suivant pour nous aider (https://caddyserver.com/docs/)

- Application :

    - Authentifications : Il est attendu que nous utilisions les cookies et les sessions pour gérer les connexions des utilisateurs. L'utilisateur devra constamment rester connecté, mais pouvoir se déconnecter quant il le voudra sur n'importe quelle page.Nous devrons donc mettre en permanence à disposition un bouton de déconnexion.
        Les informations d'inscriptions demandées sont les suivantes. Les optionnels seront au choix de l'utilisateur si il désire remplir ou non ces champs d'informations.
        - Email
        - Mot de Passe
        - Nom
        - Prénom
        - Date de naissance
        - Avatar (optionnel)
        - Pseudo (optionnel)
        - A propos de moi (optionnel)

    - Profil : Sur son Profil, l'utilisateur devradisposer d'une option pour pouvoir mettre son profil en public ou en privé. En privé, seul ces abonnés pourront accèder à ces informations de profils. En public, tout le monde pourra accèder à ces informations sans avoir besoin de Follow.
        - Le profil doit rappeler toutes les informations d'inscription, sauf le mot de passe. Et l'email ?
        - L'activité de l'utilisateur : ces posts créés.
        - Ces Followers qui le suivent.
        - Qui il Follow/suit.
    
    - Posts : Il faudra être connecté pour pouvoir créer des posts, mais aussi pour les commenter. L'utilisateur doit être capable de régler le degré d'accessibilité à son post :
        - public : tout le monde peut voir le post de l'utilisateur.
        - diffusion restreinte : seuls les Follower peuvent voir le post.
        - Privé : seul les Followers choisis par le créateur du post peuvent le voir.

            - Gestion des images : nous devons au minimum pouvoir héberger et gérer les types suivant : 
                - JPEG
                - PNG
                - GIF
    
    - Groupes : Les utilisateurs doivent pouvoir trouver une page ou un endroit qui liste les groupes existant.Un utilisateur doit pouvoir créer un groupe. Il doit fournir :
        - Un titre
        - Une description
    Quand le groupe est créé, le créateur doit pouvoir inviter d'autres utilisateurs, qui doivent de leur côté accepter l'invitation. Les invités pourront à leurs tours inviter d'autres utilisateurs. 
    Des non-invités devront pouvoir faire une requête pour demander l'accès au groupe. Seul le créateur du groupe pourra accepter ou refuser.

    Une fois dans le groupe, un utilisateur peut créer des posts et commenter les posts existants. Ces posts et commentairesneseront accessibles qu'aux membres du groupe.

    Les utilisateurs du groupe pourront aussi créer des événements accessibles à tous les membres du groupe. Les membres du groupe pourront s'y inscrire ou non suivant leur désir. Ils devront avoir les informations suivantes :
    - Titre
    - Description
    - Jour/heure de l'événement
    - Au moins deux options : S'y inscrit ou ne s'y inscrit pas.

    - Chats : un websocket sera nécessaire pour les conversations entre utilisateurs.

- Base de données :
    L'exercice impose SQLite. 
    - Pour dessiner les diagrammes relationels, il nous est suggéré ce site (https://www.smartdraw.com/entity-relationship-diagram/)
    - Migrations : à chaque fois que nous lancerons l'application, les migrations devront créer les tables. Ressource suggérée (https://github.com/golang-migrate/migrate)
        - Toutes les migrations devront êtres stockées dans le même dossier.
        - Un fichier sqlite.go est attendu pour centraliser les connexions à la base de données, les migrations, et toutes les fonctionnalités liées à la BDD.

## Docker
Le projet doit avoir deux images de docker, une pour le BackEnd et une pour le FrontEnd.

- Le contenaire BackEnd : à partir de l'image du BackEnd, le contenaire fera fonctionner le serveur de l'application, les requêtes des clients et les interractions avec la BDD.

-Le contenaire FrontEnd : à partir de l'image du FrontEnd, le contenaire fera le côté client du code (JS, HTML et CSS). Il communiquera avec le BackEnd via des *HTTP requests*.

Nous devrons faire attentions à exposer les bons ports de communications pour les parties 