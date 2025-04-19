package com.vmaudev.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EnrollmentReponse {

    private Long id;
    private String studentId;
    private String courseId;
    private LocalDateTime enrollmentDate;
}