# AI Assistant Service

Dịch vụ AI Assistant được xây dựng bằng Go, sử dụng Fiber framework và được triển khai trên Kubernetes.

## Tính năng

- Tích hợp với OpenAI và Google Gemini
- Lưu trữ dữ liệu với MongoDB
- Vector search với Qdrant
- RESTful API với Fiber framework
- Containerization với Docker
- Triển khai trên Kubernetes

## Cài đặt

1. Clone repository:
```bash
git clone <repository_url>
cd aiassistantsk8s
```

2. Cài đặt dependencies:
```bash
go mod download
```

3. Cấu hình môi trường:
- Copy `env.env.example` thành `env.env`
- Cập nhật các biến môi trường cần thiết

4. Chạy ứng dụng:
```bash
go run cmd/server/main.go
```

## Cấu trúc Project

```
.
├── cmd
│   └── server
│       └── main.go
├── internal
│   ├── fibersvc
│   │   ├── modules
│   │   ├── repository
│   │   ├── sdk
│   │   └── server
│   └── utils
├── Dockerfile
├── kubectl.yaml
└── README.md
```

## API Documentation

[API documentation sẽ được thêm vào sau]

## Contributing

[Contributing guidelines sẽ được thêm vào sau]

## License

[License information sẽ được thêm vào sau]
