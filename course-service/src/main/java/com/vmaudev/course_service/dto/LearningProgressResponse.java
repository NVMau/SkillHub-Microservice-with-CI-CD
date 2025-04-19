package com.vmaudev.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningProgressResponse {
    private String courseId;
    private int totalLessons;
    private int completedLessons;
    private int totalAssignments;
    private int completedAssignments;
    private double lessonProgressPercentage;
    private double assignmentProgressPercentage;
    private LocalDateTime lastCompletedAt;
    private LocalDateTime lastAccessedAt;
} 