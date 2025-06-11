#Debug in local 
# Sử dụng JDK 21 làm base image
FROM amazoncorretto:21.0.4

# Tạo thư mục làm việc
WORKDIR /app

# Copy file JAR đã build từ thư mục target
COPY target/*.jar course-service.jar

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "course-service.jar"]













# # Sử dụng JDK 21 làm base image
# FROM maven:3.9.9-amazoncorretto-21 AS build

# # Tạo thư mục làm việc
# WORKDIR /app

# # Copy toàn bộ source code
# COPY pom.xml .
# COPY src ./src

# RUN mvn clean package -DskipTests

# FROM amazoncorretto:21.0.4
# WORKDIR /app
# COPY --from=build /app/target/*.jar course-service.jar
# ENTRYPOINT ["java", "-jar", "course-service.jar"]