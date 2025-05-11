package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/qdrant/go-client/qdrant"
	"github.com/sashabaranov/go-openai"
)

type Knowledge struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	Content       string    `json:"content"`
	LastUpdatedAt time.Time `json:"last_updated_at"`
}

type KnowledgeRepository interface {
	Create(ctx context.Context, knowledge *Knowledge) error
	Search(ctx context.Context, query string, limit int) ([]*Knowledge, error)
	Get(ctx context.Context, id string) (*Knowledge, error)
	Delete(ctx context.Context, id string) error
	GetAll(ctx context.Context, page int, pageSize int) ([]*Knowledge, int64, error)
}

type knowledgeRepo struct {
	qdrantRepo    QdrantRepository
	openAIClient  *openai.Client
	openAIModel   string
	openAIContext int
}

func NewKnowledgeRepository(qdrantRepo QdrantRepository, openAIKey string) KnowledgeRepository {
	return &knowledgeRepo{
		qdrantRepo:    qdrantRepo,
		openAIClient:  openai.NewClient(openAIKey),
		openAIModel:   "text-embedding-3-small",
		openAIContext: 1536,
	}
}

func (k *knowledgeRepo) Create(ctx context.Context, knowledge *Knowledge) error {
	if knowledge.ID == "" {
		knowledge.ID = uuid.New().String()
	}
	knowledge.LastUpdatedAt = time.Now()

	// Generate embedding for content
	resp, err := k.openAIClient.CreateEmbeddings(ctx, openai.EmbeddingRequest{
		Input: []string{knowledge.Content},
		Model: openai.EmbeddingModel(k.openAIModel),
	})
	if err != nil {
		return errors.Wrap(err, "failed to create embedding")
	}

	if len(resp.Data) == 0 {
		return errors.New("no embedding generated")
	}

	// Convert embedding to float32
	vector := make([]float32, len(resp.Data[0].Embedding))
	for i, v := range resp.Data[0].Embedding {
		vector[i] = float32(v)
	}

	// Create payload
	payload := map[string]interface{}{
		"title":           knowledge.Title,
		"content":         knowledge.Content,
		"last_updated_at": knowledge.LastUpdatedAt,
	}

	// Create point
	point := &qdrant.PointStruct{
		Id: &qdrant.PointId{
			PointIdOptions: &qdrant.PointId_Uuid{
				Uuid: knowledge.ID,
			},
		},
		Vectors: &qdrant.Vectors{
			VectorsOptions: &qdrant.Vectors_Vector{
				Vector: &qdrant.Vector{
					Data: vector,
				},
			},
		},
		Payload: structToPayload(payload),
	}

	// Insert point
	err = k.qdrantRepo.InsertPoints(ctx, []*qdrant.PointStruct{point})
	if err != nil {
		return errors.Wrap(err, "failed to insert point")
	}

	return nil
}

func (k *knowledgeRepo) Search(ctx context.Context, query string, limit int) ([]*Knowledge, error) {
	// Generate embedding for query
	resp, err := k.openAIClient.CreateEmbeddings(ctx, openai.EmbeddingRequest{
		Input: []string{query},
		Model: openai.EmbeddingModel(k.openAIModel),
	})
	if err != nil {
		fmt.Printf("Error creating embedding: %v\n", err)
		return nil, errors.Wrap(err, "failed to create embedding")
	}

	if len(resp.Data) == 0 {
		fmt.Println("No embedding generated")
		return nil, errors.New("no embedding generated")
	}

	// Convert embedding to float32
	vector := make([]float32, len(resp.Data[0].Embedding))
	for i, v := range resp.Data[0].Embedding {
		vector[i] = float32(v)
	}

	// Search points
	contents, err := k.qdrantRepo.QueryContent(ctx, vector)
	if err != nil {
		fmt.Printf("Error querying content: %v\n", err)
		return nil, errors.Wrap(err, "failed to query points")
	}

	fmt.Printf("Found %d contents\n", len(contents))

	// Convert results to Knowledge
	var results []*Knowledge
	for i, content := range contents {
		fmt.Printf("Content %d: %s\n", i, content)
		var knowledge Knowledge
		if err := json.Unmarshal([]byte(content), &knowledge); err != nil {
			fmt.Printf("Error unmarshaling content %d: %v\n", i, err)
			return nil, errors.Wrap(err, "failed to unmarshal knowledge")
		}
		results = append(results, &knowledge)
	}

	return results, nil
}

func (k *knowledgeRepo) Get(ctx context.Context, id string) (*Knowledge, error) {
	point, err := k.qdrantRepo.GetPoint(ctx, id)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get point")
	}

	// Convert payload to Knowledge
	knowledge := &Knowledge{
		ID:            id,
		Title:         point.Payload["title"].GetStringValue(),
		Content:       point.Payload["content"].GetStringValue(),
		LastUpdatedAt: time.Unix(point.Payload["last_updated_at"].GetIntegerValue(), 0),
	}

	return knowledge, nil
}

func (k *knowledgeRepo) Delete(ctx context.Context, id string) error {
	selector := &qdrant.PointsSelector{
		PointsSelectorOneOf: &qdrant.PointsSelector_Points{
			Points: &qdrant.PointsIdsList{
				Ids: []*qdrant.PointId{
					{
						PointIdOptions: &qdrant.PointId_Uuid{
							Uuid: id,
						},
					},
				},
			},
		},
	}

	err := k.qdrantRepo.DeletePoints(ctx, selector)
	if err != nil {
		return errors.Wrap(err, "failed to delete point")
	}

	return nil
}

func (k *knowledgeRepo) GetAll(ctx context.Context, page int, pageSize int) ([]*Knowledge, int64, error) {
	// Scroll all points from Qdrant with pagination
	points, total, err := k.qdrantRepo.ScrollPoints(ctx, page, pageSize)
	if err != nil {
		return nil, 0, errors.Wrap(err, "failed to scroll points")
	}

	// Convert results to Knowledge
	var results []*Knowledge
	for _, point := range points {
		// Convert timestamp to time
		timestamp := point.Payload["last_updated_at"].GetIntegerValue()
		lastUpdatedAt := time.Unix(timestamp, 0)

		// Create Knowledge object
		knowledge := &Knowledge{
			ID:            point.Id.GetUuid(),
			Title:         point.Payload["title"].GetStringValue(),
			Content:       point.Payload["content"].GetStringValue(),
			LastUpdatedAt: lastUpdatedAt,
		}
		results = append(results, knowledge)
	}

	return results, total, nil
}

func structToPayload(data interface{}) map[string]*qdrant.Value {
	payload := make(map[string]*qdrant.Value)
	b, err := json.Marshal(data)
	if err != nil {
		return payload
	}

	var m map[string]interface{}
	if err := json.Unmarshal(b, &m); err != nil {
		return payload
	}

	for k, v := range m {
		switch val := v.(type) {
		case string:
			payload[k] = &qdrant.Value{
				Kind: &qdrant.Value_StringValue{
					StringValue: val,
				},
			}
		case float64:
			payload[k] = &qdrant.Value{
				Kind: &qdrant.Value_IntegerValue{
					IntegerValue: int64(val),
				},
			}
		case bool:
			payload[k] = &qdrant.Value{
				Kind: &qdrant.Value_BoolValue{
					BoolValue: val,
				},
			}
		}
	}

	return payload
}
