package services

import (
	"context"

	"github.com/sashabaranov/go-openai"
)

// QuestionAnalyzerService định nghĩa interface cho việc phân tích câu hỏi
type QuestionAnalyzerService interface {
	// AnalyzeQuestionType phân tích loại câu hỏi và trả về function calls
	AnalyzeQuestionType(ctx context.Context, message string, chatHistory []ChatMessage) (*openai.ChatCompletionResponse, []ChatMessage, error)
	// HandleClassificationResponse xử lý kết quả từ function calls
	HandleClassificationResponse(ctx context.Context, response *openai.ChatCompletionResponse, chatHistory []ChatMessage, message string) (string, error)
}

// ChatMessage định nghĩa cấu trúc của một tin nhắn trong lịch sử chat
type ChatMessage struct {
	Role    string `json:"role"`    // "user" hoặc "assistant"
	Content string `json:"content"` // Nội dung tin nhắn
}

// KnowledgeService định nghĩa interface cho việc xử lý câu hỏi về kiến thức
type KnowledgeService interface {
	// HandleKnowledgeQuestion xử lý câu hỏi về Knowledge Base
	HandleKnowledgeQuestion(ctx context.Context, chatHistory []ChatMessage, query string) (string, error)
}

// CourseService định nghĩa interface cho xử lý câu hỏi về khóa học
type CourseService interface {
	HandleRetrievalData(ctx context.Context, chatHistory []ChatMessage, query string) (string, error)
}

// GeneralQuestionService định nghĩa interface cho việc xử lý câu hỏi thông thường
type GeneralQuestionService interface {
	// HandleGeneralQuestion xử lý câu hỏi thông thường
	HandleGeneralQuestion(ctx context.Context, message string) (string, error)
}

// AISummaryService định nghĩa interface cho việc tổng hợp kết quả
type AISummaryService interface {
	SummarizeResults(ctx context.Context, chatHistory []ChatMessage, functionMessages []openai.ChatCompletionMessage) (string, error)
}

// ChatService định nghĩa interface cho dịch vụ chat với AI
type ChatService interface {
	ProcessMessage(ctx context.Context, message string, chatHistory []ChatMessage) (string, error)
}
