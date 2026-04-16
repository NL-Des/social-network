package websocket_test

import (
	"net/http"
	"net/http/httptest"
	"social-network/backend/internal/websocket"
	"strings"
	"testing"

	gws "github.com/gorilla/websocket"
)

func TestWritePump(t *testing.T) {
    hub := websocket.NewHub()
    go hub.Run()
	defer close(hub.Quit)

    server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        upgrader := gws.Upgrader{}
        conn, _ := upgrader.Upgrade(w, r, nil)

        client := websocket.NewClient(hub, conn, 1)
        hub.Register <- client

        go client.WritePump()
    }))
    defer server.Close()

    wsURL := "ws" + server.URL[4:]
    conn, _, _ := gws.DefaultDialer.Dial(wsURL, nil)
    defer conn.Close()

    hub.BroadcastToUser(1, websocket.MessageWs{
        Type: "ping",
        Data: "hello",
    })

    _, data, err := conn.ReadMessage()
    if err != nil {
        t.Fatalf("failed to read WS message: %v", err)
    }

    if !strings.Contains(string(data), "ping") {
        t.Fatalf("expected WS message to contain 'ping'")
    }
}
