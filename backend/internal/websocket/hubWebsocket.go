package websocket

import (
	"fmt"
	"social-network/backend/internal/websocket/utils"
	"sync"
)

type Hub struct {
	//Map des clients connectés : plus efficace qu'une liste. Le booléen est toujours égal à VRAI
    clients    map[*Client]bool 
	//Channels de connection et déconnection: 
	// Un client qui se connecte/déconnecte est envoyé dessus, 
	// le hub écoute en permanence et agit en conséquence
    register   chan *Client
    unregister chan *Client
	//Nécessaire pour la lecture/écriture simultanée dans clients via des goroutines
    mu         sync.RWMutex
}

type MessageWs struct {
    Type string      `json:"type"`
    Data interface{} `json:"data"`
}


// Constructeur : créé un hub vide
func NewHub() *Hub {
    return &Hub{
        clients:    make(map[*Client]bool),
        register:   make(chan *Client),
        unregister: make(chan *Client),
    }
}

//Coeur du hub : doit être lancé en goroutine.
//Écoute permanente des channels register et unregister

//Le mu.Lock/Unlock sert à vérouiller/dévérouiller l'écriture sur la map clients à une seule goroutine. 
//Nécessaire pour éviter d'avoir plusieurs goroutine qui tentent de modifier la même variable en même temps.

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.mu.Lock()
            h.clients[client] = true
            h.mu.Unlock()
		
        case client := <-h.unregister:
            h.mu.Lock()
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                close(client.send)
            }
            h.mu.Unlock()
        }
    }
}

//Un utilisateurs peut avoir plusieurs clients (plusieurs onglet, plusieurs navigateurs, etc.)
//La fonction transmet le message à tous les clients d'un même utilisateur
func (h *Hub) BroadcastToUser(userID int64, message MessageWs) {
    h.mu.RLock()
    defer h.mu.RUnlock()

    for client := range h.clients {
        if client.UserID == userID {
            jsonBytes, _ := utils.EncodeMessage(message)
			client.send <- jsonBytes

        }
    }
}

func (h *Hub) RouteMessage(c *Client, raw []byte) {
    // Pour l'instant on log, plus tard on branchera le router
    fmt.Println("Message reçu :", string(raw))
}
