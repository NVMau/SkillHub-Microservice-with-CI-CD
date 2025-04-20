#!/bin/bash

# AWS Region
REGION="ap-southeast-1"
ACCOUNT_ID="116981768488"
ECR_BASE_URL="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# List of services
SERVICES=(
    "api-gateway"
    "course-service"
    "lecture-service"
    "assignment-service"
    "exam-service"
    "blog-service"
    "chat-service"
    "ai-service"
    "profile-service"
    "notification-service"
    "enrollment-service"
)

# Create repositories for each service
for SERVICE in "${SERVICES[@]}"; do
    REPO_NAME="skillhub/${SERVICE}"
    echo "Creating repository for $REPO_NAME..."
    
    # Create repository
    aws ecr create-repository \
        --repository-name $REPO_NAME \
        --region $REGION \
        --image-scanning-configuration scanOnPush=true \
        --image-tag-mutability MUTABLE
    
    # Add lifecycle policy to keep only last 30 images
    aws ecr put-lifecycle-policy \
        --repository-name $REPO_NAME \
        --region $REGION \
        --lifecycle-policy-text '{
            "rules": [
                {
                    "rulePriority": 1,
                    "description": "Keep last 30 images",
                    "selection": {
                        "tagStatus": "any",
                        "countType": "imageCountMoreThan",
                        "countNumber": 30
                    },
                    "action": {
                        "type": "expire"
                    }
                }
            ]
        }'
    
    echo "Repository created: ${ECR_BASE_URL}/${REPO_NAME}"
done

echo "All repositories created successfully!" 