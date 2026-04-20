package websocket

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true // à sécuriser plus tard, accepte des connexions venues de partout pour le moment
    },
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request, userID int64) {
    // 1. Upgrade HTTP → WebSocket
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        return
    }

    // 2. Créer un nouveau client
    client := NewClient(hub, conn, userID)

    // 3. Enregistrer le client dans le Hub
    hub.Register <- client

    // 4. Lancer les goroutines
    go client.WritePump()
    go client.ReadPump()
}
