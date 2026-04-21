package websocket

import (
	"social-network/backend/internal/websocket/utils"
	"sync"
)

type MessageRouter interface {
    Route(h *Hub, c *Client, raw []byte)
}

type Hub struct {
	//Map des clients connectés : plus efficace qu'une liste. Le booléen est toujours égal à VRAI
    Clients    map[*Client]bool 
	//Channels de connection et déconnection: 
	// Un client qui se connecte/déconnecte est envoyé dessus, 
	// le hub écoute en permanence et agit en conséquence
    Register   chan *Client
    Unregister chan *Client
	//Nécessaire pour la lecture/écriture simultanée dans clients via des goroutines
    Mu         sync.RWMutex
    Router     MessageRouter
    Quit       chan struct{} // Pour fermer le hub lors des tests
    OnMessage func(c *Client, raw []byte) //Temporaires, Pour les tests
    
}

type MessageWs struct {
    Type string      `json:"type"`
    Data interface{} `json:"data"`
}


// Constructeur : créé un hub vide
func NewHub(router MessageRouter) *Hub {
    return &Hub{
        Clients:    make(map[*Client]bool),
        Register:   make(chan *Client),
        Unregister: make(chan *Client),
        Router:     router,
        Quit:       make(chan struct{}),
    }
}

//Coeur du hub : doit être lancé en goroutine.
//Écoute permanente des channels register et unregister

//Le mu.Lock/Unlock sert à vérouiller/dévérouiller l'écriture sur la map clients à une seule goroutine. 
//Nécessaire pour éviter d'avoir plusieurs goroutine qui tentent de modifier la même variable en même temps.

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.Register:
            h.Mu.Lock()
            h.Clients[client] = true
            h.Mu.Unlock()
		
        case client := <-h.Unregister:
            h.Mu.Lock()
            if _, ok := h.Clients[client]; ok {
                delete(h.Clients, client)
                close(client.Send)
            }
            h.Mu.Unlock()
            case <-h.Quit:
                return
        }
    }
}

//Un utilisateurs peut avoir plusieurs clients (plusieurs onglet, plusieurs navigateurs, etc.)
//La fonction transmet le message à tous les clients d'un même utilisateur
func (h *Hub) BroadcastToUser(userID int, message MessageWs) {
    h.Mu.RLock()
    defer h.Mu.RUnlock()

    for client := range h.Clients {
        if client.UserID == userID {
            jsonBytes, _ := utils.EncodeMessage(message)
			client.Send <- jsonBytes

        }
    }
}

func (h *Hub) RouteMessage(c *Client, raw []byte) {
    if h.OnMessage != nil {
        h.OnMessage(c, raw)
        return
    }

    h.Router.Route(h, c, raw)
}
