package services

import (
	"context"

	"github.com/pkg/errors"
	"go.uber.org/zap"
)

// ChatServiceImplV2 triển khai ChatService
type ChatServiceImplV2 struct {
	logger           *zap.Logger
	questionAnalyzer QuestionAnalyzerService
}

// NewChatServiceV2 tạo một instance mới của ChatService
func NewChatServiceV2(
	logger *zap.Logger,
	questionAnalyzer QuestionAnalyzerService,
) ChatService {
	return &ChatServiceImplV2{
		logger:           logger,
		questionAnalyzer: questionAnalyzer,
	}
}

// ProcessMessage xử lý tin nhắn từ người dùng
func (s *ChatServiceImplV2) ProcessMessage(ctx context.Context, message string, chatHistory []ChatMessage) (string, error) {
	// Phân tích câu hỏi và lấy function calls
	response, chatHistory, err := s.questionAnalyzer.AnalyzeQuestionType(ctx, message, chatHistory)
	if err != nil {
		return "", errors.Wrap(err, "failed to analyze question type")
	}

	// Log response để debug
	s.logger.Info("Question analysis response",
		zap.String("message", message),
		zap.Any("response", response),
	)

	// Xử lý response dựa trên function calls
	if len(response.Choices) > 0 {
		if len(response.Choices[0].Message.ToolCalls) > 0 {
			// Log tất cả các tool calls
			for i, toolCall := range response.Choices[0].Message.ToolCalls {
				s.logger.Info("Tool call details",
					zap.Int("index", i),
					zap.String("function", toolCall.Function.Name),
					zap.String("arguments", toolCall.Function.Arguments),
				)
			}
			s.logger.Info("result",
				zap.Any("result", response),
			)

			// Xử lý kết quả từ tất cả các function calls
			result, err := s.questionAnalyzer.HandleClassificationResponse(ctx, response, chatHistory, message)
			if err != nil {
				return "", errors.Wrap(err, "failed to handle classification response")
			}

			return result, nil
		} else {
			s.logger.Info("No tool calls")
			result, err := s.questionAnalyzer.HandleClassificationResponse(ctx, response, chatHistory, message)
			if err != nil {
				return "", errors.Wrap(err, "failed to handle classification response")
			}
			return result, nil
		}
	}

	return "", nil
}
