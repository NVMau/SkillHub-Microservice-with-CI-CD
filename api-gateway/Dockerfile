# Sử dụng JDK 21 làm base image
FROM maven:3.9.9-amazoncorretto-21 AS build

# Tạo thư mục làm việc
WORKDIR /app

# Copy toàn bộ source code
COPY pom.xml .
COPY src ./src

# Clean và build
RUN mvn clean package -DskipTests

FROM amazoncorretto:21.0.4
WORKDIR /app
COPY --from=build /app/target/*.jar api-gateway.jar
ENTRYPOINT ["java", "-jar", "api-gateway.jar"]