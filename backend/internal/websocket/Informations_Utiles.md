# Fichier d'informations pour comprendre les websockets du projet

## Schéma global

```
┌─────────────┐             ┌─────────────┐             ┌─────────────┐
│   Client A  │             │   Client B  │             │   Client C  │
│  Navigateur │             │  Navigateur │             │  Navigateur │
└──────┬──────┘             └──────┬──────┘             └──────┬──────┘
       │                           │                           │
       │            connexion WS   │    connexion WS           │
       └───────────────────────────┼───────────────────────────┘
                                   │
                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                               WS Hub (Go)                             │
│                     register / unregister / broadcast                 │
└───────────────┬──────────────────┬────────────────────────────────────┘
                │                  │                  │
                ▼                  ▼                  ▼
       ┌────────────────┐  ┌───────────────┐  ┌──────────────────┐
       │   Room chat    │  │  Room groupe  │  │   Room notifs    │
       │ ID conversation│  │   ID groupe   │  │  ID utilisateur  │
       └────────────────┘  └───────────────┘  └──────────────────┘
```

## Transmission d'un message

```
┌─────┐                            ┌──────────────────────┐                      ┌────────┐
│ Hub │ ──(via BroadcastToUser)──> │ Channel client.send  │ ──(via writePump)──> │ Client │
└─────┘                            └──────────────────────┘                      └────────┘
```

```
┌────────┐                     ┌─────┐                   ┌──────────────────┐
│ Client │ ──(via readPump)──> │ Hub │ ──(via router)──> │ Module concerné  │
└────────┘                     └─────┘                   └──────────────────┘
```

## Formats des mesages WS

# Private message

```
Type: "private:sending"
Data: map[string]interface{}{
       "from_id": ,
       "from_username": ,
       "from_avatar": ,
       "to_id": ,
       "message_id": ,
       "message_content": ,
       "posted_at": ,
}
```

# Is-typing

```
Type: "private:typing"
Data: map[string]interface{}{
       "from_id": ,
       "from_username": ,
       "from_avatar": ,
       "to_id": ,
}
```
