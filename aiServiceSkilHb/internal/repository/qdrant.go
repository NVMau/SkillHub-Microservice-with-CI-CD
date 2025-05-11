package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/pkg/errors"
	"github.com/qdrant/go-client/qdrant"
)

type QdrantRepository interface {
	GenerateContent(ctx context.Context, req string) string
	InsertPoints(ctx context.Context, points []*qdrant.PointStruct) error
	QueryContent(ctx context.Context, embedReq []float32) ([]string, error)
	DeletePoints(ctx context.Context, pointSelector *qdrant.PointsSelector) error
	GetPoint(ctx context.Context, id string) (*qdrant.PointStruct, error)
	ScrollPoints(ctx context.Context, page int, pageSize int) ([]*qdrant.RetrievedPoint, int64, error)
}

type QdrantDB struct {
	client         *qdrant.Client
	collectionName string
}

var (
	GetQdrantDB = sync.OnceValue[QdrantRepository](func() QdrantRepository {
		cli, err := newClient()
		if err != nil {
			panic(errors.Wrap(err, "failed to get qdrant client"))
		}
		return cli
	})
)

// NewQdrantDB tạo một instance mới của QdrantDB
func NewQdrantDB() (QdrantRepository, error) {
	host, ok := os.LookupEnv("QDRANT_HOST")
	if !ok {
		return nil, errors.New("QDRANT_HOST is missing")
	}
	port, ok := os.LookupEnv("QDRANT_PORT")
	if !ok {
		return nil, errors.New("QDRANT_PORT is missing")
	}
	key, ok := os.LookupEnv("QDRANT_API_KEY")
	if !ok {
		return nil, errors.New("QDRANT_API_KEY is missing")
	}

	portInt, _ := strconv.Atoi(port)

	client, err := qdrant.NewClient(&qdrant.Config{
		Host:   host,
		Port:   portInt,
		APIKey: key,
		UseTLS: true,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to get qdrant client")
	}
	return &QdrantDB{
		client:         client,
		collectionName: "knowledge_base-c300_d1536",
	}, nil
}

func newClient() (*QdrantDB, error) {
	host, ok := os.LookupEnv("QDRANT_HOST")
	if !ok {
		return nil, errors.New("QDRANT_HOST is missing")
	}
	port, ok := os.LookupEnv("QDRANT_PORT")
	if !ok {
		return nil, errors.New("QDRANT_PORT is missing")
	}
	key, ok := os.LookupEnv("QDRANT_API_KEY")
	if !ok {
		return nil, errors.New("QDRANT_API_KEY is missing")
	}

	portInt, _ := strconv.Atoi(port)

	client, err := qdrant.NewClient(&qdrant.Config{
		Host:   host,
		Port:   portInt,
		APIKey: key,
		UseTLS: true,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to get qdrant client")
	}
	return &QdrantDB{
		client:         client,
		collectionName: "knowledge_base-c300_d1536",
	}, nil
}

func (o *QdrantDB) GenerateContent(ctx context.Context, req string) string {
	return ""
}

func (o *QdrantDB) createCollection(ctx context.Context, collectionName string) error {
	// Check if collection already exists
	collectionInfo, err := o.client.GetCollectionInfo(ctx, collectionName)
	if err != nil && !strings.Contains(err.Error(), "NotFound") {
		return errors.Wrap(err, "failed to get collection info")
	}
	if collectionInfo != nil {
		return nil
	}

	// Create collection with configuration for text embeddings
	err = o.client.CreateCollection(ctx, &qdrant.CreateCollection{
		CollectionName: collectionName,
		VectorsConfig: &qdrant.VectorsConfig{
			Config: &qdrant.VectorsConfig_Params{
				Params: &qdrant.VectorParams{
					Size:     uint64(1536),
					Distance: qdrant.Distance_Cosine,
				},
			},
		},
	})
	if err != nil {
		return errors.Wrap(err, "failed to create collection")
	}

	return nil
}

func (o *QdrantDB) InsertPoints(ctx context.Context, points []*qdrant.PointStruct) error {
	// Upsert all chunks

	if err := o.createCollection(ctx, o.collectionName); err != nil {
		return errors.Wrap(err, "failed to create collection")
	}

	_, err := o.client.Upsert(ctx, &qdrant.UpsertPoints{
		CollectionName: o.collectionName,
		Wait:           aws.Bool(true),
		Points:         points,
	})
	if err != nil {
		return errors.Wrap(err, "failed to upsert points")
	}
	return nil
}

func (o *QdrantDB) QueryContent(ctx context.Context, embedReq []float32) ([]string, error) {
	// Search Qdrant
	searchResult, err := o.client.Query(ctx, &qdrant.QueryPoints{
		CollectionName: o.collectionName,
		Query:          qdrant.NewQuery(embedReq...),
		ScoreThreshold: aws.Float32(0.4),
		Offset:         aws.Uint64(0),
		WithPayload: &qdrant.WithPayloadSelector{
			SelectorOptions: &qdrant.WithPayloadSelector_Enable{
				Enable: true,
			},
		},
		Limit: aws.Uint64(2),
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to query points")
	}

	fmt.Printf("Found %d results in Qdrant\n", len(searchResult))

	var res []string
	for i, result := range searchResult {
		fmt.Printf("Processing result %d\n", i)

		// Convert timestamp to time
		timestamp := result.Payload["last_updated_at"].GetIntegerValue()
		var lastUpdatedAt time.Time
		if timestamp > 0 {
			lastUpdatedAt = time.Unix(timestamp, 0)
		} else {
			lastUpdatedAt = time.Now()
		}

		// Tạo Knowledge object từ payload
		knowledge := map[string]interface{}{
			"id":              result.Id.GetUuid(),
			"title":           result.Payload["title"].GetStringValue(),
			"content":         result.Payload["content"].GetStringValue(),
			"last_updated_at": lastUpdatedAt.Format(time.RFC3339),
		}

		// Convert to JSON
		jsonBytes, err := json.Marshal(knowledge)
		if err != nil {
			fmt.Printf("Error marshaling result %d: %v\n", i, err)
			continue
		}

		res = append(res, string(jsonBytes))
	}

	return res, nil
}

func (o *QdrantDB) DeletePoints(ctx context.Context, pointSelector *qdrant.PointsSelector) error {
	// Delete all chunks
	_, err := o.client.Delete(ctx, &qdrant.DeletePoints{
		CollectionName: o.collectionName,
		Points:         pointSelector,
	})
	if err != nil {
		return errors.Wrap(err, "failed to delete points")
	}
	return nil
}

func (o *QdrantDB) GetPoint(ctx context.Context, id string) (*qdrant.PointStruct, error) {
	// Get point by ID from Qdrant
	points, err := o.client.Scroll(ctx, &qdrant.ScrollPoints{
		CollectionName: o.collectionName,
		Filter: &qdrant.Filter{
			Must: []*qdrant.Condition{
				qdrant.NewHasID(&qdrant.PointId{
					PointIdOptions: &qdrant.PointId_Uuid{
						Uuid: id,
					},
				}),
			},
		},
		Limit: aws.Uint32(1),
		WithPayload: &qdrant.WithPayloadSelector{
			SelectorOptions: &qdrant.WithPayloadSelector_Enable{
				Enable: true,
			},
		},
		WithVectors: &qdrant.WithVectorsSelector{
			SelectorOptions: &qdrant.WithVectorsSelector_Enable{
				Enable: true,
			},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get point: %w", err)
	}

	if len(points) == 0 {
		return nil, fmt.Errorf("point not found")
	}

	// Convert RetrievedPoint to PointStruct
	point := points[0]
	return &qdrant.PointStruct{
		Id: &qdrant.PointId{
			PointIdOptions: &qdrant.PointId_Uuid{
				Uuid: point.Id.GetUuid(),
			},
		},
		Vectors: &qdrant.Vectors{
			VectorsOptions: &qdrant.Vectors_Vector{
				Vector: &qdrant.Vector{
					Data: point.Vectors.GetVector().Data,
				},
			},
		},
		Payload: point.Payload,
	}, nil
}

func (o *QdrantDB) ScrollPoints(ctx context.Context, page int, pageSize int) ([]*qdrant.RetrievedPoint, int64, error) {
	// Get total count
	collectionInfo, err := o.client.GetCollectionInfo(ctx, o.collectionName)
	if err != nil {
		return nil, 0, errors.Wrap(err, "failed to get collection info")
	}

	// Convert *uint64 to int64
	var total int64
	if collectionInfo.PointsCount != nil {
		total = int64(*collectionInfo.PointsCount)
	}

	// Scroll points with pagination
	points, err := o.client.Scroll(ctx, &qdrant.ScrollPoints{
		CollectionName: o.collectionName,
		Limit:          aws.Uint32(uint32(total)), // Lấy tất cả các điểm
		WithPayload: &qdrant.WithPayloadSelector{
			SelectorOptions: &qdrant.WithPayloadSelector_Enable{
				Enable: true,
			},
		},
		WithVectors: &qdrant.WithVectorsSelector{
			SelectorOptions: &qdrant.WithVectorsSelector_Enable{
				Enable: true,
			},
		},
	})
	if err != nil {
		return nil, 0, errors.Wrap(err, "failed to scroll points")
	}

	// If no points found, return empty slice
	if points == nil {
		return []*qdrant.RetrievedPoint{}, total, nil
	}

	// Apply pagination manually
	start := (page - 1) * pageSize
	end := start + pageSize
	if start >= len(points) {
		return []*qdrant.RetrievedPoint{}, total, nil
	}
	if end > len(points) {
		end = len(points)
	}

	return points[start:end], total, nil
}
