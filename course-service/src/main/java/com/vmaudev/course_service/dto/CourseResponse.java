package com.vmaudev.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponse {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String imageUrl;
    private Date createdAt;
    private Date updatedAt;
    private List<String> tags;
    private String teacherId;
    
    // Thông tin giảng viên
    private String teacherName;
    private String teacherAvatar;
    private String teacherEmail;
    private String teacherBio;
    private int teacherRating;
    private int totalStudents;
    private int totalCourses;
}
