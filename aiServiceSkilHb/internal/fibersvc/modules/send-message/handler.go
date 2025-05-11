package send_message

import (
	"aiServiceSkilHb/internal/fibersvc/modules/send-message/services"
	"aiServiceSkilHb/internal/repository"
	"context"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type Handler struct {
	logger         *zap.Logger
	serviceFactory *services.ServiceFactory
}

func NewHandler(logger *zap.Logger, knowledgeRepo repository.KnowledgeRepository) (*Handler, error) {
	serviceFactory, err := services.NewServiceFactory(logger, knowledgeRepo)
	if err != nil {
		return nil, err
	}

	return &Handler{
		logger:         logger,
		serviceFactory: serviceFactory,
	}, nil
}

// ChatMessage định nghĩa cấu trúc của một tin nhắn trong lịch sử chat
type ChatMessage struct {
	Role    string `json:"role"`    // "user" hoặc "assistant"
	Content string `json:"content"` // Nội dung tin nhắn
}

// SendMessageRequest định nghĩa cấu trúc request
type SendMessageRequest struct {
	Message     string        `json:"message"`     // Tin nhắn hiện tại
	ChatHistory []ChatMessage `json:"chatHistory"` // Lịch sử chat
}

// SendMessageResponse định nghĩa cấu trúc response
type SendMessageResponse struct {
	Response string `json:"response"`
}

// SendMessage xử lý request gửi tin nhắn
func (h *Handler) SendMessage(c *fiber.Ctx) error {
	// Parse request body
	var req SendMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Message is required",
		})
	}

	// Lấy token từ header
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authorization header is required",
		})
	}

	// Kiểm tra format của token
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid authorization header format",
		})
	}
	token := parts[1]
	h.logger.Info("Token",
		zap.Any("Token", token))
	// Tạo context với timeout và token
	ctx, cancel := context.WithTimeout(c.Context(), 60*time.Second)
	defer cancel()

	// Thêm token vào context với key từ package services
	ctx = context.WithValue(ctx, services.TokenKeyValue, token)

	// Lấy chat service từ factory
	chatService := h.serviceFactory.CreateChatService()

	// Chuyển đổi ChatMessage từ handler sang services
	chatHistory := make([]services.ChatMessage, len(req.ChatHistory))
	for i, msg := range req.ChatHistory {
		chatHistory[i] = services.ChatMessage{
			Role:    msg.Role,
			Content: msg.Content,
		}
	}

	// Xử lý tin nhắn
	response, err := chatService.ProcessMessage(ctx, req.Message, chatHistory)
	if err != nil {
		h.logger.Error("Failed to process message",
			zap.String("message", req.Message),
			zap.Error(err),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process message",
		})
	}

	// Trả về response
	return c.JSON(SendMessageResponse{
		Response: response,
	})
}
