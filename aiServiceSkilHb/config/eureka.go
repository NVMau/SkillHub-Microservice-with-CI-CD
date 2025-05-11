package config

import (
	"os"
	"time"

	"github.com/hudl/fargo"
)

type EurekaConfig struct {
	ServiceURL string
	Username   string
	Password   string
	AppName    string
	Port       int
	InstanceID string
	IPAddress  string
}

func NewEurekaConfig() *EurekaConfig {
	username := getEnvOrDefault("EUREKA_USERNAME", "admin")
	password := getEnvOrDefault("EUREKA_PASSWORD", "admin")
	serviceURL := getEnvOrDefault("EUREKA_SERVICE_URL", "http://eureka-server:8761/eureka/")
	appName := getEnvOrDefault("APP_NAME", "ai-service")
	port := 8090 // Default port, you can change this
	instanceID := appName + ":" + string(port)
	ipAddress := getLocalIP()

	return &EurekaConfig{
		ServiceURL: serviceURL,
		Username:   username,
		Password:   password,
		AppName:    appName,
		Port:       port,
		InstanceID: instanceID,
		IPAddress:  ipAddress,
	}
}

func (c *EurekaConfig) CreateEurekaConnection() fargo.EurekaConnection {
	conn := fargo.NewConn(c.ServiceURL)
	conn.Timeout = 10 * time.Second
	return conn
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getLocalIP() string {
	// This is a simple implementation. You might want to use a more robust solution
	// to get the actual IP address of the machine
	return "127.0.0.1"
}
