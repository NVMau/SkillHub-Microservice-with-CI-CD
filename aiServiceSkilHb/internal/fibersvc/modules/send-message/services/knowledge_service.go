package services

import (
	"aiServiceSkilHb/internal/repository"
	"context"
	"fmt"

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

	// Nếu không tìm thấy kết quả, gửi xuống AISummaryService
	if len(results) == 0 {
		if len(results) == 0 {
			results = []*repository.Knowledge{
				{
					ID:      "no-data",
					Title:   "No Knowledge Found",
					Content: "Don't have data in knowledge base.",
				},
			}
		}
	}

	// Chuẩn bị dữ liệu từ Knowledge Base
	var knowledgeData string
	for i, result := range results {
		knowledgeData += fmt.Sprintf("Kiến thức %d:\nTiêu đề: %s\nNội dung: %s\n\n", i+1, result.Title, result.Content)
	}

	// Sử dụng GPT-4 để tạo câu trả lời dựa trên dữ liệu từ Knowledge Base
	resp, err := s.openAIClient.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: openai.GPT4,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: "Bạn là một trợ lý AI thông minh. Hãy sử dụng thông tin từ Knowledge Base để trả lời câu hỏi của người dùng. Nếu thông tin không đủ, hãy thông báo cho người dùng biết.",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: fmt.Sprintf("Câu hỏi: %s\n\nThông tin từ Knowledge Base:\n%s", query, knowledgeData),
				},
			},
			Temperature: 0.7,
		},
	)

	if err != nil {
		return "", errors.Wrap(err, "failed to generate response from knowledge base")
	}

	return resp.Choices[0].Message.Content, nil
}
