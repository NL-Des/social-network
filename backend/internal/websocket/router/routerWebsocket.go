package router

import (
	"encoding/json"
	"fmt"
	"social-network/backend/internal/websocket"
	privateMessageWS "social-network/backend/internal/websocket/modules/privateMessage"
)

type DefaultRouter struct{}

func (r *DefaultRouter) Route(h *websocket.Hub, c *websocket.Client, raw []byte) {
    var msg websocket.MessageWs
    if err := json.Unmarshal(raw, &msg); err != nil {
        fmt.Println("Invalid WS message:", err)
        return
    }

    switch msg.Type {
    case "private:sending":
        privateMessageWS.HandleSending(h, c, msg.Data)
    default:
        fmt.Println("Unknown WS message type:", msg.Type)
    }
}

