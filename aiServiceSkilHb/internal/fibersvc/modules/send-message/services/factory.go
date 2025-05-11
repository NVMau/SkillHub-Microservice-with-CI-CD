package services

import (
	"aiServiceSkilHb/internal/repository"
	"os"

	"github.com/pkg/errors"
	"github.com/sashabaranov/go-openai"
	"go.uber.org/zap"
)

// ServiceFactory định nghĩa factory để khởi tạo các service
type ServiceFactory struct {
	logger        *zap.Logger
	knowledgeRepo repository.KnowledgeRepository
	openAIClient  *openai.Client
	courseAPIURL  string
}

// NewServiceFactory tạo một instance mới của ServiceFactory
func NewServiceFactory(logger *zap.Logger, knowledgeRepo repository.KnowledgeRepository) (*ServiceFactory, error) {
	// Lấy OpenAI API key từ biến môi trường
	openAIKey := os.Getenv("OPENAI_API_KEY")
	if openAIKey == "" {
		return nil, errors.New("OPENAI_API_KEY is required")
	}

	// Lấy Course API URL từ biến môi trường
	courseAPIURL := os.Getenv("COURSE_SERVICE_URL")
	if courseAPIURL == "" {
		courseAPIURL = "http://course-service:8083/api/courses"
	}

	// Khởi tạo OpenAI client
	openAIClient := openai.NewClient(openAIKey)

	return &ServiceFactory{
		logger:        logger,
		knowledgeRepo: knowledgeRepo,
		openAIClient:  openAIClient,
		courseAPIURL:  courseAPIURL,
	}, nil
}

// CreateKnowledgeService tạo một instance mới của KnowledgeService
func (f *ServiceFactory) CreateKnowledgeService() KnowledgeService {
	summaryService := f.CreateAISummaryService()
	return NewKnowledgeService(f.logger, f.knowledgeRepo, f.openAIClient, summaryService)
}

// CreateCourseService tạo một instance mới của CourseService
func (f *ServiceFactory) CreateCourseService() CourseService {
	summaryService := f.CreateAISummaryService()
	return NewCourseService(f.logger, f.openAIClient, f.courseAPIURL, summaryService)
}

// CreateAISummaryService tạo một instance mới của AISummaryService
func (f *ServiceFactory) CreateAISummaryService() AISummaryService {
	return NewAISummaryService(f.logger, f.openAIClient)
}

// CreateQuestionAnalyzerService tạo một instance mới của QuestionAnalyzerService
func (f *ServiceFactory) CreateQuestionAnalyzerService() QuestionAnalyzerService {
	knowledgeService := f.CreateKnowledgeService()
	courseService := f.CreateCourseService()
	summaryService := f.CreateAISummaryService()
	return NewQuestionAnalyzerService(f.logger, f.openAIClient, knowledgeService, courseService, summaryService)
}

// CreateChatService tạo một instance mới của ChatService
func (f *ServiceFactory) CreateChatService() ChatService {
	questionAnalyzer := f.CreateQuestionAnalyzerService()
	return NewChatServiceV2(f.logger, questionAnalyzer)
}
