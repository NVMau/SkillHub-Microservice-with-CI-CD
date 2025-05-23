package com.vmaudev.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String imageUrl;
    private List<String> tags;
    private String teacherId;
}
