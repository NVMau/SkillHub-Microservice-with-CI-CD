package com.vmaudev.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonCompletionRequest {
    private String userId;
    private String courseId;
    private String completionType; // MANUAL, AUTO
} 