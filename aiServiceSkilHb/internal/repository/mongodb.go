package repository

import (
	"context"
	"os"
	"sync"
	"time"

	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type Mongo struct {
	cli    *mongo.Client
	dbName string
}

var (
	GetMongoDB = sync.OnceValue[*Mongo](func() *Mongo {
		cli, err := newMongo()
		if err != nil {
			panic(errors.Wrap(err, "failed to get mongo client"))
		}
		return cli
	})
)

const (
	timeout = 10 * time.Second
)

func newMongo() (*Mongo, error) {
	mgon := &Mongo{}
	err := mgon.Connect()
	if err != nil {
		return nil, err
	}
	return mgon, nil
}

func (m *Mongo) Ping() error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	return m.cli.Ping(ctx, readpref.Primary())
}

func (m *Mongo) Connect() error {
	connectionUri, ok := os.LookupEnv("DB_URI")
	if !ok {
		return errors.New("DB_URI is missing")
	}
	dbName, ok := os.LookupEnv("DB_NAME")
	if !ok {
		return errors.New("DB_NAME is missing")
	}
	clientOptions := options.Client().ApplyURI(connectionUri).SetAppName("ai-assistants")
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	mongoClient, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return errors.Wrap(err, "failed to connect to mongo")
	}
	m.cli = mongoClient
	m.dbName = dbName
	return nil
}

func (m *Mongo) Collection(name string) *mongo.Collection {
	return m.cli.Database(m.dbName).Collection(name)
}
