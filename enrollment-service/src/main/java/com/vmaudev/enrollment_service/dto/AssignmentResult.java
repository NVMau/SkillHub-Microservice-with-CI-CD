package com.vmaudev.enrollment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignmentResult {
    private String assignmentId;
    private String title;
    private double score;
    private double maxScore;
    private String submissionStatus; // SUBMITTED, NOT_SUBMITTED, LATE
    private String feedback;
} 