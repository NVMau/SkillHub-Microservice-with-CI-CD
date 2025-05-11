package send_message

import (
	"aiServiceSkilHb/internal/repository"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

// RegisterRoutes đăng ký các routes cho module send-message
func RegisterRoutes(app *fiber.App, logger *zap.Logger, knowledgeRepo repository.KnowledgeRepository) error {
	// Khởi tạo handler
	handler, err := NewHandler(logger, knowledgeRepo)
	if err != nil {
		return err
	}

	// Đăng ký routes
	api := app.Group("/api/v1/chat")
	api.Post("/send", handler.SendMessage)

	return nil
}
