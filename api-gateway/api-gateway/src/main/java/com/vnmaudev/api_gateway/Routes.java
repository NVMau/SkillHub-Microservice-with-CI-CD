package com.vnmaudev.api_gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class Routes {

    @Value("${service.course.url}")
    private String courseServiceUrl;

    @Value("${service.enrollment.url}")
    private String enrollmentServiceUrl;

    @Value("${service.profile.url}")
    private String profileServiceUrl;

    @Value("${service.lecture.url}")
    private String lectureServiceUrl;

    @Value("${service.assignment.url}")
    private String assignmentServiceUrl;

    @Value("${service.exam-results.url}")
    private String examResultsServiceUrl;

    @Value("${service.blog.url}")
    private String blogServiceUrl;

    @Value("${service.ai.url}")
    private String aiServiceUrl;

    @Bean
    public RouterFunction<ServerResponse> courseServiceRoutes() {
        return GatewayRouterFunctions.route("course_service")
                .route(RequestPredicates.path("/api/courses/**"),
                        HandlerFunctions.http(courseServiceUrl))
                .route(RequestPredicates.path("/api/course/lesson-completion/**"),
                        HandlerFunctions.http(courseServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> enrollmentServiceRoutes() {
        return GatewayRouterFunctions.route("enrollment_service")
                .route(RequestPredicates.path("/api/enrollments/**"),
                        HandlerFunctions.http(enrollmentServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> profileServiceRoutes() {
        return GatewayRouterFunctions.route("profile_service")
                .route(RequestPredicates.path("/api/profiles/**"),
                        HandlerFunctions.http(profileServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> lectureServiceRoutes() {
        return GatewayRouterFunctions.route("lecture_service")
                .route(RequestPredicates.path("/api/lectures/**"),
                        HandlerFunctions.http(lectureServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> assignmentServiceRoutes() {
        return GatewayRouterFunctions.route("assignments_service")
                .route(RequestPredicates.path("/api/assignments/**"),
                        HandlerFunctions.http(assignmentServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> examresultServiceRoutes() {
        return GatewayRouterFunctions.route("exam_result_service")
                .route(RequestPredicates.path("/api/exam-results/**"),
                        HandlerFunctions.http(examResultsServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> blogServiceRoutes() {
        return GatewayRouterFunctions.route("blog_service")
                .route(RequestPredicates.path("/api/blog/**"),
                        HandlerFunctions.http(blogServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> chatAiServiceRoutes() {
        return GatewayRouterFunctions.route("ai_service")
                .route(RequestPredicates.path("/api/chat/**"),
                        HandlerFunctions.http(aiServiceUrl))
                .build();
    }
}
