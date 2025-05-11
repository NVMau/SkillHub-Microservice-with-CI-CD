package fibersvc

import (
	"aiServiceSkilHb/internal/fibersvc/modules/healthz"
	send_message "aiServiceSkilHb/internal/fibersvc/modules/send-message"
	"aiServiceSkilHb/internal/repository"
	"os"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func SetupRoutes(app *fiber.App, logSvc *zap.Logger, mongoRepo *repository.Mongo, qdrantRepo repository.QdrantRepository) {
	healthz.Handler(app)

	// Tạo Knowledge Repository từ Qdrant Repository
	openAIKey := os.Getenv("OPENAI_API_KEY")
	knowledgeRepo := repository.NewKnowledgeRepository(qdrantRepo, openAIKey)

	// Đăng ký module send-message
	err := send_message.RegisterRoutes(app, logSvc, knowledgeRepo)
	if err != nil {
		logSvc.Error("Failed to register send-message routes", zap.Error(err))
	}
}
