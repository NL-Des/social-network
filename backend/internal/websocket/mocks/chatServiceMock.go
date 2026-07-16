package mocks

import (
	"fmt"
	"social-network/backend/internal/model"
)

type ChatServiceMock struct {
	LastMessage model.Message
	ShouldFail  bool
}

func (m *ChatServiceMock) CreateNewMessage(msg model.Message) error {
	m.LastMessage = msg
	if m.ShouldFail {
		return fmt.Errorf("mock error")
	}
	return nil
}
