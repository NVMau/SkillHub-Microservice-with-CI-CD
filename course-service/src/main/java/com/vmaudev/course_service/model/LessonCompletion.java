package com.vmaudev.course_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "lesson_completions")
public class LessonCompletion {
    @Id
    private String id;
    private String userId;
    private String courseId;
    private String lessonId;
    private boolean completed;
    private LocalDateTime completedAt;
    private String completionType; // MANUAL (người dùng đánh dấu), AUTO (tự động)
} 