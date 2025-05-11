package fibersvc

import (
	"aiServiceSkilHb/internal/fibersvc/modules/knowledge"
	send_message "aiServiceSkilHb/internal/fibersvc/modules/send-message"
	"aiServiceSkilHb/internal/repository"
	"context"
	"os"
	"time"

	"github.com/gofiber/contrib/fiberzap"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type FiberSvc struct {
	app           *fiber.App
	logger        *zap.Logger
	ctx           context.Context
	QdrantRepo    repository.QdrantRepository
	KnowledgeRepo repository.KnowledgeRepository
}

func NewFiberSvc(ctx context.Context, logger *zap.Logger, qdrantRepo repository.QdrantRepository) (*FiberSvc, error) {
	openAIKey := os.Getenv("OPENAI_API_KEY")
	if openAIKey == "" {
		return nil, errors.New("OPENAI_API_KEY is required")
	}

	app := fiber.New(fiber.Config{
		AppName:               "AI Service",
		DisableStartupMessage: true,
		IdleTimeout:           10 * time.Second,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError

			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			logger.Error("Request error", zap.Error(err))
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(fiberzap.New(fiberzap.Config{
		Logger: logger.Named("fiber"),
	}))
	// Bỏ qua cấu hình CORS tại microservice vì đã được xử lý bởi API Gateway

	svc := &FiberSvc{
		app:           app,
		logger:        logger,
		ctx:           ctx,
		QdrantRepo:    qdrantRepo,
		KnowledgeRepo: repository.NewKnowledgeRepository(qdrantRepo, openAIKey),
	}

	return svc, nil
}

func (f *FiberSvc) Start() error {
	// Setup routes
	knowledge.SetupRoutes(f.app, knowledge.NewHandler(f.KnowledgeRepo))

	// Setup send-message routes
	if err := send_message.RegisterRoutes(f.app, f.logger, f.KnowledgeRepo); err != nil {
		return errors.Wrap(err, "failed to register send-message routes")
	}

	// Start server
	port := os.Getenv("AI_SERVICE_PORT")
	if port == "" {
		port = "3000"
	}

	f.logger.Info("Starting server", zap.String("port", port))
	return f.app.Listen(":" + port)
}

func (f *FiberSvc) Close() error {
	f.logger.Info("Shutting down server")
	return f.app.Shutdown()
}
