package com.vmaudev.enrollment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentRevenueDetail {
    private String userId;
    private String courseId;
    private String courseName;
    private String studentName;
    private BigDecimal coursePrice;
    private BigDecimal teacherRevenue;
    private BigDecimal platformRevenue;
    private LocalDateTime enrollmentDate;
} 