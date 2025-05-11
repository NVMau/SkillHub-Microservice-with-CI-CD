package com.vnmaudev.api_gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Routes {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("course_service", r -> r
                        .path("/api/courses/**")
                        .uri("lb://course-service"))
                .route("enrollment_service", r -> r
                        .path("/api/enrollments/**")
                        .uri("lb://enrollment-service"))
                .route("profile_service", r -> r
                        .path("/api/profiles/**")
                        .uri("lb://profile-service"))
                .route("lecture_service", r -> r 
                        .path("/api/lectures/**")
                        .uri("lb://lecture-service"))
                .route("assignment_service", r -> r
                        .path("/api/assignments/**")
                        .uri("lb://assignment-service"))
                .route("exam_result_service", r -> r
                        .path("/api/exam-results/**")
                        .uri("lb://exam-result-service"))
                .route("blog_service", r -> r
                        .path("/api/blog/**")
                        .uri("lb://blog-service"))
                .route("chat_service", r -> r
                        .path("/api/chats/**")
                        .uri("lb://chat-service"))
                .route("ai_service", r -> r
                        .path("/api/v1/**")
                        .uri("lb://ai-service"))
                .build();
    }
}
