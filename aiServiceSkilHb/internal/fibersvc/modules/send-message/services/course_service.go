package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/pkg/errors"
	"github.com/sashabaranov/go-openai"
	"go.uber.org/zap"
)

// CourseServiceImpl triển khai CourseService
type CourseServiceImpl struct {
	logger           *zap.Logger
	openAIClient     *openai.Client
	courseAPIURL     string
	aiSummaryService AISummaryService
}

// NewCourseService tạo một instance mới của CourseService
func NewCourseService(
	logger *zap.Logger,
	openAIClient *openai.Client,
	courseAPIURL string,
	aiSummaryService AISummaryService,
) CourseService {
	return &CourseServiceImpl{
		logger:           logger,
		openAIClient:     openAIClient,
		courseAPIURL:     courseAPIURL,
		aiSummaryService: aiSummaryService,
	}
}

// CourseResponse định nghĩa cấu trúc response từ Course API
type CourseResponse struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Tags        []string `json:"tags"`
	Price       float64  `json:"price"`
	TeacherName string   `json:"teacherName"`
	ImageUrl    string   `json:"imageUrl"`
}

// CourseSearchResponse định nghĩa cấu trúc response từ API tìm kiếm khóa học
type CourseSearchResponse struct {
	Data       []CourseResponse `json:"data"`
	TotalItems int              `json:"totalItems"`
	Page       int              `json:"page"`
	PageSize   int              `json:"pageSize"`
}

// HandleRetrievalData xử lý câu hỏi về khóa học
func (s *CourseServiceImpl) HandleRetrievalData(ctx context.Context, chatHistory []ChatMessage, query string) (string, error) {
	// Sử dụng AI để phân tích câu hỏi và tạo function call
	searchPrompt := fmt.Sprintf(`Bạn là một AI chuyên phân tích câu hỏi về khóa học.
Nhiệm vụ của bạn là phân tích câu hỏi và tạo function call fetchCourseData với từ khóa phù hợp.

Bạn PHẢI trả về function call, không được trả về text thông thường.

Ví dụ:
- Câu hỏi: "Gợi ý cho tôi các khóa học về Golang" -> Bạn PHẢI gọi: fetchCourseData("Go")
- Câu hỏi: "Tôi muốn học lập trình Python" -> Bạn PHẢI gọi: fetchCourseData("Python")
- Câu hỏi: "Có khóa học nào về web development không?" -> Bạn PHẢI gọi: fetchCourseData("web development")

Câu hỏi của người dùng: "%s"`, query)

	s.logger.Info("Sending prompt to AI",
		zap.String("prompt", searchPrompt),
		zap.String("query", query))

	searchResp, err := s.openAIClient.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: openai.GPT4,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: "Bạn là một AI chuyên phân tích câu hỏi về khóa học. Bạn PHẢI trả về function call fetchCourseData, không được trả về text thông thường.",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: searchPrompt,
				},
			},
			Tools: []openai.Tool{
				{
					Type: openai.ToolTypeFunction,
					Function: &openai.FunctionDefinition{
						Name:        "fetchCourseData",
						Description: "Tìm kiếm khóa học dựa trên từ khóa",
						Parameters: map[string]interface{}{
							"type": "object",
							"required": []string{
								"keyword",
							},
							"properties": map[string]interface{}{
								"keyword": map[string]interface{}{
									"type":        "string",
									"description": "Từ khóa tìm kiếm khóa học",
								},
							},
							"additionalProperties": false,
						},
					},
				},
			},
			ToolChoice: map[string]interface{}{
				"type": "function",
				"function": map[string]interface{}{
					"name": "fetchCourseData",
				},
			},
		},
	)

	if err != nil {
		s.logger.Error("Failed to get AI response",
			zap.Error(err),
			zap.String("query", query))
		return "", errors.Wrap(err, "failed to analyze search query")
	}

	s.logger.Info("Got AI response",
		zap.Any("response", searchResp),
		zap.String("query", query))

	// Lấy function call từ response
	choice := searchResp.Choices[0]
	if len(choice.Message.ToolCalls) == 0 {
		s.logger.Error("No function call in AI response",
			zap.Any("response", searchResp),
			zap.String("query", query))
		return "", errors.New("no function call found in response")
	}

	toolCall := choice.Message.ToolCalls[0]
	if toolCall.Function.Name != "fetchCourseData" {
		s.logger.Error("Invalid function call",
			zap.String("function", toolCall.Function.Name),
			zap.String("query", query))
		return "", errors.New("invalid function call")
	}

	// Parse arguments
	var args struct {
		Keyword string `json:"keyword"`
	}
	if err := json.Unmarshal([]byte(toolCall.Function.Arguments), &args); err != nil {
		s.logger.Error("Failed to parse function arguments",
			zap.Error(err),
			zap.String("arguments", toolCall.Function.Arguments),
			zap.String("query", query))
		return "", errors.Wrap(err, "failed to parse function arguments")
	}

	s.logger.Info("Function call generated",
		zap.String("function", toolCall.Function.Name),
		zap.String("keyword", args.Keyword),
		zap.String("query", query))

	// Gọi API để lấy dữ liệu khóa học với từ khóa đã được phân tích
	courses, err := s.fetchCourseData(ctx, args.Keyword)
	if err != nil {
		s.logger.Error("Failed to fetch course data",
			zap.Error(err),
			zap.String("keyword", args.Keyword),
			zap.String("query", query))
		return "", errors.Wrap(err, "failed to fetch course data")
	}

	// Nếu không tìm thấy khóa học nào, chuyển sang xử lý câu hỏi chung
	if len(courses) == 0 {
		s.logger.Info("No courses found, returning fallback message",
			zap.String("keyword", args.Keyword),
			zap.String("query", query))

		fallback := fmt.Sprintf("Không tìm thấy khóa học nào phù hợp với từ khóa \"%s\". Vui lòng thử lại với từ khóa khác.", args.Keyword)
		return fallback, nil
	}

	s.logger.Info("Found courses",
		zap.Int("count", len(courses)),
		zap.String("keyword", args.Keyword),
		zap.String("query", query))

	// Trả về dữ liệu khóa học đã được format
	return formatCourses(courses), nil
}

