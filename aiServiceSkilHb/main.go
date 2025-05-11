package main

import (
	"aiServiceSkilHb/internal/eureka"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	// Initialize Eureka configuration
	eurekaConfig := &eureka.Config{
		ServiceURL: "http://eureka-server:8761/eureka/",
		Username:   "admin",
		Password:   "admin",
		AppName:    "ai-service",
		Port:       8080,
		InstanceID: "ai-service:8080",
		IPAddress:  "127.0.0.1",
	}

	// Create and start Eureka client
	eurekaClient := eureka.NewEurekaClient(eurekaConfig)

	// Register with Eureka
	err := eurekaClient.Register()
	if err != nil {
		log.Printf("Warning: Failed to register with Eureka: %v", err)
	} else {
		// Start heartbeat only if registration was successful
		eurekaClient.StartHeartbeat()
		defer eurekaClient.Deregister()
	}

	// Set up graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Wait for shutdown signal
	<-sigChan
	log.Println("Shutting down...")
}
