package websocket

import (
	"time"

	"github.com/gorilla/websocket"
)

const (
    writeWait = 10 * time.Second      // délai max pour écrire sur la WS
    pongWait  = 60 * time.Second      // délai max pour recevoir un pong
    pingPeriod = (pongWait * 9) / 10  // fréquence des pings
)


type Client struct {
    Hub *Hub

    // Conn :
    //  - connexion WebSocket Gorilla
    //  - utilisée pour lire/écrire les messages réseau
    Conn *websocket.Conn

    //"File d'attente" -> stock les messages du hub à destination du client 
	//le temps qu'ils soient envoyés au websocket du client
    Send chan []byte
    UserID int
    Username string
    UserAvatar string
}

//Constructeur
func NewClient(hub *Hub, conn *websocket.Conn, userID int) *Client {
    return &Client{
        Hub:    hub,
        Conn:   conn,
        // Channel bufferisé :
        //  - taille 256 messages
        //  - évite de bloquer immédiatement si le client ne lit pas assez vite
        Send:   make(chan []byte, 256),
        UserID: userID,
    }
}

func (c *Client) WritePump() {
    ticker := time.NewTicker(pingPeriod)
    defer func() {
        ticker.Stop()
        c.Conn.Close()
    }()

    for {
        select {
        // Le Hub a envoyé un message dans client.send
        case message, ok := <-c.Send:
            c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
            if !ok {
                // Le Hub a fermé le channel → on ferme la WS
                c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
                return
            }

            // Envoi du message au client
            if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
                return
            }

        // Ping régulier pour garder la connexion vivante
        case <-ticker.C:
            c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
            if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
                return
            }
        }
    }
}


func (c *Client) ReadPump() {
    defer func() {
        // Quand readPump se termine, la connexion est morte
        c.Hub.Unregister <- c
        c.Conn.Close()
    }()

    c.Conn.SetReadLimit(512)
    c.Conn.SetReadDeadline(time.Now().Add(pongWait))
    c.Conn.SetPongHandler(func(string) error {
        c.Conn.SetReadDeadline(time.Now().Add(pongWait))
        return nil
    })

    for {
        _, message, err := c.Conn.ReadMessage()
        if err != nil {
            break
        }

        // On transmet le message brut au Hub
        c.Hub.RouteMessage(c, message)
    }
}
