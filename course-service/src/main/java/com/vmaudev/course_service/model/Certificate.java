package com.vmaudev.course_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "certificates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {
    @Id
    private String id;
    private String userId;
    private String courseId;
    private String studentName;
    private String courseName;
    private String instructorName;
    private LocalDateTime issuedDate;
    private String certificateNumber;
    private String status; // ACTIVE, REVOKED
} 