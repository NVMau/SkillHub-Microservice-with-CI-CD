package services

import (
	"aiServiceSkilHb/internal/repository"
	"context"

	"github.com/pkg/errors"
	"github.com/sashabaranov/go-openai"
	"go.uber.org/zap"
)

// KnowledgeServiceImpl triển khai KnowledgeService
type KnowledgeServiceImpl struct {
	logger         *zap.Logger
	knowledgeRepo  repository.KnowledgeRepository
	openAIClient   *openai.Client
	summaryService AISummaryService
}

// NewKnowledgeService tạo một instance mới của KnowledgeService
func NewKnowledgeService(
	logger *zap.Logger,
	knowledgeRepo repository.KnowledgeRepository,
	openAIClient *openai.Client,
	summaryService AISummaryService,
) KnowledgeService {
	return &KnowledgeServiceImpl{
		logger:         logger,
		knowledgeRepo:  knowledgeRepo,
		openAIClient:   openAIClient,
		summaryService: summaryService,
	}
}

// HandleKnowledgeQuestion xử lý câu hỏi về Knowledge Base
func (s *KnowledgeServiceImpl) HandleKnowledgeQuestion(ctx context.Context, chatHistory []ChatMessage, query string) (string, error) {
	// Tìm kiếm trong Knowledge Base
	results, err := s.knowledgeRepo.Search(ctx, query, 5)
	if err != nil {
		return "", errors.Wrap(err, "failed to search knowledge base")
	}

	// Nếu không tìm thấy kết quả
	if len(results) == 0 {
		return "Xin lỗi, tôi không tìm thấy thông tin phù hợp trong cơ sở dữ liệu.", nil
	}

	// Trả về nội dung của kết quả đầu tiên
	return results[0].Content, nil
}
