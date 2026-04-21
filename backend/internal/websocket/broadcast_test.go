package websocket_test

import (
	"social-network/backend/internal/websocket"
	"social-network/backend/internal/websocket/router"
	"social-network/backend/internal/websocket/utils"
	"testing"
	"time"
)

func TestBroadcastToUser(t *testing.T) {
    router := &router.DefaultRouter{}
    hub := websocket.NewHub(router)
    go hub.Run()
	defer close(hub.Quit)

    client := &websocket.Client{
        Hub: hub,
        Send: make(chan []byte, 1),
        UserID: 42,
    }

    hub.Register <- client

    msg := websocket.MessageWs{
        Type: "test",
        Data: "hello",
    }

    hub.BroadcastToUser(42, msg)

    select {
    case data := <-client.Send:
        decoded := make(map[string]interface{})
        utils.DecodeMessage(data, &decoded)

        if decoded["type"] != "test" {
            t.Fatalf("expected type 'test', got %v", decoded["type"])
        }
    case <-time.After(time.Second):
        t.Fatalf("no message received in client.Send")
    }
}
