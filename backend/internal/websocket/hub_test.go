package websocket_test

import (
	"social-network/backend/internal/websocket"
	"social-network/backend/internal/websocket/router"
	"testing"
	"time"
)

func TestHubRegister(t *testing.T) {
    hub := websocket.NewHub(&router.DefaultRouter{})

    go hub.Run()
	defer close(hub.Quit)

    client := &websocket.Client{
        Hub: hub,
        Send: make(chan []byte, 1),
        UserID: 1,
    }

    hub.Register <- client

    time.Sleep(10 * time.Millisecond)

    hub.Mu.RLock()
    defer hub.Mu.RUnlock()

    if !hub.Clients[client] {
        t.Fatalf("client should be registered")
    }
}

func TestHubUnregister(t *testing.T) {
    hub := websocket.NewHub(&router.DefaultRouter{})
    go hub.Run()

    client := &websocket.Client{
        Hub: hub,
        Send: make(chan []byte, 1),
        UserID: 1,
    }

    hub.Register <- client
    hub.Unregister <- client

    time.Sleep(10 * time.Millisecond)

    hub.Mu.RLock()
    defer hub.Mu.RUnlock()

    if hub.Clients[client] {
        t.Fatalf("client should be unregistered")
    }
}
