package sdk

// const Dimensions_1024 = 1024 //read more about this https://openai.com/index/new-embedding-models-and-api-updates/
// type OpenAIClient struct {
// 	client *openai.Client
// 	token  string
// }

// var (
// 	GetAIService = sync.OnceValue[internal.AIService](func() internal.AIService {
// 		cli, err := newOpenAIClient()
// 		if err != nil {
// 			panic(errors.Wrap(err, "failed to get sqs client"))
// 		}
// 		return cli
// 	})
// )

// func newOpenAIClient() (*OpenAIClient, error) {

// 	openaiToken, ok := os.LookupEnv("OPENAI_TOKEN")
// 	if !ok {
// 		return nil, errors.New("OPENAI_TOKEN is missing")
// 	}
// 	client := openai.NewClient(openaiToken)
// 	return &OpenAIClient{
// 		client: client,
// 		token:  openaiToken,
// 	}, nil

// }
// func (o *OpenAIClient) GenerateContent(ctx context.Context, messages []openai.ChatCompletionMessage) (string, int, error) {
// 	resp, err := o.client.CreateChatCompletion(
// 		ctx,
// 		openai.ChatCompletionRequest{
// 			Model:    openai.GPT4o,
// 			Messages: messages,
// 		},
// 	)

// 	if err != nil {
// 		return "", 0, fmt.Errorf("failed to generate content: %v", err)
// 	}
// 	return resp.Choices[0].Message.Content, resp.Usage.TotalTokens, nil
// }

// func (o *OpenAIClient) GenerateContentStream(ctx context.Context, messages []openai.ChatCompletionMessage) (*openai.ChatCompletionStream, *io.PipeReader, error) {
// 	stream, err := o.client.CreateChatCompletionStream(
// 		ctx,
// 		openai.ChatCompletionRequest{
// 			Model:    openai.GPT4o,
// 			Messages: messages,
// 		},
// 	)
// 	if err != nil {
// 		return nil, nil, fmt.Errorf("failed to response stream: %v", err)
// 	}

// 	reader, writer := io.Pipe()
// 	go writeStream(stream, writer)

// 	return stream, reader, nil
// }

// func writeStream(stream *openai.ChatCompletionStream, writer *io.PipeWriter) {
// 	defer writer.Close()
// 	for {
// 		response, err := stream.Recv()
// 		if err != nil {
// 			if errors.Is(err, io.EOF) {
// 				break
// 			}
// 			zap.L().Error("failed to response stream", zap.Error(err))
// 			break
// 		}

// 		if len(response.Choices) > 0 {
// 			content := response.Choices[0].Delta.Content
// 			if content != "" {
// 				_, err := writer.Write([]byte(content))
// 				if err != nil {
// 					zap.L().Error("failed to write to pipe", zap.Error(err))
// 					break
// 				}
// 			}
// 		}
// 	}
// }

// func (o *OpenAIClient) GenerateVectorEmbedding(ctx context.Context, data string) ([]float32, error) {
// 	// Generate embeddings for each chunk
// 	resp, err := o.client.CreateEmbeddings(ctx, openai.EmbeddingRequest{
// 		Input:      []string{data},
// 		Model:      openai.LargeEmbedding3,
// 		Dimensions: 1024,
// 	})
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to generate embeddings: %v", err)
// 	}
// 	return resp.Data[0].Embedding, nil

// }
// func (o *OpenAIClient) funCallTest(ctx context.Context, prompt string) (string, error) {
// 	function := openai.Tool{
// 		Type: openai.ToolTypeFunction,
// 		Function: &openai.FunctionDefinition{
// 			Name:        "calculate_sum",
// 			Description: "Calculate the sum of two numbers",
// 			Parameters: map[string]interface{}{
// 				"type": "object",
// 				"properties": map[string]interface{}{
// 					"number1": map[string]interface{}{
// 						"type":        "integer",
// 						"description": "The first number",
// 					},
// 					"number2": map[string]interface{}{
// 						"type":        "integer",
// 						"description": "The second number",
// 					},
// 				},
// 				"required": []string{"number1", "number2"},
// 			},
// 		},
// 	}
// 	res, err := o.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
// 		Model: openai.GPT4o,
// 		Messages: []openai.ChatCompletionMessage{
// 			{
// 				Role:    openai.ChatMessageRoleUser,
// 				Content: "What is the sum of 8 and 15?",
// 			},
// 			{ // this item will get from response of first message
// 				Role:    openai.ChatMessageRoleAssistant,
// 				Content: "",
// 				ToolCalls: []openai.ToolCall{
// 					{
// 						ID:   "call_bEepQLZ4RFmGUbD9BK1HUtKw",
// 						Type: openai.ToolTypeFunction,
// 						Function: openai.FunctionCall{
// 							Name:      "calculate_sum",
// 							Arguments: "{\"number1\":8,\"number2\":15}",
// 						},
// 					},
// 				},
// 			},
// 			{
// 				Role:       openai.ChatMessageRoleTool,
// 				Content:    "{\"result\": 23}",
// 				ToolCallID: "call_bEepQLZ4RFmGUbD9BK1HUtKw",
// 			},
// 		},
// 		Tools: []openai.Tool{function},
// 	})
// 	if err != nil {
// 		return "", fmt.Errorf("failed to generate content: %v", err)
// 	}
// 	zap.L().Info("res", zap.Any("res", res.Choices[0].Message))
// 	return res.Choices[0].Message.Content, nil
// }
