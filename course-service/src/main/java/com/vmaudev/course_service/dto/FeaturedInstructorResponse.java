package com.vmaudev.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeaturedInstructorResponse {
    private String teacherId;
    private String teacherName;
    private String avatar;
    private long totalCourses;
    private double averageRating;
} 