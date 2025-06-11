package com.vmaudev.enrollment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingWithUserInfoResponse {
    private Long id;
    private String studentId;
    private String courseId;
    private int stars;
    private String comment;
    private LocalDateTime ratedAt;
    
    // Thông tin user
    private String fullName;
    private String email;
} 