// fetchCourseData lấy dữ liệu khóa học từ API
func (s *CourseServiceImpl) fetchCourseData(ctx context.Context, query string) ([]CourseResponse, error) {
	// Tạo HTTP client với timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	s.logger.Info("Context in Course", zap.Any("", ctx))

	token, ok := ctx.Value(TokenKeyValue).(string)
	if !ok || token == "" {
		return nil, errors.New("token is required")
	}
	s.logger.Info("Token in Course", zap.Any("", token))

	// Parse URL và thêm query parameters
	baseURL := s.courseAPIURL + "/api/courses/search"
	s.logger.Info("Base URL in Course", zap.Any("", baseURL))
	parsedURL, err := url.Parse(baseURL)
	if err != nil {
		return nil, errors.Wrap(err, "failed to parse URL")
	}

	// Thêm query parameters
	queryParams := parsedURL.Query()
	queryParams.Set("keyword", query)
	// Có thể thêm các tham số khác như minPrice, maxPrice, teacherName nếu cần
	parsedURL.RawQuery = queryParams.Encode()

	// Tạo request
	req, err := http.NewRequestWithContext(ctx, "GET", parsedURL.String(), nil)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create request")
	}

	// Thêm headers
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	// Gửi request
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to send request")
	}
	defer resp.Body.Close()

	// Kiểm tra status code
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, errors.Errorf("API returned non-200 status code: %d, body: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var courses []CourseResponse
	if err := json.NewDecoder(resp.Body).Decode(&courses); err != nil {
		return nil, errors.Wrap(err, "failed to decode response")
	}

	// Log kết quả
	s.logger.Info("Fetched course data",
		zap.String("query", query),
		zap.Int("totalCourses", len(courses)),
	)
	s.logger.Info("result for course is", zap.Any("", courses))

	return courses, nil
}

// formatCourses định dạng dữ liệu khóa học thành chuỗi
func formatCourses(courses []CourseResponse) string {
	var result string
	for _, course := range courses {
		result += fmt.Sprintf("- %s\n  Mô tả: %s\n  Danh mục: %s\n  Tags: %s\n  Giá: %.0f VNĐ\n  Giảng viên: %s\n  Ảnh: %s\n\n",
			course.Title,
			course.Description,
			course.Category,
			strings.Join(course.Tags, ", "),
			course.Price,
			course.TeacherName,
			course.ImageUrl,
		)
	}
	return result
}
