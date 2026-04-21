package privateMessageWS

import (
	"encoding/json"
	"fmt"
	"social-network/backend/internal/model"
	"social-network/backend/internal/websocket"
	"time"
)

type PrivateSendingPayload struct {
    ToID           int  `json:"to_id"`
    MessageContent string `json:"message_content"`
}


func HandleSending(h *websocket.Hub, c *websocket.Client, data interface{}) {
    // Convertir data → struct
    var payload PrivateSendingPayload

    jsonBytes, err := json.Marshal(data)
    if err != nil {
        fmt.Println("WS payload marshal error:", err)
        return
    }

    if err := json.Unmarshal(jsonBytes, &payload); err != nil {
        fmt.Println("WS payload unmarshal error:", err)
        return
    }

    // Création du message SQL
    message := model.Message{
        SenderID:   c.UserID,
        ReceiverID: payload.ToID,
        Content:    payload.MessageContent,
        CreatedAt:  time.Now(),
        UpdatedAt:  time.Now(),
    }

    // TODO : insert en BDD → message.ID rempli

    // Construction du message final WS
    msg := websocket.MessageWs{
        Type: "private:sending",
        Data: map[string]interface{}{
            "from_id":         c.UserID,
            "from_username":   c.Username,
            "from_avatar":     c.UserAvatar,
            "to_id":           payload.ToID,
            "message_id":      message.ID,
            "message_content": message.Content,
            "posted_at":       message.CreatedAt,
        },
    }

    // Envoi au destinataire
    h.BroadcastToUser(payload.ToID, msg)

    // Envoi à l’expéditeur (pour affichage immédiat)
    h.BroadcastToUser(c.UserID, msg)
}

