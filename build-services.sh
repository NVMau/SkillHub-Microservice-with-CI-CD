#!/bin/bash

# Mảng chứa tên các service cần build
services=(
    "service-registry"
    "api-gateway"
    "profile-service"
    "course-service"
    "lecture-service"
    "blog-service"
    "assignment-service"
    "chat-service"
    "exam_result_service"
    "notification-service"
    "enrollment-service"
)

# Hàm build service
build_service() {
    local service=$1
    echo "Building $service..."
    cd $service
    ./mvnw clean package -DskipTests
    docker build -t ${service}:latest .
    cd ..
    echo "$service built successfully!"
    echo "----------------------------------------"
}

# Build từng service
echo "Starting to build all services..."
echo "----------------------------------------"

for service in "${services[@]}"; do
    if [ -d "$service" ]; then
        build_service $service
    else
        echo "Directory $service not found, skipping..."
    fi
done

echo "All services have been built successfully!"
echo "You can now run 'docker-compose up -d' to start the services." 

# How to run script
# chmod +x build-services.sh
# ./build-services.sh


# vào GPE của google
# gcloud compute ssh infra-skillhub-v01 --zone=asia-southeast1-a
