# SkillHub - Microservices Learning Platform

SkillHub is a modern, scalable learning platform built using microservices architecture. The platform provides a comprehensive solution for online education, including course management, user profiles, assignments, exams, and real-time communication features.

## 🚀 Features

- **Course Management**: Create, update, and manage courses with rich content
- **User Profiles**: Comprehensive user profiles with learning progress tracking
- **Assignment System**: Create and submit assignments with automated grading
- **Exam System**: Conduct online exams with result tracking
- **Real-time Chat**: Interactive communication between students and instructors
- **AI Integration**: Smart learning recommendations and content analysis
- **Blog System**: Educational content sharing and community engagement
- **Notification System**: Real-time updates and alerts
- **Enrollment Management**: Course registration and access control

## 🏗 Architecture

The platform is built using a microservices architecture with the following components:

- **API Gateway**: Single entry point for all client requests
- **Service Registry**: Service discovery and registration
- **Course Service**: Course management and content delivery
- **Profile Service**: User profile management
- **Assignment Service**: Assignment creation and submission
- **Exam Service**: Exam management and results
- **Chat Service**: Real-time messaging
- **AI Service**: Intelligent learning features(RAG)
- **Blog Service**: Content management
- **Notification Service**: Event notifications
- **Enrollment Service**: Course registration

## 🛠 Technology Stack

- **Backend**: Spring Boot, Spring Cloud
- **Database**: MongoDB, MySQL
- **Message Broker**: Apache Kafka
- **Service Discovery**: Eureka
- **API Gateway**: Spring Cloud Gateway
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana

## 🤖 RAG Model Implementation

The project implements a Retrieval-Augmented Generation (RAG) model to enhance the learning experience:

### Components
- **Vector Database**: Stores embeddings of course content, assignments, and learning materials
- **Embedding Model**: Converts text content into vector representations
- **LLM Integration**: Uses large language models for intelligent responses
- **Knowledge Base**: Maintains a structured repository of educational content

### Features
- **Smart Content Search**: Semantic search across course materials
- **Personalized Learning**: Content recommendations based on student progress
- **Content Analysis**: Automated analysis of assignments and submissions
- **Learning Path Optimization**: Dynamic course content organization

### Implementation Details
- **Service Architecture**: Dedicated AI service for RAG operations
- **Data Processing**: Automated content indexing and embedding generation
- **Real-time Updates**: Continuous learning from new course content
- **Context Management**: Efficient retrieval of relevant information
- **Response Generation**: Context-aware answer generation

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Docker and Docker Compose
- Maven
- MongoDB
- MySQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SkillHub-Microservice-with-CI-CD.git
cd SkillHub-Microservice-with-CI-CD
```

2. Build all services:
```bash
./build-services.sh
```

3. Start the services using Docker Compose:
```bash
docker-compose up -d
```

4. Access the application:
- API Gateway: http://localhost:8080
- Service Registry: http://localhost:8761
- Swagger Documentation: http://localhost:8080/swagger-ui.html

## 📚 API Documentation

Each service provides its own Swagger documentation. Access them through the API Gateway:

- Course Service: `/api/courses/swagger-ui.html`
- Profile Service: `/api/profiles/swagger-ui.html`
- Assignment Service: `/api/assignments/swagger-ui.html`
- Exam Service: `/api/exams/swagger-ui.html`

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

1. **Build**: Compiles and tests all services
2. **Test**: Runs unit and integration tests
3. **Docker Build**: Creates Docker images
4. **Deploy**: Deploys to the target environment

## 📦 Docker Images

All services are containerized using Docker. Images are available on Docker Hub:

```bash
docker pull skillhub/course-service
docker pull skillhub/profile-service
docker pull skillhub/assignment-service
# ... other services
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors


## 🙏 Acknowledgments

- Spring Boot Team
- Docker Team
- All contributors and supporters 