package services

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/pkg/errors"
	"go.uber.org/zap"
)

// HTTPClient định nghĩa interface cho HTTP client
type HTTPClient interface {
	Get(ctx context.Context, url string, headers map[string]string) (*http.Response, error)
	Post(ctx context.Context, url string, body interface{}, headers map[string]string) (*http.Response, error)
}

// DefaultHTTPClient triển khai HTTPClient
type DefaultHTTPClient struct {
	client *http.Client
	logger *zap.Logger
}

// NewHTTPClient tạo một instance mới của HTTPClient
func NewHTTPClient(logger *zap.Logger) HTTPClient {
	return &DefaultHTTPClient{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		logger: logger,
	}
}

// Get thực hiện HTTP GET request
func (c *DefaultHTTPClient) Get(ctx context.Context, url string, headers map[string]string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create request")
	}

	// Thêm headers
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	// Gửi request
	resp, err := c.client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to send request")
	}

	// Kiểm tra status code
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, errors.Errorf("API returned non-200 status code: %d, body: %s", resp.StatusCode, string(body))
	}

	return resp, nil
}

// Post thực hiện HTTP POST request
func (c *DefaultHTTPClient) Post(ctx context.Context, url string, body interface{}, headers map[string]string) (*http.Response, error) {
	// Marshal body thành JSON
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal request body")
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, strings.NewReader(string(jsonBody)))
	if err != nil {
		return nil, errors.Wrap(err, "failed to create request")
	}

	// Thêm headers
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	req.Header.Set("Content-Type", "application/json")

	// Gửi request
	resp, err := c.client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to send request")
	}

	// Kiểm tra status code
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, errors.Errorf("API returned non-200 status code: %d, body: %s", resp.StatusCode, string(body))
	}

	return resp, nil
}
