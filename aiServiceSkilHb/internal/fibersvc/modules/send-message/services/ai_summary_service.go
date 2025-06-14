package services

import (
	"context"

	"github.com/pkg/errors"
	"github.com/sashabaranov/go-openai"
	"go.uber.org/zap"
)

// AISummaryServiceImpl triển khai AISummaryService
type AISummaryServiceImpl struct {
	logger       *zap.Logger
	openAIClient *openai.Client
}

// NewAISummaryService tạo một instance mới của AISummaryService
func NewAISummaryService(logger *zap.Logger, openAIClient *openai.Client) AISummaryService {
	return &AISummaryServiceImpl{
		logger:       logger,
		openAIClient: openAIClient,
	}
}

// SummarizeResults tổng hợp kết quả từ các function calls
func (s *AISummaryServiceImpl) SummarizeResults(ctx context.Context, chatHistory []ChatMessage, functionMessages []openai.ChatCompletionMessage) (string, error) {
	systemMessage := `## Role You are an AI assistant responsible for summarizing and presenting the output of function calls in a clear and concise way. ## Language Handling - If the user's input is in Vietnamese, your output MUST also be in Vietnamese. - Do not translate between languages unless explicitly instructed. ## Handling Tool Responses - Collect and return the function call results exactly as received. - You may reformat or rephrase the content for clarity, but DO NOT alter or add new meaning. - If the result contains **image links** (e.g., markdown image syntax or direct URLs), **preserve and display them clearly** in the output. ## Tone and Style - Write in a friendly and natural tone. - Speak like a helpful assistant, but avoid unnecessary apologies or introductions. ## Output Instructions - Preserve the original facts and structure from the function call results. - Only summarize or clean up formatting if it improves clarity for the user. - If the output includes **image links**, **make sure they are displayed clearly**, using markdown or raw URLs as appropriate.`

	// Bắt đầu với message hệ thống
	messages := []openai.ChatCompletionMessage{
		{
			Role:    openai.ChatMessageRoleSystem,
			Content: systemMessage,
		},
	}

	// Thêm chatHistory vào messages
	for _, msg := range chatHistory {
		role := openai.ChatMessageRoleUser
		if msg.Role == "assistant" {
			role = openai.ChatMessageRoleAssistant
		}
		messages = append(messages, openai.ChatCompletionMessage{
			Role:    role,
			Content: msg.Content,
		})
	}

	// Thêm function messages vào cuối
	messages = append(messages, functionMessages...)
	s.logger.Info("Processing messages for summary", zap.Any("functionMessages", functionMessages))

	s.logger.Info("Processing messages for summary",
		zap.Int("chat_history_count", len(chatHistory)),
		zap.Int("function_messages_count", len(functionMessages)),
		zap.Any("messages", messages))

	resp, err := s.openAIClient.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model:    "gpt-4-1106-preview",
			Messages: messages,
		},
	)

	if err != nil {
		return "", errors.Wrap(err, "failed to summarize results")
	}

	return resp.Choices[0].Message.Content, nil
}
