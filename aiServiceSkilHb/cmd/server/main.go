package main

import (
	"aiServiceSkilHb/internal/eureka"
	"aiServiceSkilHb/internal/fibersvc"
	"aiServiceSkilHb/internal/repository"
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"
)

func main() {
	// Khởi tạo logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Không thể khởi tạo logger: %v", err)
	}
	defer logger.Sync()

	// Khởi tạo context với timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Khởi tạo Qdrant repository
	qdrantRepo, err := repository.NewQdrantDB()
	if err != nil {
		logger.Fatal("Không thể khởi tạo Qdrant repository", zap.Error(err))
	}

	// Khởi tạo Eureka client
	serviceName := "ai-service"
	servicePort := 8090
	eurekaConfig := &eureka.Config{
		ServiceURL: "http://eureka-server:8761/eureka",
		Username:   "admin",
		Password:   "admin",
		AppName:    "ai-service",
		Port:       servicePort,
		InstanceID: fmt.Sprintf("%s:%d", serviceName, servicePort),
		IPAddress:  serviceName, // Sử dụng tên service thay vì IP
	}
	eurekaClient := eureka.NewEurekaClient(eurekaConfig)

	// Đăng ký với Eureka
	err = eurekaClient.Register()
	if err != nil {
		logger.Error("Không thể đăng ký với Eureka",
			zap.String("url", eurekaConfig.ServiceURL),
			zap.Error(err))
	} else {
		// Bắt đầu gửi heartbeat nếu đăng ký thành công
		eurekaClient.StartHeartbeat()
		defer eurekaClient.Deregister()
	}

	fiberSvc, err := fibersvc.NewFiberSvc(ctx, logger, qdrantRepo)
	if err != nil {
		logger.Fatal("Không thể khởi tạo Fiber service", zap.Error(err))
	}

	// Xử lý graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		logger.Info("Nhận tín hiệu shutdown, đang dừng server...")
		if err := fiberSvc.Close(); err != nil {
			logger.Error("Lỗi khi đóng server", zap.Error(err))
		}
		cancel()
	}()

	// Khởi động server
	logger.Info("Đang khởi động server...")
	if err := fiberSvc.Start(); err != nil {
		logger.Fatal("Không thể khởi động server", zap.Error(err))
	}
}
