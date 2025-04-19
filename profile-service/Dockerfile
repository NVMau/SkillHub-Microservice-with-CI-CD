# Sử dụng JDK 21 làm base image
FROM eclipse-temurin:21-jdk

# Tạo thư mục làm việc
WORKDIR /app

# Copy toàn bộ source code
COPY . .

# Cấp quyền thực thi cho file mvnw
RUN chmod +x ./mvnw

# Build project
RUN ./mvnw clean package -DskipTests

# Copy file JAR vào container
COPY target/profile-service-*.jar app.jar


# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"] 


# Sử dụng JDK 21 làm base image
FROM maven:3.9.9-amazoncorretto-21 AS build

# Tạo thư mục làm việc
WORKDIR /app

# Copy toàn bộ source code
COPY pom.xml .
COPY src ./src

RUN mvn package -DskipTests

FROM amazoncorretto:21.0.4
WORKDIR /app
COPY --from=build /app/target/*.jar profile-service.jar
ENTRYPOINT ["java", "-jar", "profile-service.jar"]