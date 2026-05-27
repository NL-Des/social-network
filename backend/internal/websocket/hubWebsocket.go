package websocket

import (
	"fmt"
	"social-network/backend/internal/websocket/utils"
	"sync"
)

type Hub struct {
	Clients    map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Mu         sync.RWMutex
	Quit       chan struct{}
	OnMessage  func(c *Client, raw []byte)
}

type MessageWs struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Quit:       make(chan struct{}),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mu.Lock()
			h.Clients[client] = true
			onlineIDs := h.onlineUserIDsLocked(client.UserID)
			h.Mu.Unlock()

			go h.sendToClient(client, MessageWs{
				Type: "users_online",
				Data: map[string]interface{}{"user_ids": onlineIDs},
			})
			go h.BroadcastToAll(MessageWs{
				Type: "user_online",
				Data: map[string]interface{}{"user_id": client.UserID},
			}, client.UserID)

		case client := <-h.Unregister:
			var broadcast bool
			h.Mu.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
				broadcast = !h.userIsConnectedLocked(client.UserID)
			}
			h.Mu.Unlock()

			if broadcast {
				go h.BroadcastToAll(MessageWs{
					Type: "user_offline",
					Data: map[string]interface{}{"user_id": client.UserID},
				}, -1)
			}

		case <-h.Quit:
			return
		}
	}
}

func (h *Hub) onlineUserIDsLocked(excludeUserID int64) []int64 {
	seen := make(map[int64]bool)
	ids := make([]int64, 0)
	for c := range h.Clients {
		if c.UserID != excludeUserID && !seen[c.UserID] {
			seen[c.UserID] = true
			ids = append(ids, c.UserID)
		}
	}
	return ids
}

func (h *Hub) userIsConnectedLocked(userID int64) bool {
	for c := range h.Clients {
		if c.UserID == userID {
			return true
		}
	}
	return false
}

func (h *Hub) sendToClient(client *Client, msg MessageWs) {
	jsonBytes, err := utils.EncodeMessage(msg)
	if err != nil {
		return
	}
	select {
	case client.Send <- jsonBytes:
	default:
	}
}

func (h *Hub) BroadcastToAll(message MessageWs, excludeUserID int64) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	jsonBytes, err := utils.EncodeMessage(message)
	if err != nil {
		return
	}
	for client := range h.Clients {
		if client.UserID == excludeUserID {
			continue
		}
		select {
		case client.Send <- jsonBytes:
		default:
		}
	}
}

func (h *Hub) BroadcastToUser(userID int64, message MessageWs) {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	jsonBytes, _ := utils.EncodeMessage(message)
	for client := range h.Clients {
		if client.UserID == userID {
			select {
			case client.Send <- jsonBytes:
			default:
			}
		}
	}
}

func (h *Hub) RouteMessage(c *Client, raw []byte) {
	if h.OnMessage != nil {
		h.OnMessage(c, raw)
		return
	}

	fmt.Println("Message reçu :", string(raw))
}
