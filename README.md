# SkillHub Microservice

Hệ thống quản lý khóa học trực tuyến sử dụng kiến trúc microservice.

## Cấu trúc Project

```
skillhub-microservice/
├── api-gateway/          # API Gateway Service
├── user-service/         # User Management Service
├── course-service/       # Course Management Service
├── lecture-service/      # Lecture Management Service
├── exam-service/         # Exam Management Service
├── blog-service/         # Blog Service
├── assignment-service/   # Assignment Service
├── chat-service/         # Chat Service
├── ai-service/          # AI Service
├── notification-service/ # Notification Service
├── enrollment-service/   # Enrollment Service
├── profile-service/      # Profile Service
├── common/              # Shared Libraries
└── docker/              # Docker Configurations
```

## Công nghệ sử dụng

- Java 17
- Spring Boot
- Spring Cloud
- Docker
- MySQL
- MongoDB
- Redis
- AWS Services

## Yêu cầu hệ thống

- JDK 21
- Maven
- Docker
- Docker Compose

## Cài đặt và Chạy

1. Clone repository:
```bash
git clone https://github.com/your-username/skillhub-microservice.git
```

2. Cấu hình môi trường:
```bash
cp .env.example .env
# Chỉnh sửa các biến môi trường trong .env
```

3. Build và chạy:
```bash
docker-compose up -d
```

## CI/CD Pipeline

Project sử dụng GitHub Actions cho CI/CD:
- Build và test tự động
- Push Docker images lên AWS ECR
- Deploy lên AWS ECS

## Monitoring

- Prometheus
- Grafana
- AWS CloudWatch

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License 