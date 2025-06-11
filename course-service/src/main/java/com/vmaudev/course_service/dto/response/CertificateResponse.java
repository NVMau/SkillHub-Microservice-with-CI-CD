package com.vmaudev.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateResponse {
    private String id;
    private String certificateNumber;
    private String studentName;
    private String courseName;
    private String instructorName;
    private LocalDateTime issuedDate;
    private String status;
} 