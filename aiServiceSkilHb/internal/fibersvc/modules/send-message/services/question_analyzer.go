package services

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/pkg/errors"
	"github.com/sashabaranov/go-openai"
	"go.uber.org/zap"
)

// QuestionAnalyzerServiceImpl triển khai QuestionAnalyzerService
type QuestionAnalyzerServiceImpl struct {
	logger           *zap.Logger
	openAIClient     *openai.Client
	knowledgeService KnowledgeService
	courseService    CourseService
	summaryService   AISummaryService
}

// NewQuestionAnalyzerService tạo một instance mới của QuestionAnalyzerService
func NewQuestionAnalyzerService(
	logger *zap.Logger,
	openAIClient *openai.Client,
	knowledgeService KnowledgeService,
	courseService CourseService,
	summaryService AISummaryService,
) QuestionAnalyzerService {
	return &QuestionAnalyzerServiceImpl{
		logger:           logger,
		openAIClient:     openAIClient,
		knowledgeService: knowledgeService,
		courseService:    courseService,
		summaryService:   summaryService,
	}
}

// toolCallResult định nghĩa kết quả từ một tool call
type toolCallResult struct {
	content    string
	toolCallID string
	err        error
	ctx        context.Context
}

// AIDefinition định nghĩa các function có sẵn cho AI
func AIDefinition() []openai.Tool {
	return []openai.Tool{
		{
			Type: openai.ToolTypeFunction,
			Function: &openai.FunctionDefinition{
				Name:        "ai-knowledge",
				Description: "Sử dụng function này khi người dùng hỏi về kiến thức, FAQ, hướng dẫn xử lý sự cố hoặc thông tin chung",
				Parameters: map[string]interface{}{
					"type": "object",
					"required": []string{
						"query",
					},
					"properties": map[string]interface{}{
						"query": map[string]interface{}{
							"type":        "string",
							"description": "Câu hỏi của người dùng",
						},
					},
					"additionalProperties": false,
				},
			},
		},
		{
			Type: openai.ToolTypeFunction,
			Function: &openai.FunctionDefinition{
				Name:        "ai-retrieval-data",
				Description: "Sử dụng function này khi người dùng yêu cầu thông tin về khóa học",
				Parameters: map[string]interface{}{
					"type": "object",
					"required": []string{
						"query",
					},
					"properties": map[string]interface{}{
						"query": map[string]interface{}{
							"type":        "string",
							"description": "Câu hỏi của người dùng về khóa học",
						},
					},
					"additionalProperties": false,
				},
			},
		},
	}
}

// AnalyzeQuestionType phân tích loại câu hỏi
func (s *QuestionAnalyzerServiceImpl) AnalyzeQuestionType(ctx context.Context, message string, chatHistory []ChatMessage) (*openai.ChatCompletionResponse, []ChatMessage, error) {
	// Tạo system message với prompting mới
	systemMessage := fmt.Sprintf(`# Trợ lý AI SkillHub

Bạn là một Trợ lý AI có nhiệm vụ xác định các function cần gọi dựa trên yêu cầu của người dùng.

# Ngữ cảnh Đầu vào
- *Trang người dùng hiện tại:* %s 

## Các Function có sẵn:
### ai-knowledge: 
Sử dụng function này khi người dùng hỏi về bài viết trong cơ sở kiến thức, câu hỏi thường gặp, hướng dẫn xử lý sự cố hoặc thông tin chung.
- Ví dụ:
- "Làm thế nào để tạo khóa học mới?"
- "Làm thế nào để học tập hiệu quả hơn?"
- "Làm thế nào để mua khóa học?"

### ai-retrieval-data
Sử dụng function này khi người dùng yêu cầu thông tin về khóa học.
- Cung cấp phân tích dữ liệu thời gian thực và lịch sử để hỗ trợ quyết định.
- AI phải gọi function này nếu yêu cầu thuộc một trong các danh mục sau:

  1. Thông tin khóa học
     - Tên khóa học, giá khóa học, tên giảng viên
     - Lợi nhuận, dòng tiền, chi phí vận hành
     - Ví dụ: "Gợi ý cho tôi một số khóa học về Golang?"

#QUAN TRỌNG:
Tham số "query" trong tool_calls phải sử dụng ngôn ngữ phù hợp với ngôn ngữ của người dùng

# Xử lý Nhiều Function:
- Nếu câu hỏi của người dùng chứa nhiều yêu cầu khác nhau, bạn PHẢI gọi nhiều function
- Ví dụ: "Cho tôi xem các khóa học Go và cách tạo khóa học" sẽ kích hoạt:
  1. ai-retrieval-data cho "Cho tôi xem các khóa học Go"
  2. ai-knowledge cho "cách tạo khóa học"
- Mỗi yêu cầu riêng biệt phải có function call riêng
- Không kết hợp nhiều yêu cầu vào một function call
- QUAN TRỌNG: Sử dụng tham số tool_calls để trả về các function call, không trả về nội dung

# Xử lý Câu hỏi Không Liên quan hoặc Không Rõ ràng:
- Nếu câu hỏi *không khớp với bất kỳ function nào ở trên*, AI *phải từ chối yêu cầu một cách rõ ràng*.
- AI *không được cố gắng đưa ra câu trả lời không liên quan* hoặc hướng người dùng quay lại chủ đề học tập.

## Định dạng Đầu ra:
- Trả về các function call bằng tham số tool_calls
- Không trả về bất kỳ nội dung nào trong message
- Mỗi function call phải có ID duy nhất
- Các tham số phải được định dạng JSON đúng chuẩn`, "Chat Page")

	// Tạo messages cho OpenAI
	messages := []openai.ChatCompletionMessage{
		{
			Role:    openai.ChatMessageRoleSystem,
			Content: systemMessage,
		},
	}

	// Thêm lịch sử chat vào messages
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

	// Thêm tin nhắn hiện tại
	messages = append(messages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: message,
	})

	resp, err := s.openAIClient.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model:      "gpt-4-1106-preview",
			Messages:   messages,
			Tools:      AIDefinition(),
			ToolChoice: "auto",
		},
	)
	s.logger.Info("resp", zap.Any("", resp))

	if err != nil {
		return nil, chatHistory, errors.Wrap(err, "failed to analyze question type")
	}
	chatHistory = append(chatHistory, ChatMessage{
		Role:    "user",
		Content: message,
	})
	s.logger.Info("messagesAnalyze", zap.Any("", messages))
	s.logger.Info("HistorymessagesAnalyze", zap.Any("", chatHistory))
	// Chuyển đổi resp thành con trỏ
	respPtr := &resp
	return respPtr, chatHistory, nil
}

