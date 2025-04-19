package com.vmaudev.enrollment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentEnrollmentInfo {
    private String studentId;
    private String fullName;
    private String avatar;
    private String email;
    private LocalDateTime enrollmentDate;
} 