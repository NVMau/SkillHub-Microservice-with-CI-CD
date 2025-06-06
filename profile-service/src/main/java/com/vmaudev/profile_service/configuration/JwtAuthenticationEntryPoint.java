//package com.vmaudev.profile_service.configuration;
//
//import java.io.IOException;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//
//import org.springframework.http.MediaType;
//import org.springframework.security.core.AuthenticationException;
//import org.springframework.security.web.AuthenticationEntryPoint;
//
//import com..profile.dto.ApiResponse;
//import com.devteria.profile.exception.ErrorCode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    @Override
//    public void commence(
//            HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
//            throws IOException {
//        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;
//
//        response.setStatus(errorCode.getStatusCode().value());
//        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
//
//        ApiResponse<?> apiResponse = ApiResponse.builder()
//                .code(errorCode.getCode())
//                .message(errorCode.getMessage())
//                .build();
//
//        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
//        response.flushBuffer();
//    }
//}