// HandleClassificationResponse xử lý kết quả từ function calls
func (s *QuestionAnalyzerServiceImpl) HandleClassificationResponse(ctx context.Context, response *openai.ChatCompletionResponse, chatHistory []ChatMessage, message string) (string, error) {
	choice := response.Choices[0]
	if len(choice.Message.ToolCalls) == 0 {
		fallbackMessage := openai.ChatCompletionMessage{
			Role:    openai.ChatMessageRoleAssistant,
			Content: choice.Message.Content,
		}

		return s.summaryService.SummarizeResults(ctx, chatHistory, []openai.ChatCompletionMessage{fallbackMessage})

	}

	// Tạo channel để nhận kết quả từ goroutines
	resultChan := make(chan toolCallResult, len(choice.Message.ToolCalls))
	var wg sync.WaitGroup

	// Xử lý mỗi tool call trong một goroutine riêng
	for _, toolCall := range choice.Message.ToolCalls {
		wg.Add(1)
		go func(tc openai.ToolCall, ctx context.Context) {
			defer wg.Done()

			// Parse arguments
			var args struct {
				Query string `json:"query"`
			}
			if err := json.Unmarshal([]byte(tc.Function.Arguments), &args); err != nil {
				resultChan <- toolCallResult{
					content:    "",
					toolCallID: tc.ID,
					err:        errors.Wrap(err, "failed to parse function arguments"),
					ctx:        ctx,
				}
				return
			}

			var content string
			var err error

			// Tạo context mới với cancel để có thể hủy nếu cần
			toolCtx, cancel := context.WithCancel(ctx)
			defer cancel()

			switch tc.Function.Name {
			case "ai-knowledge":
				content, err = s.knowledgeService.HandleKnowledgeQuestion(toolCtx, chatHistory, args.Query)
			case "ai-retrieval-data":
				content, err = s.courseService.HandleRetrievalData(toolCtx, chatHistory, args.Query)
			default:
				err = fmt.Errorf("unknown function: %s", tc.Function.Name)
			}

			resultChan <- toolCallResult{
				content:    content,
				toolCallID: tc.ID,
				err:        err,
				ctx:        toolCtx,
			}
		}(toolCall, ctx)
	}

	// Đợi tất cả goroutines hoàn thành
	go func() {
		wg.Wait()
		close(resultChan)
	}()

	// Thu thập kết quả từ tất cả các function calls
	var functionMessages []openai.ChatCompletionMessage
	var errors []error
	for result := range resultChan {
		if result.err != nil {
			errors = append(errors, result.err)
			continue
		}

		// Lấy lại function name từ toolCalls
		var functionName string
		for _, tc := range choice.Message.ToolCalls {
			if tc.ID == result.toolCallID {
				functionName = tc.Function.Name
				break
			}
		}

		// Tạo message với role function
		functionMessages = append(functionMessages, openai.ChatCompletionMessage{
			Role:       openai.ChatMessageRoleFunction,
			Name:       functionName,
			Content:    result.content,
			ToolCallID: result.toolCallID,
		})
	}
	s.logger.Info("functionMessages after goroutine", zap.Any("", functionMessages))

	// Kiểm tra lỗi
	if len(errors) > 0 {
		return "", fmt.Errorf("errors occurred while processing function calls: %v", errors)
	}
	s.logger.Info("Result affter handle HandleClassificationResponse ")

	// Kết hợp kết quả từ tất cả các function calls

	// Gửi tất cả kết quả xuống AISummaryService để tổng hợp
	return s.summaryService.SummarizeResults(ctx, chatHistory, functionMessages)
}
