package websocket

import (
	"github.com/gorilla/websocket"
)


type Client struct {
    Hub *Hub

    // Conn :
    //  - connexion WebSocket Gorilla
    //  - utilisée pour lire/écrire les messages réseau
    Conn *websocket.Conn

    //"File d'attente" -> stock les messages du hub à destination du client 
	//le temps qu'ils soient envoyés au websocket du client
    send chan []byte
    UserID int64
}

//Constructeur
func NewClient(hub *Hub, conn *websocket.Conn, userID int64) *Client {
    return &Client{
        Hub:    hub,
        Conn:   conn,
        // Channel bufferisé :
        //  - taille 256 messages
        //  - évite de bloquer immédiatement si le client ne lit pas assez vite
        send:   make(chan []byte, 256),
        UserID: userID,
    }
}
