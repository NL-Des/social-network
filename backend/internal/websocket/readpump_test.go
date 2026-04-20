package websocket_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	ws "social-network/backend/internal/websocket"

	gws "github.com/gorilla/websocket"
)

func TestReadPump(t *testing.T) {
    // Création du Hub
    hub := ws.NewHub()
	go hub.Run()
	defer close(hub.Quit)

    // Hook pour vérifier que RouteMessage est bien appelé
    called := false
    hub.OnMessage = func(c *ws.Client, raw []byte) {
        called = true
    }

    // Serveur WebSocket de test
    server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        upgrader := gws.Upgrader{}
        conn, _ := upgrader.Upgrade(w, r, nil)

        client := ws.NewClient(hub, conn, 1)
        hub.Register <- client

        go client.ReadPump()
    }))
    defer server.Close()

    // Connexion WebSocket côté client
    wsURL := "ws" + server.URL[4:]
    conn, _, _ := gws.DefaultDialer.Dial(wsURL, nil)
    defer conn.Close()

    // Envoi d’un message JSON
    conn.WriteMessage(gws.TextMessage, []byte(`{"type":"test"}`))

    // On laisse le temps au ReadPump de traiter le message
    time.Sleep(20 * time.Millisecond)

    if !called {
        t.Fatalf("RouteMessage should have been called")
    }
}
