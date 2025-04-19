package com.vmaudev.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentLearningStatisticsResponse {
    private String userId;
    private String studentName;
    private int totalLessons;
    private int completedLessons;
    private int totalAssignments;
    private int completedAssignments;
    private double lessonProgressPercentage;
    private double assignmentProgressPercentage;
    private LocalDateTime lastCompletedAt;
    private LocalDateTime lastAccessedAt;
}